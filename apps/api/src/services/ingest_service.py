"""Real ETL service: CKAN → normalize → Cloudflare D1 upsert."""

from __future__ import annotations

import json
import math
from datetime import datetime, timezone
from typing import Any
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from src.db.cloudflare_d1_client import get_cloudflare_d1_client
from src.utils.normalize import read_csv_flexible, normalize_air_quality_wide


CKAN_PACKAGE_SHOW = "https://datos.comunidad.madrid/api/3/action/package_show"
SLUG_CURRENT_DAY = "calidad_aire_datos_dia"
SOURCE_CODE_CURRENT_DAY = 1  # community_current_day
USER_AGENT = "madrid-aire-api/1.0"
BATCH_SIZE = 500  # rows per INSERT statement — safe with inline literals (no param binding limit)


def _sql_literal(value: object) -> str:
    """Render a Python value as a safe SQL literal for inline embedding."""
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


def _values_clause(rows: list[tuple[object, ...]]) -> str:
    return ", ".join(
        "(" + ", ".join(_sql_literal(v) for v in row) + ")"
        for row in rows
    )


RISK_CODE_MAP: dict[str, int] = {
    "unknown": 0,
    "good": 1,
    "acceptable": 2,
    "moderate": 3,
    "poor": 4,
    "very_poor": 4,
}


def _fetch_json(url: str) -> dict[str, Any]:
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=20) as response:
        return json.load(response)


def fetch_ckan_csv_url(slug: str) -> str:
    url = f"{CKAN_PACKAGE_SHOW}?{urlencode({'id': slug})}"
    payload = _fetch_json(url)

    if not payload.get("success"):
        raise RuntimeError(f"CKAN package_show failed for slug '{slug}'")

    resources: list[dict[str, Any]] = payload.get("result", {}).get("resources", [])
    csv_resources = [r for r in resources if str(r.get("format", "")).upper() == "CSV"]

    if not csv_resources:
        raise RuntimeError(f"No CSV resource found for CKAN slug '{slug}'")

    url = csv_resources[0].get("url", "")
    if not url:
        raise RuntimeError("CSV resource has no URL")

    return url


def ingest_air_quality_current_day() -> dict[str, Any]:
    client = get_cloudflare_d1_client()
    if client is None:
        raise RuntimeError(
            "Cloudflare D1 credentials are not configured. "
            "Set MADRID_AIRE_CLOUDFLARE_ACCOUNT_ID, MADRID_AIRE_CLOUDFLARE_D1_DATABASE_ID, "
            "and MADRID_AIRE_CLOUDFLARE_API_TOKEN environment variables."
        )

    # 1. Discover the CSV download URL from CKAN
    source_url = fetch_ckan_csv_url(SLUG_CURRENT_DAY)

    # 2. Download + normalize to long format
    raw_df = read_csv_flexible(source_url)
    long_df = normalize_air_quality_wide(raw_df, source="community_current_day")

    rows_processed = len(long_df)
    rows_upserted = 0

    # 3. Batch upsert into D1
    upsert_sql = """
        INSERT OR REPLACE INTO air_quality_observations
          (station_id, pollutant_code, measured_at, source_code, value, valid, invalid_value, risk_code)
        VALUES
    """

    records = long_df.to_dict("records")
    num_batches = math.ceil(len(records) / BATCH_SIZE)

    for batch_idx in range(num_batches):
        batch = records[batch_idx * BATCH_SIZE : (batch_idx + 1) * BATCH_SIZE]
        if not batch:
            continue

        value_rows: list[tuple[object, ...]] = []

        for row in batch:
            measured_at = row["measured_at"]
            if hasattr(measured_at, "isoformat"):
                measured_at_str = measured_at.isoformat()
            else:
                measured_at_str = str(measured_at)

            value = row["value"]
            value_out = None if (value is None or (isinstance(value, float) and math.isnan(value))) else float(value)

            invalid_value = bool(row.get("invalid_value", False))
            risk_level = str(row.get("risk_level", "unknown"))
            risk_code = RISK_CODE_MAP.get(risk_level, 0)

            value_rows.append((
                str(row["station_id"]),
                str(row["pollutant_code"]),
                measured_at_str,
                SOURCE_CODE_CURRENT_DAY,
                value_out,
                1 if row.get("valid") else 0,
                1 if invalid_value else 0,
                risk_code,
            ))

        client.query(upsert_sql + _values_clause(value_rows))
        rows_upserted += len(batch)

    return {
        "rows_processed": rows_processed,
        "rows_upserted": rows_upserted,
        "source_url": source_url,
        "timestamp": datetime.now(tz=timezone.utc).isoformat(),
    }
