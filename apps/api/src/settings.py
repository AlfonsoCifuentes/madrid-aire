import os
from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


def _default_environment() -> str:
    if os.getenv("MADRID_AIRE_ENVIRONMENT"):
        return os.getenv("MADRID_AIRE_ENVIRONMENT", "local")
    if os.getenv("VERCEL_ENV"):
        return os.getenv("VERCEL_ENV", "local")
    if os.getenv("VERCEL"):
        return "production"
    return "local"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    project_name: str = "MADRID Aire API"
    api_prefix: str = "/api"
    environment: str = Field(default_factory=_default_environment, alias="MADRID_AIRE_ENVIRONMENT")
    cloudflare_account_id: str | None = Field(default=None, alias="MADRID_AIRE_CLOUDFLARE_ACCOUNT_ID")
    cloudflare_d1_database_id: str | None = Field(default=None, alias="MADRID_AIRE_CLOUDFLARE_D1_DATABASE_ID")
    cloudflare_api_token: str | None = Field(default=None, alias="MADRID_AIRE_CLOUDFLARE_API_TOKEN")
    job_secret: str | None = Field(default=None, alias="MADRID_AIRE_JOB_SECRET")
    local_normalized_observations_file: str | None = Field(
        default=None,
        alias="MADRID_AIRE_LOCAL_NORMALIZED_OBSERVATIONS_FILE",
    )
    local_model_metrics_file: str | None = Field(
        default=None,
        alias="MADRID_AIRE_LOCAL_MODEL_METRICS_FILE",
    )
    local_predictions_file: str | None = Field(
        default=None,
        alias="MADRID_AIRE_LOCAL_PREDICTIONS_FILE",
    )
    local_station_metadata_file: str | None = Field(
        default=None,
        alias="MADRID_AIRE_LOCAL_STATION_METADATA_FILE",
    )

    @property
    def repo_root(self) -> Path:
        return Path(__file__).resolve().parents[3]


@lru_cache
def get_settings() -> Settings:
    return Settings()
