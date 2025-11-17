# 📋 TODO: Hoàn thiện Frontend theo Feature-Sliced Design

**Mục tiêu:** Migration 100% cấu trúc frontend sang FSD architecture  
**Ngày tạo:** 16/11/2025  
**Trạng thái:** In Progress

---

## 🎯 **PHASE 1: MIGRATION LEGACY PAGES → FEATURES** (Ưu tiên cao)

### 1.1 Admin Pages Migration → `features/admin/`

#### ✅ ĐÃ HOÀN THÀNH (ĐÃ MIGRATE & ROUTES ACTIVE)
- User Management (`AdminUsersPage.js`, `useUserManagement.js`, `userManagementApi.js`)
- Activity Management (`AdminActivitiesPage.js`, hooks + services hiện có)
- Class Management (`ClassManagementPage.js`, class hooks/services)
- Semester Management (`SemesterManagementPage.js`)
- Admin Dashboard (`AdminDashboardPage.js`, `useAdminDashboard.js`)
- Reports (`AdminReportsPage.js`)
- Settings (`AdminSettingsPage.js`)
- Registrations (`AdminRegistrationsPage.js`)

Tất cả legacy `pages/admin/*` đã được thay thế bằng FSD components và stubs; routing trong `App.js` sử dụng các trang mới. Phần checklist chi tiết đã được loại bỏ để giảm nhiễu.

---

### 1.2 Teacher Pages Migration → `features/teacher/`

#### ✅ ĐÃ HOÀN THÀNH
- Teacher Dashboard (`TeacherDashboardPage.js`, `useTeacherDashboard.js`)
- Class Activities (`TeacherActivitiesPage.js`, `useTeacherActivities.js`, `teacherActivitiesApi.js`)
- Approval Management (Activity & Registration approvals: `TeacherActivityApprovalPage.js`, `TeacherRegistrationApprovalsPage.js`, hooks & services)

#### ✅ MỚI HOÀN THÀNH THÊM
- Attendance Management scaffold (`TeacherAttendancePage.js`, `useTeacherAttendance.js`, `teacherAttendanceApi.js`)
- Student Scores scaffold (`TeacherStudentScoresPage.js`, `useTeacherStudentScores.js`, `teacherStudentScoresApi.js`)
  - Đã thêm routes: `/teacher/attendance`, `/teacher/student-scores`

Tiếp theo: Hoàn thiện UI chi tiết (bảng điểm danh, bảng điểm, xuất file) & bổ sung route nếu chưa khai báo.

---

### 1.3 Monitor Pages Migration → `features/monitor/`

#### ✅ ĐÃ HOÀN THÀNH (SCaffold + Hooks + Services)
- Dashboard (`MonitorDashboardPage.js`, `useMonitorDashboard.js`)
- Class Management (`MonitorClassManagementPage.js`, `useMonitorClassManagement.js`, `monitorClassManagementApi.js`)
- Student Management (`MonitorStudentManagementPage.js`, `useMonitorStudentManagement.js`, `monitorStudentManagementApi.js`)
- Activity Oversight (`MonitorActivityOversightPage.js`, `useMonitorActivityOversight.js`, `monitorActivityOversightApi.js`)
- Reports (`MonitorReportsPage.js`, `useMonitorReports.js`, `monitorReportsApi.js`)

#### ✅ MỚI HOÀN THÀNH
- My Activities → `features/monitor/ui/MonitorMyActivitiesPage.js` (routes updated)
- My Profile → `features/monitor/ui/MonitorMyProfilePage.js` (routes updated)
- My Certificates → `features/monitor/ui/MonitorMyCertificatesPage.js` (routes updated)
- Notifications → `features/monitor/ui/ClassNotificationsPage.js` (routes updated)
- Approvals → `features/monitor/ui/MonitorApprovalsPage.js` (routes updated)

Tiếp theo: Hoàn thiện UI components (bộ lọc, bảng, biểu đồ) & thêm vào routing nếu chưa khai báo.

---

### 1.4 Auth Pages Migration → `features/auth/`

#### ✅ Hoàn thành (migrated + routes active)
- [x] `features/auth/ui/LoginPage.js` (from pages/auth/LoginModern.js)
- [x] `features/auth/ui/RegisterPage.js` (from pages/auth/RegisterModern.js)
- [x] `features/auth/ui/ForgotPasswordPage.js` (from pages/auth/ForgotPasswordModern.js)
- [x] `features/auth/ui/ResetPasswordPage.js` (from pages/auth/ResetPasswordModern.js)
- [x] Moved CSS → `features/auth/ui/AuthModern.css`
- [x] Updated routes in `App.js` to FSD pages

#### 🔲 Cần làm (refactor follow-ups)
- [ ] Tạo `features/auth/services/authApi.js` và gom API calls
- [ ] Tạo hooks: `useLogin`, `useRegister`, `useForgotPassword`, `useResetPassword`
- [ ] Optional: `useAuth` context hook (session helpers)
- [ ] E2E: Test login/register/forgot/reset flows

---

### 1.5 Profile Pages Migration → `features/profile/`

#### ⏳ Tiến độ

- [x] `pages/profile/Profile.js` → `features/profile/ui/ProfilePage.js` (routes updated)
- [x] `pages/profile/UserProfile.js` → `features/profile/ui/UserProfilePage.js` (routes updated)
  - [ ] Tạo `features/profile/model/useProfile.js`
  - [ ] Tạo `features/profile/services/profileApi.js`

- [ ] `pages/Profile.js` (root) → Merge vào features/profile

**Profile checklist:**
- [ ] Support multi-role profiles (student/teacher/admin)
- [ ] Avatar upload integration với entities/user
- [ ] Password change functionality
- [ ] Profile update validation

---

### 1.6 QR Pages Migration → `features/qr-attendance/`

#### ✅ ĐÃ HOÀN THÀNH (UI/Model/Service)

- [x] `features/qr-attendance/ui/QRManagementPage.js` (wrap từ AdminQRAttendancePage)
  - [x] `features/qr-attendance/model/useQRManagement.js` (alias → `useAdminQRAttendance`)
  - [x] `features/qr-attendance/services/qrApi.js`

- [x] `features/qr-attendance/ui/QRScannerPage.js` (wrap từ QRScannerModernPage)
  - [x] `features/qr-attendance/model/useQRScanner.js` (alias → `useLegacyQRScanner`)
  - [x] `features/qr-attendance/ui/components/QRCamera.js`

- [x] `pages/QRAttendanceManagement.js` (root) → Merge vào feature

**QR checklist:**
- [x] Camera permissions handling (trong `useLegacyQRScanner`)
- [x] QR code scanning (jsQR + BarcodeDetector + ZXing)
- [ ] QR code generation (hiện demo; chờ backend)
- [ ] Real-time attendance updates
- [ ] Test trên mobile devices

---

### 1.7 Activity Management → `features/activities/`

#### ✅ ĐÃ HOÀN THÀNH (phần trang tạo/sửa)

- [x] `pages/ManageActivity.js` → `features/activities/ui/ManageActivityPage.js` (đã cập nhật routes trong `App.js`)
  - [ ] Tạo `features/activities/model/useManageActivity.js`
  - [ ] Tạo `features/activities/services/activityApi.js`
  - [ ] Tạo `features/activities/ui/components/ActivityForm.js`

#### 🔲 **Cần làm thêm**
- [ ] Tạo `features/activities/ui/ActivityListPage.js`
  - [ ] Tạo `features/activities/model/useActivityList.js`

**Activities checklist:**
- [ ] CRUD operations
- [ ] Image upload integration
- [ ] Category management
- [ ] Activity approval workflow
- [ ] Search & filters

---

## 🔧 **PHASE 2: CHUẨN HÓA FEATURES ĐÃ TỒN TẠI**

### 2.1 Hoàn thiện `features/student/` ✅

#### ✅ **Đã hoàn thành**
- [x] 7 UI pages
- [x] 6 model hooks
- [x] FSD structure chuẩn

#### 🔲 **Cần cải thiện**
- [ ] Kiểm tra code consistency
- [ ] Add JSDoc comments
- [ ] Add PropTypes/TypeScript
- [ ] Unit tests cho hooks

---

### 2.2 Hoàn thiện `features/monitor/` 🔶

#### ✅ **Đã có**
- [x] MonitorDashboardPage.js
- [x] useMonitorDashboard.js

#### 🔲 **Cần thêm**
- [ ] Services layer: `services/monitorApi.js`
- [ ] Thêm UI components vào `ui/components/`
- [ ] Migrate các pages còn lại từ pages/monitor/

---

### 2.3 Chuẩn hóa `features/classes/` ⚠️

#### 🔲 **Cần tạo mới toàn bộ**
- [ ] Tạo `features/classes/ui/ClassListPage.js`
- [ ] Tạo `features/classes/ui/ClassDetailPage.js`
- [ ] Tạo `features/classes/ui/ClassActivitiesPage.js`
- [ ] Tạo `features/classes/model/useClassList.js`
- [ ] Tạo `features/classes/model/useClassDetail.js`
- [ ] Tạo `features/classes/model/useClassActivities.js`
- [ ] Tạo `features/classes/services/classApi.js`
- [ ] Tạo UI components trong `ui/components/`

---

### 2.4 Chuẩn hóa `features/approvals/` ⚠️

#### 🔲 **Cần tạo**
- [ ] `features/approvals/ui/ApprovalListPage.js`
- [ ] `features/approvals/ui/ApprovalDetailPage.js`
- [ ] `features/approvals/model/useApprovalList.js`
- [ ] `features/approvals/model/useApprovalActions.js`
- [ ] `features/approvals/services/approvalsApi.js`
- [ ] `features/approvals/ui/components/ApprovalCard.js`
- [ ] `features/approvals/ui/components/ApprovalFilters.js`

**Approval workflow:**
- [ ] Pending approvals list
- [ ] Approve/Reject actions
- [ ] Approval history
- [ ] Notifications integration

---

### 2.5 Chuẩn hóa `features/dashboard/` ⚠️

#### 🔲 **Cần tạo**
- [ ] `features/dashboard/ui/DashboardPage.js` (generic)
- [ ] `features/dashboard/model/useDashboard.js`
- [ ] `features/dashboard/services/dashboardApi.js`
- [ ] Tạo widgets cho các role khác nhau
- [ ] Integration với `widgets/` layer

---

### 2.6 Chuẩn hóa `features/users/` 🔶

#### ✅ **Đã có**
- [x] `services/usersApi.js`

#### 🔲 **Cần thêm**
- [ ] `features/users/ui/UserListPage.js`
- [ ] `features/users/ui/UserDetailPage.js`
- [ ] `features/users/model/useUserList.js`
- [ ] `features/users/model/useUserDetail.js`
- [ ] `features/users/ui/components/UserCard.js`
- [ ] `features/users/ui/components/UserForm.js`

---

### 2.7 Chuẩn hóa `features/header/` 🔶

#### ✅ ĐÃ KHỞI TẠO (proxy an toàn)
- [x] Di chuyển logic import: thêm `features/header/ui/Header.js` (re-export từ `components/Header.js`)

#### 🔲 **Tiếp theo**
- [ ] Tạo `features/header/model/useHeader.js` (notifications, user menu)
- [ ] Tách thành sub-components:
  - [ ] `features/header/ui/components/NotificationBell.js`
  - [ ] `features/header/ui/components/UserMenu.js`
  - [ ] `features/header/ui/components/SearchBar.js`

---

### 2.8 Chuẩn hóa `features/notifications/` 🔶

#### 🔲 **Cần tạo**
- [ ] `features/notifications/ui/NotificationPanel.js`
- [ ] `features/notifications/model/useNotifications.js`
- [ ] `features/notifications/services/notificationsApi.js`
- [ ] `features/notifications/ui/components/NotificationItem.js`
- [ ] Integration với existing NotificationContext

---

### 2.9 Chuẩn hóa `features/reports/` 🔶

#### 🔲 **Cần tạo**
- [ ] `features/reports/ui/ReportsPage.js`
- [ ] `features/reports/model/useReports.js`
- [ ] `features/reports/services/reportsApi.js`
- [ ] `features/reports/ui/components/ReportFilters.js`
- [ ] `features/reports/ui/components/ReportChart.js`
- [ ] Export functionality (PDF, Excel)

---

### 2.10 Chuẩn hóa `features/semesters/` 🔶

#### 🔲 **Cần tạo**
- [ ] `features/semesters/ui/SemesterListPage.js`
- [ ] `features/semesters/ui/SemesterDetailPage.js`
- [ ] `features/semesters/model/useSemesterList.js`
- [ ] `features/semesters/model/useSemesterActions.js`
- [ ] `features/semesters/services/semesterApi.js`
- [ ] Integration với `widgets/semester/`

---

### 2.11 Chuẩn hóa `features/settings/` 🔶

#### 🔲 **Cần tạo**
- [ ] `features/settings/ui/SettingsPage.js`
- [ ] `features/settings/model/useSettings.js`
- [ ] `features/settings/services/settingsApi.js`
- [ ] `features/settings/ui/components/SettingsForm.js`
- [ ] Categories: General, Account, Notifications, Privacy

---

## 🧹 **PHASE 3: CLEANUP LEGACY CODE**

### 3.1 Xóa Legacy Pages (Sau khi migration xong)

#### 🔲 **Checklist xóa pages/**
- [ ] ⚠️ **TRƯỚC KHI XÓA**: Backup toàn bộ `pages/` folder
- [ ] ✅ Verify tất cả features đã migrate hoàn chỉnh
- [ ] ✅ Test tất cả routes mới
- [ ] ✅ Update tất cả imports trong App.js
- [ ] ✅ Grep search toàn bộ codebase tìm imports từ `pages/`
- [x] 🗑️ Xóa `pages/admin/` (đã thay bằng FSD + stub/null)
 - [x] 🗑️ Xóa `pages/admin/` (đã PHYSICAL delete — build OK)
- [x] 🗑️ Xóa `pages/teacher/` (đã migrate UI chính sang features/teacher/ui, giữ lại 1 số trang tạm thời do routes phụ thuộc; sẽ migrate tiếp)
- [x] 🗑️ Xóa `pages/monitor/` (đã xóa toàn bộ legacy Monitor: My*, Notifications, Approvals) — build OK
- [x] 🗑️ Xóa `pages/student/` (đã cập nhật routes → features/student/ui, build OK, đã xóa thư mục)
- [x] 🗑️ Xóa `pages/auth/` (đã xóa – routes dùng FSD, build OK)
 - [x] 🗑️ Xóa `pages/profile/`
- [x] 🗑️ Xóa `pages/qr/`
- [x] 🗑️ Xóa `pages/activity/`
- [x] 🗑️ Xóa root pages: ForgotPassword.js, ManageActivity.js, Profile.js, QR*.js, ResetPassword.js

---

### 3.2 Cleanup Components → Widgets/Entities

#### 🔲 **Di chuyển components/ → đúng layer**

**A. Layout components → widgets/layout/**
- [x] `AdminStudentLayout.js` → `widgets/layout/ui/AdminStudentLayout.js` (proxy)
- [ ] `MobileSidebarWrapper.js` → `widgets/layout/ui/MobileSidebarWrapper.js`
- [ ] `ClassManagementLayout.js` → `widgets/layout/ui/ClassManagementLayout.js`

**B. Sidebar components → widgets/sidebar/**
- [ ] `MonitorSidebar.js` → `widgets/sidebar/ui/MonitorSidebar.js`
- [ ] `StudentSidebar.js` → `widgets/sidebar/ui/StudentSidebar.js`
- [ ] `TeacherSidebar.js` → `widgets/sidebar/ui/TeacherSidebar.js`
- [ ] `AdminStudentSidebar.js` → `widgets/sidebar/ui/AdminStudentSidebar.js`

**C. Modal components → shared/ui/modals/**
- [ ] `ConfirmModal.js` → `shared/ui/modals/ConfirmModal.js`
- [ ] `ActivityQRModal.js` → Move to `features/activities/ui/components/`

**D. Navigation → widgets/navigation/**
- [ ] `MobileMenuButton.js` → `widgets/navigation/ui/MobileMenuButton.js`
- [ ] `TabManager.js` → `widgets/navigation/ui/TabManager.js`

**E. Session → features/auth/** (hoặc shared)
- [ ] `MultiSessionGuard.js` → `features/auth/ui/components/MultiSessionGuard.js`
- [ ] `MultiSessionIndicator.js` → `features/auth/ui/components/MultiSessionIndicator.js`
- [ ] `SessionMonitor.js` → `features/auth/model/SessionMonitor.js`

**F. Utilities → shared/ui/**
- [ ] `Toast.js` → `shared/ui/Toast.js`
- [ ] `ResponsiveUtils.js` → `shared/lib/responsive.js`
- [ ] `UserSearchSelect.js` → `shared/ui/UserSearchSelect.js`
- [ ] `ProfileTabs.js` → `features/profile/ui/components/ProfileTabs.js`

**G. Semester widgets → widgets/semester/**
- [ ] `SemesterClosureBanner.js` → `widgets/semester/ui/SemesterClosureBanner.js`
- [ ] `SemesterClosureWidget.js` → `widgets/semester/ui/SemesterClosureWidget.js`

**H. Admin components**
- [ ] `AdminComponents.js` → Tách ra thành nhiều components trong `features/admin/ui/components/`
- [ ] `MobileOptimizedDashboard.js` → `features/dashboard/ui/components/MobileDashboard.js`

---

### 3.3 Cleanup sau migration

#### 🔲 **Final cleanup checklist**
- [ ] 🗑️ Xóa toàn bộ folder `pages/`
- [ ] 🗑️ Xóa toàn bộ folder `components/` (sau khi di chuyển xong)
- [ ] 📝 Update all imports trong toàn bộ codebase
- [ ] ✅ Run linter & fix warnings
- [ ] ✅ Update .gitignore nếu cần
- [ ] ✅ Commit: "chore: Complete FSD migration, remove legacy structure"

---

## 📚 **PHASE 4: DOCUMENTATION**

### 4.1 Tạo FSD Guidelines cho team

#### 🔲 **Tạo `frontend/FSD_GUIDELINES.md`**

**Nội dung cần có:**
- [ ] 📖 Giới thiệu Feature-Sliced Design
- [ ] 📁 Cấu trúc thư mục chuẩn
- [ ] 🎯 Layer definitions:
  - [ ] `app/` - Application setup, routing, providers
  - [ ] `features/` - Business features (by domain)
  - [ ] `widgets/` - Cross-cutting UI components
  - [ ] `entities/` - Data models & entity logic
  - [ ] `shared/` - Infrastructure, utilities, UI primitives
- [ ] 📝 Naming conventions
- [ ] 🔄 Import rules (no upward imports)
- [ ] 💡 Code examples
- [ ] ❌ Anti-patterns
- [ ] ✅ Best practices

---

### 4.2 Tạo Feature Template

#### 🔲 **Tạo `frontend/FEATURE_TEMPLATE.md`**

**Template cho tạo feature mới:**
```
features/
  feature-name/
    ui/
      FeatureNamePage.js        # Main page
      components/
        ComponentA.js           # Sub-components
        ComponentB.js
    model/
      useFeatureName.js         # Business logic hooks
      useFeatureActions.js
    services/
      featureApi.js             # API calls
    index.js                    # Public exports
```

**Checklist tạo feature mới:**
- [ ] Follow naming conventions
- [ ] Create proper folder structure
- [ ] Add index.js exports
- [ ] Document public API
- [ ] Add to routing
- [ ] Add tests

---

### 4.3 Architecture Documentation

#### 🔲 **Tạo `frontend/ARCHITECTURE.md`**

**Nội dung:**
- [ ] 🏗️ Overall architecture diagram
- [ ] 📊 Data flow diagram
- [ ] 🔐 Authentication flow
- [ ] 🌐 API integration patterns
- [ ] 🎨 Styling approach (Tailwind)
- [ ] 🧪 Testing strategy
- [ ] 📱 Mobile responsiveness approach

---

### 4.4 Migration Guide

#### 🔲 **Tạo `frontend/MIGRATION_GUIDE.md`**

**Hướng dẫn migrate page → feature:**
- [ ] Step-by-step process
- [ ] Code examples (before/after)
- [ ] Common pitfalls
- [ ] Testing checklist
- [ ] Rollback procedure

---

### 4.5 Component Library Docs

#### 🔲 **Tạo `frontend/COMPONENT_LIBRARY.md`**

**Document shared components:**
- [ ] List tất cả shared/ui components
- [ ] Props documentation
- [ ] Usage examples
- [ ] Screenshots/demos
- [ ] Accessibility notes

---

### 4.6 Update README.md

#### 🔲 **Update `frontend/README.md`**

**Sections cần thêm:**
- [ ] 📁 Project structure explanation
- [ ] 🚀 Getting started guide
- [ ] 🏗️ Architecture overview (link to ARCHITECTURE.md)
- [ ] 📝 Development guidelines (link to FSD_GUIDELINES.md)
- [ ] 🧪 Testing instructions
- [ ] 🚀 Deployment process
- [ ] 📚 Links to all documentation

---

## 🎨 **PHASE 5: OPTIMIZATION & POLISH**

### 5.1 Code Quality

#### 🔲 **Improvements**
- [ ] Add ESLint rules cho FSD
- [ ] Add Prettier config
- [ ] Setup Husky pre-commit hooks
- [ ] Add import path aliases (@features, @shared, @widgets)
- [ ] Enforce consistent naming conventions

---

### 5.2 Performance

#### 🔲 **Optimizations**
- [ ] Code splitting per feature
- [ ] Lazy load routes
- [ ] Optimize bundle size
- [ ] Add React.memo where needed
- [ ] Optimize re-renders

---

### 5.3 Testing

#### 🔲 **Test coverage**
- [ ] Unit tests cho model hooks
- [ ] Integration tests cho features
- [ ] E2E tests cho critical flows
- [ ] Visual regression tests
- [ ] Accessibility tests

---

### 5.4 Developer Experience

#### 🔲 **Improvements**
- [ ] Add code snippets for VSCode
- [ ] Setup Storybook cho UI components
- [ ] Add debug tools
- [ ] Improve error messages
- [ ] Add development guides

---

<!-- Progress tracking section removed to keep checklist concise -->

## 🎯 **PRIORITY ORDER (Recommended)**

### Sprint 1 (Week 1-2): Admin Migration
1. Admin User Management
2. Admin Activity Management
3. Admin Dashboard
4. Cleanup admin legacy pages

### Sprint 2 (Week 3-4): Teacher Migration
1. Teacher Dashboard
2. Class Activities Management
3. Approvals Management
4. Cleanup teacher legacy pages

### Sprint 3 (Week 5-6): Monitor & Auth
1. Monitor pages completion
2. Auth pages migration
3. Profile pages migration
4. Cleanup auth/profile legacy

### Sprint 4 (Week 7-8): Remaining Features
1. QR Attendance migration
2. Activities feature completion
3. Classes feature completion
4. Approvals feature completion

### Sprint 5 (Week 9-10): Standardization
1. Complete all features/ standardization
2. Move components to proper layers
3. Widgets organization
4. Entities completion

### Sprint 6 (Week 11-12): Cleanup & Documentation
1. Final legacy cleanup
2. Create all documentation
3. Code quality improvements
4. Testing setup

---

## ⚠️ **IMPORTANT NOTES**

### Before Starting
- [ ] **Backup current codebase** (Git tag hoặc branch)
- [ ] **Setup test environment** để verify sau migration
- [ ] **Inform team members** về migration plan
- [ ] **Freeze new feature development** trong pages/ legacy

### During Migration
- [ ] Migrate từng domain một, test kỹ trước khi next
- [ ] Maintain backward compatibility trong quá trình transition
- [ ] Update routes incrementally
- [ ] Keep both old & new code cho đến khi verify xong
- [ ] Document breaking changes

### After Migration
- [ ] Full regression testing
- [ ] Update CI/CD pipeline
- [ ] Team training on FSD
- [ ] Monitor production for issues
- [ ] Gather feedback from team

---

## 🆘 **ROLLBACK PLAN**

Nếu có vấn đề sau migration:

1. **Git revert** về commit trước migration
2. **Cherry-pick** các fixes quan trọng
3. **Analyze** root cause
4. **Fix issues** trong branch mới
5. **Re-migrate** with improvements

**Backup checkpoints:**
- [ ] Before Phase 1: `git tag pre-phase1-migration`
- [ ] Before Phase 3 cleanup: `git tag pre-cleanup`
- [ ] Before production deploy: `git tag pre-production-fsd`

---

## 📞 **CONTACTS & RESOURCES**

- **FSD Official Docs**: https://feature-sliced.design/
- **Team Lead**: [Your Name]
- **Architecture Questions**: [Contact]
- **Code Review**: [Contact]

---

**Last Updated:** 17/11/2025  
**Status:** 🟡 In Progress  
**Next Milestone:** Activities feature completion
