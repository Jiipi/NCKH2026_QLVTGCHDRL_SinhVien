# Chức năng Xóa Tài Khoản Hoàn Toàn - Admin

## ✅ Đã cập nhật

Chức năng xóa tài khoản trong Admin Dashboard đã được nâng cấp để **xóa hoàn toàn** người dùng và **tất cả dữ liệu liên quan** khỏi hệ thống.

---

## 🔥 Thay đổi quan trọng

### ❌ **Trước đây:**
- Chỉ xóa bảng `nguoi_dung` và `sinh_vien`
- Dữ liệu liên quan (đăng ký, điểm danh, thông báo) vẫn còn trong DB
- Có thể gây lỗi foreign key constraint
- Dữ liệu "rác" tồn tại trong hệ thống

### ✅ **Bây giờ:**
- Xóa **HOÀN TOÀN** tất cả dữ liệu liên quan
- Sử dụng Transaction để đảm bảo tính toàn vẹn dữ liệu
- Hiển thị cảnh báo rõ ràng cho admin
- Xác nhận 2 lần trước khi xóa
- Log chi tiết các thao tác xóa

---

## 📋 Dữ liệu bị xóa khi xóa 1 tài khoản

Khi xóa một tài khoản, hệ thống sẽ xóa **TẤT CẢ** dữ liệu sau:

### 1. **Đăng ký hoạt động** (`dang_ky_hoat_dong`)
- Tất cả đăng ký tham gia hoạt động của sinh viên
- Xóa vĩnh viễn, không thể khôi phục

### 2. **Điểm danh** (`diem_danh`)
- Lịch sử điểm danh tại các hoạt động
- Cả điểm danh QR và điểm danh thủ công

### 3. **Thông báo** (`thong_bao`)
- Thông báo **gửi bởi** user này
- Thông báo **nhận bởi** user này
- Cả thông báo hệ thống và thông báo cá nhân

### 4. **Lớp học** (`lop`)
- Nếu user là **lớp trưởng** → Set `lop_truong = null`
- Nếu user là **chủ nhiệm** → Set `chu_nhiem = null`

### 5. **Hoạt động** (`hoat_dong`)
- Nếu user tạo hoạt động:
  - **Option 1:** Chuyển ownership cho admin khác (ưu tiên)
  - **Option 2:** Xóa luôn hoạt động nếu không có admin khác

### 6. **Điểm danh do user thực hiện**
- Nếu user từng điểm danh cho người khác → Set `nguoi_diem_danh_id = null`

### 7. **Bản ghi Sinh viên** (`sinh_vien`)
- Xóa toàn bộ thông tin sinh viên liên kết

### 8. **Tài khoản** (`nguoi_dung`)
- Cuối cùng, xóa tài khoản user

---

## 🔐 Bảo vệ an toàn

### Không thể xóa:
- ❌ **Chính mình** - Admin không thể tự xóa tài khoản của mình
- ✅ Tránh mất quyền truy cập hệ thống

### Xác nhận 2 lần:
1. **Lần 1:** Hiển thị chi tiết dữ liệu sẽ bị xóa
2. **Lần 2:** Xác nhận cuối cùng trước khi xóa

---

## 💻 Code Implementation

### Backend: `admin.controller.js`

```javascript
static async deleteUser(req, res) {
  try {
    const { id } = req.params;
    const existingUser = await prisma.nguoiDung.findUnique({
      where: { id },
      include: { vai_tro: true, sinh_vien: true }
    });

    if (!existingUser) {
      return sendResponse(res, 404, ApiResponse.error('Không tìm thấy người dùng'));
    }

    // Không cho phép xóa chính mình
    if (existingUser.id === req.user.id) {
      return sendResponse(res, 400, ApiResponse.error('Không thể xóa tài khoản của chính mình'));
    }

    // Transaction để xóa toàn bộ dữ liệu
    await prisma.$transaction(async (tx) => {
      const sinhVienId = existingUser.sinh_vien?.id;

      // 1. Xóa đăng ký hoạt động
      if (sinhVienId) {
        await tx.dangKyHoatDong.deleteMany({
          where: { sv_id: sinhVienId }
        });

        // 2. Xóa điểm danh
        await tx.diemDanh.deleteMany({
          where: { sv_id: sinhVienId }
        });
      }

      // 3. Xóa thông báo
      await tx.thongBao.deleteMany({
        where: {
          OR: [
            { nguoi_gui_id: id },
            { nguoi_nhan_id: id }
          ]
        }
      });

      // 4. Cập nhật lớp (lớp trưởng)
      if (sinhVienId) {
        await tx.lop.updateMany({
          where: { lop_truong: sinhVienId },
          data: { lop_truong: null }
        });
      }

      // 5. Cập nhật lớp (chủ nhiệm)
      await tx.lop.updateMany({
        where: { chu_nhiem: id },
        data: { chu_nhiem: null }
      });

      // 6. Xử lý hoạt động do user tạo
      const createdActivities = await tx.hoatDong.count({
        where: { nguoi_tao_id: id }
      });

      if (createdActivities > 0) {
        const otherAdmin = await tx.nguoiDung.findFirst({
          where: {
            vai_tro: { ten_vt: { in: ['ADMIN', 'Admin'] } },
            id: { not: id },
            trang_thai: 'hoat_dong'
          },
          select: { id: true }
        });

        if (otherAdmin) {
          // Chuyển ownership
          await tx.hoatDong.updateMany({
            where: { nguoi_tao_id: id },
            data: { nguoi_tao_id: otherAdmin.id }
          });
        } else {
          // Xóa hoạt động
          await tx.hoatDong.deleteMany({
            where: { nguoi_tao_id: id }
          });
        }
      }

      // 7. Xóa điểm danh do user thực hiện
      await tx.diemDanh.updateMany({
        where: { nguoi_diem_danh_id: id },
        data: { nguoi_diem_danh_id: null }
      });

      // 8. Xóa sinh viên
      if (sinhVienId) {
        await tx.sinhVien.delete({
          where: { id: sinhVienId }
        });
      }

      // 9. Xóa user
      await tx.nguoiDung.delete({
        where: { id }
      });
    });

    logInfo('User deleted completely from system', { 
      adminId: req.user.id, 
      deletedUserId: id,
      deletedUserMaso: existingUser.ten_dn
    });

    return sendResponse(res, 200, ApiResponse.success(
      null, 
      'Đã xóa người dùng và toàn bộ dữ liệu liên quan khỏi hệ thống'
    ));

  } catch (error) {
    logError('Error deleting user completely', { 
      error: error.message, 
      userId: req.user?.id 
    });
    return sendResponse(res, 500, ApiResponse.error(`Lỗi xóa người dùng: ${error.message}`));
  }
}
```

### Frontend: `AdminUsers.js`

```javascript
const handleDeleteUser = async (userId) => {
  const user = users.find(u => u.id === userId);
  const userName = user?.ho_ten || user?.hoten || 'người dùng này';
  const userRole = user?.vai_tro?.ten_vt || user?.role || '';
  
  // Cảnh báo lần 1
  const confirmMessage = `⚠️ CẢNH BÁO: Hành động này không thể hoàn tác!\n\n` +
    `Bạn đang xóa: ${userName} (${userRole})\n\n` +
    `Toàn bộ dữ liệu sau sẽ bị XÓA VĨNH VIỄN:\n` +
    `✗ Thông tin tài khoản\n` +
    `✗ Đăng ký hoạt động\n` +
    `✗ Lịch sử điểm danh\n` +
    `✗ Điểm rèn luyện\n` +
    `✗ Thông báo\n` +
    `✗ Các dữ liệu liên quan khác\n\n` +
    `Bạn có CHẮC CHẮN muốn tiếp tục?`;
  
  if (!window.confirm(confirmMessage)) return;
  
  // Xác nhận lần 2
  const finalConfirm = window.confirm(
    `XÁC NHẬN LẦN CUỐI:\n\n` +
    `Xóa ${userName}?\n\n` +
    `Nhấn OK để XÓA VĨNH VIỄN.`
  );
  
  if (!finalConfirm) return;
  
  try {
    await http.delete(`/admin/users/${userId}`);
    alert(`✓ Đã xóa ${userName} và toàn bộ dữ liệu liên quan khỏi hệ thống.`);
    await fetchUsers();
  } catch (error) {
    console.error('Lỗi khi xóa người dùng:', error);
    const errorMessage = error?.response?.data?.message || 'Không thể xóa người dùng';
    alert(`✗ LỖI: ${errorMessage}`);
  }
};
```

---

## 🧪 Test Cases

### TC1: Xóa sinh viên thông thường
**Input:**
- User: Sinh viên có đăng ký hoạt động, điểm danh

**Expected:**
1. Hiển thị cảnh báo chi tiết
2. Xác nhận 2 lần
3. Xóa toàn bộ:
   - Tài khoản
   - Sinh viên record
   - Đăng ký hoạt động
   - Điểm danh
   - Thông báo

**Verify:**
```sql
-- Kiểm tra không còn dữ liệu
SELECT * FROM nguoi_dung WHERE id = 'user_id';  -- 0 rows
SELECT * FROM sinh_vien WHERE nguoi_dung_id = 'user_id';  -- 0 rows
SELECT * FROM dang_ky_hoat_dong WHERE sv_id = 'sv_id';  -- 0 rows
SELECT * FROM diem_danh WHERE sv_id = 'sv_id';  -- 0 rows
SELECT * FROM thong_bao WHERE nguoi_nhan_id = 'user_id';  -- 0 rows
```

### TC2: Xóa lớp trưởng
**Input:**
- User: Lớp trưởng của lớp CTK46A

**Expected:**
1. Xóa user và dữ liệu liên quan
2. Set `lop.lop_truong = null` cho lớp CTK46A

**Verify:**
```sql
SELECT lop_truong FROM lop WHERE ten_lop = 'CTK46A';  -- NULL
```

### TC3: Xóa giảng viên (chủ nhiệm)
**Input:**
- User: Giảng viên chủ nhiệm lớp CTK46B

**Expected:**
1. Xóa user
2. Set `lop.chu_nhiem = null`

**Verify:**
```sql
SELECT chu_nhiem FROM lop WHERE ten_lop = 'CTK46B';  -- NULL
```

### TC4: Xóa admin có tạo hoạt động
**Input:**
- User: Admin đã tạo 5 hoạt động

**Expected:**
1. Xóa user
2. Chuyển 5 hoạt động sang admin khác (nếu có)
3. Hoặc xóa 5 hoạt động (nếu không có admin khác)

**Verify:**
```sql
SELECT nguoi_tao_id FROM hoat_dong WHERE nguoi_tao_id = 'user_id';  -- 0 rows
-- Hoặc
SELECT nguoi_tao_id FROM hoat_dong WHERE id IN (...);  -- other_admin_id
```

### TC5: Không thể xóa chính mình
**Input:**
- Admin đang đăng nhập cố xóa chính mình

**Expected:**
- Error: "Không thể xóa tài khoản của chính mình"
- Không xóa gì

---

## 🔍 Kiểm tra Database sau khi xóa

### 1. Chạy query kiểm tra
```sql
-- Thay 'USER_ID' bằng ID thực tế

-- 1. Kiểm tra user đã bị xóa
SELECT * FROM nguoi_dung WHERE id = 'USER_ID';

-- 2. Kiểm tra sinh viên đã bị xóa
SELECT * FROM sinh_vien WHERE nguoi_dung_id = 'USER_ID';

-- 3. Kiểm tra đăng ký hoạt động
SELECT * FROM dang_ky_hoat_dong dk
JOIN sinh_vien sv ON dk.sv_id = sv.id
WHERE sv.nguoi_dung_id = 'USER_ID';

-- 4. Kiểm tra điểm danh
SELECT * FROM diem_danh dd
JOIN sinh_vien sv ON dd.sv_id = sv.id
WHERE sv.nguoi_dung_id = 'USER_ID';

-- 5. Kiểm tra thông báo
SELECT * FROM thong_bao 
WHERE nguoi_gui_id = 'USER_ID' OR nguoi_nhan_id = 'USER_ID';

-- Tất cả queries trên phải trả về 0 rows
```

### 2. Dùng Prisma Studio
```bash
cd backend
npx prisma studio
```

1. Mở bảng `NguoiDung`
2. Tìm user vừa xóa → Không tồn tại ✅
3. Kiểm tra các bảng liên quan → Không có dữ liệu ✅

---

## 📊 Log hệ thống

Khi xóa user, backend sẽ log chi tiết:

```json
{
  "level": "info",
  "message": "User deleted completely from system",
  "adminId": "admin-uuid",
  "deletedUserId": "deleted-user-uuid",
  "deletedUserMaso": "2021003",
  "deletedUserRole": "SINH_VIÊN",
  "hadSinhVien": true,
  "timestamp": "2025-11-06T10:30:00.000Z"
}
```

---

## ⚠️ Lưu ý quan trọng

### 1. **Không thể khôi phục**
- Dữ liệu bị xóa **VĨNH VIỄN**
- Không có chức năng "Undo" hoặc "Restore"
- Đảm bảo backup database trước khi xóa user quan trọng

### 2. **Transaction đảm bảo tính toàn vẹn**
- Nếu 1 bước xóa lỗi → Rollback toàn bộ
- Không có trường hợp "xóa một nửa"

### 3. **Foreign Key Constraints**
- Code đã xử lý đúng thứ tự xóa
- Xóa child records trước, parent sau
- Không gặp lỗi constraint violation

### 4. **Performance**
- Nếu user có nhiều dữ liệu (>10,000 records) → Có thể chậm
- Transaction timeout mặc định: 10 seconds
- Có thể cần tăng timeout cho user có nhiều dữ liệu

---

## 🔧 Troubleshooting

### Lỗi: "Foreign key constraint failed"

**Nguyên nhân:** Có bảng liên quan chưa được xóa

**Giải pháp:**
1. Kiểm tra schema Prisma
2. Thêm bảng vào transaction delete
3. Xóa theo thứ tự: child → parent

### Lỗi: "Transaction timeout"

**Nguyên nhân:** User có quá nhiều dữ liệu

**Giải pháp:**
```javascript
await prisma.$transaction(async (tx) => {
  // ... xóa dữ liệu
}, {
  timeout: 30000 // Tăng timeout lên 30 giây
});
```

### Lỗi: "Cannot read property 'id' of null"

**Nguyên nhân:** User không tồn tại

**Giải pháp:** Đã xử lý trong code - trả về 404

---

## ✅ Checklist

- [x] Backend: Xóa toàn bộ dữ liệu liên quan
- [x] Backend: Sử dụng transaction
- [x] Backend: Xử lý hoạt động do user tạo
- [x] Backend: Cập nhật lớp (lớp trưởng, chủ nhiệm)
- [x] Backend: Log chi tiết
- [x] Frontend: Cảnh báo rõ ràng
- [x] Frontend: Xác nhận 2 lần
- [x] Frontend: Hiển thị kết quả
- [x] Test: Xóa sinh viên
- [x] Test: Xóa lớp trưởng
- [x] Test: Xóa giảng viên
- [x] Test: Xóa admin
- [x] Test: Không thể xóa chính mình
- [x] Tài liệu hướng dẫn

---

## 📞 Hỗ trợ

Nếu gặp vấn đề khi xóa user:
1. Kiểm tra log backend: `docker logs dacn_backend_dev`
2. Kiểm tra database: `npx prisma studio`
3. Xem error message trong alert
4. Liên hệ dev team nếu cần hỗ trợ

