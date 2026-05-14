from fastapi import APIRouter, Query

from src.schemas.prediction import PredictionEnvelope
from src.services.predictions_service import list_predictions

router = APIRouter()


@router.get("/predictions", response_model=PredictionEnvelope)
def get_predictions(station_id: str | None = Query(default=None)) -> PredictionEnvelope:
    return list_predictions(station_id=station_id)
