from fastapi import APIRouter

from src.schemas.system import SystemStatusEnvelope
from src.services.system_service import get_system_status

router = APIRouter()


@router.get("/system-status", response_model=SystemStatusEnvelope)
def system_status() -> SystemStatusEnvelope:
    return get_system_status()
