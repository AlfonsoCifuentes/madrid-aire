from datetime import datetime

from pydantic import BaseModel


class LatestObservationItem(BaseModel):
    station_id: str
    pollutant_code: str
    measured_at: datetime
    value: float
    valid: bool
    risk_level: str | None = None
    source: str


class HistoryObservationItem(BaseModel):
    station_id: str
    pollutant_code: str
    measured_at: datetime
    value: float
    risk_level: str | None = None
    source: str


class LatestObservationEnvelope(BaseModel):
    items: list[LatestObservationItem]
    source: str
    status: str
    local_file: str | None = None


class SummaryEnvelope(BaseModel):
    status: str
    observations_ready: bool
    predictions_ready: bool
    freshness: str
    source: str
    local_file: str | None = None
    station_count: int = 0
    pollutant_count: int = 0
    latest_timestamp: datetime | None = None
    worst_station_id: str | None = None
    worst_pollutant_code: str | None = None
    worst_value: float | None = None


class HistoryEnvelope(BaseModel):
    items: list[HistoryObservationItem]
    status: str
    source: str
    local_file: str | None = None
    station_id: str
    pollutant_code: str
    window_hours: int
