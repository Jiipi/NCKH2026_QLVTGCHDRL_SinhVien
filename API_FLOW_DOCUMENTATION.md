# Tài Liệu Luồng API - Hệ Thống Quản Lý Hoạt Động Rèn Luyện

## 📋 Mục Lục
1. [Luồng Authentication](#1-luồng-authentication)
2. [Hoạt Động Của Tôi](#2-hoạt-động-của-tôi)
3. [Danh Sách Hoạt Động](#3-danh-sách-hoạt-động)
4. [Phê Duyệt Đăng Ký](#4-phê-duyệt-đăng-ký)
5. [Phê Duyệt Hoạt Động](#5-phê-duyệt-hoạt-động)
6. [Quét QR Code](#6-quét-qr-code)

---

## 1. Luồng Authentication

### 1.1. Login
```
POST /api/auth/login
```

**Request:**
```json
{
  "ten_dn": "202101001",    // Username/MSSV
  "mat_khau": "password123"
}
```

**Response Success:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "c8560148-dca7-42a4-8050-047d114a6208",
      "ten_dn": "202101001",
      "ho_ten": "Le Minh Tu",
      "email": "202101001@student.hcmute.edu.vn",
      "vai_tro": "LOP_TRUONG"
    }
  }
}
```

**JWT Token Payload:**
```json
{
  "sub": "c8560148-dca7-42a4-8050-047d114a6208",  // User ID
  "role": "LOP_TRUONG",
  "iat": 1699660800,
  "exp": 1699747200
}
```

### 1.2. Load Profile sau khi Login
```
GET /api/core/profile
Headers: Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ho_ten": "Le Minh Tu",
    "ten_dn": "202101001",
    "email": "202101001@student.hcmute.edu.vn",
    "anh_dai_dien": null,
    "vai_tro": {
      "ten_vt": "LOP_TRUONG",
      "mo_ta": "Lớp trưởng"
    },
    "sinh_vien": {
      "mssv": "202101001",
      "lop": {
        "ten_lop": "ATTT01-2021",
        "khoa": "Công nghệ thông tin"
      }
    }
  }
}
```

### 1.3. Permission Check
**Middleware:** `requirePermission('permission.name')`

**Luồng:**
1. Extract JWT token từ header `Authorization: Bearer {token}`
2. Decode token → Lấy `user.role`
3. Query DB: `SELECT quyen_han FROM vai_tro WHERE ten_vt = user.role`
4. Check permission trong `quyen_han` array
5. Nếu có → `next()`, không có → `403 Forbidden`

**Cache:**
- TTL: 30 giây
- Invalidate khi admin update role permissions

---

## 2. Hoạt Động Của Tôi

### 2.1. SINH_VIEN - My Activities

**Endpoint:**
```
GET /api/student/my-activities?semester=hoc_ky_1-2025&page=1&limit=20
Headers: Authorization: Bearer {token}
```

**Permissions Required:**
- `points.view_own` hoặc `registrations.view`

**Backend Flow:**
```javascript
// 1. Auth middleware validates JWT
auth(req, res, next)
  ↓
// 2. Permission check
requirePermission('points.view_own')(req, res, next)
  ↓
// 3. Get student ID from user ID
const student = await prisma.sinhVien.findUnique({
  where: { nguoi_dung_id: req.user.sub }
})
  ↓
// 4. Parse semester
const { hoc_ky, nam_hoc } = parseSemester(req.query.semester)
  ↓
// 5. Query registrations with activities
const registrations = await prisma.dangKyHoatDong.findMany({
  where: {
    sv_id: student.id,
    hoat_dong: {
      hoc_ky: hoc_ky,
      nam_hoc: nam_hoc
    }
  },
  include: {
    hoat_dong: {
      include: {
        loai_hd: true,
        nguoi_tao: true
      }
    }
  },
  orderBy: { ngay_dang_ky: 'desc' }  // ✅ Mới nhất trước
})
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "reg-uuid-1",
        "trang_thai_dk": "da_tham_gia",
        "ngay_dang_ky": "2025-11-10T08:30:00Z",
        "hoat_dong": {
          "id": "activity-uuid-1",
          "ten_hd": "Hoat dong 1",
          "diem_rl": 5,
          "ngay_bd": "2025-11-15T07:00:00Z",
          "trang_thai": "da_duyet",
          "loai_hd": {
            "ten_loai_hd": "Tham gia khoa"
          }
        }
      }
    ],
    "total": 7,
    "totalPoints": 35
  }
}
```

### 2.2. LOP_TRUONG - My Activities

**Same as SINH_VIEN** + có thể xem hoạt động của cả lớp

**Additional Endpoint:**
```
GET /api/class/activities?semester=hoc_ky_1-2025
Headers: Authorization: Bearer {token}
```

**Backend Flow:**
```javascript
// 1-2. Auth + Permission check
auth → requirePermission('activities.view')
  ↓
// 3. Get class monitor's class
const monitor = await prisma.sinhVien.findFirst({
  where: { nguoi_dung_id: req.user.sub }
})
const lop = await prisma.lop.findFirst({
  where: { lop_truong: monitor.id }
})
  ↓
// 4. Get all students in class
const classStudents = await prisma.sinhVien.findMany({
  where: { lop_id: lop.id },
  select: { nguoi_dung_id: true }
})
  ↓
// 5. Get activities created by class members
const activities = await prisma.hoatDong.findMany({
  where: {
    nguoi_tao_id: { in: classStudents.map(s => s.nguoi_dung_id) },
    hoc_ky: hoc_ky,
    nam_hoc: nam_hoc
  },
  orderBy: { ngay_cap_nhat: 'desc' }  // ✅ Mới cập nhật trước
})
```

---

## 3. Danh Sách Hoạt Động

### 3.1. API Endpoint
```
GET /api/activities?semester=hoc_ky_1-2025&page=1&limit=20
Headers: Authorization: Bearer {token}
```

**Permissions Required:**
- `activities.view` (tất cả roles)

### 3.2. Backend Flow - SINH_VIEN

```javascript
// Route: /routes/v1-compat.route.js
activitiesRouter.get('/', auth, async (req, res) => {
  const user = { id: req.user.sub, role: req.user.role, sub: req.user.sub }
  const result = await ActivitiesService.list(filters, user)
})
  ↓
// Service: /modules/activities/activities.service.js
async list(filters, user) {
  // 1. Check role
  if (user.role === 'SINH_VIEN' || user.role === 'LOP_TRUONG') {
    // 2. Get student's class
    const student = await prisma.sinhVien.findUnique({
      where: { nguoi_dung_id: user.sub }
    })
    
    // 3. Get all class members
    const classStudents = await prisma.sinhVien.findMany({
      where: { lop_id: student.lop_id },
      select: { nguoi_dung_id: true }
    })
    
    // 4. Apply filter
    where.nguoi_tao_id = { in: classStudents.map(s => s.nguoi_dung_id) }
  }
  
  // 5. Query activities
  const activities = await activitiesRepo.findMany(where, {
    page, limit,
    sort: 'ngay_cap_nhat',  // ✅ Default sort
    order: 'desc'
  })
  
  // 6. Enrich with registration status
  result.items = await enrichActivitiesWithRegistrations(
    activities.items, 
    user.sub, 
    user.role
  )
}
```

### 3.3. Backend Flow - GIANG_VIEN

```javascript
// Same as above, but:
if (user.role === 'GIANG_VIEN') {
  // 1. Get teacher's homeroom classes
  const classes = await prisma.lop.findMany({
    where: { chu_nhiem: user.sub },
    select: { id: true }
  })
  
  // 2. Get students in those classes
  const students = await prisma.sinhVien.findMany({
    where: { lop_id: { in: classes.map(c => c.id) } },
    select: { nguoi_dung_id: true }
  })
  
  // 3. Filter activities
  where.nguoi_tao_id = { in: students.map(s => s.nguoi_dung_id) }
}
```

### 3.4. Backend Flow - ADMIN

```javascript
// ADMIN sees ALL activities (no filter)
if (user.role === 'ADMIN') {
  // No where filter applied
  // Just query all activities
}
```

### 3.5. Response Structure

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "69cfe281-580a-4dc1-b215-4aa31f68a28e",
        "ma_hd": null,
        "ten_hd": "Hoat dong 1",
        "mo_ta": "hd1",
        "loai_hd_id": "270b7fe8-58eb-4b12-813c-88bfc3ec298b",
        "diem_rl": 5,
        "dia_diem": "hd1",
        "ngay_bd": "2025-11-11T03:55:00.000Z",
        "ngay_kt": "2025-11-11T23:56:00.000Z",
        "han_dk": null,
        "sl_toi_da": 10,
        "trang_thai": "cho_duyet",
        "hinh_anh": ["/uploads/images/hoat_dong_1.jpg"],
        "tep_dinh_kem": ["/uploads/attachments/file.docx"],
        "ngay_tao": "2025-11-10T10:00:00Z",
        "ngay_cap_nhat": "2025-11-11T00:05:53Z",  // ✅ Sort field
        "loai_hd": {
          "ten_loai_hd": "Tham gia khoa",
          "diem_mac_dinh": 5,
          "mau_sac": "#3B82F6"
        },
        "nguoi_tao": {
          "ho_ten": "Nguyen Van A",
          "email": "202101002@student.hcmute.edu.vn"
        },
        "_count": {
          "dang_ky_hd": 5  // Số người đăng ký
        },
        // ✅ Enriched fields for SINH_VIEN/LOP_TRUONG
        "registration_status": "da_tham_gia",
        "registration_date": "2025-11-10T08:30:00Z",
        "can_register": false,
        "can_cancel": false
      }
    ],
    "total": 17,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

## 4. Phê Duyệt Đăng Ký

### 4.1. LOP_TRUONG - Get Pending Registrations

**Endpoint:**
```
GET /api/class/registrations?status=cho_duyet&semester=hoc_ky_1-2025
Headers: Authorization: Bearer {token}
```

**Permissions Required:**
- `registrations.view`
- Middleware: `isClassMonitor` (check if user is LOP_TRUONG of a class)

**Backend Flow:**
```javascript
// 1. Auth + Permission
auth → requirePermission('registrations.view')
  ↓
// 2. Check if user is class monitor
isClassMonitor(req, res, next) {
  const sv = await prisma.sinhVien.findFirst({
    where: { nguoi_dung_id: req.user.sub }
  })
  const lop = await prisma.lop.findFirst({
    where: { lop_truong: sv.id }
  })
  if (!lop) return 403
  req.classMonitor = { lop_id: lop.id, ten_lop: lop.ten_lop }
}
  ↓
// 3. Get pending registrations
MonitorService.getPendingRegistrations(classId, status, semester)
  ↓
// 4. Query with filters
const registrations = await prisma.dangKyHoatDong.findMany({
  where: {
    trang_thai_dk: 'cho_duyet',
    sinh_vien: { lop_id: req.classMonitor.lop_id },
    hoat_dong: { hoc_ky, nam_hoc }
  },
  include: {
    sinh_vien: {
      include: {
        nguoi_dung: true,
        lop: true
      }
    },
    hoat_dong: {
      include: {
        loai_hd: true,
        nguoi_tao: true
      }
    }
  },
  orderBy: { ngay_dang_ky: 'desc' }  // ✅ Mới nhất trước
})
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "reg-uuid-1",
      "trang_thai_dk": "cho_duyet",
      "ngay_dang_ky": "2025-11-10T14:30:00Z",
      "ly_do_dk": "Muốn tham gia học hỏi",
      "sinh_vien": {
        "mssv": "202101005",
        "nguoi_dung": {
          "ho_ten": "Tran Thi B",
          "email": "202101005@student.hcmute.edu.vn"
        },
        "lop": {
          "ten_lop": "ATTT01-2021"
        }
      },
      "hoat_dong": {
        "ten_hd": "Hoat dong 1",
        "diem_rl": 5,
        "ngay_bd": "2025-11-15T07:00:00Z",
        "loai_hd": {
          "ten_loai_hd": "Tham gia khoa"
        }
      }
    }
  ],
  "total": 12
}
```

### 4.2. LOP_TRUONG - Approve Registration

**Endpoint:**
```
POST /api/class/registrations/:id/approve
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "ghi_chu": "Đồng ý cho tham gia"  // Optional
}
```

**Backend Flow:**
```javascript
// Route: /routes/v1-compat.route.js
classRouter.post('/registrations/:id/approve', auth, isClassMonitor, async (req, res) => {
  const { id } = req.params
  await MonitorService.approveRegistration(id, req.user.sub, req.user.role)
})
  ↓
// Service: /modules/monitor/monitor.service.js
static async approveRegistration(registrationId, userId, userRole) {
  // 1. Get registration
  const registration = await prisma.dangKyHoatDong.findUnique({
    where: { id: registrationId },
    include: { sinh_vien: true, hoat_dong: true }
  })
  
  // 2. Check permission (must be from same class)
  const monitor = await prisma.sinhVien.findFirst({
    where: { nguoi_dung_id: userId }
  })
  const lop = await prisma.lop.findFirst({
    where: { lop_truong: monitor.id }
  })
  if (registration.sinh_vien.lop_id !== lop.id) {
    throw new ForbiddenError('Chỉ được duyệt đăng ký của lớp mình')
  }
  
  // 3. Update status
  const updated = await prisma.dangKyHoatDong.update({
    where: { id: registrationId },
    data: {
      trang_thai_dk: 'da_duyet',
      ngay_duyet: new Date(),
      ghi_chu: req.body.ghi_chu
    }
  })
  
  // 4. Create notification (optional)
  await NotificationService.create({
    nguoi_nhan_id: registration.sinh_vien.nguoi_dung_id,
    tieu_de: 'Đăng ký được duyệt',
    noi_dung: `Đăng ký hoạt động "${registration.hoat_dong.ten_hd}" đã được phê duyệt`
  })
  
  return updated
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "reg-uuid-1",
    "trang_thai_dk": "da_duyet",
    "ngay_duyet": "2025-11-11T02:15:00Z"
  },
  "message": "Đã duyệt đăng ký thành công"
}
```

### 4.3. GIANG_VIEN - Get Pending Registrations

**Endpoint:**
```
GET /api/teacher/registrations/pending?limit=1000
Headers: Authorization: Bearer {token}
```

**Permissions Required:**
- `registrations.view`

**Backend Flow:**
```javascript
// Route
teacherRouter.get('/registrations/pending', auth, async (req, res) => {
  const registrations = await TeacherService.getPendingRegistrations(user, { limit: 1000 })
})
  ↓
// Service
async getPendingRegistrations(user) {
  // 1. Get teacher's homeroom classes
  const scope = await buildScope('registrations', user)
  
  // 2. Query pending registrations
  return await registrationsService.list(user, {
    status: 'PENDING'
  }, pagination)
}
  ↓
// Scope Builder builds:
{
  sinh_vien: {
    lop_id: { in: [class1_id, class2_id, ...] }  // Teacher's classes
  },
  trang_thai_dk: 'cho_duyet'
}
```

### 4.4. GIANG_VIEN - Approve Registration

**Same as LOP_TRUONG** nhưng có thể duyệt nhiều lớp:

```
POST /api/teacher/registrations/:id/approve
Headers: Authorization: Bearer {token}
```

---

## 5. Phê Duyệt Hoạt Động

### 5.1. GIANG_VIEN - Get Pending Activities

**Endpoint:**
```
GET /api/teacher/activities/pending?semester=hoc_ky_1-2025
Headers: Authorization: Bearer {token}
```

**Permissions Required:**
- `activities.approve`

**Backend Flow:**
```javascript
// Route
teacherRouter.get('/activities/pending', auth, async (req, res) => {
  const activities = await TeacherService.getPendingActivities(user, filters)
})
  ↓
// Service
async getPendingActivities(user, filters) {
  // 1. Get teacher's classes
  const classes = await prisma.lop.findMany({
    where: { chu_nhiem: user.sub }
  })
  
  // 2. Get students in those classes
  const students = await prisma.sinhVien.findMany({
    where: { lop_id: { in: classes.map(c => c.id) } }
  })
  
  // 3. Query pending activities created by students
  const activities = await prisma.hoatDong.findMany({
    where: {
      nguoi_tao_id: { in: students.map(s => s.nguoi_dung_id) },
      trang_thai: 'cho_duyet',
      hoc_ky: filters.hoc_ky,
      nam_hoc: filters.nam_hoc
    },
    include: {
      loai_hd: true,
      nguoi_tao: {
        include: { sinh_vien: { include: { lop: true } } }
      }
    },
    orderBy: { ngay_tao: 'desc' }  // Mới tạo trước
  })
  
  return activities
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "activity-uuid-1",
        "ten_hd": "Hoat dong 1",
        "mo_ta": "Mô tả hoạt động",
        "diem_rl": 5,
        "trang_thai": "cho_duyet",
        "ngay_tao": "2025-11-10T10:00:00Z",
        "loai_hd": {
          "ten_loai_hd": "Tham gia khoa"
        },
        "nguoi_tao": {
          "ho_ten": "Nguyen Van A",
          "sinh_vien": {
            "mssv": "202101002",
            "lop": {
              "ten_lop": "ATTT01-2021"
            }
          }
        }
      }
    ],
    "total": 5
  }
}
```

### 5.2. GIANG_VIEN - Approve Activity

**Endpoint:**
```
POST /api/teacher/activities/:id/approve
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "ghi_chu": "Hoạt động phù hợp"  // Optional
}
```

**Backend Flow:**
```javascript
// Route
teacherRouter.post('/activities/:id/approve', auth, async (req, res) => {
  const result = await TeacherService.approveActivity(id, user)
})
  ↓
// Service
async approveActivity(activityId, user) {
  // 1. Get activity
  const activity = await prisma.hoatDong.findUnique({
    where: { id: activityId },
    include: { nguoi_tao: { include: { sinh_vien: true } } }
  })
  
  // 2. Check permission (must be homeroom teacher)
  const hasAccess = await teachersRepo.hasAccessToClass(
    user.sub, 
    activity.nguoi_tao.sinh_vien.lop_id
  )
  if (!hasAccess) {
    throw new ForbiddenError('Không có quyền duyệt hoạt động này')
  }
  
  // 3. Update status
  const updated = await prisma.hoatDong.update({
    where: { id: activityId },
    data: {
      trang_thai: 'da_duyet',
      ngay_cap_nhat: new Date()  // ✅ Triggers re-sort
    }
  })
  
  // 4. Create notification
  await NotificationService.create({
    nguoi_nhan_id: activity.nguoi_tao_id,
    tieu_de: 'Hoạt động được duyệt',
    noi_dung: `Hoạt động "${activity.ten_hd}" đã được phê duyệt`
  })
  
  return updated
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "activity-uuid-1",
    "trang_thai": "da_duyet",
    "ngay_cap_nhat": "2025-11-11T03:00:00Z"
  },
  "message": "Đã duyệt hoạt động thành công"
}
```

### 5.3. GIANG_VIEN - Reject Activity

**Endpoint:**
```
POST /api/teacher/activities/:id/reject
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "ly_do_tu_choi": "Nội dung chưa phù hợp"  // Required
}
```

**Backend Flow:** Tương tự approve nhưng set `trang_thai: 'tu_choi'`

---

## 6. Quét QR Code

### 6.1. Get QR Data for Activity

**Endpoint:**
```
GET /api/activities/:id/qr-data
Headers: Authorization: Bearer {token}
```

**Permissions Required:**
- `activities.view` (để xem thông tin)
- Role: LOP_TRUONG hoặc GIANG_VIEN (người tạo hoạt động)

**Backend Flow:**
```javascript
// Route: /routes/v1-compat.route.js
activitiesRouter.get('/:id/qr-data', auth, async (req, res) => {
  const { id } = req.params
  const user = req.user
  
  // 1. Get activity
  const activity = await prisma.hoatDong.findUnique({
    where: { id },
    include: { loai_hd: true, nguoi_tao: true }
  })
  
  if (!activity) {
    return res.status(404).json({ message: 'Hoạt động không tồn tại' })
  }
  
  // 2. Check authorization
  const canAccess = await canAccessItem('activities', id, user)
  if (!canAccess) {
    return res.status(403).json({ 
      message: 'Bạn không có quyền xem QR code hoạt động này' 
    })
  }
  
  // 3. Generate or get QR code
  let qrCode = activity.qr
  if (!qrCode) {
    const qrData = {
      activityId: activity.id,
      activityName: activity.ten_hd,
      timestamp: Date.now()
    }
    qrCode = await QRCode.toDataURL(JSON.stringify(qrData))
    
    // Save to DB
    await prisma.hoatDong.update({
      where: { id },
      data: { qr: qrCode }
    })
  }
  
  // 4. Return QR data
  return res.json({
    success: true,
    data: {
      qr: qrCode,
      activity: {
        id: activity.id,
        ten_hd: activity.ten_hd,
        diem_rl: activity.diem_rl,
        ngay_bd: activity.ngay_bd,
        ngay_kt: activity.ngay_kt,
        loai_hd: activity.loai_hd
      }
    }
  })
})
```

**Response:**
```json
{
  "success": true,
  "data": {
    "qr": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "activity": {
      "id": "activity-uuid-1",
      "ten_hd": "Hoat dong 1",
      "diem_rl": 5,
      "ngay_bd": "2025-11-15T07:00:00Z",
      "ngay_kt": "2025-11-15T17:00:00Z"
    }
  }
}
```

### 6.2. Scan QR Code - Mark Attendance

**Endpoint:**
```
POST /api/activities/attendance/scan
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "qrData": "{\"activityId\":\"activity-uuid-1\",\"timestamp\":1699660800000}",
  "latitude": 10.850769,   // Optional GPS
  "longitude": 106.771881  // Optional GPS
}
```

**Permissions Required:**
- `attendance.mark`

**Backend Flow:**
```javascript
// Route: /routes/v1-compat.route.js
activitiesRouter.post('/attendance/scan', auth, async (req, res) => {
  const { qrData, latitude, longitude } = req.body
  const userId = req.user.sub
  
  // 1. Parse QR data
  let parsedData
  try {
    parsedData = JSON.parse(qrData)
  } catch (e) {
    return res.status(400).json({ message: 'QR code không hợp lệ' })
  }
  
  const activityId = parsedData.activityId
  
  // 2. Get activity
  const activity = await prisma.hoatDong.findUnique({
    where: { id: activityId }
  })
  
  if (!activity) {
    return res.status(404).json({ message: 'Hoạt động không tồn tại' })
  }
  
  // 3. Check if activity is ongoing
  const now = new Date()
  if (now < activity.ngay_bd || now > activity.ngay_kt) {
    return res.status(400).json({ 
      message: 'Hoạt động chưa diễn ra hoặc đã kết thúc' 
    })
  }
  
  // 4. Get student ID
  const student = await prisma.sinhVien.findUnique({
    where: { nguoi_dung_id: userId }
  })
  
  if (!student) {
    return res.status(404).json({ message: 'Không tìm thấy thông tin sinh viên' })
  }
  
  // 5. Check if student is registered
  const registration = await prisma.dangKyHoatDong.findFirst({
    where: {
      sv_id: student.id,
      hd_id: activityId,
      trang_thai_dk: 'da_duyet'
    }
  })
  
  if (!registration) {
    return res.status(400).json({ 
      message: 'Bạn chưa đăng ký hoặc chưa được duyệt tham gia hoạt động này' 
    })
  }
  
  // 6. Check if already marked attendance
  const existing = await prisma.diemDanh.findFirst({
    where: {
      sv_id: student.id,
      hd_id: activityId
    }
  })
  
  if (existing) {
    return res.status(400).json({ 
      message: 'Bạn đã điểm danh cho hoạt động này rồi',
      data: {
        tg_diem_danh: existing.tg_diem_danh
      }
    })
  }
  
  // 7. Create attendance record
  const attendance = await prisma.diemDanh.create({
    data: {
      sv_id: student.id,
      hd_id: activityId,
      nguoi_diem_danh_id: userId,  // Self check-in
      tg_diem_danh: new Date(),
      phuong_thuc: 'qr',
      trang_thai_tham_gia: 'co_mat',
      vi_tri_gps: (latitude && longitude) 
        ? `${latitude},${longitude}` 
        : null,
      xac_nhan_tham_gia: true
    }
  })
  
  // 8. Update registration status
  await prisma.dangKyHoatDong.update({
    where: { id: registration.id },
    data: { trang_thai_dk: 'da_tham_gia' }
  })
  
  // 9. Return success
  return res.json({
    success: true,
    data: {
      attendance,
      activity: {
        ten_hd: activity.ten_hd,
        diem_rl: activity.diem_rl
      }
    },
    message: 'Điểm danh thành công!'
  })
})
```

**Response Success:**
```json
{
  "success": true,
  "data": {
    "attendance": {
      "id": "attendance-uuid-1",
      "tg_diem_danh": "2025-11-15T08:30:00Z",
      "phuong_thuc": "qr",
      "trang_thai_tham_gia": "co_mat"
    },
    "activity": {
      "ten_hd": "Hoat dong 1",
      "diem_rl": 5
    }
  },
  "message": "Điểm danh thành công!"
}
```

**Response Errors:**
```json
// QR code hết hạn
{
  "success": false,
  "message": "QR code đã hết hạn"
}

// Chưa đăng ký
{
  "success": false,
  "message": "Bạn chưa đăng ký hoặc chưa được duyệt tham gia hoạt động này"
}

// Đã điểm danh rồi
{
  "success": false,
  "message": "Bạn đã điểm danh cho hoạt động này rồi",
  "data": {
    "tg_diem_danh": "2025-11-15T08:25:00Z"
  }
}
```

---

## 📊 Flow Diagrams

### Login → Dashboard Flow

```
┌─────────────┐
│   LOGIN     │
│ POST /auth/ │
│   login     │
└──────┬──────┘
       │ Returns JWT token
       ↓
┌─────────────┐
│   PROFILE   │
│ GET /core/    │
│  profile    │
└──────┬──────┘
       │ Returns user info + role
       ↓
┌─────────────────────────────┐
│   Role-based Navigation     │
├─────────────────────────────┤
│ SINH_VIEN → My Activities   │
│ LOP_TRUONG → Approve Regs   │
│ GIANG_VIEN → Approve Acts   │
│ ADMIN → Dashboard           │
└─────────────────────────────┘
```

### Activity Registration Flow (SINH_VIEN)

```
┌──────────────────┐
│ GET /activities  │ ← Browse activities
└────────┬─────────┘
         │
         ↓
┌──────────────────────────┐
│ POST /activities/:id/    │ ← Register
│       register           │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────┐
│ Status: cho_duyet        │ ← Waiting for approval
└────────┬─────────────────┘
         │
         ↓ (LOP_TRUONG approves)
         │
┌──────────────────────────┐
│ Status: da_duyet         │ ← Approved
└────────┬─────────────────┘
         │
         ↓ (During activity time)
         │
┌──────────────────────────┐
│ POST /attendance/scan    │ ← Scan QR
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────┐
│ Status: da_tham_gia      │ ← Attended
│ Points: +5               │
└──────────────────────────┘
```

---

## 🔐 Permission Matrix

| Chức năng | SINH_VIEN | LOP_TRUONG | GIANG_VIEN | ADMIN |
|-----------|-----------|------------|------------|-------|
| **Hoạt động của tôi** | ✅ | ✅ | ✅ | ✅ |
| **Danh sách hoạt động** | ✅ (lớp mình) | ✅ (lớp mình) | ✅ (các lớp chủ nhiệm) | ✅ (tất cả) |
| **Tạo hoạt động** | ❌ | ✅ | ✅ | ✅ |
| **Sửa hoạt động** | ❌ | ✅ (của mình) | ✅ | ✅ |
| **Phê duyệt đăng ký** | ❌ | ✅ (lớp mình) | ✅ (các lớp chủ nhiệm) | ✅ |
| **Phê duyệt hoạt động** | ❌ | ❌ | ✅ (các lớp chủ nhiệm) | ✅ |
| **Đăng ký hoạt động** | ✅ | ✅ | ❌ | ❌ |
| **Quét QR điểm danh** | ✅ | ✅ | ❌ | ❌ |
| **Xem QR code** | ❌ | ✅ (hoạt động của lớp) | ✅ | ✅ |

---

## 🗂️ File Structure

```
backend/src/
├── routes/
│   ├── auth.route.js              # POST /auth/login
│   ├── v1-compat.route.js         # Main API routes
│   │   ├── GET /activities
│   │   ├── POST /activities/:id/register
│   │   ├── GET /activities/:id/qr-data
│   │   └── POST /attendance/scan
│   └── admin.route.js
│
├── modules/
│   ├── activities/
│   │   ├── activities.service.js   # list(), create(), update()
│   │   └── activities.repo.js      # findMany(), findById()
│   │
│   ├── registrations/
│   │   ├── registrations.service.js # register(), approve()
│   │   └── registrations.repo.js
│   │
│   ├── monitor/
│   │   └── monitor.service.js      # getPendingRegistrations()
│   │
│   └── teachers/
│       └── teachers.service.js     # getPendingActivities()
│
├── middlewares/
│   ├── auth.js                     # JWT validation
│   ├── rbac.js                     # Permission check
│   └── isClassMonitor.js
│
└── shared/
    └── scopes/
        └── scopeBuilder.js         # buildScope(), canAccessItem()
```

---

## 🧪 Testing Checklist

### ✅ Login & Auth
- [ ] Login với 4 roles khác nhau
- [ ] JWT token được lưu và gửi trong header
- [ ] Profile load đúng thông tin

### ✅ Hoạt động của tôi
- [ ] SINH_VIEN: Xem đăng ký của mình
- [ ] LOP_TRUONG: Xem đăng ký + hoạt động lớp
- [ ] GIANG_VIEN: Xem theo các lớp chủ nhiệm
- [ ] Sorting: Mới nhất lên đầu ✅

### ✅ Danh sách hoạt động
- [ ] SINH_VIEN: Chỉ thấy hoạt động lớp mình
- [ ] LOP_TRUONG: Thấy hoạt động lớp + có thêm actions
- [ ] GIANG_VIEN: Thấy hoạt động các lớp chủ nhiệm
- [ ] ADMIN: Thấy tất cả
- [ ] Sorting: Cập nhật gần đây nhất lên đầu ✅

### ✅ Phê duyệt đăng ký
- [ ] LOP_TRUONG: Duyệt đăng ký của lớp mình
- [ ] GIANG_VIEN: Duyệt đăng ký của các lớp chủ nhiệm
- [ ] Không duyệt được đăng ký của lớp khác
- [ ] Sorting: Đăng ký mới nhất lên đầu ✅
- [ ] Notification được tạo sau khi duyệt

### ✅ Phê duyệt hoạt động
- [ ] GIANG_VIEN: Duyệt hoạt động của sinh viên trong lớp chủ nhiệm
- [ ] ADMIN: Duyệt tất cả hoạt động
- [ ] Notification được tạo sau khi duyệt

### ✅ Quét QR
- [ ] Xem QR code: Chỉ người tạo hoặc LOP_TRUONG/GIANG_VIEN
- [ ] Quét QR: Chỉ sinh viên đã đăng ký + được duyệt
- [ ] Không quét được nếu chưa đến giờ
- [ ] Không quét được 2 lần
- [ ] Status chuyển thành `da_tham_gia` sau khi quét

---

**End of Documentation** 🎉
