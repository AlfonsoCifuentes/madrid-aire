from datetime import datetime

from pydantic import BaseModel


class EnvelopeMeta(BaseModel):
    source: str
    local_file: str | None = None


class TimestampedRecord(BaseModel):
    measured_at: datetime
