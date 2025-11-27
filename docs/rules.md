# AI Rules – Hệ thống Web Quản lý Hoạt Động Rèn Luyện

## 1. Bối cảnh
- Hệ thống quản lý hoạt động rèn luyện cho sinh viên.
- Tech stack: Node.js / Express, Prisma ORM, PostgreSQL, React (FE).
- Có 4 role chính:
  - `ADMIN`
  - `GIANG_VIEN`
  - `LOP_TRUONG`
  - `SINH_VIEN`

## 2. Bộ lọc Học kỳ (bắt buộc)

Ở tất cả các màn hình sau:

- Trang chủ
- Danh sách hoạt động
- Hoạt động của tôi
- Điểm rèn luyện
- Báo cáo thống kê
- Phê duyệt đăng ký
- Phê duyệt hoạt động
- Sinh viên lớp
- Hoạt động lớp

**Luôn phải có bộ lọc Học kỳ:**

- Danh sách học kỳ phải lấy từ DB qua Prisma (bảng HọcKỳ), không hard-code.
- API / service / repo / hook phải luôn truyền và xử lý `hocKyId` (hoặc tương đương).
- Các query Prisma phải có `where: { hocKyId: ... }` tương ứng.
- Nếu có “học kỳ hiện tại”, hãy lấy từ DB (cờ `isCurrent` hoặc logic riêng), không gán tay trong code.

## 3. Ràng buộc Lớp – Sinh viên

- Mỗi sinh viên phải thuộc đúng **1 lớp** (trường `lopId` trong bảng SinhVien/NguoiDung không được null).
- Khi lấy danh sách hoạt động cho sinh viên:
  - Luôn join / filter theo `lopId` của sinh viên.
  - Sinh viên chỉ được thấy và thao tác với **hoạt động của lớp mình**.
  - Không được hiển thị hay cho đăng ký hoạt động của lớp khác.
- Không được lấy toàn bộ hoạt động rồi filter ở frontend; phải filter từ truy vấn DB (Prisma).

## 4. Phân quyền chi tiết theo Role

### 4.1. SINH_VIEN

- Được truy cập:
  - Trang chủ
  - Danh sách hoạt động (của lớp mình)
  - Hoạt động của tôi
  - Điểm rèn luyện
  - Báo cáo thống kê / hoạt động lớp (chỉ lớp mình)
- Tất cả dữ liệu phải thỏa:
  - `where hocKyId = <hocKyId đã chọn>`
  - `where lopId = <lopId của sinh viên>`
- Không được phép:
  - Xem hoạt động/lớp không thuộc về mình.
  - Truyền `lopId` tùy ý để xem lớp khác.

### 4.2. LOP_TRUONG

- Có tất cả quyền như `SINH_VIEN` trong lớp của mình.
- Thêm quyền:
  - Phê duyệt đăng ký hoạt động của sinh viên trong lớp.
  - Xem danh sách sinh viên lớp.
  - Xem báo cáo thống kê hoạt động của lớp mình.
- Giới hạn:
  - Chỉ thao tác trong đúng lớp mà tài khoản đó là lớp trưởng.
  - Không được phép can thiệp lớp khác.

### 4.3. GIANG_VIEN

- Chỉ xem được các lớp mà giảng viên đó **chủ nhiệm** / phụ trách (mapping trong DB).
- Ở các màn hình:
  - Danh sách hoạt động
  - Sinh viên lớp
  - Báo cáo thống kê
  - Phê duyệt hoạt động (nếu có)
- Luôn filter theo:
  - `hocKyId` được chọn
  - Các `lopId` thuộc về giảng viên hiện tại (query từ bảng quan hệ GiangVien–Lop).
- Không được xem lớp hoặc hoạt động ngoài phạm vi phụ trách.

### 4.4. ADMIN

- Có toàn quyền:
  - Xem toàn bộ lớp, sinh viên, giảng viên, hoạt động, báo cáo, phê duyệt… trên tất cả học kỳ.
- Có thể bỏ giới hạn `lopId`/`giangVienId`, nhưng vẫn nên filter theo `hocKyId` để phù hợp UI.

## 5. Nguyên tắc triển khai kỹ thuật

- Không tin các tham số `lopId`, `giangVienId`, `role` gửi từ client đối với SINH_VIEN / LOP_TRUONG / GIANG_VIEN.
  - Luôn lấy thông tin user từ JWT/session, sau đó query DB để ra `lopId`, danh sách lớp phụ trách, v.v.
- Với `SINH_VIEN` và `LOP_TRUONG`:
  - `lopId` bắt buộc phải xác định từ user hiện tại.
- Với `GIANG_VIEN`:
  - Lớp được xem phải là danh sách lớp lấy từ DB dựa trên `giangVienId`.
- Chỉ `ADMIN` mới được phép truyền `lopId` tùy ý trong filter.

- Khi viết / sửa:
  - API controller / service / repository.
  - Hooks React (`useActivities`, `useMyActivities`, `useSemesterFilter`, …).
  - Component page cho các màn hình nêu trên.

→ Luôn phải đảm bảo:
- Có filter học kỳ chuẩn từ DB.
- Có kiểm soát phạm vi theo lớp và role đúng như quy tắc ở trên.
