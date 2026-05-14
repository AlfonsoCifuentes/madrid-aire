import pandas as pd

from src.schemas.observation import HistoryEnvelope, HistoryObservationItem
from src.services.data_access import get_observation_frame


def get_history(station_id: str, pollutant_code: str = "NO2", window_hours: int = 24) -> HistoryEnvelope:
    frame, source, file_path = get_observation_frame()
    if frame.empty:
        return HistoryEnvelope(
            items=[],
            status="awaiting_official_ingestion",
            source=source,
            local_file=file_path,
            station_id=station_id,
            pollutant_code=pollutant_code,
            window_hours=window_hours,
        )

    filtered = frame.copy()
    if "valid" in filtered.columns:
        filtered = filtered[filtered["valid"]]
    if "invalid_value" in filtered.columns:
        filtered = filtered[~filtered["invalid_value"]]

    filtered = filtered[
        (filtered["station_id"] == station_id) & (filtered["pollutant_code"] == pollutant_code)
    ].dropna(subset=["measured_at", "value"])

    if filtered.empty:
        return HistoryEnvelope(
            items=[],
            status="station_or_pollutant_not_found",
            source=source,
            local_file=file_path,
            station_id=station_id,
            pollutant_code=pollutant_code,
            window_hours=window_hours,
        )

    filtered = filtered.sort_values("measured_at")
    last_timestamp = filtered["measured_at"].max()
    start_timestamp = last_timestamp - pd.Timedelta(hours=window_hours)
    window = filtered[filtered["measured_at"] >= start_timestamp]

    items = [
        HistoryObservationItem(
            station_id=row.station_id,
            pollutant_code=row.pollutant_code,
            measured_at=row.measured_at.to_pydatetime(),
            value=float(row.value),
            risk_level=None if row.risk_level != row.risk_level else str(row.risk_level),
            source=str(row.source),
        )
        for row in window.itertuples(index=False)
    ]

    return HistoryEnvelope(
        items=items,
        status="history_ready",
        source=source,
        local_file=file_path,
        station_id=station_id,
        pollutant_code=pollutant_code,
        window_hours=window_hours,
    )