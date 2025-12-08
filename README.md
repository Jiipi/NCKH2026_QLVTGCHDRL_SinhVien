# HỆ THỐNG QUẢN LÝ ĐIỂM RÈN LUYỆN

Đây là mã nguồn của **Đồ án Chuyên ngành: Web Quản lý việc tham gia các hoạt động rèn luyện của sinh viên**.
Hệ thống giúp quản lý toàn diện quy trình tổ chức hoạt động, sinh viên đăng ký, điểm danh và chấm điểm rèn luyện tự động.

---

## 🚀 Yêu cầu hệ thống

Trước khi cài đặt, vui lòng đảm bảo máy tính đã cài đặt:
1.  **Node.js** (v18 trở lên): [Tải tại đây](https://nodejs.org/)
2.  **Docker Desktop** (để chạy Database & Backend): [Tải tại đây](https://www.docker.com/products/docker-desktop/)

---

## 📦 Hướng dẫn cài đặt & Chạy dự án

Dự án đã được tích hợp script tự động hóa hoàn toàn. Chỉ cần thực hiện:

1.  **Clone source code** về máy. "git clone https://github.com/Jiipi/QL_DH_RenLuyen.git"
2.  Mở thư mục dự án trong Visual Studio Code. Chọn menu Terminal > New Terminal.
3.  Chạy file **`setup.bat`** bằng cách nhập lệnh sau vào terminal:
    ```
    .\setup.bat
    ```
    (Hoặc có thể click đúp chuột vào file `setup.bat` trong thư mục)

Script sẽ tự động thực hiện:
*   Kiểm tra môi trường (Node, Docker, npm).
*   Cài đặt các thư viện cần thiết.
*   Khởi động Docker containers (Database, Redis, Backend, Frontend).
*   **(Tùy chọn)** Khởi tạo dữ liệu mẫu (Seeding) để bạn có ngay dữ liệu để test.

---

## 🔑 Thông tin đăng nhập (Môi trường Dev/Test)

Sau khi chạy Setup và chọn "Khởi tạo dữ liệu mẫu", bạn có thể sử dụng các tài khoản sau:

| Vai trò | Tài khoản (Username) | Mật khẩu | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `Admin` | `123456` | Quản lý toàn bộ hệ thống |
| **Giảng viên** | `gv0404` | `123456` | Quản lý lớp, duyệt điểm |
| **Lớp trưởng** | `2140401` | `123456` | Điểm danh, quản lý lớp |
| **Sinh viên** | `2140402` | `123456` | Đăng ký, xem điểm |

---

## 🌐 Truy cập dịch vụ

*   **Frontend (Web App):** [http://localhost:3000](http://localhost:3000)
*   **Backend API:** [http://localhost:3001](http://localhost:3001)
*   **Quản lý Database (Prisma Studio):** [http://localhost:5555](http://localhost:5555)
*   **Xem Logs hệ thống:** [http://localhost:9999](http://localhost:9999)

---

## 📞 Thông tin liên hệ nhóm tác giả

Mọi thắc mắc về cài đặt, vận hành hoặc báo lỗi, vui lòng liên hệ nhóm phát triển:

**Nhóm thực hiện:**
1. 2212377 - Trần Ngọc Hưng
	- Email: 2212377@dlu.edu.vn
	- Số điện thoại: 0387892787

2. 2212391 - Nguyễn Hoàng Nam Khánh
	- Email: 2212391@dlu.edu.vn
	- Số điện thoại: 0328405706
	
3. 2212391 - Trần Vũ Thành Luân
	- Email: 2212410@dlu.edu.vn
	- Số điện thoại: 0325535167