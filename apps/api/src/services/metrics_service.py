from datetime import datetime

from src.schemas.metric import MetricEnvelope, MetricItem
from src.services.data_access import load_local_model_metrics_payload


def list_model_metrics() -> MetricEnvelope:
    payload, file_path = load_local_model_metrics_payload()
    if payload is None:
        return MetricEnvelope(items=[], status="baseline_pending", source="ml_not_ready")

    items = [MetricItem(**item) for item in payload.get("items", [])]
    split = payload.get("split", {})

    return MetricEnvelope(
        items=items,
        status=payload.get("status", "baseline_ready"),
        source=payload.get("source", "local_baseline_artifact"),
        local_file=file_path,
        target=payload.get("target"),
        horizon_hours=payload.get("horizon_hours"),
        selected_baseline=payload.get("selected_baseline"),
        training_period_start=_coerce_datetime(split.get("train", {}).get("start")),
        training_period_end=_coerce_datetime(split.get("train", {}).get("end")),
        validation_period_start=_coerce_datetime(split.get("valid", {}).get("start")),
        validation_period_end=_coerce_datetime(split.get("valid", {}).get("end")),
        test_period_start=_coerce_datetime(split.get("test", {}).get("start")),
        test_period_end=_coerce_datetime(split.get("test", {}).get("end")),
        generated_at=_coerce_datetime(payload.get("generated_at")),
    )


def _coerce_datetime(value: str | None) -> datetime | None:
    return datetime.fromisoformat(value) if value else None
