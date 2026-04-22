# Lộ trình khắc phục: Scope + Semester + Auth thống nhất

Ngày tạo: 17/02/2026
Trạng thái: 🟡 In progress

---

## Tổng quan vấn đề

Hệ thống hiện có 3 vấn đề gốc rễ:
1. **Data scope không nhất quán**: `classScope` chỉ mount trên activities module, còn registrations/points/dashboard không có
2. **Semester không có entity riêng**: Lưu dạng 2 cột trên `hoat_dong`, active semester lưu file JSON
3. **3 hệ thống auth chồng chéo**: `authorizeRoles`, `requirePermission` (CASL), `requireDynamicPermission` (DB-based)

---

## Phase 1: Chặn lỗ hổng data — Global Scope Middleware (Tuần 1)

### SCOPE-001: Refactor classScope thành global middleware
- **Trạng thái**: 🟡 In progress
- **File**: `backend/src/core/http/middleware/classScope.ts`
- **Thay đổi**: Giữ nguyên logic `extractClassContext` + `applyClassScope`, thêm scope cho registrations/points/dashboard
- **Cách làm**: Mount scope middleware ở `routes.ts` cấp `/core/*` thay vì từng module

### SCOPE-002: Mount scope lên registrations routes
- **Trạng thái**: 🟡 In progress
- **File**: `backend/src/modules/registrations/presentation/routes/registrations.routes.ts`
- **Thay đổi**: Thêm `extractClassContext` + `applyClassScope()` sau `authJwt`

### SCOPE-003: Mount scope lên points routes
- **Trạng thái**: 🟡 In progress
- **File**: `backend/src/modules/points/presentation/routes/points.routes.ts`
- **Thay đổi**: Thêm `extractClassContext` + `applyClassScope()`, thêm `requireDynamicPermission` cho `/filter-options` và `/report`

### SCOPE-004: Mount scope lên dashboard routes
- **Trạng thái**: 🟡 In progress
- **File**: `backend/src/modules/dashboard/presentation/routes/dashboard.routes.ts`
- **Thay đổi**: Thêm `extractClassContext` + `applyClassScope()`, thêm permission checks

### SCOPE-005: Xoá dead code scopeBuilder + scopeMiddleware
- **Trạng thái**: ⬜ Not started
- **Files**: `backend/src/app/scopes/scopeBuilder.ts`, `backend/src/app/scopes/scopeMiddleware.ts`
- **Thay đổi**: Xoá 2 file, cập nhật imports ở `ListRegistrationsUseCase.ts`

### SCOPE-006: Dọn console.log debug trong activities routes
- **Trạng thái**: ⬜ Not started
- **File**: `backend/src/modules/activities/presentation/routes/activities.routes.ts`

---

## Phase 2: Chuẩn hóa Semester (Tuần 2-3)

### SEM-001: Tạo model HocKyNamHoc trong Prisma schema
- **Trạng thái**: ⬜ Not started
- **File**: `backend/prisma/schema.prisma`
- **Schema**:
  ```prisma
  model HocKyNamHoc {
    id               String          @id @default(uuid()) @db.Uuid
    nam_hoc_bat_dau  Int             // 2025 = năm học 2025-2026
    hoc_ky           Int             @db.SmallInt // 1, 2
    ngay_bat_dau     DateTime        @db.Timestamp(6)
    ngay_ket_thuc    DateTime        @db.Timestamp(6)
    trang_thai       TrangThaiHocKyNamHoc @default(du_kien)
    ngay_tao         DateTime        @default(now()) @db.Timestamp(6)
    ngay_cap_nhat    DateTime        @default(now()) @updatedAt @db.Timestamp(6)
    
    hoat_dong        HoatDong[]
    
    @@unique([nam_hoc_bat_dau, hoc_ky])
    @@map("hoc_ky_nam_hoc")
  }
  
  enum TrangThaiHocKyNamHoc {
    du_kien
    dang_hoat_dong
    da_dong
  }
  ```

### SEM-002: Prisma migration — populate bảng mới
- **Trạng thái**: ⬜ Not started

### SEM-003: Thêm FK semester_id vào HoatDong + backfill
- **Trạng thái**: ⬜ Not started

### SEM-004: Tạo semester filter middleware
- **Trạng thái**: ⬜ Not started
- **File mới**: `backend/src/core/http/middleware/semesterScope.ts`

### SEM-005: Chuyển active semester từ file JSON sang DB
- **Trạng thái**: ⬜ Not started

---

## Phase 3: Thống nhất Authorization (Tuần 3-4)

### AUTH-001: Chọn dynamicPermission làm hệ thống chính
- **Trạng thái**: ⬜ Not started

### AUTH-002: Migrate CASL rules sang dynamicPermission
- **Trạng thái**: ⬜ Not started
- **File**: `backend/src/modules/semesters/presentation/routes/semesters.routes.ts`

### AUTH-003: Xoá ability.ts + requirePermission
- **Trạng thái**: ⬜ Not started
- **File**: `backend/src/core/policies/ability.ts`

### AUTH-004: Fix role BAN_CAN_SU
- **Trạng thái**: ⬜ Not started

### AUTH-005: Audit 100% routes có auth + permission + scope
- **Trạng thái**: ⬜ Not started

---

## Phase 4: Shared Query Builder (Tuần 4-5)

### QUERY-001: Tạo shared buildDataScope helper
- **Trạng thái**: ⬜ Not started
- **File mới**: `backend/src/core/utils/queryScope.ts`

### QUERY-002: Refactor repositories dùng chung helper
- **Trạng thái**: ⬜ Not started

### QUERY-003: Integration tests scope correctness
- **Trạng thái**: ⬜ Not started

---

## Tracking

| Phase | Tickets | Done | % |
|-------|---------|------|---|
| Phase 1 | 6 | 0 | 0% |
| Phase 2 | 5 | 0 | 0% |
| Phase 3 | 5 | 0 | 0% |
| Phase 4 | 3 | 0 | 0% |
| **Total** | **19** | **0** | **0%** |
