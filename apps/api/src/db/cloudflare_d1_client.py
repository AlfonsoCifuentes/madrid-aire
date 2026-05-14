from __future__ import annotations

from functools import lru_cache
from typing import Any

import requests

from src.settings import get_settings


class CloudflareD1Client:
    def __init__(self, account_id: str, database_id: str, api_token: str, timeout_seconds: float = 20.0) -> None:
        self.account_id = account_id
        self.database_id = database_id
        self.api_token = api_token
        self.timeout_seconds = timeout_seconds

    @property
    def query_url(self) -> str:
        return f"https://api.cloudflare.com/client/v4/accounts/{self.account_id}/d1/database/{self.database_id}/query"

    def query(self, sql: str, params: list[Any] | None = None) -> list[dict[str, Any]]:
        response = requests.post(
            self.query_url,
            headers={
                "Authorization": f"Bearer {self.api_token}",
                "Content-Type": "application/json",
            },
            json={
                "sql": sql,
                "params": params or [],
            },
            timeout=self.timeout_seconds,
        )
        try:
            response.raise_for_status()
        except requests.HTTPError as exc:
            details = response.text.strip()
            if len(details) > 1200:
                details = details[:1200] + "..."
            raise RuntimeError(f"Cloudflare D1 HTTP {response.status_code}: {details}") from exc

        payload = response.json()
        if not payload.get("success"):
            raise RuntimeError(str(payload.get("errors") or "Cloudflare D1 query failed"))

        result = payload.get("result") or []
        if not result:
            return []

        first_result = result[0]
        if not first_result.get("success"):
            raise RuntimeError(str(first_result.get("errors") or "Cloudflare D1 query result failed"))

        rows = first_result.get("results") or []
        return [row for row in rows if isinstance(row, dict)]


@lru_cache
def get_cloudflare_d1_client() -> CloudflareD1Client | None:
    settings = get_settings()

    if not settings.cloudflare_account_id or not settings.cloudflare_d1_database_id or not settings.cloudflare_api_token:
        return None

    return CloudflareD1Client(
        account_id=settings.cloudflare_account_id,
        database_id=settings.cloudflare_d1_database_id,
        api_token=settings.cloudflare_api_token,
    )