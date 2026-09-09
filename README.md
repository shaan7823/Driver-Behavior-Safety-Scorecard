# Drivewise Driver Behavior & Safety Scorecard

Drivewise is a driving-safety dashboard prototype that turns trip readings into a safety score. It focuses on four behaviors: harsh braking, sharp turns, sustained speeding, and long idle periods.

The project contains a Next.js dashboard and a FastAPI processing service. The dashboard opens with a populated demo trip for **Muhammed Shaan**, while the backend exposes a reusable signal-processing, event-detection, and scoring pipeline.

## Current Status

Implemented:

- Responsive dashboard UI for a demo trip
- 0-100 composite safety score
- Braking, cornering, speeding, and idling sub-scores
- Mild, moderate, and severe event levels
- Fixed-interval resampling and moving-average smoothing
- Configurable detector thresholds through `DetectorConfig`
- Synthetic trip generator with embedded unsafe-driving events
- FastAPI health, direct scoring, and full processing endpoints
- Unit and end-to-end test files for the Python modules
- README and Git ignore configuration

Prototype or planned integrations:

- Browser `DeviceMotionEvent`, `DeviceOrientationEvent`, and Geolocation capture
- Functional CSV/JSON upload parsing
- PostgreSQL, SQLAlchemy, and Alembic persistence
- Leaflet or Mapbox route maps
- Recharts interactive charts
- User authentication and multi-user trip history
- Insurance risk tiers, peer comparison, and weekly aggregation

## Technology Stack

### Frontend

- Next.js 15
- React 19
- TypeScript
- CSS with responsive media queries
- Lucide React icons

The dashboard currently uses CSS, SVG, and deterministic demo values for its route and signal visuals. The upload control and Live Mode control are present as product affordances, but their browser data integrations are not connected yet.

### Backend

- FastAPI
- Pydantic request validation
- Python dataclasses
- Pytest test suite

The backend is separated into small modules:

```text
backend/
	app/
		detectors.py          Event thresholds and event detection
		generator.py          Repeatable synthetic trip data
		main.py               FastAPI application and request models
		pipeline.py           End-to-end processing orchestration
		scoring.py            Pure scoring function
		signal_processing.py  Reading model, resampling, smoothing
	tests/                  Unit and integration-style tests
```

## Project Structure

```text
.
├── app/
│   ├── globals.css       Dashboard styling and responsive layout
│   ├── layout.tsx        Metadata and global CSS entry point
│   └── page.tsx          Main dashboard experience
├── backend/
│   ├── app/
│   ├── tests/
│   └── requirements.txt
├── .gitignore
├── package.json
├── package-lock.json
├── next-env.d.ts
├── tsconfig.json
└── README.md
```

Generated directories such as `node_modules`, `.next`, `.venv`, Python caches, and environment files are excluded by `.gitignore`.

## Run the Frontend

From the project root:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

For a production build:

```bash
npm run build
npm run start
```

On Windows, if the shell has trouble resolving the `&` in the workspace folder name, invoke Next directly:

```powershell
node .\node_modules\next\dist\bin\next dev
node .\node_modules\next\dist\bin\next build
```

## Run the Backend

Install the Python dependencies:

```bash
python -m pip install -r backend/requirements.txt
```

Start FastAPI with Uvicorn from the project root:

```bash
python -m uvicorn backend.app.main:app --reload
```

The API runs at `http://localhost:8000`. Interactive documentation is available at `http://localhost:8000/docs`.

## Processing Pipeline

```text
Trip readings
		↓
Sort by timestamp
		↓
Resample to fixed intervals
		↓
Apply moving-average smoothing
		↓
Detect braking, turns, speeding, and idling
		↓
Assign event severity and preserve signal details
		↓
Calculate category subscores
		↓
Return the overall safety score
```

This orchestration is implemented in `backend/app/pipeline.py`.

### Reading format

The current backend accepts:

```json
{
	"timestamp": 0.0,
	"speed_mps": 14.5,
	"heading_deg": 90.0,
	"longitudinal_g": 0.02,
	"lateral_g": 0.01
}
```

The prototype uses already-derived longitudinal and lateral acceleration. A production sensor adapter would derive these values from raw accelerometer and gyroscope axes and would additionally carry latitude and longitude.

## Signal Processing

### Resampling

Sensor readings may arrive at irregular intervals. `resample()` creates readings at a fixed interval of 0.2 seconds, or 5 readings per second, and linearly interpolates values between neighboring readings.

### Smoothing

`moving_average()` applies a causal moving average to reduce isolated noise spikes. The end-to-end pipeline uses a window of 3 readings for speed and acceleration values.

The moving average was chosen because it is simple, deterministic, inexpensive, and easy to test. A production version could replace it with an exponential smoother or Kalman filter after comparing accuracy against real sensor traces.

## Event Detection

Default thresholds live in `DetectorConfig` in `backend/app/detectors.py`.

| Event | Default rule |
| --- | --- |
| Harsh braking | Longitudinal acceleration `<= -0.30 g` |
| Sharp turn | Absolute lateral acceleration `>= 0.30 g` |
| Speeding | Above 55 mph plus a 5 mph margin for at least 3 seconds |
| Idle | Speed `<= 0.5 m/s` for at least 60 seconds |

Severity is based on event magnitude relative to its threshold:

- Mild: threshold reached
- Moderate: at least 1.2 times the threshold
- Severe: at least 1.5 times the threshold

Every detected event includes an event type, timestamp, severity, and raw signal details:

```json
{
	"event_type": "harsh_braking",
	"timestamp": 72.0,
	"severity": "moderate",
	"signal": {
		"longitudinal_g": -0.42,
		"speed_mps": 14.0
	}
}
```

Speeding and idle events are sustained conditions. A single noisy speed sample does not create an event.

## Scoring Model

The scoring function in `backend/app/scoring.py` is pure and independent from FastAPI and the dashboard.

Event weights:

```text
Harsh braking: 1.25
Sharp turns:   1.00
Speeding:      1.10
Idle time:     0.60
```

Severity multipliers:

```text
Mild:      0.6
Moderate:  1.0
Severe:    1.6
```

For every event:

```text
event deduction = event weight × severity multiplier × (10 / trip distance in miles)
```

Each category starts at 100 and is reduced by eight times its accumulated deduction:

```text
category subscore = max(0, 100 - 8 × category deduction)
```

The overall score is the rounded average of the four category subscores and is always bounded between 0 and 100. Normalizing by trip distance prevents longer trips from being penalized only because they contain more sensor samples.

This is a documented starting model. Real-world calibration should use labeled trips and safety outcomes before the score is used for insurance or other high-impact decisions.

## API Reference

### Health check

```http
GET /health
```

Response:

```json
{"status": "ok"}
```

### Score existing events

```http
POST /trips/score
Content-Type: application/json
```

Request:

```json
{
	"distance_miles": 10,
	"events": [
		{"event_type": "harsh_braking", "severity": "moderate"},
		{"event_type": "speeding", "severity": "mild"}
	]
}
```

### Process raw derived readings

```http
POST /trips/process
Content-Type: application/json
```

Request:

```json
{
	"distance_miles": 38.4,
	"readings": [
		{
			"timestamp": 0,
			"speed_mps": 14,
			"heading_deg": 90,
			"longitudinal_g": 0,
			"lateral_g": 0
		},
		{
			"timestamp": 1,
			"speed_mps": 13,
			"heading_deg": 91,
			"longitudinal_g": -0.42,
			"lateral_g": 0
		}
	]
}
```

The response contains `events`, `score`, `subscores`, and raw `deductions`.

## Synthetic Data

`backend/app/generator.py` provides `generate_trip()` for repeatable test and demo data. It creates normal driving with embedded two braking sections, one sharp-turn section, one speeding section, and one long idle section.

Example:

```python
from backend.app.generator import generate_trip, write_csv

readings = generate_trip(seed=18, seconds=340, sample_rate=1)
write_csv("demo-trip.csv", readings)
```

Generated CSV columns:

```text
timestamp,speed_mps,heading_deg,longitudinal_g,lateral_g
```

## Testing

Run the Python tests with:

```bash
python -m pytest backend/tests -q
```

Coverage includes moving-average behavior, resampling, hard-braking detection, sustained-speeding duration, synthetic trip event families, perfect-score behavior, category deductions, score flooring, and the complete pipeline.

## Dashboard Features

The current UI includes a safety score ring, score change, trip statistics, safe streak, speed signal timeline, route overview, event list, personalized habits, trend strip, upload-trip control, live-capture toggle affordance, and responsive mobile layout.

The dashboard currently renders representative demo values so it remains useful before a database and ingestion service are connected.

## Roadmap

### Data ingestion

1. Parse CSV and JSON uploads in the browser.
2. Validate and normalize the uploaded schema.
3. Send readings to `/trips/process`.
4. Replace demo dashboard values with the API response.

### Live sensors

1. Request browser motion and orientation permissions.
2. Capture `DeviceMotionEvent` and `DeviceOrientationEvent` readings.
3. Capture GPS through `navigator.geolocation`.
4. Convert device axes into vehicle longitudinal and lateral acceleration.
5. Stream or batch readings to the backend.

### Persistence and history

1. Add PostgreSQL and SQLAlchemy async models.
2. Add Alembic migrations for users, trips, readings, events, and scores.
3. Implement stored trip history and trip-detail endpoints.
4. Connect the History and Trends navigation to real API data.

### Stretch features

- Risk tier based on rolling multi-trip statistics
- Percentile comparison against synthetic or anonymized peers
- Weekly category trends and narrative summaries
- Leaflet or Mapbox route rendering
- Recharts-based interactive signal and trend charts
- Frontend component tests with Vitest and React Testing Library

## Important Product Notes

This is a safety-feedback prototype, not a certified vehicle safety system. Phone sensors can be affected by device placement, orientation, road quality, GPS error, and missing data. Thresholds and score weights must be validated with representative labeled trips before being used for insurance pricing, employment decisions, or other consequential decisions.

## Repository

GitHub: https://github.com/shaan7823/Driver-Behavior-Safety-Scorecard
