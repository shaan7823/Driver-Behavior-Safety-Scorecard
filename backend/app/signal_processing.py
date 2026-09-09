from __future__ import annotations

from dataclasses import dataclass
import math


@dataclass(frozen=True)
class Reading:
    timestamp: float
    speed_mps: float
    heading_deg: float = 0.0
    longitudinal_g: float = 0.0
    lateral_g: float = 0.0


def moving_average(values: list[float], window: int = 3) -> list[float]:
    """Causal moving average that preserves the input length."""
    if window < 1:
        raise ValueError("window must be positive")
    result: list[float] = []
    for index in range(len(values)):
        start = max(0, index - window + 1)
        bucket = values[start : index + 1]
        result.append(sum(bucket) / len(bucket))
    return result


def resample(readings: list[Reading], interval_seconds: float = 0.2) -> list[Reading]:
    """Linearly resample readings to a fixed interval and fill small gaps."""
    if not readings:
        return []
    ordered = sorted(readings, key=lambda item: item.timestamp)
    start, end = ordered[0].timestamp, ordered[-1].timestamp
    output: list[Reading] = []
    cursor = start
    source_index = 0
    while cursor <= end + 1e-9:
        while source_index + 1 < len(ordered) and ordered[source_index + 1].timestamp < cursor:
            source_index += 1
        left = ordered[source_index]
        right = ordered[min(source_index + 1, len(ordered) - 1)]
        span = right.timestamp - left.timestamp
        ratio = 0.0 if span <= 0 else min(1.0, max(0.0, (cursor - left.timestamp) / span))
        interpolate = lambda first, second: first + (second - first) * ratio
        output.append(Reading(cursor, max(0.0, interpolate(left.speed_mps, right.speed_mps)), interpolate(left.heading_deg, right.heading_deg), interpolate(left.longitudinal_g, right.longitudinal_g), interpolate(left.lateral_g, right.lateral_g)))
        cursor += interval_seconds
    return output


def smooth_readings(readings: list[Reading], window: int = 3) -> list[Reading]:
    if not readings:
        return []
    speeds = moving_average([item.speed_mps for item in readings], window)
    longitudinal = moving_average([item.longitudinal_g for item in readings], window)
    lateral = moving_average([item.lateral_g for item in readings], window)
    return [Reading(item.timestamp, speeds[index], item.heading_deg, longitudinal[index], lateral[index]) for index, item in enumerate(readings)]
