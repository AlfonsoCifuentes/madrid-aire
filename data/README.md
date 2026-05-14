# Data workspace

This directory will hold official data downloaders, reproducible ETL scripts, and real cached snapshots.

Rules:

- No mock data.
- Cached samples must come from official sources.
- Sample names must follow the `sample_real` convention from the bible.

Install the model-training stack separately from the FastAPI runtime with `pip install -r data/requirements-ml.txt` when rebuilding artifacts locally.
