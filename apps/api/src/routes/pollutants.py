from fastapi import APIRouter

from src.schemas.pollutant import PollutantCollection, PollutantSummary

router = APIRouter()

POLLUTANTS = PollutantCollection(
    items=[
        PollutantSummary(code="NO2", label="Nitrogen dioxide", color="#FFB000"),
        PollutantSummary(code="O3", label="Ozone", color="#8B5CF6"),
        PollutantSummary(code="PM10", label="PM10", color="#C2410C"),
        PollutantSummary(code="PM2.5", label="PM2.5", color="#B6FF3B"),
    ]
)


@router.get("/pollutants", response_model=PollutantCollection)
def get_pollutants() -> PollutantCollection:
    return POLLUTANTS
