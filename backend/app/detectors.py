from __future__ import annotations

from dataclasses import dataclass
from .signal_processing import Reading


@dataclass(frozen=True)
class DetectorConfig:
    braking_g: float = -0.30
    sharp_turn_g: float = 0.30
    speed_limit_mps: float = 24.5872  # 55 mph
    speeding_margin_mps: float = 2.2352  # 5 mph
    speeding_min_seconds: float = 3.0
    idle_speed_mps: float = 0.5
    idle_min_seconds: float = 60.0


@dataclass(frozen=True)
class DetectedEvent:
    event_type: str
    timestamp: float
    severity: str
    signal: dict[str, float]


def _severity(value: float, threshold: float, severe_ratio: float = 1.5) -> str:
    ratio = abs(value) / abs(threshold)
    return "severe" if ratio >= severe_ratio else "moderate" if ratio >= 1.2 else "mild"


def detect_events(readings: list[Reading], config: DetectorConfig | None = None) -> list[DetectedEvent]:
    config = config or DetectorConfig()
    events: list[DetectedEvent] = []
    speeding_started: float | None = None
    idle_started: float | None = None
    speeding_emitted = False
    idle_emitted = False
    for reading in readings:
        if reading.longitudinal_g <= config.braking_g:
            events.append(DetectedEvent("harsh_braking", reading.timestamp, _severity(reading.longitudinal_g, config.braking_g), {"longitudinal_g": reading.longitudinal_g, "speed_mps": reading.speed_mps}))
        if abs(reading.lateral_g) >= config.sharp_turn_g:
            events.append(DetectedEvent("sharp_turn", reading.timestamp, _severity(reading.lateral_g, config.sharp_turn_g), {"lateral_g": reading.lateral_g, "heading_deg": reading.heading_deg}))
        if reading.speed_mps > config.speed_limit_mps + config.speeding_margin_mps:
            speeding_started = reading.timestamp if speeding_started is None else speeding_started
            if reading.timestamp - speeding_started >= config.speeding_min_seconds and not speeding_emitted:
                events.append(DetectedEvent("speeding", speeding_started, _severity(reading.speed_mps - config.speed_limit_mps, config.speeding_margin_mps), {"speed_mps": reading.speed_mps, "limit_mps": config.speed_limit_mps}))
                speeding_emitted = True
        else:
            speeding_started, speeding_emitted = None, False
        if reading.speed_mps <= config.idle_speed_mps:
            idle_started = reading.timestamp if idle_started is None else idle_started
            if reading.timestamp - idle_started >= config.idle_min_seconds and not idle_emitted:
                events.append(DetectedEvent("idle", idle_started, "moderate", {"duration_seconds": reading.timestamp - idle_started}))
                idle_emitted = True
        else:
            idle_started, idle_emitted = None, False
    return events
