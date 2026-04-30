# Production deploy bang image prebuilt

Huong nay la huong nen dung cho server production that, dac biet voi VPS yeu.

## Tai sao

- server khong phai build Next.js
- server khong phai build .NET
- giam RAM, disk, thoi gian deploy
- artifact chay tren server da duoc dong goi san

## Quy trinh tong quat

1. Push code len Git
2. CI build va push 2 image:
   - `api`
   - `web`
3. Tren server chi:
   - pull image
   - restart stack

## File su dung

- `docker-compose.server.yml`
- `.env.server`

## 1. Tao file env tren server

```bash
cp .env.server.example .env.server
nano .env.server
```

Mau toi thieu:

```env
DOMAIN=your-domain.com
SITE_URL=https://your-domain.com
API_URL=/api

API_IMAGE=ghcr.io/your-account/django-udemy-clone-api:latest
WEB_IMAGE=ghcr.io/your-account/django-udemy-clone-web:latest

JWT_KEY=mot-secret-rat-dai-it-nhat-32-ky-tu
JWT_ISSUER=UdemyClone.Api
JWT_AUDIENCE=UdemyClone.Web

SEED_DEFAULT_PASSWORD=mot-mat-khau-manh
SEED_ADMIN_EMAIL=admin@your-domain.com
SEED_INSTRUCTOR_EMAIL=instructor@your-domain.com
SEED_USER_EMAIL=user@your-domain.com
```

## 2. Dang nhap registry neu can

Neu dung GHCR:

```bash
echo <GHCR_TOKEN> | docker login ghcr.io -u <GITHUB_USERNAME> --password-stdin
```

Token can quyen doc package.

Neu web image duoc build trong GitHub Actions, hay set repository variable:

- `PROD_SITE_URL=https://your-domain.com`
- `PROD_API_URL=/api`

## 3. Deploy

```bash
docker compose --env-file .env.server -f docker-compose.server.yml pull
docker compose --env-file .env.server -f docker-compose.server.yml up -d
```

## 4. Cap nhat

```bash
docker compose --env-file .env.server -f docker-compose.server.yml pull
docker compose --env-file .env.server -f docker-compose.server.yml up -d
```

## 5. Kiem tra

```bash
docker compose --env-file .env.server -f docker-compose.server.yml ps
docker compose --env-file .env.server -f docker-compose.server.yml logs -f api
docker compose --env-file .env.server -f docker-compose.server.yml logs -f web
docker compose --env-file .env.server -f docker-compose.server.yml logs -f caddy
```

## Ghi chu

- Ban compose nay van dung `Sqlite` de hop voi VPS nho
- Neu sau nay nang cap server, co the doi DB rieng ma khong can doi web path
