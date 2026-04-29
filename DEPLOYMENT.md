# Deployment Guide — BookingCare

Huong dan deploy stack SERN (Sequelize + Express + React + Node) bang Docker, kem git workflow va CI template. Noi dung: env vars -> run local -> Docker -> migrations -> git -> CI/CD.

## 1. Cau truc du an

```
booking-care/
├── booking-be/           # Backend (Express, Sequelize, socket.io)
│   ├── src/
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
├── booking-fe/           # Frontend (CRA React)
│   ├── src/
│   ├── .env.example
│   └── package.json
├── docker/               # Per-service compose files (dev)
│   ├── backend/
│   ├── frontend-nginx/
│   └── mysql/
└── production/           # One-shot compose + nginx config (prod-like)
    ├── docker-compose.yaml
    └── default.conf
```

## 2. Environment variables

### Backend — `booking-be/.env`

Copy tu `booking-be/.env.example`. Tat ca bien:

| Group | Key | Mo ta | Bat buoc |
|---|---|---|---|
| DB | `DB_USERNAME` / `DB_PASSWORD` / `DB_DATABASE_NAME` / `DB_HOST` / `DB_PORT` / `DB_DIALECT` | MySQL connection | Yes |
| Server | `PORT` | Cong BE (default 8080) | No |
| Server | `NODE_ENV` | `development` \| `production` | Yes |
| Server | `URL_REACT` | FE origin — dung cho CORS + OAuth redirect + email links | Yes |
| Server | `SITE_URL` | Public URL cho email footer | No |
| Auth | `JWT_SECRET` | Random string (bat buoc doi o prod) | Yes |
| Auth | `JWT_EXPIRES_IN` | Thoi han token, default `7d` | No |
| OAuth | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google sign-in | No |
| Email | `EMAIL_APP` / `EMAIL_APP_PASSWORD` | Gmail App Password | Yes (cho email OTP, reminder) |
| Email | `EMAIL_BRAND_NAME` / `EMAIL_BRAND_COLOR` | Style email | No |
| VNPay | `VNP_TMN_CODE` / `VNP_HASH_SECRET` / `VNP_URL` / `VNP_RETURN_URL` | Thanh toan | Yes (cho payment flow) |
| Schedule | `MAX_NUMBER_SCHEDULE` | So benh nhan toi da / slot | Yes |
| Cron | `REMINDER_CRON` / `CRON_TZ` | Lich chay reminder (default `0 * * * *`, tz `Asia/Ho_Chi_Minh`) | No |

### Frontend — `booking-fe/.env`

| Key | Mo ta |
|---|---|
| `PORT` | Cong CRA dev server (default 3000) |
| `REACT_APP_BACKEND_URL` | BE origin — CRA chi expose vars prefix `REACT_APP_` |
| `REACT_APP_ROUTER_BASE_NAME` | Khi host o sub-path (trong da so truong hop de trong) |

**Luu y:** sau khi doi `.env` FE, phai restart dev server (CRA inline env luc build).

## 3. Run local (khong Docker)

```bash
# 1. MySQL — tu tao DB `quocduong` hoac dung docker:
cd docker/mysql && docker compose up -d

# 2. Backend
cd booking-be
cp .env.example .env   # sua cac gia tri
npm install
npx sequelize-cli db:migrate
npm start              # nodemon + babel-node src/server.js

# 3. Frontend (terminal khac)
cd booking-fe
cp .env.example .env
npm install
npm start              # http://localhost:3000
```

## 4. Run bang Docker

### 4.1 Dev — tung service rieng

```bash
# MySQL only
cd docker/mysql && docker compose -p bookingcare-db up -d

# MySQL + backend
cd docker/backend && docker compose -p bookingcare-be up -d

# Frontend nginx (can build truoc: cd booking-fe && npm run build)
cd booking-fe && npm run build
cd ../docker/frontend-nginx && docker compose -p bookingcare-fe up -d
```

### 4.2 Production-style — all-in-one

```bash
# 1. Build FE
cd booking-fe && npm install && npm run build

# 2. Tao file booking-be/.env voi gia tri production (JWT_SECRET moi, URL_REACT=http://localhost, ...)

# 3. Up stack
cd production
docker compose -p bookingcare up -d
```

Stack:
- `database-mysql` — MySQL 8 (port 3308 external)
- `backend` — Node 14 alpine, build tu `booking-be/Dockerfile`, listen 8080
- `nginx` — serve `booking-fe/build` + proxy `/api` sang backend (xem `production/default.conf`)

Truy cap: http://localhost

### 4.3 Migrations trong Docker

```bash
docker compose -p bookingcare exec backend npx sequelize-cli db:migrate
```

## 5. Database migrations

Moi lan pull code moi, chay:
```bash
cd booking-be && npx sequelize-cli db:migrate
```

Rollback migration cuoi cung:
```bash
npx sequelize-cli db:migrate:undo
```

Seed data (neu can khoi tao allcode, admin):
```bash
npx sequelize-cli db:seed:all
```

**Danh sach migration hien tai:** 01-32 (01 users, 28 MFA fields, 30-31 audit+stock movements, 32 seed MFA cho R1).

## 6. Git workflow

### Branching
- `main` — stable, auto-deploy to prod (neu cau hinh CD)
- `develop` — integration, auto-deploy to staging
- `feature/<ten>` — feature branches, PR vao `develop`
- `hotfix/<ten>` — fix gap cho prod, PR vao `main` + merge nguoc ve `develop`

### Commit convention
Dung [Conventional Commits](https://www.conventionalcommits.org/):
```
feat(mfa): admin toggle MFA per user
fix(booking): preserve ms timestamp format
chore(deps): bump sequelize 6.33
docs(deploy): add env var checklist
```

### Workflow mau
```bash
git checkout develop && git pull
git checkout -b feature/mfa-toggle-ui
# ... code ...
git add -p && git commit -m "feat(mfa): add mfaEnabled checkbox in UserRedux"
git push -u origin feature/mfa-toggle-ui
# Mo PR tren GitHub vao develop, chay CI, review, merge
```

### .gitignore quan trong
```
node_modules/
build/
.env
.env.local
*.log
booking-fe/booking-fe/.env.local
```

## 7. CI/CD (GitHub Actions)

Template co san tai `.github/workflows/ci.yml` — chay tren moi push / PR:
1. Checkout code
2. Setup Node 18
3. Install deps BE + FE
4. Build BE (`npm run build-src`)
5. Build FE (`npm run build`)

Mo rong khi can:
- Chay lint (`eslint`) neu da cau hinh
- Chay test (`jest`) neu co
- Deploy step: push Docker image len registry, ssh vao server, `docker compose pull && up -d`

**Secrets can set tren GitHub (Settings -> Secrets):**
- `JWT_SECRET`, `EMAIL_APP_PASSWORD`, `VNP_HASH_SECRET`, `DB_PASSWORD`
- `DOCKER_USERNAME` + `DOCKER_TOKEN` (neu push image)
- `SSH_HOST`, `SSH_USER`, `SSH_KEY` (neu deploy qua ssh)

## 8. Checklist truoc khi deploy prod

- [ ] Doi `JWT_SECRET` sang random string moi
- [ ] `NODE_ENV=production`
- [ ] `URL_REACT` tro ve domain that
- [ ] MySQL password khac `123456`
- [ ] Gmail App Password — KHONG commit vao git
- [ ] VNPay: chuyen tu sandbox sang production URL
- [ ] Chay `npx sequelize-cli db:migrate`
- [ ] Kiem tra cron `REMINDER_CRON` + `CRON_TZ`
- [ ] HTTPS (nginx reverse proxy + Let's Encrypt)
- [ ] Backup DB (cron dump `quocduong_data_only.sql`)

## 9. Backup & Disaster Recovery

### Backup thu cong
```bash
# Backup toan bo DB vao file .sql
docker exec booking-care-mysql mysqldump -uroot -p<password> quocduong \
    > backup-$(date +%Y%m%d-%H%M%S).sql
```

### Backup tu dong qua cron (Linux host)

Tao `/opt/bookingcare/backup.sh`:
```bash
#!/bin/bash
set -euo pipefail
BACKUP_DIR=/var/backups/bookingcare
RETENTION_DAYS=14
DB_PASSWORD="${DB_PASSWORD:?DB_PASSWORD required}"
mkdir -p "$BACKUP_DIR"
STAMP=$(date +%Y%m%d-%H%M%S)
FILE="$BACKUP_DIR/bookingcare-$STAMP.sql.gz"

docker exec booking-care-mysql \
  mysqldump -uroot -p"$DB_PASSWORD" \
    --single-transaction --quick --routines --triggers quocduong \
  | gzip -9 > "$FILE"

# Xoa backup cu hon RETENTION_DAYS
find "$BACKUP_DIR" -type f -name 'bookingcare-*.sql.gz' -mtime +$RETENTION_DAYS -delete

# Optional: upload len S3 / Google Cloud Storage
# aws s3 cp "$FILE" s3://bookingcare-backups/
```

```bash
chmod +x /opt/bookingcare/backup.sh
# Crontab: chay 3h sang moi ngay
(crontab -l 2>/dev/null; echo "0 3 * * * DB_PASSWORD=xxx /opt/bookingcare/backup.sh") | crontab -
```

### Test restore (lam dinh ky!)
```bash
gunzip -c bookingcare-20260423-030000.sql.gz | \
  docker exec -i booking-care-mysql mysql -uroot -p<password> quocduong_test
```

**Khuyen nghi:**
- Backup hang ngay vao lich 3h sang (traffic thap)
- Giu RETENTION_DAYS=14-30 local + push 1 ban / tuan len S3 / GCS
- Test restore hang thang
- Rieng uploads/static files: rsync dinh ky len remote

### Giam sat

- `/api/health` endpoint tra ve `{status, uptime, db}`. Dung voi UptimeRobot / Pingdom / Better Stack.
- Container healthcheck:
```yaml
  backend:
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:8080/api/health"]
      interval: 30s
      timeout: 5s
      retries: 3
```

## 10. Troubleshooting

| Van de | Nguyen nhan | Fix |
|---|---|---|
| `Unknown column 'mfaEnabled'` | Migration 28 chua chay | `npx sequelize-cli db:migrate` |
| `Unknown column 'prevQty'` | Migration 31 chua chay | Tuong tu |
| CORS blocked | `URL_REACT` sai | Dat bang FE origin chinh xac (co port) |
| Email khong gui | Gmail App Password sai | Tao lai tai https://myaccount.google.com/apppasswords |
| Socket khong connect | BE origin khac FE origin, CORS socket.io | Dat `URL_REACT` dung hoac dung nginx proxy |
| VNPay `Invalid checksum` | `VNP_HASH_SECRET` sai | Copy lai tu VNPay dashboard, khong co khoang trang |
| `requireMfa: true` ma khong muon | Admin R1 co `mfaEnabled=1` | Login voi admin khac, bo tick MFA trong user-edit form |
