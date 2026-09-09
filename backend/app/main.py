from fastapi import FastAPI
from pydantic import BaseModel, Field
from .scoring import Event, Severity, score_trip
from .pipeline import process_trip
from .signal_processing import Reading

app = FastAPI(title="Drivewise Safety API", version="1.0.0")


class EventInput(BaseModel):
    event_type: str
    severity: Severity


class ScoreRequest(BaseModel):
    distance_miles: float = Field(gt=0)
    events: list[EventInput] = []


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/trips/score")
def calculate_score(request: ScoreRequest) -> dict:
    events = [Event(event_type=item.event_type, severity=item.severity) for item in request.events]
    return score_trip(events, request.distance_miles)


class ReadingInput(BaseModel):
    timestamp: float
    speed_mps: float
    heading_deg: float = 0.0
    longitudinal_g: float = 0.0
    lateral_g: float = 0.0


class ProcessRequest(BaseModel):
    distance_miles: float = Field(gt=0)
    readings: list[ReadingInput]


@app.post("/trips/process")
def process(request: ProcessRequest) -> dict:
    readings = [Reading(**item.model_dump()) for item in request.readings]
    return process_trip(readings, request.distance_miles)
