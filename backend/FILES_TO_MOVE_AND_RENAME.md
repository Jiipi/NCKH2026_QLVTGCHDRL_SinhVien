# Danh Sách Files Cần Chuyển Đổi và Đổi Tên

## 📊 Tổng Quan

Các file cần chuyển về đúng vị trí trong modules và đổi tên để nhất quán.

---

## 🔄 Files Cần Chuyển Vị Trí

### 1. **admin-users.routes.js** - Chuyển từ `routes/` → `modules/admin-users/`

**Hiện tại:**
- `routes/admin-users.route.js` (tên file: `.route.js`)

**Cần:**
- Chuyển về: `modules/admin-users/admin-users.routes.js` (tên file: `.routes.js`)

**Lý do:**
- Để nhất quán với các module khác (tất cả routes đều nằm trong module)
- Tên file nên là `.routes.js` thay vì `.route.js`

**Cần cập nhật:**
- `app/routes.js`: Đổi import từ `routes/admin-users.route` → `modules/admin-users/admin-users.routes`

---

### 2. **admin-reports** - Chuyển từ `routes/` và `services/` → `modules/admin-reports/`

**Hiện tại:**
- `routes/admin-reports.route.js`
- `services/admin-reports.service.js`
- `services/admin-reports.repo.js`

**Cần:**
- Tạo module: `modules/admin-reports/`
- Chuyển files:
  - `routes/admin-reports.route.js` → `modules/admin-reports/admin-reports.routes.js`
  - `services/admin-reports.service.js` → `modules/admin-reports/admin-reports.service.js`
  - `services/admin-reports.repo.js` → `modules/admin-reports/admin-reports.repo.js`

**Lý do:**
- Để nhất quán với cấu trúc module
- Tất cả admin-related modules nên nằm trong `modules/`

**Cần cập nhật:**
- `app/routes.js`: Đổi import từ `routes/admin-reports.route` → `modules/admin-reports/admin-reports.routes`

---

## 🔤 Files Cần Đổi Tên

### 1. **admin-users.repository.js** → **admin-users.repo.js**

**Hiện tại:**
- `modules/admin-users/admin-users.repository.js`

**Cần:**
- Đổi tên: `modules/admin-users/admin-users.repo.js`

**Lý do:**
- Để nhất quán với các module khác (tất cả đều dùng `.repo.js`)

**Cần cập nhật:**
- Tất cả imports trong `modules/admin-users/` từ `admin-users.repository` → `admin-users.repo`

---

## ⚠️ Files Cần Tạo (Nếu Cần)

### 1. **monitor.repo.js** - Facade cho MonitorPrismaRepository

**Hiện tại:**
- `modules/monitor/infrastructure/repositories/MonitorPrismaRepository.js` (có)

**Cần:**
- Tạo `modules/monitor/monitor.repo.js` (facade) nếu cần truy cập từ bên ngoài module

**Lý do:**
- Để nhất quán với các module khác có `.repo.js` ở root
- Hoặc giữ nguyên nếu chỉ dùng trong module (qua use-cases)

**Quyết định:**
- Nếu controller dùng use-cases trực tiếp → Không cần
- Nếu có code khác cần truy cập repository → Cần tạo facade

### 2. **monitor.service.js** - Service Layer (Nếu Cần)

**Hiện tại:**
- Không có

**Cần:**
- Tạo `modules/monitor/monitor.service.js` nếu cần business logic layer

**Quyết định:**
- Nếu controller dùng use-cases trực tiếp → Không cần
- Nếu có business logic phức tạp → Cần tạo service

---

## 📋 Tổng Kết

### Files Cần Chuyển:
1. ✅ `routes/admin-users.route.js` → `modules/admin-users/admin-users.routes.js`
2. ✅ `routes/admin-reports.route.js` → `modules/admin-reports/admin-reports.routes.js`
3. ✅ `services/admin-reports.service.js` → `modules/admin-reports/admin-reports.service.js`
4. ✅ `services/admin-reports.repo.js` → `modules/admin-reports/admin-reports.repo.js`

### Files Cần Đổi Tên:
1. ✅ `admin-users.repository.js` → `admin-users.repo.js`

### Files Cần Tạo (Tùy Chọn):
1. ⚠️ `monitor.repo.js` - Nếu cần facade
2. ⚠️ `monitor.service.js` - Nếu cần service layer

---

## 🎯 Thứ Tự Thực Hiện

1. **Đổi tên admin-users.repository.js** → `admin-users.repo.js`
2. **Chuyển admin-users.routes.js** từ `routes/` → `modules/admin-users/`
3. **Tạo module admin-reports** và chuyển các files
4. **Kiểm tra monitor** xem có cần tạo service/repo không

