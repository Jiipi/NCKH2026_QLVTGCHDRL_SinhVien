# Kế Hoạch Refactor Backend Theo Chuẩn 3 Tiers

## 📋 Phân Tích Hiện Trạng

### Cấu trúc hiện tại có vấn đề:
1. **Không đồng nhất**: Mỗi module có cấu trúc khác nhau
2. **Trộn lẫn layers**: Có application/, domain/, infrastructure/ (Clean Architecture) lẫn với 3 tiers
3. **File rải rác**: Nhiều file .repo.js, .service.js, .routes.js ở root module
4. **Duplicate**: Có file ở cả `src/presentation`, `src/business`, `src/data` và trong modules

### Modules hiện tại:
- ✅ **auth**: Đã refactor đúng 3 tiers
- ⚠️ **activities**: Có presentation/, business/, data/ nhưng vẫn còn application/, domain/, infrastructure/
- ❌ **Các modules khác**: Chưa refactor, vẫn dùng application/, domain/, infrastructure/

---

## 🎯 Cấu Trúc 3 Tiers Chuẩn Cuối Cùng

```
backend/src/
├── app/                          # App configuration (giữ nguyên)
│   ├── routes.js
│   ├── server.js
│   └── ...
├── core/                         # Core utilities (giữ nguyên)
│   ├── config/
│   ├── errors/
│   ├── http/
│   └── ...
├── infrastructure/               # Infrastructure (giữ nguyên - chỉ Prisma client)
│   └── prisma/
│       └── client.js
├── services/                     # Shared services (giữ nguyên)
│   └── ...
├── shared/                       # Shared utilities (giữ nguyên)
│   └── ...
└── modules/                      # Tất cả modules theo 3 tiers
    ├── auth/                     ✅ ĐÃ CHUẨN
    │   ├── presentation/
    │   │   ├── controllers/
    │   │   ├── routes/
    │   │   └── factories/
    │   ├── business/
    │   │   ├── services/        # Use cases, business services
    │   │   ├── validators/
    │   │   ├── dto/
    │   │   └── interfaces/
    │   └── data/
    │       └── repositories/
    │
    ├── activities/                ⚠️ CẦN REFACTOR
    │   ├── presentation/
    │   ├── business/
    │   └── data/
    │
    └── {other-modules}/          ❌ CẦN REFACTOR
        ├── presentation/
        ├── business/
        └── data/
```

---

## 📦 Cấu Trúc Chi Tiết Mỗi Module

### 1. PRESENTATION LAYER
```
presentation/
├── controllers/
│   └── {module}.controller.js    # HTTP request/response handlers
├── routes/
│   └── {module}.routes.js       # API route definitions
└── factories/                    # Dependency injection factories (optional)
    └── {module}.factory.js
```

**Chứa:**
- Controllers: Xử lý HTTP requests/responses
- Routes: Định nghĩa API endpoints
- Factories: Tạo instances với dependency injection

**KHÔNG chứa:**
- Business logic
- Data access logic
- Validation logic (chỉ gọi validators)

---

### 2. BUSINESS LAYER
```
business/
├── services/                     # Business logic, use cases
│   ├── {Action}UseCase.js       # Use cases (LoginUseCase, CreateActivityUseCase...)
│   └── {Feature}Service.js      # Business services (ActivityQRService...)
├── validators/
│   └── {module}.validators.js   # Zod validation schemas
├── dto/
│   └── {Action}Dto.js           # Data Transfer Objects
└── interfaces/                   # Business interfaces (optional)
    └── I{Service}.js
```

**Chứa:**
- Use Cases: Business logic cho từng action
- Services: Business services (QR, validation, enrichment...)
- Validators: Input validation schemas
- DTOs: Data transfer objects
- Interfaces: Contracts cho services

**KHÔNG chứa:**
- HTTP handling
- Database queries
- Prisma calls

---

### 3. DATA LAYER
```
data/
└── repositories/
    └── {module}.repository.js   # Pure Prisma queries
```

**Chứa:**
- Repositories: Chỉ chứa Prisma queries
- Pure data access, không có business logic

**KHÔNG chứa:**
- Business logic
- Validation
- HTTP handling

---

## 🗑️ CẦN XÓA

### 1. Thư mục không thuộc 3 tiers:
```
❌ modules/{module}/application/     → Di chuyển vào business/services/
❌ modules/{module}/domain/          → Di chuyển vào business/interfaces/
❌ modules/{module}/infrastructure/  → Di chuyển vào business/services/ hoặc xóa
```

### 2. File ở root module (di chuyển vào đúng tier):
```
❌ modules/{module}/{module}.repo.js      → data/repositories/{module}.repository.js
❌ modules/{module}/{module}.service.js   → business/services/
❌ modules/{module}/{module}.routes.js    → presentation/routes/{module}.routes.js
❌ modules/{module}/{module}.validators.js → business/validators/{module}.validators.js
```

### 3. Thư mục trống hoặc không cần:
```
❌ modules/{module}/services/              → Di chuyển vào business/services/
❌ modules/{module}/presentation/logs/   → Xóa (log files)
```

### 4. File duplicate ở src root:
```
❌ src/presentation/controllers/          → Đã di chuyển vào modules
❌ src/presentation/routes/               → Đã di chuyển vào modules
❌ src/business/validators/               → Đã di chuyển vào modules
❌ src/data/repositories/                 → Đã di chuyển vào modules (trừ BaseRepository nếu shared)
```

---

## 📝 QUY TẮC DI CHUYỂN

### Application → Business
```
application/use-cases/*.js        → business/services/{UseCase}.js
application/dto/*.js              → business/dto/{Dto}.js
```

### Domain → Business
```
domain/interfaces/*.js             → business/interfaces/{Interface}.js
domain/entities/*.js             → business/entities/{Entity}.js (nếu cần)
domain/value-objects/*.js         → business/value-objects/{VO}.js (nếu cần)
```

### Infrastructure → Business hoặc Xóa
```
infrastructure/services/*.js      → business/services/{Service}.js
infrastructure/repositories/*.js  → XÓA (đã có data/repositories/)
```

### Root Files → Đúng Tier
```
{module}.repo.js                 → data/repositories/{module}.repository.js
{module}.service.js              → business/services/{Module}Service.js
{module}.routes.js               → presentation/routes/{module}.routes.js
{module}.validators.js           → business/validators/{module}.validators.js
```

---

## ✅ KẾ HOẠCH THỰC HIỆN

### Phase 1: Hoàn thiện module activities
1. Di chuyển `application/use-cases/` → `business/services/`
2. Di chuyển `application/dto/` → `business/dto/`
3. Di chuyển `domain/interfaces/` → `business/interfaces/`
4. Di chuyển `infrastructure/services/` → `business/services/`
5. Di chuyển `services/` → `business/services/`
6. Xóa `application/`, `domain/`, `infrastructure/`

### Phase 2: Refactor các modules lớn
- registrations
- users
- teachers
- semesters
- admin-users

### Phase 3: Refactor các modules nhỏ
- activity-types
- classes
- dashboard
- exports
- monitor
- notification-types
- notifications
- points
- profile
- roles
- search

### Phase 4: Refactor các modules đơn giản
- admin-reports

### Phase 5: Cleanup
- Xóa các file duplicate ở src root
- Cập nhật tất cả imports
- Test toàn bộ modules

---

## 🔍 CHECKLIST SAU KHI REFACTOR

Mỗi module phải có:
- [ ] `presentation/controllers/` - Controllers
- [ ] `presentation/routes/` - Routes
- [ ] `business/services/` - Use cases & services
- [ ] `business/validators/` - Validators
- [ ] `business/dto/` - DTOs (nếu có)
- [ ] `data/repositories/` - Repositories

Mỗi module KHÔNG được có:
- [ ] `application/` - Đã di chuyển
- [ ] `domain/` - Đã di chuyển
- [ ] `infrastructure/` - Đã di chuyển
- [ ] File `.repo.js`, `.service.js`, `.routes.js` ở root

---

## 📊 THỐNG KÊ

### Modules cần refactor:
- ✅ auth (1) - ĐÃ HOÀN THÀNH
- ⚠️ activities (1) - ĐANG REFACTOR
- ❌ Còn lại (18 modules) - CHƯA REFACTOR

### Tổng số modules: 20

