from .detectors import DetectorConfig, detect_events
from .scoring import Event, Severity, score_trip
from .signal_processing import Reading, resample, smooth_readings


def process_trip(readings: list[Reading], distance_miles: float, config: DetectorConfig | None = None) -> dict:
    cleaned = smooth_readings(resample(readings), window=3)
    detected = detect_events(cleaned, config)
    score = score_trip([Event(item.event_type, Severity(item.severity)) for item in detected], distance_miles)
    return {"events": [item.__dict__ for item in detected], **score}
