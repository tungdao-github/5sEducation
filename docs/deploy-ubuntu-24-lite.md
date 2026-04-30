# Deploy tren Ubuntu 24.04 VPS nho

Tai lieu nay dung cho may rat yeu nhu:

- `1 vCPU`
- `1 GB RAM`
- `disk 10 GB`
- con trong duoi `1 GB`

Muc tieu cua cau hinh nay la uu tien **song on dinh** hon la day du tinh nang ha tang.

> Neu ban muon deploy theo chuan production hon, hay uu tien huong [deploy-production-images.md](/C:/Users/TUNG/django-udemy-clone/docs/deploy-production-images.md) de server chi keo image da build san.

## Chien luoc

- Dung `docker-compose.linux-lite.yml`
- Bo Postgres local, chuyen sang `Sqlite` de giam RAM va disk
- Giu 3 container: `api`, `web`, `caddy`
- Luu file database Sqlite va uploads bang Docker volume
- Tuyet doi tranh build context khong can thiet

## 1. Don may truoc khi deploy

Sua loi hostname:

```bash
printf "127.0.0.1 localhost\n127.0.1.1 ubuntu\n" > /etc/hosts
hostnamectl set-hostname ubuntu
```

Kiem tra dung luong Docker:

```bash
docker system df
```

Don cache/build/image khong dung:

```bash
docker system prune -af
docker builder prune -af
apt clean
journalctl --vacuum-time=3d
```

Neu van con qua it dung luong, khong nen build tren may nay.

## 2. Cai Docker neu chua co

```bash
apt update
apt install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker
```

## 3. Lay code va tao env

```bash
git clone <repo-url> /opt/udemyclone
cd /opt/udemyclone
cp .env.prod.example .env.prod
```

Sua `.env.prod` toi thieu:

```env
DOMAIN=your-domain.com
SITE_URL=https://your-domain.com
API_URL=/api

JWT_KEY=mot-secret-dai-it-nhat-32-ky-tu
JWT_ISSUER=UdemyClone.Api
JWT_AUDIENCE=UdemyClone.Web

SEED_DEFAULT_PASSWORD=mot-mat-khau-manh
SEED_ADMIN_EMAIL=admin@your-domain.com
SEED_INSTRUCTOR_EMAIL=instructor@your-domain.com
SEED_USER_EMAIL=user@your-domain.com
```

Luu y:

- `API_URL` o frontend nen la URL public `/api`
- file compose lite khong dung Postgres local
- khong commit `.env.prod`

## 4. Deploy

```bash
cd /opt/udemyclone
docker compose --env-file .env.prod -f docker-compose.linux-lite.yml up -d --build
```

Theo doi:

```bash
docker compose --env-file .env.prod -f docker-compose.linux-lite.yml ps
docker compose --env-file .env.prod -f docker-compose.linux-lite.yml logs -f api
docker compose --env-file .env.prod -f docker-compose.linux-lite.yml logs -f web
docker compose --env-file .env.prod -f docker-compose.linux-lite.yml logs -f caddy
```

## 5. Backup du lieu

Db Sqlite va uploads nam trong Docker volume:

- `api_data`
- `api_uploads`

Backup nhanh:

```bash
mkdir -p /root/backups/udemyclone
docker run --rm -v api_data:/from -v /root/backups/udemyclone:/to alpine sh -c "cp -a /from/. /to/api_data/"
docker run --rm -v api_uploads:/from -v /root/backups/udemyclone:/to alpine sh -c "cp -a /from/. /to/api_uploads/"
```

## 6. Cap nhat

```bash
cd /opt/udemyclone
git pull
docker compose --env-file .env.prod -f docker-compose.linux-lite.yml up -d --build
```

## 7. Thuc te quan trong cho may cua ban

Voi `1 GB RAM` va disk trong duoi `1 GB`, cach an toan nhat la:

1. Build image o may khac
2. Push len registry
3. Tren VPS chi `docker compose pull && docker compose up -d`

Neu ban cu build truc tiep tren VPS nay, kha nang cao se gap:

- het RAM khi build Next.js
- het disk khi Docker tao layer
- service flap do OOM hoac no space left on device

## 8. Khi nao nen nang cap

Ban nen nang VPS toi thieu len:

- `2 vCPU`
- `2 GB RAM`
- `25 GB disk`

Khi do moi nen chay Postgres local production, build tren server, va them monitoring/log rotation thoai mai.
