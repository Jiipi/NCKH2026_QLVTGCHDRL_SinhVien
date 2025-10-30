# ===================================================================
# HƯỚNG DẪN DEPLOY PRODUCTION
# Domain: hoatdongrenluyen.io.vn
# Stack: PostgreSQL + Backend (Node.js) + Frontend (React) + Nginx
# CI/CD: GitHub Actions → AWS EC2
# ===================================================================

## MỤC LỤC

1. [Chuẩn bị môi trường](#1-chuẩn-bị-môi-trường)
2. [Setup AWS EC2](#2-setup-aws-ec2)
3. [Cấu hình domain](#3-cấu-hình-domain)
4. [Deploy lần đầu](#4-deploy-lần-đầu)
5. [Setup SSL certificate](#5-setup-ssl-certificate)
6. [Cấu hình CI/CD với GitHub Actions](#6-cấu-hình-cicd-với-github-actions)
7. [Kiểm tra và verify](#7-kiểm-tra-và-verify)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. CHUẨN BỊ MÔI TRƯỜNG

### 1.1. Yêu cầu

- **AWS Account** với quyền tạo EC2 instance
- **Domain name**: `hoatdongrenluyen.io.vn` (đã mua từ nhà cung cấp)
- **GitHub Account** với repository: `Jiipi/QL_DH_RenLuyen`
- **SSH Client**: PuTTY (Windows) hoặc Terminal (Mac/Linux)

### 1.2. Tools cần cài đặt trên máy local

```bash
# Git
git --version

# SSH client
ssh -V

# (Optional) AWS CLI
aws --version
```

---

## 2. SETUP AWS EC2

### 2.1. Tạo EC2 Instance

**Bước 1: Đăng nhập AWS Console**
- URL: https://console.aws.amazon.com
- Region: **Asia Pacific (Singapore) - ap-southeast-1**

**Bước 2: Launch Instance**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CẤU HÌNH EC2 INSTANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name:              hoatdongrenluyen-production
OS:                Ubuntu Server 22.04 LTS (64-bit, x86)
Instance Type:     t2.medium (2 vCPU, 4 GB RAM)
Key Pair:          Tạo mới "hoatdongrenluyen-key.pem"
Storage:           30 GB gp3 SSD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Bước 3: Configure Security Group**

| Type | Protocol | Port | Source | Description |
|------|----------|------|--------|-------------|
| SSH | TCP | 22 | My IP | SSH access |
| HTTP | TCP | 80 | 0.0.0.0/0 | HTTP traffic |
| HTTPS | TCP | 443 | 0.0.0.0/0 | HTTPS traffic |

⚠️ **LƯU Ý**: Không mở port 5432 (PostgreSQL) ra ngoài internet!

**Bước 4: Download key pair**
- File: `hoatdongrenluyen-key.pem`
- Lưu vào: `C:\Users\[YourName]\Documents\AWS\`
- Permissions: Read-only

### 2.2. Kết nối SSH

**Windows (PuTTY):**

1. Convert `.pem` to `.ppk` bằng PuTTYgen
2. Load file `.pem` → Save private key `.ppk`
3. Mở PuTTY:
   - Host: `ubuntu@[EC2_PUBLIC_IP]`
   - Port: `22`
   - Auth: Browse → Select `.ppk` file
   - Save session: "hoatdongrenluyen-prod"
   - Open

**Linux/Mac:**

```bash
# Set permissions
chmod 400 hoatdongrenluyen-key.pem

# Connect
ssh -i hoatdongrenluyen-key.pem ubuntu@[EC2_PUBLIC_IP]
```

### 2.3. Chạy setup script

```bash
# Download và chạy script setup
curl -o setup-ec2.sh https://raw.githubusercontent.com/Jiipi/QL_DH_RenLuyen/main/scripts/setup-ec2-production.sh

chmod +x setup-ec2.sh
./setup-ec2.sh
```

Script sẽ cài đặt:
- ✅ Docker & Docker Compose
- ✅ Nginx
- ✅ Certbot (SSL)
- ✅ Firewall (UFW)
- ✅ Git & SSH keys
- ✅ Project directories

**📋 Lưu lại SSH public key hiển thị sau khi chạy script!**

### 2.4. Thêm SSH key vào GitHub

1. Copy SSH public key từ output script
2. GitHub → Settings → SSH and GPG keys
3. New SSH key:
   - Title: `EC2 Production Server`
   - Key: Paste public key
   - Add SSH key

---

## 3. CẤU HÌNH DOMAIN

### 3.1. Lấy Public IP của EC2

```bash
# Trên EC2 server
curl ifconfig.me
```

Ví dụ: `13.212.123.45`

### 3.2. Cấu hình DNS Records

Đăng nhập vào nhà cung cấp domain (NIC.VN, PA Vietnam, v.v.)

**Thêm A Records:**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 13.212.123.45 | 3600 |
| A | www | 13.212.123.45 | 3600 |

### 3.3. Verify DNS

```bash
# Từ máy local
nslookup hoatdongrenluyen.io.vn

# Kết quả mong muốn:
# Name:    hoatdongrenluyen.io.vn
# Address: 13.212.123.45
```

⏱️ **Thời gian propagation**: 5-30 phút (thường < 10 phút)

---

## 4. DEPLOY LẦN ĐẦU

### 4.1. Build và start containers

```bash
# SSH vào EC2 server
ssh ubuntu@[EC2_PUBLIC_IP]

# Navigate to project
cd ~/hoatdongrenluyen

# Build Docker images
docker compose -f docker-compose.production.yml build

# Start all services
docker compose -f docker-compose.production.yml up -d

# Check status
docker compose -f docker-compose.production.yml ps
```

**Output mong muốn:**

```
NAME                        STATUS          PORTS
hoatdongrenluyen_db         Up (healthy)    5432/tcp
hoatdongrenluyen_backend    Up (healthy)    3001/tcp
hoatdongrenluyen_frontend   Up (healthy)    80/tcp
hoatdongrenluyen_nginx      Up              0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
hoatdongrenluyen_certbot    Up              
```

### 4.2. Run database migrations

```bash
# Generate Prisma client và push schema
docker compose -f docker-compose.production.yml exec backend npx prisma generate
docker compose -f docker-compose.production.yml exec backend npx prisma db push --accept-data-loss

# (Optional) Seed initial data
docker compose -f docker-compose.production.yml exec backend node backend/scripts/seed.js
```

### 4.3. Verify deployment

```bash
# Check backend health
curl http://localhost:3001/api/health
# Output: {"status":"ok","timestamp":"..."}

# Check frontend
curl http://localhost:80/health
# Output: OK

# View logs
docker compose -f docker-compose.production.yml logs -f --tail=50
```

### 4.4. Test từ browser

Truy cập: `http://hoatdongrenluyen.io.vn`

✅ Website phải load được (chưa có HTTPS)

---

## 5. SETUP SSL CERTIFICATE

### 5.1. Request certificate từ Let's Encrypt

```bash
# Trên EC2 server
sudo certbot --nginx -d hoatdongrenluyen.io.vn -d www.hoatdongrenluyen.io.vn

# Nhập thông tin:
# - Email: your-email@example.com
# - Agree to Terms: Yes (Y)
# - Share email: No (N)
# - Redirect HTTP to HTTPS: Yes (2)
```

**Output:**

```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/hoatdongrenluyen.io.vn/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/hoatdongrenluyen.io.vn/privkey.pem
```

### 5.2. Enable HTTPS trong Nginx config

```bash
cd ~/hoatdongrenluyen

# Edit nginx config
nano nginx/nginx-production.conf

# Uncomment HTTPS server block (dòng 187-280)
# Bỏ dấu # ở các dòng server { ... } cho HTTPS

# Restart nginx container
docker compose -f docker-compose.production.yml restart nginx
```

### 5.3. Test HTTPS

Truy cập: `https://hoatdongrenluyen.io.vn`

✅ **Lock icon màu xanh** trong browser
✅ Certificate valid
✅ HTTP tự động redirect sang HTTPS

### 5.4. Setup auto-renewal

Certbot tự động tạo cron job. Verify:

```bash
sudo systemctl status certbot.timer

# Test renewal (dry run)
sudo certbot renew --dry-run
```

---

## 6. CẤU HÌNH CI/CD VỚI GITHUB ACTIONS

### 6.1. Thêm GitHub Secrets

GitHub Repository → Settings → Secrets and variables → Actions

**Thêm các secrets:**

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `EC2_SSH_KEY` | [Private SSH key] | Nội dung file `.pem` |
| `EC2_HOST` | `13.212.123.45` | Public IP của EC2 |
| `EC2_USER` | `ubuntu` | SSH username |
| `DB_NAME` | `Web_QuanLyDiemRenLuyen` | Database name |
| `DB_USER` | `admin` | Database user |
| `DB_PASSWORD` | [From .env file] | Database password |
| `DATABASE_URL` | `postgresql://...` | Full connection string |
| `JWT_SECRET` | [From .env file] | JWT secret key |

**Lấy giá trị từ .env file:**

```bash
# Trên EC2 server
cd ~/hoatdongrenluyen
cat .env
```

### 6.2. Test GitHub Actions workflow

**Trigger deployment:**

```bash
# Từ máy local
git add .
git commit -m "feat: setup production deployment"
git push origin main
```

**Monitor deployment:**

1. GitHub → Actions tab
2. Xem workflow "Deploy to EC2 Production"
3. Theo dõi logs real-time

### 6.3. Verify auto-deployment

```bash
# Trên EC2 server
cd ~/hoatdongrenluyen

# Check latest commit
git log -1 --oneline

# Check containers
docker compose -f docker-compose.production.yml ps

# View logs
docker compose -f docker-compose.production.yml logs -f
```

---

## 7. KIỂM TRA VÀ VERIFY

### 7.1. Health checks

```bash
# Backend API
curl https://hoatdongrenluyen.io.vn/api/health

# Frontend
curl https://hoatdongrenluyen.io.vn/health
```

### 7.2. SSL Certificate

```bash
# Check certificate expiry
sudo certbot certificates

# Test SSL configuration
openssl s_client -connect hoatdongrenluyen.io.vn:443 -servername hoatdongrenluyen.io.vn
```

### 7.3. Container status

```bash
docker compose -f docker-compose.production.yml ps
docker compose -f docker-compose.production.yml logs --tail=100
```

### 7.4. System resources

```bash
# Memory usage
free -h

# Disk usage
df -h

# Running processes
htop

# Docker stats
docker stats
```

### 7.5. Checklist

- [ ] Website accessible qua `https://hoatdongrenluyen.io.vn`
- [ ] SSL certificate valid (green lock icon)
- [ ] Login functionality works
- [ ] API endpoints respond correctly
- [ ] Database connected và có data
- [ ] All 4-5 containers running (db, backend, frontend, nginx, certbot)
- [ ] Logs không có errors critical
- [ ] GitHub Actions workflow chạy thành công
- [ ] Auto-deployment trigger khi push to main
- [ ] SSL auto-renewal configured

---

## 8. TROUBLESHOOTING

### 8.1. Website không accessible

**Kiểm tra:**

```bash
# 1. Check containers
docker compose -f docker-compose.production.yml ps

# 2. Check nginx
sudo systemctl status nginx
sudo nginx -t

# 3. Check firewall
sudo ufw status

# 4. Check DNS
nslookup hoatdongrenluyen.io.vn

# 5. Check logs
docker compose -f docker-compose.production.yml logs nginx
docker compose -f docker-compose.production.yml logs frontend
```

### 8.2. Backend API lỗi 500

```bash
# Check backend logs
docker compose -f docker-compose.production.yml logs backend --tail=200

# Check database connection
docker compose -f docker-compose.production.yml exec backend node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect().then(() => console.log('DB OK')).catch(e => console.error(e));
"

# Check environment variables
docker compose -f docker-compose.production.yml exec backend printenv | grep DATABASE
```

### 8.3. Database connection failed

```bash
# Check database container
docker compose -f docker-compose.production.yml ps db
docker compose -f docker-compose.production.yml logs db --tail=50

# Test connection
docker compose -f docker-compose.production.yml exec db psql -U admin -d Web_QuanLyDiemRenLuyen -c "SELECT 1;"

# Check network
docker network inspect hoatdongrenluyen_app_network
```

### 8.4. SSL certificate errors

```bash
# Check certificate
sudo certbot certificates

# Test renewal
sudo certbot renew --dry-run

# Check nginx SSL config
sudo nginx -t

# View certificate details
openssl x509 -in /etc/letsencrypt/live/hoatdongrenluyen.io.vn/cert.pem -text -noout
```

### 8.5. GitHub Actions deployment failed

**Check:**

1. GitHub → Actions → View workflow logs
2. Verify secrets are set correctly
3. Check SSH connection:

```bash
# Test SSH from local
ssh -i hoatdongrenluyen-key.pem ubuntu@[EC2_PUBLIC_IP]
```

### 8.6. Rollback deployment

```bash
# Method 1: Manual rollback
cd ~/hoatdongrenluyen
git log --oneline -5
git checkout [previous-commit-hash]
docker compose -f docker-compose.production.yml down
docker compose -f docker-compose.production.yml up -d --build

# Method 2: GitHub Actions rollback
# Go to Actions → Re-run failed workflow
```

---

## 9. MAINTENANCE

### 9.1. Update application

```bash
# Option 1: Push to GitHub (auto-deploy via CI/CD)
git push origin main

# Option 2: Manual update
cd ~/hoatdongrenluyen
git pull origin main
docker compose -f docker-compose.production.yml down
docker compose -f docker-compose.production.yml up -d --build
```

### 9.2. Backup database

```bash
# Manual backup
cd ~/hoatdongrenluyen
docker compose -f docker-compose.production.yml exec db pg_dump -U admin Web_QuanLyDiemRenLuyen | gzip > backups/db_backup_$(date +%Y%m%d_%H%M%S).sql.gz

# View backups
ls -lh backups/
```

### 9.3. Restore database

```bash
cd ~/hoatdongrenluyen

# Stop backend
docker compose -f docker-compose.production.yml stop backend

# Restore
gunzip -c backups/db_backup_20251030_120000.sql.gz | \
  docker compose -f docker-compose.production.yml exec -T db psql -U admin -d Web_QuanLyDiemRenLuyen

# Start backend
docker compose -f docker-compose.production.yml start backend
```

### 9.4. View logs

```bash
# Real-time logs (all services)
docker compose -f docker-compose.production.yml logs -f

# Specific service
docker compose -f docker-compose.production.yml logs backend -f --tail=100

# Save logs to file
docker compose -f docker-compose.production.yml logs > logs_$(date +%Y%m%d).txt
```

### 9.5. Clean up

```bash
# Remove old images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune

# Full cleanup (CAREFUL!)
docker system prune -a --volumes
```

---

## 10. PRODUCTION CHECKLIST

### Pre-deployment
- [ ] Domain DNS configured
- [ ] EC2 instance running
- [ ] Security groups configured
- [ ] SSH access works
- [ ] GitHub SSH key added

### First deployment
- [ ] Setup script run successfully
- [ ] .env file configured with secure passwords
- [ ] Docker containers built
- [ ] Database migrated
- [ ] Application accessible via HTTP

### SSL Setup
- [ ] SSL certificate obtained
- [ ] HTTPS enabled in nginx
- [ ] HTTP redirects to HTTPS
- [ ] Certificate auto-renewal configured

### CI/CD
- [ ] GitHub secrets configured
- [ ] Workflow file created
- [ ] Auto-deployment tested
- [ ] Rollback procedure tested

### Monitoring
- [ ] Health checks pass
- [ ] Logs reviewed
- [ ] Backups configured
- [ ] Performance acceptable

---

## 11. CONTACT & SUPPORT

- **Project Repository**: https://github.com/Jiipi/QL_DH_RenLuyen
- **Domain**: https://hoatdongrenluyen.io.vn
- **Documentation**: `/docs/CHUONG_5_TRIEN_KHAI/`

---

**Ngày cập nhật**: 30/10/2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
