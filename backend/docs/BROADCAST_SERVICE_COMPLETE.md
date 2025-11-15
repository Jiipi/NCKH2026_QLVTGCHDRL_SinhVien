# Broadcast Notifications Service - COMPLETE ✅

**Migration Date:** November 10, 2025  
**Source:** `controllers/admin.controller.js` (3 methods, ~167 lines)  
**Target:** `services/broadcast.service.js` (426 lines) + `routes/broadcast.route.js` (91 lines)

---

## 📊 Migration Summary

### File Structure
```
src/
├── services/
│   └── broadcast.service.js   (426 lines, 3 public + 1 private method)
└── routes/
    └── broadcast.route.js     (91 lines, 3 endpoints)
```

### Code Metrics
- **Source Lines:** ~167 lines (3 methods from admin.controller.js)
- **Service Lines:** 426 lines (+255% organized, extracted logic)
- **Routes Lines:** 91 lines
- **Total V2 Lines:** 517 lines
- **Service Methods:** 3 public (broadcastNotification, getBroadcastStats, getBroadcastHistory) + 1 private (_getRecipientsByScope)
- **API Endpoints:** 3 (POST /, GET /stats, GET /history)

---

## 🎯 Service Layer (broadcast.service.js)

### Public Methods

#### 1. **broadcastNotification(params)**
**Purpose:** Send notification to multiple recipients based on scope

**Parameters:**
```javascript
{
  tieu_de: string,              // Title (required)
  noi_dung: string,             // Content (required)
  nguoi_gui_id: number,         // Sender ID (required)
  loai_tb_id?: number,          // Notification type ID
  muc_do_uu_tien?: string,      // Priority: 'thap' | 'trung_binh' | 'cao'
  phuong_thuc_gui?: string,     // Delivery method
  scope: string,                // Target scope (required)
  targetRole?: string,          // For scope='role'
  targetClass?: number,         // For scope='class'
  targetDepartment?: string,    // For scope='department'
  activityId?: number           // For scope='activity'
}
```

**Scope Types:**
1. **`system`** - All active users in system
2. **`role`** - All users with specific role (requires `targetRole`)
3. **`class`** - All students in specific class (requires `targetClass`)
4. **`department`** - All students in specific department/faculty (requires `targetDepartment`)
5. **`activity`** - All registered students for specific activity (requires `activityId`)

**Logic Flow:**
1. Validate required fields (tieu_de, noi_dung, nguoi_gui_id)
2. Get or create default notification type
3. Determine recipients via `_getRecipientsByScope()`
4. Enhance message with scope metadata
5. Create bulk notifications using `createMany()`
6. Log broadcast action
7. Return `{ count, scope, message }`

**Returns:**
```javascript
{
  count: number,        // Number of recipients
  scope: string,        // Scope label (e.g., 'system', 'role:SINH_VIEN')
  message: string       // Success message
}
```

---

#### 2. **getBroadcastStats(adminId)**
**Purpose:** Get broadcast statistics aggregated by scope and time

**Logic Flow:**
1. Fetch all notifications with sender/receiver relations
2. Group by `title + sender + timestamp` to detect broadcasts
3. Filter broadcasts (recipients > 1)
4. Analyze recipients to detect scope patterns:
   - **System scope:** >50 recipients + ≥2 roles
   - **Role scope:** 1 role + multiple/no classes
   - **Class scope:** 1 class
5. Count broadcasts in last 7 days
6. Log stats fetch action

**Returns:**
```javascript
{
  total: number,          // Total broadcasts all-time
  thisWeek: number,       // Broadcasts in last 7 days
  systemScope: number,    // Count of system-wide broadcasts
  roleScope: number,      // Count of role-based broadcasts
  classScope: number      // Count of class-based broadcasts
}
```

**Algorithm:**
- Groups notifications by key: `${title}_${senderId}_${timestamp}`
- Detects broadcast if grouped count > 1
- Infers scope from recipient patterns (heuristic-based)

---

#### 3. **getBroadcastHistory(adminId, limit=500)**
**Purpose:** Get detailed broadcast history with recipient analysis

**Parameters:**
- `adminId` - Admin user ID requesting history
- `limit` - Maximum notifications to retrieve (default: 500)

**Logic Flow:**
1. Fetch recent notifications (limited by `take`)
2. Group by broadcast key (same as stats)
3. Filter broadcasts (recipients > 1)
4. For each broadcast:
   - Detect scope via pattern analysis
   - Extract unique roles and classes
   - Limit recipient list to 20 for performance
   - Strip scope metadata from message
5. Log history fetch action

**Returns:**
```javascript
{
  history: [
    {
      id: number,
      title: string,
      message: string,          // Without [Phạm vi:] metadata
      date: Date,
      recipients: number,
      recipientsList: Array,    // First 20 recipients
      scope: string,            // Detected scope
      roles: Array<string>,     // Unique roles
      classes: Array<string>,   // Unique classes
      senderName: string,
      senderRole: string
    }
  ]
}
```

**Scope Detection Logic:**
```javascript
if (recipients > 50 && roles.length >= 2) → 'system'
else if (roles.length === 1 && (classes > 1 || classes === 0)) → 'role'
else if (classes.length === 1) → 'class'
else if (classes.length > 1 && classes.length <= 3) → 'department'
else → 'unknown'
```

---

### Private Methods

#### 4. **_getRecipientsByScope({ scope, targetRole, targetClass, targetDepartment, activityId })**
**Purpose:** Internal method to resolve recipient IDs based on scope

**Scope Implementations:**

**System:**
```javascript
prisma.nguoiDung.findMany({
  where: { trang_thai: 'hoat_dong' }
})
```

**Role:**
```javascript
vaiTro = prisma.vaiTro.findFirst({ where: { ten_vt: targetRole } })
prisma.nguoiDung.findMany({
  where: { vai_tro_id: vaiTro.id, trang_thai: 'hoat_dong' }
})
```

**Class:**
```javascript
prisma.sinhVien.findMany({
  where: { lop_id: targetClass },
  select: { nguoi_dung_id: true }
})
```

**Department:**
```javascript
deptClasses = prisma.lop.findMany({ where: { khoa: targetDepartment } })
prisma.sinhVien.findMany({
  where: { lop_id: { in: classIds } }
})
```

**Activity:**
```javascript
prisma.dangKyHoatDong.findMany({
  where: {
    hd_id: activityId,
    trang_thai_dk: { in: ['da_duyet', 'da_tham_gia'] }
  }
})
```

**Returns:** `{ recipientIds: Array<number>, scopeLabel: string }`

**Error Handling:**
- Throws descriptive Vietnamese errors for missing parameters
- Validates scope value against allowed values
- Checks existence of role/class/department

---

## 🌐 Routes Layer (broadcast.route.js)

### Endpoints

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/core/broadcast` | Admin | Send broadcast notification |
| GET | `/api/core/broadcast/stats` | Admin | Get broadcast statistics |
| GET | `/api/core/broadcast/history` | Admin | Get broadcast history |

### Middleware Stack
```javascript
router.use(authenticateJWT);  // JWT authentication
router.use(requireAdmin);     // Admin role check
```

### Request/Response Examples

#### POST /api/core/broadcast
**Request Body:**
```json
{
  "tieu_de": "Thông báo bảo trì hệ thống",
  "noi_dung": "Hệ thống sẽ bảo trì từ 22h-24h ngày 11/11",
  "scope": "system",
  "muc_do_uu_tien": "cao"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Đã gửi thông báo tới 1250 người",
  "data": {
    "count": 1250,
    "scope": "system",
    "message": "Đã gửi thông báo tới 1250 người"
  }
}
```

**No Recipients (200):**
```json
{
  "success": true,
  "message": "Không có người nhận phù hợp",
  "data": {
    "count": 0,
    "scope": "class:42"
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Thiếu thông tin vai trò (targetRole)",
  "statusCode": 400
}
```

---

#### GET /api/core/broadcast/stats
**Success Response (200):**
```json
{
  "success": true,
  "message": "Lấy thống kê broadcast thành công",
  "data": {
    "total": 156,
    "thisWeek": 12,
    "systemScope": 8,
    "roleScope": 45,
    "classScope": 103
  }
}
```

---

#### GET /api/core/broadcast/history?limit=100
**Success Response (200):**
```json
{
  "success": true,
  "message": "Lấy lịch sử broadcast thành công",
  "data": {
    "history": [
      {
        "id": 12345,
        "title": "Thông báo điểm rèn luyện",
        "message": "Sinh viên kiểm tra điểm rèn luyện...",
        "date": "2025-11-10T14:30:00.000Z",
        "recipients": 450,
        "recipientsList": [...], // First 20
        "scope": "role",
        "roles": ["SINH_VIEN"],
        "classes": ["DHKTPM17A", "DHKTPM17B", ...],
        "senderName": "Admin Nguyễn Văn A",
        "senderRole": "ADMIN"
      }
    ]
  }
}
```

---

## 🔗 Integration Points

### Routes Registration
**File:** `src/routes/index.js`
```javascript
const broadcastV2 = require('./broadcast.route');
router.use('/core/broadcast', broadcastV2);
```

### Dependencies
- **Database:** `prisma` (nguoiDung, vaiTro, sinhVien, lop, dangKyHoatDong, thongBao, loaiThongBao)
- **Utils:** `response.js` (ApiResponse, sendResponse), `logger.js` (logInfo, logError)
- **Auth:** `middlewares/auth.js` (authenticateJWT, requireAdmin)

### Database Relations Used
```prisma
thongBao {
  nguoi_gui    → nguoiDung (sender)
  nguoi_nhan   → nguoiDung (receiver)
  loai_tb      → loaiThongBao (type)
}

nguoiDung {
  vai_tro      → vaiTro (role)
  sinh_vien    → sinhVien (student profile)
}

sinhVien {
  lop          → lop (class)
}

dangKyHoatDong {
  sinh_vien    → sinhVien
  hd           → hoatDong (activity)
}
```

---

## 🧪 Testing Status

### Service Load Test
```bash
✅ Broadcast service loaded
Methods: broadcastNotification, getBroadcastStats, getBroadcastHistory
```

### Syntax Validation
- ✅ No errors in service file
- ✅ No errors in routes file
- ✅ No errors in index.js

### Integration Tests
⏳ Pending - Will run with full test suite after all admin modules complete

---

## 📝 Key Features

### Scope-Based Targeting
- **System-wide:** All active users (useful for maintenance, critical announcements)
- **Role-based:** Target specific user groups (e.g., all students, all teachers)
- **Class-based:** Target specific class (e.g., exam notifications)
- **Department-based:** Target faculty/department (e.g., engineering students)
- **Activity-based:** Target activity participants (e.g., event reminders)

### Metadata Enhancement
- Original message preserved
- Scope info appended: `[Phạm vi: system]`
- Enables filtering/tracking in history

### Performance Optimizations
- **Bulk Insert:** Uses `createMany()` for efficiency
- **Limited History:** Default 500 notifications (configurable)
- **Recipient Truncation:** History shows first 20 recipients
- **Efficient Grouping:** Single-pass grouping by composite key

### Heuristic Scope Detection
Stats/history don't store explicit scope, so detection is pattern-based:
- Analyzes recipient count, role diversity, class distribution
- Approximates original broadcast scope
- Works well for typical broadcast patterns

---

## 🎓 Lessons Learned

1. **Bulk Operations:** `createMany()` is efficient for broadcasting to 100+ users
2. **Metadata Tracking:** Appending scope to message enables post-hoc analysis
3. **Heuristic Detection:** Pattern-based scope detection works when explicit metadata unavailable
4. **Performance Limits:** Capping history at 500 and recipients at 20 prevents memory issues
5. **Validation First:** Checking required params early prevents wasted queries
6. **Descriptive Errors:** Vietnamese error messages match existing codebase style

---

## ✅ Migration Checklist

- [x] Extract broadcastNotification method (lines 47-213)
- [x] Extract getBroadcastStats method (lines 1337-1427)
- [x] Extract getBroadcastHistory method (lines 1429-1519)
- [x] Create broadcast.service.js (426 lines)
- [x] Create broadcast.route.js (91 lines, 3 endpoints)
- [x] Register routes in index.js
- [x] Service load test passed
- [x] Syntax validation passed
- [ ] Integration tests (pending full suite)
- [ ] Document completion (this file ✅)

---

## 📈 Progress Tracking

**Completed Modules:** 6/11 (54.5%)
1. ✅ Points Module
2. ✅ Auth Services
3. ✅ Semesters Module (already done)
4. ✅ Dashboard Module
5. ✅ Activity Types Module
6. ✅ **Broadcast Service** ← YOU ARE HERE
7. ⏳ Admin Users Management
8. ⏳ Admin Dashboard Analytics
9. ⏳ Admin Activities Management
10. ⏳ Admin Reports
11. ⏳ Final Integration

---

**Next Step:** Migrate Admin Users Management (6 methods from admin.controller.js, lines 296-826)
