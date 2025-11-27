# SOLID & Clean Architecture Refactor TODO

Tài liệu này tổng hợp hạng mục cần làm để đưa toàn bộ dự án (`backend/`, `frontend/`) về kiến trúc chuẩn theo `solid_clean.md`, đồng thời bám sát cấu trúc hiện có trong `BACKEND_STRUCTURE.md` và `FRONTEND_MIGRATION_PLAN.md`.

## 0. Chuẩn bị chung
- [ ] Kiểm tra trạng thái git, tạo nhánh `feature/solid-refactor`.
- [ ] Đọc lại `design.md`, `solid_clean.md`, `FRONTEND_MIGRATION_PLAN.md`, `BACKEND_STRUCTURE.md` để thống nhất yêu cầu UI/UX và kiến trúc.
- [ ] Thiết lập checklist kiểm thử (unit/integration/e2e) cho từng phase refactor.

## 1. Backend Roadmap

### Phase 1 – Audit & Planning
- [ ] Liệt kê tất cả service >600 dòng (vd: `services/admin-users.service.js`, `services/student-points.service.js`, ...).
- [ ] Mapping nhanh tuyến phụ thuộc giữa routes → controllers → services → repositories để biết vùng ảnh hưởng.
- [ ] Xác định module ưu tiên cao (quản trị người dùng, auth, điểm rèn luyện, hoạt động).

### Phase 2 – Hạ tầng kiến trúc
- [ ] Bổ sung thư mục chuẩn trong `src/modules/<module>/` theo mô hình `domain/`, `application/`, `infrastructure/`, `presentation/`.
- [ ] Tạo `src/modules/_shared/` cho entity base, mapper base, error chung để tránh trùng lặp.
- [ ] Thiết lập cơ chế DI nhẹ (factory hoặc container) để cấp repository/service vào use case (áp dụng DIP).

### Phase 3 – Module Admin Users (ưu tiên 1)
- [ ] Tạo `src/modules/admin-users/domain/admin-user.entity.js` và `admin-user.value-objects.js`.
- [ ] Tạo `src/modules/admin-users/domain/interfaces/admin-user.repository.js`.
- [ ] Di chuyển schema Zod từ `services/admin-users.service.js` sang `application/dto/{create,update}-admin-user.dto.js`.
- [ ] Viết `application/use-cases/{get-admin-users,create-admin-user,update-admin-user,reset-password}.use-case.js`.
- [ ] Tạo `infrastructure/repositories/admin-user.prisma-repo.js` tương tác Prisma, không chứa business logic.
- [ ] Tạo `infrastructure/mappers/admin-user.mapper.js` để chuẩn hóa dữ liệu trả về cho FE.
- [ ] Viết `presentation/admin-users.controller.js` (chỉ xử lý HTTP) và cập nhật routes để gọi use case thay vì service cũ.
- [ ] Xóa/dọn `services/admin-users.service.js` sau khi chắc chắn module mới hoạt động và file không còn được import.

### Phase 4 – Các module quan trọng khác
Lặp lại quy trình Phase 3 cho:
- [ ] `auth` (login, refresh, phân quyền).
- [ ] `activities` & `registrations` (CRUD + phê duyệt).
- [ ] `student-points` & `auto-point-calculation`.
- [ ] `qr-attendance`.

### Phase 5 – Cross-cutting & Shared
- [ ] Chuẩn hóa logger (`core/logger`) sử dụng trong use case qua wrapper để dễ mock.
- [ ] Tạo bộ error chung (`AppError`, `ValidationError`, `NotFoundError`, `PermissionError`) trong `core/errors` và dùng toàn dự án.
- [ ] Gom logic phân trang (`validatePaginationParams`, `createPaginationResponse`) vào module/shared utils, tái sử dụng qua DI.
- [ ] Đảm bảo mỗi file <600 dòng, tách helper riêng nếu cần.

### Phase 6 – QA Backend
- [ ] Viết unit test cho entity, mapper, use case trọng yếu.
- [ ] Chạy toàn bộ suite `npm test`, `npm run test:integration`.
- [ ] Cập nhật tài liệu API (`QUICK_REFERENCE.md`, `API_FLOW_DOCUMENTATION.md` nếu cần).

## 2. Frontend Roadmap

### Phase 1 – Thiết lập cấu trúc FSD
- [ ] Tạo `src/app/{providers,routes,store}` như kế hoạch.
- [ ] Tạo thư mục `src/widgets/`, `src/entities/`, `src/shared/ui`, `src/shared/api`, `src/shared/hooks`, `src/shared/lib`.

### Phase 2 – Di chuyển layer dùng chung
- [ ] Chuyển `services/http.js` → `shared/api/http.js`, tạo `shared/api/endpoints.js`.
- [ ] Di chuyển hooks chung (`useAuth`, `usePagination`, `useDebounce`, ...) vào `shared/hooks/`.
- [ ] Tách UI primitives (Button/Input/Table/Modal/Pagination/FileUpload/EmptyState) vào `shared/ui/` kèm CSS module riêng.
- [ ] Chuyển các helper (formatter, date, avatar, role, activityImages) vào `shared/lib` hoặc `shared/utils`.

### Phase 3 – Entities
- [ ] Tạo `entities/user/{model,api,ui}` và di chuyển component/avatar liên quan.
- [ ] Tạo `entities/activity`, `entities/class`, `entities/semester`, `entities/registration` với mapper + API tương ứng.

### Phase 4 – Widgets
- [ ] Tạo `widgets/layout/{AppLayout,StudentLayout,TeacherLayout,MonitorLayout,AdminLayout}`.
- [ ] Tạo `widgets/header/ModernHeader`, `widgets/notifications/ToastHost`, `widgets/semester/{SemesterSwitcher,SemesterClosureBanner}`.
- [ ] Đảm bảo widget chỉ compose entities/features, không gọi API trực tiếp.

### Phase 5 – Features tái cấu trúc
- [ ] `features/auth`: tách `ui/`, `api/`, `hooks/`.
- [ ] `features/activity-list`, `activity-create`, `activity-approve`: di chuyển logic fetch/filter ra hooks, giữ UI nhỏ.
- [ ] `features/registration-manage`, `features/qr-attendance`, `features/reports`: chuẩn hóa cùng cấu trúc.
- [ ] Giảm kích thước `features/admin/ui/AdminUsersPage.js` bằng cách tách hook `useAdminUsers`, component bảng, filter, drawer.

### Phase 6 – Pages & Routing
- [ ] Tái tổ chức `pages/` theo role như plan (dashboard-student/teacher/monitor/admin, activities/list, activities/detail, auth/login).
- [ ] Cập nhật router trong `app/routes` với role guard, bỏ check role trong component.
- [ ] Đảm bảo mỗi page chủ yếu compose widgets/features (<400 dòng).

### Phase 7 – Cleanup & Testing
- [ ] Xóa thư mục `components/` cũ sau khi migrate.
- [ ] Update mọi import đường dẫn mới (sử dụng script `fix-imports.js` nếu cần).
- [ ] Chạy `npm run lint`, `npm run test` (nếu có), smoke test UI chính (Admin, Teacher, Student).
- [ ] Đảm bảo CSS mới không ảnh hưởng global (chỉ dùng CSS module hoặc scoped styles).

## 3. Tổng kết & Bàn giao
- [ ] Cập nhật tài liệu kiến trúc (bổ sung phần SOLID/OOP) trong `docs/` hoặc `README.md`.
- [ ] Ghi lại checklist deploy cuối (tests pass, migrations chạy, build ok).
- [ ] Chuẩn bị hướng dẫn dev mới về cấu trúc (1 trang TL;DR liên kết `solid_clean.md`).
- [ ] Review lần cuối đảm bảo không còn file >600 dòng, không còn code trùng lặp hoặc vi phạm SOLID.

> Hoàn thành toàn bộ checklist này sẽ đưa dự án về đúng kiến trúc SOLID + Clean Code, nhất quán từ backend đến frontend theo định hướng trong `solid_clean.md`.

