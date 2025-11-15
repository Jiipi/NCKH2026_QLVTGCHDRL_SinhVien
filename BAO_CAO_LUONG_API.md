# BÁO CÁO LUỒNG API HỆ THỐNG QUẢN LÝ HOẠT ĐỘNG RÈN LUYỆN

## I. TỔNG QUAN HỆ THỐNG

### 1. Kiến trúc
- **Backend:** Node.js + Express + Prisma ORM
- **Database:** PostgreSQL với schema tiếng Việt
- **Authentication:** JWT Token (Bearer)
- **Authorization:** RBAC (Role-Based Access Control) động từ database

### 2. Các vai trò (Roles)
1. **SINH_VIEN** - Sinh viên
2. **LOP_TRUONG** - Lớp trưởng
3. **GIANG_VIEN** - Giảng viên
4. **ADMIN** - Quản trị viên

---

## II. LUỒNG AUTHENTICATION

### 1. Đăng nhập
**Endpoint:** `POST /api/auth/login`

**Input:**
```json
{
  "ten_dn": "202101001",
  "mat_khau": "password123"
}
```

**Output:** JWT Token chứa `user_id`, `role`, `expiry`

### 2. Xác thực các request tiếp theo
- Mỗi request gửi kèm header: `Authorization: Bearer {token}`
- Middleware `auth` giải mã token → lấy `user.id` và `user.role`
- Middleware `requirePermission` kiểm tra quyền theo role

### 3. Cơ chế phân quyền
```
Database (vai_tro.quyen_han) → Cache (30s) → Permission Check
```
- Quyền được lưu trong DB dạng mảng: `["profile.read", "activities.view", ...]`
- Admin có thể bật/tắt quyền cho từng role
- Thay đổi có hiệu lực ngay lập tức (cache bị xóa)

---

## III. CÁC CHỨC NĂNG CHÍNH

### 1. HOẠT ĐỘNG CỦA TÔI

#### A. Sinh viên
**Endpoint:** `GET /api/student/my-activities?semester=hoc_ky_1-2025`

**Luồng xử lý:**
1. Xác thực JWT token
2. Lấy ID sinh viên từ `user_id`
3. Query đăng ký của sinh viên trong học kỳ
4. Trả về danh sách kèm trạng thái: `cho_duyet`, `da_duyet`, `da_tham_gia`
5. **Sắp xếp:** Đăng ký mới nhất lên đầu (`ngay_dang_ky DESC`)

**Kết quả:** Danh sách hoạt động đã đăng ký + điểm rèn luyện tích lũy

#### B. Lớp trưởng
**Endpoint:** `GET /api/class/activities?semester=hoc_ky_1-2025`

**Khác biệt:**
- Thêm middleware `isClassMonitor` kiểm tra quyền lớp trưởng
- Xem được hoạt động của cả lớp, không chỉ của mình
- Có thể thực hiện thao tác: phê duyệt đăng ký, xem QR code

#### C. Giảng viên & Admin
- Giảng viên: Xem hoạt động của các lớp chủ nhiệm
- Admin: Xem tất cả hoạt động trong hệ thống

---

### 2. DANH SÁCH HOẠT ĐỘNG

**Endpoint:** `GET /api/activities?semester=hoc_ky_1-2025&page=1&limit=20`

**Luồng xử lý chung:**
```
Auth → Permission Check → Scope Filter → Query DB → Enrich Data → Return
```

#### A. Scope Filtering (Lọc theo role)

**SINH_VIEN:**
```
1. Lấy lớp của sinh viên
2. Lấy danh sách tất cả sinh viên trong lớp
3. Chỉ hiển thị hoạt động do sinh viên trong lớp tạo
```

**LOP_TRUONG:**
```
1. Lấy lớp của lớp trưởng
2. Lấy tất cả sinh viên trong lớp + giáo viên chủ nhiệm
3. Hiển thị hoạt động do họ tạo HOẶC có đăng ký từ lớp
```

**GIANG_VIEN:**
```
1. Lấy các lớp mà giảng viên là chủ nhiệm
2. Lấy sinh viên của các lớp đó
3. Hiển thị hoạt động của sinh viên các lớp chủ nhiệm
```

**ADMIN:**
```
Không có filter → Xem tất cả hoạt động
```

#### B. Data Enrichment (Bổ sung dữ liệu)

Với SINH_VIEN và LOP_TRUONG, mỗi hoạt động được bổ sung:
- `registration_status`: Trạng thái đăng ký của người dùng
- `can_register`: Có thể đăng ký không?
- `can_cancel`: Có thể hủy không?
- Số lượng người đã đăng ký

#### C. Sắp xếp
**Mặc định:** `ngay_cap_nhat DESC` (Hoạt động vừa tạo/sửa gần đây nhất lên đầu)

**Lý do:** Khi ai đó tạo hoặc giảng viên phê duyệt hoạt động → `ngay_cap_nhat` thay đổi → hoạt động lên đầu danh sách

---

### 3. PHÊ DUYỆT ĐĂNG KÝ

#### A. Lớp trưởng phê duyệt

**Xem danh sách chờ duyệt:**
```
GET /api/class/registrations?status=cho_duyet
```

**Luồng:**
1. Middleware `isClassMonitor` kiểm tra user là lớp trưởng
2. Lấy ID lớp của lớp trưởng
3. Query đăng ký `cho_duyet` của sinh viên trong lớp
4. **Sắp xếp:** `ngay_dang_ky DESC` (Đăng ký mới nhất trước)

**Phê duyệt:**
```
POST /api/class/registrations/:id/approve
```

**Luồng:**
1. Kiểm tra quyền: Chỉ duyệt được đăng ký của lớp mình
2. Update trạng thái: `cho_duyet` → `da_duyet`
3. Lưu `ngay_duyet` và `ghi_chu`
4. Tạo thông báo cho sinh viên

#### B. Giảng viên phê duyệt

**Endpoint:** `GET /api/teacher/registrations/pending`

**Khác biệt:**
- Có thể duyệt đăng ký của nhiều lớp (các lớp chủ nhiệm)
- Có thêm chức năng duyệt hàng loạt: `POST /api/teacher/registrations/bulk-approve`

---

### 4. PHÊ DUYỆT HOẠT ĐỘNG

**Chỉ dành cho:** GIANG_VIEN và ADMIN

#### A. Xem danh sách chờ duyệt
```
GET /api/teacher/activities/pending?semester=hoc_ky_1-2025
```

**Luồng:**
1. Lấy các lớp mà giảng viên là chủ nhiệm
2. Lấy sinh viên của các lớp đó
3. Query hoạt động `trang_thai = 'cho_duyet'` do sinh viên tạo
4. **Sắp xếp:** `ngay_tao DESC` (Mới tạo lên đầu)

#### B. Phê duyệt
```
POST /api/teacher/activities/:id/approve
```

**Luồng:**
1. Kiểm tra quyền: Giảng viên phải là chủ nhiệm lớp của sinh viên tạo hoạt động
2. Update: `cho_duyet` → `da_duyet`
3. Update `ngay_cap_nhat` (trigger re-sort trong danh sách)
4. Tạo thông báo cho sinh viên

#### C. Từ chối
```
POST /api/teacher/activities/:id/reject
Body: { "ly_do_tu_choi": "Nội dung chưa phù hợp" }
```

**Luồng:** Tương tự approve nhưng set `trang_thai = 'tu_choi'` + lưu lý do

---

### 5. QUÉT QR CODE

#### A. Tạo/Xem QR code
```
GET /api/activities/:id/qr-data
```

**Quyền:** Người tạo hoạt động HOẶC LOP_TRUONG/GIANG_VIEN của lớp

**Luồng:**
1. Kiểm tra quyền truy cập hoạt động
2. Nếu chưa có QR → Generate QR code chứa:
   ```json
   {
     "activityId": "uuid",
     "activityName": "Tên hoạt động",
     "timestamp": 1699660800
   }
   ```
3. Lưu QR vào DB (field `qr`)
4. Trả về QR dạng Base64

**Output:** QR code image (Base64) + thông tin hoạt động

#### B. Quét QR để điểm danh
```
POST /api/activities/attendance/scan
Body: {
  "qrData": "{\"activityId\":\"uuid\",\"timestamp\":...}",
  "latitude": 10.850769,
  "longitude": 106.771881
}
```

**Quyền:** Sinh viên đã đăng ký và được duyệt

**Luồng:**
1. Parse QR data → Lấy `activityId`
2. Kiểm tra hoạt động tồn tại
3. **Validate thời gian:** Phải trong khoảng `ngay_bd` → `ngay_kt`
4. Kiểm tra sinh viên đã đăng ký và được duyệt (`trang_thai_dk = 'da_duyet'`)
5. Kiểm tra chưa điểm danh trước đó (không cho quét 2 lần)
6. Tạo bản ghi điểm danh:
   ```
   - Thời gian: Hiện tại
   - Phương thức: QR
   - Trạng thái: Có mặt
   - GPS: Tọa độ (nếu có)
   ```
7. Update đăng ký: `da_duyet` → `da_tham_gia`

**Kết quả:** Sinh viên được cộng điểm rèn luyện

---

## IV. BẢO MẬT VÀ KIỂM SOÁT

### 1. Cơ chế bảo mật

#### A. Authentication (Xác thực)
- JWT Token với expiry time
- Token chứa: `user_id`, `role`, `issued_at`, `expires_at`
- Token được gửi qua header `Authorization: Bearer {token}`

#### B. Authorization (Phân quyền)
```
1. Static Permissions (Fallback) → Quyền mặc định
2. Dynamic Permissions (DB) → Quyền từ database
3. Scope-based Filtering → Lọc dữ liệu theo role
4. Item-level Access Control → Kiểm tra quyền từng item
```

### 2. Luồng kiểm tra quyền

```
Request → Auth Middleware → Permission Middleware → Scope Filter → Action
   ↓           ↓                    ↓                    ↓
 JWT       Decode token      Check DB perms       Filter data      Execute
```

**Ví dụ:** Sinh viên update hoạt động
```
1. Auth: Decode token → user_id, role=SINH_VIEN
2. Permission: Check "activities.update" trong DB
3. Scope: Chỉ update được hoạt động của chính mình
4. Item check: Kiểm tra nguoi_tao_id === user_id
5. Nếu pass → Cho phép update
```

### 3. Các điểm kiểm soát

| Mức độ | Mô tả | Ví dụ |
|--------|-------|-------|
| **Route** | Require role | `requireRole(['GIANG_VIEN', 'ADMIN'])` |
| **Permission** | Require quyền cụ thể | `requirePermission('activities.approve')` |
| **Scope** | Filter dữ liệu theo role | SINH_VIEN chỉ thấy hoạt động lớp mình |
| **Item** | Kiểm tra quyền từng item | Chỉ update được hoạt động của mình |

---

## V. TÍNH NĂNG NỔI BẬT

### 1. Dynamic RBAC (Role-Based Access Control)
- Quyền được lưu trong database
- Admin có thể bật/tắt quyền cho từng role
- Thay đổi có hiệu lực ngay lập tức (cache 30s)
- Không cần restart server

**Cách hoạt động:**
```
Admin tắt "activities.create" cho SINH_VIEN
  ↓
Cache bị xóa
  ↓
Request tiếp theo của SINH_VIEN
  ↓
Load permissions mới từ DB
  ↓
Không có "activities.create" → 403 Forbidden
```

### 2. Smart Sorting (Sắp xếp thông minh)
- **Hoạt động:** `ngay_cap_nhat DESC` → Vừa tạo/sửa lên đầu
- **Đăng ký:** `ngay_dang_ky DESC` → Đăng ký mới nhất lên đầu
- **Lý do:** Giúp theo dõi các thao tác gần đây nhất

### 3. Scope-based Data Filtering
- Mỗi role chỉ thấy dữ liệu liên quan
- SINH_VIEN: Hoạt động lớp mình
- LOP_TRUONG: Hoạt động lớp + quyền quản lý
- GIANG_VIEN: Các lớp chủ nhiệm
- ADMIN: Tất cả

### 4. Real-time Notifications
- Khi đăng ký được duyệt → Thông báo cho sinh viên
- Khi hoạt động được duyệt → Thông báo cho người tạo
- Tích hợp với hệ thống notification

### 5. QR Code Security
- QR chứa timestamp để kiểm tra thời gian
- Chỉ quét được trong thời gian hoạt động diễn ra
- Không cho phép quét 2 lần
- Hỗ trợ GPS tracking (optional)

---

## VI. LUỒNG DỮ LIỆU MẪU

### Kịch bản: Sinh viên đăng ký và tham gia hoạt động

```
1. LOGIN
   POST /api/auth/login
   → JWT Token: eyJhbGci...

2. XEM DANH SÁCH HOẠT ĐỘNG
   GET /api/activities?semester=hoc_ky_1-2025
   → 17 hoạt động (chỉ của lớp ATTT01-2021)

3. ĐĂNG KÝ HOẠT ĐỘNG
   POST /api/activities/69cfe281-.../register
   Body: { "ly_do_dk": "Muốn học hỏi" }
   → Status: cho_duyet

4. LỚP TRƯỞNG PHÊ DUYỆT
   POST /api/class/registrations/reg-uuid-1/approve
   → Status: da_duyet
   → Notification sent

5. NGÀY HOẠT ĐỘNG - QUÉT QR
   POST /api/activities/attendance/scan
   Body: { "qrData": "{\"activityId\":...}" }
   → Status: da_tham_gia
   → Điểm danh thành công
   → Cộng 5 điểm rèn luyện

6. XEM KẾT QUẢ
   GET /api/student/my-activities
   → Hoạt động hiển thị trạng thái: da_tham_gia
   → Tổng điểm: 35 điểm
```

---

## VII. MA TRẬN QUYỀN

| Chức năng | SINH_VIEN | LOP_TRUONG | GIANG_VIEN | ADMIN |
|-----------|:---------:|:----------:|:----------:|:-----:|
| Xem hoạt động của tôi | ✅ | ✅ | ✅ | ✅ |
| Xem danh sách hoạt động | ✅ (lớp) | ✅ (lớp) | ✅ (chủ nhiệm) | ✅ (tất cả) |
| Tạo hoạt động | ❌ | ✅ | ✅ | ✅ |
| Sửa hoạt động | ❌ | ✅ (của mình) | ✅ | ✅ |
| Xóa hoạt động | ❌ | ✅ (của mình) | ✅ | ✅ |
| Phê duyệt đăng ký | ❌ | ✅ (lớp) | ✅ (chủ nhiệm) | ✅ |
| Phê duyệt hoạt động | ❌ | ❌ | ✅ (chủ nhiệm) | ✅ |
| Đăng ký hoạt động | ✅ | ✅ | ❌ | ❌ |
| Quét QR điểm danh | ✅ | ✅ | ❌ | ❌ |
| Xem QR code | ❌ | ✅ (lớp) | ✅ | ✅ |
| Quản lý người dùng | ❌ | ❌ | ❌ | ✅ |
| Quản lý quyền | ❌ | ❌ | ❌ | ✅ |

---

## VIII. KẾT LUẬN

### Ưu điểm của hệ thống:

1. **Bảo mật đa lớp:** Authentication → Authorization → Scope → Item-level
2. **Phân quyền linh hoạt:** Admin có thể tùy chỉnh quyền không cần code
3. **Hiệu suất cao:** Cache permissions, query optimization
4. **Trải nghiệm tốt:** Sorting thông minh, notifications real-time
5. **Dễ bảo trì:** Code module hóa, tách biệt concerns

### Các điểm cần lưu ý:

1. JWT token cần được refresh định kỳ
2. Cache TTL 30s → Trade-off giữa performance và consistency
3. QR code cần rotate key định kỳ để bảo mật
4. Cần monitor permission changes để phát hiện misconfiguration

---

**Người trình bày:** [Tên của bạn]  
**Ngày:** 11/11/2025  
**Version:** 1.0
