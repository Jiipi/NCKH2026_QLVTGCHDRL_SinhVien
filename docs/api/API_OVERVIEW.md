# API Technical Overview

## 🏗️ Tổng quan API

REST API được thiết kế theo chuẩn RESTful với authentication JWT và phân quyền RBAC.

- **Base URL**: `/api`
- **Format**: JSON
- **Authentication**: Bearer Token (JWT)
- **Versioning**: URL-based (implicit)

---

## 🔐 Authentication

### Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/refresh-token` | Làm mới token |
| POST | `/api/auth/logout` | Đăng xuất |
| GET | `/api/auth/me` | Thông tin user hiện tại |

### Request Headers
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Success"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token expired"
  }
}
```

---

## 📚 API Modules

### 1. Activities (`/api/core/activities`)
| Method | Endpoint | Permission | Mô tả |
|--------|----------|------------|-------|
| GET | `/` | `activity.read` | Danh sách hoạt động |
| GET | `/:id` | `activity.read` | Chi tiết hoạt động |
| POST | `/` | `activity.write` | Tạo hoạt động mới |
| PUT | `/:id` | `activity.write` | Cập nhật hoạt động |
| DELETE | `/:id` | `activity.delete` | Xóa hoạt động |
| POST | `/:id/register` | `registration.write` | Đăng ký hoạt động |
| GET | `/:id/qr-data` | `activity.read` | Lấy QR data |

### 2. Registrations (`/api/core/registrations`)
| Method | Endpoint | Permission | Mô tả |
|--------|----------|------------|-------|
| GET | `/` | `registration.read` | Danh sách đăng ký |
| POST | `/:id/approve` | `registration.approve` | Phê duyệt đăng ký |
| POST | `/:id/reject` | `registration.approve` | Từ chối đăng ký |

### 3. Users (`/api/core/users`)
| Method | Endpoint | Permission | Mô tả |
|--------|----------|------------|-------|
| GET | `/` | `user.read` | Danh sách users |
| GET | `/:id` | `user.read` | Chi tiết user |
| PUT | `/:id` | `user.write` | Cập nhật user |
| DELETE | `/:id` | `user.delete` | Xóa user |

### 4. Classes (`/api/core/classes`)
| Method | Endpoint | Permission | Mô tả |
|--------|----------|------------|-------|
| GET | `/` | `class.read` | Danh sách lớp |
| GET | `/:id` | `class.read` | Chi tiết lớp |
| GET | `/:id/students` | `class.read` | Sinh viên trong lớp |

### 5. Semesters (`/api/core/semesters`)
| Method | Endpoint | Permission | Mô tả |
|--------|----------|------------|-------|
| GET | `/` | `semester.read` | Danh sách học kỳ |
| GET | `/current` | Public | Học kỳ hiện tại |
| POST | `/` | `semester.write` | Tạo học kỳ |

### 6. Dashboard (`/api/core/dashboard`)
| Method | Endpoint | Permission | Mô tả |
|--------|----------|------------|-------|
| GET | `/student` | `dashboard.student` | Stats sinh viên |
| GET | `/teacher` | `dashboard.teacher` | Stats giảng viên |
| GET | `/monitor` | `dashboard.monitor` | Stats lớp trưởng |
| GET | `/admin` | `dashboard.admin` | Stats admin |

### 7. Reports (`/api/core/reports`)
| Method | Endpoint | Permission | Mô tả |
|--------|----------|------------|-------|
| GET | `/activities` | `report.read` | Báo cáo hoạt động |
| GET | `/points` | `report.read` | Báo cáo điểm |
| GET | `/export/excel` | `export.write` | Xuất Excel |

---

## 🔒 Authorization (RBAC)

### Roles
| Role | Code | Mô tả |
|------|------|-------|
| Sinh viên | `SINH_VIEN` | Xem và đăng ký hoạt động |
| Giảng viên | `GIANG_VIEN` | Quản lý lớp, phê duyệt |
| Lớp trưởng | `LOP_TRUONG` | Quản lý lớp, điểm danh |
| Admin | `ADMIN` | Full access |

### Permission Format
```
<resource>.<action>

Ví dụ:
- activity.read
- activity.write
- registration.approve
- user.delete
```

---

## 📝 Query Parameters

### Pagination
```
?page=1&limit=20
```

### Filtering
```
?hoc_ky=hoc_ky_1-2025&trang_thai=DA_PHE_DUYET
```

### Sorting
```
?sortBy=ngay_bat_dau&sortOrder=desc
```

### Search
```
?search=hoat+dong+ngoai+khoa
```

---

## 📊 Response Codes

| Code | Mô tả |
|------|-------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Server Error |

---

## 🔄 Rate Limiting

- **Rate**: 100 requests/minute per IP
- **Burst**: 10 requests/second
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

---

## 📖 Additional Resources

- **OpenAPI Spec**: `docs/api/openapi.yaml`
- **Postman Collection**: `docs/api/postman_collection.json`
- **Backend Docs**: `docs/backend/BACKEND_OVERVIEW.md`

---

*Cập nhật: Tháng 12/2025*
