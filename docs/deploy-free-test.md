# Free Test Deploy (Senior-Ready Baseline)

This setup is for **free/low-cost testing** with production-like settings. It is not meant for high traffic. Use it to validate the flow end-to-end.

## What you get
- Dockerized API + Web
- Health endpoints (`/health`, `/ready`)
- Production-like environment variables
- SQLite for free test (fastest local)
- Optional Postgres free test (closer to production)

## Run locally
```bash
# from repo root
docker compose -f docker-compose.free-test.yml up --build
```

- Web: http://localhost:3000
- API: http://localhost:5158
- Health: http://localhost:5158/health

### Postgres free test (recommended for online-like behavior)
```bash
# from repo root
docker compose -f docker-compose.free-test-postgres.yml up --build
```

## Deploy online (provider-agnostic)
1. Build & push images to your container registry (GitHub Container Registry / Docker Hub):
```bash
# API
docker build -f apps/api/Dockerfile -t your-registry/udemyclone-api:free-test .
docker push your-registry/udemyclone-api:free-test

# WEB
docker build -f apps/web/Dockerfile -t your-registry/udemyclone-web:free-test .
docker push your-registry/udemyclone-web:free-test
```

2. On any Docker host, run containers with the same environment variables from `docker-compose.free-test.yml`.

## Before going online
- Replace `Jwt__Key` with a strong secret
- Update `Frontend__BaseUrl` and `Cors__Origins__0` to your real domain
- For production, move to managed DB (Azure SQL / Postgres / MySQL)

## Notes
- Free tiers usually sleep and have hard limits
- This config keeps **prod-like** settings for realistic testing
