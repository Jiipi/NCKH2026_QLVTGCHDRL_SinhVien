# Phân Tích Các File Thiếu và Vị Trí Sai

## 📊 Tổng Quan

Phân tích các file service/repo/routes còn thiếu hoặc chưa đúng vị trí.

---

## ✅ Files Đã Ở Đúng Vị Trí

### 1. **profile**
- ✅ `profile.service.js` - `modules/profile/`
- ✅ `profile.repo.js` - `modules/profile/`
- ✅ `profile.routes.js` - `modules/profile/`

### 2. **roles**
- ✅ `roles.service.js` - `modules/roles/`
- ✅ `roles.repo.js` - `modules/roles/`
- ✅ `roles.routes.js` - `modules/roles/`

### 3. **search**
- ✅ `search.service.js` - `modules/search/`
- ✅ `search.repo.js` - `modules/search/`
- ✅ `search.routes.js` - `modules/search/`

### 4. **activity-types**
- ✅ `activity-types.service.js` - `modules/activity-types/`
- ✅ `activity-types.repo.js` - `modules/activity-types/`
- ✅ `activity-types.routes.js` - `modules/activity-types/`

### 5. **classes**
- ✅ `classes.service.js` - `modules/classes/`
- ✅ `classes.repo.js` - `modules/classes/`
- ✅ `classes.routes.js` - `modules/classes/`

### 6. **dashboard**
- ✅ `dashboard.service.js` - `modules/dashboard/`
- ✅ `dashboard.routes.js` - `modules/dashboard/`

### 7. **exports**
- ✅ `exports.service.js` - `modules/exports/`
- ✅ `exports.repo.js` - `modules/exports/`
- ✅ `exports.routes.js` - `modules/exports/`

### 8. **notification-types**
- ✅ `notification-types.service.js` - `modules/notification-types/`
- ✅ `notification-types.repo.js` - `modules/notification-types/`
- ✅ `notification-types.routes.js` - `modules/notification-types/`

---

## ⚠️ Files Cần Kiểm Tra/Chuyển Đổi

### 1. **admin-users** - Thiếu routes, tên file khác

**Hiện tại:**
- ✅ `admin-users.service.js` - `modules/admin-users/`
- ⚠️ `admin-users.repository.js` - `modules/admin-users/` (tên khác: `.repository.js` thay vì `.repo.js`)
- ❌ `admin-users.routes.js` - **THIẾU**

**Cần:**
- Đổi tên `admin-users.repository.js` → `admin-users.repo.js` (để nhất quán)
- Tìm hoặc tạo `admin-users.routes.js`

### 2. **monitor** - Thiếu service và repo ở root

**Hiện tại:**
- ✅ `monitor.routes.js` - `modules/monitor/`
- ✅ `infrastructure/repositories/MonitorPrismaRepository.js` - Có repository trong infrastructure
- ❌ `monitor.service.js` - **THIẾU** (có thể không cần nếu dùng use-cases trực tiếp)
- ❌ `monitor.repo.js` - **THIẾU** (có `MonitorPrismaRepository.js` trong infrastructure)

**Cần:**
- Kiểm tra xem có cần `monitor.service.js` không (nếu controller dùng use-cases trực tiếp thì không cần)
- Tạo `monitor.repo.js` facade nếu cần (hoặc giữ nguyên infrastructure repository)

---

## 🔍 Files Ở Vị Trí Khác (Cần Kiểm Tra)

### 1. **admin-reports**
- ⚠️ `services/admin-reports.service.js` - Nằm trong `services/` thay vì `modules/`
- ⚠️ `services/admin-reports.repo.js` - Nằm trong `services/` thay vì `modules/`

**Cần kiểm tra:**
- Có phải là module riêng không? Nếu có, nên tạo `modules/admin-reports/`
- Hoặc đây là service chung, giữ nguyên trong `services/`

---

## 📋 Tổng Kết

### Files Thiếu:
1. ❌ `modules/admin-users/admin-users.routes.js` - **THIẾU**
2. ❌ `modules/monitor/monitor.service.js` - **THIẾU** (có thể không cần)
3. ❌ `modules/monitor/monitor.repo.js` - **THIẾU** (có infrastructure repository)

### Files Cần Đổi Tên:
1. ⚠️ `admin-users.repository.js` → `admin-users.repo.js` (để nhất quán)

### Files Ở Vị Trí Khác:
1. ⚠️ `services/admin-reports.service.js` - Cần kiểm tra có phải module không
2. ⚠️ `services/admin-reports.repo.js` - Cần kiểm tra có phải module không

---

## 🎯 Khuyến Nghị

### 1. **admin-users**
- Tìm hoặc tạo `admin-users.routes.js`
- Đổi tên `admin-users.repository.js` → `admin-users.repo.js`

### 2. **monitor**
- Kiểm tra controller xem có dùng service không
- Nếu không dùng service, có thể giữ nguyên (chỉ dùng use-cases)
- Tạo `monitor.repo.js` facade nếu cần

### 3. **admin-reports**
- Kiểm tra xem có phải là module riêng không
- Nếu là module, tạo `modules/admin-reports/` và chuyển files vào

