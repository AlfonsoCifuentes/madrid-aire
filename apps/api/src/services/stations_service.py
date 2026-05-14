from src.schemas.station import StationCollection, StationSummary
from src.services.data_access import get_latest_valid_observations, get_station_metadata_frame


def list_stations() -> StationCollection:
    latest, source, file_path = get_latest_valid_observations()
    station_metadata, metadata_source, metadata_file = get_station_metadata_frame()
    metadata_by_station = station_metadata.set_index("station_id") if not station_metadata.empty else None

    if latest.empty and station_metadata.empty:
        return StationCollection(items=[], source=source, status="awaiting_official_station_metadata", local_file=file_path)

    station_ids = (
        sorted(latest["station_id"].dropna().unique().tolist())
        if not latest.empty
        else sorted(station_metadata["station_id"].dropna().unique().tolist())
    )

    items = [
        _build_station_summary(station_id, source=source, metadata_by_station=metadata_by_station)
        for station_id in station_ids
    ]

    if items and all(item.metadata_status == "official_metadata_ready" for item in items):
        status = "official_station_metadata_ready"
    elif any(item.metadata_status == "official_metadata_ready" for item in items):
        status = "official_station_metadata_partial"
    else:
        status = "station_codes_ready_metadata_pending"

    return StationCollection(
        items=items,
        source=metadata_source if not station_metadata.empty else source,
        status=status,
        local_file=metadata_file or file_path,
    )


def _build_station_summary(
    station_id: str,
    *,
    source: str,
    metadata_by_station,
) -> StationSummary:
    if metadata_by_station is None or station_id not in metadata_by_station.index:
        return StationSummary(
            station_id=station_id,
            source=source,
            metadata_status="pending_official_nomenclator",
        )

    row = metadata_by_station.loc[station_id]
    has_coordinates = row["latitude"] == row["latitude"] and row["longitude"] == row["longitude"]
    return StationSummary(
        station_id=station_id,
        name=None if row["name"] != row["name"] else str(row["name"]),
        municipality=None if row["municipality"] != row["municipality"] else str(row["municipality"]),
        postal_address=None if row["postal_address"] != row["postal_address"] else str(row["postal_address"]),
        zone_description=None if row["zone_description"] != row["zone_description"] else str(row["zone_description"]),
        area_type=None if row["area_type"] != row["area_type"] else str(row["area_type"]),
        station_type=None if row["station_type"] != row["station_type"] else str(row["station_type"]),
        altitude_meters=None if row["altitude_meters"] != row["altitude_meters"] else float(row["altitude_meters"]),
        latitude=None if row["latitude"] != row["latitude"] else float(row["latitude"]),
        longitude=None if row["longitude"] != row["longitude"] else float(row["longitude"]),
        source="official_station_metadata",
        metadata_status="official_metadata_ready" if has_coordinates else "official_metadata_partial",
    )
