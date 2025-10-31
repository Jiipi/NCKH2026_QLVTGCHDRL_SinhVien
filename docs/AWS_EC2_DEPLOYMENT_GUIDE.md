# 🚀 HƯỚNG DẪN DEPLOY LÊN AWS EC2 - CHI TIẾT

## 📋 MỤC LỤC
1. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
2. [Chuẩn bị EC2 Instance](#chuẩn-bị-ec2-instance)
3. [Setup môi trường trên EC2](#setup-môi-trường-trên-ec2)
4. [Clone và cấu hình project](#clone-và-cấu-hình-project)
5. [Chạy ứng dụng](#chạy-ứng-dụng)
6. [Cấu hình domain và SSL](#cấu-hình-domain-và-ssl)
7. [Backup và Restore](#backup-và-restore)
8. [Monitoring và Troubleshooting](#monitoring-và-troubleshooting)

---

## 🎯 YÊU CẦU HỆ THỐNG

### AWS EC2 Instance
- **Type**: t3.medium hoặc cao hơn (2 vCPU, 4GB RAM minimum)
- **Storage**: 30GB SSD (gp3)
- **OS**: Ubuntu 22.04 LTS hoặc Amazon Linux 2023
- **Security Group**: 
  - Port 22 (SSH)
  - Port 80 (HTTP)
  - Port 443 (HTTPS)
  - Port 5432 (PostgreSQL - chỉ từ localhost)

### Software trên máy local
- Git Bash hoặc PuTTY (SSH client)
- WinSCP hoặc FileZilla (FTP client)
- Tệp `.pem` hoặc `.ppk` key từ AWS

---

## 🔧 CHUẨN BỊ EC2 INSTANCE

### Bước 1: Tạo EC2 Instance trên AWS Console

1. Đăng nhập AWS Console → EC2 Dashboard
2. Click **Launch Instance**
3. Cấu hình:
   ```
   Name: dacn-web-production
   AMI: Ubuntu Server 22.04 LTS (HVM), SSD Volume Type
   Instance type: t3.medium
   Key pair: Tạo mới hoặc chọn existing (download .pem file)
   Network: Default VPC
   Storage: 30 GB gp3 SSD
   ```

4. **Security Group Configuration**:
   ```
   Type              Protocol    Port Range    Source          Description
   SSH               TCP         22            My IP           SSH access
   HTTP              TCP         80            0.0.0.0/0       Web traffic
   HTTPS             TCP         443           0.0.0.0/0       Secure web traffic
   PostgreSQL        TCP         5432          sg-xxx          Internal DB (optional)
   ```

5. Click **Launch Instance**
6. Đợi Status Checks = 2/2 passed

### Bước 2: Elastic IP (Optional nhưng nên có)

1. EC2 Dashboard → Elastic IPs → Allocate Elastic IP
2. Actions → Associate Elastic IP address
3. Chọn instance `dacn-web-production`
4. Lưu lại IP public này

---

## 🛠️ SETUP MÔI TRƯỜNG TRÊN EC2

### Bước 1: SSH vào EC2

**Từ Windows (Git Bash)**:
```bash
# Đổi permission cho key file
chmod 400 your-key.pem

# SSH vào EC2
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

**Từ Windows (PuTTY)**:
1. Mở PuTTYgen → Load .pem file → Save private key as .ppk
2. Mở PuTTY:
   - Host: ubuntu@<EC2_PUBLIC_IP>
   - Connection → SSH → Auth → Browse → Chọn .ppk file
   - Click Open

### Bước 2: Update hệ thống

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git nano htop net-tools
```

### Bước 3: Cài đặt Docker

```bash
# Gỡ cài đặt Docker cũ (nếu có)
sudo apt remove docker docker-engine docker.io containerd runc

# Cài đặt Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user vào docker group
sudo usermod -aG docker $USER

# Kích hoạt Docker
sudo systemctl enable docker
sudo systemctl start docker

# Đăng xuất và đăng nhập lại để áp dụng group
exit
```

**SSH lại vào EC2**, sau đó test:
```bash
docker --version
# Output: Docker version 24.x.x

docker ps
# Should work without sudo
```

### Bước 4: Cài đặt Docker Compose

```bash
# Cài Docker Compose plugin
sudo apt install -y docker-compose-plugin

# Test
docker compose version
# Output: Docker Compose version v2.x.x
```

### Bước 5: Setup thư mục project

```bash
# Tạo thư mục chính
mkdir -p ~/dacn-web
cd ~/dacn-web

# Tạo các thư mục con
mkdir -p backups data logs
```

---

## 📦 CLONE VÀ CẤU HÌNH PROJECT

### Bước 1: Clone repository từ GitHub

```bash
cd ~/dacn-web

# Clone repository
git clone https://github.com/YOUR_USERNAME/DACN_Web_quanly_hoatdongrenluyen.git app

cd app

# Kiểm tra branch
git branch
git status
```

### Bước 2: Tạo file .env.production

```bash
cd ~/dacn-web/app

# Tạo file .env.production
nano .env.production
```

**Paste nội dung sau** (thay đổi các giá trị):

```bash
# Database Configuration
DB_NAME=Web_QuanLyDiemRenLuyen
DB_USER=admin
DB_PASSWORD=YOUR_SECURE_PASSWORD_HERE_123!@#
DATABASE_URL=postgresql://admin:YOUR_SECURE_PASSWORD_HERE_123!@#@db:5432/Web_QuanLyDiemRenLuyen?schema=public

# JWT Configuration (QUAN TRỌNG: Dùng lệnh bên dưới để generate)
JWT_SECRET=YOUR_RANDOM_SECRET_KEY_MIN_32_CHARS
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=https://your-domain.com

# API URL for Frontend
REACT_APP_API_URL=https://your-domain.com/api

# Node Environment
NODE_ENV=production
PORT=3001

# Logging
LOG_LEVEL=info
```

**Generate JWT Secret mạnh**:
```bash
# Chạy lệnh này để tạo JWT secret ngẫu nhiên
openssl rand -base64 48

# Copy output và paste vào JWT_SECRET trong .env.production
```

**Lưu file**: `Ctrl+O` → Enter → `Ctrl+X`

### Bước 3: Tạo file backend/.env (link symbolic)

```bash
cd ~/dacn-web/app

# Tạo symlink từ .env.production -> backend/.env
ln -sf $(pwd)/.env.production backend/.env

# Verify
ls -la backend/.env
cat backend/.env
```

### Bước 4: Kiểm tra Dockerfile

```bash
# Kiểm tra backend Dockerfile
ls -la backend/Dockerfile*
cat backend/Dockerfile.production

# Kiểm tra frontend Dockerfile
ls -la frontend/Dockerfile*
cat frontend/Dockerfile.production

# Kiểm tra docker-compose
cat docker-compose.prod.yml
```

---

## 🚀 CHẠY ỨNG DỤNG

### Bước 1: Tạo Docker network

```bash
cd ~/dacn-web/app

# Tạo network (nếu chưa có)
docker network create app_network || true
```

### Bước 2: Build Docker images

```bash
cd ~/dacn-web/app

# Build tất cả images (có thể mất 10-15 phút)
docker compose -f docker-compose.prod.yml build

# Kiểm tra images đã build
docker images | grep student-app
```

### Bước 3: Start database trước

```bash
cd ~/dacn-web/app

# Start database container
docker compose -f docker-compose.prod.yml up -d db

# Đợi database khởi động (30 giây)
sleep 30

# Kiểm tra database logs
docker logs student_app_db_prod

# Test database connection
docker exec student_app_db_prod pg_isready -U admin
```

### Bước 4: Restore database từ backup (nếu có)

```bash
# Upload file backup từ máy local lên EC2 (dùng WinSCP)
# File: deployment-package/db_production.dump

# Giả sử file đã upload vào ~/dacn-web/backups/

# Restore database
docker exec -i student_app_db_prod psql -U admin -d Web_QuanLyDiemRenLuyen < ~/dacn-web/backups/db_production.dump

# Verify data
docker exec student_app_db_prod psql -U admin -d Web_QuanLyDiemRenLuyen -c "SELECT COUNT(*) FROM nguoi_dung;"
```

### Bước 5: Start backend

```bash
cd ~/dacn-web/app

# Start backend container
docker compose -f docker-compose.prod.yml up -d backend

# Đợi backend khởi động (60 giây)
sleep 60

# Kiểm tra backend logs
docker logs student_app_backend_prod -f

# Test backend health
curl http://localhost:3001/api/health
```

### Bước 6: Start frontend

```bash
cd ~/dacn-web/app

# Start frontend container
docker compose -f docker-compose.prod.yml up -d frontend

# Đợi frontend khởi động (30 giây)
sleep 30

# Kiểm tra frontend logs
docker logs student_app_frontend_prod

# Test frontend
curl http://localhost:3000/health
```

### Bước 7: Verify tất cả containers

```bash
# Kiểm tra tất cả containers đang chạy
docker ps

# Expected output:
# CONTAINER ID   IMAGE                         STATUS
# xxx            student-app-frontend:latest   Up
# xxx            student-app-backend:latest    Up
# xxx            postgres:15-alpine            Up (healthy)

# Kiểm tra resource usage
docker stats --no-stream
```

---

## 🌐 CẤU HÌNH DOMAIN VÀ SSL

### Bước 1: Cấu hình DNS

Trên nhà cung cấp domain (GoDaddy, Namecheap, v.v.):

```
Type    Name    Value                   TTL
A       @       <EC2_PUBLIC_IP>         600
A       www     <EC2_PUBLIC_IP>         600
```

### Bước 2: Cài đặt Nginx Reverse Proxy

```bash
# Stop containers tạm thời
docker compose -f docker-compose.prod.yml down

# Tạo nginx config
mkdir -p ~/dacn-web/app/nginx/ssl

# Copy nginx production config
cd ~/dacn-web/app
cat nginx/nginx-production.conf
```

**Sửa domain trong nginx config**:
```bash
nano nginx/nginx-production.conf

# Thay thế:
# hoatdongrenluyen.io.vn → your-domain.com
```

### Bước 3: Cài đặt Certbot (Let's Encrypt SSL)

```bash
# Cài Certbot
sudo apt install -y certbot python3-certbot-nginx

# Tạo thư mục cho certbot
sudo mkdir -p /var/www/certbot

# Start nginx với profile
cd ~/dacn-web/app
docker compose -f docker-compose.prod.yml --profile with-nginx up -d

# Đợi nginx khởi động
sleep 10

# Lấy SSL certificate
sudo certbot certonly --webroot \
  -w /var/www/certbot \
  -d your-domain.com \
  -d www.your-domain.com \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email

# SSL certificates sẽ được lưu tại:
# /etc/letsencrypt/live/your-domain.com/
```

### Bước 4: Mount SSL vào Nginx container

**Cập nhật docker-compose.prod.yml**:
```bash
nano docker-compose.prod.yml
```

Thêm volumes cho nginx service:
```yaml
  nginx:
    volumes:
      - ./nginx/nginx-production.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - /var/www/certbot:/var/www/certbot:ro
      - ./nginx/logs:/var/log/nginx
```

**Restart nginx**:
```bash
docker compose -f docker-compose.prod.yml restart nginx

# Test HTTPS
curl -I https://your-domain.com
```

### Bước 5: Auto-renew SSL

```bash
# Thêm cron job
sudo crontab -e

# Add dòng này (renew mỗi tháng):
0 3 1 * * certbot renew --quiet && docker restart student_app_nginx_prod
```

---

## 💾 BACKUP VÀ RESTORE

### Backup Database

```bash
cd ~/dacn-web/app

# Tạo backup
docker exec student_app_db_prod pg_dump -U admin -d Web_QuanLyDiemRenLuyen -F c > ~/dacn-web/backups/backup_$(date +%Y%m%d_%H%M%S).dump

# Kiểm tra backup
ls -lh ~/dacn-web/backups/
```

### Backup Uploads

```bash
cd ~/dacn-web/app

# Backup thư mục uploads
tar -czf ~/dacn-web/backups/uploads_$(date +%Y%m%d_%H%M%S).tar.gz backend/uploads/

# Kiểm tra
ls -lh ~/dacn-web/backups/
```

### Auto Backup Script

```bash
# Tạo script backup tự động
nano ~/dacn-web/backup.sh
```

**Paste nội dung**:
```bash
#!/bin/bash
BACKUP_DIR="$HOME/dacn-web/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
docker exec student_app_db_prod pg_dump -U admin -d Web_QuanLyDiemRenLuyen -F c > "$BACKUP_DIR/db_$DATE.dump"

# Backup uploads
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" -C ~/dacn-web/app/backend uploads/

# Xóa backup cũ hơn 30 ngày
find "$BACKUP_DIR" -name "*.dump" -mtime +30 -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

**Chmod và test**:
```bash
chmod +x ~/dacn-web/backup.sh
~/dacn-web/backup.sh
```

**Setup cron job** (backup hàng ngày lúc 2 AM):
```bash
crontab -e

# Add dòng này:
0 2 * * * /home/ubuntu/dacn-web/backup.sh >> /home/ubuntu/dacn-web/logs/backup.log 2>&1
```

---

## 📊 MONITORING VÀ TROUBLESHOOTING

### Monitoring Commands

```bash
# Kiểm tra tất cả containers
docker ps -a

# Xem logs realtime
docker logs -f student_app_backend_prod
docker logs -f student_app_frontend_prod
docker logs -f student_app_db_prod

# Xem resource usage
docker stats

# Kiểm tra disk space
df -h

# Kiểm tra memory
free -h

# Kiểm tra network
netstat -tulpn | grep LISTEN
```

### Health Checks

```bash
# Backend health
curl http://localhost:3001/api/health

# Frontend health
curl http://localhost:3000/health

# Database health
docker exec student_app_db_prod pg_isready -U admin

# Nginx health (nếu dùng)
curl http://localhost/health
```

### Common Issues

#### 1. Container không start

```bash
# Xem logs chi tiết
docker logs student_app_backend_prod

# Restart container
docker restart student_app_backend_prod

# Rebuild nếu cần
docker compose -f docker-compose.prod.yml build backend
docker compose -f docker-compose.prod.yml up -d backend
```

#### 2. Database connection failed

```bash
# Kiểm tra database đang chạy
docker ps | grep db

# Test connection
docker exec student_app_db_prod psql -U admin -d Web_QuanLyDiemRenLuyen -c "SELECT 1;"

# Restart database
docker restart student_app_db_prod
```

#### 3. Out of disk space

```bash
# Xóa unused images
docker image prune -a

# Xóa unused volumes
docker volume prune

# Xóa logs cũ
sudo journalctl --vacuum-time=7d
```

#### 4. SSL Certificate issues

```bash
# Test SSL
openssl s_client -connect your-domain.com:443

# Renew manually
sudo certbot renew --force-renewal

# Restart nginx
docker restart student_app_nginx_prod
```

### Performance Tuning

**Tăng resource limits trong docker-compose.prod.yml**:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G
```

---

## 🔒 SECURITY BEST PRACTICES

### 1. Firewall Configuration

```bash
# Cài UFW
sudo apt install -y ufw

# Allow SSH (QUAN TRỌNG!)
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 2. Disable Root Login

```bash
sudo nano /etc/ssh/sshd_config

# Tìm và sửa:
PermitRootLogin no
PasswordAuthentication no

# Restart SSH
sudo systemctl restart sshd
```

### 3. Update thường xuyên

```bash
# Auto security updates
sudo apt install -y unattended-upgrades

# Enable
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### 4. Monitoring với fail2ban

```bash
# Cài fail2ban
sudo apt install -y fail2ban

# Enable
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 📝 QUICK REFERENCE

### Start/Stop Commands

```bash
cd ~/dacn-web/app

# Start tất cả
docker compose -f docker-compose.prod.yml up -d

# Start với nginx
docker compose -f docker-compose.prod.yml --profile with-nginx up -d

# Stop tất cả
docker compose -f docker-compose.prod.yml down

# Restart service cụ thể
docker compose -f docker-compose.prod.yml restart backend
```

### Update Code từ Git

```bash
cd ~/dacn-web/app

# Pull latest code
git pull origin main

# Rebuild và restart
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

### Database Management

```bash
# Truy cập PostgreSQL
docker exec -it student_app_db_prod psql -U admin -d Web_QuanLyDiemRenLuyen

# Backup
docker exec student_app_db_prod pg_dump -U admin -d Web_QuanLyDiemRenLuyen > backup.sql

# Restore
docker exec -i student_app_db_prod psql -U admin -d Web_QuanLyDiemRenLuyen < backup.sql
```

---

## 🎉 HOÀN THÀNH!

Website của bạn đã được deploy thành công lên AWS EC2!

**URLs**:
- Frontend: https://your-domain.com
- Backend API: https://your-domain.com/api
- Health Check: https://your-domain.com/health

**Default Login**:
- Admin: `admin` / `123456`
- Teacher: `gv001` / `123456`
- Student: `2021001` / `123456`

**Next Steps**:
1. ✅ Đổi tất cả passwords mặc định
2. ✅ Setup auto backup
3. ✅ Configure monitoring (CloudWatch)
4. ✅ Setup email notifications
5. ✅ Test all features thoroughly

**Support**:
- GitHub Issues: https://github.com/YOUR_USERNAME/DACN_Web_quanly_hoatdongrenluyen/issues
- Email: your-email@example.com

---

**Created by**: GitHub Copilot  
**Date**: October 31, 2025  
**Version**: 1.0
