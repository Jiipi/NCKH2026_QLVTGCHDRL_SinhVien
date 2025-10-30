# 🚀 PRODUCTION DEPLOYMENT

Domain: **hoatdongrenluyen.io.vn**  
Stack: PostgreSQL + Node.js + React + Nginx  
Platform: AWS EC2 Amazon Linux 2

---

## SETUP NHANH (30 PHÚT)

### 1. Chạy script trên EC2

```bash
curl -o setup.sh https://raw.githubusercontent.com/Jiipi/QL_DH_RenLuyen/main/SETUP_EC2.sh
bash setup.sh
```

### 2. Add SSH key vào GitHub

Copy key hiển thị → GitHub Settings → SSH Keys

### 3. Đổi password trong .env

```bash
nano /home/ec2-user/app/.env
# Đổi DB_PASSWORD, JWT_SECRET
```

### 4. Cấu hình DNS

A record: `@` và `www` → IP EC2

### 5. Deploy

```bash
cd /home/ec2-user/app
docker compose -f docker-compose.production.yml up -d
```

### 6. Setup SSL

```bash
sudo certbot --nginx -d hoatdongrenluyen.io.vn -d www.hoatdongrenluyen.io.vn
```

---

## FILES QUAN TRỌNG

```
📁 Project Root
├── SETUP_EC2.sh              ← Script cài đặt EC2
├── DEPLOY.md                 ← Hướng dẫn chi tiết
├── CHECKLIST.md              ← Checklist từng bước
├── CICD.md                   ← Setup GitHub Actions
├── docker-compose.production.yml  ← 4 containers
├── .env.production.template  ← Template biến môi trường
├── backend/
│   └── Dockerfile.production ← Build backend + frontend
├── frontend/
│   └── Dockerfile.production ← Build React app
└── nginx/
    └── nginx-production.conf ← Reverse proxy config
```

---

## 4 CONTAINERS

```
┌─────────────────────────────────────────────────┐
│  nginx (Port 80, 443) - Reverse Proxy + SSL    │
│  ├─→ frontend:80  - React app                  │
│  └─→ backend:3001 - API (/api/*)               │
│      └─→ db:5432  - PostgreSQL                 │
└─────────────────────────────────────────────────┘
```

---

## LỆNH THƯỜNG DÙNG

```bash
# Xem containers
docker compose -f docker-compose.production.yml ps

# Xem logs
docker compose -f docker-compose.production.yml logs -f

# Restart
docker compose -f docker-compose.production.yml restart

# Update code
git pull && docker compose -f docker-compose.production.yml up -d --build

# Stop tất cả
docker compose -f docker-compose.production.yml down
```

---

## CI/CD AUTO-DEPLOY

Push code → GitHub Actions tự động deploy

**Setup:**
1. GitHub → Settings → Secrets
2. Add: `EC2_HOST` (IP EC2)
3. Add: `EC2_SSH_KEY` (Private key)

**Workflow:** `.github/workflows/deploy.yml`

---

## TROUBLESHOOT

**Website không load:**
```bash
docker compose -f docker-compose.production.yml logs nginx
sudo ufw status
```

**Database lỗi:**
```bash
docker compose -f docker-compose.production.yml logs db
```

**Rebuild tất cả:**
```bash
docker compose -f docker-compose.production.yml down
docker compose -f docker-compose.production.yml up -d --build
```

---

## ĐỌC THÊM

- **Chi tiết:** `DEPLOY.md`
- **Checklist:** `CHECKLIST.md`
- **CI/CD:** `CICD.md`

---

**Status:** ✅ Production Ready  
**Last Update:** 30/10/2025
