from datetime import datetime

from pydantic import BaseModel


class AlertItem(BaseModel):
    id: str
    category: str
    severity: str
    title: str
    body: str
    station_id: str | None = None
    pollutant_code: str | None = None
    measured_at: datetime | None = None
    predicted_for: datetime | None = None
    risk_level: str | None = None
    source: str


class AlertEnvelope(BaseModel):
    items: list[AlertItem]
    status: str
    source: str
    generated_at: datetime | None = None