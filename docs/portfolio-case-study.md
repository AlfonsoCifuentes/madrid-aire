# Portfolio Case Study

## Problem

Madrid exposes rich official air-quality data, but turning that raw material into a premium product requires more than charts: provenance, design discipline, model honesty, and operational transparency all need to be visible.

## Constraints

- Official data only.
- No fabricated observations or stations.
- No fake model readiness.
- No frontend-side forecasting.

## What this implementation demonstrates

- A premium Next.js interface with a strong editorial visual language.
- A lightweight FastAPI backend exposing operational and analytical slices.
- pandas and NumPy ETL over official CSV exports.
- Honest ML progression from baseline logic to `HistGradientBoostingRegressor` model v1.
- Clear system, methodology, and reporting surfaces instead of hiding technical reality.

## Current outcome

The product now ships real dashboard, map, stations, predictions, model, methodology, system, and reports pages backed by official local data and precomputed ML artifacts.

## Next milestones

- Persist runs, artifacts, and reports in Supabase.
- Add weather-aware model features.
- Expose station-level model error and longitudinal model reporting.
