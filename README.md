# Manufacturing Management Backend (Scaffold)

Initial scaffold including:
- Express server with health (`/health`) and metrics (`/metrics`).
- PostgreSQL migration script and base manufacturing schema.
- Winston logging, request ID & timing metrics.

## Getting Started

1. Copy `.env.example` to `.env` and adjust.
2. Install deps:
```
npm install
```
3. Run migrations:
```
npm run migrate
```
4. Start dev server:
```
npm run dev
```

## Next Steps
- Implement authentication & roles.
- CRUD for products, BOMs, manufacturing and work orders.
- Stock movements logic and ledger updates.
- Validation & error normalization.

## Health Check
`GET /health` -> `{ status: "ok", time: "..." }`

## Metrics
Prometheus format at `GET /metrics`.
