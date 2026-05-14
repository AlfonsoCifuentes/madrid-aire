from datetime import datetime

import pandas as pd

from src.schemas.alert import AlertEnvelope, AlertItem
from src.services.data_access import build_freshness_label, get_latest_valid_observations, load_local_predictions_frame
from src.settings import get_settings


def list_alerts() -> AlertEnvelope:
    settings = get_settings()
    latest, observations_source, _ = get_latest_valid_observations()
    predictions, predictions_file = load_local_predictions_frame()

    items: list[AlertItem] = []

    if not settings.cloudflare_account_id or not settings.cloudflare_d1_database_id or not settings.cloudflare_api_token:
        items.append(
            AlertItem(
                id="cloudflare-d1-not-configured",
                category="operational",
                severity="warning",
                title="Cloudflare D1 no configurado",
                body="La build actual sigue funcionando en modo local-first; la persistencia remota en Cloudflare D1 todavía no está conectada.",
                source="system_configuration",
            )
        )

    if not settings.job_secret:
        items.append(
            AlertItem(
                id="job-secret-missing",
                category="operational",
                severity="warning",
                title="Jobs protegidos pendientes",
                body="Los endpoints protegidos existen, pero falta configurar MADRID_AIRE_JOB_SECRET para ejecutarlos con seguridad.",
                source="system_configuration",
            )
        )

    if latest.empty:
        items.append(
            AlertItem(
                id="observations-missing",
                category="data",
                severity="critical",
                title="Observaciones no disponibles",
                body="No hay observaciones oficiales válidas listas para alimentar el dashboard operativo.",
                source=observations_source,
            )
        )
    else:
        latest_timestamp = latest["measured_at"].max()
        freshness = build_freshness_label(latest_timestamp)
        if freshness != "fresh":
            severity = "critical" if freshness == "stale" else "warning"
            items.append(
                AlertItem(
                    id=f"freshness-{freshness}",
                    category="data",
                    severity=severity,
                    title="Frescura observacional degradada",
                    body=f"La última observación válida está marcada como '{freshness}' y requiere revisar el ciclo de ingestión.",
                    measured_at=latest_timestamp.to_pydatetime(),
                    source=observations_source,
                )
            )

        priority_latest = latest[latest["pollutant_code"] == "NO2"]
        if priority_latest.empty:
            priority_latest = latest

        hotspot = priority_latest.sort_values(["value", "measured_at"], ascending=[False, False]).iloc[0]
        hotspot_risk = str(hotspot.risk_level) if hotspot.risk_level == hotspot.risk_level else None
        hotspot_severity = "info" if hotspot_risk in {None, "unknown", "good"} else "warning"
        items.append(
            AlertItem(
                id=f"latest-hotspot-{hotspot.station_id}",
                category="air_quality",
                severity=hotspot_severity,
                title="Máximo NO2 observado",
                body=f"La estación {hotspot.station_id} lidera la señal reciente con {float(hotspot.value):.1f} µg/m³.",
                station_id=str(hotspot.station_id),
                pollutant_code=str(hotspot.pollutant_code),
                measured_at=hotspot.measured_at.to_pydatetime(),
                risk_level=hotspot_risk,
                source=str(hotspot.source),
            )
        )

    if predictions.empty:
        items.append(
            AlertItem(
                id="predictions-missing",
                category="forecast",
                severity="warning",
                title="Forecast no disponible",
                body="No hay predicciones precalculadas listas para la ventana operativa actual.",
                source="ml_not_ready",
            )
        )
    else:
        priority_predictions = predictions[predictions["pollutant_code"] == "NO2"]
        if priority_predictions.empty:
            priority_predictions = predictions

        peak = priority_predictions.sort_values(["predicted_value", "predicted_for"], ascending=[False, False]).iloc[0]
        peak_risk = str(peak.risk_level) if peak.risk_level == peak.risk_level else None
        peak_severity = "info" if peak_risk in {None, "unknown", "good"} else "warning"
        source = str(peak.source) if peak.source == peak.source else (predictions_file or "local_prediction_artifact")
        items.append(
            AlertItem(
                id=f"forecast-peak-{peak.station_id}-{int(peak.horizon_hours)}",
                category="forecast",
                severity=peak_severity,
                title="Pico forecast 24h",
                body=f"El máximo previsto en la ventana actual es {float(peak.predicted_value):.1f} µg/m³ en {peak.station_id} a +{int(peak.horizon_hours)}h.",
                station_id=str(peak.station_id),
                pollutant_code=str(peak.pollutant_code),
                predicted_for=_to_pydatetime(peak.predicted_for),
                risk_level=peak_risk,
                source=source,
            )
        )

    severity_order = {"critical": 0, "warning": 1, "info": 2}
    items.sort(key=lambda item: (severity_order.get(item.severity, 99), item.category, item.id))

    return AlertEnvelope(
        items=items,
        status="alerts_ready" if items else "quiet",
        source="system_and_live_signal",
        generated_at=datetime.utcnow(),
    )


def _to_pydatetime(value: pd.Timestamp | datetime | None) -> datetime | None:
    if value is None or value != value:
        return None
    if isinstance(value, pd.Timestamp):
        return value.to_pydatetime()
    return value