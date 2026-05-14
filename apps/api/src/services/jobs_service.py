def queue_job(job_name: str) -> dict[str, str]:
    return {
        "job": job_name,
        "status": "accepted",
        "detail": "Execution hooks are scaffolded. Official ETL and prediction jobs will be wired in the next slices.",
    }
