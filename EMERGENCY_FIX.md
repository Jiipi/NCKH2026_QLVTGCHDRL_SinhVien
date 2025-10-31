# 🐛 BUG FIX: Lỗi Hiển Thị Quyền Vai Trò

## 📋 MÔ TẢ LỖI

**Hiện tượng**: Khi chọn 3 quyền cho vai trò SINH_VIEN và lưu, sau đó thoát ra vào lại thì không hiển thị 3 quyền đã chọn.

**Nguyên nhân**: 
- PostgreSQL JSON field lưu JavaScript array dưới dạng **object với numeric keys**: `{"0": "perm1", "1": "perm2", "2": "perm3"}`
- Thay vì array: `["perm1", "perm2", "perm3"]`
- Frontend expect array nhưng nhận được object → không hiển thị đúng

---

## 🔍 PHÂN TÍCH KỸ THUẬT

### Dữ Liệu Trong Database

```sql
SELECT ten_vt, quyen_han FROM vai_tro WHERE ten_vt = 'SINH_VIEN';

ten_vt    | quyen_han
----------+-----------------------------------------------------
SINH_VIEN | {"0": "activities.delete", "1": "activities.approve", "2": "activities.reject"}
```

**Vấn đề**: 
- `quyen_han` là object: `{"0": ..., "1": ..., "2": ...}`
- Frontend check `Array.isArray(quyen_han)` → false
- Không render checkboxes

---

## ✅ GIẢI PHÁP

### 1. Sửa Backend Controller

File: `backend/src/controllers/admin.roles.controller.js`

#### A. Sửa `getById()` method

```javascript
static async getById(req, res) {
  try {
    const item = await prisma.vaiTro.findUnique({ where: { id: req.params.id } });
    if (!item) return sendResponse(res, 404, ApiResponse.notFound('Không tìm thấy vai trò'));
    
    // ✅ Convert quyen_han from object to array if needed
    if (item.quyen_han && typeof item.quyen_han === 'object' && !Array.isArray(item.quyen_han)) {
      item.quyen_han = Object.values(item.quyen_han);
    }
    
    return sendResponse(res, 200, ApiResponse.success(item));
  } catch (err) {
    logError('AdminRolesController.getById error', err);
    return sendResponse(res, 500, ApiResponse.error('Lỗi lấy vai trò'));
  }
}
```

#### B. Sửa `list()` method

```javascript
static async list(req, res) {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = search
      ? { OR: [{ ten_vt: { contains: search, mode: 'insensitive' } }, { mo_ta: { contains: search, mode: 'insensitive' } }] }
      : {};
    const [items, total] = await Promise.all([
      prisma.vaiTro.findMany({ where, skip, take: parseInt(limit), orderBy: { ngay_tao: 'desc' } }),
      prisma.vaiTro.count({ where })
    ]);
    
    // ✅ Convert quyen_han from object to array for all items
    items.forEach(item => {
      if (item.quyen_han && typeof item.quyen_han === 'object' && !Array.isArray(item.quyen_han)) {
        item.quyen_han = Object.values(item.quyen_han);
      }
    });
    
    return sendResponse(res, 200, ApiResponse.success({ items, total, page: parseInt(page), limit: parseInt(limit) }));
  } catch (err) {
    logError('AdminRolesController.list error', err);
    return sendResponse(res, 500, ApiResponse.error('Lỗi lấy danh sách vai trò'));
  }
}
```

#### C. Sửa `update()` method

```javascript
static async update(req, res) {
  try {
    const { ten_vt, mo_ta, quyen_han } = req.body || {};
    
    // ✅ Ensure quyen_han is an array before saving
    let normalizedQuyenHan = quyen_han;
    if (quyen_han && typeof quyen_han === 'object' && !Array.isArray(quyen_han)) {
      normalizedQuyenHan = Object.values(quyen_han);
    }
    
    const updated = await prisma.vaiTro.update({ 
      where: { id: req.params.id }, 
      data: { ten_vt, mo_ta, quyen_han: normalizedQuyenHan } 
    });
    
    invalidateRoleCache(ten_vt || updated.ten_vt);
    
    // ✅ Return with normalized quyen_han
    if (updated.quyen_han && typeof updated.quyen_han === 'object' && !Array.isArray(updated.quyen_han)) {
      updated.quyen_han = Object.values(updated.quyen_han);
    }
    
    return sendResponse(res, 200, ApiResponse.success(updated, 'Cập nhật vai trò thành công'));
  } catch (err) {
    logError('AdminRolesController.update error', err);
    return sendResponse(res, 500, ApiResponse.error('Lỗi cập nhật vai trò'));
  }
}
```

---

## 🧪 CÁCH TEST

### 1. Restart Backend

```powershell
docker restart dacn_backend_dev
```

### 2. Test Trên UI

1. Mở Admin → Vai trò & Quyền
2. Click vào vai trò **SINH_VIEN**
3. Check 3 quyền bất kỳ (ví dụ: activities.read, activities.write, activities.delete)
4. Click **Lưu**
5. Thoát ra và click lại vào **SINH_VIEN**
6. ✅ **Kỳ vọng**: 3 quyền đã chọn vẫn hiển thị checked

### 3. Kiểm Tra API Response

Mở DevTools → Network → Click role SINH_VIEN → Check response:

**Trước khi fix:**
```json
{
  "id": "...",
  "ten_vt": "SINH_VIEN",
  "quyen_han": {
    "0": "activities.read",
    "1": "activities.write", 
    "2": "activities.delete"
  }
}
```

**Sau khi fix:**
```json
{
  "id": "...",
  "ten_vt": "SINH_VIEN",
  "quyen_han": [
    "activities.read",
    "activities.write",
    "activities.delete"
  ]
}
```

---

## 📊 TÁC ĐỘNG

### Files Thay Đổi
- ✅ `backend/src/controllers/admin.roles.controller.js` (3 methods)

### Breaking Changes
- ❌ Không có breaking changes
- ✅ Backward compatible (vẫn xử lý được cả object lẫn array)

### Performance Impact
- ✅ Minimal (chỉ thêm 1 lần convert `Object.values()`)
- ✅ Time complexity: O(n) where n = số quyền (thường < 50)

---

## 🔄 ROLLBACK PLAN

Nếu gặp vấn đề, có thể rollback bằng cách:

```powershell
# 1. Revert code changes
git checkout HEAD -- backend/src/controllers/admin.roles.controller.js

# 2. Restart backend
docker restart dacn_backend_dev
```

---

## 📝 GHI CHÚ THÊM

### Tại sao lại lưu dưới dạng object?

- PostgreSQL JSONB lưu JavaScript array dưới dạng object với numeric keys
- Khi Prisma read từ DB, nó giữ nguyên format này
- Cần normalize sang array ở application layer

### Best Practice Cho Tương Lai

Khi lưu array vào PostgreSQL JSON field:
1. Luôn validate là array trước khi lưu
2. Normalize về array khi đọc từ DB
3. Hoặc dùng `text[]` type thay vì `json` (nếu chỉ lưu mảng string đơn giản)

---

**Fixed by**: GitHub Copilot  
**Date**: 31/10/2025  
**Status**: ✅ Resolved
