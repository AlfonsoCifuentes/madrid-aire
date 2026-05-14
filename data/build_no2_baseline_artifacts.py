from __future__ import annotations

import argparse
import json
from datetime import timezone
from pathlib import Path

import numpy as np
import pandas as pd


BASE_DIR = Path(__file__).resolve().parent
DEFAULT_INPUT_GLOB = "*.normalized.csv"
DEFAULT_OUTPUT_DIR = BASE_DIR / "artifacts"
TARGET_POLLUTANT = "NO2"
HORIZON_HOURS = 24


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build local honest baseline artifacts for NO2 24h forecasts.")
    parser.add_argument(
        "--input-dir",
        type=Path,
        default=BASE_DIR / "sample_real",
        help="Directory containing normalized CSV files.",
    )
    parser.add_argument(
        "--glob",
        default=DEFAULT_INPUT_GLOB,
        help="Glob pattern used to select normalized files.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help="Directory where baseline artifacts will be written.",
    )
    return parser.parse_args()


def load_normalized_files(input_dir: Path, pattern: str) -> pd.DataFrame:
    files = sorted(input_dir.glob(pattern))
    if not files:
        raise FileNotFoundError(f"No normalized CSV files found in {input_dir} with pattern '{pattern}'.")

    frames = [pd.read_csv(file_path, parse_dates=["measured_at"]) for file_path in files]
    frame = pd.concat(frames, ignore_index=True)
    frame["measured_at"] = pd.to_datetime(frame["measured_at"], errors="coerce")
    frame = frame[frame["pollutant_code"] == TARGET_POLLUTANT].copy()
    frame["valid"] = frame["valid"].astype(str).str.lower().eq("true")
    frame["invalid_value"] = frame["invalid_value"].astype(str).str.lower().eq("true")
    frame = frame[frame["valid"] & ~frame["invalid_value"]].copy()
    frame = frame.dropna(subset=["station_id", "measured_at", "value"])
    frame["value"] = pd.to_numeric(frame["value"], errors="coerce")
    frame = frame.dropna(subset=["value"])
    frame = frame.sort_values(["station_id", "measured_at"]).drop_duplicates(["station_id", "measured_at"], keep="last")
    return frame


def add_baseline_columns(frame: pd.DataFrame) -> pd.DataFrame:
    prepared = frame.sort_values(["station_id", "measured_at"]).copy()
    group = prepared.groupby("station_id")["value"]

    prepared["target_24h"] = group.shift(-HORIZON_HOURS)
    prepared["baseline_persistence"] = prepared["value"]
    prepared["baseline_same_hour_yesterday"] = group.shift(24)
    prepared["baseline_rolling_mean_24h"] = (
        group.shift(1).rolling(window=24, min_periods=12).mean().reset_index(level=0, drop=True)
    )
    return prepared.dropna(subset=["target_24h"])


def choose_split(frame: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, dict[str, dict[str, str | None]]]:
    years = sorted(frame["measured_at"].dt.year.dropna().unique().tolist())

    if len(years) >= 3:
        train = frame[frame["measured_at"].dt.year <= years[-3]]
        valid = frame[frame["measured_at"].dt.year == years[-2]]
        test = frame[frame["measured_at"].dt.year == years[-1]]
    elif len(years) == 2:
        train = frame[frame["measured_at"].dt.year == years[0]]
        valid = frame.iloc[0:0].copy()
        test = frame[frame["measured_at"].dt.year == years[1]]
    else:
        ordered = frame.sort_values("measured_at")
        train_end = int(len(ordered) * 0.7)
        valid_end = int(len(ordered) * 0.85)
        train = ordered.iloc[:train_end]
        valid = ordered.iloc[train_end:valid_end]
        test = ordered.iloc[valid_end:]

    split = {
        "train": describe_period(train),
        "valid": describe_period(valid),
        "test": describe_period(test),
    }
    return train, valid, test, split


def describe_period(frame: pd.DataFrame) -> dict[str, str | None]:
    if frame.empty:
        return {"start": None, "end": None}

    return {
        "start": frame["measured_at"].min().isoformat(),
        "end": frame["measured_at"].max().isoformat(),
    }


def mae(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    return float(np.mean(np.abs(y_true - y_pred)))


def rmse(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    return float(np.sqrt(np.mean((y_true - y_pred) ** 2)))


def r2(y_true: np.ndarray, y_pred: np.ndarray) -> float | None:
    denominator = np.sum((y_true - np.mean(y_true)) ** 2)
    if denominator == 0:
        return None
    return float(1 - (np.sum((y_true - y_pred) ** 2) / denominator))


def evaluate_baselines(test_frame: pd.DataFrame) -> list[dict[str, object]]:
    metrics: list[dict[str, object]] = []

    for baseline_name, column_name in (
        ("persistence", "baseline_persistence"),
        ("same_hour_yesterday", "baseline_same_hour_yesterday"),
        ("rolling_mean_24h", "baseline_rolling_mean_24h"),
    ):
        subset = test_frame.dropna(subset=[column_name, "target_24h"])
        if subset.empty:
            continue

        y_true = subset["target_24h"].to_numpy(dtype=float)
        y_pred = subset[column_name].to_numpy(dtype=float)
        metrics.append(
            {
                "baseline_name": baseline_name,
                "split_name": "test",
                "mae": mae(y_true, y_pred),
                "rmse": rmse(y_true, y_pred),
                "r2": r2(y_true, y_pred),
                "sample_count": int(len(subset)),
            }
        )

    return metrics


def pick_best_baseline(metrics: list[dict[str, object]]) -> str:
    if not metrics:
        raise RuntimeError("No baseline metrics could be computed. Check the historical data coverage.")
    return min(metrics, key=lambda item: float(item["mae"]))["baseline_name"]  # type: ignore[return-value]


def map_baseline_to_column(baseline_name: str) -> str:
    return {
        "persistence": "baseline_persistence",
        "same_hour_yesterday": "baseline_same_hour_yesterday",
        "rolling_mean_24h": "baseline_rolling_mean_24h",
    }[baseline_name]


def assign_risk_level(values: np.ndarray) -> np.ndarray:
    values = np.asarray(values, dtype=float)
    return np.select(
        [
            values <= 40,
            values <= 90,
            values <= 120,
            values <= 230,
            values > 230,
        ],
        ["good", "acceptable", "moderate", "poor", "very_poor"],
        default="unknown",
    )


def build_predictions(frame: pd.DataFrame, baseline_name: str) -> pd.DataFrame:
    baseline_column = map_baseline_to_column(baseline_name)
    latest_by_station = frame.sort_values(["station_id", "measured_at"]).groupby("station_id", as_index=False).tail(1)
    records: list[dict[str, object]] = []
    generated_at = pd.Timestamp.now(tz=timezone.utc).tz_localize(None)

    grouped = frame.set_index(["station_id", "measured_at"]).sort_index()

    for row in latest_by_station.itertuples(index=False):
        latest_timestamp = row.measured_at
        rolling_value = row.baseline_rolling_mean_24h if not pd.isna(row.baseline_rolling_mean_24h) else row.value

        for horizon in range(1, 25):
            predicted_for = latest_timestamp + pd.Timedelta(hours=horizon)
            predicted_value = None

            if baseline_name == "persistence":
                predicted_value = float(row.value)
            elif baseline_name == "rolling_mean_24h":
                predicted_value = float(rolling_value)
            else:
                lookup_timestamp = predicted_for - pd.Timedelta(hours=24)
                try:
                    predicted_value = float(grouped.loc[(row.station_id, lookup_timestamp), "value"])
                except KeyError:
                    predicted_value = float(row.value)

            records.append(
                {
                    "station_id": row.station_id,
                    "pollutant_code": TARGET_POLLUTANT,
                    "predicted_for": predicted_for.isoformat(),
                    "predicted_value": predicted_value,
                    "horizon_hours": horizon,
                    "baseline_name": baseline_name,
                    "generated_at": generated_at.isoformat(),
                    "risk_level": assign_risk_level(np.asarray([predicted_value]))[0],
                    "source": "local_baseline_artifact",
                }
            )

    return pd.DataFrame.from_records(records)


def main() -> None:
    args = parse_args()
    output_dir = args.output_dir
    output_dir.mkdir(parents=True, exist_ok=True)

    raw_frame = load_normalized_files(args.input_dir, args.glob)
    prepared = add_baseline_columns(raw_frame)
    train, valid, test, split = choose_split(prepared)
    metrics = evaluate_baselines(test)
    best_baseline = pick_best_baseline(metrics)
    predictions = build_predictions(prepared, best_baseline)

    timestamp = pd.Timestamp.now(tz=timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    metrics_path = output_dir / f"no2_baseline_metrics_{timestamp}.json"
    predictions_path = output_dir / f"no2_baseline_predictions_{timestamp}.csv"

    payload = {
        "status": "baseline_ready",
        "source": "local_baseline_artifact",
        "target": TARGET_POLLUTANT,
        "horizon_hours": HORIZON_HOURS,
        "selected_baseline": best_baseline,
        "generated_at": pd.Timestamp.now(tz=timezone.utc).isoformat(),
        "split": split,
        "input_files": sorted(str(path) for path in args.input_dir.glob(args.glob)),
        "row_count": int(len(prepared)),
        "station_count": int(prepared["station_id"].nunique()),
        "items": metrics,
    }

    metrics_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    predictions.to_csv(predictions_path, index=False)

    print(
        json.dumps(
            {
                "metrics_file": str(metrics_path),
                "predictions_file": str(predictions_path),
                "selected_baseline": best_baseline,
                "metric_count": len(metrics),
                "prediction_rows": int(len(predictions)),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
