# 🎯 MIGRATION GUIDE: V1 → V2 API

## ✅ ĐÃ HOÀN THÀNH

### Backend V2 Architecture
- ✅ **Policy System** - Centralized permissions (`shared/policies`)
- ✅ **Scope Builder** - Auto-filter by role (`shared/scopes`)
- ✅ **CRUD Factory** - Generic router generation (`shared/factories`)
- ✅ **Error Handling** - Consistent error responses (`shared/errors`)
- ✅ **Activities Module** - Full CRUD with new architecture

### Test Results
```
✅ All unit tests PASSED
✅ Module loading verified
✅ Policy system verified
✅ Scope builder verified
✅ Error classes verified
```

---

## 📊 SO SÁNH V1 vs V2

### Old Architecture (V1)
```
❌ activities.route.js: 1591 dòng
❌ Logic trộn lẫn trong routes
❌ Duplicate code giữa các role
❌ Phân quyền rải rác
```

### New Architecture (V2)
```
✅ activities.routes.js: ~100 dòng (GIẢM 93%!)
✅ Tách rõ: Repo → Service → Routes
✅ Dùng chung factory pattern
✅ Phân quyền tập trung
```

---

## 🚀 API ENDPOINTS

### V2 Activities API (Recommended)

**Base URL:** `/api/v2/activities`

#### 1. List Activities (với scope tự động)
```http
GET /api/v2/activities
Headers: Authorization: Bearer <token>
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 20, max: 100)
  - semester: string (hoc_ky_1-2024, hoc_ky_2-2024)
  - q: string (search text)
  - loaiId: string (activity type ID)
  - trangThai: string (cho_duyet, da_duyet, tu_choi)
  - status: string (open, soon, closed)
  - from: date
  - to: date
  - sort: string (default: ngay_bd)
  - order: string (asc, desc)

Response:
{
  "success": true,
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  },
  "message": "Lấy danh sách thành công"
}

✅ AUTO SCOPE:
- ADMIN: Thấy tất cả
- GIANG_VIEN: Chỉ thấy hoạt động của lớp mình phụ trách
- LOP_TRUONG/SINH_VIEN: Chỉ thấy hoạt động của lớp mình
```

#### 2. Get Activity by ID
```http
GET /api/v2/activities/:id
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "ten_hd": "...",
    "is_creator": true,
    "can_edit": true,
    "can_delete": false,
    ...
  }
}

✅ AUTO SCOPE: Chỉ thấy nếu thuộc phạm vi của mình
```

#### 3. Create Activity
```http
POST /api/v2/activities
Headers: Authorization: Bearer <token>
Body:
{
  "ten_hd": "Tên hoạt động",
  "mo_ta": "Mô tả",
  "loai_hd_id": "uuid",
  "ngay_bd": "2024-12-01",
  "ngay_kt": "2024-12-05",
  "han_dk": "2024-11-25",
  "so_luong_max": 50,
  "hinh_anh": ["/uploads/..."],
  "tep_dinh_kem": []
}

Response:
{
  "success": true,
  "data": { ... },
  "message": "Tạo mới thành công"
}

✅ AUTO FEATURES:
- Tự động set nguoi_tao_id
- Tự động infer hoc_ky, nam_hoc từ ngay_bd
- Tự động generate QR token
- Tự động ép lop_id theo scope (nếu không phải Admin)
```

#### 4. Update Activity
```http
PUT /api/v2/activities/:id
Headers: Authorization: Bearer <token>
Body: { ... fields to update ... }

Response:
{
  "success": true,
  "data": { ... },
  "message": "Cập nhật thành công"
}

✅ AUTO CHECKS:
- Ownership: Chỉ creator hoặc GIANG_VIEN/ADMIN mới sửa được
- Scope: Phải thuộc phạm vi quản lý
- Validation: Dates, required fields
```

#### 5. Delete Activity
```http
DELETE /api/v2/activities/:id
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": null,
  "message": "Xóa thành công"
}

✅ AUTO CHECKS:
- Permission: Chỉ GIANG_VIEN/ADMIN
- No registrations: Không thể xóa nếu đã có người đăng ký
```

#### 6. Approve Activity
```http
POST /api/v2/activities/:id/approve
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": { ... },
  "message": "Duyệt hoạt động thành công"
}

✅ Permission: GIANG_VIEN, ADMIN only
```

#### 7. Reject Activity
```http
POST /api/v2/activities/:id/reject
Headers: Authorization: Bearer <token>
Body:
{
  "reason": "Lý do từ chối"
}

Response:
{
  "success": true,
  "data": { ... },
  "message": "Từ chối hoạt động thành công"
}

✅ Permission: GIANG_VIEN, ADMIN only
```

#### 8. Get Activity Details (with registrations)
```http
GET /api/v2/activities/:id/details
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    ...activity fields,
    "dang_kys": [
      {
        "sinh_vien": { ... },
        "trang_thai_dk": "da_duyet"
      }
    ]
  }
}
```

---

## 🔐 PERMISSION MATRIX

| Action | ADMIN | GIANG_VIEN | LOP_TRUONG | SINH_VIEN |
|--------|-------|------------|------------|-----------|
| Read (list) | ✅ | ✅ | ✅ | ✅ |
| Read (detail) | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ✅ | ❌ |
| Update (own) | ✅ | ✅ | ✅ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ |
| Approve | ✅ | ✅ | ❌ | ❌ |
| Reject | ✅ | ✅ | ❌ | ❌ |

---

## 📦 SCOPE RULES

### ADMIN
- WHERE clause: `{}` (no restrictions)
- Sees: Tất cả hoạt động

### GIANG_VIEN (Teacher)
- WHERE clause: `{ lop_id: { in: [classId1, classId2, ...] } }`
- Sees: Chỉ hoạt động của các lớp mình phụ trách (chu_nhiem)

### LOP_TRUONG / SINH_VIEN
- WHERE clause: `{ lop_id: studentClassId }`
- Sees: Chỉ hoạt động của lớp mình

---

## 🧪 TESTING

### 1. Run Unit Tests
```bash
cd backend
node test-v2-api.js
```

### 2. Start Server
```bash
cd backend
npm run dev
```

### 3. Test with Postman/Thunder Client

**Get Token (Login first):**
```http
POST /api/auth/login
Body: { "email": "admin@example.com", "password": "..." }
```

**Test V2 List:**
```http
GET /api/v2/activities?page=1&limit=10&semester=hoc_ky_1-2024
Headers: Authorization: Bearer <your_token>
```

**Compare with V1:**
```http
GET /api/activities?page=1&limit=10&semester=hoc_ky_1-2024
Headers: Authorization: Bearer <your_token>
```

---

## 🎯 NEXT STEPS

### Phase 1: ✅ COMPLETED
- [x] Core infrastructure (policies, scopes, factories)
- [x] Activities module với V2 architecture
- [x] Unit tests
- [x] Integration với server

### Phase 2: IN PROGRESS
- [ ] Test với server thật
- [ ] Test tất cả roles (ADMIN, GIANG_VIEN, LOP_TRUONG, SINH_VIEN)
- [ ] Performance comparison V1 vs V2

### Phase 3: NEXT
- [ ] Registrations module (clone pattern từ Activities)
- [ ] Migrate frontend to use V2 API
- [ ] Remove V1 routes

---

## 📝 NOTES

### Error Responses
```json
{
  "success": false,
  "message": "Error message here",
  "details": { ... } // Optional
}
```

### Status Codes
- 200: Success
- 201: Created
- 400: Validation Error
- 401: Unauthorized (no token)
- 403: Forbidden (no permission)
- 404: Not Found
- 409: Conflict (duplicate, etc.)
- 500: Server Error

### Benefits of V2
1. ✅ **Giảm 93% code** - activities.routes.js từ 1591 → 100 dòng
2. ✅ **Tự động scope** - Không cần hardcode filter theo role
3. ✅ **Tập trung phân quyền** - 1 file policy duy nhất
4. ✅ **Dễ maintain** - Repo → Service → Routes rõ ràng
5. ✅ **Dễ test** - Mỗi layer có thể test riêng
6. ✅ **Dễ mở rộng** - Clone pattern cho module mới

---

**Generated:** 2025-11-10  
**Status:** ✅ Ready for Integration Testing
