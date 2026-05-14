from datetime import datetime

import pandas as pd

from src.schemas.system import CronStatus, DataQualityStatus, ModelProductionStatus, PipelineStatus, PredictionRunStatus, SystemStatusEnvelope
from src.services.data_access import get_latest_valid_observations, load_local_model_metrics_payload, load_local_predictions_frame, resolve_local_model_metrics_file, resolve_local_normalized_file, resolve_local_predictions_file
from src.settings import get_settings


PROTECTED_JOBS = [
    "ingest-air-quality",
    "ingest-weather",
    "generate-predictions",
    "refresh-aggregates",
    "register-model-version",
]


def get_system_status() -> SystemStatusEnvelope:
    settings = get_settings()
    local_observations_file = resolve_local_normalized_file()
    local_predictions_file = resolve_local_predictions_file()
    local_model_metrics_file = resolve_local_model_metrics_file()
    latest, observations_source, _ = get_latest_valid_observations()
    metrics_payload, _ = load_local_model_metrics_payload()
    predictions, _ = load_local_predictions_frame()

    latest_timestamp = None if latest.empty else latest["measured_at"].max()
    freshness = _build_freshness_label(latest_timestamp)
    observations_ready = not latest.empty
    predictions_ready = not predictions.empty
    model_ready = metrics_payload is not None

    pipeline = PipelineStatus(
        status="observations_ready" if observations_ready else "foundation_ready",
        source=observations_source,
        latest_timestamp=_to_pydatetime(latest_timestamp),
        local_file=(
            str(local_observations_file)
            if local_observations_file and observations_source != "cloudflare_d1"
            else None
        ),
    )

    data_quality = DataQualityStatus(
        status="quality_ready" if observations_ready else "quality_pending",
        freshness=freshness,
        station_count=int(latest["station_id"].nunique()) if observations_ready else 0,
        pollutant_count=int(latest["pollutant_code"].nunique()) if observations_ready else 0,
    )

    prediction_source = str(predictions["source"].iloc[0]) if predictions_ready and "source" in predictions.columns else "ml_not_ready"
    predictions_status = "model_v1_ready" if predictions_ready and _prediction_name(predictions) == "hist_gradient_boosting_v1" else ("baseline_ready" if predictions_ready else "predictions_pending")
    prediction_runs = PredictionRunStatus(
        status=predictions_status,
        source=prediction_source,
        generated_at=_to_pydatetime(predictions["generated_at"].max()) if predictions_ready and "generated_at" in predictions.columns else None,
        local_file=str(local_predictions_file) if local_predictions_file else None,
        row_count=len(predictions.index) if predictions_ready else 0,
        station_count=int(predictions["station_id"].nunique()) if predictions_ready else 0,
        horizon_count=int(predictions["horizon_hours"].nunique()) if predictions_ready else 0,
    )

    split = metrics_payload.get("split", {}) if metrics_payload else {}
    model = ModelProductionStatus(
        status=metrics_payload.get("status", "model_pending") if metrics_payload else "model_pending",
        source=metrics_payload.get("source", "ml_not_ready") if metrics_payload else "ml_not_ready",
        selected_model=metrics_payload.get("selected_baseline") if metrics_payload else None,
        generated_at=_coerce_datetime(metrics_payload.get("generated_at")) if metrics_payload else None,
        local_file=str(local_model_metrics_file) if local_model_metrics_file else None,
        horizon_hours=metrics_payload.get("horizon_hours") if metrics_payload else None,
        improvement_pct_vs_best_baseline=metrics_payload.get("improvement_pct_vs_best_baseline") if metrics_payload else None,
        training_period_start=_coerce_datetime(split.get("train", {}).get("start")),
        training_period_end=_coerce_datetime(split.get("train", {}).get("end")),
        test_period_start=_coerce_datetime(split.get("test", {}).get("start")),
        test_period_end=_coerce_datetime(split.get("test", {}).get("end")),
    )

    cron = CronStatus(
        status="cron_ready" if settings.job_secret else "cron_pending_secret",
        jobs_configured=bool(settings.job_secret),
        cloudflare_d1_configured=bool(
            settings.cloudflare_account_id and settings.cloudflare_d1_database_id and settings.cloudflare_api_token
        ),
        protected_jobs=PROTECTED_JOBS,
    )

    overall_status = "system_ready" if observations_ready and predictions_ready and model_ready else "system_partial"

    return SystemStatusEnvelope(
        status=overall_status,
        environment=settings.environment,
        pipeline=pipeline,
        data_quality=data_quality,
        predictions=prediction_runs,
        model=model,
        cron=cron,
    )


def _build_freshness_label(latest_timestamp: pd.Timestamp | None) -> str:
    if latest_timestamp is None or pd.isna(latest_timestamp):
        return "unknown"

    age = pd.Timestamp.utcnow().tz_localize(None) - latest_timestamp.tz_localize(None) if latest_timestamp.tzinfo else pd.Timestamp.utcnow().tz_localize(None) - latest_timestamp
    hours = age.total_seconds() / 3600

    if hours < 3:
        return "fresh"
    if hours < 12:
        return "delayed"
    return "stale"


def _coerce_datetime(value: str | None) -> datetime | None:
    return datetime.fromisoformat(value) if value else None


def _to_pydatetime(value: pd.Timestamp | datetime | None) -> datetime | None:
    if value is None or value != value:
        return None
    if isinstance(value, pd.Timestamp):
        return value.to_pydatetime()
    return value


def _prediction_name(frame: pd.DataFrame) -> str | None:
    if frame.empty or "baseline_name" not in frame.columns:
        return None

    return str(frame["baseline_name"].iloc[0])

