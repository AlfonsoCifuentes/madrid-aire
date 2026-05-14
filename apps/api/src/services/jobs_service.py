def queue_job(job_name: str) -> dict[str, object]:
    if job_name == "ingest-air-quality":
        from src.services.ingest_service import ingest_air_quality_current_day
        result = ingest_air_quality_current_day()
        return {"job": job_name, "status": "completed", **result}

    return {
        "job": job_name,
        "status": "accepted",
        "detail": f"Job '{job_name}' is not yet wired to an execution handler.",
    }
