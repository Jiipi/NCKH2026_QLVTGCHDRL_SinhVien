# 🔐 RBAC Permissions Fix - Sửa lỗi phân quyền động

**Date:** November 11, 2025  
**Status:** ✅ **READY TO APPLY**

---

## 📋 Vấn đề

Khi Admin bật/tắt quyền trong giao diện "Vai trò & Quyền", các thay đổi được lưu vào database nhưng **KHÔNG được áp dụng ngay lập tức** do:

1. **Cache không được invalidate đúng cách**
2. **Logic fallback sai:** Khi role có `quyen_han = []` (rỗng), hệ thống fallback sang `STATIC_PERMISSIONS` thay vì từ chối quyền
3. **Không có mechanism để force reload permissions**

---

## 🔧 Solution Applied

### Fix 1: Cải thiện RBAC Middleware Logic

**File:** `backend/src/middlewares/rbac.js`

#### Vấn đề trong code hiện tại:

```javascript
// ❌ SAI: Khi role found nhưng permissions rỗng → vẫn fallback STATIC
if (cache.found) {
  if (hasPermissionWithAliases(cache.perms, permission)) return next();
  // Thiếu return → rơi xuống fallback STATIC_PERMISSIONS
}
```

#### Sửa thành:

```javascript
// ✅ ĐÚNG: Khi role found → DB là authoritative, KHÔNG fallback
if (cache.found) {
  if (hasPermissionWithAliases(cache.perms, permission)) return next();
  // DB is authoritative - deny immediately without fallback
  logInfo('Permission denied (DB authoritative)', { 
    userId: req.user?.sub, 
    userRole, 
    permission, 
    ip: req.ip 
  });
  return sendResponse(res, 403, ApiResponse.forbidden(
    `Bạn không có quyền "${permission}" (vai trò: ${userRole})`
  ));
}
```

### Fix 2: Cache Invalidation sau Update

**File:** `backend/src/controllers/admin.roles.controller.js`

Đảm bảo invalidate cache sau mỗi lần update:

```javascript
static async update(req, res) {
  try {
    const { ten_vt, mo_ta, quyen_han } = req.body || {};
    
    // Get old role name to invalidate cache
    const oldRole = await prisma.vaiTro.findUnique({ 
      where: { id: req.params.id },
      select: { ten_vt: true }
    });
    
    // Normalize permissions array
    let normalizedQuyenHan = quyen_han;
    if (quyen_han && typeof quyen_han === 'object' && !Array.isArray(quyen_han)) {
      normalizedQuyenHan = Object.values(quyen_han);
    }
    
    const updated = await prisma.vaiTro.update({ 
      where: { id: req.params.id }, 
      data: { ten_vt, mo_ta, quyen_han: normalizedQuyenHan } 
    });
    
    // Invalidate cache for BOTH old and new role names
    if (oldRole?.ten_vt) {
      invalidateRoleCache(oldRole.ten_vt);
    }
    invalidateRoleCache(ten_vt || updated.ten_vt);
    
    // Also invalidate all cache to be safe
    invalidateAllRoleCache();
    
    console.log('✅ Role updated and cache invalidated:', {
      roleId: updated.id,
      roleName: updated.ten_vt,
      permissionsCount: normalizedQuyenHan?.length || 0
    });
    
    return sendResponse(res, 200, ApiResponse.success(updated, 'Cập nhật vai trò thành công'));
  } catch (err) {
    logError('AdminRolesController.update error', err);
    return sendResponse(res, 500, ApiResponse.error('Lỗi cập nhật vai trò'));
  }
}
```

### Fix 3: Add API Endpoint để Reload Permissions

**File:** `backend/src/routes/admin.route.js`

Thêm endpoint để admin có thể reload permissions manually:

```javascript
// Force reload permissions cache
router.post('/roles/reload-permissions', async (req, res) => {
  try {
    invalidateAllRoleCache();
    return sendResponse(res, 200, ApiResponse.success(null, 'Đã reload toàn bộ cache phân quyền'));
  } catch (error) {
    return sendResponse(res, 500, ApiResponse.error('Lỗi reload cache'));
  }
});
```

---

## ✅ Testing Checklist

### 1. Test Bật Quyền (Enable Permission)
- [ ] Login as Admin
- [ ] Go to "Vai trò & Quyền"
- [ ] Select role "LOP_TRUONG"
- [ ] **Bật** quyền `activities.write`
- [ ] Click "Lưu thay đổi"
- [ ] Logout và login lại bằng tài khoản Lớp Trưởng
- [ ] Try to create/edit activity
- [ ] ✅ **Should succeed** (có quyền)

### 2. Test Tắt Quyền (Disable Permission)
- [ ] Login as Admin
- [ ] Go to "Vai trò & Quyền"
- [ ] Select role "LOP_TRUONG"
- [ ] **Tắt** quyền `activities.write`
- [ ] Click "Lưu thay đổi"
- [ ] Logout và login lại bằng tài khoản Lớp Trưởng
- [ ] Try to create/edit activity
- [ ] ✅ **Should fail with 403** (không có quyền)

### 3. Test Nhiều Quyền
- [ ] Bật/tắt nhiều quyền cùng lúc
- [ ] Verify tất cả đều được áp dụng đúng

### 4. Test Cache Invalidation
- [ ] Update permissions
- [ ] Make API call immediately (không cần logout)
- [ ] ✅ **Should use new permissions** (cache đã clear)

---

## 🎯 Expected Behavior

### Before Fix:
```
Admin tắt quyền → Database cập nhật → User vẫn có quyền (cache cũ hoặc fallback STATIC)
```

### After Fix:
```
Admin tắt quyền → Database cập nhật → Cache cleared → User KHÔNG có quyền ngay lập tức
```

---

## 📊 Permission Flow

```
User Request
    ↓
requirePermission() middleware
    ↓
Check: userRole === 'ADMIN' ?
    Yes → Allow (bypass)
    No ↓
Load from DB (with cache)
    ↓
Role found in DB?
    Yes → Use DB permissions (AUTHORITATIVE)
           ├─ Has permission? → Allow
           └─ No permission? → Deny 403
    No → Fallback to STATIC_PERMISSIONS
          ├─ Has permission? → Allow
          └─ No permission? → Deny 403
```

---

## 🔍 Debug Commands

### Check permissions in database:
```sql
SELECT ten_vt, quyen_han FROM "VaiTro" WHERE ten_vt = 'LOP_TRUONG';
```

### Check user's role:
```sql
SELECT nd.ho_ten, vt.ten_vt, vt.quyen_han 
FROM "NguoiDung" nd 
JOIN "VaiTro" vt ON nd.vai_tro_id = vt.id 
WHERE nd.ten_dn = 'username';
```

### Test permission in backend console:
```javascript
const { requirePermission } = require('./src/middlewares/rbac');
// Check if loaded from DB
```

---

## 📝 Implementation Notes

### Permissions Naming Convention

Frontend và Backend phải sử dụng cùng một naming:

| Feature | Permission Slug | Roles |
|---------|----------------|-------|
| Xem hoạt động | `activities.read` | ALL |
| Tạo hoạt động | `activities.write` | LOP_TRUONG, GIANG_VIEN, ADMIN |
| Xóa hoạt động | `activities.delete` | GIANG_VIEN, ADMIN |
| Phê duyệt | `activities.approve` | GIANG_VIEN, ADMIN |
| Đăng ký | `registrations.write` | SINH_VIEN, LOP_TRUONG |
| Duyệt đăng ký | `registrations.write` | LOP_TRUONG, GIANG_VIEN |
| Điểm danh | `attendance.write` | SINH_VIEN, LOP_TRUONG |

### Permission Aliases

Middleware hỗ trợ aliases để tương thích:
- `activities.view` → `activities.read`
- `activities.update` → `activities.write`
- `registrations.register` → `activities.register`

---

## 🚀 Deployment

### Steps:
1. Backup database
2. Apply rbac.js changes
3. Apply controller changes
4. Restart backend
5. Test with admin account
6. Verify cache invalidation works

### Rollback Plan:
Keep backup of `rbac.js` and `admin.roles.controller.js`

---

**Status:** Ready to apply
**Tested:** Manual testing required
**Breaking Changes:** None (backward compatible)
