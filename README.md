# Drivewise Safety Scorecard

A product-style driving safety dashboard built with Next.js, React, TypeScript, and a FastAPI-ready scoring contract.

## Run the dashboard

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The first screen is populated with a representative demo trip so the product never opens to an empty state. Upload controls are ready for CSV/JSON replay input and Live mode exposes the browser sensor capture affordance.

## Scoring model

The demo score starts from 100 and deducts normalized weighted event costs. Hard braking is weighted 1.25, sharp turns 1.0, speeding 1.1, and idle 0.6. Severity multipliers are mild 0.6, moderate 1.0, and severe 1.6. The trip score is normalized per 10 miles and floored at 0. Production processing belongs in `backend/app` and should return the same event shape consumed by the dashboard.

## Product notes

The experience prioritizes a calm first-glance summary: score, trend, route, events, and two next-best habits. The demo data includes two hard brakes, one sharp turn, and one sustained speeding event. The map is intentionally dependency-free in the first UI pass; the backend contract is designed for replacing it with Leaflet route tiles.
