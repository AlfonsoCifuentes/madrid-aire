from __future__ import annotations

import argparse
import json
from datetime import timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor

try:
    from build_no2_baseline_artifacts import (
        DEFAULT_INPUT_GLOB,
        DEFAULT_OUTPUT_DIR,
        TARGET_POLLUTANT,
        add_baseline_columns,
        assign_risk_level,
        choose_split,
        evaluate_baselines,
        load_normalized_files,
        mae,
        r2,
        rmse,
    )
except ModuleNotFoundError:
    from data.build_no2_baseline_artifacts import (
        DEFAULT_INPUT_GLOB,
        DEFAULT_OUTPUT_DIR,
        TARGET_POLLUTANT,
        add_baseline_columns,
        assign_risk_level,
        choose_split,
        evaluate_baselines,
        load_normalized_files,
        mae,
        r2,
        rmse,
    )


MODEL_NAME = "hist_gradient_boosting_v1"
PRIMARY_HORIZON = 24
PREDICTION_HORIZONS = tuple(range(1, 25))
FEATURE_COLUMNS = [
    "station_code",
    "hour",
    "day_of_week",
    "month",
    "is_weekend",
    "value",
    "value_lag_1h",
    "value_lag_3h",
    "value_lag_6h",
    "value_lag_24h",
    "value_lag_168h",
    "rolling_mean_3h",
    "rolling_mean_6h",
    "rolling_mean_24h",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build local model-v1 artifacts for NO2 forecasts.")
    parser.add_argument(
        "--input-dir",
        type=Path,
        default=Path(__file__).resolve().parent / "sample_real",
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
        help="Directory where model artifacts will be written.",
    )
    return parser.parse_args()


def add_time_features(frame: pd.DataFrame) -> pd.DataFrame:
    enriched = frame.copy()
    enriched["hour"] = enriched["measured_at"].dt.hour
    enriched["day_of_week"] = enriched["measured_at"].dt.dayofweek
    enriched["month"] = enriched["measured_at"].dt.month
    enriched["is_weekend"] = enriched["day_of_week"].isin([5, 6]).astype(int)
    return enriched


def add_lag_features(frame: pd.DataFrame) -> pd.DataFrame:
    enriched = frame.sort_values(["station_id", "measured_at"]).copy()
    group = enriched.groupby("station_id")["value"]

    for lag in [1, 3, 6, 24, 168]:
        enriched[f"value_lag_{lag}h"] = group.shift(lag)

    for window in [3, 6, 24]:
        enriched[f"rolling_mean_{window}h"] = group.transform(
            lambda values: values.shift(1).rolling(window=window, min_periods=max(1, window // 2)).mean()
        )

    return enriched


def add_station_code(frame: pd.DataFrame) -> pd.DataFrame:
    enriched = frame.copy()
    codes = {station_id: index for index, station_id in enumerate(sorted(enriched["station_id"].unique().tolist()))}
    enriched["station_code"] = enriched["station_id"].map(codes).astype(int)
    return enriched


def add_targets(frame: pd.DataFrame, horizons: tuple[int, ...]) -> pd.DataFrame:
    enriched = frame.sort_values(["station_id", "measured_at"]).copy()
    grouped = enriched.groupby("station_id")["value"]
    for horizon in horizons:
        enriched[f"target_{horizon}h"] = grouped.shift(-horizon)
    return enriched


def prepare_frame(input_dir: Path, pattern: str) -> pd.DataFrame:
    raw = load_normalized_files(input_dir, pattern)
    enriched = add_baseline_columns(raw)
    enriched = add_time_features(enriched)
    enriched = add_lag_features(enriched)
    enriched = add_station_code(enriched)
    enriched = add_targets(enriched, PREDICTION_HORIZONS)
    enriched = enriched.dropna(subset=FEATURE_COLUMNS + [f"target_{PRIMARY_HORIZON}h"])
    return enriched


def _training_frame(train: pd.DataFrame, valid: pd.DataFrame) -> pd.DataFrame:
    if valid.empty:
        return train.copy()
    return pd.concat([train, valid], ignore_index=True)


def train_models(train: pd.DataFrame, valid: pd.DataFrame) -> dict[int, HistGradientBoostingRegressor]:
    training = _training_frame(train, valid)
    models: dict[int, HistGradientBoostingRegressor] = {}

    for horizon in PREDICTION_HORIZONS:
        target_column = f"target_{horizon}h"
        subset = training.dropna(subset=FEATURE_COLUMNS + [target_column])
        if subset.empty:
            continue

        model = HistGradientBoostingRegressor(
            loss="squared_error",
            learning_rate=0.05,
            max_depth=6,
            max_iter=300,
            min_samples_leaf=20,
            l2_regularization=0.1,
            random_state=42,
        )
        model.fit(subset[FEATURE_COLUMNS], subset[target_column])
        models[horizon] = model

    if PRIMARY_HORIZON not in models:
        raise RuntimeError("Model v1 could not train the primary 24h horizon. Check data coverage.")

    return models


def evaluate_model(test: pd.DataFrame, model: HistGradientBoostingRegressor) -> tuple[dict[str, object], pd.DataFrame]:
    target_column = f"target_{PRIMARY_HORIZON}h"
    subset = test.dropna(subset=FEATURE_COLUMNS + [target_column]).copy()
    predictions = model.predict(subset[FEATURE_COLUMNS])
    subset["model_prediction_24h"] = predictions

    y_true = subset[target_column].to_numpy(dtype=float)
    y_pred = subset["model_prediction_24h"].to_numpy(dtype=float)
    metric = {
        "baseline_name": MODEL_NAME,
        "split_name": "test",
        "mae": mae(y_true, y_pred),
        "rmse": rmse(y_true, y_pred),
        "r2": r2(y_true, y_pred),
        "sample_count": int(len(subset)),
    }
    return metric, subset


def build_error_breakdowns(frame: pd.DataFrame) -> dict[str, list[dict[str, object]]]:
    if frame.empty:
        return {"error_by_station": [], "error_by_hour": [], "error_by_month": []}

    enriched = frame.copy()
    enriched["absolute_error"] = (enriched["target_24h"] - enriched["model_prediction_24h"]).abs()
    error_by_station = [
        {
            "station_id": station_id,
            "mae": float(group["absolute_error"].mean()),
            "sample_count": int(len(group)),
        }
        for station_id, group in enriched.groupby("station_id")
    ]
    error_by_hour = [
        {
            "hour": int(hour),
            "mae": float(group["absolute_error"].mean()),
            "sample_count": int(len(group)),
        }
        for hour, group in enriched.groupby(enriched["measured_at"].dt.hour)
    ]
    error_by_month = [
        {
            "month": int(month),
            "mae": float(group["absolute_error"].mean()),
            "sample_count": int(len(group)),
        }
        for month, group in enriched.groupby(enriched["measured_at"].dt.month)
    ]
    return {
        "error_by_station": sorted(error_by_station, key=lambda item: item["mae"], reverse=True),
        "error_by_hour": sorted(error_by_hour, key=lambda item: item["hour"]),
        "error_by_month": sorted(error_by_month, key=lambda item: item["month"]),
    }


def build_predictions(frame: pd.DataFrame, models: dict[int, HistGradientBoostingRegressor]) -> pd.DataFrame:
    latest_by_station = frame.sort_values(["station_id", "measured_at"]).groupby("station_id", as_index=False).tail(1)
    generated_at = pd.Timestamp.now(tz=timezone.utc).tz_localize(None)
    records: list[dict[str, object]] = []

    for row in latest_by_station.itertuples(index=False):
        row_frame = pd.DataFrame([{column: getattr(row, column) for column in FEATURE_COLUMNS}])
        for horizon, model in models.items():
            predicted_value = float(model.predict(row_frame)[0])
            predicted_for = row.measured_at + pd.Timedelta(hours=horizon)
            records.append(
                {
                    "station_id": row.station_id,
                    "pollutant_code": TARGET_POLLUTANT,
                    "predicted_for": predicted_for.isoformat(),
                    "predicted_value": predicted_value,
                    "horizon_hours": horizon,
                    "baseline_name": MODEL_NAME,
                    "generated_at": generated_at.isoformat(),
                    "risk_level": assign_risk_level(np.asarray([predicted_value]))[0],
                    "source": "local_model_v1_artifact",
                }
            )

    return pd.DataFrame.from_records(records)


def main() -> None:
    args = parse_args()
    output_dir = args.output_dir
    output_dir.mkdir(parents=True, exist_ok=True)

    prepared = prepare_frame(args.input_dir, args.glob)
    train, valid, test, split = choose_split(prepared)
    baseline_metrics = evaluate_baselines(test)
    models = train_models(train, valid)
    model_metric, evaluated_test = evaluate_model(test, models[PRIMARY_HORIZON])
    predictions = build_predictions(prepared, models)
    timestamp = pd.Timestamp.now(tz=timezone.utc).strftime("%Y%m%dT%H%M%SZ")

    metrics_path = output_dir / f"no2_model_v1_metrics_{timestamp}.json"
    predictions_path = output_dir / f"no2_model_v1_predictions_{timestamp}.csv"
    bundle_path = output_dir / f"no2_model_v1_bundle_{timestamp}.joblib"

    selected_baseline_metric = min(baseline_metrics, key=lambda item: float(item["mae"])) if baseline_metrics else None
    improvement_pct = None
    if selected_baseline_metric is not None:
        baseline_mae = float(selected_baseline_metric["mae"])
        if baseline_mae > 0:
            improvement_pct = float(((baseline_mae - float(model_metric["mae"])) / baseline_mae) * 100)

    breakdowns = build_error_breakdowns(evaluated_test)
    payload = {
        "status": "model_v1_ready",
        "source": "local_model_v1_artifact",
        "target": TARGET_POLLUTANT,
        "horizon_hours": PRIMARY_HORIZON,
        "selected_baseline": MODEL_NAME,
        "generated_at": pd.Timestamp.now(tz=timezone.utc).isoformat(),
        "split": split,
        "input_files": sorted(str(path) for path in args.input_dir.glob(args.glob)),
        "row_count": int(len(prepared)),
        "station_count": int(prepared["station_id"].nunique()),
        "items": [*baseline_metrics, model_metric],
        "baseline_reference": selected_baseline_metric,
        "improvement_pct_vs_best_baseline": improvement_pct,
        **breakdowns,
        "feature_columns": FEATURE_COLUMNS,
        "model_name": MODEL_NAME,
        "model_bundle": str(bundle_path),
    }

    metrics_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    predictions.to_csv(predictions_path, index=False)
    joblib.dump({"models": models, "feature_columns": FEATURE_COLUMNS, "primary_horizon": PRIMARY_HORIZON}, bundle_path)

    print(
        json.dumps(
            {
                "metrics_file": str(metrics_path),
                "predictions_file": str(predictions_path),
                "model_bundle": str(bundle_path),
                "selected_model": MODEL_NAME,
                "metric_count": len(payload["items"]),
                "prediction_rows": int(len(predictions)),
                "improvement_pct_vs_best_baseline": improvement_pct,
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()