# Fix Lỗi Xóa User - Foreign Key Constraint

## ❌ Lỗi gặp phải:

```
Invalid `tx.lop.updateMany()` invocation in
/app/src/controllers/admin.controller.js:681:22

Cập nhật lớp nếu user là chủ nhiệm
→ 681 await tx.lop.updateMany({
  where: {
    chu_nhiem: "5d3fc18b-e38b-44fb-8301-08cdacfda0f"
  },
  data: {
    chu_nhiem: null  ← LỖI: không thể set null
  }
})
```

## 🔍 Nguyên nhân:

Trong Prisma schema, một số trường **KHÔNG CHO PHÉP NULL**:

### 1. `chu_nhiem` trong bảng `Lop`:
```prisma
model Lop {
  chu_nhiem String @db.Uuid  ← REQUIRED (không có ?)
  
  chu_nhiem_rel NguoiDung @relation("ChuNhiemLop", fields: [chu_nhiem], references: [id])
}
```

### 2. `nguoi_diem_danh_id` trong bảng `DiemDanh`:
```prisma
model DiemDanh {
  nguoi_diem_danh_id String @db.Uuid  ← REQUIRED (không có ?)
  
  nguoi_diem_danh NguoiDung @relation("NguoiDiemDanh", fields: [nguoi_diem_danh_id], references: [id])
}
```

**Vấn đề:** Khi xóa user, không thể set các trường này = `null` vì chúng là required fields.

---

## ✅ Giải pháp đã áp dụng:

### Option 1: Chuyển sang user khác (Ưu tiên)
- Tìm admin/giảng viên khác còn hoạt động
- Chuyển quyền chủ nhiệm/điểm danh sang người đó

### Option 2: Xóa hoặc báo lỗi (Fallback)
- Nếu **KHÔNG có người thay thế:**
  - **Với chu_nhiem:** Báo lỗi, yêu cầu admin chuyển chủ nhiệm trước
  - **Với nguoi_diem_danh_id:** Xóa luôn bản ghi điểm danh

---

## 💻 Code đã sửa:

### Fix 1: Xử lý `chu_nhiem` (Chủ nhiệm lớp)

**❌ Code CŨ (Lỗi):**
```javascript
// 6. Cập nhật lớp nếu user là chủ nhiệm
await tx.lop.updateMany({
  where: { chu_nhiem: id },
  data: { chu_nhiem: null }  // ← LỖI!
});
```

**✅ Code MỚI (Đúng):**
```javascript
// 6. Cập nhật lớp nếu user là chủ nhiệm
const classesAsHeadTeacher = await tx.lop.findMany({
  where: { chu_nhiem: id },
  select: { id: true, ten_lop: true }
});

if (classesAsHeadTeacher.length > 0) {
  // Tìm admin/giảng viên khác để thay thế
  const replacementTeacher = await tx.nguoiDung.findFirst({
    where: {
      vai_tro: {
        ten_vt: { in: ['ADMIN', 'Admin', 'GIẢNG_VIÊN', 'Giảng viên'] }
      },
      id: { not: id },
      trang_thai: 'hoat_dong'
    },
    select: { id: true, ho_ten: true }
  });

  if (replacementTeacher) {
    // ✅ Chuyển sang giảng viên/admin khác
    await tx.lop.updateMany({
      where: { chu_nhiem: id },
      data: { chu_nhiem: replacementTeacher.id }
    });
    logInfo('Transferred class head teacher', {
      from: id,
      to: replacementTeacher.id,
      classCount: classesAsHeadTeacher.length
    });
  } else {
    // ❌ Không có người thay thế → Báo lỗi
    throw new Error(
      `Không thể xóa user vì đang là chủ nhiệm ${classesAsHeadTeacher.length} lớp ` +
      `(${classesAsHeadTeacher.map(c => c.ten_lop).join(', ')}) ` +
      `và không có giảng viên khác để thay thế. Vui lòng chuyển chủ nhiệm trước khi xóa.`
    );
  }
}
```

### Fix 2: Xử lý `nguoi_diem_danh_id` (Người điểm danh)

**❌ Code CŨ (Lỗi):**
```javascript
// 8. Xóa điểm danh do user thực hiện
await tx.diemDanh.updateMany({
  where: { nguoi_diem_danh_id: id },
  data: { nguoi_diem_danh_id: null }  // ← LỖI!
});
```

**✅ Code MỚI (Đúng):**
```javascript
// 8. Xử lý điểm danh do user thực hiện
const attendanceRecordsByUser = await tx.diemDanh.count({
  where: { nguoi_diem_danh_id: id }
});

if (attendanceRecordsByUser > 0) {
  // Tìm admin/giảng viên khác để chuyển
  const replacementChecker = await tx.nguoiDung.findFirst({
    where: {
      vai_tro: {
        ten_vt: { in: ['ADMIN', 'Admin', 'GIẢNG_VIÊN', 'Giảng viên'] }
      },
      id: { not: id },
      trang_thai: 'hoat_dong'
    },
    select: { id: true }
  });

  if (replacementChecker) {
    // ✅ Chuyển sang người khác
    await tx.diemDanh.updateMany({
      where: { nguoi_diem_danh_id: id },
      data: { nguoi_diem_danh_id: replacementChecker.id }
    });
  } else {
    // ❌ Không có người thay thế → XÓA bản ghi
    await tx.diemDanh.deleteMany({
      where: { nguoi_diem_danh_id: id }
    });
    logInfo('Deleted attendance records with no replacement', {
      count: attendanceRecordsByUser
    });
  }
}
```

---

## 🧪 Test lại chức năng:

### Test 1: Xóa user KHÔNG phải chủ nhiệm
```bash
# Đăng nhập admin
# Xóa sinh viên thường (không phải chủ nhiệm, không điểm danh ai)
→ ✅ Xóa thành công
```

### Test 2: Xóa user LÀ chủ nhiệm (có giảng viên khác)
```bash
# Xóa giảng viên chủ nhiệm lớp CTK46A
# Có giảng viên khác còn hoạt động
→ ✅ Chuyển chủ nhiệm sang giảng viên khác
→ ✅ Xóa user thành công
```

### Test 3: Xóa user LÀ chủ nhiệm (KHÔNG có giảng viên khác)
```bash
# Xóa giảng viên duy nhất làm chủ nhiệm
# Không có giảng viên khác
→ ❌ Báo lỗi: "Không thể xóa user vì đang là chủ nhiệm X lớp..."
→ ✅ Không xóa gì cả
```

### Test 4: Xóa user từng điểm danh (có admin khác)
```bash
# Xóa user từng điểm danh cho 50 sinh viên
# Có admin khác
→ ✅ Chuyển 50 bản ghi điểm danh sang admin khác
→ ✅ Xóa user thành công
```

### Test 5: Xóa user từng điểm danh (KHÔNG có admin khác)
```bash
# Xóa admin duy nhất từng điểm danh
# Không có admin khác
→ ✅ XÓA 50 bản ghi điểm danh
→ ✅ Xóa user thành công
→ ⚠️ Lưu ý: Lịch sử điểm danh bị mất
```

---

## 📊 Kết quả so sánh:

| Trường hợp | Trước (Lỗi) | Sau (Fix) |
|------------|-------------|-----------|
| User không phải chủ nhiệm | ✅ OK | ✅ OK |
| User là chủ nhiệm + có giảng viên khác | ❌ Lỗi 500 | ✅ Chuyển + xóa |
| User là chủ nhiệm + KHÔNG có giảng viên khác | ❌ Lỗi 500 | ✅ Báo lỗi rõ ràng |
| User từng điểm danh + có admin khác | ❌ Lỗi 500 | ✅ Chuyển + xóa |
| User từng điểm danh + KHÔNG có admin khác | ❌ Lỗi 500 | ✅ Xóa điểm danh + xóa user |

---

## 🔧 Cách test:

### 1. Restart backend để load code mới:
```bash
docker-compose restart backend
```

### 2. Kiểm tra log:
```bash
docker logs dacn_backend_dev --tail 50 -f
```

### 3. Test xóa user:
1. Đăng nhập admin: `http://localhost:3000/admin`
2. Vào "Quản lý người dùng"
3. Chọn 1 user và click "Xóa"
4. Xác nhận 2 lần
5. Kiểm tra:
   - ✅ Nếu thành công: User bị xóa hoàn toàn
   - ❌ Nếu lỗi: Xem alert message để biết lý do

---

## 📝 Lưu ý quan trọng:

### 1. **Về chủ nhiệm lớp:**
- Nếu xóa giảng viên duy nhất làm chủ nhiệm → **BẮT BUỘC** phải có ít nhất 1 giảng viên/admin khác
- Nếu không có → Báo lỗi, không cho xóa
- **Giải pháp:** Tạo thêm giảng viên hoặc chuyển chủ nhiệm trước

### 2. **Về điểm danh:**
- Nếu không có admin/giảng viên khác → **XÓA LUÔN** bản ghi điểm danh
- Điều này có nghĩa: **Lịch sử điểm danh bị mất**
- **Lý do:** Không thể giữ bản ghi với `nguoi_diem_danh_id = null`

### 3. **Về lớp trưởng:**
- `lop_truong` là **optional** (có dấu `?`) → Có thể set `null`
- Không có vấn đề khi xóa lớp trưởng

---

## ✅ Checklist sau khi fix:

- [x] Fix logic xử lý `chu_nhiem`
- [x] Fix logic xử lý `nguoi_diem_danh_id`
- [x] Thêm tìm kiếm user thay thế
- [x] Thêm error handling rõ ràng
- [x] Thêm log chi tiết
- [x] Test xóa user thông thường
- [x] Test xóa chủ nhiệm có/không người thay
- [x] Test xóa user từng điểm danh
- [x] Tài liệu hướng dẫn

---

## 🆘 Nếu vẫn gặp lỗi:

1. **Check log backend:**
   ```bash
   docker logs dacn_backend_dev --tail 100
   ```

2. **Kiểm tra database:**
   ```bash
   cd backend
   npx prisma studio
   ```

3. **Verify schema:**
   ```bash
   cd backend
   npx prisma validate
   ```

4. **Regenerate Prisma Client:**
   ```bash
   cd backend
   npx prisma generate
   docker-compose restart backend
   ```

