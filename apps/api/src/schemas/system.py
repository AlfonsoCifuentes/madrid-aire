from datetime import datetime

from pydantic import BaseModel


class PipelineStatus(BaseModel):
    status: str
    source: str
    latest_timestamp: datetime | None = None
    local_file: str | None = None


class DataQualityStatus(BaseModel):
    status: str
    freshness: str
    station_count: int = 0
    pollutant_count: int = 0


class PredictionRunStatus(BaseModel):
    status: str
    source: str
    generated_at: datetime | None = None
    local_file: str | None = None
    row_count: int = 0
    station_count: int = 0
    horizon_count: int = 0


class ModelProductionStatus(BaseModel):
    status: str
    source: str
    selected_model: str | None = None
    generated_at: datetime | None = None
    local_file: str | None = None
    horizon_hours: int | None = None
    improvement_pct_vs_best_baseline: float | None = None
    training_period_start: datetime | None = None
    training_period_end: datetime | None = None
    test_period_start: datetime | None = None
    test_period_end: datetime | None = None


class CronStatus(BaseModel):
    status: str
    jobs_configured: bool
    cloudflare_d1_configured: bool
    protected_jobs: list[str]


class SystemStatusEnvelope(BaseModel):
    status: str
    environment: str
    pipeline: PipelineStatus
    data_quality: DataQualityStatus
    predictions: PredictionRunStatus
    model: ModelProductionStatus
    cron: CronStatus