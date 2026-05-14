from datetime import datetime

from pydantic import BaseModel


class MetricItem(BaseModel):
    baseline_name: str
    split_name: str
    mae: float
    rmse: float
    r2: float | None = None
    sample_count: int


class MetricEnvelope(BaseModel):
    items: list[MetricItem]
    status: str
    source: str
    local_file: str | None = None
    target: str | None = None
    horizon_hours: int | None = None
    selected_baseline: str | None = None
    training_period_start: datetime | None = None
    training_period_end: datetime | None = None
    validation_period_start: datetime | None = None
    validation_period_end: datetime | None = None
    test_period_start: datetime | None = None
    test_period_end: datetime | None = None
    generated_at: datetime | None = None
