# Frontend Migration Plan - Feature-Sliced Design

## Ngày: 13/11/2025

## Phân tích Cấu trúc Hiện tại

### ✅ Đã tốt
```
frontend/src/
├── features/          # ✅ Đã có features (cần tổ chức lại)
├── hooks/             # ✅ Hooks chung
├── services/          # ✅ API services
├── shared/            # ✅ Shared utilities
├── store/             # ✅ State management
├── contexts/          # ✅ React contexts
└── pages/             # ✅ Pages theo role
```

### ❌ Cần cải thiện
1. **Components/ quá lớn** - Cần tách thành:
   - `shared/ui/` - UI primitives
   - `widgets/` - Layout components
   - `entities/` - Domain components

2. **Pages/ trộn lẫn** - Cần tổ chức theo role rõ ràng

3. **Features/ chưa đủ atomic** - Thiếu cấu trúc `ui/api/hooks/model`

4. **Thiếu entities/** - Các domain entities như User, Activity, Class

5. **Thiếu widgets/** - Layout và composite components

## Cấu trúc Mục tiêu (FSD)

```
frontend/src/
├── app/                          # 🆕 Application layer
│   ├── providers/
│   │   ├── RouterProvider.jsx    # Router + role guards
│   │   ├── AuthProvider.jsx      # Auth context
│   │   └── QueryClientProvider.jsx
│   ├── routes/
│   │   └── index.jsx             # Route definitions với guards
│   ├── store/                    # Global state (zustand/redux)
│   └── index.jsx
│
├── pages/                        # 🔄 Reorganize theo role
│   ├── dashboard-student/
│   │   └── index.js
│   ├── dashboard-monitor/
│   │   └── index.js
│   ├── dashboard-teacher/
│   │   └── index.js
│   ├── dashboard-admin/
│   │   └── index.js
│   ├── activities/
│   │   ├── list.js
│   │   └── detail.js
│   └── auth/
│       ├── login.js
│       └── forgot-password.js
│
├── widgets/                      # 🆕 Layout & composite components
│   ├── layout/
│   │   ├── AppLayout.js          # Main layout wrapper
│   │   ├── StudentLayout.js      # ← from components/
│   │   ├── TeacherLayout.js      # ← from components/
│   │   ├── MonitorLayout.js      # ← from components/
│   │   ├── AdminLayout.js        # ← from components/
│   │   ├── Sidebar.js            # Generic sidebar
│   │   └── Topbar.js             # Generic topbar
│   ├── header/
│   │   ├── ModernHeader.js       # ← from components/
│   │   └── MobileMenuButton.js   # ← from components/
│   ├── notifications/
│   │   ├── ToastHost.js          # ← from components/Toast
│   │   └── NotificationBell.js
│   └── semester/
│       ├── SemesterSwitcher.js   # ← from components/SemesterFilter
│       └── SemesterClosureBanner.js  # ← from components/
│
├── features/                     # 🔄 Reorganize với cấu trúc atomic
│   ├── auth/
│   │   ├── ui/
│   │   │   ├── LoginForm.js      # ← từ pages/auth/
│   │   │   └── ForgotPasswordForm.js
│   │   ├── api/
│   │   │   ├── login.js
│   │   │   └── forgotPassword.js
│   │   └── hooks/
│   │       └── useAuth.js
│   │
│   ├── activity-list/
│   │   ├── ui/
│   │   │   ├── ActivityList.js
│   │   │   └── ActivityFilters.js
│   │   ├── hooks/
│   │   │   └── useActivityList.js
│   │   └── api/
│   │       └── getActivities.js
│   │
│   ├── activity-create/
│   │   ├── ui/
│   │   │   └── ActivityForm.js
│   │   └── api/
│   │       └── createActivity.js
│   │
│   ├── activity-approve/
│   │   ├── ui/
│   │   │   └── ApproveDialog.js
│   │   └── api/
│   │       └── approveActivity.js
│   │
│   ├── registration-manage/
│   │   ├── ui/
│   │   │   ├── RegistrationList.js
│   │   │   └── RegistrationActions.js
│   │   └── api/
│   │       ├── getRegistrations.js
│   │       └── approveRegistration.js
│   │
│   ├── semester-switch/
│   │   ├── ui/
│   │   │   └── SemesterSwitcher.js
│   │   └── api/
│   │       └── switchSemester.js
│   │
│   ├── qr-attendance/
│   │   ├── ui/
│   │   │   ├── QRScanner.js
│   │   │   └── QRGenerator.js
│   │   └── api/
│   │       └── markAttendance.js
│   │
│   └── reports/
│       ├── ui/
│       │   ├── StudentReport.js
│       │   └── ClassReport.js
│       └── api/
│           ├── getStudentPoints.js
│           └── getClassReport.js
│
├── entities/                     # 🆕 Domain entities
│   ├── user/
│   │   ├── model/
│   │   │   ├── selectors.js      # User data selectors
│   │   │   └── user.mapper.js    # DTO mapping
│   │   ├── api/
│   │   │   ├── getMe.js
│   │   │   └── updateProfile.js
│   │   └── ui/
│   │       ├── Avatar.js         # ← from components/AvatarUpload
│   │       ├── UserCard.js
│   │       └── UserBadge.js
│   │
│   ├── class/
│   │   ├── model/
│   │   │   └── class.mapper.js
│   │   ├── api/
│   │   │   ├── getMyClass.js
│   │   │   └── getClassStudents.js
│   │   └── ui/
│   │       ├── ClassBadge.js
│   │       └── ClassCard.js
│   │
│   ├── activity/
│   │   ├── model/
│   │   │   └── activity.mapper.js
│   │   ├── api/
│   │   │   ├── getActivities.js
│   │   │   ├── getActivity.js
│   │   │   └── createActivity.js
│   │   └── ui/
│   │       ├── ActivityCard.js
│   │       ├── ActivityBadge.js
│   │       └── ActivityDetailModal.js  # ← from components/
│   │
│   ├── registration/
│   │   ├── model/
│   │   │   └── registration.mapper.js
│   │   ├── api/
│   │   │   ├── register.js
│   │   │   └── cancelRegistration.js
│   │   └── ui/
│   │       └── RegistrationStatus.js
│   │
│   └── semester/
│       ├── model/
│       │   └── semester.mapper.js
│       ├── api/
│       │   ├── getSemesters.js
│       │   └── getActiveSemester.js
│       └── ui/
│           └── SemesterBadge.js
│
├── shared/                       # 🔄 Reorganize shared utilities
│   ├── api/
│   │   ├── http.js               # ← from services/http.js
│   │   └── endpoints.js          # 🆕 Centralized endpoints
│   │
│   ├── ui/                       # 🆕 Atomic UI primitives
│   │   ├── Button/
│   │   │   └── Button.js
│   │   ├── Input/
│   │   │   └── Input.js
│   │   ├── Table/
│   │   │   └── Table.js          # ← from components/AdminTable
│   │   ├── Modal/
│   │   │   ├── Modal.js
│   │   │   └── ConfirmModal.js   # ← from components/
│   │   ├── Card/
│   │   │   └── Card.js           # ← from components/
│   │   ├── Pagination/
│   │   │   └── Pagination.js     # ← from components/
│   │   ├── FileUpload/
│   │   │   └── FileUpload.js     # ← from components/
│   │   └── EmptyState/
│   │       └── EmptyState.js     # ← from components/
│   │
│   ├── hooks/
│   │   ├── useAuth.js            # ← from hooks/
│   │   ├── usePagination.js      # ← from hooks/
│   │   ├── useDebounce.js        # ← from hooks/
│   │   └── useSafeNavigate.js    # ← from hooks/
│   │
│   ├── lib/
│   │   ├── formatter.js
│   │   ├── date.js               # ← from utils/dateFormat
│   │   └── avatar.js             # ← from utils/avatarUtils
│   │
│   ├── config/
│   │   └── constants.js
│   │
│   └── utils/
│       ├── role.js               # ← from utils/role
│       └── activityImages.js     # ← from utils/activityImages
│
├── contexts/                     # Keep as is (hoặc move vào app/providers)
│   ├── AuthContext.js
│   └── NotificationContext.js
│
└── styles/                       # Keep as is
    └── ...
```

## Mapping Chi tiết

### 1. Components → Widgets + Shared/UI + Entities

| Current | New Location | Type |
|---------|-------------|------|
| `StudentLayout.js` | `widgets/layout/StudentLayout.js` | Layout |
| `TeacherLayout.js` | `widgets/layout/TeacherLayout.js` | Layout |
| `MonitorLayout.js` | `widgets/layout/MonitorLayout.js` | Layout |
| `AdminStudentLayout.js` | `widgets/layout/AdminLayout.js` | Layout |
| `ModernHeader.js` | `widgets/header/ModernHeader.js` | Widget |
| `ModernFooter.js` | `widgets/footer/ModernFooter.js` | Widget |
| `SemesterFilter.js` | `widgets/semester/SemesterSwitcher.js` | Widget |
| `SemesterClosureBanner.js` | `widgets/semester/SemesterClosureBanner.js` | Widget |
| `Toast.js` | `widgets/notifications/ToastHost.js` | Widget |
| `ActivityDetailModal.js` | `entities/activity/ui/ActivityDetailModal.js` | Entity UI |
| `ActivityQRModal.js` | `features/qr-attendance/ui/QRModal.js` | Feature UI |
| `AvatarUpload.js` | `entities/user/ui/Avatar.js` | Entity UI |
| `Card.js` | `shared/ui/Card/Card.js` | Primitive |
| `Button.*` | `shared/ui/Button/Button.js` | Primitive |
| `Input.*` | `shared/ui/Input/Input.js` | Primitive |
| `Table.*` | `shared/ui/Table/Table.js` | Primitive |
| `Modal.*` | `shared/ui/Modal/Modal.js` | Primitive |
| `Pagination.js` | `shared/ui/Pagination/Pagination.js` | Primitive |
| `FileUpload.js` | `shared/ui/FileUpload/FileUpload.js` | Primitive |
| `EmptyState.js` | `shared/ui/EmptyState/EmptyState.js` | Primitive |

### 2. Pages → Pages (Reorganize)

| Current | New Location | Changes |
|---------|-------------|---------|
| `pages/student/Dashboard.js` | `pages/dashboard-student/index.js` | ✅ Compose widgets/features |
| `pages/teacher/ModernTeacherDashboard.js` | `pages/dashboard-teacher/index.js` | ✅ Compose widgets/features |
| `pages/monitor/...` | `pages/dashboard-monitor/index.js` | ✅ Compose widgets/features |
| `pages/admin/...` | `pages/dashboard-admin/index.js` | ✅ Compose widgets/features |
| `pages/activity/Activities.js` | `pages/activities/list.js` | ✅ Use features/activity-list |
| `pages/activity/ActivityDetail.js` | `pages/activities/detail.js` | ✅ Use entities/activity |
| `pages/auth/LoginModern.js` | `pages/auth/login.js` | ✅ Use features/auth |

### 3. Features → Features (Atomic structure)

| Current | New Structure |
|---------|--------------|
| `features/activities/` | `features/activity-list/` + `features/activity-create/` |
| `features/approvals/` | `features/activity-approve/` + `features/registration-approve/` |
| `features/auth/` | Keep, add `ui/`, `api/`, `hooks/` |
| `features/dashboard/` | Move logic to respective pages |
| `features/qr-attendance/` | Keep, add proper structure |
| `features/reports/` | Keep, add proper structure |

### 4. Services → Shared/API + Entities/API + Features/API

| Current | New Location |
|---------|-------------|
| `services/http.js` | `shared/api/http.js` |
| `services/authService.js` | `features/auth/api/` |
| `services/activityService.js` | `entities/activity/api/` |
| `services/classService.js` | `entities/class/api/` |

### 5. Hooks → Shared/Hooks + Features/Hooks

| Current | New Location |
|---------|-------------|
| `hooks/useAuth.js` | `shared/hooks/useAuth.js` |
| `hooks/usePagination.js` | `shared/hooks/usePagination.js` |
| `hooks/useDebounce.js` | `shared/hooks/useDebounce.js` |
| `hooks/useActivities.js` | `features/activity-list/hooks/useActivityList.js` |
| `hooks/useDashboardData.js` | Split into feature-specific hooks |

### 6. Utils → Shared/Lib + Shared/Utils

| Current | New Location |
|---------|-------------|
| `utils/dateFormat.js` | `shared/lib/date.js` |
| `utils/role.js` | `shared/utils/role.js` |
| `utils/avatarUtils.js` | `shared/lib/avatar.js` |
| `utils/activityImages.js` | `shared/utils/activityImages.js` |

## Nguyên tắc Migration

### ✅ DO
1. **Role-guard ở Router** - Không kiểm tra role trong component
2. **Atomic features** - Mỗi feature có `ui/`, `api/`, `hooks/`, `model/`
3. **Reusable entities** - User, Activity, Class là entities
4. **Primitive UI** - Button, Input, Table trong `shared/ui/`
5. **Compose trong Pages** - Pages chỉ compose widgets + features

### ❌ DON'T
1. Không đổi logic business khi di chuyển
2. Không đổi UI/styling
3. Không đổi props/API contracts
4. Không trộn role logic vào components
5. Không hardcode API endpoints

## Kế hoạch Thực hiện

### Phase 1: Setup cấu trúc mới ✅
- [ ] Tạo các thư mục `app/`, `widgets/`, `entities/`
- [ ] Tạo `shared/ui/`, `shared/api/`, `shared/lib/`
- [ ] Setup `app/routes/` với role guards

### Phase 2: Migrate Shared layer 🔄
- [ ] Move `services/http.js` → `shared/api/http.js`
- [ ] Create `shared/api/endpoints.js`
- [ ] Move hooks → `shared/hooks/`
- [ ] Move utils → `shared/lib/` và `shared/utils/`
- [ ] Extract UI primitives → `shared/ui/`

### Phase 3: Create Entities 🆕
- [ ] Create `entities/user/`
- [ ] Create `entities/activity/`
- [ ] Create `entities/class/`
- [ ] Create `entities/registration/`
- [ ] Create `entities/semester/`

### Phase 4: Create Widgets 🆕
- [ ] Create `widgets/layout/` (layouts)
- [ ] Create `widgets/header/` (headers)
- [ ] Create `widgets/semester/` (semester widgets)
- [ ] Create `widgets/notifications/` (toasts)

### Phase 5: Reorganize Features 🔄
- [ ] Restructure `features/auth/`
- [ ] Restructure `features/activities/`
- [ ] Create `features/activity-approve/`
- [ ] Create `features/registration-manage/`
- [ ] Create `features/qr-attendance/`

### Phase 6: Reorganize Pages 🔄
- [ ] Reorganize dashboards by role
- [ ] Reorganize activity pages
- [ ] Reorganize auth pages
- [ ] Update all imports

### Phase 7: Update Router & Guards 🔄
- [ ] Implement role-based routing
- [ ] Add route guards
- [ ] Remove role checks from components

### Phase 8: Cleanup 🧹
- [ ] Remove old `components/` files
- [ ] Remove old `pages/` structure
- [ ] Update all imports
- [ ] Run tests
- [ ] Verify no broken imports

## Files cần kiểm tra kỹ

### High complexity (>500 lines)
- `pages/teacher/ModernTeacherDashboard.js`
- `pages/admin/...`
- `pages/student/Dashboard.js`

### Nhiều dependencies
- `App.js` - Router chính
- `contexts/AuthContext.js` - Auth logic
- `services/http.js` - HTTP interceptor

## Testing Strategy

1. **Unit tests** - Test từng feature/entity riêng
2. **Integration tests** - Test page composition
3. **E2E tests** - Test user flows theo role
4. **Visual regression** - Đảm bảo UI không đổi

## Success Criteria

✅ Tất cả imports resolved  
✅ No console errors  
✅ All pages render correctly  
✅ All features work as before  
✅ E2E tests pass  
✅ Bundle size không tăng đáng kể  

---

**Ước tính thời gian**: 2-3 ngày  
**Risk level**: Medium (nhiều file cần move)  
**Rollback plan**: Git branches cho mỗi phase  
