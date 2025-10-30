# HƯỚNG DẪN DEPLOY - 5 PHÚT

## 1. SETUP EC2 (1 lần duy nhất)

```bash
# Chạy trên EC2 Amazon Linux 2 (user: ec2-user)
curl -o setup.sh https://raw.githubusercontent.com/Jiipi/QL_DH_RenLuyen/main/SETUP_EC2.sh
bash setup.sh
```

**Script sẽ:**
- Cài Docker, Docker Compose, Git, Nginx
- Cấu hình firewalld
- Cài Certbot (SSL)
- Tạo SSH key (thêm vào GitHub)
- Clone project vào `/home/ec2-user/app/`
- Tạo file `.env`

**SAU KHI CHẠY SCRIPT:**
1. Copy SSH key hiển thị → GitHub Settings → SSH Keys → Add
2. Đổi password trong file `/home/ec2-user/app/.env`
3. Cấu hình DNS A record trỏ về IP EC2

---

## 2. CẤU HÌNH DNS

Vào nhà cung cấp domain, thêm:

```
Type: A    Name: @      Value: [IP_EC2]
Type: A    Name: www    Value: [IP_EC2]
```

Đợi 5-10 phút, test: `nslookup hoatdongrenluyen.io.vn`

---

## 3. DEPLOY APP

```bash
cd /home/ec2-user/app

# Build và start 4 containers
docker compose -f docker-compose.production.yml up -d

# Xem logs
docker compose -f docker-compose.production.yml logs -f
```

**4 containers phải running:**
- `hoatdongrenluyen_db` (PostgreSQL)
- `hoatdongrenluyen_backend` (Node.js)
- `hoatdongrenluyen_frontend` (React)
- `hoatdongrenluyen_nginx` (Reverse proxy)

---

## 4. SETUP SSL

```bash
sudo certbot --nginx -d hoatdongrenluyen.io.vn -d www.hoatdongrenluyen.io.vn
```

Nhập email → Yes → Yes

---

## 5. TEST

Truy cập: `https://hoatdongrenluyen.io.vn`

✅ Website phải load được với HTTPS

---

## LỆNH THƯỜNG DÙNG

```bash
# Xem containers
docker compose -f docker-compose.production.yml ps

# Xem logs
docker compose -f docker-compose.production.yml logs -f

# Restart
docker compose -f docker-compose.production.yml restart

# Stop
docker compose -f docker-compose.production.yml down

# Update code
git pull && docker compose -f docker-compose.production.yml up -d --build

# Backup database
docker compose -f docker-compose.production.yml exec db pg_dump -U admin Web_QuanLyDiemRenLuyen > backup.sql
```

---

## CẤU TRÚC FILE .ENV

```bash
# Trên EC2: /home/ec2-user/app/.env
NODE_ENV=production
DB_PASSWORD=ĐỔI_CÁI_NÀY
DATABASE_URL=postgresql://admin:ĐỔI_CÁI_NÀY@db:5432/Web_QuanLyDiemRenLuyen?schema=public
JWT_SECRET=ĐỔI_CÁI_NÀY_32_KÝ_TỰ
CORS_ORIGIN=https://hoatdongrenluyen.io.vn
REACT_APP_API_URL=https://hoatdongrenluyen.io.vn/api
```

**Generate password:**
```bash
openssl rand -base64 32
```

---

## 4 CONTAINERS

```yaml
db:        PostgreSQL 15 - Port 5432 (internal only)
backend:   Node.js API - Port 3001 (internal only)
frontend:  React + Nginx - Port 80 (internal only)
nginx:     Reverse Proxy - Port 80, 443 (public)
```

**Luồng request:**
```
Browser → nginx (80/443) → frontend (80) cho HTML/JS
Browser → nginx (80/443) → backend (3001) cho /api/*
```

---

## TROUBLESHOOT

**Website không load:**
```bash
docker compose -f docker-compose.production.yml ps
docker compose -f docker-compose.production.yml logs nginx
sudo ufw status
```

**Database lỗi:**
```bash
docker compose -f docker-compose.production.yml logs db
docker compose -f docker-compose.production.yml exec db psql -U admin -d Web_QuanLyDiemRenLuyen
```

**Rebuild lại:**
```bash
docker compose -f docker-compose.production.yml down
docker compose -f docker-compose.production.yml up -d --build
```

---

**Xong!** Domain phải chạy được với 4 containers và HTTPS.
