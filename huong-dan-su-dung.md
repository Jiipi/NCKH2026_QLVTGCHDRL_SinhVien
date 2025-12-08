# 📖 HƯỚNG DẪN SỬ DỤNG HỆ THỐNG QUẢN LÝ HOẠT ĐỘNG RÈN LUYỆN

> **Phiên bản**: 1.0  
> **Ngày cập nhật**: 06/12/2025  
> **Website**: [hoatdongrenluyen.io.vn](https://hoatdongrenluyen.io.vn)

---

## 📑 MỤC LỤC

1. [Giới thiệu hệ thống](#1-giới-thiệu-hệ-thống)
2. [Hướng dẫn cho Sinh viên](#2-hướng-dẫn-cho-sinh-viên)
3. [Hướng dẫn cho Giảng viên](#3-hướng-dẫn-cho-giảng-viên)
4. [Hướng dẫn cho Lớp trưởng](#4-hướng-dẫn-cho-lớp-trưởng)
5. [Hướng dẫn cho Quản trị viên](#5-hướng-dẫn-cho-quản-trị-viên)
6. [Câu hỏi thường gặp (FAQ)](#6-câu-hỏi-thường-gặp-faq)
7. [Xử lý sự cố thường gặp](#7-xử-lý-sự-cố-thường-gặp)
8. [Liên hệ hỗ trợ](#8-liên-hệ-hỗ-trợ)

---

## 1. GIỚI THIỆU HỆ THỐNG

### 1.1. Hệ thống là gì?

Hệ thống Quản lý Hoạt động Rèn luyện là ứng dụng web giúp sinh viên và giảng viên quản lý các hoạt động rèn luyện, tính điểm tự động và theo dõi kết quả.

### 1.2. Vai trò người dùng

|-----------------|--------------------------------------------------------------------------------|
| Vai trò         | Quyền hạn chính                                                                |
|-----------------|--------------------------------------------------------------------------------|
| **Sinh viên**   | Đăng ký hoạt động, điểm danh QR, xem điểm rèn luyện                            |
|-----------------|--------------------------------------------------------------------------------|
| **Giảng viên**  | Tạo/duyệt hoạt động, quản lý sinh viên lớp, xuất báo cáo                       |
|-----------------|--------------------------------------------------------------------------------|
| **Lớp trưởng**  | Tạo hoạt động lớp, duyệt đăng ký tham gia hoạt động, quản lý sinh viên lớp     |
|-----------------|--------------------------------------------------------------------------------|
| **Quản trị**    | Quản lý người dùng, duyệt hoạt động, cấu hình hệ thống, thống kê               |
|-----------------|--------------------------------------------------------------------------------|

### 1.3. Thông tin đăng nhập mặc định

**⚠️ ĐỔI MẬT KHẨU NGAY SAU KHI ĐĂNG NHẬP LẦN ĐẦU!**

|----------------|-------------------|------------------------|
| Vai trò        | Tên đăng nhập     | Mật khẩu mặc định      |
|----------------|-------------------|------------------------|
| Quản trị       | `admin`           | `123456`               |
|----------------|-------------------|------------------------|
| Giảng viên     | `gv001`           | `123456`               |
|----------------|-------------------|------------------------|
| Sinh viên      | `2021002`         | `123456`               |
|----------------|-------------------|------------------------|
| Lớp trưởng     | `2021001`         | `123456`               |
|----------------|-------------------|------------------------|

---

## 2. HƯỚNG DẪN CHO SINH VIÊN

### 3.1. Đăng nhập hệ thống

1. Truy cập: `http://localhost:3000` hoặc `https://hoatdongrenluyen.io.vn`
2. Nhập **Mã số sinh viên/Tên đăng nhập** và **Mật khẩu**
3. Nhấn **Đăng nhập**


### 3.2. Trang chủ Sinh viên

Sau khi đăng nhập, bạn sẽ thấy:

- **Tổng quan điểm rèn luyện**: Điểm tích lũy theo kỳ
- **Hoạt động sắp diễn ra**: Các hoạt động mới nhất
- **Thống kê tham gia**: Biểu đồ hoạt động theo loại

#### Các chức năng chính:

|------------------------|------------------------------------------------|
| Chức năng              | Mô tả                                          |
|------------------------|------------------------------------------------|
| 🏠 Trang chủ           | Dashboard tổng quan và thống kê                |
| 🎯 Hoạt động           | Xem và đăng ký hoạt động rèn luyện             |
| 📋 Hoạt động của tôi   | Quản lý các hoạt động đã đăng ký               |
| 📊 Điểm rèn luyện      | Xem điểm và xếp loại rèn luyện                 |
| 📱 Điểm danh QR        | Điểm danh bằng mã QR                           |
| 🔔 Thông báo           | Xem thông báo về hoạt động và điểm danh        |
| 👤 Hồ sơ               | Quản lý thông tin cá nhân                      |
| **Trang chủ**          | Xem tổng quan và thống kê                      |
| **Hoạt động**          | Xem danh sách hoạt động có thể đăng ký         |
| **Hoạt động của tôi**  | Quản lý hoạt động đã đăng ký                   |
| **Điểm danh QR**       | Quét mã QR để điểm danh                        |
| **Bảng điểm**          | Xem chi tiết điểm rèn luyện                    |
| **Hồ sơ**              | Cập nhật thông tin cá nhân                     |
|------------------------|------------------------------------------------|

### 3.3. Đăng ký hoạt động

**Bước 1: Xem danh sách hoạt động**

1. Vào menu **Hoạt động**
2. Xem danh sách các hoạt động đang mở đăng ký
3. Lọc theo:
   - Học kỳ
   - Loại hoạt động
   - Trạng thái

**Bước 2: Đăng ký tham gia**

1. Nhấn vào hoạt động muốn tham gia
2. Đọc kỹ **Thông tin hoạt động**:
   - Thời gian, địa điểm
   - Số lượng tối đa
   - Yêu cầu tham gia
   - Điểm rèn luyện
3. Nhập **Lý do đăng ký** (tùy chọn)
4. Nhấn **Đăng ký**

**Trạng thái đăng ký:**

- 🟡 **Chờ duyệt**: Đang chờ giảng viên duyệt
- 🟢 **Đã duyệt**: Đã được duyệt, chờ tham gia
- 🔴 **Từ chối**: Bị từ chối, xem lý do từ chối
- ✅ **Đã tham gia**: Đã hoàn thành hoạt động

### 3.4. Điểm danh bằng QR Code

**Cách 1: Quét QR tại sự kiện**

1. Vào menu **Điểm danh QR**
2. Cho phép trình duyệt truy cập camera
3. Quét mã QR của hoạt động
4. Hệ thống tự động điểm danh

**Cách 2: Nhập mã QR thủ công**

1. Nhấn **Nhập mã QR**
2. Nhập mã 8 ký tự
3. Nhấn **Xác nhận**

**Lưu ý:**
- ⏰ Chỉ điểm danh được trong khung giờ diễn ra hoạt động
- ✅ Mỗi hoạt động chỉ điểm danh được 1 lần
- 📍 Một số hoạt động yêu cầu vị trí định vị (GPS)

### 3.5. Xem điểm rèn luyện

**Xem tổng quan:**

1. Vào menu **Điểm rèn luyện**
2. Chọn **Học kỳ** và **Năm học**
3. Xem điểm theo loại hoạt động:
   - Hoạt động chính trị - xã hội
   - Hoạt động văn hóa - thể thao
   - Hoạt động tình nguyện
   - Hoạt động học tập
   - Hoạt động khác

**Xuất PDF:**

1. Nhấn nút **Xuất PDF**
2. Chọn **Học kỳ** cần xuất
3. File PDF sẽ tự động tải về

### 3.6. Xem thông báo

**Kiểm tra thông báo mới:**

1. Nhấn vào **biểu tượng chuông** ở góc trên bên phải
2. Xem danh sách thông báo:
   - 🔴 Khẩn cấp: Màu đỏ
   - 🟡 Cao: Màu vàng
   - 🔵 Trung bình: Màu xanh
   - ⚪ Thấp: Màu xám

**Đọc chi tiết thông báo:**

1. Nhấn vào thông báo muốn xem
2. Đọc nội dung chi tiết
3. Thông báo sẽ tự động đánh dấu là đã đọc

**Lọc thông báo:**

1. Vào menu **Thông báo**
2. Lọc theo:
   - Chưa đọc / Đã đọc
   - Mức độ ưu tiên
   - Loại thông báo (Hệ thống, Hoạt động, Lớp)
   - Khoảng thời gian

### 3.7. Tìm kiếm hoạt động

**Tìm kiếm hoạt động:**

1. Nhấn **Ctrl + K** hoặc vào ô tìm kiếm
2. Nhập từ khóa: tên hoạt động, địa điểm, đơn vị tổ chức
3. Xem kết quả gợi ý ngay lập tức
4. Sử dụng bộ lọc để thu hẹp kết quả:
   - Loại hoạt động
   - Học kỳ
   - Trạng thái đăng ký

### 3.8. Xem chứng chỉ

> ⚠️ **Lưu ý**: Tính năng tải chứng chỉ hiện đang trong giai đoạn phát triển. Bạn có thể xem danh sách các hoạt động có chứng chỉ, nhưng chức năng tải về chưa khả dụng.

**Danh sách chứng chỉ:**

1. Vào **Hoạt động của tôi** > **Chứng chỉ**
2. Xem các hoạt động đã hoàn thành có chứng chỉ
3. Trạng thái:
   - ✅ Sẵn sàng tải: Đã hoàn thành và được xác nhận
   - ⏳ Đang xử lý: Chờ giảng viên xác nhận

### 3.9. Quản lý hồ sơ

**Cập nhật thông tin:**

1. Vào menu **Hồ sơ**
2. Cập nhật:
   - Ảnh đại diện (JPG, PNG - tối đa 5MB)
   - Email liên hệ
   - Số điện thoại
   - Địa chỉ
   - Thông tin sinh viên (MSSV, ngày sinh, giới tính)
3. Nhấn **Lưu thay đổi**

**Đổi mật khẩu:**

1. Vào **Hồ sơ** > **Đổi mật khẩu**
2. Nhập:
   - Mật khẩu cũ
   - Mật khẩu mới (tối thiểu 6 ký tự)
   - Xác nhận mật khẩu mới
3. Nhấn **Đổi mật khẩu**

**Xem lịch sử hoạt động:**

1. Vào **Hồ sơ** > **Lịch sử**
2. Xem:
   - Lịch sử đăng nhập
   - Lịch sử đăng ký hoạt động
   - Lịch sử điểm danh

---

## 4. HƯỚNG DẪN SỬ DỤNG CHO GIẢNG VIÊN

### 4.1. Đăng nhập

1. Truy cập hệ thống
2. Nhập **Mã giảng viên** và **Mật khẩu**
3. Chọn vai trò: **Giảng viên**

### 4.2. Trang chủ Giảng viên

Dashboard hiển thị:

- **Thống kê hoạt động**: Số lượng hoạt động đã tạo
- **Đăng ký chờ duyệt**: Số lượng đăng ký cần xử lý
- **Hoạt động sắp tới**: Lịch hoạt động trong tuần
- **Biểu đồ thống kê**: Phân tích hoạt động theo loại

### 4.3. Tạo hoạt động mới

**Bước 1: Vào Quản lý hoạt động**

1. Menu **Hoạt động** > **Tạo hoạt động mới**

**Bước 2: Điền thông tin**

**Thông tin cơ bản:**
- **Mã hoạt động**: Mã duy nhất (tự động tạo hoặc tùy chỉnh)
- **Tên hoạt động**: Tiêu đề hoạt động
- **Loại hoạt động**: Chọn từ danh mục
- **Mô tả**: Mô tả chi tiết về hoạt động

**Thời gian và địa điểm:**
- **Ngày bắt đầu**: Ngày giờ bắt đầu
- **Ngày kết thúc**: Ngày giờ kết thúc
- **Địa điểm**: Nơi tổ chức
- **Hạn đăng ký**: Thời hạn sinh viên có thể đăng ký

**Điểm và số lượng:**
- **Điểm rèn luyện**: Điểm cho hoạt động (mặc định theo loại)
- **Số lượng tối đa**: Giới hạn sinh viên tham gia
- **Lớp**: Chọn lớp tham gia (hoặc để trống = tất cả)

**Thông tin khác:**
- **Đơn vị tổ chức**: Tên đơn vị
- **Yêu cầu tham gia**: Điều kiện để tham gia
- **Có chứng chỉ**: Tích nếu hoạt động có chứng chỉ
- **Hình ảnh**: Upload hình ảnh minh họa
- **Tệp đính kèm**: Upload tài liệu liên quan

**Bước 3: Lưu hoạt động**

- Nhấn **Tạo hoạt động** để lưu và gửi hoạt động

### 4.4. Duyệt đăng ký sinh viên

**Xem danh sách đăng ký:**

1. Menu **Duyệt đăng ký**
2. Chọn hoạt động cần duyệt
3. Xem danh sách sinh viên đăng ký

**Duyệt từng sinh viên:**

1. Xem thông tin sinh viên:
   - MSSV, Họ tên
   - Lớp
   - Lý do đăng ký
2. Nhấn **Duyệt** hoặc **Từ chối**
3. Nếu từ chối, nhập **Lý do từ chối**

**Duyệt hàng loạt:**

1. Tích chọn nhiều sinh viên
2. Nhấn **Duyệt tất cả** hoặc **Từ chối tất cả**

### 4.5. Điểm danh sinh viên

**Cách 1: Hiển thị mã QR**

1. Vào **Hoạt động** > **Chi tiết hoạt động**
2. Nhấn **Tạo mã QR**
3. Hiển thị mã QR cho sinh viên quét
4. Xem danh sách sinh viên đã điểm danh real-time

**Cách 2: Điểm danh thủ công**

1. Vào **Điểm danh** > Chọn hoạt động
2. Xem danh sách sinh viên đã đăng ký
3. Tích vào từng sinh viên để điểm danh
4. Chọn trạng thái:
   - ✅ **Có mặt**: Sinh viên tham dự đầy đủ
   - ❌ **Vắng mặt**: Sinh viên không tham dự

### 4.6. Quản lý lớp chủ nhiệm

**Xem danh sách sinh viên:**

1. Menu **Quản lý lớp**
2. Xem thông tin lớp:
   - Danh sách sinh viên
   - Điểm rèn luyện từng sinh viên
   - Thống kế tham gia hoạt động

**Nhập sinh viên từ Excel:**

1. Tải file mẫu
2. Điền thông tin sinh viên
3. Tải lên tệp Excel
4. Kiểm tra và xác nhận

**Xuất báo cáo:**

1. Chọn học kỳ
2. Nhấn **Xuất báo cáo**
3. Chọn định dạng: Excel hoặc PDF

### 4.7. Quản lý QR Code điểm danh

**Tạo mã QR cho hoạt động:**

1. Vào **Hoạt động** > Chọn hoạt động
2. Nhấn **Quản lý QR**
3. Tùy chọn:
   - **Tạo QR mới**: Tạo mã QR 8 ký tự ngẫu nhiên
   - **Tùy chỉnh QR**: Nhập mã tùy chỉnh
   - **Đặt thời gian hiệu lực**: Giới hạn thời gian điểm danh

**Hiển thị QR tại sự kiện:**

1. Nhấn **Hiển thị QR**
2. Mã QR sẽ hiển thị toàn màn hình
3. Sinh viên quét để điểm danh
4. Xem danh sách điểm danh real-time

**In mã QR:**

1. Nhấn **In QR**
2. Chọn kích thước: A4, A5, hoặc tùy chỉnh
3. In hoặc lưu PDF

### 4.8. Quản lý thông báo

**Gửi thông báo cho sinh viên:**

1. Menu **Thông báo** > **Tạo mới**
2. Chọn người nhận:
   - Lớp chủ nhiệm
   - Sinh viên đã đăng ký hoạt động cụ thể
   - Nhóm sinh viên tùy chỉnh
3. Điền:
   - Tiêu đề
   - Nội dung
   - Mức độ ưu tiên
4. Nhấn **Gửi**

**Xem lịch sử thông báo:**

1. Menu **Thông báo** > **Đã gửi**
2. Xem:
   - Số người đã đọc / Tổng người nhận
   - Thời gian gửi
   - Nội dung

### 4.9. Thống kê và báo cáo

**Xem thống kê tổng quan:**

1. Menu **Báo cáo** > **Tổng quan**
2. Xem:
   - Tổng số hoạt động đã tạo
   - Tỷ lệ tham gia của sinh viên
   - Điểm rèn luyện trung bình lớp
   - Biểu đồ xu hướng theo tháng

**Báo cáo chi tiết:**

1. Menu **Báo cáo**
2. Chọn loại:
   - **Báo cáo theo lớp**: Điểm rèn luyện từng sinh viên trong lớp
   - **Báo cáo theo hoạt động**: Danh sách tham gia, điểm danh
   - **Báo cáo theo sinh viên**: Lịch sử tham gia chi tiết
   - **Báo cáo theo thời gian**: Thống kê theo học kỳ/năm học

**Lọc dữ liệu:**

- Học kỳ, Năm học
- Lớp chủ nhiệm
- Loại hoạt động
- Khoảng thời gian tùy chỉnh
- Trạng thái (Đã hoàn thành, Đang diễn ra)

**Xuất báo cáo:**

1. Chọn dữ liệu cần xuất
2. Nhấn **Xuất Excel** hoặc **Xuất PDF**
3. File sẽ tự động tải về
4. Tùy chọn:
   - Xuất tất cả dữ liệu
   - Xuất dữ liệu đã lọc
   - Xuất theo mẫu có sẵn

---

## 5. HƯỚNG DẪN SỬ DỤNG CHO LỚP TRƯỞNG

### 5.1. Vai trò và quyền hạn

Lớp trưởng có quyền:

- ✅ Tạo hoạt động nội bộ lớp
- ✅ Duyệt đăng ký sinh viên trong lớp
- ✅ Xem điểm rèn luyện toàn lớp
- ✅ Tạo thông báo cho lớp
- ❌ Không được sửa điểm rèn luyện

### 5.2. Tạo hoạt động lớp

**Quy trình tương tự Giảng viên, nhưng:**

- Chỉ tạo được hoạt động cho lớp mình
- Điểm rèn luyện tối đa: 5 điểm
- Cần giảng viên chủ nhiệm duyệt

### 5.3. Quản lý sinh viên lớp

**Xem danh sách:**

1. Menu **Sinh viên lớp**
2. Xem thông tin chi tiết từng sinh viên
3. Lọc theo điểm rèn luyện

**Thông báo đến lớp:**

1. Menu **Thông báo**
2. Nhấn **Tạo thông báo mới**
3. Điền nội dung
4. Chọn **Gửi đến toàn lớp**

### 5.4. Quản lý hoạt động lớp

**Xem hoạt động của lớp:**

1. Menu **Hoạt động lớp**
2. Xem:
   - Hoạt động do lớp trưởng tạo
   - Hoạt động giảng viên tạo cho lớp
   - Tỷ lệ tham gia của lớp

**Nhắc nhở sinh viên:**

1. Chọn hoạt động sắp diễn ra
2. Nhấn **Nhắc nhở**
3. Hệ thống tự động gửi thông báo cho sinh viên chưa đăng ký

### 5.5. Theo dõi điểm lớp

**Bảng điều khiển lớp:**

1. Vào **Bảng điều khiển lớp**
2. Xem tổng quan:
   - Điểm trung bình lớp
   - Sinh viên có điểm cao nhất
   - Sinh viên cần quan tâm (điểm thấp)
   - Biểu đồ phân bố điểm
   - So sánh với các lớp khác (nếu có)

**Xuất danh sách điểm:**

1. Nhấn **Xuất điểm lớp**
2. Chọn học kỳ
3. Chọn định dạng: Excel hoặc PDF
4. File tải về tự động

### 5.6. Báo cáo với giảng viên chủ nhiệm

**Tạo báo cáo định kỳ:**

1. Menu **Báo cáo** > **Gửi báo cáo**
2. Chọn nội dung báo cáo:
   - Tình hình tham gia hoạt động
   - Sinh viên có vấn đề
   - Đề xuất/kiến nghị
3. Nhấn **Gửi cho GV chủ nhiệm**

### 5.7. Xem chứng chỉ (Certificates)

**⚠️ Lớp trưởng cũng có quyền xem chứng chỉ của các hoạt động đã tham gia**

**Truy cập chứng chỉ:**

1. Menu **Chứng chỉ** hoặc **My Certificates**
2. Xem danh sách hoạt động đã hoàn thành có chứng chỉ

**Tìm kiếm và lọc:**

1. **Tìm kiếm**: Nhập tên hoạt động
2. **Lọc theo**:
   - Năm học
   - Học kỳ
   - Loại hoạt động
   - Năm tổ chức

**Thống kê chứng chỉ:**

- Tổng số chứng chỉ đã nhận
- Tổng điểm rèn luyện từ các hoạt động có chứng chỉ
- Phân loại theo loại hoạt động

**Tải chứng chỉ:**

1. Nhấn **Tải về** bên cạnh hoạt động
2. Chứng chỉ sẽ được tải dưới dạng PDF hoặc hình ảnh
3. **Lưu ý**: Chức năng đang được phát triển, hiện tại hiển thị thông tin chứng nhận

---

## 6. HƯỚNG DẪN SỬ DỤNG CHO QUẢN TRỊ VIÊN

### 6.1. Trang chủ Quản trị

Bảng điều khiển hiển thị:

- **Tổng số người dùng**: Sinh viên, giảng viên
- **Tổng số hoạt động**: Theo trạng thái
- **Hoạt động gần đây**: Lịch sử thao tác
- **Thống kê hệ thống**: Biểu đồ tổng quan

### 6.2. Quản lý người dùng

**Xem danh sách người dùng:**

1. Menu **Người dùng**
2. Lọc theo:
   - Vai trò
   - Trạng thái tài khoản
   - Khoa, Lớp

**Tạo người dùng mới:**

1. Nhấn **Thêm người dùng**
2. Điền thông tin:
   - Tên đăng nhập
   - Email
   - Họ tên
   - Vai trò
   - Mật khẩu
3. Nhấn **Tạo**

**Nhập người dùng từ Excel:**

1. Nhấn **Nhập từ Excel**
2. Tải file mẫu Excel
3. Điền thông tin người dùng theo mẫu:
   - Cột A: Họ tên
   - Cột B: MSSV/MSGV
   - Cột C: Thư điện tử
   - Cột D: Vai trò (SINH_VIEN, GIANG_VIEN, LOP_TRUONG, ADMIN)
   - Cột E: Mã lớp
4. Tải lên tệp Excel
5. Xem xem trước và kiểm tra dữ liệu
6. Nhấn **Xác nhận nhập**
7. Hệ thống sẽ báo cáo:
   - Số người dùng import thành công
   - Số dòng lỗi (nếu có)
   - Chi tiết lỗi từng dòng

**Xuất danh sách người dùng:**

1. Chọn người dùng cần xuất (hoặc chọn tất cả)
2. Nhấn **Xuất Excel** hoặc **Xuất PDF**
3. Chọn các cột thông tin cần xuất:
   - Thông tin cơ bản
   - Điểm rèn luyện
   - Lịch sử hoạt động
4. File sẽ tự động tải về

**Chỉnh sửa người dùng:**

1. Nhấn **Sửa** trên dòng người dùng
2. Cập nhật thông tin
3. Nhấn **Lưu**

**Khóa/Mở khóa tài khoản:**

1. Nhấn **Khóa** để vô hiệu hóa tài khoản
2. Nhấn **Mở khóa** để kích hoạt lại

### 6.3. Quản lý vai trò và phân quyền

**Xem danh sách vai trò:**

1. Menu **Vai trò**
2. Xem các vai trò hiện có:
   - Admin
   - Teacher
   - Student
   - Monitor

**Tạo vai trò mới:**

1. Nhấn **Tạo vai trò**
2. Nhập tên vai trò và mô tả
3. Chọn quyền hạn:
   - **Người dùng**: Xem, Tạo, Sửa, Xóa
   - **Hoạt động**: Xem, Tạo, Sửa, Xóa, Duyệt
   - **Đăng ký**: Xem, Duyệt
   - **Điểm danh**: Xem, Điểm danh
   - **Báo cáo**: Xem, Xuất
   - **Cài đặt**: Quản lý học kỳ, loại hoạt động
4. Nhấn **Lưu**

**Phân quyền chi tiết:**

Hệ thống hỗ trợ phân quyền theo từng chức năng:

|-------------------------|----------------------------------|
| Quyền                   | Mô tả                            |
|-------------------------|----------------------------------|
| `users.read`            | Xem danh sách người dùng         |
|-------------------------|----------------------------------|
| `users.create`          | Tạo người dùng mới               |
|-------------------------|----------------------------------|
| `users.update`          | Cập nhật thông tin người dùng    |
|-------------------------|----------------------------------|
| `users.delete`          | Xóa người dùng                   |
|-------------------------|----------------------------------|
| `activities.read`       | Xem danh sách hoạt động          |
|-------------------------|----------------------------------|
| `activities.create`     | Tạo hoạt động mới                |
|-------------------------|----------------------------------|
| `activities.update`     | Cập nhật hoạt động               |
|-------------------------|----------------------------------|
| `activities.delete`     | Xóa hoạt động                    |
|-------------------------|----------------------------------|
| `activities.approve`    | Duyệt hoạt động                  |
|-------------------------|----------------------------------|
| `registrations.read`    | Xem đăng ký                      |
|-------------------------|----------------------------------|
| `registrations.approve` | Duyệt đăng ký                    |
|-------------------------|----------------------------------|
| `attendance.read`       | Xem điểm danh                    |
|-------------------------|----------------------------------|
| `attendance.write`      | Điểm danh sinh viên              |
|-------------------------|----------------------------------|
| `reports.read`          | Xem báo cáo                      |
|-------------------------|----------------------------------|
| `reports.export`        | Xuất báo cáo                     |
|-------------------------|----------------------------------|
| `settings.manage`       | Quản lý cài đặt hệ thống         |
|-------------------------|----------------------------------|

### 6.4. Quản lý loại hoạt động

**Xem danh sách loại hoạt động:**

1. Menu **Loại hoạt động**
2. Xem các loại:
   - Hoạt động chính trị - xã hội
   - Hoạt động văn hóa - thể thao
   - Hoạt động tình nguyện
   - Hoạt động học tập

**Tạo loại hoạt động mới:**

1. Nhấn **Thêm loại hoạt động**
2. Điền:
   - Tên loại hoạt động
   - Mô tả
   - Điểm mặc định
   - Điểm tối đa
   - Màu sắc (để phân biệt trên giao diện)
3. Nhấn **Lưu**

**Chỉnh sửa loại hoạt động:**

1. Nhấn **Sửa**
2. Cập nhật thông tin
3. Nhấn **Lưu**

### 6.5. Quản lý học kỳ

**Tạo học kỳ mới:**

1. Menu **Cài đặt** > **Quản lý học kỳ**
2. Nhấn **Tạo học kỳ**
3. Điền:
   - Tên học kỳ (VD: Học kỳ 1, Học kỳ 2)
   - Năm học (VD: 2024)
   - Ngày bắt đầu
   - Ngày kết thúc
4. Nhấn **Lưu**

**Khóa điểm học kỳ:**

1. Chọn học kỳ cần khóa
2. Nhấn **Khóa điểm**
3. Xác nhận

**Lưu ý:**
- Sau khi khóa, sinh viên không thể đăng ký hoạt động mới
- Giảng viên không thể sửa điểm

### 6.6. Duyệt hoạt động

**Xem hoạt động chờ duyệt:**

1. Menu **Duyệt hoạt động**
2. Xem danh sách hoạt động do giảng viên/lớp trưởng tạo
3. Kiểm tra thông tin hoạt động

**Duyệt/Từ chối:**

1. Nhấn **Duyệt** để cho phép hoạt động công khai
2. Nhấn **Từ chối** và nhập lý do nếu không phù hợp

### 6.7. Thống kê và báo cáo tổng quan

**Dashboard Admin:**

- **Tổng quan hệ thống**:
  - Tổng số người dùng (Sinh viên, Giảng viên, Lớp trưởng)
  - Tổng số hoạt động (Đang diễn ra, Sắp tới, Đã kết thúc)
  - Tổng số đăng ký tham gia
  - Tỷ lệ điểm danh trung bình
- **Biểu đồ tăng trưởng người dùng** theo tháng
- **Biểu đồ hoạt động** theo loại và theo tháng
- **Top 10 sinh viên** có điểm rèn luyện cao nhất
- **Top 10 hoạt động** được đăng ký nhiều nhất
- **Thống kê theo khoa, lớp**: So sánh điểm trung bình

**Xuất báo cáo tổng hợp:**

1. Menu **Báo cáo** > **Tổng hợp**
2. Chọn loại báo cáo:
   - **Báo cáo người dùng**: Danh sách, điểm rèn luyện
   - **Báo cáo hoạt động**: Thống kê tham gia, điểm danh
   - **Báo cáo đăng ký**: Lịch sử đăng ký theo thời gian
   - **Báo cáo khoa/lớp**: So sánh điểm trung bình
3. Chọn khoảng thời gian
4. Lọc theo: Khoa, Lớp, Loại hoạt động
5. Nhấn **Xuất Excel** hoặc **Xuất PDF**
6. File tải về tự động với tên: `BaoCao_[Loại]_[Ngày].xlsx`

**Xuất báo cáo đăng ký (Registrations Export):**

1. Menu **Duyệt đăng ký** > **Xuất báo cáo**
2. Lọc theo:
   - Trạng thái: Chờ duyệt, Đã duyệt, Từ chối
   - Hoạt động
   - Thời gian đăng ký
3. Nhấn **Xuất Excel**
4. File bao gồm:
   - Thông tin sinh viên
   - Hoạt động đã đăng ký
   - Trạng thái duyệt
   - Lý do từ chối (nếu có)

### 6.8. Quản lý lớp (Classes)

**Xem danh sách lớp:**

1. Menu **Quản lý lớp**
2. Xem:
   - Danh sách tất cả lớp
   - Thông tin: Tên lớp, Khoa, Niên khóa, Chủ nhiệm
   - Số lượng sinh viên

**Tạo lớp mới:**

1. Nhấn **Thêm lớp**
2. Điền:
   - Tên lớp
   - Khoa
   - Niên khóa
   - Năm nhập học
   - Giảng viên chủ nhiệm
   - Lớp trưởng (nếu có)
3. Nhấn **Lưu**

**Import danh sách lớp từ Excel:**

1. Tải file mẫu
2. Điền thông tin các lớp
3. Upload file
4. Xem preview và xác nhận

**Chỉnh sửa thông tin lớp:**

1. Nhấn **Sửa** bên cạnh lớp
2. Cập nhật:
   - Giảng viên chủ nhiệm
   - Lớp trưởng
   - Trạng thái lớp
3. Nhấn **Lưu**

### 6.9. Quản lý thông báo hệ thống

**Gửi thông báo toàn hệ thống:**

1. Menu **Thông báo** > **Gửi thông báo**
2. Chọn đối tượng:
   - Toàn bộ sinh viên
   - Toàn bộ giảng viên
   - Theo lớp (chọn nhiều lớp)
   - Theo khoa
   - Theo niên khóa
   - Tùy chỉnh (chọn từng người)
3. Điền:
   - Tiêu đề
   - Nội dung (hỗ trợ định dạng văn bản)
   - Mức độ ưu tiên: 🔴 Khẩn cấp / 🟡 Cao / 🔵 Trung bình / ⚪ Thấp
4. Tùy chọn:
   - Gửi email đồng thời
   - Lên lịch gửi sau
5. Nhấn **Gửi ngay** hoặc **Lên lịch**

**Quản lý loại thông báo:**

1. Menu **Thông báo** > **Loại thông báo**
2. Tạo loại mới:
   - Tên loại (VD: Học tập, Hành chính, Sự kiện)
   - Mô tả
   - Icon/màu sắc
3. Nhấn **Lưu**

### 6.10. Cài đặt hệ thống

**Cấu hình chung:**

1. Menu **Cài đặt** > **Cấu hình hệ thống**
2. Các tùy chọn:
   - **Thông tin trường**: Tên, logo, địa chỉ
   - **Thư điện tử**: Cấu hình gửi thư (SMTP)
   - **Điểm rèn luyện**: Điểm tối đa mỗi loại
   - **Đăng ký**: Thời gian tự động duyệt
   - **Điểm danh**: Thời gian hiệu lực mã QR
   - **Bảo mật**: Thời gian phiên làm việc, số lần đăng nhập sai

**Sao lưu và khôi phục:**

1. Menu **Cài đặt** > **Sao lưu dữ liệu**
2. Chọn:
   - **Sao lưu ngay**: Tạo bản sao lưu thủ công
   - **Lên lịch sao lưu**: Tự động theo chu kỳ
   - **Khôi phục**: Chọn tệp sao lưu để khôi phục

**Xem nhật ký hệ thống:**

1. Menu **Cài đặt** > **Nhật ký**
2. Xem:
   - Lịch sử đăng nhập
   - Thay đổi dữ liệu
   - Lỗi hệ thống
3. Lọc theo: Người dùng, Hành động, Thời gian

### 6.11. Quản lý phiên đăng nhập (Sessions)

**Xem người dùng đang online:**

1. Menu **Hệ thống** > **Phiên hoạt động**
2. Xem danh sách người dùng đang đăng nhập:
   - Tên người dùng, vai trò
   - Thời gian đăng nhập
   - Địa chỉ IP
   - Trình duyệt
   - Mã phiên (hỗ trợ đa phiên)

**Xem chi tiết phiên của một người dùng:**

1. Nhấn vào tên người dùng
2. Xem:
   - Tất cả các phiên đang hoạt động
   - Thời gian kết nối gần nhất
   - Thiết bị sử dụng

**Ngắt phiên đăng nhập:**

1. Chọn phiên cần ngắt
2. Nhấn **Đăng xuất**
3. Người dùng sẽ bị đăng xuất khỏi phiên đó
4. **Sử dụng khi**: Phát hiện đăng nhập bất thường, bảo mật tài khoản

**Dọn dẹp phiên không hoạt động:**

1. Menu **Hệ thống** > **Phiên hoạt động**
2. Nhấn **Dọn dẹp phiên cũ**
3. Hệ thống tự động xóa các phiên:
   - Không hoạt động quá 24h
   - Đã logout nhưng chưa bị xóa

**Thống kê phiên:**

- Tổng số phiên đang hoạt động
- Phân bố theo vai trò (Admin, GV, SV, Lớp trưởng)
- Xu hướng đăng nhập theo giờ

### 6.12. Quản lý thông báo hàng loạt

**Gửi thông báo hàng loạt:**

1. Menu **Thông báo** > **Thông báo hàng loạt**
2. Chọn đối tượng nhận:
   - Tất cả người dùng
   - Theo vai trò (Sinh viên, Giảng viên...)
   - Theo khoa, lớp, niên khóa
   - Danh sách tùy chỉnh
3. Điền:
   - Tiêu đề
   - Nội dung (hỗ trợ định dạng văn bản, biểu tượng)
   - Mức độ ưu tiên
4. Tùy chọn:
   - ✅ Gửi thư điện tử đồng thời
   - ✅ Thông báo đẩy
   - ✅ Lưu vào lịch sử
5. **Preview** trước khi gửi
6. Nhấn **Gửi ngay** hoặc **Lên lịch**

**Xem thống kê thông báo hàng loạt:**

1. Menu **Thông báo** > **Thông báo hàng loạt** > **Thống kê**
2. Xem:
   - Tổng số thông báo đã gửi
   - Số người nhận trung bình
   - Tỷ lệ đọc
   - Thống kê theo thời gian

**Lịch sử thông báo hàng loạt:**

1. Menu **Thông báo** > **Thông báo hàng loạt** > **Lịch sử**
2. Xem danh sách tất cả thông báo đã gửi:
   - Thời gian gửi
   - Người gửi
   - Số người nhận
   - Tỷ lệ đã đọc
3. Nhấn vào thông báo để xem chi tiết:
   - Nội dung đầy đủ
   - Danh sách người nhận
   - Ai đã đọc, ai chưa đọc
   - Thời gian đọc

**Gửi lại thông báo:**

1. Vào lịch sử thông báo hàng loạt
2. Chọn thông báo cần gửi lại
3. Nhấn **Gửi lại**
4. Chọn đối tượng mới hoặc giữ nguyên
5. Chỉnh sửa nội dung nếu cần
6. Gửi

---

## 7. CÂU HỎI THƯỜNG GẶP (FAQ)

### 7.1. Đăng nhập và Tài khoản

**Q: Quên mật khẩu phải làm sao?**

A: 
  1. Nhấn **Quên mật khẩu** tại màn hình đăng nhập
  2. Nhập email hoặc MSSV
  3. Kiểm tra email để nhận link đặt lại mật khẩu
  4. Nhấn vào link và nhập mật khẩu mới
  5. Nếu không nhận được thư sau 5 phút, kiểm tra thư mục Thư rác hoặc liên hệ quản trị

**Q: Tài khoản bị khóa vì nhập sai mật khẩu nhiều lần?**

A:
  - Tài khoản sẽ tự động mở khóa sau 15 phút
  - Hoặc liên hệ admin để mở khóa ngay lập tức

**Q: Có thể đổi username không?**

A: Không. Username (MSSV) là thông tin cố định và không thể thay đổi. Bạn chỉ có thể cập nhật email, số điện thoại và các thông tin khác trong Hồ sơ.

### 7.2. Đăng ký Hoạt động

**Q: Không thể đăng ký hoạt động, nút "Đăng ký" bị vô hiệu hóa?**

A: Có thể do các lý do sau:
  - Hoạt động đã hết hạn đăng ký
  - Đã đạt số lượng tối đa
  - Bạn đã đăng ký hoạt động này rồi
  - Hoạt động chỉ dành cho lớp/khoa khác
  - Kiểm tra **Điều kiện tham gia** trong phần mô tả hoạt động

**Q: Đã đăng ký nhưng sau đó muốn hủy?**

A: 
  1. Vào **Hoạt động của tôi** > **Đã đăng ký**
  2. Nhấn **Hủy đăng ký** bên cạnh hoạt động
  3. **Lưu ý:** Chỉ có thể hủy trước 24h so với thời gian diễn ra hoạt động

**Q: Đăng ký hoạt động có tốn phí không?**

A: Phần lớn hoạt động miễn phí. Một số hoạt động đặc biệt có thể có phí tham gia (sẽ hiển thị rõ trong mô tả).

**Q: Tôi có thể đăng ký bao nhiêu hoạt động cùng lúc?**

A: Không giới hạn số lượng đăng ký, nhưng lưu ý:
  - Không nên đăng ký 2 hoạt động trùng thời gian
  - Cần đảm bảo có thể tham gia đầy đủ để nhận điểm

### 7.3. Điểm danh QR

**Q: Quét QR không thành công?**

A: Thử các cách sau:
  1. **Kiểm tra camera**: Cho phép trình duyệt truy cập camera
  2. **Ánh sáng**: Di chuyển đến nơi đủ sáng
  3. **Khoảng cách**: Giữ điện thoại cách QR khoảng 15-20cm
  4. **Góc chụp**: Đặt camera song song với mã QR
  5. **Làm mới mã QR**: Yêu cầu giảng viên tạo lại QR nếu mã cũ hết hạn

**Q: Đã điểm danh thành công nhưng không thấy trong danh sách?**

A:
  - Đợi 10-20 giây và làm mới trang
  - Kiểm tra kết nối internet
  - Vào **Hoạt động của tôi** > **Lịch sử điểm danh** để xác nhận
  - Nếu vẫn không thấy, liên hệ giảng viên ngay

**Q: Quên điểm danh hoặc đến muộn sau khi mã QR đã đóng?**

A: 
  - Liên hệ trực tiếp với giảng viên phụ trách
  - Giảng viên có thể điểm danh thủ công cho bạn
  - Chuẩn bị lý do hợp lý (giấy xin phép, giấy bác sĩ nếu ốm)

**Q: Điểm danh hộ bạn có bị phát hiện không?**

A: 
  - **CÓ**. Hệ thống ghi nhận IP, vị trí GPS và thời gian điểm danh
  - Vi phạm sẽ bị xử lý nghiêm túc: hủy điểm của cả 2 người và có thể bị cảnh cáo

### 7.4. Điểm rèn luyện

**Q: Điểm rèn luyện được cập nhật khi nào?**

A:
  - Sau khi giảng viên **xác nhận** hoạt động đã hoàn thành
  - Thường trong vòng 3-7 ngày sau khi hoạt động kết thúc
  - Xem trạng thái trong **Hoạt động của tôi**

**Q: Điểm bị thiếu hoặc sai?**

A:
  1. Kiểm tra **Lịch sử điểm danh** xem có vắng mặt không
  2. Xem lại **Điều kiện nhận điểm** của hoạt động (có thể yêu cầu tham gia 100%, nộp báo cáo...)
  3. Liên hệ giảng viên phụ trách qua mục **Phản hồi**
  4. Nếu không được giải quyết, gửi khiếu nại đến Phòng Công tác Sinh viên

**Q: Cần bao nhiêu điểm rèn luyện để đạt loại Xuất sắc?**

A: Xem **Quy định điểm rèn luyện** trong Phụ lục (mục 9.1) hoặc tại mục **Điểm của tôi** > **Quy định**

**Q: Điểm rèn luyện có ảnh hưởng đến học bổng không?**

A: Có. Điểm rèn luyện là một trong các tiêu chí xét học bổng, khen thưởng và nhiều quyền lợi khác.

### 7.5. Thông báo

**Q: Không nhận được thông báo từ hệ thống?**

A:
  1. **Kiểm tra cài đặt thông báo**:
     - Vào **Hồ sơ** > **Cài đặt thông báo**
     - Bật "Nhận thông báo qua email" và "Thông báo trên trình duyệt"
  2. **Kiểm tra thư điện tử**: 
     - Xem trong thư mục Thư rác
     - Thêm địa chỉ thư hệ thống vào danh sách liên hệ an toàn
  3. **Trình duyệt**: Cho phép trình duyệt gửi thông báo

**Q: Có quá nhiều thông báo, làm sao tắt bớt?**

A:
  1. Vào **Hồ sơ** > **Cài đặt thông báo**
  2. Chọn chỉ nhận thông báo quan trọng (Khẩn cấp và Cao)
  3. Tắt thông báo email cho các loại không cần thiết

### 7.6. Lỗi kỹ thuật

**Q: Trang web báo lỗi 502 Bad Gateway?**

A:
  - Lỗi tạm thời do máy chủ bảo trì hoặc quá tải
  - Đợi 5-10 phút và thử lại
  - Xóa bộ nhớ đệm trình duyệt (Ctrl + Shift + Delete)

**Q: Ảnh đại diện hoặc file đính kèm không upload được?**

A:
  - Kiểm tra kích thước tệp (tối đa 5MB cho ảnh, 10MB cho tệp)
  - Chỉ chấp nhận: JPG, PNG, PDF, DOCX
  - Thử đổi tên tệp (không dấu, không ký tự đặc biệt)
  - Thử trình duyệt khác (Chrome, Firefox, Edge)

**Q: Dữ liệu bị mất sau khi đăng nhập lại?**

A:
  - Không nên dùng chế độ "Duyệt riêng tư" (Chế độ ẩn danh)
  - Xóa bộ nhớ đệm và cookie trình duyệt
  - Đảm bảo luôn nhấn **Lưu** sau khi thay đổi thông tin
  - Lỗi hệ thống
3. Lọc theo: Người dùng, Hành động, Thời gian

---

## 6. CÂU HỎI THƯỜNG GẶP (FAQ)

### 6.1. Đăng nhập và bảo mật

**Q: Tôi quên mật khẩu, làm sao để lấy lại?**

A: 
1. Nhấn **Quên mật khẩu** ở màn hình đăng nhập
2. Nhập email đã đăng ký
3. Kiểm tra email để nhận mã OTP
4. Nhập mã OTP và đặt mật khẩu mới

**Q: Mật khẩu cần đáp ứng yêu cầu gì?**

A: 
- Tối thiểu 6 ký tự
- Nên kết hợp chữ và số
- Không dùng thông tin cá nhân dễ đoán

**Q: Tôi có thể đăng nhập trên nhiều thiết bị không?**

A: Có, hệ thống hỗ trợ đăng nhập đồng thời trên nhiều thiết bị và trình duyệt. Mỗi phiên đăng nhập được theo dõi riêng biệt.

### 6.2. Hoạt động và đăng ký

**Q: Tôi không thấy nút "Đăng ký" cho hoạt động?**

A: Kiểm tra các trường hợp:
- Đã hết hạn đăng ký
- Đã đủ số lượng tối đa
- Bạn không thuộc lớp được phép tham gia
- Hoạt động chưa được duyệt

**Q: Tôi đã đăng ký nhưng bị từ chối, làm sao biết lý do?**

A: Vào **Hoạt động của tôi** > Xem chi tiết đăng ký bị từ chối, lý do sẽ hiển thị ở đó.

**Q: Tôi có thể hủy đăng ký không?**

A: 
- Nếu chưa được duyệt: Có thể hủy
- Nếu đã duyệt: Liên hệ giảng viên để hủy

### 6.3. Điểm danh

**Q: Tôi quét mã QR nhưng báo lỗi "Không hợp lệ"?**

A: Nguyên nhân có thể:
- Bạn chưa được duyệt đăng ký
- Chưa đến giờ điểm danh
- Đã hết giờ điểm danh
- Mã QR không đúng hoặc đã hết hạn

**Q: Tôi quên điểm danh, có thể điểm danh sau không?**

A: Không. Chỉ điểm danh được trong khung giờ diễn ra hoạt động. Liên hệ giảng viên để xử lý đặc biệt.

**Q: Camera không hoạt động khi quét QR?**

A: 
- Cho phép trình duyệt truy cập camera
- Thử trình duyệt khác (Chrome, Edge)
- Dùng chức năng "Nhập mã QR thủ công"

### 6.4. Điểm rèn luyện

**Q: Tôi đã tham gia nhưng chưa thấy điểm?**

A: Điểm sẽ được cập nhật sau khi:
- Giảng viên xác nhận điểm danh
- Hoạt động kết thúc
- Hệ thống tính điểm tự động (chạy mỗi đêm)

**Q: Điểm rèn luyện được tính như thế nào?**

A: 
- Mỗi hoạt động có điểm riêng (do giảng viên/admin đặt)
- Tổng điểm = Tổng điểm các hoạt động đã tham gia
- Điểm tối đa mỗi loại hoạt động có giới hạn

**Q: Tôi nghĩ điểm của tôi bị sai, làm sao?**

A: Liên hệ giảng viên chủ nhiệm hoặc phòng Công tác sinh viên để kiểm tra.

### 6.5. Giảng viên

**Q: Tôi tạo hoạt động nhưng không thấy hiển thị?**

A: Hoạt động cần được admin duyệt trước khi công khai cho sinh viên.

**Q: Làm sao để export danh sách điểm danh?**

A: Vào **Hoạt động** > Chọn hoạt động > **Xuất danh sách** > Chọn Excel hoặc PDF.

**Q: Tôi có thể chỉnh sửa hoạt động đã tạo không?**

A: 
- Nếu chưa duyệt: Có thể sửa tự do
- Nếu đã duyệt: Chỉ sửa được một số trường (liên hệ admin nếu cần sửa nhiều)

---

## 7. XỬ LÝ SỰ CỐ THƯỜNG GẶP

### 7.1. Lỗi đăng nhập

**Lỗi: "Tên đăng nhập hoặc mật khẩu không đúng"**

✅ Giải pháp:
- Kiểm tra lại tên đăng nhập và mật khẩu
- Đảm bảo không có khoảng trắng thừa
- Kiểm tra Caps Lock
- Dùng chức năng "Quên mật khẩu"

**Lỗi: "Tài khoản đã bị khóa"**

✅ Giải pháp:
- Liên hệ admin để mở khóa tài khoản
- Kiểm tra email để biết lý do bị khóa

### 7.2. Lỗi khi đăng ký hoạt động

**Lỗi: "Đã hết hạn đăng ký"**

✅ Giải pháp:
- Liên hệ giảng viên để xin gia hạn
- Tìm hoạt động khác còn hạn

**Lỗi: "Đã đủ số lượng tối đa"**

✅ Giải pháp:
- Theo dõi để xem có ai hủy không
- Đăng ký hoạt động tương tự khác

### 7.3. Lỗi điểm danh QR

**Lỗi: "Mã QR không hợp lệ"**

✅ Giải pháp:
- Yêu cầu giảng viên tạo mã QR mới
- Dùng chức năng nhập mã thủ công

**Lỗi: "Chưa đến giờ điểm danh"**

✅ Giải pháp:
- Đợi đến đúng giờ hoạt động bắt đầu
- Kiểm tra lại thời gian hoạt động

### 7.4. Lỗi hiển thị và giao diện

**Không tải được ảnh hoặc file đính kèm**

✅ Giải pháp:
- Kiểm tra dung lượng file (tối đa 10MB)
- Định dạng file hợp lệ: JPG, PNG, PDF, DOCX
- Thử tải lại sau vài phút

**Giao diện hiển thị lỗi hoặc không đúng**

✅ Giải pháp:
- Xóa cache trình duyệt
- Dùng trình duyệt hiện đại (Chrome, Edge, Firefox)
- Tắt các extension/plugin có thể xung đột


|--------|-----------------------------------------|
| Mã lỗi | Ý nghĩa                                 |
|--------|-----------------------------------------|
| 400    | Dữ liệu đầu vào không hợp lệ            |
|--------|-----------------------------------------|
| 401    | Chưa đăng nhập hoặc token hết hạn       |
|--------|-----------------------------------------|
| 403    | Không có quyền truy cập                 |
|--------|-----------------------------------------|
| 404    | Không tìm thấy dữ liệu                  |
|--------|-----------------------------------------|
| 409    | Dữ liệu bị trùng lặp                    |
|--------|-----------------------------------------|
| 429    | Quá nhiều yêu cầu, vui lòng thử lại sau |
|--------|-----------------------------------------|
| 500    | Lỗi server                              |
|--------|-----------------------------------------|