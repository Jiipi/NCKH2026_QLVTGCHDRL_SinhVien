# 🚀 Hướng Dẫn Deploy EC2

## Quick Start (3 Steps)

### 1️⃣ SSH vào EC2
```bash
ssh -i your-key.pem ec2-user@<IP_ADDRESS>
```

### 2️⃣ Clone & Setup
```bash
git clone https://github.com/Jiipi/QL_DH_RenLuyen.git
cd QL_DH_RenLuyen
bash scripts/setup-ec2.sh

# ⚠️ QUAN TRỌNG: Logout và SSH lại để nhận quyền Docker
exit
```

### 3️⃣ SSH lại & Deploy
```bash
ssh -i your-key.pem ec2-user@<IP_ADDRESS>
cd QL_DH_RenLuyen
bash scripts/deploy.sh
```

✅ **Done!** Truy cập web tại: `http://<IP_ADDRESS>`

---

## Cấu Trúc Scripts

| Script | Mục đích |
|--------|----------|
| `scripts/setup-ec2.sh` | Cài đặt môi trường (Docker, Nginx, Firewall) |
| `scripts/deploy.sh` | Build & chạy containers |

---

## Deploy Options

```bash
# Deploy bình thường (pull + build + start)
bash scripts/deploy.sh

# Chỉ restart (không pull, không build)
bash scripts/deploy.sh --skip-pull --skip-build

# Build sạch (no cache)
bash scripts/deploy.sh --no-cache

# Chạy database migration
bash scripts/deploy.sh --migrate

# Chạy database seeder
bash scripts/deploy.sh --seed

# Xem help
bash scripts/deploy.sh --help
```

---

## Cấu Hình SSL (Sau Khi DNS Trỏ Domain)

```bash
sudo certbot --nginx -d hoatdongrenluyen.io.vn -d www.hoatdongrenluyen.io.vn
```

---

## Quản Lý Containers

```bash
# Xem logs
docker compose -f docker-compose.prod.yml logs -f

# Xem logs của service cụ thể
docker compose -f docker-compose.prod.yml logs -f backend

# Stop all
docker compose -f docker-compose.prod.yml down

# Restart
docker compose -f docker-compose.prod.yml restart

# Xem trạng thái
docker ps
```

---

## Troubleshooting

### Docker permission denied
```bash
# Logout và SSH lại sau khi chạy setup-ec2.sh
exit
ssh -i your-key.pem ec2-user@<IP>
```

### Port already in use
```bash
# Xem process đang dùng port
sudo lsof -i :3000
sudo lsof -i :3001

# Kill process
sudo kill <PID>
```

### Container không start được
```bash
# Xem logs container
docker logs student_app_backend_prod --tail 100
docker logs student_app_frontend_prod --tail 100
docker logs student_app_db_prod --tail 100
```

### Database connection error
```bash
# Kiểm tra database container
docker exec -it student_app_db_prod psql -U admin -d Web_QuanLyDiemRenLuyen

# Restart database
docker compose -f docker-compose.prod.yml restart db
```

---

## Cấu Hình Mặc Định

| Config | Giá trị |
|--------|---------|
| Domain | `hoatdongrenluyen.io.vn` |
| Backend Port | `3001` |
| Frontend Port | `3000` |
| Database Port | `5432` |
| Database Name | `Web_QuanLyDiemRenLuyen` |

---

## Architecture

```
                    Internet
                        │
                        ▼
              ┌─────────────────┐
              │     Nginx       │ (Host - Port 80/443)
              └────────┬────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
┌─────────────────┐       ┌─────────────────┐
│    Frontend     │       │     Backend     │
│   (Port 3000)   │       │   (Port 3001)   │
│  Docker Nginx   │       │    Node.js      │
└─────────────────┘       └────────┬────────┘
                                   │
                                   ▼
                         ┌─────────────────┐
                         │   PostgreSQL    │
                         │   (Port 5432)   │
                         └─────────────────┘
```
