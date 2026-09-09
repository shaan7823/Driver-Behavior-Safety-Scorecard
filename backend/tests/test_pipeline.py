from app.generator import generate_trip
from app.pipeline import process_trip


def test_demo_pipeline_returns_bounded_score_and_events():
    result = process_trip(generate_trip(seconds=340, sample_rate=1), 38.4)
    assert 0 <= result["score"] <= 100
    assert result["events"]
    assert set(result["subscores"]) == {"harsh_braking", "sharp_turn", "speeding", "idle"}
