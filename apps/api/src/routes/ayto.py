from fastapi import APIRouter

from src.schemas.observation import LatestObservationEnvelope
from src.schemas.station import StationCollection
from src.services.ayto_service import get_ayto_latest, get_ayto_stations

router = APIRouter()


@router.get("/ayto/stations", response_model=StationCollection)
def ayto_stations() -> StationCollection:
    """List all Ayuntamiento de Madrid air quality monitoring stations."""
    return get_ayto_stations()


@router.get("/ayto/latest", response_model=LatestObservationEnvelope)
def ayto_latest() -> LatestObservationEnvelope:
    """
    Latest valid hourly observations from the Ayuntamiento de Madrid
    real-time air quality network. Results are cached for 5 minutes.
    """
    return get_ayto_latest()
