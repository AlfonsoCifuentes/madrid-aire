-- MADRID Aire base schema for Cloudflare D1
-- Source of truth: MADRID_Aire_ultimate_product_engineering_bible_v6_copilot.md section 16
PRAGMA foreign_keys = ON;

create table if not exists data_sources (
  id text primary key,
  source_key text not null unique,
  name text not null,
  origin_url text,
  license_name text,
  license_url text,
  refresh_frequency text,
  created_at text not null default CURRENT_TIMESTAMP,
  updated_at text not null default CURRENT_TIMESTAMP
);

create table if not exists stations (
  station_id text primary key,
  source_id text references data_sources(id) on delete set null,
  official_name text,
  municipality_code text,
  municipality_name text,
  province_code text,
  postal_address text,
  zone_description text,
  area_type text,
  station_type text,
  altitude_meters real,
  latitude real,
  longitude real,
  metadata_status text not null default 'pending_official_nomenclator',
  created_at text not null default CURRENT_TIMESTAMP,
  updated_at text not null default CURRENT_TIMESTAMP
);

create table if not exists pollutants (
  code text primary key,
  label text not null,
  units text,
  display_color text,
  created_at text not null default CURRENT_TIMESTAMP
);

create table if not exists air_quality_observations (
  station_id text not null references stations(station_id) on delete cascade,
  pollutant_code text not null references pollutants(code),
  measured_at text not null,
  source_code integer not null,
  value real,
  valid integer not null default 0,
  invalid_value integer not null default 0,
  risk_code integer not null default 0,
  primary key (station_id, pollutant_code, measured_at, source_code)
) without rowid;

create table if not exists weather_observations (
  id integer primary key autoincrement,
  station_id text not null,
  measured_at text not null,
  wind_speed real,
  wind_direction real,
  temperature real,
  relative_humidity real,
  pressure real,
  solar_radiation real,
  precipitation real,
  source text not null,
  ingestion_run_id text,
  created_at text not null default CURRENT_TIMESTAMP,
  unique (station_id, measured_at, source)
);

create table if not exists model_versions (
  id text primary key,
  model_key text not null,
  version text not null,
  pollutant_code text not null references pollutants(code),
  horizon_hours integer not null,
  artifact_path text,
  feature_spec text,
  training_window text,
  notes text,
  created_at text not null default CURRENT_TIMESTAMP,
  unique (model_key, version)
);

create table if not exists prediction_runs (
  id text primary key,
  model_version_id text references model_versions(id) on delete set null,
  run_started_at text not null default CURRENT_TIMESTAMP,
  run_finished_at text,
  status text not null default 'queued',
  source text,
  notes text
);

create table if not exists predictions (
  id integer primary key autoincrement,
  prediction_run_id text not null references prediction_runs(id) on delete cascade,
  model_version_id text references model_versions(id) on delete set null,
  station_id text not null references stations(station_id) on delete cascade,
  pollutant_code text not null references pollutants(code),
  predicted_for text not null,
  generated_at text not null default CURRENT_TIMESTAMP,
  horizon_hours integer not null,
  predicted_value real,
  risk_level text,
  created_at text not null default CURRENT_TIMESTAMP,
  unique (station_id, pollutant_code, predicted_for, model_version_id)
);

create table if not exists model_metrics (
  id text primary key,
  model_version_id text references model_versions(id) on delete cascade,
  pollutant_code text not null references pollutants(code),
  horizon_hours integer not null,
  split_name text not null,
  metric_name text not null,
  metric_value real not null,
  baseline_metric_value real,
  metadata text,
  created_at text not null default CURRENT_TIMESTAMP
);

create table if not exists pipeline_runs (
  id text primary key,
  pipeline_name text not null,
  source_id text references data_sources(id) on delete set null,
  status text not null default 'queued',
  started_at text not null default CURRENT_TIMESTAMP,
  finished_at text,
  metadata text,
  error_message text
);

create table if not exists data_quality_checks (
  id text primary key,
  pipeline_run_id text references pipeline_runs(id) on delete cascade,
  check_name text not null,
  status text not null,
  severity text not null default 'info',
  details text,
  created_at text not null default CURRENT_TIMESTAMP
);

create table if not exists alerts (
  id text primary key,
  alert_type text not null,
  severity text not null,
  title text not null,
  message text,
  metadata text,
  active integer not null default 1,
  created_at text not null default CURRENT_TIMESTAMP,
  resolved_at text
);

create table if not exists system_events (
  id text primary key,
  event_type text not null,
  source text,
  payload text,
  created_at text not null default CURRENT_TIMESTAMP
);

create table if not exists ai_usage_log (
  id text primary key,
  feature_name text not null,
  provider text,
  model_name text,
  prompt_tokens integer,
  completion_tokens integer,
  total_tokens integer,
  metadata text,
  created_at text not null default CURRENT_TIMESTAMP
);

create index if not exists idx_air_quality_observations_station_time
on air_quality_observations (station_id, measured_at desc);

create index if not exists idx_air_quality_observations_pollutant_time
on air_quality_observations (pollutant_code, measured_at desc);

create index if not exists idx_predictions_station_time
on predictions (station_id, predicted_for desc);

insert into pollutants (code, label, units, display_color)
values
  ('NO2', 'Nitrogen dioxide', 'µg/m3', '#FFB000'),
  ('O3', 'Ozone', 'µg/m3', '#8B5CF6'),
  ('PM10', 'PM10', 'µg/m3', '#C2410C'),
  ('PM25', 'PM2.5', 'µg/m3', '#B6FF3B'),
  ('SO2', 'Sulfur dioxide', 'µg/m3', '#22D3EE'),
  ('CO', 'Carbon monoxide', 'mg/m3', '#F0ABFC'),
  ('NO', 'Nitric oxide', 'µg/m3', '#F97316'),
  ('NOX', 'Nitrogen oxides', 'µg/m3', '#FB7185'),
  ('BEN', 'Benzene', null, '#14B8A6'),
  ('TOL', 'Toluene', null, '#0EA5E9'),
  ('NMHC', 'Non-methane hydrocarbons', null, '#F59E0B'),
  ('TCH', 'Total hydrocarbons', null, '#84CC16')
on conflict (code) do nothing;
