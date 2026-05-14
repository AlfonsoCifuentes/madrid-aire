from src.schemas.alert import AlertEnvelope
from src.services.alerts_service import list_alerts
from fastapi import APIRouter

router = APIRouter()


@router.get("/alerts", response_model=AlertEnvelope)
def alerts() -> AlertEnvelope:
    return list_alerts()