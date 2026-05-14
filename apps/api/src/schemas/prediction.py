from datetime import datetime

from pydantic import BaseModel


class PredictionItem(BaseModel):
    station_id: str
    pollutant_code: str
    predicted_for: datetime
    predicted_value: float
    horizon_hours: int
    baseline_name: str
    generated_at: datetime
    risk_level: str
    source: str


class PredictionEnvelope(BaseModel):
    items: list[PredictionItem]
    status: str
    source: str
    local_file: str | None = None
    target: str | None = None
    generated_at: datetime | None = None
