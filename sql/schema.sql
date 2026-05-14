-- MADRID Aire base schema
-- Source of truth: MADRID_Aire_ultimate_product_engineering_bible_v6_copilot.md section 16

create extension if not exists pgcrypto;

create table if not exists data_sources (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  name text not null,
  origin_url text,
  license_name text,
  license_url text,
  refresh_frequency text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists stations (
  station_id text primary key,
  source_id uuid references data_sources(id) on delete set null,
  official_name text,
  municipality_code text,
  municipality_name text,
  province_code text,
  latitude double precision,
  longitude double precision,
  metadata_status text not null default 'pending_official_nomenclator',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists pollutants (
  code text primary key,
  label text not null,
  units text,
  display_color text,
  created_at timestamptz not null default now()
);

create table if not exists air_quality_observations (
  id bigint generated always as identity primary key,
  station_id text not null references stations(station_id) on delete cascade,
  pollutant_code text not null references pollutants(code),
  measured_at timestamptz not null,
  value double precision,
  valid boolean not null default false,
  invalid_value boolean not null default false,
  risk_level text,
  source text not null,
  raw_point_id text,
  ingestion_run_id uuid,
  created_at timestamptz not null default now(),
  unique (station_id, pollutant_code, measured_at, source)
);

create table if not exists weather_observations (
  id bigint generated always as identity primary key,
  station_id text not null,
  measured_at timestamptz not null,
  wind_speed double precision,
  wind_direction double precision,
  temperature double precision,
  relative_humidity double precision,
  pressure double precision,
  solar_radiation double precision,
  precipitation double precision,
  source text not null,
  ingestion_run_id uuid,
  created_at timestamptz not null default now(),
  unique (station_id, measured_at, source)
);

create table if not exists model_versions (
  id uuid primary key default gen_random_uuid(),
  model_key text not null,
  version text not null,
  pollutant_code text not null references pollutants(code),
  horizon_hours integer not null,
  artifact_path text,
  feature_spec jsonb,
  training_window jsonb,
  notes text,
  created_at timestamptz not null default now(),
  unique (model_key, version)
);

create table if not exists prediction_runs (
  id uuid primary key default gen_random_uuid(),
  model_version_id uuid references model_versions(id) on delete set null,
  run_started_at timestamptz not null default now(),
  run_finished_at timestamptz,
  status text not null default 'queued',
  source text,
  notes text
);

create table if not exists predictions (
  id bigint generated always as identity primary key,
  prediction_run_id uuid not null references prediction_runs(id) on delete cascade,
  model_version_id uuid references model_versions(id) on delete set null,
  station_id text not null references stations(station_id) on delete cascade,
  pollutant_code text not null references pollutants(code),
  predicted_for timestamptz not null,
  generated_at timestamptz not null default now(),
  horizon_hours integer not null,
  predicted_value double precision,
  risk_level text,
  created_at timestamptz not null default now(),
  unique (station_id, pollutant_code, predicted_for, model_version_id)
);

create table if not exists model_metrics (
  id uuid primary key default gen_random_uuid(),
  model_version_id uuid references model_versions(id) on delete cascade,
  pollutant_code text not null references pollutants(code),
  horizon_hours integer not null,
  split_name text not null,
  metric_name text not null,
  metric_value double precision not null,
  baseline_metric_value double precision,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists pipeline_runs (
  id uuid primary key default gen_random_uuid(),
  pipeline_name text not null,
  source_id uuid references data_sources(id) on delete set null,
  status text not null default 'queued',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  metadata jsonb,
  error_message text
);

create table if not exists data_quality_checks (
  id uuid primary key default gen_random_uuid(),
  pipeline_run_id uuid references pipeline_runs(id) on delete cascade,
  check_name text not null,
  status text not null,
  severity text not null default 'info',
  details jsonb,
  created_at timestamptz not null default now()
);

create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  alert_type text not null,
  severity text not null,
  title text not null,
  message text,
  metadata jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists system_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  source text,
  payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists ai_usage_log (
  id uuid primary key default gen_random_uuid(),
  feature_name text not null,
  provider text,
  model_name text,
  prompt_tokens integer,
  completion_tokens integer,
  total_tokens integer,
  metadata jsonb,
  created_at timestamptz not null default now()
);

insert into pollutants (code, label, units, display_color)
values
  ('NO2', 'Nitrogen dioxide', 'µg/m3', '#FFB000'),
  ('O3', 'Ozone', 'µg/m3', '#8B5CF6'),
  ('PM10', 'PM10', 'µg/m3', '#C2410C'),
  ('PM25', 'PM2.5', 'µg/m3', '#B6FF3B'),
  ('SO2', 'Sulfur dioxide', 'µg/m3', '#22D3EE'),
  ('CO', 'Carbon monoxide', 'mg/m3', '#F0ABFC'),
  ('NO', 'Nitric oxide', 'µg/m3', '#F97316'),
  ('NOX', 'Nitrogen oxides', 'µg/m3', '#FB7185')
on conflict (code) do nothing;
