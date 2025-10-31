# 🎓 HỆ THỐNG QUẢN LÝ HOẠT ĐỘNG RÈN LUYỆN

> **Web Application quản lý điểm rèn luyện sinh viên**  
> Domain: [hoatdongrenluyen.io.vn](https://hoatdongrenluyen.io.vn)

---

## 🚀 QUICK START

```bash
# 1. Clone repository
git clone https://github.com/Jiipi/QL_DH_RenLuyen.git
cd QL_DH_RenLuyen

# 2. Deploy (ONE COMMAND!)
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

**Website sẽ chạy ở**: `http://localhost:3000`

---

## 📋 YÊU CẦU HỆ THỐNG

- **Docker** 24.x trở lên
- **Docker Compose** v2.x trở lên
- **OS**: Ubuntu 20.04+, Amazon Linux 2023, hoặc Windows với WSL2
- **RAM**: Tối thiểu 4GB (Khuyến nghị 8GB)
- **Disk**: 20GB trống

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

```
┌─────────────────────────────────────────────────────────┐
│                    Nginx Reverse Proxy                  │
│              (SSL, Load Balancing, Caching)             │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
┌───────▼────────┐                 ┌────────▼───────┐
│   Frontend     │                 │    Backend     │
│  (React + MUI) │◄────────────────┤  (Node.js +    │
│   Nginx:80     │    REST API     │   Express)     │
└────────────────┘                 └────────┬───────┘
                                            │
                                  ┌─────────▼─────────┐
                                  │   PostgreSQL 15   │
                                  │   (Database)      │
                                  └───────────────────┘
```

---

## 🎯 TÍNH NĂNG CHÍNH

### 👨‍🎓 Sinh Viên
- ✅ Đăng ký hoạt động rèn luyện
- ✅ Theo dõi điểm tích lũy theo kỳ
- ✅ Xem lịch sử tham gia hoạt động
- ✅ Upload minh chứng tham gia
- ✅ Xuất PDF bảng điểm

### 👨‍🏫 Giảng Viên
- ✅ Tạo và quản lý hoạt động
- ✅ Duyệt đăng ký sinh viên
- ✅ Điểm danh và chấm điểm
- ✅ Thống kê báo cáo theo lớp
- ✅ Khóa điểm cuối kỳ

### 👨‍💼 Lớp Trưởng
- ✅ Tạo hoạt động nội bộ lớp
- ✅ Quản lý đăng ký lớp
- ✅ Xem điểm toàn lớp

### 🔐 Admin
- ✅ Quản lý người dùng (CRUD)
- ✅ Phân quyền vai trò
- ✅ Quản lý loại hoạt động
- ✅ Cấu hình học kỳ và khóa điểm
- ✅ Thống kê tổng quan hệ thống

---

## 🔐 CREDENTIALS

### Database (Docker)
```
Host:     db (internal) / localhost:5432 (external)
Database: Web_QuanLyDiemRenLuyen
User:     admin
Password: hungloveakiha13
```

### Default Accounts
```
Admin:    admin / 123456
Teacher:  gv001 / 123456
Student:  2021001 / 123456
```

**⚠️ ĐỔI PASSWORD NGAY SAU KHI DEPLOY!**

---

## 📦 DEPLOYMENT OPTIONS

### Option 1: Development (Recommended for testing)

```bash
# Start dev environment
docker compose --profile dev up -d

# Access:
# Frontend: http://localhost:3000
# Backend:  http://localhost:3001
# Prisma Studio: http://localhost:5555
```

### Option 2: Production (One-command)

```bash
# Deploy to production
./scripts/deploy.sh

# Access:
# Frontend: http://localhost:3000
# Backend:  http://localhost:3001
```

### Option 3: Production (EC2/VPS Auto Setup)

```bash
# On EC2 instance, run:
curl -fsSL https://raw.githubusercontent.com/Jiipi/QL_DH_RenLuyen/main/scripts/setup-ec2.sh | bash

# Logout and login again
exit

# Deploy
cd ~/dacn-web/app
./scripts/deploy.sh
```

---

## 🔄 UPDATE & REDEPLOY

```bash
# Pull latest code and redeploy
./scripts/deploy.sh

# Options:
./scripts/deploy.sh --skip-pull      # Skip git pull
./scripts/deploy.sh --skip-build     # Only restart containers
./scripts/deploy.sh --no-cache       # Clean rebuild
```

---

## 🧪 TESTING

### Run Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests (Playwright)
cd frontend
npm run e2e
```

### Reset Database với Data Mẫu

```bash
# Development
docker exec dacn_backend_dev node scripts/quick_reset_passwords.js

# Production
docker exec student_app_backend_prod node scripts/quick_reset_passwords.js
```

---

## 💾 BACKUP & RESTORE

### Backup Database

```bash
# Quick backup
docker exec student_app_db_prod pg_dump -U admin -d Web_QuanLyDiemRenLuyen > backup_$(date +%Y%m%d).sql

# Auto backup (cron job)
./scripts/setup-auto-backup.sh
```

### Restore Database

```bash
# Restore from backup
docker exec -i student_app_db_prod psql -U admin -d Web_QuanLyDiemRenLuyen < backup.sql
```

---

## 📊 MONITORING

### Health Checks

```bash
curl http://localhost:3001/api/health     # Backend
curl http://localhost:3000/health         # Frontend
docker ps                                 # All containers
```

### View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker logs -f student_app_backend_prod
```

### Resource Usage

```bash
docker stats
```

---

## 🤖 CI/CD

GitHub Actions tự động:
- ✅ Run tests trên mỗi push
- ✅ Build Docker images
- ✅ Security scan (Trivy)
- ✅ Push images lên GitHub Container Registry

**View build status**: [GitHub Actions](https://github.com/Jiipi/QL_DH_RenLuyen/actions)

---

## 📚 DOCUMENTATION

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Quick deployment guide
- **[MANUAL_SETUP.md](MANUAL_SETUP.md)** - Manual setup checklist
- **[docs/AWS_EC2_DEPLOYMENT_GUIDE.md](docs/AWS_EC2_DEPLOYMENT_GUIDE.md)** - AWS EC2 deployment
- **[docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)** - Database structure
- **[EMERGENCY_FIX.md](EMERGENCY_FIX.md)** - Bug fixes documentation
- **[BACKUP_SUMMARY.md](BACKUP_SUMMARY.md)** - Backup/restore guide

---

## 🛠️ TECH STACK

### Frontend
- **React 18** - UI library
- **Material-UI (MUI)** - Component library
- **TailwindCSS** - Utility-first CSS
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Node.js 18** - Runtime environment
- **Express.js** - Web framework
- **Prisma ORM** - Database ORM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication

### Database
- **PostgreSQL 15** - Relational database
- **Prisma Client** - Type-safe database client

### DevOps
- **Docker & Docker Compose** - Containerization
- **GitHub Actions** - CI/CD pipeline
- **Nginx** - Reverse proxy & load balancer
- **Let's Encrypt** - SSL certificates

---

## 🔒 SECURITY

- ✅ JWT Authentication
- ✅ Role-based Access Control (RBAC)
- ✅ Password hashing (bcrypt)
- ✅ SQL Injection protection (Prisma)
- ✅ XSS protection
- ✅ CORS configured
- ✅ Rate limiting
- ✅ Security headers

---

## 🐛 KNOWN ISSUES & FIXES

See [EMERGENCY_FIX.md](EMERGENCY_FIX.md) for:
- Role permissions bug fix (PostgreSQL JSON array issue)
- Profile caching issue fix

---

## 🤝 CONTRIBUTING

```bash
# Fork repository
# Create feature branch
git checkout -b feature/amazing-feature

# Commit changes
git commit -m "Add amazing feature"

# Push to branch
git push origin feature/amazing-feature

# Open Pull Request
```

---

## 📄 LICENSE

This project is licensed under the MIT License.

---

## 👥 TEAM

- **Frontend**: React + MUI + TailwindCSS
- **Backend**: Node.js + Express + Prisma
- **DevOps**: Docker + GitHub Actions + AWS EC2
- **Database**: PostgreSQL 15

---

## 📞 SUPPORT

- **Issues**: [GitHub Issues](https://github.com/Jiipi/QL_DH_RenLuyen/issues)
- **Documentation**: Check `docs/` folder
- **Email**: support@hoatdongrenluyen.io.vn

---

**⭐ If you find this project helpful, please star it!**

**Last Updated**: October 31, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
