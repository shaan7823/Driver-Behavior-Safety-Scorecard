from dataclasses import dataclass
from enum import Enum


class Severity(str, Enum):
    MILD = "mild"
    MODERATE = "moderate"
    SEVERE = "severe"


@dataclass(frozen=True)
class Event:
    event_type: str
    severity: Severity


WEIGHTS = {"harsh_braking": 1.25, "sharp_turn": 1.0, "speeding": 1.1, "idle": 0.6}
SEVERITY_MULTIPLIERS = {Severity.MILD: 0.6, Severity.MODERATE: 1.0, Severity.SEVERE: 1.6}


def score_trip(events: list[Event], distance_miles: float) -> dict:
    """Return a 0-100 score and category subscores, normalized per ten miles."""
    safe_distance = max(distance_miles, 0.1)
    factor = 10 / safe_distance
    deductions = {event_type: 0.0 for event_type in WEIGHTS}
    for event in events:
        if event.event_type in deductions:
            deductions[event.event_type] += WEIGHTS[event.event_type] * SEVERITY_MULTIPLIERS[event.severity] * factor
    subscores = {key: max(0, round(100 - value * 8, 1)) for key, value in deductions.items()}
    score = max(0, round(sum(subscores.values()) / len(subscores)))
    return {"score": score, "subscores": subscores, "deductions": deductions}
