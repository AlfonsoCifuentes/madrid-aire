# MADRID Aire API

The API is intentionally lightweight. It exposes read endpoints for the frontend and protected job endpoints for ingestion, aggregation, and prediction generation.

## Runtime install

```powershell
pip install -r requirements.txt
uvicorn src.main:app --reload
```

## Container deployment

The repository now includes `apps/api/Dockerfile`, which packages the current FastAPI layer without the model-training dependencies. Build from the repository root so the container can access the local-first `data/` and `sql/` folders:

```powershell
docker build -f apps/api/Dockerfile -t madrid-aire-api .
docker run --rm -p 8000:8000 --env-file .env madrid-aire-api
```
