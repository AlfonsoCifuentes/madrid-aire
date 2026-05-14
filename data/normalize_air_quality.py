from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import pandas as pd


EXPECTED_BASE_COLUMNS = [
    "provincia",
    "municipio",
    "estacion",
    "magnitud",
    "punto_muestreo",
    "ano",
    "mes",
    "dia",
]

MAGNITUDE_TO_POLLUTANT = {
    1: "SO2",
    6: "CO",
    7: "NO",
    8: "NO2",
    9: "PM25",
    10: "PM10",
    12: "NOX",
    14: "O3",
    20: "TOL",
    30: "BEN",
    35: "EBE",
    37: "MXY",
    38: "PXY",
    39: "OXY",
    42: "TCH",
    43: "CH4",
    44: "NMHC",
}


def read_csv_flexible(path_or_url: str) -> pd.DataFrame:
    best_error: Exception | None = None

    for sep in (";", ","):
        for encoding in ("utf-8", "latin1"):
            try:
                frame = pd.read_csv(path_or_url, sep=sep, encoding=encoding, dtype=str, low_memory=False)
                normalized_columns = [column.lower().strip() for column in frame.columns]

                if all(column in normalized_columns for column in EXPECTED_BASE_COLUMNS):
                    frame.columns = normalized_columns
                    return frame
            except Exception as exc:
                best_error = exc

    raise ValueError(f"Could not parse official CSV: {path_or_url}") from best_error


def parse_numeric_series(series: pd.Series) -> pd.Series:
    cleaned = series.astype(str).str.strip().str.replace(".", "", regex=False)
    cleaned = cleaned.str.replace(",", ".", regex=False)
    cleaned = cleaned.replace({"": np.nan, "nan": np.nan, "None": np.nan})
    return pd.to_numeric(cleaned, errors="coerce")


def detect_invalid_values(values: np.ndarray, pollutant: str) -> np.ndarray:
    values = np.asarray(values, dtype=float)

    invalid = np.isnan(values)
    invalid |= values < 0

    upper_bounds = {
        "NO2": 1000,
        "O3": 1000,
        "PM10": 2000,
        "PM25": 1000,
        "SO2": 2000,
        "CO": 100,
    }

    if pollutant in upper_bounds:
        invalid |= values > upper_bounds[pollutant]

    return invalid


def assign_risk_level(values: np.ndarray, pollutant: str) -> np.ndarray:
    values = np.asarray(values, dtype=float)

    if pollutant == "NO2":
        return np.select(
            [
                values <= 40,
                values <= 90,
                values <= 120,
                values <= 230,
                values > 230,
            ],
            [
                "good",
                "acceptable",
                "moderate",
                "poor",
                "very_poor",
            ],
            default="unknown",
        )

    return np.full(values.shape, "unknown", dtype=object)


def normalize_air_quality_wide(df: pd.DataFrame, source: str) -> pd.DataFrame:
    frames: list[pd.DataFrame] = []

    for hour in range(1, 25):
        h_col = f"h{hour:02d}"
        v_col = f"v{hour:02d}"

        columns = EXPECTED_BASE_COLUMNS + [h_col, v_col]
        missing = [column for column in columns if column not in df.columns]
        if missing:
            continue

        temp = df[columns].copy()
        temp = temp.rename(columns={h_col: "value_raw", v_col: "valid_flag"})
        temp["hour"] = hour
        frames.append(temp)

    if not frames:
        raise ValueError("No hourly hXX/vXX columns were found in the dataset.")

    long_df = pd.concat(frames, ignore_index=True)
    long_df["value"] = parse_numeric_series(long_df["value_raw"])
    long_df["valid"] = long_df["valid_flag"].astype(str).str.upper().isin({"T", "V"})

    long_df["measured_at"] = pd.to_datetime(
        {
            "year": pd.to_numeric(long_df["ano"], errors="coerce"),
            "month": pd.to_numeric(long_df["mes"], errors="coerce"),
            "day": pd.to_numeric(long_df["dia"], errors="coerce"),
            "hour": long_df["hour"] - 1,
        },
        errors="coerce",
    )

    long_df["station_id"] = (
        long_df["provincia"].astype(str).str.zfill(2)
        + "_"
        + long_df["municipio"].astype(str).str.zfill(3)
        + "_"
        + long_df["estacion"].astype(str).str.zfill(3)
    )
    long_df["pollutant_code"] = pd.to_numeric(long_df["magnitud"], errors="coerce").map(MAGNITUDE_TO_POLLUTANT)
    long_df["source"] = source
    long_df["invalid_value"] = False
    long_df["risk_level"] = "unknown"

    for pollutant_code, pollutant_frame in long_df.groupby("pollutant_code"):
        if pollutant_code is None or pd.isna(pollutant_code):
            continue

        invalid_mask = detect_invalid_values(pollutant_frame["value"].to_numpy(), pollutant=str(pollutant_code))
        risk_levels = assign_risk_level(pollutant_frame["value"].to_numpy(), pollutant=str(pollutant_code))
        long_df.loc[pollutant_frame.index, "invalid_value"] = invalid_mask
        long_df.loc[pollutant_frame.index, "risk_level"] = risk_levels

    return long_df[
        [
            "station_id",
            "pollutant_code",
            "measured_at",
            "value",
            "valid",
            "invalid_value",
            "risk_level",
            "source",
            "punto_muestreo",
            "valid_flag",
            "value_raw",
        ]
    ].dropna(subset=["station_id", "pollutant_code", "measured_at"])


def build_summary(frame: pd.DataFrame) -> dict[str, object]:
    measured_at_min = frame["measured_at"].min()
    measured_at_max = frame["measured_at"].max()

    return {
        "rows": int(len(frame)),
        "stations": int(frame["station_id"].nunique()),
        "pollutants": sorted(frame["pollutant_code"].dropna().unique().tolist()),
        "measured_at_min": measured_at_min.isoformat() if pd.notna(measured_at_min) else None,
        "measured_at_max": measured_at_max.isoformat() if pd.notna(measured_at_max) else None,
        "valid_ratio": float(frame["valid"].mean()),
        "invalid_value_count": int(frame["invalid_value"].sum()),
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Normalize official Comunidad de Madrid air-quality CSV files.")
    parser.add_argument("input_path", type=Path)
    parser.add_argument("--source", default="community_air_quality")
    parser.add_argument("--output", type=Path, help="Optional output CSV path for the normalized table.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    raw_frame = read_csv_flexible(str(args.input_path))
    normalized = normalize_air_quality_wide(raw_frame, source=args.source)

    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        normalized.to_csv(args.output, index=False)

    print(json.dumps(build_summary(normalized), indent=2))


if __name__ == "__main__":
    main()
