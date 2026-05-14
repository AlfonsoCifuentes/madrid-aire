from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, status

from src.services.jobs_service import queue_job
from src.settings import get_settings

router = APIRouter()


def require_job_token(job_token: Annotated[str | None, Header(alias="x-job-token")] = None) -> None:
    configured_secret = get_settings().job_secret

    if not configured_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="MADRID_AIRE_JOB_SECRET is not configured.",
        )

    if job_token != configured_secret:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid x-job-token.")


@router.post("/jobs/ingest-air-quality")
def ingest_air_quality(_: Annotated[None, Depends(require_job_token)]) -> dict[str, str]:
    return queue_job("ingest-air-quality")


@router.post("/jobs/ingest-weather")
def ingest_weather(_: Annotated[None, Depends(require_job_token)]) -> dict[str, str]:
    return queue_job("ingest-weather")


@router.post("/jobs/generate-predictions")
def generate_predictions(_: Annotated[None, Depends(require_job_token)]) -> dict[str, str]:
    return queue_job("generate-predictions")


@router.post("/jobs/refresh-aggregates")
def refresh_aggregates(_: Annotated[None, Depends(require_job_token)]) -> dict[str, str]:
    return queue_job("refresh-aggregates")


@router.post("/jobs/register-model-version")
def register_model_version(_: Annotated[None, Depends(require_job_token)]) -> dict[str, str]:
    return queue_job("register-model-version")
