# Production Deploy (Senior Baseline)

This is a **provider-agnostic** production baseline: Docker images + managed Postgres + reverse proxy with HTTPS.

## Render + Neon (recommended free/low-cost)
### 1) Create Neon Postgres
- Create a project in Neon and copy the **connection string** from the dashboard. citeturn2view0
- Keep the string as `DATABASE_URL` (Neon includes required SSL settings in its default connection string). citeturn2view0

### 2) Deploy to Render
Use the `render.yaml` blueprint (Docker services). Render supports Docker-based services with environment variables defined in `render.yaml`. citeturn3view1turn1view2

In Render:
1. Create a new Blueprint from your repo.
2. Fill in secret env vars marked `sync: false` (Render will prompt). citeturn3view1turn1view2
3. Set:
   - `DATABASE_URL` = Neon connection string
   - `Frontend__BaseUrl` + `Cors__Origins__0` = your web domain
   - `NEXT_PUBLIC_API_URL` = your API URL on Render (or custom domain)
   - `NEXT_PUBLIC_SITE_URL` = your web domain

### 3) Verify
- Web: `https://your-web.onrender.com`
- API health: `https://your-api.onrender.com/health`

## 1) Create a managed Postgres (free tier is OK)
Use any managed Postgres provider and copy the connection string.

## 2) Build & push images
```bash
# from repo root
docker build -f apps/api/Dockerfile -t your-registry/udemyclone-api:latest .
docker build -f apps/web/Dockerfile -t your-registry/udemyclone-web:latest .

docker push your-registry/udemyclone-api:latest
docker push your-registry/udemyclone-web:latest
```

## 3) Prepare env
Copy `.env.prod.example` to `.env.prod` and fill in:
- `DOMAIN`
- `SITE_URL`
- `API_URL`
- `POSTGRES_URL`
- `JWT_KEY`
- image names

## 4) Run on server
```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d
```

## 5) Smoke check
- Web: `https://your-domain`
- API: `https://your-domain/health`

## Notes
- This compose uses **Caddy** for HTTPS.
- Postgres is managed (recommended) so no DB container is included.
- This repo includes **Postgres-specific migrations** (context: `PostgresApplicationDbContext`).
