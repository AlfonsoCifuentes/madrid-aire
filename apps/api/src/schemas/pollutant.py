from pydantic import BaseModel


class PollutantSummary(BaseModel):
    code: str
    label: str
    color: str


class PollutantCollection(BaseModel):
    items: list[PollutantSummary]
