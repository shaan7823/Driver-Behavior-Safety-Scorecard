from app.signal_processing import Reading, moving_average, resample


def test_moving_average_preserves_length_and_smooths_step():
    assert moving_average([0, 3, 3], 2) == [0, 1.5, 3]


def test_resample_fills_between_two_readings():
    readings = resample([Reading(0, 0), Reading(1, 10)], 0.5)
    assert [round(item.speed_mps, 2) for item in readings] == [0, 5, 10]
