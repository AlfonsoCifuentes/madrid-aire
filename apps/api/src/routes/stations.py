from fastapi import APIRouter

from src.schemas.station import StationCollection
from src.services.stations_service import list_stations

router = APIRouter()


@router.get("/stations", response_model=StationCollection)
def get_stations() -> StationCollection:
    return list_stations()
