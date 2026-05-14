from src.schemas.observation import LatestObservationEnvelope, LatestObservationItem, SummaryEnvelope
from src.services.data_access import build_freshness_label, get_latest_valid_observations


def get_latest_observations() -> LatestObservationEnvelope:
    latest, source, file_path = get_latest_valid_observations()
    if latest.empty:
        return LatestObservationEnvelope(items=[], source=source, status="awaiting_official_ingestion", local_file=file_path)

    items = [
        LatestObservationItem(
            station_id=row.station_id,
            pollutant_code=row.pollutant_code,
            measured_at=row.measured_at.to_pydatetime(),
            value=float(row.value),
            valid=bool(row.valid),
            risk_level=None if row.risk_level != row.risk_level else str(row.risk_level),
            source=str(row.source),
        )
        for row in latest.itertuples(index=False)
    ]

    return LatestObservationEnvelope(
        items=items,
        source=source,
        status="latest_ready",
        local_file=file_path,
    )


def get_summary() -> SummaryEnvelope:
    latest, source, file_path = get_latest_valid_observations()
    if latest.empty:
        return SummaryEnvelope(
            status="foundation_ready",
            observations_ready=False,
            predictions_ready=False,
            freshness="pending",
            source=source,
            local_file=file_path,
        )

    latest_timestamp = latest["measured_at"].max()

    priority_frame = latest[latest["pollutant_code"] == "NO2"]
    if priority_frame.empty:
        priority_frame = latest

    worst_row = priority_frame.sort_values(["value", "measured_at"], ascending=[False, False]).iloc[0]

    return SummaryEnvelope(
        status="observations_ready",
        observations_ready=True,
        predictions_ready=False,
        freshness=build_freshness_label(latest_timestamp),
        source=source,
        local_file=file_path,
        station_count=int(latest["station_id"].nunique()),
        pollutant_count=int(latest["pollutant_code"].nunique()),
        latest_timestamp=latest_timestamp.to_pydatetime(),
        worst_station_id=str(worst_row.station_id),
        worst_pollutant_code=str(worst_row.pollutant_code),
        worst_value=float(worst_row.value),
    )
