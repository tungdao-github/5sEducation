# Django Udemy Clone

Repo hien tai duoc to chuc theo huong:

- Frontend Next.js: `apps/web`
- Backend ASP.NET Core API: `apps/api`

## Chay nhanh

Tai root repo, dung cac lenh sau:

```bash
npm run dev
npm run build
```

Backend `apps/api` hien ho tro 3 SQL providers theo cau hinh:

- `Sqlite`: mac dinh cho local/test nhanh
- `SqlServer`: phu hop khi ban dang chay SQL Server local/on-prem
- `Postgres`: uu tien cho Docker va production

Khai bao bang `DbProvider` va `ConnectionStrings:*` hoac `DATABASE_URL` voi Postgres.

Root `package.json` chi dong vai tro dieu huong sang `apps/web` de ban khong can nho them mot frontend cu nao nua.

## Frontend chinh

Frontend dang duoc su dung la:

```text
apps/web
```

Toan bo giao dien Vite cu da duoc migrate vao Next.js va cac phan duplicate/legacy dang duoc don dan.

## Tai khoan mau

- Admin: `tungdv14112003@gmail.com`
- Instructor: `tungdaouploaddrive@gmail.com`

## Deploy production tren Ubuntu 24.04

Huong nay la huong dung voi repo hien tai vi no tan dung dung nhung gi da co san:

- `apps/api/Dockerfile`
- `apps/web/Dockerfile`
- `Caddyfile`
- Postgres support trong `apps/api`

Neu VPS cua ban rat yeu, dung ban compose nhe hon:

- [docs/deploy-ubuntu-24-lite.md](/C:/Users/TUNG/django-udemy-clone/docs/deploy-ubuntu-24-lite.md)
- `docker-compose.linux-lite.yml`
- [docs/deploy-production-images.md](/C:/Users/TUNG/django-udemy-clone/docs/deploy-production-images.md)
- `docker-compose.server.yml`

Ban nay toi uu cho may tam muc:

- `1 vCPU`
- `1 GB RAM`
- `disk 10 GB`

No dung `Sqlite` thay vi `Postgres` local de giam RAM va disk.
Neu muon dat muc production dung nghia, hay build image o CI/CD roi tren server chi `pull + up`.

### 1. Cai Docker va Docker Compose plugin

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
```

### 2. Tao file env production

```bash
cp .env.prod.example .env.prod
```

Sua it nhat cac gia tri nay trong `.env.prod`:

- `DOMAIN`
- `SITE_URL`
- `API_URL`
- `JWT_KEY`
- `POSTGRES_PASSWORD`
- `SEED_DEFAULT_PASSWORD`

Luu y:

- `SITE_URL` va `API_URL` nen cung la domain public cua ban, vi Caddy dang route `/api/*` vao backend.
- `POSTGRES_URL` mac dinh da tro vao service `postgres` trong `docker-compose.prod.yml`, khong can doi neu dung Postgres container.

### 3. Chay production stack

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
```

### 4. Kiem tra

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml ps
docker compose --env-file .env.prod -f docker-compose.prod.yml logs -f api
docker compose --env-file .env.prod -f docker-compose.prod.yml logs -f web
curl -I https://your-domain.com/health
```

### 5. Update khi co code moi

```bash
git pull
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
```

### Ghi chu quan trong

- Khong commit `.env.prod`.
- Khong de API key, JWT key, password trong source code.
- Neu ban da lo `OPENAI_API_KEY` hoac secret bat ky, hay rotate ngay.
