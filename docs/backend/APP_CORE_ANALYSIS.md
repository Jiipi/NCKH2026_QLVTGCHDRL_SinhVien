# 📊 PHÂN TÍCH CHI TIẾT APP VÀ CORE FOLDERS

## 🎯 TỔNG QUAN

Tài liệu này phân tích chi tiết về cấu trúc và vai trò của hai folder quan trọng nhất trong ứng dụng:
- **`app/`** - Application Setup & Bootstrap Layer
- **`core/`** - Core Infrastructure & Utilities Layer

Cả hai folder này đều là **infrastructure layer** - không chứa business logic nhưng là nền tảng cần thiết để ứng dụng hoạt động.

---

## 📁 FOLDER `app/` - APPLICATION SETUP

Folder `app/` chứa các file cấu hình và setup cho Express application. Đây là lớp bootstrap của ứng dụng.

### 📂 Cấu trúc

```
app/
├── server.js              # Express app setup và middleware configuration
├── routes.js              # Central routing configuration
├── scopes/
│   ├── scopeBuilder.js    # Role-based data filtering (WHERE clause builder)
│   └── scopeMiddleware.js # Middleware để apply scope tự động
└── factories/
    └── crudRouter.js      # Factory để tạo CRUD endpoints tự động
```

---

### ✅ **1. `app/server.js`** ⭐⭐⭐⭐⭐

**Vai trò**: Entry point setup cho Express application

**Chức năng chính**:
- Tạo và cấu hình Express application
- Setup security middleware (CORS, Helmet, compression, rate limiting)
- Mount routes từ `app/routes.js`
- Serve static files (uploads, frontend build)
- Error handling (404, global error handler)
- Health check endpoint

**Được sử dụng bởi**:
- `src/index.js` (entry point chính của ứng dụng)

**Luồng hoạt động**:
```javascript
index.js → createServer() → Express app với tất cả middleware → routes → error handlers
```

**Kết luận**: ✅ **BẮT BUỘC PHẢI CÓ** - Không có file này ứng dụng không thể khởi động

---

### ✅ **2. `app/routes.js`** ⭐⭐⭐⭐⭐

**Vai trò**: Central routing configuration - tập trung tất cả routes

**Chức năng chính**:
- Mount tất cả routes từ các modules
- Tổ chức routing cho toàn bộ ứng dụng
- Kết nối legacy routes (V1) và V2 routes (module architecture)
- Health check route

**Cấu trúc routes**:
- **Legacy Routes (V1)**: `/api/auth`, `/api/users`, `/api/admin`, `/api/upload`
- **V2 Routes (Module Architecture)**: `/api/core/*` - sử dụng repository pattern
  - `/api/core/activities` - Quản lý hoạt động
  - `/api/core/registrations` - Quản lý đăng ký
  - `/api/core/users` - Quản lý người dùng
  - `/api/core/classes` - Quản lý lớp học
  - `/api/core/teachers` - Thao tác dành cho giảng viên
  - `/api/core/notifications` - Quản lý thông báo
  - `/api/core/points` - Điểm và điểm danh
  - `/api/core/dashboard` - Dashboard với thống kê
  - Và nhiều routes khác...

**Được sử dụng bởi**:
- `app/server.js` - Mount vào `/api` prefix

**Kết luận**: ✅ **BẮT BUỘC PHẢI CÓ** - Central routing hub, không có file này không có routes nào hoạt động

---

### ✅ **3. `app/scopes/scopeBuilder.js`** ⭐⭐⭐⭐⭐

**Vai trò**: Role-based access control (RBAC) - Tự động filter data dựa trên role

**Chức năng chính**:
- Build WHERE clause (Prisma filter) dựa trên user role
- Hỗ trợ scope filtering cho các role:
  - **ADMIN**: Thấy tất cả (empty WHERE clause)
  - **GIANG_VIEN**: Chỉ thấy data của các lớp mình phụ trách
  - **LOP_TRUONG / SINH_VIEN**: Chỉ thấy data của lớp mình
- Kiểm tra quyền truy cập item (`canAccessItem`) cho UPDATE/DELETE
- Build ownership scope (`buildOwnershipScope`) cho "my own" resources

**Các hàm chính**:
- `buildScope(resource, user)` - Build WHERE clause cho resource
- `canAccessItem(resource, itemId, user)` - Kiểm tra quyền truy cập item
- `buildOwnershipScope(resource, user)` - Build scope cho "my own" resources

**Resources được hỗ trợ**:
- `activities` - Hoạt động
- `registrations` - Đăng ký
- `students` - Sinh viên
- `classes` - Lớp học

**Được sử dụng bởi** (10+ files):
- `modules/users/business/services/ListUsersUseCase.js`
- `modules/users/business/services/SearchUsersUseCase.js`
- `modules/classes/business/services/ListClassesUseCase.js`
- `modules/registrations/business/services/ListRegistrationsUseCase.js`
- `modules/teachers/business/services/GetActivityHistoryUseCase.js`
- `modules/teachers/business/services/GetPendingActivitiesUseCase.js`
- `modules/activities/business/services/DeleteActivityUseCase.js`
- `modules/activities/business/services/UpdateActivityUseCase.js`
- Và nhiều use cases khác...

**Ví dụ sử dụng**:
```javascript
const { buildScope } = require('../../../../app/scopes/scopeBuilder');

async execute(dto, user) {
  const scope = await buildScope('activities', user);
  // scope = {} nếu ADMIN
  // scope = { nguoi_tao_id: { in: [...] } } nếu GIANG_VIEN
  // scope = { nguoi_tao_id: { in: [...] } } nếu SINH_VIEN
  
  const activities = await prisma.hoatDong.findMany({
    where: { ...scope, ...filters }
  });
}
```

**Kết luận**: ✅ **BẮT BUỘC PHẢI CÓ** - Core security feature, được dùng rộng rãi trong nhiều use cases để implement role-based data filtering

---

### ⚠️ **4. `app/scopes/scopeMiddleware.js`** ⭐⭐⭐

**Vai trò**: Middleware để tự động apply scope vào request

**Chức năng chính**:
- Middleware factory `applyScope(resource)` - Tự động inject scope vào `req.scope`
- Middleware `enforceScopeOnItem()` - Enforce scope trên item access (cho UPDATE/DELETE)

**Được sử dụng bởi**:
- `app/factories/crudRouter.js` - Sử dụng `applyScope` trong CRUD router factory

**Tình trạng sử dụng**:
- ⚠️ **KHÔNG được dùng trực tiếp** trong các routes hiện tại
- ✅ **Được dùng** bởi `crudRouter.js` (nhưng `crudRouter.js` cũng không được dùng)
- ✅ **Có thể hữu ích** cho tương lai nếu muốn tự động apply scope

**Kết luận**: ⚠️ **CÓ THỂ GIỮ LẠI** - Utility hữu ích, có thể dùng trong tương lai. Hiện tại không được dùng trực tiếp nhưng là abstraction tốt.

---

### ❌ **5. `app/factories/crudRouter.js`** ⭐⭐

**Vai trò**: Factory để tự động tạo CRUD endpoints

**Chức năng chính**:
- Tự động tạo CRUD endpoints (LIST, GET, CREATE, UPDATE, DELETE)
- Auto apply authentication, permissions, scope filtering
- Support pagination, filtering, sorting
- Custom routes support

**Được sử dụng bởi**:
- ❌ **KHÔNG TÌM THẤY** - Không có file nào import/sử dụng factory này

**Tình trạng**:
- Có vẻ là **legacy code** hoặc **code dự phòng** cho tương lai
- Hiện tại tất cả modules đều tự implement routes riêng
- Có thể hữu ích nếu muốn standardize CRUD operations

**Kết luận**: ⚠️ **CÓ THỂ XÓA HOẶC GIỮ LẠI** - Nếu không có kế hoạch sử dụng, có thể xóa để giảm code complexity. Nếu muốn standardize CRUD trong tương lai, giữ lại.

---

## 📁 FOLDER `core/` - CORE UTILITIES

Folder `core/` chứa tất cả các utilities và infrastructure code được dùng khắp nơi trong ứng dụng. Đây là **shared infrastructure layer**.

### 📂 Cấu trúc

```
core/
├── config/              # Configuration management
├── errors/              # Custom error classes
├── http/
│   ├── middleware/      # HTTP middleware (auth, CORS, validation, etc.)
│   └── response/        # API response utilities
├── logger/              # Logging utilities
├── policies/            # RBAC policies và rules
├── uploads/             # Upload directories
└── utils/               # Utility functions
```

---

### ✅ **1. `core/config/`** ⭐⭐⭐⭐⭐

**Vai trò**: Centralized configuration management

**Chức năng chính**:
- Load và validate environment variables
- Cấu hình cho:
  - Server (port, host, nodeEnv)
  - JWT (secret, expiresIn)
  - Database (url, logQueries)
  - CORS (origin, credentials)
  - Rate Limiting (windowMs, max)
  - File Upload (maxFileSize, allowedTypes)
  - Logging (level, format)
  - Security (bcryptRounds, sessionSecret)
  - Feature Flags (autoPointCalculation, emailNotifications)

**Được sử dụng bởi**:
- **341 matches** trong 186 files - **RẤT QUAN TRỌNG**
- Hầu hết mọi file trong ứng dụng đều import config

**Kết luận**: ✅ **BẮT BUỘC PHẢI CÓ** - Central configuration hub

---

### ✅ **2. `core/errors/`** ⭐⭐⭐⭐⭐

**Vai trò**: Custom error classes và error handling

**Chức năng chính**:
- `AppError` - Base error class với statusCode, isOperational, details
- Specific error classes:
  - `BadRequestError` (400)
  - `UnauthorizedError` (401)
  - `ForbiddenError` (403)
  - `NotFoundError` (404)
  - `ConflictError` (409)
  - `ValidationError` (422)
  - `InternalServerError` (500)
- `errorMapper.js` - Map errors to HTTP responses

**Được sử dụng bởi**:
- Hầu hết controllers và use cases
- Error handler middleware

**Kết luận**: ✅ **BẮT BUỘC PHẢI CÓ** - Standardized error handling

---

### ✅ **3. `core/http/middleware/`** ⭐⭐⭐⭐⭐

**Vai trò**: HTTP middleware cho Express

**Các middleware chính**:
- **Authentication & Authorization**:
  - `authJwt.js` - JWT authentication middleware
  - `classMonitor.js` - Class monitor middleware
  - `dynamicPermission.js` - Dynamic permission checking (real-time từ database)
- **Request Context**:
  - `requestContext.js` - Inject request context
- **Security**:
  - `cors.js` - CORS middleware
  - `sanitize.js` - Input sanitization
  - `rateLimiters.js` - Rate limiting
- **Validation**:
  - `validate.js` - Request validation
- **Error Handling**:
  - `errorHandler.js` - Global error handler
  - `notFound.js` - 404 handler
  - `asyncHandler.js` - Async error wrapper
- **Upload**:
  - `upload.js` - File upload middleware
  - `uploadAvatar.js` - Avatar upload
  - `uploadExcel.js` - Excel file upload
- **Business Logic**:
  - `semesterLock.middleware.js` - Semester lock checking
  - `sessionTracking.js` - Session tracking
  - `classScope.js` - Class scope middleware

**Được sử dụng bởi**:
- Tất cả routes và controllers
- `app/server.js` - Mount global middleware

**Kết luận**: ✅ **BẮT BUỘC PHẢI CÓ** - Core HTTP infrastructure

---

### ✅ **4. `core/http/response/`** ⭐⭐⭐⭐⭐

**Vai trò**: Standardized API response format

**Chức năng chính**:
- `ApiResponse` class với các methods:
  - `success(data, message)` - Success response
  - `error(message, statusCode, errors)` - Error response
  - `validationError(errors, message)` - Validation error
  - `notFound(message)` - 404 response
  - `unauthorized(message)` - 401 response
  - `forbidden(message)` - 403 response
  - `paginated(items, total, page, limit)` - Paginated response
- Helper functions:
  - `sendResponse(res, statusCode, data)`
  - `sendSuccess(res, data, message)`
  - `sendError(res, message, statusCode, errors)`

**Được sử dụng bởi**:
- Tất cả controllers để trả về response chuẩn

**Kết luận**: ✅ **BẮT BUỘC PHẢI CÓ** - Standardized API responses

---

### ✅ **5. `core/logger/`** ⭐⭐⭐⭐⭐

**Vai trò**: Logging utilities

**Chức năng chính**:
- `logInfo(message, context)` - Info logs
- `logError(message, error, context)` - Error logs
- `logWarn(message, context)` - Warning logs
- `logDebug(message, context)` - Debug logs

**Được sử dụng bởi**:
- Hầu hết services và controllers
- `app/server.js` - Request logging

**Kết luận**: ✅ **BẮT BUỘC PHẢI CÓ** - Centralized logging

---

### ✅ **6. `core/policies/`** ⭐⭐⭐⭐⭐

**Vai trò**: RBAC (Role-Based Access Control) policies và rules

**Chức năng chính**:
- `ability.js` - Core ability management
- Resource-specific rules:
  - `activity.rules.js` - Activity permissions
  - `user.rules.js` - User permissions
  - `class.rules.js` - Class permissions
  - `semester.rules.js` - Semester permissions
- `hasPermission(role, resource, action)` - Check permission
- `requirePermission(resource, action)` - Middleware để require permission

**Được sử dụng bởi**:
- Routes và middleware
- Controllers để check permissions

**Kết luận**: ✅ **BẮT BUỘC PHẢI CÓ** - RBAC system

---

### ✅ **7. `core/uploads/`** ⭐⭐⭐⭐

**Vai trò**: Upload directories structure

**Cấu trúc**:
- `attachments/` - File đính kèm
- `avatars/` - Avatar images
- `images/` - General images
- `temp/` - Temporary files

**Kết luận**: ✅ **CẦN THIẾT** - Storage structure cho uploaded files

---

### ✅ **8. `core/utils/`** ⭐⭐⭐⭐⭐

**Vai trò**: Utility functions được dùng khắp nơi

**Các utilities**:
- `excelParser.js` - Parse Excel files
- `logger.js` - Logger utilities (có thể duplicate với core/logger)
- `mailer.js` - Email sending
- `pagination.js` - Pagination helpers
- `paths.js` - Path utilities
- `prismaTx.js` - Prisma transaction helpers
- `response.js` - Response helpers (có thể duplicate với core/http/response)
- `roleHelper.js` - Role normalization và helpers
- `semester.js` - Semester utilities
- `validation.js` - Validation helpers

**Được sử dụng bởi**:
- Nhiều services và use cases

**Kết luận**: ✅ **BẮT BUỘC PHẢI CÓ** - Shared utilities

---

## 🔄 LUỒNG HOẠT ĐỘNG CỦA ỨNG DỤNG

### 1. **Application Bootstrap** (Startup)

```
index.js
  ↓
createServer() (app/server.js)
  ↓
Express app setup
  ├── Security middleware (CORS, Helmet, compression)
  ├── Rate limiting
  ├── Body parsing
  ├── Input sanitization
  ├── Request logging
  ├── Static files serving
  └── Routes mounting (app/routes.js)
      ↓
    Module routes
      ├── Legacy routes (V1)
      └── V2 routes (/api/core/*)
  ↓
Error handlers (404, global error handler)
```

### 2. **Request Flow** (Một request đi qua)

```
HTTP Request
  ↓
CORS middleware
  ↓
Rate limiting
  ↓
Body parsing
  ↓
Input sanitization
  ↓
Request logging
  ↓
Route matching (app/routes.js)
  ↓
Authentication middleware (authJwt)
  ↓
Permission checking (dynamicPermission)
  ↓
Controller handler
  ↓
Use Case (business logic)
  ├── Scope building (scopeBuilder.js) - nếu cần
  ├── Repository call
  └── Response formatting (apiResponse.js)
  ↓
Response
```

### 3. **Role-Based Data Filtering** (Scope System)

```
User request
  ↓
buildScope(resource, user) (scopeBuilder.js)
  ↓
Role check:
  ├── ADMIN → {} (no filter)
  ├── GIANG_VIEN → { lop_id: { in: [...] } }
  └── SINH_VIEN → { lop_id: user.lop_id }
  ↓
WHERE clause applied to Prisma query
  ↓
Filtered results
```

---

## 📊 TỔNG KẾT

### ✅ **GIỮ NGUYÊN - BẮT BUỘC**:

1. ✅ **`app/server.js`** - Entry point setup, không thể thiếu
2. ✅ **`app/routes.js`** - Central routing, không thể thiếu
3. ✅ **`app/scopes/scopeBuilder.js`** - RBAC data filtering, được dùng rộng rãi
4. ✅ **Toàn bộ `core/` folder** - Core infrastructure, được dùng khắp nơi

### ⚠️ **CẦN KIỂM TRA / CÓ THỂ TỐI ƯU**:

1. ⚠️ **`app/scopes/scopeMiddleware.js`** - Không được dùng trực tiếp, nhưng là utility hữu ích
2. ⚠️ **`app/factories/crudRouter.js`** - Không được dùng, có thể là legacy code
3. ⚠️ **`core/utils/logger.js`** - Có thể duplicate với `core/logger/`
4. ⚠️ **`core/utils/response.js`** - Có thể duplicate với `core/http/response/`

### 💡 **ĐỀ XUẤT**:

1. **Giữ nguyên** tất cả vì đều có vai trò quan trọng trong infrastructure
2. **Kiểm tra và xóa** `crudRouter.js` nếu không có kế hoạch sử dụng
3. **Giữ** `scopeMiddleware.js` vì có thể hữu ích cho tương lai
4. **Consolidate** duplicate utilities (logger, response) nếu có
5. **Document** thêm về cách sử dụng scope system cho developers mới

---

## 🎯 KẾT LUẬN

**Cả `app/` và `core/` đều CẦN THIẾT và NÊN GIỮ NGUYÊN**:

- **`app/`** = Application bootstrap và setup layer
  - Khởi tạo Express app
  - Cấu hình middleware
  - Mount routes
  - RBAC scope system

- **`core/`** = Core infrastructure và utilities layer
  - Configuration management
  - Error handling
  - HTTP middleware
  - Logging
  - Policies
  - Shared utilities

Chúng không phải là business logic, mà là **infrastructure layer** cần thiết cho ứng dụng hoạt động. Việc tách biệt này giúp:
- ✅ Code organization tốt hơn
- ✅ Reusability cao
- ✅ Maintainability dễ hơn
- ✅ Testing dễ hơn
- ✅ Separation of concerns rõ ràng

---

## 📝 GHI CHÚ

- Tài liệu này được tạo dựa trên phân tích codebase thực tế
- Số liệu "341 matches trong 186 files" được lấy từ kết quả search
- Một số file có thể có duplicate functionality (logger, response) - cần review và consolidate
- `crudRouter.js` có thể là code dự phòng cho tương lai hoặc legacy code
