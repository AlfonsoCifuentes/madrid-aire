# MADRID Aire Model Card v1.0

## Model name

NO2 24h HistGradientBoostingRegressor v1

## Version

v1.0-local-hgbr

## Target

Hourly NO2 value 24 hours ahead.

## Horizon

24 hours.

## Training period

2025-01-08 to 2025-12-31.

## Validation period

Not available in this local slice because available yearly coverage leads to a train/test split with 2025 as train and 2026 as test.

## Test period

2026-01-01 to 2026-04-29.

## Features

- Station-level hourly NO2 observations.
- Station code.
- Hour, day of week, month, weekend flag.
- Current NO2 value.
- Lag values at 1h, 3h, 6h, 24h and 168h.
- Rolling means at 3h, 6h and 24h.

## Baselines

- Persistence.
- Same hour yesterday.

## Metrics

- HistGradientBoostingRegressor v1: MAE 7.85, RMSE 11.96, R2 0.426.
- Persistence: MAE 8.32, RMSE 14.07, R2 0.205.
- Same hour yesterday: MAE 9.92, RMSE 16.26, R2 -0.062.
- Improvement vs best baseline by MAE: 5.62%.

## Selected predictor

HistGradientBoostingRegressor v1.

## Data coverage used in this slice

- Official historical CSV 2025 from Comunidad de Madrid.
- Official historical CSV 2026 from Comunidad de Madrid.
- Official current-day CSV 2026-05-13 from Comunidad de Madrid.

## Known limitations

- Station-level error is computed in the artifact, but the public API still exposes only global model metrics.
- Production observations are now served from Cloudflare D1; model artifacts are still not persisted to Cloudflare D1 tables.
- Weather features are not yet integrated into v1.
- Predictions are precomputed locally and not yet persisted in Cloudflare D1.

## Disclaimer

This is not an official forecast. It is a precomputed internal baseline reference for product and ML evaluation.
