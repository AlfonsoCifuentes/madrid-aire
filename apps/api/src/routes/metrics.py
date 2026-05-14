from fastapi import APIRouter

from src.schemas.metric import MetricEnvelope
from src.services.metrics_service import list_model_metrics

router = APIRouter()


@router.get("/model-metrics", response_model=MetricEnvelope)
def get_model_metrics() -> MetricEnvelope:
    return list_model_metrics()
