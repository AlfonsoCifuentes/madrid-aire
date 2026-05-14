# Data Dictionary

## Normalized air-quality observations

Primary shape used by the API and ETL.

| Field | Type | Meaning |
| --- | --- | --- |
| `station_id` | string | Canonical station identifier like `28_047_002`. |
| `pollutant_code` | string | Pollutant code such as `NO2`, `O3`, `PM10`, `PM25`. |
| `measured_at` | datetime | Observation timestamp in hourly resolution. |
| `value` | number | Numeric pollutant value from the official source. |
| `valid` | boolean | Validity flag after normalization. |
| `invalid_value` | boolean | Explicit invalid marker when the source flags the sample. |
| `risk_level` | string | Conservative internal risk label. |
| `source` | string | Data origin label such as `local_normalized_csv_bundle`. |

## Station metadata

| Field | Type | Meaning |
| --- | --- | --- |
| `station_id` | string | Canonical station identifier used across the app. |
| `name` | string | Official station or municipality name from the source file. |
| `municipality` | string | Municipality name. |
| `postal_address` | string | Official postal address. |
| `zone_description` | string | Air-quality zone description. |
| `area_type` | string | Official station area type. |
| `station_type` | string | Official station type. |
| `altitude_meters` | number | Station altitude in meters. |
| `latitude` | number | Parsed decimal latitude. |
| `longitude` | number | Parsed decimal longitude. |

## Prediction artifact rows

| Field | Type | Meaning |
| --- | --- | --- |
| `station_id` | string | Station receiving the prediction. |
| `pollutant_code` | string | Pollutant code, currently prioritized around `NO2`. |
| `predicted_for` | datetime | Timestamp being forecast. |
| `predicted_value` | number | Forecasted value from the selected predictor. |
| `horizon_hours` | integer | Forecast horizon in hours. |
| `baseline_name` | string | Current predictor name, including model v1. |
| `generated_at` | datetime | Artifact generation time. |
| `risk_level` | string | Derived risk label for the forecasted value. |
| `source` | string | Artifact provenance label. |

## Model metrics payload

| Field | Type | Meaning |
| --- | --- | --- |
| `status` | string | Artifact readiness status. |
| `source` | string | Metrics source label. |
| `selected_baseline` | string | Current selected predictor. |
| `horizon_hours` | integer | Forecast horizon evaluated. |
| `items` | array | Baseline/model metrics by name and split. |
| `split.train` | object | Training window start and end. |
| `split.test` | object | Test window start and end. |
| `improvement_pct_vs_best_baseline` | number | MAE improvement versus the best baseline. |

## System and alert payloads

- `/api/system-status` aggregates pipeline, quality, prediction, model, and cron state.
- `/api/alerts` emits operational and signal alerts derived from real observations, forecasts, and environment configuration.
