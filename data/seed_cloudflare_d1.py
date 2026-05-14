from __future__ import annotations

import argparse
import math
import os
import sys
from pathlib import Path
from typing import Iterable

import pandas as pd


REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "apps" / "api"))

from src.db.cloudflare_d1_client import CloudflareD1Client
from src.services.data_access import load_local_observations, load_local_station_metadata


SOURCE_ID = "community_madrid_air_quality"
SOURCE_CODE_BY_NAME = {
    "community_current_day": 1,
    "community_historical_2025": 2,
    "community_historical_2026": 3,
}
RISK_CODE_BY_NAME = {
    "unknown": 0,
    "good": 1,
    "acceptable": 2,
    "moderate": 3,
    "poor": 4,
}
STATION_METADATA_MIGRATIONS = [
    ("postal_address", "TEXT"),
    ("zone_description", "TEXT"),
    ("area_type", "TEXT"),
    ("station_type", "TEXT"),
    ("altitude_meters", "REAL"),
]
POLLUTANT_DEFINITIONS = {
    "NO2": ("Nitrogen dioxide", "µg/m3", "#FFB000"),
    "O3": ("Ozone", "µg/m3", "#8B5CF6"),
    "PM10": ("PM10", "µg/m3", "#C2410C"),
    "PM25": ("PM2.5", "µg/m3", "#B6FF3B"),
    "SO2": ("Sulfur dioxide", "µg/m3", "#22D3EE"),
    "CO": ("Carbon monoxide", "mg/m3", "#F0ABFC"),
    "NO": ("Nitric oxide", "µg/m3", "#F97316"),
    "NOX": ("Nitrogen oxides", "µg/m3", "#FB7185"),
    "BEN": ("Benzene", None, "#14B8A6"),
    "TOL": ("Toluene", None, "#0EA5E9"),
    "NMHC": ("Non-methane hydrocarbons", None, "#F59E0B"),
    "TCH": ("Total hydrocarbons", None, "#84CC16"),
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Seed Cloudflare D1 with MADRID Aire official local data.")
    parser.add_argument("--account-id", default=os.getenv("MADRID_AIRE_CLOUDFLARE_ACCOUNT_ID"))
    parser.add_argument("--database-id", default=os.getenv("MADRID_AIRE_CLOUDFLARE_D1_DATABASE_ID"))
    parser.add_argument("--api-token", default=os.getenv("MADRID_AIRE_CLOUDFLARE_API_TOKEN"))
    parser.add_argument("--batch-size", type=int, default=1000)
    parser.add_argument("--timeout-seconds", type=float, default=120.0)
    parser.add_argument("--observation-start-offset", type=int, default=0)
    parser.add_argument("--max-observation-rows", type=int, default=None)
    parser.add_argument("--rebuild-observations-table", action="store_true")
    parser.add_argument("--skip-stations", action="store_true")
    parser.add_argument("--skip-observations", action="store_true")
    return parser.parse_args()


def batched_frame(frame: pd.DataFrame, batch_size: int) -> Iterable[tuple[int, pd.DataFrame]]:
    total = len(frame.index)
    for start in range(0, total, batch_size):
        yield start, frame.iloc[start:start + batch_size]


def sql_literal(value: object) -> str:
    if value is None:
        return "NULL"

    if isinstance(value, bool):
        return "1" if value else "0"

    if isinstance(value, float):
        if math.isnan(value) or math.isinf(value):
            return "NULL"
        return repr(value)

    if isinstance(value, int):
        return str(value)

    text = str(value).replace("'", "''")
    return f"'{text}'"


def values_clause(rows: list[tuple[object, ...]]) -> str:
    return ", ".join(
        "(" + ", ".join(sql_literal(value) for value in row) + ")"
        for row in rows
    )


def build_station_upsert_sql(rows: list[tuple[object, ...]]) -> str:
    return f"""
    INSERT INTO stations (
      station_id,
      source_id,
      official_name,
      municipality_code,
      municipality_name,
      province_code,
      postal_address,
      zone_description,
      area_type,
      station_type,
      altitude_meters,
      latitude,
      longitude
    ) VALUES {values_clause(rows)}
    ON CONFLICT(station_id) DO UPDATE SET
      source_id = excluded.source_id,
      official_name = excluded.official_name,
      municipality_code = excluded.municipality_code,
      municipality_name = excluded.municipality_name,
      province_code = excluded.province_code,
      postal_address = excluded.postal_address,
      zone_description = excluded.zone_description,
      area_type = excluded.area_type,
      station_type = excluded.station_type,
      altitude_meters = excluded.altitude_meters,
      latitude = excluded.latitude,
      longitude = excluded.longitude,
      updated_at = CURRENT_TIMESTAMP
    """


def build_pollutant_upsert_sql(rows: list[tuple[object, ...]]) -> str:
        return f"""
        INSERT INTO pollutants (
            code,
            label,
            units,
            display_color
        ) VALUES {values_clause(rows)}
        ON CONFLICT(code) DO UPDATE SET
            label = excluded.label,
            units = excluded.units,
            display_color = excluded.display_color
        """


def build_observation_upsert_sql(rows: list[tuple[object, ...]]) -> str:
    return f"""
    INSERT INTO air_quality_observations (
      station_id,
      pollutant_code,
      measured_at,
            source_code,
      value,
      valid,
      invalid_value,
            risk_code
    ) VALUES {values_clause(rows)}
        ON CONFLICT(station_id, pollutant_code, measured_at, source_code) DO UPDATE SET
      value = excluded.value,
      valid = excluded.valid,
      invalid_value = excluded.invalid_value,
            risk_code = excluded.risk_code
    """


OBSERVATION_TABLE_SCHEMA_SQL = [
        "DROP INDEX IF EXISTS idx_air_quality_observations_station_time",
        "DROP INDEX IF EXISTS idx_air_quality_observations_pollutant_time",
        "DROP TABLE IF EXISTS air_quality_observations",
        """
        CREATE TABLE air_quality_observations (
            station_id text not null references stations(station_id) on delete cascade,
            pollutant_code text not null references pollutants(code),
            measured_at text not null,
            source_code integer not null,
            value real,
            valid integer not null default 0,
            invalid_value integer not null default 0,
            risk_code integer not null default 0,
            primary key (station_id, pollutant_code, measured_at, source_code)
        ) without rowid
        """,
        "CREATE INDEX idx_air_quality_observations_station_time ON air_quality_observations (station_id, measured_at desc)",
        "CREATE INDEX idx_air_quality_observations_pollutant_time ON air_quality_observations (pollutant_code, measured_at desc)",
]


def execute_rows_with_split(
    client: CloudflareD1Client,
    rows: list[tuple[object, ...]],
    sql_builder,
    start_offset: int,
    label: str,
) -> None:
    try:
        client.query(sql_builder(rows))
    except Exception as exc:
        if len(rows) == 1:
            raise RuntimeError(
                f"Cloudflare D1 rejected {label} row at offset {start_offset}: {rows[0]!r}. Error: {exc}"
            ) from exc

        midpoint = len(rows) // 2
        print(
            f"  Retrying smaller {label} batch at offset {start_offset} "
            f"({len(rows)} rows) after D1 rejection."
        )
        execute_rows_with_split(client, rows[:midpoint], sql_builder, start_offset, label)
        execute_rows_with_split(client, rows[midpoint:], sql_builder, start_offset + midpoint, label)


def seed_data_source(client: CloudflareD1Client) -> None:
    client.query(
        """
        INSERT INTO data_sources (
          id,
          source_key,
          name,
          origin_url,
          license_name,
          refresh_frequency
        ) VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          source_key = excluded.source_key,
          name = excluded.name,
          origin_url = excluded.origin_url,
          license_name = excluded.license_name,
          refresh_frequency = excluded.refresh_frequency,
          updated_at = CURRENT_TIMESTAMP
        """,
        [
            SOURCE_ID,
            "comunidad_madrid_air_quality",
            "Comunidad de Madrid air quality",
            "https://datos.comunidad.madrid/",
            "Open data Comunidad de Madrid",
            "hourly_or_official_snapshot",
        ],
    )


def seed_pollutants(client: CloudflareD1Client) -> None:
    observations, _, _ = load_local_observations()
    pollutant_codes = sorted(observations["pollutant_code"].dropna().astype(str).unique().tolist())
    if not pollutant_codes:
        print("No pollutants discovered in local observations; skipping pollutant seed.")
        return

    rows: list[tuple[object, ...]] = []
    for code in pollutant_codes:
        label, units, display_color = POLLUTANT_DEFINITIONS.get(code, (code, None, None))
        rows.append((code, label, units, display_color))

    execute_rows_with_split(client, rows, build_pollutant_upsert_sql, 0, "pollutant")
    print(f"Seeded {len(rows)} pollutants.")


def ensure_compact_observation_schema(client: CloudflareD1Client, rebuild: bool) -> None:
    table_info = client.query("PRAGMA table_info(air_quality_observations)")
    columns = {row.get("name") for row in table_info}
    compact_schema_ready = "source_code" in columns and "risk_code" in columns and "source" not in columns

    if compact_schema_ready:
        return

    if not rebuild:
        raise RuntimeError(
            "The current D1 observation table uses the old wide schema. Re-run the seeder with --rebuild-observations-table "
            "to recreate it in the compact free-tier format."
        )

    print("Rebuilding air_quality_observations in compact free-tier format...")
    for sql in OBSERVATION_TABLE_SCHEMA_SQL:
        client.query(sql)


def ensure_station_columns(client: CloudflareD1Client) -> None:
    existing_columns = {row.get("name") for row in client.query("PRAGMA table_info(stations)")}
    for column_name, sqlite_type in STATION_METADATA_MIGRATIONS:
        if column_name in existing_columns:
            continue

        print(f"Adding missing stations column '{column_name}'...")
        client.query(f"ALTER TABLE stations ADD COLUMN {column_name} {sqlite_type}")


def seed_stations(client: CloudflareD1Client, batch_size: int) -> None:
    ensure_station_columns(client)
    station_metadata, metadata_file = load_local_station_metadata()
    if station_metadata.empty:
        print("No station metadata found locally; skipping stations.")
        return

    prepared = station_metadata.rename(
        columns={
            "name": "official_name",
            "municipality": "municipality_name",
        }
    ).copy()
    prepared["source_id"] = SOURCE_ID
    prepared["municipality_code"] = None
    prepared["province_code"] = None
    prepared = prepared[
        [
            "station_id",
            "source_id",
            "official_name",
            "municipality_code",
            "municipality_name",
            "province_code",
            "postal_address",
            "zone_description",
            "area_type",
            "station_type",
            "altitude_meters",
            "latitude",
            "longitude",
        ]
    ]
    prepared = prepared.where(pd.notna(prepared), None)

    print(f"Seeding {len(prepared.index)} stations from {metadata_file}...")
    for start, batch in batched_frame(prepared, batch_size):
        rows = [tuple(row) for row in batch.itertuples(index=False, name=None)]
        execute_rows_with_split(client, rows, build_station_upsert_sql, start, "station")
        print(f"  Stations: {start + len(rows)}/{len(prepared.index)}")


def seed_observations(
    client: CloudflareD1Client,
    batch_size: int,
    max_rows: int | None,
    start_offset: int,
    rebuild_observations_table: bool,
) -> None:
    ensure_compact_observation_schema(client, rebuild_observations_table)
    observations, source, _ = load_local_observations()
    prepared = observations[
        [
            "station_id",
            "pollutant_code",
            "measured_at",
            "source",
            "value",
            "valid",
            "invalid_value",
            "risk_level",
        ]
    ].copy()
    prepared["measured_at"] = pd.to_datetime(prepared["measured_at"], errors="coerce").dt.strftime("%Y-%m-%d %H:%M:%S")
    prepared["valid"] = prepared["valid"].astype(bool).astype(int)
    prepared["invalid_value"] = prepared["invalid_value"].astype(bool).astype(int)
    prepared["risk_level"] = prepared["risk_level"].fillna("unknown").astype(str).str.lower()
    prepared["risk_code"] = prepared["risk_level"].map(RISK_CODE_BY_NAME).fillna(0).astype(int)
    prepared["source_code"] = prepared["source"].map(SOURCE_CODE_BY_NAME).fillna(0).astype(int)
    prepared = prepared.dropna(subset=["station_id", "pollutant_code", "measured_at"])
    prepared = prepared[
        [
            "station_id",
            "pollutant_code",
            "measured_at",
            "source_code",
            "value",
            "valid",
            "invalid_value",
            "risk_code",
        ]
    ]
    prepared = prepared.where(pd.notna(prepared), None)

    if start_offset:
        prepared = prepared.iloc[start_offset:]

    if max_rows is not None:
        prepared = prepared.head(max_rows)

    total = len(prepared.index)
    print(f"Seeding {total} observations from {source} (start offset {start_offset})...")
    total_batches = math.ceil(total / batch_size) if total else 0

    for batch_number, (start, batch) in enumerate(batched_frame(prepared, batch_size), start=1):
        rows = [tuple(row) for row in batch.itertuples(index=False, name=None)]
        absolute_start = start_offset + start
        execute_rows_with_split(client, rows, build_observation_upsert_sql, absolute_start, "observation")
        if batch_number == 1 or batch_number % 25 == 0 or batch_number == total_batches:
            absolute_done = absolute_start + len(rows)
            print(f"  Observations: {absolute_done}/{start_offset + total} ({batch_number}/{total_batches} batches)")


def main() -> int:
    args = parse_args()
    if not args.account_id or not args.database_id or not args.api_token:
        print("Missing Cloudflare D1 credentials. Set account id, database id and API token.", file=sys.stderr)
        return 1

    client = CloudflareD1Client(
        account_id=args.account_id,
        database_id=args.database_id,
        api_token=args.api_token,
        timeout_seconds=args.timeout_seconds,
    )

    seed_data_source(client)
    seed_pollutants(client)
    if not args.skip_stations:
        seed_stations(client, args.batch_size)
    if not args.skip_observations:
        seed_observations(
            client,
            args.batch_size,
            args.max_observation_rows,
            args.observation_start_offset,
            args.rebuild_observations_table,
        )

    print("Cloudflare D1 seed complete.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())