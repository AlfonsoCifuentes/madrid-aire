# MADRID Aire

MADRID Aire is a premium atmospheric intelligence product for Madrid built from the engineering bible in this repository. The current implementation already covers real observations, a real-station map, stations explorer and detail, model-v1 forecasts, operational system status, methodology, and reports without fabricating stations, observations, or forecasts.

## Current status

- `apps/web` contains the landing, dashboard, map, stations explorer, station detail, predictions, model, methodology, system, and reports surfaces.
- `apps/api` exposes lightweight observation, prediction, metrics, alerts, and system endpoints plus protected job routes.
- `data` stores official normalized snapshots and ML artifacts, while `docs` now documents sources, ETL, architecture, MLOps, deployment, and known limitations.

## Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: FastAPI, Pydantic Settings, Cloudflare D1 hooks
- Data and ML: pandas, NumPy, scikit-learn, joblib

## Repository layout

```text
apps/
 api/
 web/
data/
docs/
sql/
MADRID_Aire_ultimate_product_engineering_bible_v6_copilot.md
```

## Product surfaces currently implemented

- `/`
- `/dashboard`
- `/map`
- `/stations`
- `/stations/[id]`
- `/predictions`
- `/model`
- `/methodology`
- `/system`
- `/reports`

## Local start

### Web

```powershell
npm install
npm run dev:web
```

### API

```powershell
Set-Location apps/api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn src.main:app --reload
```

### ML artifact rebuilds

```powershell
pip install -r data/requirements-ml.txt
python data/build_no2_model_v1_artifacts.py
```

### Containerized API

```powershell
docker build -f apps/api/Dockerfile -t madrid-aire-api .
docker run --rm -p 8000:8000 --env-file .env madrid-aire-api
```

## Environment

Copy values from `.env.example` into your local environment before wiring Cloudflare D1 or frontend API calls.

## Rules carried into code

- No synthetic observations, stations, coordinates, or predictions.
- Official data only from documented sources.
- Landing quality must remain premium from the first visual commit.
- ML starts with an honest baseline and temporal validation, and now advances through model v1 with precomputed artifacts.
