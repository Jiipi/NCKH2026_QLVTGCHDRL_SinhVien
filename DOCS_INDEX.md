# Hệ thống Quản lý Hoạt động Rèn Luyện - Tổng hợp Tài liệu

## 📚 Tài liệu Chính

### Backend
- **[MIGRATION_COMPLETE.md](MIGRATION_COMPLETE.md)** - ✅ Báo cáo hoàn thành migration backend
- **[backend/BACKEND_STRUCTURE.md](backend/BACKEND_STRUCTURE.md)** - 📖 Cấu trúc chi tiết backend
- **[backend/QUICK_REFERENCE.md](backend/QUICK_REFERENCE.md)** - 🔍 API Reference nhanh

### Tài liệu Kỹ thuật
- **[API_FLOW_DOCUMENTATION.md](API_FLOW_DOCUMENTATION.md)** - Luồng API và tích hợp
- **[BAO_CAO_LUONG_API.md](BAO_CAO_LUONG_API.md)** - Báo cáo luồng API (Vietnamese)
- **[SUMMARY_VI.md](SUMMARY_VI.md)** - Tổng quan hệ thống (Vietnamese)

### Tài liệu Fix/Patch
- **[RBAC_PERMISSIONS_FIX.md](RBAC_PERMISSIONS_FIX.md)** - Fix RBAC permissions
- **[SEMESTER_MANAGEMENT_FIX.md](SEMESTER_MANAGEMENT_FIX.md)** - Fix semester management
- **[SORTING_FIX_SUMMARY.md](SORTING_FIX_SUMMARY.md)** - Fix sorting issues

## 📁 Cấu trúc Project

```
DACN_Web_quanly_hoatdongrenluyen-master/
│
├── backend/                    # Backend API
│   ├── src/
│   │   ├── modules/           # 17 feature modules
│   │   ├── core/              # Core framework
│   │   ├── infrastructure/    # Database & repos
│   │   └── services/          # Cross-cutting services
│   ├── prisma/                # Database schema
│   └── BACKEND_STRUCTURE.md   # Chi tiết backend
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── tests/
│
├── nginx/                      # Nginx configuration
├── scripts/                    # Deployment scripts
├── logs/                       # Application logs
└── repo-reference/            # Backup code cũ (không xóa)
```

## 🚀 Quick Start

### Development

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm start
```

### Docker

```bash
# Development
docker-compose up

# Production
docker-compose -f docker-compose.prod.yml up
```

## 📖 Đọc Tài liệu Theo Thứ tự

### Cho Developer mới
1. Đọc [SUMMARY_VI.md](SUMMARY_VI.md) - Tổng quan hệ thống
2. Đọc [backend/BACKEND_STRUCTURE.md](backend/BACKEND_STRUCTURE.md) - Cấu trúc backend
3. Đọc [backend/QUICK_REFERENCE.md](backend/QUICK_REFERENCE.md) - API reference
4. Đọc [API_FLOW_DOCUMENTATION.md](API_FLOW_DOCUMENTATION.md) - Luồng API

### Cho PM/QA
1. Đọc [SUMMARY_VI.md](SUMMARY_VI.md) - Tổng quan
2. Đọc [BAO_CAO_LUONG_API.md](BAO_CAO_LUONG_API.md) - Luồng nghiệp vụ
3. Xem các file FIX để hiểu các vấn đề đã được giải quyết

### Cho DevOps
1. Đọc [backend/BACKEND_STRUCTURE.md](backend/BACKEND_STRUCTURE.md) - Cấu trúc
2. Xem `docker-compose.yml` và `docker-compose.prod.yml`
3. Xem `scripts/` cho deployment scripts

## 🎯 Modules Chính

### Backend Modules (17)
1. **auth** - Authentication & Authorization
2. **users** - Quản lý người dùng
3. **classes** - Quản lý lớp học
4. **activities** - Quản lý hoạt động
5. **registrations** - Đăng ký hoạt động
6. **points** - Điểm rèn luyện
7. **semesters** - Quản lý học kỳ
8. **dashboard** - Dashboard & thống kê
9. **notifications** - Thông báo
10. **roles** - Vai trò & quyền
11. **profile** - Hồ sơ người dùng
12. **teachers** - Giảng viên
13. **search** - Tìm kiếm
14. **monitor** - Lớp trưởng
15. **exports** - Xuất dữ liệu
16. **activity-types** - Loại hoạt động
17. **notification-types** - Loại thông báo

## 🔒 Authentication & Authorization

### Roles
- **ADMIN** - Quản trị viên
- **GIANG_VIEN** - Giảng viên
- **LOP_TRUONG** - Lớp trưởng
- **SINH_VIEN** - Sinh viên

### Permissions
Xem chi tiết trong [backend/QUICK_REFERENCE.md](backend/QUICK_REFERENCE.md)

## 🗄️ Database

- **Type**: PostgreSQL
- **ORM**: Prisma
- **Schema**: `backend/prisma/schema.prisma`
- **Migrations**: Automatic via Prisma

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test                    # All tests
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests
npm run test:security      # Security tests

# Frontend tests
cd frontend
npm run e2e               # E2E tests with Playwright
```

## 📝 Status

### ✅ Hoàn thành
- [x] Backend refactoring & migration
- [x] Clean architecture implementation
- [x] Modular design
- [x] RBAC implementation
- [x] Semester management
- [x] Documentation

### 🔄 In Progress
- [ ] Frontend optimization
- [ ] Performance tuning
- [ ] Additional E2E tests

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Winston Logger
- Zod Validation

### Frontend
- React
- Tailwind CSS
- Axios
- React Router

### DevOps
- Docker
- Docker Compose
- Nginx
- PM2 (optional)

## 📞 Support & Contribution

### Tài liệu tham khảo
- Backend structure: `backend/BACKEND_STRUCTURE.md`
- API docs: `backend/QUICK_REFERENCE.md`
- Flow docs: `API_FLOW_DOCUMENTATION.md`

### Issues & Fixes
- Check các file `*_FIX.md` để xem các vấn đề đã được fix
- Check `MIGRATION_COMPLETE.md` để xem chi tiết migration

---

**Last Updated**: November 13, 2025  
**Version**: 2.0 (Post-migration)  
**Status**: ✅ Production Ready  
