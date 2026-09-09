from app.detectors import DetectorConfig, detect_events
from app.generator import generate_trip
from app.signal_processing import Reading


def test_hard_brake_waveform_triggers_once_per_sample_event():
    readings = [Reading(index, 15, longitudinal_g=-0.42 if index == 2 else 0) for index in range(5)]
    events = detect_events(readings)
    assert len([event for event in events if event.event_type == "harsh_braking"]) == 1
    assert events[0].severity == "moderate"


def test_speeding_requires_sustained_duration():
    readings = [Reading(index, 30) for index in range(5)]
    events = detect_events(readings, DetectorConfig(speeding_min_seconds=3))
    assert [event.event_type for event in events] == ["speeding"]


def test_generated_trip_has_expected_event_families():
    events = detect_events(generate_trip(seconds=340, sample_rate=1))
    assert {event.event_type for event in events} >= {"harsh_braking", "sharp_turn", "speeding", "idle"}
