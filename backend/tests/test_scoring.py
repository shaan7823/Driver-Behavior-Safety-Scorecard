from app.scoring import Event, Severity, score_trip


def test_zero_events_is_perfect_score():
    result = score_trip([], 10)
    assert result["score"] == 100
    assert all(value == 100 for value in result["subscores"].values())


def test_severe_events_reduce_the_matching_category():
    result = score_trip([Event("harsh_braking", Severity.SEVERE)], 10)
    assert result["subscores"]["harsh_braking"] < 100
    assert result["subscores"]["speeding"] == 100


def test_score_is_floored():
    events = [Event("harsh_braking", Severity.SEVERE)] * 100
    assert score_trip(events, 1)["score"] >= 0
