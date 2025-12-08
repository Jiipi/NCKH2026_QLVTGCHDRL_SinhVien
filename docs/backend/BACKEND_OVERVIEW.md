# Backend Technical Overview

## 🏗️ Kiến trúc tổng quan

Backend được xây dựng theo **Clean Architecture** với các layer tách biệt rõ ràng, đảm bảo tính bảo trì và mở rộng.

```
backend/src/
├── app/              # Application Layer - Khởi tạo và cấu hình
├── business/         # Business Layer - Logic nghiệp vụ chung
├── core/             # Core Layer - Framework utilities (41 files)
├── data/             # Data Layer - Kết nối và seed data
├── modules/          # Modules Layer - 19 feature modules
└── presentation/     # Presentation Layer - Controllers & Routes
```

---

## 📦 Modules (19 domain modules)

| Module | Mô tả | Files |
|--------|-------|-------|
| `activities` | Quản lý hoạt động rèn luyện | 24 |
| `activity-types` | Loại hoạt động | 12 |
| `admin-reports` | Báo cáo admin | 11 |
| `admin-users` | Quản lý users (admin) | 22 |
| `auth` | Xác thực & phân quyền | 20 |
| `classes` | Quản lý lớp học | 17 |
| `dashboard` | Dashboard & thống kê | 11 |
| `exports` | Xuất dữ liệu Excel/PDF | 9 |
| `monitor` | Chức năng lớp trưởng | 13 |
| `notification-types` | Loại thông báo | 12 |
| `notifications` | Hệ thống thông báo | 17 |
| `points` | Điểm rèn luyện | 11 |
| `profile` | Hồ sơ người dùng | 13 |
| `registrations` | Đăng ký hoạt động | 23 |
| `roles` | Vai trò & quyền hạn | 13 |
| `search` | Tìm kiếm | 7 |
| `semesters` | Quản lý học kỳ | 22 |
| `teachers` | Chức năng giảng viên | 29 |
| `users` | Quản lý người dùng | 19 |

---

## 🔧 Core Layer

Core layer cung cấp các utilities và framework chung:

- **Authentication**: JWT handling, token refresh
- **Authorization**: RBAC, permission middleware
- **Validation**: Zod schemas
- **Error Handling**: Centralized error handler
- **Logging**: Winston logger
- **Database**: Prisma ORM client
- **Utils**: Date, string, file utilities

## 🔐 Authentication & Authorization

### JWT Flow
1. User login → Server tạo access token + refresh token
2. Client gửi access token trong header `Authorization: Bearer <token>`
3. Middleware verify token và inject user vào `req.user`

### RBAC (Role-Based Access Control)
- **Roles**: SINH_VIEN, GIANG_VIEN, LOP_TRUONG, ADMIN
- **Permissions**: Dynamic permissions per role
- **Middleware**: `checkPermission('activity.write')`

---

## 📊 Database

- **ORM**: Prisma
- **Database**: PostgreSQL
- **Migrations**: Prisma Migrate

### Main Tables
- `users` - Người dùng
- `hoat_dong` - Hoạt động
- `hoc_ky` - Học kỳ
- `lop` - Lớp học
- `diem_ren_luyen` - Điểm rèn luyện
- `dang_ky_hoat_dong` - Đăng ký hoạt động

---

## 🚀 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime |
| **Express.js** | Web framework |
| **Prisma** | ORM |
| **MySQL** | Database |
| **JWT** | Authentication |
| **Zod** | Validation |
| **Winston** | Logging |
| **Docker** | Containerization |

---

## 📝 Scripts

```bash
npm run dev        # Development với nodemon
npm run start      # Production
npm run test       # Chạy tests
npm run migrate    # Database migrations
npm run seed       # Seed data
```

---

*Cập nhật: Tháng 12/2025*
