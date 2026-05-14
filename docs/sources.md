# Data Sources

## Principles

- Official data only.
- No synthetic stations, coordinates, observations, or forecasts.
- Local-first artifacts are acceptable during development, but provenance must remain explicit.

## Currently integrated

### Comunidad de Madrid historical air quality

- Status: integrated.
- Usage: model training, history views, summary surfaces.
- Local files: `community_historical_2025.normalized.csv`, `community_historical_2026.normalized.csv`.

### Comunidad de Madrid current day

- Status: integrated.
- Usage: latest observations, freshness checks, daily reporting.
- Local file: `community_current_day_2026-05-13.normalized.csv`.

### Comunidad de Madrid station metadata

- Status: integrated.
- Usage: station explorer, map, station detail, official context.
- Local file pattern: `stations_from_official_source_*.csv`.

## Documented but not yet integrated end-to-end

### Comunidad de Madrid meteorological historical

- Status: planned.
- Intended usage: weather features for later model versions.

### Ayuntamiento de Madrid and AEMET complementary sources

- Status: documented in the bible, not yet wired into the running product.
- Intended usage: coverage expansion, cross-validation, and future reporting.

## Provenance rule

Every public-facing page must be able to trace its values back to an official CSV, a derived API response, or a precomputed artifact generated from official data.
