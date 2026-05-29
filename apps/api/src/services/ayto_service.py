"""
Ayuntamiento de Madrid real-time air quality service.

Fetches data from the open-data real-time endpoint published by the
Ayuntamiento (city council) of Madrid. This is a separate network from
the Comunidad de Madrid (regional) stations that the rest of the app uses.

Data source: ciudadesabiertas.madrid.es / datos.madrid.es
Real-time endpoint: calair_tiemporeal (wide format, H01-H24 per station/pollutant/day)
Station metadata: 212629-0-estaciones-control-aire (embedded below from the official CSV)
Update frequency: ~20 minutes
"""

from __future__ import annotations

import time
from datetime import datetime

import requests

from src.schemas.observation import LatestObservationEnvelope, LatestObservationItem
from src.schemas.station import StationCollection, StationSummary

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

AYTO_REALTIME_URL = (
    "https://ciudadesabiertas.madrid.es/dynamicAPI/API/query/calair_tiemporeal.json"
    "?pageSize=5000"
)

CACHE_TTL_SECONDS = 300  # 5 minutes — the source updates every ~20 min

# Ayuntamiento station metadata embedded from the official CSV:
# https://datos.madrid.es/dataset/212629-0-estaciones-control-aire/resource/
#   212629-0-estaciones-control-aire-csv/download/212629-0-estaciones-control-aire-csv.csv
# Fields: short code → {name, latitude, longitude, station_type, address}
AYTO_STATIONS: dict[int, dict] = {
    4:  {"name": "Plaza de España",      "latitude": 40.4238823, "longitude": -3.7122567, "station_type": "Urbana tráfico",  "address": "Plaza de España"},
    8:  {"name": "Escuelas Aguirre",     "latitude": 40.4215533, "longitude": -3.6823158, "station_type": "Urbana tráfico",  "address": "Entre C/ Alcalá y C/ O'Donell"},
    11: {"name": "Ramón y Cajal",        "latitude": 40.4514734, "longitude": -3.6773491, "station_type": "Urbana tráfico",  "address": "Avda. Ramón y Cajal esq. C/ Príncipe de Vergara"},
    16: {"name": "Arturo Soria",         "latitude": 40.4400457, "longitude": -3.6392422, "station_type": "Urbana fondo",    "address": "C/ Arturo Soria esq. C/ Vizconde de los Asilos"},
    17: {"name": "Villaverde",           "latitude": 40.3471470, "longitude": -3.7133167, "station_type": "Urbana fondo",    "address": "Villaverde"},
    18: {"name": "Farolillo",            "latitude": 40.3947825, "longitude": -3.7318356, "station_type": "Urbana fondo",    "address": "C/ del Farolillo"},
    24: {"name": "Casa de Campo",        "latitude": 40.4193577, "longitude": -3.7473445, "station_type": "Suburbana",       "address": "Casa de Campo"},
    27: {"name": "Barajas Pueblo",       "latitude": 40.4769179, "longitude": -3.5800258, "station_type": "Urbana fondo",    "address": "Barajas Pueblo"},
    35: {"name": "Plaza del Carmen",     "latitude": 40.4192091, "longitude": -3.7031662, "station_type": "Urbana fondo",    "address": "Plaza del Carmen"},
    36: {"name": "Moratalaz",            "latitude": 40.4079517, "longitude": -3.6453104, "station_type": "Urbana tráfico",  "address": "Moratalaz"},
    38: {"name": "Cuatro Caminos",       "latitude": 40.4455439, "longitude": -3.7071303, "station_type": "Urbana tráfico",  "address": "Cuatro Caminos"},
    39: {"name": "Barrio del Pilar",     "latitude": 40.4782322, "longitude": -3.7115364, "station_type": "Urbana tráfico",  "address": "Barrio del Pilar"},
    40: {"name": "Vallecas",             "latitude": 40.3881478, "longitude": -3.6515286, "station_type": "Urbana fondo",    "address": "Vallecas"},
    47: {"name": "Méndez Álvaro",        "latitude": 40.3980991, "longitude": -3.6868138, "station_type": "Urbana fondo",    "address": "Méndez Álvaro"},
    48: {"name": "Castellana",           "latitude": 40.4398904, "longitude": -3.6903729, "station_type": "Urbana tráfico",  "address": "Paseo de la Castellana"},
    49: {"name": "Parque del Retiro",    "latitude": 40.4144444, "longitude": -3.6824999, "station_type": "Urbana fondo",    "address": "Parque del Retiro"},
    50: {"name": "Plaza Castilla",       "latitude": 40.4655841, "longitude": -3.6887449, "station_type": "Urbana tráfico",  "address": "Plaza Castilla"},
    54: {"name": "Ensanche de Vallecas", "latitude": 40.3730118, "longitude": -3.6121394, "station_type": "Urbana fondo",    "address": "Ensanche de Vallecas"},
    55: {"name": "Urb. Embajada",        "latitude": 40.4623628, "longitude": -3.5805649, "station_type": "Urbana fondo",    "address": "Urbanización Embajada"},
    56: {"name": "Plaza Elíptica",       "latitude": 40.3850336, "longitude": -3.7187679, "station_type": "Urbana tráfico",  "address": "Plaza Elíptica"},
    57: {"name": "Sanchinarro",          "latitude": 40.4942012, "longitude": -3.6605173, "station_type": "Urbana fondo",    "address": "Sanchinarro"},
    58: {"name": "El Pardo",             "latitude": 40.5180701, "longitude": -3.7746101, "station_type": "Suburbana",       "address": "El Pardo"},
    59: {"name": "Juan Carlos I",        "latitude": 40.4651440, "longitude": -3.6090310, "station_type": "Suburbana",       "address": "Parque Juan Carlos I"},
    60: {"name": "Tres Olivos",          "latitude": 40.5005477, "longitude": -3.6897308, "station_type": "Urbana fondo",    "address": "Tres Olivos"},
}

# Magnitud code → pollutant code (same naming convention as the rest of the app)
MAGNITUD_POLLUTANT: dict[int, str] = {
    1:  "SO2",
    6:  "CO",
    7:  "NO",
    8:  "NO2",
    9:  "PM25",
    10: "PM10",
    12: "NOX",
    14: "O3",
    20: "TOL",
    30: "BEN",
    35: "EBE",
}

SOURCE_TAG = "ayuntamiento_realtime"
MUNICIPALITY = "Madrid"

# ---------------------------------------------------------------------------
# Module-level cache (shared across requests within one worker process)
# ---------------------------------------------------------------------------

_latest_cache: dict = {"items": None, "ts": 0.0}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _ayto_station_id(station_num: int) -> str:
    """Convert Ayuntamiento station number to app station_id, e.g. 4 → 'AYT_004'."""
    return f"AYT_{station_num:03d}"


def _no2_risk_level(value: float) -> str:
    """WHO/EU risk scale for NO2 (µg/m³) — matches normalize_air_quality.py thresholds."""
    if value <= 40:
        return "good"
    if value <= 90:
        return "acceptable"
    if value <= 120:
        return "moderate"
    if value <= 230:
        return "poor"
    return "very_poor"


def _get_latest_valid_hour(row: dict) -> tuple[float, int] | None:
    """
    Scan H24 → H01 to find the most recent valid hourly measurement.
    Returns (value, hour_1_to_24) or None if no valid reading exists.
    """
    for hour in range(24, 0, -1):
        v_key = f"V{hour:02d}"
        h_key = f"H{hour:02d}"
        valid_flag = str(row.get(v_key, "")).strip().upper()
        raw_value = row.get(h_key, "")
        if valid_flag == "V" and raw_value not in ("", None):
            try:
                return float(str(raw_value).replace(",", ".")), hour
            except (ValueError, TypeError):
                continue
    return None


def _fetch_raw_rows() -> list[dict]:
    try:
        response = requests.get(AYTO_REALTIME_URL, timeout=12)
        response.raise_for_status()
        return response.json()
    except Exception as exc:
        print(f"[ayto_service] Real-time fetch failed: {exc}")
        return []


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def get_ayto_stations() -> StationCollection:
    """Return the fixed Ayuntamiento station roster with coordinates."""
    items = [
        StationSummary(
            station_id=_ayto_station_id(num),
            name=meta["name"],
            municipality=MUNICIPALITY,
            postal_address=meta["address"],
            zone_description=None,
            area_type=None,
            station_type=meta["station_type"],
            altitude_meters=None,
            latitude=meta["latitude"],
            longitude=meta["longitude"],
            source=SOURCE_TAG,
            metadata_status="official_metadata_ready",
        )
        for num, meta in AYTO_STATIONS.items()
    ]
    return StationCollection(
        items=items,
        source=SOURCE_TAG,
        status="official_station_metadata_ready",
        local_file=None,
    )


def get_ayto_latest() -> LatestObservationEnvelope:
    """
    Fetch, parse and return the latest valid hourly observation per
    (station, pollutant) from the Ayuntamiento real-time endpoint.
    Results are cached for CACHE_TTL_SECONDS seconds.
    """
    global _latest_cache

    now = time.monotonic()
    if _latest_cache["items"] is not None and (now - _latest_cache["ts"]) < CACHE_TTL_SECONDS:
        return LatestObservationEnvelope(
            items=_latest_cache["items"],
            source=SOURCE_TAG,
            status="latest_ready",
            local_file=None,
        )

    raw_rows = _fetch_raw_rows()
    if not raw_rows:
        return LatestObservationEnvelope(
            items=[],
            source=SOURCE_TAG,
            status="fetch_failed",
            local_file=None,
        )

    items: list[LatestObservationItem] = []

    for row in raw_rows:
        try:
            station_num = int(row.get("ESTACION", 0))
            magnitud = int(row.get("MAGNITUD", 0))
        except (ValueError, TypeError):
            continue

        pollutant_code = MAGNITUD_POLLUTANT.get(magnitud)
        if not pollutant_code:
            continue

        result = _get_latest_valid_hour(row)
        if result is None:
            continue

        value, hour = result

        try:
            ano = int(row.get("ANO", 0))
            mes = int(row.get("MES", 0))
            dia = int(row.get("DIA", 0))
            # hour is 1-based; H01 = 01:00, H24 = 00:00 next day
            if hour == 24:
                from datetime import timedelta
                base = datetime(ano, mes, dia) + timedelta(days=1)
                measured_at = base.replace(hour=0, minute=0, second=0)
            else:
                measured_at = datetime(ano, mes, dia, hour, 0, 0)
        except (ValueError, OverflowError):
            continue

        risk_level = _no2_risk_level(value) if pollutant_code == "NO2" else None

        items.append(
            LatestObservationItem(
                station_id=_ayto_station_id(station_num),
                pollutant_code=pollutant_code,
                measured_at=measured_at,
                value=value,
                valid=True,
                risk_level=risk_level,
                source=SOURCE_TAG,
            )
        )

    _latest_cache = {"items": items, "ts": now}

    return LatestObservationEnvelope(
        items=items,
        source=SOURCE_TAG,
        status="latest_ready" if items else "no_valid_readings",
        local_file=None,
    )
