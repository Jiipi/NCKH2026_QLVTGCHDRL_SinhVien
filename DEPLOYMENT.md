# 🚀 QUICK DEPLOYMENT GUIDE

## 📋 TÓM TẮT

**Domain**: hoatdongrenluyen.io.vn  
**Database Password**: hungloveakiha13  
**User Passwords**: 123456 (mặc định cho tất cả users)  
**Deployment**: One-command with GitHub Actions CI/CD

---

## ⚡ QUICK START (1 lệnh)

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/DACN_Web_quanly_hoatdongrenluyen.git
cd DACN_Web_quanly_hoatdongrenluyen

# Setup .env.production (đã có sẵn với credentials)
# hoặc copy từ template:
cp .env.example .env.production

# Deploy (pull + build + restart)
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

**That's it!** Website sẽ chạy ở `http://localhost:3000`

---

## 🔧 SETUP CHI TIẾT

### 1. Prerequisites

```bash
# Cài Docker và Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Logout và login lại
```

### 2. Clone Project

```bash
git clone https://github.com/YOUR_USERNAME/DACN_Web_quanly_hoatdongrenluyen.git
cd DACN_Web_quanly_hoatdongrenluyen
```

### 3. Configure Environment

File `.env.production` đã có sẵn với:
- DB Password: `hungloveakiha13`
- Domain: `hoatdongrenluyen.io.vn`
- JWT Secret: Được generate sẵn

**Nếu cần thay đổi**:
```bash
nano .env.production
# Hoặc copy từ template:
cp .env.example .env.production
```

### 4. Deploy

#### Option A: One-Command Deploy (Recommended)
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

#### Option B: Manual Deploy
```bash
# Build images
docker compose -f docker-compose.prod.yml build

# Start containers
docker compose -f docker-compose.prod.yml up -d

# Check status
docker ps
```

### 5. Verify Deployment

```bash
# Check all containers are running
docker ps

# Check logs
docker compose -f docker-compose.prod.yml logs -f

# Test endpoints
curl http://localhost:3001/api/health
curl http://localhost:3000/health
```

---

## 🔄 UPDATE & REDEPLOY

Khi có code mới trên GitHub:

```bash
./scripts/deploy.sh
```

Script sẽ tự động:
1. ✅ Pull latest code
2. ✅ Build Docker images
3. ✅ Restart containers

**Options**:
```bash
# Skip git pull (chỉ rebuild)
./scripts/deploy.sh --skip-pull

# Skip build (chỉ restart)
./scripts/deploy.sh --skip-build

# Rebuild without cache
./scripts/deploy.sh --no-cache
```

---

## 🐳 DOCKER COMMANDS

```bash
# Start all
docker compose -f docker-compose.prod.yml up -d

# Stop all
docker compose -f docker-compose.prod.yml down

# Restart service cụ thể
docker compose -f docker-compose.prod.yml restart backend

# View logs
docker compose -f docker-compose.prod.yml logs -f backend

# Exec into container
docker exec -it student_app_backend_prod sh

# Check resources
docker stats
```

---

## 💾 DATABASE MANAGEMENT

### Backup Database

```bash
# Auto backup (trong container)
docker exec student_app_db_prod pg_dump -U admin -d Web_QuanLyDiemRenLuyen > backup_$(date +%Y%m%d).sql

# Hoặc dùng script có sẵn
cd backend/scripts
powershell -File backup-simple.ps1
```

### Restore Database

```bash
# From backup file
docker exec -i student_app_db_prod psql -U admin -d Web_QuanLyDiemRenLuyen < backup.sql

# Hoặc dùng script
cd backend/scripts
powershell -File restore-simple.ps1 -BackupFile "full_backup_20251031_100346.sql"
```

### Reset User Passwords

```bash
# Reset tất cả users về password 123456
docker exec student_app_backend_prod node scripts/quick_reset_passwords.js

# Hoặc advanced
docker exec student_app_backend_prod node scripts/reset_all_passwords.js
```

---

## 🌐 PRODUCTION DEPLOYMENT (EC2/VPS)

### Setup trên EC2

```bash
# 1. SSH vào EC2
ssh -i your-key.pem ubuntu@<EC2_IP>

# 2. Run auto setup script
curl -fsSL https://raw.githubusercontent.com/YOUR_REPO/main/scripts/setup-ec2.sh | bash

# 3. Logout và login lại (để apply docker group)
exit
ssh -i your-key.pem ubuntu@<EC2_IP>

# 4. Deploy
cd ~/dacn-web/app
./scripts/deploy.sh
```

### Setup Domain & SSL

1. **Cấu hình DNS**:
   ```
   Type    Name    Value           TTL
   A       @       <EC2_IP>        600
   A       www     <EC2_IP>        600
   ```

2. **Cài SSL Certificate**:
   ```bash
   sudo certbot certonly --webroot \
     -w /var/www/certbot \
     -d hoatdongrenluyen.io.vn \
     -d www.hoatdongrenluyen.io.vn \
     --email your-email@example.com
   ```

3. **Start với Nginx Reverse Proxy**:
   ```bash
   docker compose -f docker-compose.prod.yml --profile with-nginx up -d
   ```

---

## 🤖 CI/CD với GitHub Actions

### Automatic Workflow

Mỗi khi push code lên GitHub:
1. ✅ Chạy tests
2. ✅ Build Docker images
3. ✅ Push lên GitHub Container Registry
4. ✅ Security scan

### Enable GitHub Actions

1. Vào GitHub repo → **Settings** → **Actions** → **General**
2. Enable **"Read and write permissions"**
3. Vào **Secrets** → Add:
   - `REACT_APP_API_URL`: `https://hoatdongrenluyen.io.vn/api`

### View Build Status

```
https://github.com/YOUR_USERNAME/DACN_Web_quanly_hoatdongrenluyen/actions
```

---

## 📊 MONITORING

### Health Checks

```bash
# Backend health
curl http://localhost:3001/api/health

# Frontend health
curl http://localhost:3000/health

# Database health
docker exec student_app_db_prod pg_isready -U admin
```

### View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker logs -f student_app_backend_prod
docker logs -f student_app_frontend_prod
docker logs -f student_app_db_prod
```

### Resource Usage

```bash
docker stats
```

---

## 🔐 CREDENTIALS

### Database
- **Host**: db (internal) or localhost:5432 (external)
- **Database**: Web_QuanLyDiemRenLuyen
- **User**: admin
- **Password**: hungloveakiha13

### Default User Accounts
- **Admin**: admin / 123456
- **Teacher**: gv001 / 123456
- **Student**: 2021001 / 123456

### JWT
- **Secret**: Trong `.env.production`
- **Expires**: 7 days

---

## 🆘 TROUBLESHOOTING

### Container không start

```bash
# Xem logs
docker logs student_app_backend_prod

# Restart
docker restart student_app_backend_prod

# Rebuild
docker compose -f docker-compose.prod.yml build backend
docker compose -f docker-compose.prod.yml up -d backend
```

### Database connection failed

```bash
# Check database is running
docker ps | grep db

# Test connection
docker exec student_app_db_prod psql -U admin -d Web_QuanLyDiemRenLuyen -c "SELECT 1;"

# Restart database
docker restart student_app_db_prod
```

### Port đã được sử dụng

```bash
# Check ports
sudo netstat -tulpn | grep -E '3000|3001|5432'

# Stop conflicting services
sudo systemctl stop apache2
sudo systemctl stop nginx
```

### Out of disk space

```bash
# Clean up Docker
docker system prune -a --volumes

# Remove old images
docker images | grep '<none>' | awk '{print $3}' | xargs docker rmi
```

---

## 📚 MORE DOCUMENTATION

- **Full EC2 Deployment**: `docs/AWS_EC2_DEPLOYMENT_GUIDE.md`
- **Database Schema**: `docs/DATABASE_SCHEMA.md`
- **API Documentation**: `docs/api/openapi.yaml`
- **Bug Fixes**: `EMERGENCY_FIX.md`

---

## 🎯 SETUP CHECKLIST

- [x] Clone repository
- [x] File `.env.production` có credentials đúng
- [x] Docker và Docker Compose đã cài
- [x] Run `./scripts/deploy.sh`
- [x] Containers đang chạy (`docker ps`)
- [x] Health checks pass
- [ ] DNS trỏ đúng (nếu production)
- [ ] SSL certificate đã cài (nếu production)
- [ ] Backup database định kỳ
- [ ] Monitoring setup

---

**Created**: October 31, 2025  
**Version**: 1.0  
**Maintainer**: GitHub Copilot
