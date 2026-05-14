from __future__ import annotations

from functools import lru_cache
from pathlib import Path

import re
from typing import Any

import pandas as pd

from src.db.cloudflare_d1_client import get_cloudflare_d1_client
from src.settings import get_settings


LOCAL_COLUMNS = [
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

STATION_METADATA_COLUMNS = [
    "station_id",
    "name",
    "municipality",
    "postal_address",
    "zone_description",
    "area_type",
    "station_type",
    "altitude_meters",
    "latitude",
    "longitude",
]


def _empty_frame() -> pd.DataFrame:
    frame = pd.DataFrame(columns=LOCAL_COLUMNS)
    frame["measured_at"] = pd.to_datetime(frame["measured_at"])
    return frame


def _normalize_boolean_columns(frame: pd.DataFrame) -> pd.DataFrame:
    normalized = frame.copy()

    for column in ("valid", "invalid_value"):
        if column in normalized.columns:
            series = normalized[column]

            if pd.api.types.is_bool_dtype(series):
                continue

            if pd.api.types.is_numeric_dtype(series):
                normalized[column] = series.fillna(0).astype(int).ne(0)
                continue

            normalized[column] = series.astype(str).str.strip().str.lower().isin({"true", "1", "t", "yes"})

    return normalized


def _empty_station_metadata_frame() -> pd.DataFrame:
    return pd.DataFrame(columns=STATION_METADATA_COLUMNS)


def _is_git_lfs_pointer(file_path: Path) -> bool:
    try:
        with file_path.open("r", encoding="utf-8") as handle:
            return handle.readline().strip() == "version https://git-lfs.github.com/spec/v1"
    except OSError:
        return False


def _load_local_observation_file(file_path: Path) -> pd.DataFrame | None:
    if _is_git_lfs_pointer(file_path):
        print(f"Skipping Git LFS pointer file for local observations: {file_path}")
        return None

    try:
        frame = pd.read_csv(file_path)
    except Exception as exc:
        print(f"Local observation file load failed for {file_path}: {exc}")
        return None

    if "measured_at" not in frame.columns:
        print(f"Skipping local observation file without measured_at column: {file_path}")
        return None

    frame["measured_at"] = pd.to_datetime(frame["measured_at"], errors="coerce")
    return frame


def _station_id_from_official_code(value: Any) -> str | None:
    digits = re.sub(r"\D", "", str(value))
    if len(digits) != 8:
        return None

    return f"{digits[:2]}_{digits[2:5]}_{digits[5:]}"


def _parse_dms_coordinate(value: Any) -> float | None:
    if value is None:
        return None

    text = str(value).strip()
    if not text or text.lower() == "nan":
        return None

    normalized = (
        text.replace('""', '"')
        .replace("''", '"')
        .replace("º", " ")
        .replace("°", " ")
        .replace("�", " ")
        .replace("'", " ")
        .replace('"', " ")
        .replace(",", ".")
    )
    match = re.search(r"(?P<deg>\d+)\D+(?P<minutes>\d+)\D+(?P<seconds>\d+(?:\.\d+)?)\D*(?P<direction>[NSEW])", normalized, re.IGNORECASE)

    if match is None:
        try:
            return float(normalized)
        except ValueError:
            return None

    degrees = float(match.group("deg"))
    minutes = float(match.group("minutes"))
    seconds = float(match.group("seconds"))
    decimal = degrees + minutes / 60 + seconds / 3600

    if match.group("direction").upper() in {"W", "S"}:
        decimal *= -1

    return decimal


def resolve_local_normalized_file() -> Path | None:
    settings = get_settings()

    if settings.local_normalized_observations_file:
        configured_path = Path(settings.local_normalized_observations_file)
        if not configured_path.is_absolute():
            configured_path = settings.repo_root / configured_path
        return configured_path if configured_path.exists() else None

    candidates = sorted(
        (settings.repo_root / "data" / "sample_real").glob("*.normalized.csv"),
        key=lambda path: path.stat().st_mtime,
        reverse=True,
    )

    return candidates[0] if candidates else None


def resolve_local_normalized_files() -> list[Path]:
    settings = get_settings()

    if settings.local_normalized_observations_file:
        configured_path = Path(settings.local_normalized_observations_file)
        if not configured_path.is_absolute():
            configured_path = settings.repo_root / configured_path
        return [configured_path] if configured_path.exists() else []

    return sorted((settings.repo_root / "data" / "sample_real").glob("*.normalized.csv"))


def resolve_local_station_metadata_file() -> Path | None:
    settings = get_settings()

    if settings.local_station_metadata_file:
        configured_path = Path(settings.local_station_metadata_file)
        if not configured_path.is_absolute():
            configured_path = settings.repo_root / configured_path
        return configured_path if configured_path.exists() else None

    candidates = sorted(
        (settings.repo_root / "data" / "sample_real").glob("stations_from_official_source*.csv"),
        key=lambda path: path.stat().st_mtime,
        reverse=True,
    )
    return candidates[0] if candidates else None


def load_cloudflare_d1_observations() -> tuple[pd.DataFrame, str] | None:
    client = get_cloudflare_d1_client()
    if client is None:
        return None

    compact_query = """
    SELECT
      station_id,
      pollutant_code,
      measured_at,
      value,
      valid,
      invalid_value,
      CASE risk_code
        WHEN 1 THEN 'good'
        WHEN 2 THEN 'acceptable'
        WHEN 3 THEN 'moderate'
        WHEN 4 THEN 'poor'
        ELSE 'unknown'
      END AS risk_level,
      CASE source_code
        WHEN 1 THEN 'community_current_day'
        WHEN 2 THEN 'community_historical_2025'
        WHEN 3 THEN 'community_historical_2026'
        ELSE 'cloudflare_d1'
      END AS source
    FROM air_quality_observations
    ORDER BY measured_at DESC
    LIMIT 20000
    """
    legacy_query = """
    SELECT
      station_id,
      pollutant_code,
      measured_at,
      value,
      valid,
      invalid_value,
      risk_level,
      source
    FROM air_quality_observations
    ORDER BY measured_at DESC
    LIMIT 20000
    """

    try:
        try:
            records = client.query(compact_query)
        except Exception:
            records = client.query(legacy_query)
    except Exception as exc:
        print(f"Cloudflare D1 observation load failed: {exc}")
        return None

    if not records:
        return _empty_frame(), "cloudflare_d1"

    frame = pd.DataFrame(records)
    if "invalid_value" not in frame.columns:
        frame["invalid_value"] = False
    frame["measured_at"] = pd.to_datetime(frame["measured_at"], errors="coerce")
    return _normalize_boolean_columns(frame), "cloudflare_d1"


def load_cloudflare_d1_station_metadata() -> tuple[pd.DataFrame, str] | None:
    client = get_cloudflare_d1_client()
    if client is None:
        return None

    try:
        records = client.query(
            """
            SELECT
              station_id,
              official_name AS name,
              municipality_name AS municipality,
              postal_address,
              zone_description,
              area_type,
              station_type,
              altitude_meters,
              latitude,
              longitude
            FROM stations
            ORDER BY station_id ASC
            """
        )
    except Exception:
        return None

    if not records:
        return _empty_station_metadata_frame(), "cloudflare_d1"

    frame = pd.DataFrame(records)
    for column in STATION_METADATA_COLUMNS:
        if column not in frame.columns:
            frame[column] = None

    for numeric_column in ("altitude_meters", "latitude", "longitude"):
        frame[numeric_column] = pd.to_numeric(frame[numeric_column], errors="coerce")

    return frame[STATION_METADATA_COLUMNS].drop_duplicates("station_id", keep="first"), "cloudflare_d1"


@lru_cache(maxsize=1)
def load_local_observations() -> tuple[pd.DataFrame, str, str | None]:
    file_paths = resolve_local_normalized_files()
    if not file_paths:
        return _empty_frame(), "local_file_missing", None

    frames = [frame for file_path in file_paths if (frame := _load_local_observation_file(file_path)) is not None]
    if not frames:
        return _empty_frame(), "local_file_invalid", "; ".join(str(path) for path in file_paths)

    frame = pd.concat(frames, ignore_index=True)
    frame["measured_at"] = pd.to_datetime(frame["measured_at"], errors="coerce")
    frame = frame.sort_values(["station_id", "pollutant_code", "measured_at"]).drop_duplicates(
        ["station_id", "pollutant_code", "measured_at"],
        keep="last",
    )
    return _normalize_boolean_columns(frame), "local_normalized_csv_bundle", "; ".join(str(path) for path in file_paths)


@lru_cache(maxsize=1)
def load_local_station_metadata() -> tuple[pd.DataFrame, str | None]:
    file_path = resolve_local_station_metadata_file()
    if file_path is None:
        return _empty_station_metadata_frame(), None

    frame = pd.read_csv(file_path, sep=";", encoding="latin1", low_memory=False)
    frame["station_id"] = frame["estacion_codigo"].apply(_station_id_from_official_code)
    frame["name"] = frame["estacion_municipio"].astype(str).str.strip()
    frame["municipality"] = frame["estacion_municipio"].astype(str).str.strip()
    frame["postal_address"] = frame["estacion_direccion_postal"].astype(str).str.strip()
    frame["zone_description"] = frame["zona_calidad_aire_descripcion"].astype(str).str.strip()
    frame["area_type"] = frame["estacion_tipo_area"].astype(str).str.strip()
    frame["station_type"] = frame["estacion_tipo_estacion"].astype(str).str.strip()
    frame["altitude_meters"] = pd.to_numeric(frame["estacion_altitud"], errors="coerce")
    frame["latitude"] = frame["estacion_coord_latitud"].apply(_parse_dms_coordinate)
    frame["longitude"] = frame["estacion_coord_longitud"].apply(_parse_dms_coordinate)
    frame = frame[STATION_METADATA_COLUMNS].dropna(subset=["station_id"]).drop_duplicates("station_id", keep="first")
    return frame, str(file_path)


def get_station_metadata_frame() -> tuple[pd.DataFrame, str, str | None]:
    cloudflare_result = load_cloudflare_d1_station_metadata()
    if cloudflare_result is not None:
        frame, source = cloudflare_result
        return frame, source, None

    frame, file_path = load_local_station_metadata()
    return frame, "official_station_metadata", file_path


def get_observation_frame() -> tuple[pd.DataFrame, str, str | None]:
    cloudflare_result = load_cloudflare_d1_observations()
    if cloudflare_result is not None:
        frame, source = cloudflare_result
        return frame, source, None

    return load_local_observations()


def _resolve_optional_path(configured_path: str | None, pattern: str) -> Path | None:
    settings = get_settings()

    if configured_path:
        path = Path(configured_path)
        if not path.is_absolute():
            path = settings.repo_root / path
        return path if path.exists() else None

    candidates = sorted(
        (settings.repo_root / "data" / "artifacts").glob(pattern),
        key=lambda path: path.stat().st_mtime,
        reverse=True,
    )
    return candidates[0] if candidates else None


def _resolve_optional_paths(configured_path: str | None, patterns: list[str]) -> Path | None:
    settings = get_settings()

    if configured_path:
        path = Path(configured_path)
        if not path.is_absolute():
            path = settings.repo_root / path
        return path if path.exists() else None

    candidates: list[Path] = []
    for pattern in patterns:
        candidates.extend((settings.repo_root / "data" / "artifacts").glob(pattern))

    ordered = sorted(candidates, key=lambda path: path.stat().st_mtime, reverse=True)
    return ordered[0] if ordered else None


def resolve_local_model_metrics_file() -> Path | None:
    return _resolve_optional_paths(
        get_settings().local_model_metrics_file,
        ["no2_model_v1_metrics_*.json", "no2_baseline_metrics_*.json"],
    )


def resolve_local_predictions_file() -> Path | None:
    return _resolve_optional_paths(
        get_settings().local_predictions_file,
        ["no2_model_v1_predictions_*.csv", "no2_baseline_predictions_*.csv"],
    )


@lru_cache(maxsize=1)
def load_local_model_metrics_payload() -> tuple[dict[str, Any] | None, str | None]:
    file_path = resolve_local_model_metrics_file()
    if file_path is None:
        return None, None

    return pd.read_json(file_path, typ="series").to_dict(), str(file_path)


@lru_cache(maxsize=1)
def load_local_predictions_frame() -> tuple[pd.DataFrame, str | None]:
    file_path = resolve_local_predictions_file()
    if file_path is None:
        return pd.DataFrame(), None

    frame = pd.read_csv(file_path, parse_dates=["predicted_for", "generated_at"])
    return frame, str(file_path)


def get_latest_valid_observations() -> tuple[pd.DataFrame, str, str | None]:
    frame, source, file_path = get_observation_frame()
    if frame.empty:
        return frame, source, file_path

    filtered = frame.copy()
    if "valid" in filtered.columns:
        filtered = filtered[filtered["valid"]]
    if "invalid_value" in filtered.columns:
        filtered = filtered[~filtered["invalid_value"]]
    filtered = filtered.dropna(subset=["station_id", "pollutant_code", "measured_at", "value"])
    filtered = filtered.sort_values(["station_id", "pollutant_code", "measured_at"])

    latest = filtered.groupby(["station_id", "pollutant_code"], as_index=False).tail(1)
    latest = latest.sort_values(["pollutant_code", "value"], ascending=[True, False]).reset_index(drop=True)
    return latest, source, file_path


def build_freshness_label(latest_timestamp: pd.Timestamp | None) -> str:
    if latest_timestamp is None or pd.isna(latest_timestamp):
        return "unknown"

    age = pd.Timestamp.utcnow().tz_localize(None) - latest_timestamp.tz_localize(None) if latest_timestamp.tzinfo else pd.Timestamp.utcnow().tz_localize(None) - latest_timestamp
    hours = age.total_seconds() / 3600

    if hours < 3:
        return "fresh"
    if hours < 12:
        return "delayed"
    return "stale"
