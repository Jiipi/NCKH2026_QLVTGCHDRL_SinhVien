# 📋 HƯỚNG DẪN MIGRATION: Thêm lop_id cho HoatDong

## 🎯 Mục tiêu
Thêm cột `lop_id` vào bảng `hoat_dong` để:
- Admin tab "Theo lớp" lọc đúng hoạt động của lớp
- Thống kê `tong_hoat_dong` khớp nhau giữa các role (Admin, GV, SV, Lớp trưởng)

---

## 📌 Tình trạng hiện tại

✅ **Đã hoàn thành:**
- Schema Prisma đã có `lop_id` trong model `HoatDong`
- Script backfill đã tạo: `backend/scripts/backfill-activity-class.js`

❌ **Chưa làm được:**
- `prisma migrate dev` không chạy được do drift giữa DB và migration history
- Không thể dùng `prisma migrate reset` vì sẽ mất dữ liệu

---

## 🔧 BƯỚC 1: Chạy SQL Migration thủ công

### Kết nối PostgreSQL
Sử dụng một trong các công cụ:
- **PgAdmin** (giao diện đồ họa)
- **DBeaver** (giao diện đồ họa)
- **psql** (command line)

### Thông tin kết nối
```
Host: localhost (hoặc server của bạn)
Port: 5432
Database: Web_QuanLyDiemRenLuyen
Schema: public
User: (user của bạn)
Password: (password của bạn)
```

### Chạy SQL sau:

```sql
-- Thêm cột lop_id (nullable UUID)
ALTER TABLE "hoat_dong"
ADD COLUMN IF NOT EXISTS "lop_id" uuid NULL;

-- Thêm foreign key constraint
ALTER TABLE "hoat_dong"
ADD CONSTRAINT "hoat_dong_lop_id_fkey"
FOREIGN KEY ("lop_id") REFERENCES "lop"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- Tạo index để tăng tốc query (khuyến nghị)
CREATE INDEX IF NOT EXISTS "hoat_dong_lop_id_idx" ON "hoat_dong"("lop_id");
```

### ⚠️ Lưu ý quan trọng:
- SQL này **KHÔNG XÓA** dữ liệu
- Chỉ thêm cột mới và foreign key
- Tất cả hoạt động hiện tại sẽ có `lop_id = NULL`

---

## 🔧 BƯỚC 2: Chạy script backfill lop_id

Sau khi chạy SQL ở bước 1, mở terminal:

```powershell
cd d:\DACN_Web_quanly_hoatdongrenluyen-master\backend
node scripts/backfill-activity-class.js
```

### Script sẽ làm gì?
1. Tìm tất cả `hoat_dong` có `lop_id IS NULL`
2. Với mỗi hoạt động, kiểm tra `nguoi_tao_id`:
   - **Nếu là Sinh viên** → Gán `lop_id = sinh_vien.lop_id`
   - **Nếu là GVCN** → Gán `lop_id = lop.id` (lớp mà user đó là chủ nhiệm)
   - **Không xác định** → Giữ `lop_id = null` (hoạt động toàn trường)

### Output mẫu:
```
=== Backfill lop_id cho hoat_dong ===
Tổng số hoạt động chưa có lop_id: 150
Đã gán lop_id cho 50 hoạt động...
Đã gán lop_id cho 100 hoạt động...
=== Hoàn tất backfill lop_id ===
Đã cập nhật      : 120
Không xác định lớp: 30
```

---

## ✅ BƯỚC 3: Kiểm tra kết quả

### 3.1 Kiểm tra trong PostgreSQL

```sql
-- Đếm hoạt động có lop_id
SELECT 
  COUNT(*) as total,
  COUNT(lop_id) as has_lop_id,
  COUNT(*) - COUNT(lop_id) as no_lop_id
FROM hoat_dong;

-- Xem phân bố theo lớp
SELECT 
  l.ma_lop,
  l.ten_lop,
  COUNT(h.id) as so_hoat_dong
FROM hoat_dong h
JOIN lop l ON h.lop_id = l.id
GROUP BY l.id, l.ma_lop, l.ten_lop
ORDER BY so_hoat_dong DESC
LIMIT 10;
```

### 3.2 Kiểm tra API

Sau khi migration xong, khởi động lại server và kiểm tra:

```powershell
# Khởi động backend
cd backend
npm run dev
```

Kiểm tra dashboard với các role:
- **Admin** → Tab "Theo lớp" → Chọn học kỳ + lớp
- **GVCN** → Dashboard thống kê lớp
- **Sinh viên** → Dashboard cá nhân
- **Lớp trưởng** → Dashboard lớp

So sánh `tong_hoat_dong` giữa các role phải khớp nhau!

---

## 🔄 Prisma Sync (Optional)

Sau khi migration thủ công thành công, sync Prisma với DB:

```powershell
cd backend
npx prisma db pull   # Kéo schema từ DB
npx prisma generate  # Generate Prisma Client
```

Hoặc đánh dấu migration đã áp dụng:

```powershell
npx prisma migrate resolve --applied "add_lop_id_to_hoat_dong"
```

---

## 🆘 Troubleshooting

### Lỗi: Column already exists
```sql
-- Kiểm tra cột đã tồn tại chưa
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'hoat_dong' AND column_name = 'lop_id';
```

### Lỗi: Foreign key đã tồn tại
```sql
-- Xóa constraint cũ nếu cần
ALTER TABLE "hoat_dong" DROP CONSTRAINT IF EXISTS "hoat_dong_lop_id_fkey";
```

### Lỗi: Script backfill không chạy
```powershell
# Kiểm tra kết nối database
cd backend
node -e "const {prisma}=require('./src/data/infrastructure/prisma/client'); prisma.$connect().then(()=>console.log('OK')).catch(e=>console.error(e))"
```

---

## 📝 Checklist

- [ ] Backup database trước khi migration
- [ ] Chạy SQL ALTER TABLE thành công
- [ ] Chạy script backfill thành công
- [ ] Kiểm tra số lượng hoạt động có lop_id
- [ ] Test dashboard Admin tab "Theo lớp"
- [ ] Test thống kê GVCN, Sinh viên, Lớp trưởng
- [ ] Confirm `tong_hoat_dong` khớp nhau giữa các role

---

*Tạo ngày: 26/11/2025*
