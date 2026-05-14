# Architecture

## Monorepo layout

```text
apps/
  api/   -> FastAPI, Pydantic schemas, services, routes
  web/   -> Next.js app router frontend
data/    -> official snapshots, normalized bundles, ML artifacts
docs/    -> project and portfolio documentation
sql/     -> Cloudflare D1 schema and bootstrap SQL
```

## Runtime flow

1. Official files are downloaded and normalized locally.
2. `apps/api` reads normalized observations, station metadata, and ML artifacts.
3. `apps/web` fetches lightweight JSON from the API and renders premium editorial surfaces.
4. Forecasts remain precomputed artifacts, never frontend-side inference.

## Backend shape

Current public endpoints:

- `/api/health`
- `/api/stations`
- `/api/pollutants`
- `/api/latest`
- `/api/history`
- `/api/predictions`
- `/api/model-metrics`
- `/api/alerts`
- `/api/summary`
- `/api/system-status`

Protected job endpoints exist for ingestion, prediction generation, aggregate refresh, and model registration.

## Current operational mode

- Observations: local-first bundle, with optional Cloudflare D1 path if configured.
- Predictions: local precomputed artifacts.
- Cron: documented and partially wired through protected endpoints, but not yet operational in production.

## Frontend surfaces currently implemented

- Landing
- Dashboard
- Map
- Stations explorer and station detail
- Predictions
- Model
- Methodology
- System
- Reports
