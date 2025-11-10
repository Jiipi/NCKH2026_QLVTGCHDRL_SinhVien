# CẤU TRÚC MỚI FRONTEND & BACKEND

**Mục tiêu:** Cấu trúc lại codebase theo best practices để dễ mở rộng, bảo trì và giảm độ phức tạp

---

## 📁 CẤU TRÚC FRONTEND MỚI

### 🎯 Nguyên tắc thiết kế:
1. **Feature-based organization** - Tổ chức theo feature thay vì theo type
2. **Separation of concerns** - Tách biệt logic, UI, và data
3. **Reusability** - Components và hooks có thể tái sử dụng
4. **Scalability** - Dễ thêm features mới
5. **Maintainability** - Dễ tìm và sửa code

---

### 📂 Cấu trúc Frontend mới (Proposed)

```
frontend/src/
├── app/                          # App-level configuration
│   ├── App.js                    # Main app component (simplified)
│   ├── App.css                   # Global styles
│   ├── routes/                   # Route configuration
│   │   ├── index.js              # Route definitions
│   │   ├── AdminRoutes.js        # Admin routes
│   │   ├── StudentRoutes.js      # Student routes
│   │   ├── TeacherRoutes.js      # Teacher routes
│   │   ├── MonitorRoutes.js      # Monitor routes
│   │   └── PublicRoutes.js       # Public routes (auth)
│   ├── providers/                # Context providers
│   │   ├── AppProvider.js        # Main app provider
│   │   ├── AuthProvider.js       # Auth context
│   │   └── NotificationProvider.js # Notification context
│   └── guards/                   # Route guards
│       ├── AuthGuard.js          # Authentication guard
│       ├── RoleGuard.js          # Role-based guard
│       └── PublicGuard.js        # Public route guard
│
├── features/                     # Feature-based modules (NEW STRUCTURE)
│   ├── auth/                     # Authentication feature
│   │   ├── components/
│   │   │   ├── LoginForm.js
│   │   │   ├── RegisterForm.js
│   │   │   └── ForgotPasswordForm.js
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useLogin.js
│   │   ├── services/
│   │   │   └── authApi.js
│   │   ├── pages/
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   └── ForgotPasswordPage.js
│   │   └── index.js              # Feature exports
│   │
│   ├── activities/               # Activities feature
│   │   ├── components/
│   │   │   ├── ActivityCard.js
│   │   │   ├── ActivityGrid.js
│   │   │   ├── ActivityList.js
│   │   │   ├── ActivityDetail.js
│   │   │   └── ActivityFilters.js
│   │   ├── hooks/
│   │   │   ├── useActivitiesList.js
│   │   │   ├── useActivityFilters.js
│   │   │   ├── useActivityDetail.js
│   │   │   └── useActivityRegistration.js
│   │   ├── services/
│   │   │   └── activitiesApi.js
│   │   ├── pages/
│   │   │   ├── ActivitiesListPage.js
│   │   │   ├── ActivityDetailPage.js
│   │   │   └── CreateActivityPage.js
│   │   ├── types/
│   │   │   └── activity.types.js
│   │   └── index.js
│   │
│   ├── registrations/            # Registrations feature
│   │   ├── components/
│   │   │   ├── RegistrationCard.js
│   │   │   └── RegistrationStatus.js
│   │   ├── hooks/
│   │   │   ├── useRegistrations.js
│   │   │   └── useRegistrationActions.js
│   │   ├── services/
│   │   │   └── registrationsApi.js
│   │   └── pages/
│   │       └── MyRegistrationsPage.js
│   │
│   ├── dashboard/                # Dashboard feature
│   │   ├── components/
│   │   │   ├── DashboardStats.js
│   │   │   ├── DashboardChart.js
│   │   │   └── DashboardCard.js
│   │   ├── hooks/
│   │   │   └── useDashboardData.js
│   │   ├── services/
│   │   │   └── dashboardApi.js
│   │   └── pages/
│   │       ├── AdminDashboardPage.js
│   │       ├── StudentDashboardPage.js
│   │       └── TeacherDashboardPage.js
│   │
│   ├── users/                    # Users feature
│   │   ├── components/
│   │   │   ├── UserCard.js
│   │   │   ├── UserList.js
│   │   │   └── UserForm.js
│   │   ├── hooks/
│   │   │   └── useUsers.js
│   │   ├── services/
│   │   │   └── usersApi.js
│   │   └── pages/
│   │       └── UsersManagementPage.js
│   │
│   ├── notifications/            # Notifications feature
│   │   ├── components/
│   │   │   ├── NotificationList.js
│   │   │   └── NotificationItem.js
│   │   ├── hooks/
│   │   │   └── useNotifications.js
│   │   ├── services/
│   │   │   └── notificationsApi.js
│   │   └── pages/
│   │       └── NotificationsPage.js
│   │
│   ├── profile/                  # Profile feature
│   │   ├── components/
│   │   │   ├── ProfileForm.js
│   │   │   ├── ProfileAvatar.js
│   │   │   └── ProfileTabs.js
│   │   ├── hooks/
│   │   │   └── useProfile.js
│   │   ├── services/
│   │   │   └── profileApi.js
│   │   └── pages/
│   │       └── ProfilePage.js
│   │
│   └── qr-attendance/            # QR Attendance feature
│       ├── components/
│       │   ├── QRScanner.js
│       │   └── QRAttendanceList.js
│       ├── hooks/
│       │   └── useQRAttendance.js
│       ├── services/
│       │   └── qrAttendanceApi.js
│       └── pages/
│           └── QRAttendancePage.js
│
├── shared/                       # Shared code across features
│   ├── components/               # Reusable UI components
│   │   ├── layout/
│   │   │   ├── AdminLayout.js
│   │   │   ├── StudentLayout.js
│   │   │   ├── TeacherLayout.js
│   │   │   └── MonitorLayout.js
│   │   ├── common/
│   │   │   ├── Button.js
│   │   │   ├── Input.js
│   │   │   ├── Select.js
│   │   │   ├── Modal.js
│   │   │   ├── Card.js
│   │   │   ├── LoadingSpinner.js
│   │   │   ├── ErrorMessage.js
│   │   │   ├── EmptyState.js
│   │   │   └── Pagination.js
│   │   ├── forms/
│   │   │   ├── FormField.js
│   │   │   ├── FormSelect.js
│   │   │   └── FormDatePicker.js
│   │   └── filters/
│   │       ├── FilterPanel.js
│   │       └── FilterChip.js
│   │
│   ├── hooks/                    # Reusable hooks
│   │   ├── usePagination.js
│   │   ├── useDebounce.js
│   │   ├── useModal.js
│   │   ├── useForm.js
│   │   └── useLocalStorage.js
│   │
│   ├── services/                 # Shared services
│   │   ├── api/
│   │   │   ├── client.js         # API client (axios instance)
│   │   │   ├── interceptors.js  # Request/response interceptors
│   │   │   └── index.js          # API exports
│   │   ├── storage/
│   │   │   ├── sessionStorage.js
│   │   │   └── localStorage.js
│   │   └── utils/
│   │       ├── sessionManager.js
│   │       └── errorHandler.js
│   │
│   ├── store/                    # Global state management
│   │   ├── slices/
│   │   │   ├── authSlice.js
│   │   │   ├── uiSlice.js
│   │   │   └── preferencesSlice.js
│   │   └── index.js              # Store configuration
│   │
│   ├── utils/                    # Utility functions
│   │   ├── dateFormat.js
│   │   ├── role.js
│   │   ├── activityImages.js
│   │   ├── avatarUtils.js
│   │   └── validation.js
│   │
│   ├── constants/                # Constants
│   │   ├── routes.js
│   │   ├── roles.js
│   │   └── status.js
│   │
│   └── types/                    # TypeScript types (nếu dùng TS)
│       └── index.d.ts
│
├── assets/                       # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── styles/                       # Global styles
│   ├── index.css                 # Global CSS
│   ├── variables.css             # CSS variables (colors, spacing)
│   ├── reset.css                 # CSS reset
│   └── themes/                   # Theme styles
│       ├── light.css
│       └── dark.css
│
├── config/                       # Configuration files
│   ├── routes.js                 # Route configuration
│   ├── api.js                    # API configuration
│   └── constants.js              # App constants
│
└── index.js                      # Entry point
```

---

## 📁 CẤU TRÚC BACKEND MỚI

### 🎯 Nguyên tắc thiết kế:
1. **Layered Architecture** - Tách biệt rõ ràng các layers
2. **Domain-Driven Design** - Tổ chức theo domain/feature
3. **Dependency Injection** - Dễ test và maintain
4. **Separation of Concerns** - Routes → Controllers → Services → Repositories
5. **Scalability** - Dễ scale và thêm features mới

---

### 📂 Cấu trúc Backend mới (Proposed)

```
backend/src/
├── app/                          # App-level configuration
│   ├── index.js                  # Entry point
│   ├── server.js                 # Server setup
│   └── config/                   # Configuration
│       ├── app.js                # App config
│       ├── database.js           # Database config
│       ├── env.js                # Environment variables
│       └── constants.js          # App constants
│
├── domain/                       # Domain/Feature modules (NEW STRUCTURE)
│   ├── auth/                     # Authentication domain
│   │   ├── controllers/
│   │   │   └── auth.controller.js
│   │   ├── services/
│   │   │   └── auth.service.js
│   │   ├── repositories/
│   │   │   └── auth.repository.js
│   │   ├── routes/
│   │   │   └── auth.routes.js
│   │   ├── validators/
│   │   │   └── auth.validator.js
│   │   ├── types/
│   │   │   └── auth.types.js
│   │   └── index.js
│   │
│   ├── activities/               # Activities domain
│   │   ├── controllers/
│   │   │   └── activities.controller.js
│   │   ├── services/
│   │   │   ├── activities.service.js
│   │   │   └── activity-scope.service.js
│   │   ├── repositories/
│   │   │   └── activities.repository.js
│   │   ├── routes/
│   │   │   └── activities.routes.js
│   │   ├── validators/
│   │   │   └── activities.validator.js
│   │   ├── types/
│   │   │   └── activity.types.js
│   │   └── index.js
│   │
│   ├── registrations/            # Registrations domain
│   │   ├── controllers/
│   │   │   └── registrations.controller.js
│   │   ├── services/
│   │   │   └── registrations.service.js
│   │   ├── repositories/
│   │   │   └── registrations.repository.js
│   │   ├── routes/
│   │   │   └── registrations.routes.js
│   │   ├── validators/
│   │   │   └── registrations.validator.js
│   │   └── index.js
│   │
│   ├── users/                    # Users domain
│   │   ├── controllers/
│   │   │   └── users.controller.js
│   │   ├── services/
│   │   │   └── users.service.js
│   │   ├── repositories/
│   │   │   └── users.repository.js
│   │   ├── routes/
│   │   │   └── users.routes.js
│   │   ├── validators/
│   │   │   └── users.validator.js
│   │   └── index.js
│   │
│   ├── dashboard/                # Dashboard domain
│   │   ├── controllers/
│   │   │   └── dashboard.controller.js
│   │   ├── services/
│   │   │   └── dashboard.service.js
│   │   ├── repositories/
│   │   │   └── dashboard.repository.js
│   │   ├── routes/
│   │   │   └── dashboard.routes.js
│   │   └── index.js
│   │
│   ├── notifications/            # Notifications domain
│   │   ├── controllers/
│   │   │   └── notifications.controller.js
│   │   ├── services/
│   │   │   └── notifications.service.js
│   │   ├── repositories/
│   │   │   └── notifications.repository.js
│   │   ├── routes/
│   │   │   └── notifications.routes.js
│   │   └── index.js
│   │
│   ├── points/                   # Points domain
│   │   ├── controllers/
│   │   │   └── points.controller.js
│   │   ├── services/
│   │   │   └── points.service.js
│   │   ├── repositories/
│   │   │   └── points.repository.js
│   │   ├── routes/
│   │   │   └── points.routes.js
│   │   └── index.js
│   │
│   └── qr-attendance/           # QR Attendance domain
│       ├── controllers/
│       │   └── qr-attendance.controller.js
│       ├── services/
│       │   └── qr-attendance.service.js
│       ├── repositories/
│       │   └── qr-attendance.repository.js
│       ├── routes/
│       │   └── qr-attendance.routes.js
│       └── index.js
│
├── shared/                       # Shared code across domains
│   ├── middleware/               # Shared middleware
│   │   ├── auth.middleware.js
│   │   ├── rbac.middleware.js
│   │   ├── error.middleware.js
│   │   ├── validation.middleware.js
│   │   ├── rateLimit.middleware.js
│   │   └── sanitize.middleware.js
│   │
│   ├── services/                 # Shared services
│   │   ├── logger.service.js
│   │   ├── mailer.service.js
│   │   ├── cache.service.js
│   │   └── file-upload.service.js
│   │
│   ├── repositories/             # Base repository
│   │   └── base.repository.js
│   │
│   ├── utils/                    # Utility functions
│   │   ├── logger.js
│   │   ├── response.js
│   │   ├── pagination.js
│   │   ├── validation.js
│   │   ├── date.js
│   │   └── errors.js
│   │
│   ├── errors/                   # Error classes
│   │   ├── AppError.js
│   │   ├── NotFoundError.js
│   │   ├── ValidationError.js
│   │   └── ForbiddenError.js
│   │
│   ├── types/                    # Type definitions
│   │   └── index.js
│   │
│   └── constants/                # Constants
│       ├── roles.js
│       ├── status.js
│       └── messages.js
│
├── infrastructure/               # Infrastructure layer
│   ├── database/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── connection.js
│   │
│   ├── cache/
│   │   └── redis.js
│   │
│   └── storage/
│       └── file-storage.js
│
├── tests/                        # Tests
│   ├── unit/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── utils/
│   ├── integration/
│   │   └── api/
│   └── e2e/
│
└── scripts/                      # Utility scripts
    ├── seed.js
    ├── migrate.js
    └── cleanup.js
```

---

## 📊 SO SÁNH CẤU TRÚC CŨ VS MỚI

### Frontend

#### ❌ Cấu trúc cũ (Hiện tại):
```
src/
├── components/          # 36 files lộn xộn, không phân loại
├── pages/              # 57 files, tổ chức theo role
├── hooks/              # 7 hooks, không phân loại
├── services/           # 4 services, không phân loại
├── utils/              # 7 utils, không phân loại
└── styles/             # 11 CSS files, không tổ chức
```

**Vấn đề:**
- ❌ Components quá lớn (1109, 1234, 1166 dòng)
- ❌ Logic lẫn với UI
- ❌ Khó tìm code
- ❌ Khó reuse components
- ❌ Khó test

#### ✅ Cấu trúc mới (Proposed):
```
src/
├── features/           # Tổ chức theo feature
│   ├── activities/
│   ├── auth/
│   └── ...
├── shared/            # Code dùng chung
│   ├── components/
│   ├── hooks/
│   └── services/
└── app/               # App-level config
```

**Lợi ích:**
- ✅ Dễ tìm code (theo feature)
- ✅ Dễ reuse (shared components)
- ✅ Dễ test (tách biệt logic)
- ✅ Dễ maintain (mỗi feature độc lập)
- ✅ Dễ scale (thêm feature mới dễ dàng)

---

### Backend

#### ❌ Cấu trúc cũ (Hiện tại):
```
src/
├── modules/           # 14 modules, tổ chức tốt
│   ├── activities/
│   │   ├── activities.repo.js
│   │   ├── activities.service.js
│   │   └── activities.routes.js
├── controllers/       # 9 controllers, không rõ thuộc module nào
├── services/          # 12 services, không rõ thuộc module nào
├── routes/            # 12 routes, không rõ thuộc module nào
└── middlewares/      # 12 middlewares, tổ chức tốt
```

**Vấn đề:**
- ❌ Controllers, services, routes tách rời modules
- ❌ Khó biết file nào thuộc feature nào
- ❌ Logic phức tạp trong services
- ❌ Thiếu validators trong modules

#### ✅ Cấu trúc mới (Proposed):
```
src/
├── domain/            # Tổ chức theo domain/feature
│   ├── activities/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── routes/
│   │   └── validators/
├── shared/            # Code dùng chung
│   ├── middleware/
│   ├── services/
│   └── utils/
└── infrastructure/    # Database, cache, storage
```

**Lợi ích:**
- ✅ Mỗi domain tự chứa (controllers, services, routes, validators)
- ✅ Dễ tìm code (theo domain)
- ✅ Dễ test (tách biệt layers)
- ✅ Dễ maintain (mỗi domain độc lập)
- ✅ Dễ scale (thêm domain mới dễ dàng)

---

## 🎯 MIGRATION PLAN

### Phase 1: Setup Structure (Tuần 1)
- [ ] Tạo cấu trúc thư mục mới
- [ ] Move shared code vào `shared/`
- [ ] Setup feature structure

### Phase 2: Migrate Features (Tuần 2-4)
- [ ] Migrate `activities` feature
- [ ] Migrate `auth` feature
- [ ] Migrate `registrations` feature
- [ ] Migrate các features khác

### Phase 3: Refactor Components (Tuần 3-5)
- [ ] Refactor large components
- [ ] Create shared components
- [ ] Update imports

### Phase 4: Cleanup (Tuần 5-6)
- [ ] Remove old structure
- [ ] Update documentation
- [ ] Test everything

---

## 📝 FILE TEMPLATES

### Frontend Feature Template

```javascript
// features/activities/index.js
export { default as ActivitiesListPage } from './pages/ActivitiesListPage';
export { default as ActivityDetailPage } from './pages/ActivityDetailPage';
export { useActivitiesList } from './hooks/useActivitiesList';
export { ActivityCard } from './components/ActivityCard';
```

### Backend Domain Template

```javascript
// domain/activities/index.js
const activitiesRoutes = require('./routes/activities.routes');
const activitiesService = require('./services/activities.service');
const activitiesRepo = require('./repositories/activities.repository');

module.exports = {
  routes: activitiesRoutes,
  service: activitiesService,
  repository: activitiesRepo,
};
```

---

## ✅ CHECKLIST MIGRATION

### Frontend
- [ ] Tạo cấu trúc `features/` và `shared/`
- [ ] Move components vào features
- [ ] Create shared components
- [ ] Refactor large components
- [ ] Update imports
- [ ] Test functionality

### Backend
- [ ] Tạo cấu trúc `domain/` và `shared/`
- [ ] Move modules vào domains
- [ ] Organize controllers, services, routes
- [ ] Create validators
- [ ] Update imports
- [ ] Test functionality

---

**Last updated:** $(date)  
**Status:** 🟡 Proposed Structure

