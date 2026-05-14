from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    project_name: str = "MADRID Aire API"
    api_prefix: str = "/api"
    environment: str = "local"
    supabase_url: str | None = Field(default=None, alias="MADRID_AIRE_SUPABASE_URL")
    supabase_key: str | None = Field(default=None, alias="MADRID_AIRE_SUPABASE_KEY")
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
