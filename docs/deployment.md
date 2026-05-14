# Deployment Notes

The repository now has a concrete deployment split:

- `apps/web`: Next.js frontend, suitable for Vercel with project root `apps/web`.
- `apps/api`: lightweight FastAPI service, suitable for any container host using `apps/api/Dockerfile`.
- `data/` and `sql/`: official-data cache, ML artifacts, and schema assets mounted into the API image at build time.

## Local development

### Frontend

```powershell
npm install
npm run dev:web
```

### API

```powershell
e:/Proyectos/VisualStudio/Alfon_personal/madrid_aire/.venv/Scripts/python.exe -m uvicorn src.main:app --app-dir e:/Proyectos/VisualStudio/Alfon_personal/madrid_aire/apps/api --host 127.0.0.1 --port 8000
```

## Environment variables

- `MADRID_AIRE_SUPABASE_URL`
- `MADRID_AIRE_SUPABASE_KEY`
- `MADRID_AIRE_JOB_SECRET`
- `MADRID_AIRE_LOCAL_NORMALIZED_OBSERVATIONS_FILE`
- `MADRID_AIRE_LOCAL_MODEL_METRICS_FILE`
- `MADRID_AIRE_LOCAL_PREDICTIONS_FILE`
- `MADRID_AIRE_LOCAL_STATION_METADATA_FILE`

## Recommended production split

- Frontend: Vercel-hosted Next.js surface.
- API-light layer: lightweight FastAPI service deployed from `apps/api/Dockerfile`.
- Data, storage, cron, and long-lived state: Supabase.

## Frontend deployment

1. Create a Vercel project with root directory `apps/web`.
2. Set `NEXT_PUBLIC_API_BASE_URL` to the public URL of the deployed API.
3. Deploy with the default Next.js build command.

## API deployment

Build the image from repository root:

```powershell
docker build -f apps/api/Dockerfile -t madrid-aire-api .
```

Run locally or in a container host:

```powershell
docker run --rm -p 8000:8000 --env-file .env madrid-aire-api
```

The Docker image preserves the repository layout expected by `src.settings`, so the local-first artifact readers continue to resolve `data/` and `sql/` correctly.

## ML and artifact refresh

- The working product still runs in local-first mode.
- Protected job endpoints exist, but cron orchestration remains environment-specific.
- Rebuild artifacts outside the API runtime with `pip install -r data/requirements-ml.txt` followed by the data scripts in `data/`.
- Supabase remains the target persistence layer for production state, but the current repository now has a concrete deployable split for the frontend and API surfaces.
