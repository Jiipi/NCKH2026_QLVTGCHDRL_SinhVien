# Architecture Review 2026 — Actionable Backlog

Ngày cập nhật: 17/02/2026
Phạm vi: Backend Node.js/Express/Prisma + Frontend React/Zustand
Mục tiêu: Bảo mật trước, ổn định vận hành, giảm chi phí bảo trì, mở đường nâng cấp.

---

## 1) Nguyên tắc triển khai

- Ưu tiên theo thứ tự: Security > Correctness > Maintainability > Performance.
- Mỗi sprint chỉ nhận khối lượng có thể release, rollback độc lập.
- Không merge ticket chưa có acceptance criteria pass.
- Với refactor lớn: bật feature flag hoặc rollout theo module.

---

## 2) Sprint plan (8 tuần)

## Sprint 0 (Hotfix trong 24-48h)

Trạng thái: ✅ Completed (17/02/2026)

- [x] SEC-001 — Khóa endpoint setup admin bằng `ENABLE_SETUP_ADMIN` + `SETUP_ADMIN_SECRET`.
- [x] SEC-002 — Loại bỏ hard-code mật khẩu mặc định trong runtime setup/auth flow.
- [x] OPS-001 — Dọn `console.*` trên auth/controller/cors trọng yếu, chuyển sang logger chuẩn.

Biến môi trường mới cần cấu hình:
- `ENABLE_SETUP_ADMIN` (`true` chỉ dùng khi cần setup thủ công trên môi trường an toàn)
- `SETUP_ADMIN_SECRET` (secret header `x-setup-secret`)
- `SETUP_ADMIN_PASSWORD` (mật khẩu admin khởi tạo, tối thiểu 8 ký tự)
- `DEMO_ADMIN_PASSWORD` (chỉ cho dev bootstrap user)

### SEC-001 — Khóa endpoint setup admin
- Priority: P0
- Effort: 0.5 ngày
- Scope:
  - Gỡ route setup-admin khỏi production path.
  - Nếu cần giữ cho môi trường dev: bắt buộc ENV flag + secret + whitelist IP.
- Acceptance criteria:
  - Không còn truy cập được endpoint setup-admin trên production.
  - Tất cả request tới endpoint cũ trả 404 hoặc 403.
  - Có test tích hợp xác nhận endpoint bị chặn.

### SEC-002 — Xóa mật khẩu mặc định và xoay thông tin nhạy cảm
- Priority: P0
- Effort: 0.5 ngày
- Scope:
  - Loại bỏ hard-code mật khẩu mặc định.
  - Reset/rotate tài khoản admin seed và các token nhạy cảm.
- Acceptance criteria:
  - Không còn chuỗi mật khẩu mặc định trong codebase.
  - Quy trình seed mới yêu cầu cấu hình an toàn qua ENV.

### OPS-001 — Giảm log nhạy cảm mức debug
- Priority: P0
- Effort: 1 ngày
- Scope:
  - Chuyển console log nghiệp vụ sang logger chuẩn.
  - Xóa log chứa token/email payload nhạy cảm.
- Acceptance criteria:
  - Không còn console log trong đường đi auth/permission/controller trọng yếu.
  - Log production không chứa token, OTP, password, email đầy đủ.

---

## Sprint 1 (Tuần 1-2): Ổn định nền tảng

Trạng thái: 🟡 In progress (17/02/2026)

- [x] PERF-001 (backend): bật permission cache TTL mặc định 60s (`PERMISSION_CACHE_TTL_MS`), giữ invalidate hiện có.
- [x] FE-001: thêm global `ErrorBoundary` và wrap app root.
- [x] FE-002 (một phần): thêm lazy/suspense cho layout và admin pages trọng yếu.
- [x] ARCH-001 (groundwork): backend mount thêm `/api/v1`, frontend base URL mặc định chuyển `/api/v1`, giữ backward compatibility `/api`.
- [x] ARCH-001 (còn lại): gỡ hoàn toàn legacy URL rewriting trong interceptor frontend.

### ARCH-001 — Thống nhất API prefix và ngưng rewrite URL ở frontend
- Priority: P1
- Effort: 2-3 ngày
- Scope:
  - Chốt chuẩn endpoint dưới /api/v1.
  - Gỡ lớp rewrite legacy trong HTTP interceptor frontend.
- Acceptance criteria:
  - Không còn rewrite admin/teacher URL ở interceptor.
  - Tất cả API call chính đi đúng /api/v1.
  - E2E smoke đăng nhập + dashboard + hoạt động pass.

### PERF-001 — Bật permission cache TTL ngắn + cơ chế clear cache
- Priority: P1
- Effort: 1 ngày
- Scope:
  - Đặt TTL 30-60 giây cho permission cache.
  - Clear cache theo user khi role/permission thay đổi.
- Acceptance criteria:
  - DB query permission giảm rõ rệt (mục tiêu giảm >60% ở route có guard).
  - Quyền thay đổi vẫn có hiệu lực tối đa sau TTL hoặc sau clear cache tức thì.

### FE-001 — Thêm Global Error Boundary
- Priority: P1
- Effort: 0.5-1 ngày
- Scope:
  - Bao toàn bộ app bởi error boundary cấp root.
  - Fallback UI rõ ràng, có log lỗi chuẩn.
- Acceptance criteria:
  - Lỗi render không làm crash trắng toàn app.
  - Có fallback page và hướng dẫn thao tác lại.

### FE-002 — Route-level code splitting cho App shell
- Priority: P1
- Effort: 1-2 ngày
- Scope:
  - Tách các trang nặng bằng lazy load theo route.
  - Giữ loading fallback thống nhất.
- Acceptance criteria:
  - Initial bundle giảm so với baseline.
  - Không tăng lỗi navigation hoặc blank screen.

---

## Sprint 2 (Tuần 3-4): Type safety và giảm nợ kỹ thuật

Trạng thái: 🟡 Started (17/02/2026)

- [x] TS-001 (một phần): giảm `as any` ở dashboard repository bằng Prisma `HoatDongWhereInput`, backend `tsc --noEmit` pass.
- [x] TS-001 (một phần): giảm `any` tại `auth.controller.ts` (catch unknown) và middleware core (`classScope`, `upload`, `uploadExcel`, `semesterLock`) với kiểu trả về tường minh.
- [x] TS-001 (một phần): refactor `modules/search` sang Prisma where-input types (`HoatDongWhereInput`, `SinhVienWhereInput`, `LopWhereInput`, `NguoiDungWhereInput`) và bỏ `as any` ở repository/use case/controller.
- [x] TS-001 (một phần): refactor `modules/admin-reports`, `modules/points`, `modules/exports` và `core/base/BaseRepository` để thay `as any` bằng typed Prisma filters/delegates; backend `npx tsc --noEmit` pass.
- [x] TS-001 (một phần): dọn tiếp `modules/admin-users` (repository/controller/dto/usecase) theo hướng `unknown` + typed Prisma inputs, thay `console.log` debug bằng logger; backend `npx tsc --noEmit` pass.
- [x] TS-001 (một phần): dọn thêm `modules/teachers` (`TeacherPrismaRepository`, `TeacherDashboardRepository`, `GetPendingRegistrationsUseCase`) để bỏ `as any` ở relation mapping và where count filters.
- [x] TS-001 (một phần): dọn `modules/auth` (`RegisterUseCase`, `ForgotPasswordUseCase`) theo hướng catch `unknown` + type guard lỗi.
- [x] TS-001 (một phần): dọn `modules/face-recognition/presentation/controllers/FaceRecognitionController` để bỏ `any` ở request/error handling và dùng repository có kiểu.
- [x] TS-001 (một phần): dọn `modules/dashboard/business/services/GetStudentDashboardUseCase` để bỏ `as any` trong mapping activity/registration.
- [x] TS-001 (một phần): dọn `presentation/routes/admin-registrations.route.ts` bằng typed Prisma where-input thay `any` filters.
- [x] TS-001 (mốc): dọn toàn bộ `any`/`as any` còn lại trong production source (broadcast, semesterClosure, activity, auth services, activities.factory, dashboard, faceRecognition, auth module, upload controller, classMonitor, roles, teachers, admin routes). 0 `any` trong production code, chỉ còn test mocks.
- [x] TS-002 (một phần): khởi động strict cleanup frontend tại `core/BaseApi`, `shared/api/repositories/activityType.api.ts`, `shared/lib/hooks/useDashboardUtils.ts`, `shared/hooks/useSemesterData.ts`; frontend `npx tsc --noEmit` pass.
- [ ] TS-002: mở rộng cleanup sang mappers/hook còn lại (`activity.mapper`, `registration.mapper`, ...).

### TS-001 — Bật strict mode theo lộ trình backend
- Priority: P1
- Effort: 3-5 ngày
- Scope:
  - Bật strict trước ở core + shared + dashboard.
  - Giảm as any trong repository/use case trọng yếu.
- Acceptance criteria:
  - Build TypeScript pass với strict cho vùng đã khoanh.
  - Dashboard repository không còn ép kiểu any ở filter chính.

### TS-002 — Bật strict mode theo lộ trình frontend
- Priority: P1
- Effort: 3-5 ngày
- Scope:
  - Bắt đầu từ shared/api, mappers, hooks trọng yếu.
  - Thay any bằng DTO/interface có kiểm soát.
- Acceptance criteria:
  - Không còn any ở các mapper trung tâm và API client cốt lõi.
  - CI typecheck pass ổn định.

### ARCH-002 — Tách App shell và giảm God component
- Priority: P1
- Effort: 2-3 ngày
- Scope:
  - Chia App route config theo domain.
  - Tách ModernHeader thành các sub-component theo chức năng.
- Acceptance criteria:
  - App shell nhỏ hơn, route khai báo dễ đọc.
  - ModernHeader giảm kích thước và số side-effect.

---

## Sprint 3 (Tuần 5-6): Chuẩn hóa kiến trúc domain

Trạng thái: 🟡 Started (17/02/2026)

- [x] DDD-001 (một phần): `registrations` export path đã dời truy cập Prisma từ `RegistrationExportService` về `registrations.repository`, service dùng repository contract.
- [x] DDD-001 (một phần): `activities` đã dời các usecase `CreateActivity`, `GetActivityById`, `DeleteActivity`, `CancelActivityRegistration`, `RegisterActivity`, `ScanAttendance` sang repository methods; bỏ fallback Prisma trong usecase.
- [x] DDD-001 (một phần): `dashboard` đã dời truy vấn class creators khỏi `GetStudentDashboardUseCase` về `DashboardRepository`.
- [x] DDD-001 (một phần): `semesters` đã dời các usecase `CreateNextSemester`, `GetActivitiesBySemester`, `GetRegistrationsBySemester`, `GetCurrentSemesterStatus` sang `ISemesterRepository`/`SemesterPrismaRepository`.
- [x] DDD-001 (một phần): `face-recognition` đã dời `RegisterFaceUseCase`, `GetFaceStatusUseCase`, `FaceAttendanceUseCase` sang `IFaceDataRepository`/`FaceDataRepository` (không còn Prisma trực tiếp trong business usecase).
- [x] DDD-001 (mốc): rà soát `backend/src/modules/**/business/**` và loại bỏ hoàn toàn import/gọi Prisma trực tiếp; business layer truy cập dữ liệu qua repository/service abstractions.

### DDD-001 — Dời logic Prisma khỏi use case về repository
- Priority: P2
- Effort: 3 ngày
- Scope:
  - Ưu tiên modules registrations, activities, dashboard.
  - Use case chỉ điều phối nghiệp vụ, không query trực tiếp.
- Acceptance criteria:
  - Use case không gọi Prisma client trực tiếp.
  - Unit test use case có thể mock repository hoàn toàn.

### DDD-002 — Chuẩn hóa mapper Entity/DTO/Response
- Priority: P2
- Effort: 2-3 ngày
- Scope:
  - Tạo mapper layer nhất quán cho payload vào/ra.
  - Loại bỏ mapping ad-hoc trong controller.
- Acceptance criteria:
  - Tất cả endpoint trọng yếu dùng mapper chuẩn.
  - Không còn response shape lệch giữa endpoint tương đương.

### ARCH-003 — Dọn legacy service/presentation route
- Priority: P2
- Effort: 2 ngày
- Scope:
  - Xóa dần đường đi legacy đã trùng chức năng module mới.
  - Cập nhật import theo module public API.
- Acceptance criteria:
  - Giảm file legacy được đánh dấu deprecate.
  - Không phát sinh deep import cross-module mới.

---

## Sprint 4 (Tuần 7-8): Chất lượng và quan sát hệ thống

Trạng thái: ✅ Completed (17/02/2026)

- [x] OBS-001 (một phần): thêm middleware `X-Request-Id` và correlation logging trong backend request pipeline.
- [x] OBS-001 (một phần): thêm audit log write operations trong `AdminUsersController` (create/update/delete/lock/unlock) kèm `requestId`.
- [x] OBS-001: mở rộng requestId vào toàn bộ structured logs và audit write operations.
  - Tạo shared audit utility `core/logger/audit.ts` với `logAudit()`.
  - Tích hợp audit logging vào ActivitiesController (5 actions), RegistrationsController (7 actions), RolesController (4 actions), SemestersController (8 actions), auth.controller (4 actions).
  - Refactor AdminUsersController sang shared `logAudit()`.
  - Dọn sạch `console.log` debug trong RegistrationsController.
- [x] TEST-001: Unit tests cho use case trọng yếu backend (LoginUseCase 9 tests, RegisterUseCase 8 tests, CreateRegistrationUseCase 9 tests, GetStudentDashboardUseCase 6 tests — tổng 32 tests, 100% pass).
- [x] FE-TEST-001: Component/hook tests frontend (semester utilities 19 tests, useAuth 7 tests, usePermissions 13 tests — tổng 38 tests, 100% pass).

### OBS-001 — Request correlation ID + audit log write operations
- Priority: P2
- Effort: 1-2 ngày
- Scope:
  - Thêm X-Request-Id xuyên suốt middleware -> logger.
  - Audit các thao tác tạo/sửa/xóa dữ liệu quan trọng.
- Acceptance criteria:
  - Mọi log request có requestId.
  - Tra vết được 1 giao dịch end-to-end qua log.

---

## 3) Danh sách ticket ưu tiên theo impact/effort

| Ticket | Impact | Effort | Ưu tiên |
|---|---:|---:|---|
| SEC-001 | Rất cao | Thấp | P0 |
| SEC-002 | Rất cao | Thấp | P0 |
| OPS-001 | Cao | Thấp | P0 |
| ARCH-001 | Cao | Trung bình | P1 |
| PERF-001 | Cao | Thấp | P1 |
| FE-001 | Trung bình | Thấp | P1 |
| FE-002 | Cao | Trung bình | P1 |
| TS-001 | Cao | Trung bình | P1 |
| TS-002 | Cao | Trung bình | P1 |
| DDD-001 | Cao | Trung bình | P2 |

---

## 4) Definition of Done (DoD) chung

- Có test tương ứng cho thay đổi (unit/integration/e2e phù hợp).
- Có rollback plan hoặc migration note nếu ảnh hưởng dữ liệu.
- Không thêm console log debug mới vào production path.
- Tài liệu API/changelog được cập nhật cho thay đổi hành vi.
- CI pass: lint, typecheck, test.

---

## 5) Rủi ro và phụ thuộc

- Rủi ro lớn nhất: thay đổi API đồng thời ở FE và BE không đồng bộ.
- Giảm rủi ro bằng feature toggle cho endpoint migration.
- Nên khóa merge vào main nếu không pass typecheck + smoke e2e.

---

## 6) Mẫu ticket chuẩn (dùng cho Jira/GitHub Issues)

Tiêu đề: [Mã ticket] Mô tả ngắn

- Bối cảnh
- Phạm vi
- Ngoài phạm vi
- Checklist triển khai
- Acceptance criteria
- Test plan
- Rollback plan

