# Dynamic Permission System - Hướng Dẫn Sử Dụng

## 🎯 Tổng Quan

Hệ thống kiểm tra quyền động (dynamic permission) cho phép:
- ✅ Kiểm tra quyền realtime từ database
- ✅ Khi admin tắt quyền → User bị chặn ngay lập tức (403) mà không cần reload/login lại
- ✅ Frontend tự động ẩn/disable UI khi không có quyền
- ✅ Polling mỗi 30s để sync permissions
- ✅ Auto refresh permissions khi nhận 403 error

## 📋 Các Quyền Trong Hệ Thống

Dựa trên hình ảnh bạn cung cấp, các quyền của SINH_VIEN bao gồm:

### Profile
- `profile.read` - Xem profile
- `profile.update` - Cập nhật profile

### Activities
- `activities.read` - Xem hoạt động
- `activities.write` - Tạo/sửa hoạt động
- `activities.delete` - Xóa hoạt động
- `activities.approve` - Duyệt hoạt động

### Registrations
- `registrations.read` - Xem đăng ký
- `registrations.write` - Tạo/duyệt đăng ký
- `registrations.delete` - Hủy đăng ký

### Attendance
- `attendance.read` - Xem điểm danh
- `attendance.write` - Điểm danh
- `attendance.delete` - Xóa điểm danh

### Reports
- `reports.read` - Xem báo cáo
- `reports.export` - Xuất báo cáo

### Notifications
- `notifications.read` - Xem thông báo
- `notifications.write` - Tạo thông báo
- `notifications.delete` - Xóa thông báo

### Students & Classmates
- `students.read` - Xem sinh viên
- `students.update` - Cập nhật sinh viên
- `classmates.read` - Xem danh sách lớp
- `classmates.assist` - Hỗ trợ lớp trưởng

### Scores
- `scores.read` - Xem điểm

### Roles & System
- `roles.read` - Xem vai trò
- `roles.write` - Tạo/sửa vai trò
- `roles.delete` - Xóa vai trò
- `system.manage` - Quản lý hệ thống
- `system.configure` - Cấu hình hệ thống

### Activity Types
- `activityTypes.read` - Xem loại hoạt động
- `activityTypes.write` - Tạo/sửa loại hoạt động
- `activityTypes.delete` - Xóa loại hoạt động

## 🔧 Backend Setup

### 1. Middleware đã được tạo

File: `backend/src/core/http/middleware/dynamicPermission.js`

Các function có sẵn:
```javascript
requireDynamicPermission(permission)      // Kiểm tra 1 quyền
requireAnyPermission(permissions)         // Kiểm tra có ít nhất 1 trong các quyền
requireAllPermissions(permissions)        // Kiểm tra có đủ tất cả quyền
clearPermissionsCache(userId)            // Clear cache
```

### 2. Sử dụng trong Routes

```javascript
const { auth, requireDynamicPermission } = require('../../core/http/middleware');

// Kiểm tra 1 quyền
router.get('/profile', 
  auth, 
  requireDynamicPermission('profile.read'), 
  ProfileController.get
);

// Kiểm tra nhiều quyền (OR)
router.post('/activities', 
  auth, 
  requireAnyPermission(['activities.write', 'activities.create']),
  ActivitiesController.create
);

// Kiểm tra nhiều quyền (AND)
router.post('/admin/users', 
  auth, 
  requireAllPermissions(['users.write', 'system.manage']),
  AdminController.createUser
);
```

### 3. API Endpoints đã có

```
GET  /api/auth/permissions              - Lấy quyền hiện tại
POST /api/auth/permissions/clear-cache  - Clear cache (Admin)
```

### 4. Auto Clear Cache

Khi admin update role, cache tự động bị clear:

```javascript
// backend/src/modules/roles/roles.routes.js
router.put('/:id', auth, requireAdmin, async (req, res) => {
  const role = await RolesService.update(id, req.body);
  clearPermissionsCache(); // ← Tự động clear
  return sendResponse(res, 200, ApiResponse.success(role));
});
```

## 💻 Frontend Setup

### 1. Setup Interceptor (Bắt buộc)

Trong `src/index.js` hoặc `src/App.js`:

```javascript
// Import để kích hoạt interceptor
import './utils/permissionInterceptor';

// hoặc
require('./utils/permissionInterceptor');
```

### 2. Sử dụng usePermissions Hook

```javascript
const { usePermissions } = require('../hooks/usePermissions');

function MyComponent() {
  const { 
    permissions,          // Array các quyền hiện tại
    loading,              // Boolean - đang load
    error,                // Error nếu có
    hasPermission,        // Function kiểm tra 1 quyền
    hasAnyPermission,     // Function kiểm tra nhiều quyền (OR)
    hasAllPermissions,    // Function kiểm tra nhiều quyền (AND)
    refreshPermissions    // Function refresh manual
  } = usePermissions();

  // Kiểm tra quyền
  if (hasPermission('profile.update')) {
    return <button>Cập nhật profile</button>;
  }

  // Kiểm tra nhiều quyền
  if (hasAnyPermission(['activities.write', 'activities.create'])) {
    return <button>Tạo hoạt động</button>;
  }

  return null;
}
```

### 3. Sử dụng PermissionGuard Component

```javascript
const PermissionGuard = require('../components/PermissionGuard');

function ProfilePage() {
  return (
    <div>
      {/* Ẩn hoàn toàn button nếu không có quyền */}
      <PermissionGuard permission="profile.update">
        <button>Cập nhật</button>
      </PermissionGuard>

      {/* Disable button thay vì ẩn */}
      <PermissionGuard permission="profile.update" mode="disable">
        <button>Cập nhật</button>
      </PermissionGuard>

      {/* Show fallback UI */}
      <PermissionGuard 
        permission="profile.update"
        mode="replace"
        fallback={<p>Bạn không có quyền chỉnh sửa</p>}
      >
        <button>Cập nhật</button>
      </PermissionGuard>

      {/* Kiểm tra nhiều quyền (OR) */}
      <PermissionGuard anyOf={['users.read', 'users.write']}>
        <UserList />
      </PermissionGuard>

      {/* Kiểm tra nhiều quyền (AND) */}
      <PermissionGuard allOf={['users.read', 'users.write']}>
        <AdminPanel />
      </PermissionGuard>
    </div>
  );
}
```

### 4. Listen Events (Optional)

```javascript
const { onPermissionDenied, onPermissionsUpdated } = require('../utils/permissionInterceptor');

function MyComponent() {
  useEffect(() => {
    // Khi có 403 error
    const cleanup1 = onPermissionDenied((event) => {
      console.log('Permission denied:', event.detail);
      // Ẩn UI, show message, etc.
    });

    // Khi permissions được update
    const cleanup2 = onPermissionsUpdated((event) => {
      console.log('Permissions updated:', event.detail.permissions);
      // Re-render UI, etc.
    });

    return () => {
      cleanup1();
      cleanup2();
    };
  }, []);
}
```

## 🔄 Luồng Hoạt Động

### Khi User Login
1. User login → nhận token
2. Frontend gọi `GET /api/auth/permissions` → lưu vào localStorage
3. usePermissions hook load permissions từ localStorage
4. Start polling mỗi 30s để cập nhật

### Khi Admin Tắt Quyền
1. Admin vào trang Roles → tắt quyền `profile.read` của SINH_VIEN
2. Backend clear permissions cache
3. Trong 5-30 giây:
   - User gọi API có middleware `requireDynamicPermission('profile.read')`
   - Backend query database → thấy không có quyền → trả 403
   - Axios interceptor bắt 403 → refresh permissions
   - PermissionGuard check lại → ẩn button/form

### Khi User Thực Hiện Action Không Có Quyền
1. User click button "Xem Profile"
2. Frontend gọi `GET /api/core/profile`
3. Backend middleware check → không có `profile.read` → trả 403
4. Axios interceptor:
   - Show toast error
   - Refresh permissions từ backend
   - Dispatch event 'permission-denied'
5. PermissionGuard nhận event → ẩn/disable UI ngay lập tức

## 🧪 Testing

### Test Backend

```bash
# 1. Lấy permissions
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/auth/permissions

# 2. Test route có permission
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/core/profile
# → Nếu không có profile.read → 403

# 3. Clear cache (Admin)
curl -X POST -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  http://localhost:5000/api/auth/permissions/clear-cache
```

### Test Frontend

1. Login as SINH_VIEN
2. Mở DevTools Console → xem permissions
3. Vào trang Profile → button "Cập nhật" hiển thị
4. Admin tắt `profile.update` trong Roles
5. Đợi 30s hoặc reload page
6. Button "Cập nhật" biến mất hoặc disabled

## 📝 Danh Sách Routes Đã Áp Dụng

### ✅ Profile Routes
- `GET /api/core/profile` → `profile.read`
- `PUT /api/core/profile` → `profile.update`

### ✅ Activities Routes
- `GET /api/core/activities` → `activities.read`
- `POST /api/core/activities` → `activities.write`
- `PUT /api/core/activities/:id` → `activities.write`
- `DELETE /api/core/activities/:id` → `activities.delete`
- `POST /api/core/activities/:id/approve` → `activities.approve`
- `POST /api/core/activities/:id/register` → `registrations.write`
- `POST /api/core/activities/:id/cancel` → `registrations.delete`
- `POST /api/core/activities/:id/attendance/scan` → `attendance.write`

### ✅ Registrations Routes
- `GET /api/core/registrations/my` → `registrations.read`
- `POST /api/core/registrations/:id/approve` → `registrations.write`
- `POST /api/core/registrations/:id/reject` → `registrations.write`
- `POST /api/core/registrations/:id/cancel` → `registrations.delete`
- `POST /api/core/registrations/:id/checkin` → `attendance.write`

### ✅ Notifications Routes
- `GET /api/core/notifications` → `notifications.read`
- `POST /api/core/notifications` → `notifications.write`
- `DELETE /api/core/notifications/:id` → `notifications.delete`

### ✅ Points Routes
- `GET /api/core/points/summary` → `scores.read`
- `GET /api/core/points/detail` → `scores.read`
- `GET /api/core/points/attendance-history` → `attendance.read`

## 🚀 Các Routes Còn Lại Cần Áp Dụng

Bạn có thể áp dụng tương tự cho:
- Students routes → `students.read`, `students.update`
- Classmates routes → `classmates.read`, `classmates.assist`
- Roles routes → `roles.read`, `roles.write`, `roles.delete`
- System routes → `system.manage`, `system.configure`
- Activity Types routes → `activityTypes.read`, `activityTypes.write`, `activityTypes.delete`

## 🎨 UI/UX Best Practices

1. **Loading State**: Show skeleton khi `loading === true`
2. **Graceful Degradation**: Show disabled button thay vì ẩn hoàn toàn
3. **Error Messages**: Show friendly message khi 403
4. **Tooltips**: Thêm tooltip "Bạn không có quyền" cho disabled buttons
5. **Feedback**: Show toast/notification khi permission changed

## 🐛 Troubleshooting

### Permission không update realtime?
- Check polling có chạy không (mở Network tab)
- Check cache TTL (mặc định 5s)
- Clear cache manually: `clearPermissionsCache()`

### User vẫn access được dù đã tắt quyền?
- Check backend có dùng `requireDynamicPermission` chưa
- Check database `vai_tro.quyen_han` đã update chưa
- Clear permissions cache: POST `/api/auth/permissions/clear-cache`

### Frontend không ẩn UI khi mất quyền?
- Check `permissionInterceptor.js` đã import chưa
- Check `usePermissions` có return đúng permissions không
- Check localStorage có key `user_permissions` không

## 📚 Tài Liệu Tham Khảo

- Backend Middleware: `backend/src/core/http/middleware/dynamicPermission.js`
- Frontend Hook: `frontend/src/hooks/usePermissions.js`
- Frontend Guard: `frontend/src/components/PermissionGuard.jsx`
- Axios Interceptor: `frontend/src/utils/permissionInterceptor.js`
- API Controller: `backend/src/modules/auth/permissions.controller.js`
