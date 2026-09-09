from __future__ import annotations

import csv
import math
import random
from pathlib import Path
from .signal_processing import Reading


def generate_trip(seed: int = 18, seconds: int = 300, sample_rate: float = 5) -> list[Reading]:
    """Create a repeatable trip with braking, cornering, speeding, and idle signals."""
    random.seed(seed)
    readings: list[Reading] = []
    total = int(seconds * sample_rate)
    for index in range(total):
        timestamp = index / sample_rate
        speed = 14 + 8 * math.sin(timestamp / 45) + random.uniform(-0.35, 0.35)
        longitudinal = random.uniform(-0.025, 0.025)
        lateral = random.uniform(-0.025, 0.025)
        if 72 <= timestamp < 74 or 181 <= timestamp < 183:
            longitudinal = -0.42
        if 118 <= timestamp < 120:
            lateral = 0.38
        if 215 <= timestamp < 223:
            speed = 30.0
        if 260 <= timestamp < 326:
            speed = 0.1
        readings.append(Reading(timestamp, max(0, speed), (timestamp * 3) % 360, longitudinal, lateral))
    return readings


def write_csv(path: str | Path, readings: list[Reading]) -> None:
    with Path(path).open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["timestamp", "speed_mps", "heading_deg", "longitudinal_g", "lateral_g"])
        for item in readings:
            writer.writerow([item.timestamp, item.speed_mps, item.heading_deg, item.longitudinal_g, item.lateral_g])
