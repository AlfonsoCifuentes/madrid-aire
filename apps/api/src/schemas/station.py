from pydantic import BaseModel


class StationSummary(BaseModel):
    station_id: str
    name: str | None = None
    municipality: str | None = None
    postal_address: str | None = None
    zone_description: str | None = None
    area_type: str | None = None
    station_type: str | None = None
    altitude_meters: float | None = None
    latitude: float | None = None
    longitude: float | None = None
    source: str
    metadata_status: str = "station_code_only"


class StationCollection(BaseModel):
    items: list[StationSummary]
    source: str
    status: str
    local_file: str | None = None
