# 📦 HƯỚNG DẪN BACKUP VÀ RESTORE DATABASE

## 📋 Tổng Quan

Hệ thống cung cấp 2 file backup:
1. **Full Backup** (`full_backup_YYYYMMDD_HHMMSS.sql`) - Chứa đầy đủ cấu trúc + dữ liệu
2. **HOW_TO_RESTORE.txt** - Hướng dẫn restore chi tiết

---

## 🔧 YÊU CẦU

- Docker Desktop đang chạy
- Container `dacn_db` đang hoạt động
- PowerShell (Windows)
- File `.env` có `DATABASE_URL` hợp lệ

---

## 💾 CÁCH 1: TẠO BACKUP MỚI

### Backup Toàn Bộ Dữ Liệu (Khuyến nghị)

```powershell
cd backend
powershell -ExecutionPolicy Bypass -File .\scripts\backup-simple.ps1
```

**Kết quả:**
- File: `backend/backups/full_backup_YYYYMMDD_HHMMSS.sql` (~ 2.5 MB)
- Chứa:
  - 670 người dùng (tất cả password: `123456`)
  - 659 sinh viên
  - 1,041 hoạt động
  - 1,607 đăng ký hoạt động
  - 510 bản điểm danh
  - 11 lớp học
  - 4 vai trò

---

## 🔄 CÁCH 2: RESTORE TỪ BACKUP

### Option A: Dùng PowerShell Script (Dễ nhất)

```powershell
cd backend
powershell -ExecutionPolicy Bypass -File .\scripts\restore-simple.ps1 -BackupFile ".\backups\full_backup_20251031_100346.sql" -Force
```

**Các bước tự động:**
1. ✅ Đóng tất cả kết nối database
2. ✅ Copy file backup vào container
3. ✅ Restore database
4. ✅ Dọn dẹp file tạm
5. ✅ Kiểm tra số lượng bản ghi

### Option B: Restore Thủ Công (Nhanh hơn)

```powershell
# Bước 1: Copy file vào container
docker cp backups\full_backup_20251031_100346.sql dacn_db:/tmp/backup.sql

# Bước 2: Restore
docker exec dacn_db psql -U admin -d Web_QuanLyDiemRenLuyen -f /tmp/backup.sql

# Bước 3: Xóa file temp
docker exec dacn_db rm /tmp/backup.sql
```

### Option C: Dùng Prisma (Khi Development)

```powershell
# Bước 1: Reset database
cd backend
npx prisma db push --force-reset

# Bước 2: Import backup
Get-Content backups\full_backup_20251031_100346.sql | docker exec -i dacn_db psql -U admin -d Web_QuanLyDiemRenLuyen

# Bước 3: Generate Prisma Client
npx prisma generate
```

---

## ✅ KIỂM TRA SAU KHI RESTORE

### Cách 1: Dùng Docker Exec

```powershell
docker exec dacn_db psql -U admin -d Web_QuanLyDiemRenLuyen -c "SELECT 'nguoi_dung' as table_name, COUNT(*) as count FROM nguoi_dung UNION ALL SELECT 'sinh_vien', COUNT(*) FROM sinh_vien UNION ALL SELECT 'hoat_dong', COUNT(*) FROM hoat_dong UNION ALL SELECT 'dang_ky_hoat_dong', COUNT(*) FROM dang_ky_hoat_dong;"
```

**Kết quả mong đợi:**
```
   table_name        | count
---------------------+-------
 nguoi_dung          |   670
 sinh_vien           |   659
 hoat_dong           |  1041
 dang_ky_hoat_dong   |  1607
```

### Cách 2: Dùng Prisma Studio

```powershell
cd backend
npx prisma studio
```

Mở http://localhost:5555 và kiểm tra các bảng.

### Cách 3: Test Login

1. Mở http://localhost:3000/login
2. Login với tài khoản:
   - **Admin**: `admin` / `123456`
   - **Giảng viên**: `gv001` / `123456`
   - **Lớp trưởng**: `2021001` / `123456`
   - **Sinh viên**: `2021002` / `123456`

---

## 🗑️ XÓA DỮ LIỆU CŨ

### Xóa File Backup Cũ Trong Prisma

```powershell
cd backend\prisma

# Xem các file SQL cũ
ls *.sql

# Xóa các file không cần thiết
Remove-Item check_roles_data.sql
Remove-Item raw_vi_dataset.sql
```

### Xóa Toàn Bộ Dữ Liệu Database (Cẩn thận!)

```powershell
# Cách 1: Dùng Prisma
cd backend
npx prisma db push --force-reset

# Cách 2: Dùng Docker
docker exec dacn_db psql -U admin -d Web_QuanLyDiemRenLuyen -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

---

## 📂 CẤU TRÚC THƯ MỤC

```
backend/
├── backups/                              # Thư mục chứa backup
│   ├── full_backup_20251031_100346.sql  # ✅ Full backup (2.5 MB)
│   └── HOW_TO_RESTORE.txt               # Hướng dẫn restore
├── prisma/
│   ├── schema.prisma                    # ✅ Giữ lại (cấu trúc database)
│   ├── migrations/                      # ✅ Giữ lại (history)
│   ├── check_roles_data.sql             # ❌ Có thể xóa (file test cũ)
│   └── raw_vi_dataset.sql               # ❌ Có thể xóa (dataset cũ)
└── scripts/
    ├── backup-simple.ps1                # ✅ Script backup
    ├── restore-simple.ps1               # ✅ Script restore
    ├── seed_complete_data.js            # ✅ Script tạo dữ liệu mẫu
    └── quick_reset_passwords.js         # ✅ Script reset password
```

---

## 🎯 USE CASES

### Trường Hợp 1: Lỡ Xóa Dữ Liệu

```powershell
cd backend
powershell -ExecutionPolicy Bypass -File .\scripts\restore-simple.ps1 -BackupFile ".\backups\full_backup_20251031_100346.sql" -Force
```

### Trường Hợp 2: Setup Môi Trường Mới

```powershell
# Bước 1: Clone repo
git clone https://github.com/Jiipi/QL_DH_RenLuyen.git

# Bước 2: Copy file backup vào thư mục backups
# (Giả sử bạn có file backup từ máy khác)

# Bước 3: Start Docker
docker-compose up -d

# Bước 4: Restore
cd backend
powershell -ExecutionPolicy Bypass -File .\scripts\restore-simple.ps1 -BackupFile ".\backups\full_backup_20251031_100346.sql" -Force

# Bước 5: Generate Prisma Client
npx prisma generate

# Bước 6: Start backend
npm run dev
```

### Trường Hợp 3: Test Data Mới

```powershell
# Backup dữ liệu hiện tại
powershell -ExecutionPolicy Bypass -File .\scripts\backup-simple.ps1

# Tạo dữ liệu test mới
node scripts/seed_complete_data.js

# Nếu không ổn, restore lại
powershell -ExecutionPolicy Bypass -File .\scripts\restore-simple.ps1 -BackupFile ".\backups\full_backup_LATEST.sql" -Force
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

### 1. Backup Thường Xuyên
- Trước khi update code quan trọng
- Trước khi chạy migration mới
- Trước khi deploy lên production
- Hàng tuần (nếu có dữ liệu thực tế)

### 2. Đặt Tên File Backup Có Ý Nghĩa

```powershell
# Ví dụ:
full_backup_20251031_before_migration.sql
full_backup_20251031_clean_data.sql
full_backup_20251031_with_670_users.sql
```

### 3. Không Commit File Backup Lớn Lên Git

Thêm vào `.gitignore`:
```
backend/backups/*.sql
backend/backups/*.dump
```

### 4. Lưu Backup Ở Nhiều Nơi
- Local: `backend/backups/`
- Cloud: Google Drive, Dropbox
- External: USB, External HDD

### 5. Test Restore Định Kỳ
Đảm bảo file backup không bị lỗi.

---

## 🐛 TROUBLESHOOTING

### Lỗi: "database is being accessed by other users"

```powershell
# Đóng tất cả kết nối
docker exec dacn_db psql -U admin -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'Web_QuanLyDiemRenLuyen' AND pid <> pg_backend_pid();"
```

### Lỗi: "role 'admin' does not exist"

```powershell
# Tạo user admin
docker exec dacn_db psql -U postgres -c "CREATE USER admin WITH PASSWORD 'admin123';"
docker exec dacn_db psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE Web_QuanLyDiemRenLuyen TO admin;"
```

### Lỗi: "relation already exists"

```powershell
# Drop tất cả tables trước
npx prisma db push --force-reset --skip-generate

# Sau đó restore lại
powershell -ExecutionPolicy Bypass -File .\scripts\restore-simple.ps1 -BackupFile ".\backups\full_backup_20251031_100346.sql" -Force
```

### Lỗi: File backup quá lớn (>100MB)

```powershell
# Nén file trước khi backup
7z a backups\full_backup_20251031_100346.zip backups\full_backup_20251031_100346.sql

# Giải nén khi cần restore
7z x backups\full_backup_20251031_100346.zip
```

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề, kiểm tra:
1. Docker container đang chạy: `docker ps`
2. Database connection: Xem file `.env`
3. Permissions: Chạy PowerShell as Administrator
4. Disk space: Đảm bảo đủ dung lượng

---

**Cập nhật lần cuối:** 31/10/2025  
**Phiên bản:** 1.0  
**Tác giả:** System Administrator
