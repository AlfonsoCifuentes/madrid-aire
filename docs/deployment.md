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

- `MADRID_AIRE_CLOUDFLARE_ACCOUNT_ID`
- `MADRID_AIRE_CLOUDFLARE_D1_DATABASE_ID`
- `MADRID_AIRE_CLOUDFLARE_API_TOKEN`
- `MADRID_AIRE_JOB_SECRET`
- `MADRID_AIRE_LOCAL_NORMALIZED_OBSERVATIONS_FILE`
- `MADRID_AIRE_LOCAL_MODEL_METRICS_FILE`
- `MADRID_AIRE_LOCAL_PREDICTIONS_FILE`
- `MADRID_AIRE_LOCAL_STATION_METADATA_FILE`

## Recommended production split

- Frontend: Vercel-hosted Next.js surface.
- API-light layer: lightweight FastAPI service deployed from `apps/api/Dockerfile`.
- Data and long-lived state: Cloudflare D1 free tier.
- Cron remains environment-specific and can stay manual/protected until Cloudflare scheduled execution is needed.

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

## Cloudflare D1 bootstrap

1. Create a D1 database in Cloudflare on the free tier.
2. Generate an API token with `D1 Read` and `D1 Write` permissions.
3. Apply the schema in `sql/schema.sql` with Wrangler or the dashboard SQL console.

Example with Wrangler:

```powershell
npx wrangler d1 execute <database-name> --remote --file sql/schema.sql
```

The repository now also includes `wrangler.toml` bound to `madrid-aire-prod` and a seeding script for the current official local bundle:

```powershell
python data/seed_cloudflare_d1.py
```

The `air_quality_observations` table now uses a compact free-tier layout: composite primary key, `WITHOUT ROWID`, and integer-coded `source`/`risk` fields. With that schema the full official bundle of `2,052,744` rows fits in the current D1 database at roughly `317 MB`.

If you are rebuilding an older wide observation table, recreate it in compact form before reseeding:

```powershell
python data/seed_cloudflare_d1.py --skip-stations --rebuild-observations-table
```

If the import is interrupted, resume from the current D1 row count:

```powershell
npx wrangler d1 execute madrid-aire-prod --remote --command "SELECT COUNT(*) AS observation_count FROM air_quality_observations;"
python data/seed_cloudflare_d1.py --skip-stations --observation-start-offset <current-count>
```

Then set these variables in the API runtime:

- `MADRID_AIRE_CLOUDFLARE_ACCOUNT_ID`
- `MADRID_AIRE_CLOUDFLARE_D1_DATABASE_ID`
- `MADRID_AIRE_CLOUDFLARE_API_TOKEN`

For the current Vercel API deployment, the non-interactive CLI flow is:

```powershell
vercel env add MADRID_AIRE_CLOUDFLARE_ACCOUNT_ID production --value "<cloudflare-account-id>" --yes
vercel env add MADRID_AIRE_CLOUDFLARE_D1_DATABASE_ID production --value "<cloudflare-d1-database-id>" --yes
vercel env add MADRID_AIRE_CLOUDFLARE_API_TOKEN production --value "<cloudflare-api-token>" --yes
vercel deploy --prod --yes
```

Cloudflare API token path:

- Dashboard: `My Profile` -> `API Tokens` -> `Create Token`.
- Template: use `Create Custom Token`.
- Permissions: account-scoped `D1 Read` and `D1 Write` are sufficient for this project.
- Scope: limit the token to the working account.

## ML and artifact refresh

- Production observations and station metadata now run from Cloudflare D1.
- Protected job endpoints exist, but cron orchestration remains environment-specific.
- Rebuild artifacts outside the API runtime with `pip install -r data/requirements-ml.txt` followed by the data scripts in `data/`.
- Cloudflare D1 is the active persistence layer for production observations on the free tier, while model artifacts, predictions, and other fallbacks remain local-first where tables are not populated yet.
