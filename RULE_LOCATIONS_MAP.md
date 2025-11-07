# 🗺️ RULE LOCATIONS - Where Class Access Rules Are Stored

## 📍 Overview:
**Rule**: Sinh viên/Lớp trưởng/GVCN CHỈ được tham gia hoạt động trong lớp của mình

---

## 🔧 Backend - Rule Enforcement Locations:

### 1. **Middleware (Core Logic)** 🔐
**File**: `backend/src/middleware/classActivityAccess.js`
**Line**: 1-282 (toàn bộ file)

**Functions**:
- `getClassCreators(lopId)` - Lấy danh sách user IDs của lớp
- `getTeacherClasses(userId)` - Lấy classes của GVCN
- `getStudentInfo(userId)` - Lấy thông tin sinh viên
- `canAccessClassActivities(userId, role, lopId)` - Kiểm tra quyền truy cập
- `injectClassActivityFilter(req, res, next)` - Inject filter vào request
- `canRegisterActivity(req, res, next)` - Kiểm tra quyền đăng ký

**Applied to**:
```javascript
// Registration route
router.post('/:id/register', auth, canRegisterActivity, ...)
```

---

### 2. **Activities Route (List & Filter)** 📋
**File**: `backend/src/routes/activities.route.js`

#### A. GET / - List Activities
**Lines**: 97-530

**Logic**:
```javascript
// Line 160-240: Sinh viên filter
if (role === 'student' || role === 'sinh_vien') {
  const currentStudent = await prisma.sinhVien.findUnique({
    where: { nguoi_dung_id: userId }
  });
  
  if (currentStudent?.lop_id) {
    // Lấy tất cả sinh viên trong lớp
    const allClassStudents = await prisma.sinhVien.findMany({
      where: { lop_id: lopId }
    });
    
    // Lấy GVCN
    const lop = await prisma.lop.findUnique({
      where: { id: lopId },
      select: { chu_nhiem: true }
    });
    
    // Filter: chỉ hoạt động do lớp tạo
    where.nguoi_tao_id = { in: [...classStudentUserIds, gvcn_id] };
  }
}

// Line 240-270: Lớp trưởng filter (giống sinh viên)
// Line 280-320: GVCN filter (tất cả lớp phụ trách)
```

**Return field**:
```javascript
// Line 508: Trả về flag is_class_activity
is_class_activity: createdByClassOrHomeroom
```

#### B. POST /:id/register - Đăng ký hoạt động
**Line**: 928

**Middleware**: `canRegisterActivity` ✅
```javascript
router.post('/:id/register', 
  auth, 
  canRegisterActivity,  // ← Kiểm tra hoạt động có thuộc lớp không
  requirePermission('registrations.register'), 
  enforceUserWritable, 
  async (req, res) => { ... }
);
```

---

### 3. **Dashboard Controller** 📊
**File**: `backend/src/controllers/dashboard.controller.js`
**Lines**: 145-220

**Logic**:
```javascript
// Line 145-165: Get class creators
const allClassStudents = await prisma.sinhVien.findMany({
  where: { lop_id: sinhVien.lop_id }
});

const lop = await prisma.lop.findUnique({
  where: { id: sinhVien.lop_id },
  select: { chu_nhiem: true }
});

const classCreators = [...studentIds, gvcn_id];

// Line 172-195: Upcoming activities - Filter theo lớp
const upcomingActivities = await prisma.hoatDong.findMany({
  where: {
    trang_thai: 'da_duyet',
    ngay_bd: { gte: new Date() },
    nguoi_tao_id: { in: classCreators }  // ← CHỈ lớp
  }
});

// Line 200-220: Recent activities - Filter theo lớp
const recentActivities = await prisma.dangKyHoatDong.findMany({
  where: {
    sv_id: sinhVien.id,
    trang_thai_dk: { in: ['da_duyet', 'da_tham_gia'] },
    hoat_dong: {
      ...activityWhereClause,
      nguoi_tao_id: { in: classCreators }  // ← CHỈ lớp
    }
  }
});
```

---

### 4. **Dashboard Route** 📈
**File**: `backend/src/routes/dashboard.route.js`
**Lines**: 785-915

**Endpoint**: `/dashboard/activities/me`

**Logic**:
```javascript
// Line 820-840: Get class creators
const allClassStudents = await prisma.sinhVien.findMany({
  where: { lop_id: sv.lop_id }
});

const lop = await prisma.lop.findUnique({
  where: { id: sv.lop_id },
  select: { chu_nhiem: true }
});

classCreators = [...studentUserIds, gvcn_id];

// Line 850-880: Registrations filter
const registrations = await prisma.dangKyHoatDong.findMany({
  where: { 
    sv_id: sv.id,
    hoat_dong: activityFilter  // ← Đã có semester + class filter
  },
  include: {
    hoat_dong: {
      include: { dang_ky_hd: { 
        where: { sv_id: { in: classStudentIds } }  // ← Kiểm tra class
      }}
    }
  }
});

// Line 886-893: Return với is_class_activity flag
is_class_activity: (
  (classCreators.includes(r.hoat_dong?.nguoi_tao_id)) ||
  (r.hoat_dong?.dang_ky_hd?.length > 0)
)
```

---

## 🎨 Frontend - Rule Display & Filter:

### 1. **Activities List Page** 📄
**File**: `frontend/src/pages/student/ActivitiesListModern.js`
**Lines**: 128-138

**Filter Logic**:
```javascript
// Line 128-138: Chỉ hiển thị hoạt động lớp
React.useEffect(() => {
  const filtered = items.filter(activity => 
    activity.is_class_activity === true  // ← Filter key
  );
  setFilteredItems(filtered);
  
  console.log('📊 Filtered activities:', {
    total: items.length,
    inClass: items.filter(a => a.is_class_activity).length,
    filteredCount: filtered.length
  });
}, [items]);
```

**Display**:
- Chỉ render `filteredItems` (đã loại bỏ hoạt động ngoài lớp)
- UI không có tab "All" hay "Out of class" nữa

---

### 2. **Student Dashboard** 🏠
**File**: `frontend/src/pages/student/DashboardStudentModern.js`
**Lines**: 106-150

**Filter Logic**:
```javascript
// Line 106-120: Filter "Hoạt động gần đây"
const classActivities = myData.filter(activity => {
  return activity.is_class_activity === true;  // ← Backend field
});

// Sort by latest first
const sorted = [...classActivities].sort((a, b) => {
  const dateA = new Date(a.ngay_dang_ky || a.hoat_dong?.ngay_bd || 0);
  const dateB = new Date(b.ngay_dang_ky || b.hoat_dong?.ngay_bd || 0);
  return dateB - dateA;
});
setRecentActivities(sorted);

// Line 133-145: Tính điểm chỉ từ hoạt động lớp
const classActivitiesOnly = (myData || []).filter(r => 
  r.is_class_activity === true
);

const participated = classActivitiesOnly.filter(r => 
  hkMatch(r) && (isAttended(r) || getPoints(r) > 0)
);
```

---

## 📊 Data Flow Diagram:

```
┌─────────────────────────────────────────────────────────┐
│  1. User Request                                         │
│     - Role: sinh_vien / lop_truong / giao_vien         │
│     - Action: GET /activities or POST /register         │
└──────────────────┬──────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────┐
│  2. Middleware: canRegisterActivity (if register)       │
│     - Check activity.nguoi_tao_id in classCreators      │
│     - Return 403 if not in class                        │
└──────────────────┬──────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────┐
│  3. Route Handler: GET /activities                       │
│     - Get user's class (lop_id)                         │
│     - Get all students in class                         │
│     - Get GVCN of class                                 │
│     - Build classCreators = [students, gvcn]           │
│     - Filter: nguoi_tao_id IN classCreators            │
└──────────────────┬──────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────┐
│  4. Database Query                                       │
│     WHERE nguoi_tao_id IN [user1, user2, ..., gvcn]    │
└──────────────────┬──────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────┐
│  5. Response                                             │
│     - activities[]                                       │
│       - id, ten_hd, ...                                 │
│       - is_class_activity: true/false                   │
└──────────────────┬──────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────┐
│  6. Frontend Filter (Double Check)                      │
│     filtered = items.filter(a => a.is_class_activity)  │
└──────────────────┬──────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────┐
│  7. Display to User                                      │
│     - CHỈ hoạt động trong lớp                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Layers:

### Layer 1: Middleware ✅
- `canRegisterActivity` - Chặn đăng ký ngoài lớp
- Return 403 Forbidden

### Layer 2: Route Filter ✅
- GET `/activities` - Filter WHERE nguoi_tao_id IN classCreators
- Backend KHÔNG trả về hoạt động ngoài lớp

### Layer 3: Dashboard Controller ✅
- `/dashboard/student` - Filter recentActivities, upcomingActivities
- Chỉ query hoạt động có nguoi_tao_id trong lớp

### Layer 4: Frontend Filter ✅
- Double-check với `is_class_activity` field
- Đảm bảo UI không leak hoạt động ngoài lớp

---

## 🧪 Test Points:

### Test 1: GET /activities (Sinh viên Lớp A)
```bash
# Expected: Chỉ thấy hoạt động do Lớp A tạo
GET /activities
Authorization: Bearer <sinh_vien_lop_A_token>

# Response should have:
items: [
  { id: 1, ten_hd: "HD1", is_class_activity: true },  # Do lớp A tạo
  { id: 2, ten_hd: "HD2", is_class_activity: true },  # Do GVCN A tạo
  # KHÔNG có hoạt động lớp B, C, D
]
```

### Test 2: POST /activities/:id/register (Ngoài lớp)
```bash
# Expected: 403 Forbidden
POST /activities/999/register  # HD của lớp B
Authorization: Bearer <sinh_vien_lop_A_token>

# Response:
{
  "success": false,
  "message": "Bạn chỉ có thể đăng ký hoạt động trong lớp của mình"
}
```

### Test 3: Dashboard (Sinh viên)
```bash
# Expected: recent activities chỉ có lớp mình
GET /dashboard/student
Authorization: Bearer <sinh_vien_token>

# Response:
{
  "hoat_dong_gan_day": [
    { id: 1, is_class_activity: true },  # Lớp mình
    # KHÔNG có hoạt động lớp khác
  ]
}
```

---

## 📝 Summary Table:

| Location | File | Lines | Purpose | Status |
|----------|------|-------|---------|--------|
| **Middleware** | `backend/src/middleware/classActivityAccess.js` | 1-282 | Core logic kiểm tra quyền | ✅ |
| **Activities Route** | `backend/src/routes/activities.route.js` | 97-530, 928 | Filter & block registration | ✅ |
| **Dashboard Controller** | `backend/src/controllers/dashboard.controller.js` | 145-220 | Filter dashboard data | ✅ |
| **Dashboard Route** | `backend/src/routes/dashboard.route.js` | 785-915 | My activities filter | ✅ |
| **Frontend List** | `frontend/src/pages/student/ActivitiesListModern.js` | 128-138 | UI filter | ✅ |
| **Frontend Dashboard** | `frontend/src/pages/student/DashboardStudentModern.js` | 106-150 | Dashboard filter & calc | ✅ |

---

## 🚀 How to Verify:

### 1. Check Backend Logs:
```bash
# Terminal: npm run dev (backend)
# Look for logs:
🔍 User role: sinh_vien
🔍 Lop ID: 123
✅ Filter by nguoi_tao_id (class members + homeroom teacher): 15 creators
```

### 2. Check Frontend Console:
```javascript
// Browser DevTools Console
📊 Filtered activities: {
  total: 20,
  inClass: 5,
  outClass: 15,  // Should be filtered out
  filteredCount: 5
}
```

### 3. Check Network Tab:
```
GET /activities?semester=hoc_ky_1-2024
Response: {
  items: [ /* only class activities */ ],
  total: 5
}
```

### 4. Try Manual Test:
```
1. Login as Sinh viên Lớp A
2. Go to /student/activities
3. Should only see activities from Lớp A
4. Try to register for activity from Lớp B (via API/URL hack)
5. Should get 403 Forbidden
```

---

## 📌 Key Takeaway:

**Rule được enforce ở 4 layers:**
1. ✅ Middleware (canRegisterActivity) - Block at gate
2. ✅ Route Handler (GET /activities) - Filter query
3. ✅ Controller (dashboard) - Filter dashboard data
4. ✅ Frontend - Double-check display

**Không có cách nào bypass được vì:**
- Backend filter ngay từ database query
- Middleware block registration requests
- Frontend chỉ là extra safety net

---

**Created**: 2024-11-06  
**Status**: ✅ Documented & Verified  
**Confidence**: 🟢 HIGH
