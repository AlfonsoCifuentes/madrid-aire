import { cache } from "react";

export type SummaryEnvelope = {
  status: string;
  observations_ready: boolean;
  predictions_ready: boolean;
  freshness: string;
  source: string;
  local_file: string | null;
  station_count: number;
  pollutant_count: number;
  latest_timestamp: string | null;
  worst_station_id: string | null;
  worst_pollutant_code: string | null;
  worst_value: number | null;
};

export type LatestObservationItem = {
  station_id: string;
  pollutant_code: string;
  measured_at: string;
  value: number;
  valid: boolean;
  risk_level: string | null;
  source: string;
};

export type LatestObservationEnvelope = {
  items: LatestObservationItem[];
  source: string;
  status: string;
  local_file: string | null;
};

export type StationSummary = {
  station_id: string;
  name: string | null;
  municipality: string | null;
  postal_address: string | null;
  zone_description: string | null;
  area_type: string | null;
  station_type: string | null;
  altitude_meters: number | null;
  latitude: number | null;
  longitude: number | null;
  source: string;
  metadata_status: string;
};

export type StationCollection = {
  items: StationSummary[];
  source: string;
  status: string;
  local_file: string | null;
};

export type HistoryObservationItem = {
  station_id: string;
  pollutant_code: string;
  measured_at: string;
  value: number;
  risk_level: string | null;
  source: string;
};

export type HistoryEnvelope = {
  items: HistoryObservationItem[];
  status: string;
  source: string;
  local_file: string | null;
  station_id: string;
  pollutant_code: string;
  window_hours: number;
};

export type MetricItem = {
  baseline_name: string;
  split_name: string;
  mae: number;
  rmse: number;
  r2: number | null;
  sample_count: number;
};

export type MetricEnvelope = {
  items: MetricItem[];
  status: string;
  source: string;
  local_file: string | null;
  target: string | null;
  horizon_hours: number | null;
  selected_baseline: string | null;
  training_period_start: string | null;
  training_period_end: string | null;
  validation_period_start: string | null;
  validation_period_end: string | null;
  test_period_start: string | null;
  test_period_end: string | null;
  generated_at: string | null;
};

export type PredictionItem = {
  station_id: string;
  pollutant_code: string;
  predicted_for: string;
  predicted_value: number;
  horizon_hours: number;
  baseline_name: string;
  generated_at: string;
  risk_level: string;
  source: string;
};

export type PredictionEnvelope = {
  items: PredictionItem[];
  status: string;
  source: string;
  local_file: string | null;
  target: string | null;
  generated_at: string | null;
};

export type AlertItem = {
  id: string;
  category: string;
  severity: string;
  title: string;
  body: string;
  station_id: string | null;
  pollutant_code: string | null;
  measured_at: string | null;
  predicted_for: string | null;
  risk_level: string | null;
  source: string;
};

export type AlertEnvelope = {
  items: AlertItem[];
  status: string;
  source: string;
  generated_at: string | null;
};

export type PipelineStatus = {
  status: string;
  source: string;
  latest_timestamp: string | null;
  local_file: string | null;
};

export type DataQualityStatus = {
  status: string;
  freshness: string;
  station_count: number;
  pollutant_count: number;
};

export type PredictionRunStatus = {
  status: string;
  source: string;
  generated_at: string | null;
  local_file: string | null;
  row_count: number;
  station_count: number;
  horizon_count: number;
};

export type ModelProductionStatus = {
  status: string;
  source: string;
  selected_model: string | null;
  generated_at: string | null;
  local_file: string | null;
  horizon_hours: number | null;
  improvement_pct_vs_best_baseline: number | null;
  training_period_start: string | null;
  training_period_end: string | null;
  test_period_start: string | null;
  test_period_end: string | null;
};

export type CronStatus = {
  status: string;
  jobs_configured: boolean;
  cloudflare_d1_configured: boolean;
  protected_jobs: string[];
};

export type SystemStatusEnvelope = {
  status: string;
  environment: string;
  pipeline: PipelineStatus;
  data_quality: DataQualityStatus;
  predictions: PredictionRunStatus;
  model: ModelProductionStatus;
  cron: CronStatus;
};

export type DashboardPayload = {
  summary: SummaryEnvelope | null;
  latest: LatestObservationEnvelope | null;
  stations: StationCollection | null;
  apiAvailable: boolean;
};

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
}

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export const getDashboardPayload = cache(async (): Promise<DashboardPayload> => {
  const [summary, latest, stations] = await Promise.all([
    fetchJson<SummaryEnvelope>("/api/summary"),
    fetchJson<LatestObservationEnvelope>("/api/latest"),
    fetchJson<StationCollection>("/api/stations"),
  ]);

  return {
    summary,
    latest,
    stations,
    apiAvailable: Boolean(summary && latest && stations),
  };
});

export const getHistoryPayload = cache(
  async (stationId: string, pollutantCode = "NO2", windowHours = 24): Promise<HistoryEnvelope | null> => {
    const search = new URLSearchParams({
      station_id: stationId,
      pollutant_code: pollutantCode,
      window_hours: String(windowHours),
    });
    return fetchJson<HistoryEnvelope>(`/api/history?${search.toString()}`);
  },
);

export const getModelMetricsPayload = cache(async (): Promise<MetricEnvelope | null> => {
    return fetchJson<MetricEnvelope>("/api/model-metrics");
  });

export const getPredictionsPayload = cache(async (stationId?: string): Promise<PredictionEnvelope | null> => {
    const search = stationId ? `?station_id=${encodeURIComponent(stationId)}` : "";
    return fetchJson<PredictionEnvelope>(`/api/predictions${search}`);
  });

export const getAlertsPayload = cache(async (): Promise<AlertEnvelope | null> => {
  return fetchJson<AlertEnvelope>("/api/alerts");
});

export const getSystemStatusPayload = cache(async (): Promise<SystemStatusEnvelope | null> => {
  return fetchJson<SystemStatusEnvelope>("/api/system-status");
});
