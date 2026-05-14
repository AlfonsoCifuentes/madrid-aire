from fastapi import APIRouter, Query

from src.schemas.observation import HistoryEnvelope, LatestObservationEnvelope, SummaryEnvelope
from src.services.history_service import get_history
from src.services.observations_service import get_latest_observations, get_summary

router = APIRouter()


@router.get("/latest", response_model=LatestObservationEnvelope)
def latest_observations() -> LatestObservationEnvelope:
    return get_latest_observations()


@router.get("/summary", response_model=SummaryEnvelope)
def summary() -> SummaryEnvelope:
    return get_summary()


@router.get("/history", response_model=HistoryEnvelope)
def history(
    station_id: str = Query(...),
    pollutant_code: str = Query(default="NO2"),
    window_hours: int = Query(default=24, ge=1, le=24 * 30),
) -> HistoryEnvelope:
    return get_history(station_id=station_id, pollutant_code=pollutant_code, window_hours=window_hours)
