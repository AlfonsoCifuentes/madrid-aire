import type { LatestObservationItem, PredictionItem, StationSummary } from "@/lib/api";

export type MunicipalitySnapshot = {
  municipality: string;
  stationCount: number;
  peakValue: number;
  stationId: string;
  stationName: string;
  riskLevel: string | null;
  measuredAt: string;
};

export type ForecastHotspot = {
  stationId: string;
  stationName: string;
  municipality: string;
  predictedValue: number;
  predictedFor: string;
  horizonHours: number;
  riskLevel: string | null;
};

export function buildPredictionsHref(language: "es" | "en", stationId: string | null, horizon: number | null) {
  const params = new URLSearchParams({ lang: language });

  if (stationId) {
    params.set("station", stationId);
  }

  if (horizon != null) {
    params.set("h", String(horizon));
  }

  return `/predictions?${params.toString()}`;
}

export function buildStationDetailHref(language: "es" | "en", stationId: string) {
  const params = new URLSearchParams({ lang: language });
  return `/stations/${stationId}?${params.toString()}`;
}

export function buildMunicipalitySnapshots(
  stations: StationSummary[],
  latest: LatestObservationItem[],
  pollutantCode = "NO2",
): MunicipalitySnapshot[] {
  const stationsById = new Map(stations.map((station) => [station.station_id, station]));
  const groups = new Map<
    string,
    {
      stationIds: Set<string>;
      peak: MunicipalitySnapshot | null;
    }
  >();

  for (const item of latest) {
    if (item.pollutant_code !== pollutantCode || item.valid === false) {
      continue;
    }

    const station = stationsById.get(item.station_id);
    const municipality = station?.municipality ?? station?.name ?? item.station_id;
    const current = groups.get(municipality) ?? { stationIds: new Set<string>(), peak: null };
    current.stationIds.add(item.station_id);

    const candidate: MunicipalitySnapshot = {
      municipality,
      stationCount: current.stationIds.size,
      peakValue: item.value,
      stationId: item.station_id,
      stationName: station?.name ?? station?.municipality ?? item.station_id,
      riskLevel: item.risk_level,
      measuredAt: item.measured_at,
    };

    if (
      !current.peak ||
      candidate.peakValue > current.peak.peakValue ||
      (candidate.peakValue === current.peak.peakValue && candidate.measuredAt > current.peak.measuredAt)
    ) {
      current.peak = candidate;
    }

    groups.set(municipality, current);
  }

  return [...groups.values()]
    .map((group) => ({
      ...(group.peak as MunicipalitySnapshot),
      stationCount: group.stationIds.size,
    }))
    .sort((left, right) => right.peakValue - left.peakValue || right.stationCount - left.stationCount);
}

export function buildForecastHotspots(
  stations: StationSummary[],
  predictions: PredictionItem[],
  pollutantCode = "NO2",
  limit = 4,
): ForecastHotspot[] {
  const stationsById = new Map(stations.map((station) => [station.station_id, station]));
  const selected = predictions
    .filter((item) => item.pollutant_code === pollutantCode)
    .sort(
      (left, right) =>
        right.predicted_value - left.predicted_value || left.horizon_hours - right.horizon_hours || left.station_id.localeCompare(right.station_id),
    );
  const seenStations = new Set<string>();
  const hotspots: ForecastHotspot[] = [];

  for (const item of selected) {
    if (seenStations.has(item.station_id)) {
      continue;
    }

    const station = stationsById.get(item.station_id);
    hotspots.push({
      stationId: item.station_id,
      stationName: station?.name ?? item.station_id,
      municipality: station?.municipality ?? station?.name ?? item.station_id,
      predictedValue: item.predicted_value,
      predictedFor: item.predicted_for,
      horizonHours: item.horizon_hours,
      riskLevel: item.risk_level,
    });
    seenStations.add(item.station_id);

    if (hotspots.length >= limit) {
      break;
    }
  }

  return hotspots;
}