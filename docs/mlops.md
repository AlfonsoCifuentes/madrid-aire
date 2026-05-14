# MLOps Notes

## Current model lifecycle

- Training script: `data/build_no2_model_v1_artifacts.py`
- Current predictor: `HistGradientBoostingRegressor` for NO2 24h forecasting.
- Artifact resolution in the API now prefers `no2_model_v1_*` over baseline artifacts.

## Current artifacts

- `no2_model_v1_metrics_*.json`
- `no2_model_v1_predictions_*.csv`
- `no2_model_v1_bundle_*.joblib`

## Current validated run

- Selected predictor: `hist_gradient_boosting_v1`
- Training window: `2025-01-08` to `2025-12-31`
- Test window: `2026-01-01` to `2026-04-29`
- MAE: `7.85`
- RMSE: `11.96`
- R2: `0.426`
- Improvement versus best baseline by MAE: about `5.62%`

## Operational exposure

- `/api/model-metrics` exposes the current metrics artifact.
- `/api/predictions` exposes the current forecast artifact.
- `/api/system-status` and `/api/alerts` surface model readiness and operational issues.

## Current gaps

- No persisted model registry in Supabase yet.
- No station-level error exposed publicly.
- No weekly or longitudinal evaluation history stored yet.
- Weather features and richer feature stores are not integrated yet.
