from fastapi import FastAPI

from src.routes import alerts, health, jobs, metrics, observations, pollutants, predictions, stations, system
from src.settings import get_settings

settings = get_settings()

app = FastAPI(
    title=settings.project_name,
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.include_router(health.router, prefix=settings.api_prefix, tags=["health"])
app.include_router(stations.router, prefix=settings.api_prefix, tags=["stations"])
app.include_router(pollutants.router, prefix=settings.api_prefix, tags=["pollutants"])
app.include_router(observations.router, prefix=settings.api_prefix, tags=["observations"])
app.include_router(predictions.router, prefix=settings.api_prefix, tags=["predictions"])
app.include_router(metrics.router, prefix=settings.api_prefix, tags=["metrics"])
app.include_router(alerts.router, prefix=settings.api_prefix, tags=["alerts"])
app.include_router(system.router, prefix=settings.api_prefix, tags=["system"])
app.include_router(jobs.router, prefix=settings.api_prefix, tags=["jobs"])
