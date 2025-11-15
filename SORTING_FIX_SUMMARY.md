# Fix Sắp Xếp Danh Sách - Mới Nhất Lên Đầu

## Tóm Tắt

Đã fix tất cả các danh sách để hiển thị các item mới nhất/được thao tác gần đây nhất lên đầu tiên.

## Các File Đã Sửa

### 1. `backend/src/modules/registrations/registrations.repo.js`

**Thay đổi:**
- `findMany()`: Default `orderBy` từ `{ createdAt: 'desc' }` → `{ ngay_dang_ky: 'desc' }`
- `findByUser()`: Default `orderBy` từ `{ createdAt: 'desc' }` → `{ ngay_dang_ky: 'desc' }`

**Lý do:**
- Field `createdAt` không tồn tại trong schema Prisma
- Field chính xác là `ngay_dang_ky` (ngày đăng ký)
- `DESC` = mới nhất trước

**Ảnh hưởng:**
- ✅ Danh sách đăng ký chờ duyệt (lớp trưởng)
- ✅ Danh sách đăng ký chờ duyệt (giảng viên)
- ✅ Lịch sử đăng ký của sinh viên

---

### 2. `backend/src/modules/activities/activities.repo.js`

**Thay đổi:**
- `findMany()`: Default `sort` từ `'ngay_bd'` (ngày bắt đầu) → `'ngay_cap_nhat'` (ngày cập nhật)
- Giữ nguyên `order = 'desc'`

**Lý do:**
- Sắp xếp theo `ngay_cap_nhat` = activity được thao tác gần đây nhất lên đầu
- Khi tạo/sửa/phê duyệt activity → `ngay_cap_nhat` thay đổi → lên đầu danh sách

**Ảnh hưởng:**
- ✅ Danh sách hoạt động (GET /api/activities)
- ✅ Hoạt động của tôi (sinh viên/lớp trưởng)
- ✅ Danh sách hoạt động chờ duyệt (giảng viên)
- ✅ Lịch sử hoạt động

---

### 3. `backend/src/modules/monitor/monitor.repo.js`

**Trạng thái:** ✅ Đã đúng từ trước

- `findClassRegistrations()`: Đã dùng `orderBy: { ngay_dang_ky: 'desc' }`
- Không cần sửa

---

## Kiểm Tra Sau Khi Fix

### Test Cases

1. **Lớp trưởng - Phê duyệt đăng ký:**
   ```
   - Vào trang phê duyệt đăng ký
   - Đăng ký mới nhất (vừa tạo) phải ở đầu danh sách
   ```

2. **Giảng viên - Phê duyệt hoạt động:**
   ```
   - Vào danh sách hoạt động chờ duyệt
   - Hoạt động mới tạo/sửa gần đây nhất phải ở đầu
   ```

3. **Sinh viên - Danh sách hoạt động:**
   ```
   - Vào trang danh sách hoạt động
   - Hoạt động được cập nhật gần đây nhất ở đầu
   ```

4. **Hoạt động của tôi:**
   ```
   - Vào "Hoạt động của tôi"
   - Đăng ký mới nhất ở đầu danh sách
   ```

---

## Schema Reference

### Bảng `dang_ky_hoat_dong` (DangKyHoatDong)

```prisma
model DangKyHoatDong {
  id            String          @id @default(uuid())
  sv_id         String
  hd_id         String
  ngay_dang_ky  DateTime        @default(now())  ← Sort field
  trang_thai_dk TrangThaiDangKy @default(cho_duyet)
  ly_do_dk      String?
  ly_do_tu_choi String?
  ngay_duyet    DateTime?
  ...
}
```

### Bảng `hoat_dong` (HoatDong)

```prisma
model HoatDong {
  id            String   @id @default(uuid())
  ...
  ngay_bd       DateTime               ← Start date
  ngay_kt       DateTime               ← End date
  ngay_tao      DateTime @default(now()) ← Created date
  ngay_cap_nhat DateTime @updatedAt     ← Updated date (auto) ← Sort field
  ...
}
```

---

## Deployment

1. **Restart backend:**
   ```bash
   docker restart dacn_backend_dev
   ```

2. **Hoặc dùng task:**
   - Dev Down
   - Dev Up

3. **Kiểm tra logs:**
   ```bash
   docker logs -f dacn_backend_dev
   ```

---

## Notes

- Không cần migration vì chỉ sửa code logic, không sửa schema
- Default sort có thể override bằng query params (nếu cần)
- Tất cả sorting đều `DESC` = mới nhất trước
