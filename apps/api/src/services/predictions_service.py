from src.schemas.prediction import PredictionEnvelope, PredictionItem
from src.services.data_access import load_local_predictions_frame


def list_predictions(station_id: str | None = None) -> PredictionEnvelope:
    frame, file_path = load_local_predictions_frame()
    if frame.empty:
        return PredictionEnvelope(items=[], status="baseline_pending", source="ml_not_ready", local_file=file_path)

    if station_id:
        frame = frame[frame["station_id"] == station_id].copy()

    if frame.empty:
        return PredictionEnvelope(
            items=[],
            status="station_prediction_missing",
            source="local_prediction_artifact",
            local_file=file_path,
            target="NO2",
            generated_at=None,
        )

    items = [
        PredictionItem(
            station_id=row.station_id,
            pollutant_code=row.pollutant_code,
            predicted_for=row.predicted_for.to_pydatetime(),
            predicted_value=float(row.predicted_value),
            horizon_hours=int(row.horizon_hours),
            baseline_name=str(row.baseline_name),
            generated_at=row.generated_at.to_pydatetime(),
            risk_level=str(row.risk_level),
            source=str(row.source),
        )
        for row in frame.sort_values(["station_id", "predicted_for"]).itertuples(index=False)
    ]

    source = str(frame["source"].iloc[0]) if "source" in frame.columns and not frame.empty else "local_prediction_artifact"
    predictor_name = str(frame["baseline_name"].iloc[0]) if "baseline_name" in frame.columns and not frame.empty else "baseline"
    status = "model_v1_ready" if predictor_name == "hist_gradient_boosting_v1" else "baseline_ready"
    target = str(frame["pollutant_code"].iloc[0]) if "pollutant_code" in frame.columns and not frame.empty else "NO2"

    return PredictionEnvelope(
        items=items,
        status=status,
        source=source,
        local_file=file_path,
        target=target,
        generated_at=frame["generated_at"].max().to_pydatetime(),
    )

