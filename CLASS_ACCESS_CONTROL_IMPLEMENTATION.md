# 🔒 CLASS-ONLY ACCESS CONTROL - Implementation Plan

## 📋 Quy tắc mới (New Rule):

**SINH VIÊN / LỚP TRƯỞNG / GIẢNG VIÊN CHỈ ĐƯỢC TRUY CẬP HOẠT ĐỘNG TRONG LỚP CỦA MÌNH**

### ✅ Chi tiết quy tắc:

1. **Sinh viên (SINH_VIEN):**
   - CHỈ xem được hoạt động do lớp mình tạo
   - CHỈ đăng ký hoạt động trong lớp mình
   - KHÔNG thấy hoạt động của lớp khác

2. **Lớp trưởng (LOP_TRUONG):**
   - CHỈ tạo hoạt động cho lớp mình
   - CHỈ xem/quản lý hoạt động lớp mình
   - KHÔNG tạo hoạt động cho lớp khác

3. **Giảng viên (GIANG_VIEN):**
   - CHỈ xem/duyệt hoạt động của lớp mình phụ trách (GVCN)
   - CHỈ quản lý đăng ký của sinh viên trong lớp mình
   - KHÔNG thấy hoạt động/đăng ký của lớp khác

4. **Admin:**
   - KHÔNG bị giới hạn
   - Xem được tất cả hoạt động

---

## 🔧 Implementation Details:

### 1. **Middleware Created:**
File: `backend/src/middleware/classActivityAccess.js`

#### Functions:
- `getClassCreators(lopId)` - Lấy danh sách user IDs của lớp (students + GVCN)
- `getTeacherClasses(userId)` - Lấy danh sách class IDs của GVCN
- `getStudentInfo(userId)` - Lấy thông tin sinh viên (bao gồm lop_id)
- `injectClassActivityFilter(req, res, next)` - Inject filter vào req object
- `canRegisterActivity(req, res, next)` - Kiểm tra quyền đăng ký

#### Middleware flow:
```
Request → injectClassActivityFilter → Routes
   ↓
req.classActivityFilter = { nguoi_tao_id: { in: [classCreators] } }
req.classCreators = [user_id_1, user_id_2, ...]
req.userClassId = lop_id (for student/monitor)
req.userClassIds = [lop_id_1, lop_id_2] (for teacher)
```

---

### 2. **Routes to Update:**

#### A. **Activities Routes** (`backend/src/routes/activities.route.js`):

**Hiện trạng:**
- Line 97-280: `GET /` - Đã có logic filter theo lớp cho sinh viên/lớp trưởng ✅
- Line 928: `POST /:id/register` - CHƯA kiểm tra hoạt động có thuộc lớp không ❌

**Cần sửa:**
```javascript
// BEFORE:
router.post('/:id/register', auth, requirePermission('registrations.register'), async (req, res) => {
  // ... no class check
})

// AFTER:
const { canRegisterActivity } = require('../middleware/classActivityAccess');
router.post('/:id/register', auth, canRegisterActivity, requirePermission('registrations.register'), async (req, res) => {
  // ... middleware will block if activity not in class
})
```

#### B. **Dashboard Routes** (`backend/src/routes/dashboard.route.js`):

**Endpoints cần update:**
- `/dashboard/student` - Controller đã có logic ✅ (vừa sửa)
- `/activities/me` - Cần kiểm tra

#### C. **Teacher Routes** (`backend/src/routes/teacher.route.js`):

**Endpoints cần kiểm tra:**
- `/teacher/activities` - Danh sách hoạt động GVCN quản lý
- `/teacher/registrations` - Danh sách đăng ký cần duyệt
- `/teacher/dashboard` - Đã có logic filter ✅

---

### 3. **Backend Controller Updates:**

#### File: `backend/src/controllers/dashboard.controller.js`

**Đã sửa (Line 200-220):**
```javascript
// OLD: Không filter theo class
const recentActivities = await prisma.dangKyHoatDong.findMany({
  where: {
    sv_id: sinhVien.id,
    trang_thai_dk: { in: ['da_duyet', 'da_tham_gia'] },
    hoat_dong: activityWhereClause
  }
});

// NEW: Filter theo class creators
const recentActivities = await prisma.dangKyHoatDong.findMany({
  where: {
    sv_id: sinhVien.id,
    trang_thai_dk: { in: ['da_duyet', 'da_tham_gia'] },
    hoat_dong: {
      ...activityWhereClause,
      nguoi_tao_id: { in: classCreators } // ← CHỈ lớp
    }
  }
});
```

---

### 4. **Frontend Updates:**

#### File: `frontend/src/pages/student/DashboardStudentModern.js`

**Đã sửa (Line 100-125):**
```javascript
// Filter only class activities
const classActivities = myData.filter(activity => {
  return activity.is_class_activity === true; // ← Backend đã tính
});

// Tính điểm chỉ từ hoạt động lớp
const classActivitiesOnly = (myData || []).filter(r => 
  r.is_class_activity === true
);
```

**Logic:**
- `is_class_activity` được backend tính dựa trên `nguoi_tao_id`
- Frontend filter theo field này để đảm bảo nhất quán

---

## 📊 Testing Plan:

### Test Case 1: Sinh viên xem hoạt động
```
User: SV Lớp A
Expected: Chỉ thấy hoạt động do Lớp A tạo (GVCN A + sinh viên A)
Expected: KHÔNG thấy hoạt động của Lớp B, C, D
```

### Test Case 2: Sinh viên đăng ký hoạt động
```
User: SV Lớp A
Action: Đăng ký hoạt động X (do Lớp B tạo)
Expected: HTTP 403 - "Bạn chỉ có thể đăng ký hoạt động trong lớp của mình"
```

### Test Case 3: Lớp trưởng tạo hoạt động
```
User: Lớp trưởng Lớp A
Action: Tạo hoạt động mới
Expected: Hoạt động tự động gắn với Lớp A
Expected: Chỉ sinh viên Lớp A mới đăng ký được
```

### Test Case 4: GVCN xem danh sách hoạt động
```
User: GVCN Lớp A
Expected: Chỉ thấy hoạt động do mình hoặc sinh viên Lớp A tạo
Expected: KHÔNG thấy hoạt động Lớp B (dù mình là GVCN Lớp B)
```

### Test Case 5: GVCN duyệt đăng ký
```
User: GVCN Lớp A
Action: Duyệt đăng ký của SV Lớp B
Expected: HTTP 403 - "Bạn chỉ có thể quản lý hoạt động trong lớp của mình"
```

### Test Case 6: Admin full access
```
User: Admin
Expected: Thấy TẤT CẢ hoạt động của tất cả lớp
Expected: Không bị filter
```

---

## ⚠️ Breaking Changes:

### Người dùng bị ảnh hưởng:

1. **Sinh viên đã đăng ký hoạt động ngoài lớp:**
   - Trước: Có thể đăng ký bất kỳ hoạt động nào
   - Sau: CHỈ đăng ký hoạt động lớp mình
   - **Impact**: Các đăng ký hiện tại vẫn giữ nguyên, nhưng không thể đăng ký mới

2. **Lớp trưởng tạo hoạt động cho nhiều lớp:**
   - Trước: Lớp trưởng có thể tạo hoạt động không giới hạn
   - Sau: Chỉ tạo cho lớp mình
   - **Impact**: Cần admin tạo hoạt động liên lớp

3. **GVCN quản lý nhiều lớp:**
   - Trước: GVCN thấy hoạt động tất cả lớp mình phụ trách
   - Sau: Chỉ thấy hoạt động lớp hiện tại
   - **Impact**: Nếu GVCN có nhiều lớp, cần logic riêng

---

## 🔄 Migration Strategy:

### Option 1: Soft Migration (Recommended)
- Giữ nguyên data hiện tại
- Áp dụng rule mới cho registrations/views từ bây giờ
- Hiển thị warning cho hoạt động ngoài lớp (readonly)

### Option 2: Hard Migration
- Xóa tất cả đăng ký ngoài lớp
- Cảnh báo người dùng trước
- Chỉ giữ lại hoạt động trong lớp

### ✅ Chọn: Option 1 (Soft Migration)
```sql
-- Không cần migration script
-- Frontend/Backend tự động filter theo rule mới
-- Data cũ vẫn tồn tại trong DB nhưng không hiển thị
```

---

## 📁 Files Changed:

1. ✅ `backend/src/middleware/classActivityAccess.js` - NEW FILE
2. ✅ `backend/src/controllers/dashboard.controller.js` - Line 200-220
3. ✅ `frontend/src/pages/student/DashboardStudentModern.js` - Line 100-150
4. 🔄 `backend/src/routes/activities.route.js` - Line 928 (pending)
5. 🔄 `backend/src/routes/teacher.route.js` - Multiple endpoints (pending)

---

## 📝 Next Steps:

1. ✅ Tạo middleware `classActivityAccess.js`
2. ✅ Update dashboard controller (recentActivities filter)
3. ✅ Update frontend (filter by is_class_activity)
4. ⏳ Apply middleware to registration route
5. ⏳ Apply middleware to teacher routes
6. ⏳ Update activities.route.js GET endpoint (if needed)
7. ⏳ Test all scenarios
8. ⏳ Document API changes

---

## 🚀 Deployment Checklist:

- [ ] Backup database
- [ ] Test on staging environment
- [ ] Notify users về rule change
- [ ] Deploy backend first
- [ ] Deploy frontend
- [ ] Monitor error logs
- [ ] Verify sinh viên can register class activities
- [ ] Verify sinh viên CANNOT register other class activities

---

**Date**: 2024-11-06
**Status**: 🟡 In Progress
**Priority**: 🔴 HIGH - Security/Access Control
