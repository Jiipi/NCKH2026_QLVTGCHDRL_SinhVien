# Hướng dẫn Test tính năng Authentication

## 🎯 Test 1: Toast Notification trong Form Đăng Ký

### Cách test:

1. **Mở trình duyệt:** `http://localhost:3000/register`

2. **Test case: Đăng ký thành công**
   - Điền đầy đủ thông tin hợp lệ:
     - Họ tên: `Nguyễn Văn Test`
     - MSSV: `2021999` (chưa tồn tại)
     - Email: `test999@student.dlu.edu.vn`
     - Mật khẩu: `Test@123`
     - Xác nhận mật khẩu: `Test@123`
     - Chọn khoa và các thông tin khác
   - Click "ĐĂNG KÝ"
   - **Kết quả mong đợi:**
     - ✅ Thấy toast màu **xanh lá** ở góc phải trên màn hình
     - ✅ Tiêu đề: "Đăng ký thành công"
     - ✅ Nội dung: "Tài khoản của bạn đã được tạo thành công! Vui lòng đăng nhập để tiếp tục."
     - ✅ Tự động chuyển đến `/login` sau 1.5 giây
     - ✅ Toast tự động đóng sau 5 giây
     - ❌ KHÔNG thấy alert popup localhost

3. **Test case: Email đã tồn tại**
   - Điền thông tin với email đã có trong DB (VD: `admin@dlu.edu.vn`)
   - Click "ĐĂNG KÝ"
   - **Kết quả mong đợi:**
     - ✅ Toast màu **đỏ** xuất hiện
     - ✅ Tiêu đề: "Đăng ký thất bại"
     - ✅ Nội dung: "Email đã được sử dụng"
     - ✅ Trường email bị đánh dấu đỏ
     - ✅ Toast tự động đóng sau 6 giây

4. **Test case: MSSV đã tồn tại**
   - Điền MSSV: `2021001` (đã có trong DB)
   - Email mới, thông tin khác hợp lệ
   - Click "ĐĂNG KÝ"
   - **Kết quả mong đợi:**
     - ✅ Toast đỏ: "Mã số đã được sử dụng"
     - ✅ Trường MSSV bị đánh dấu đỏ

5. **Test case: Nhiều lỗi cùng lúc**
   - Để trống các trường bắt buộc
   - Click "ĐĂNG KÝ"
   - **Kết quả mong đợi:**
     - ✅ Toast đỏ với danh sách lỗi (ngăn cách bởi dấu phẩy)
     - ✅ Tất cả trường lỗi đều bị đánh dấu đỏ

---

## 🎯 Test 2: Chức năng Ghi nhớ đăng nhập

### Cách test:

1. **Test: Bật "Ghi nhớ đăng nhập"**

   **Bước 1:** Mở trang login
   ```
   http://localhost:3000/login
   ```

   **Bước 2:** Nhập thông tin
   - Username: `2021003` (hoặc `admin`, `gv001`, `lt001`)
   - Password: `Student@123` (hoặc password tương ứng)

   **Bước 3:** ✅ **TICK vào checkbox "Ghi nhớ đăng nhập"**

   **Bước 4:** Click "ĐĂNG NHẬP"

   **Bước 5:** Đăng xuất (hoặc close tab)

   **Bước 6:** Mở lại trang login

   **Kết quả mong đợi:**
   - ✅ Trường Username đã được điền sẵn: `2021003`
   - ✅ Checkbox vẫn được tick
   - ✅ Chỉ cần nhập lại password để login

2. **Test: TẮT "Ghi nhớ đăng nhập"**

   **Bước 1:** Mở trang login

   **Bước 2:** Nhập thông tin đăng nhập

   **Bước 3:** ❌ **KHÔNG tick checkbox**

   **Bước 4:** Đăng nhập thành công

   **Bước 5:** Đăng xuất

   **Bước 6:** Mở lại trang login

   **Kết quả mong đợi:**
   - ✅ Trường Username **trống**
   - ✅ Checkbox **không được tick**
   - ✅ Phải nhập lại toàn bộ thông tin

3. **Test: Kiểm tra JWT token expiry time**

   **Bước 1:** Đăng nhập với checkbox **TICK** (remember = true)

   **Bước 2:** Mở Developer Tools (F12) → Console

   **Bước 3:** Chạy đoạn code sau:
   ```javascript
   const token = localStorage.getItem('token');
   if (token) {
     const payload = JSON.parse(atob(token.split('.')[1]));
     const exp = new Date(payload.exp * 1000);
     const now = new Date();
     const daysRemaining = (payload.exp * 1000 - now.getTime()) / (1000 * 60 * 60 * 24);
     
     console.log('Token issued at:', new Date(payload.iat * 1000));
     console.log('Token expires at:', exp);
     console.log('Days until expiry:', Math.round(daysRemaining * 10) / 10);
   }
   ```

   **Kết quả mong đợi:**
   - ✅ Days until expiry: **~30 ngày**

   **Bước 4:** Đăng xuất, đăng nhập lại với checkbox **KHÔNG TICK**

   **Bước 5:** Chạy lại đoạn code trên

   **Kết quả mong đợi:**
   - ✅ Days until expiry: **~1 ngày**

4. **Test: Kiểm tra localStorage**

   **Mở Developer Tools → Application/Storage → Local Storage**

   **Sau khi đăng nhập với "Ghi nhớ" = true:**
   ```
   ✅ remember_username: "2021003"
   ✅ remember_flag: "1"
   ✅ token: "eyJhbGciOiJIUzI1NiIsInR5cCI..."
   ✅ user: "{\"id\":\"...\",\"name\":\"...\"...}"
   ```

   **Sau khi đăng nhập với "Ghi nhớ" = false:**
   ```
   ❌ remember_username: (không tồn tại)
   ❌ remember_flag: (không tồn tại)
   ✅ token: "eyJhbGciOiJIUzI1NiIsInR5cCI..."
   ✅ user: "{\"id\":\"...\",\"name\":\"...\"...}"
   ```

---

## 🔍 Kiểm tra Network Request

### 1. Form Đăng Ký

**Mở DevTools → Network tab**

**Request:**
```
POST http://localhost:5000/api/auth/register
```

**Request Body:**
```json
{
  "name": "Nguyễn Văn Test",
  "maso": "2021999",
  "email": "test999@student.dlu.edu.vn",
  "password": "Test@123",
  "confirmPassword": "Test@123",
  "khoa": "Công nghệ thông tin",
  "ngaySinh": "2003-01-01",
  ...
}
```

**Response thành công (200):**
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "name": "Nguyễn Văn Test",
      "maso": "2021999",
      "email": "test999@student.dlu.edu.vn",
      "role": "SINH_VIEN"
    }
  }
}
```

**Response lỗi (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email đã được sử dụng"
    }
  ]
}
```

### 2. Đăng nhập với Remember Me

**Request:**
```
POST http://localhost:5000/api/auth/login
```

**Request Body (Remember = true):**
```json
{
  "maso": "2021003",
  "password": "Student@123",
  "remember": true
}
```

**Request Body (Remember = false):**
```json
{
  "maso": "2021003",
  "password": "Student@123",
  "remember": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "name": "Sinh Viên Test",
      "maso": "2021003",
      "email": "student@dlu.edu.vn",
      "role": "SINH_VIEN"
    }
  }
}
```

---

## 📸 Screenshots cần chụp

1. **Toast Success (màu xanh)** - Đăng ký thành công
2. **Toast Error (màu đỏ)** - Email đã tồn tại
3. **Form lỗi** - Các trường bị đánh dấu đỏ
4. **Checkbox "Ghi nhớ đăng nhập"** - Được tick
5. **localStorage** - Hiển thị remember_username và remember_flag
6. **Console log** - Token expiry time comparison (30 days vs 1 day)

---

## ✅ Checklist

### Form Đăng Ký
- [ ] Toast notification xuất hiện (không còn alert popup)
- [ ] Toast màu xanh khi thành công
- [ ] Toast màu đỏ khi có lỗi
- [ ] Toast tự động đóng sau 5-6 giây
- [ ] Có thể đóng toast bằng nút X
- [ ] Toast có animation mượt mà
- [ ] Chuyển trang sau 1.5s khi thành công
- [ ] Hiển thị đúng lỗi từ backend (email trùng, MSSV trùng)

### Ghi nhớ đăng nhập
- [ ] Checkbox hiển thị và có thể tick/untick
- [ ] Username được lưu khi tick checkbox
- [ ] Username tự động điền khi mở lại trang
- [ ] Username bị xóa khi không tick checkbox
- [ ] Token expires 30 ngày khi remember = true
- [ ] Token expires 1 ngày khi remember = false
- [ ] localStorage chứa remember_username và remember_flag đúng
- [ ] Không lưu password vào localStorage (bảo mật)

---

## 🐛 Troubleshooting

### Vấn đề 1: Toast không hiển thị

**Nguyên nhân:** NotificationProvider chưa được wrap App

**Giải pháp:** Kiểm tra `App.js`:
```javascript
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  return (
    <NotificationProvider>
      {/* App content */}
    </NotificationProvider>
  );
}
```

### Vấn đề 2: Username không được lưu

**Nguyên nhân:** localStorage bị chặn hoặc browser ở chế độ incognito

**Giải pháp:** 
- Tắt chế độ incognito
- Kiểm tra browser settings cho phép localStorage

### Vấn đề 3: Token expires time không đúng

**Nguyên nhân:** Backend config chưa đúng

**Giải pháp:** Kiểm tra `.env`:
```env
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
JWT_EXPIRES_IN_REMEMBER=30d
```

