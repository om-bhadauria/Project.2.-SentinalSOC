# SentinelSOC Deployment Checklist

## Fast Docker Deployment

1. Create production-like environment values:

```bash
cp .env.example .env
```

Edit `.env` and replace the demo passwords/secrets before exposing the app.

2. Build and start the full stack:

```bash
docker compose up --build -d
```

3. Open the app:

```text
Frontend: http://localhost:3000
Backend health: http://localhost:4000/health
Frontend health: http://localhost:3000/healthz
```

The frontend container proxies `/api/*` to the backend container, so browser traffic can stay on `http://localhost:3000`.

## Required Production Values

```env
POSTGRES_USER=socadmin
POSTGRES_PASSWORD=replace-with-a-strong-password
POSTGRES_DB=sentinelsoc

JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters
DEMO_ADMIN_EMAIL=admin@sentinel.soc
DEMO_ADMIN_PASS=replace-with-a-strong-temporary-password
VT_API_KEY=
```

## Manual Service Deployment

Backend:

```bash
cd backend
npm ci
npm start
```

Frontend:

```bash
cd frontend
npm ci
npm run build
```

Set `VITE_API_URL` only when the frontend is not served behind the included nginx proxy:

```env
VITE_API_URL=https://your-backend-domain.com/api
```

## Cloud Notes

- Use managed Postgres, Redis, and MongoDB when deploying outside Docker.
- Set `DATABASE_URL`, `REDIS_URL`, `MONGO_URI`, `JWT_SECRET`, and `CORS_ORIGIN` in the backend runtime environment.
- Keep `INIT_DB=true` for first deployment so the backend initializes `scan_jobs` and `alerts`; after that it can stay true because the SQL is idempotent.
- Do not expose the demo admin password publicly. Rotate it immediately after first login or replace the demo auth store with a real identity provider.

