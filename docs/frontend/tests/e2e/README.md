# E2E Test Suite - Regression Tests

Bộ test hồi quy E2E cho hệ thống quản lý hoạt động rèn luyện sinh viên, kiểm tra login, register, forgot password và các luồng chính theo role.

## 📦 Cài đặt

```bash
cd frontend
npm ci
npx playwright install --with-deps
```

## 🚀 Chạy tests

### Chạy toàn bộ
```bash
npm run e2e
```

### Chạy theo phần
```bash
# Login tests
npx playwright test tests/e2e/login.spec.ts

# Register tests
npx playwright test tests/e2e/register.spec.ts

# Forgot password tests
npx playwright test tests/e2e/forgot-password.spec.ts

# Role-based tests
npx playwright test tests/e2e/roles.admin.spec.ts
npx playwright test tests/e2e/roles.giang_vien.spec.ts
npx playwright test tests/e2e/roles.lop_truong.spec.ts
npx playwright test tests/e2e/roles.sinh_vien.spec.ts
```

### Chế độ debug
```bash
# Headed mode (xem browser)
npm run e2e:headed

# Debug mode
npx playwright test --debug

# Trace viewer (sau khi test fail)
npx playwright show-trace test-results/<path>/trace.zip
```

## 📊 Xem báo cáo

```bash
npm run e2e:report
# hoặc
npx playwright show-report
```

## 🧪 Test Coverage

### Auth Tests
- **Login** (`login.spec.ts`):
  - UI login happy path (student)
  - Remember me functionality
  - Invalid credentials error handling
  - Redirect by role (ADMIN, GIANG_VIEN, LOP_TRUONG, SINH_VIEN)

- **Register** (`register.spec.ts`):
  - Required field validations
  - Khoa filters Lop options
  - Successful registration with optional fields

- **Forgot Password** (`forgot-password.spec.ts`):
  - Empty submit validation
  - Success message display

### Role-based Tests
- **ADMIN** (`roles.admin.spec.ts`):
  - Approvals page access
  - Semester filter functionality

- **GIANG_VIEN** (`roles.giang_vien.spec.ts`):
  - Teacher activities page
  - Semester filtering

- **LOP_TRUONG** (`roles.lop_truong.spec.ts`):
  - Monitor activities page
  - Approval actions smoke test

- **SINH_VIEN** (`roles.sinh_vien.spec.ts`):
  - Student activities page
  - Semester selection and listing

## 🔧 Cấu hình

### Environment Variables
```bash
# Base URL của frontend (mặc định: http://localhost:3000)
E2E_BASE_URL=http://localhost:3000

# API URL (nếu khác proxy, mặc định dùng /api từ frontend)
E2E_API_URL=http://localhost:3001/api
```

### Playwright Config
- **Timeout**: 60s per test
- **Expect timeout**: 7s
- **Retry**: 1 lần khi fail (trong CI)
- **Video**: Chỉ lưu khi fail
- **Screenshot**: Chỉ lưu khi fail
- **Trace**: Chỉ lưu khi retry

## 🏗️ Cấu trúc

```
tests/
├── e2e/
│   ├── authHelper.ts          # Helper login/auth cho tests
│   ├── login.spec.ts          # Login regression tests
│   ├── register.spec.ts       # Register regression tests
│   ├── forgot-password.spec.ts # Forgot password tests
│   ├── roles.admin.spec.ts    # ADMIN role tests
│   ├── roles.giang_vien.spec.ts # GIANG_VIEN role tests
│   ├── roles.lop_truong.spec.ts # LOP_TRUONG role tests
│   ├── roles.sinh_vien.spec.ts  # SINH_VIEN role tests
│   ├── session.spec.ts        # Multi-tab session tests
│   ├── tamper.spec.ts         # Security tampering tests
│   ├── logout-all.spec.ts     # Logout broadcast tests
│   └── semester-dropdown-sync.spec.ts # Semester sync tests
└── README.md                  # Tài liệu này
```

## 💡 Lưu ý

- **Demo accounts**: Helper tự động thử các mật khẩu: `123456`, `Admin@123`, `Teacher@123`, `Monitor@123`, `Student@123`
- **Seed data**: Chạy `docker exec dacn_backend_dev node /app/scripts/add_demo_users.js` để seed tài khoản demo nếu cần
- **Docker dev**: Đảm bảo containers `dacn_frontend_dev` và `dacn_backend_dev` đang chạy
- **Network**: Test gọi API qua proxy `/api` của frontend để tương thích môi trường Docker

## 🐛 Troubleshooting

### Lỗi 401 khi login
```bash
# Seed lại demo users
docker exec dacn_backend_dev node /app/scripts/add_demo_users.js
```

### Timeout khi load page
```bash
# Kiểm tra dev containers
docker ps | grep dacn

# Restart nếu cần
docker compose --profile dev up -d
```

### Flaky tests
- Tăng timeout cho test cụ thể: `test.setTimeout(90000)`
- Kiểm tra network latency
- Xem video/trace để debug

## 📝 Best Practices

1. **Isolation**: Mỗi test độc lập, không phụ thuộc state của test khác
2. **Fast feedback**: Dùng `programmaticLogin` thay vì UI login cho role tests
3. **Deterministic**: Seed data cố định, tránh random data gây flake
4. **Readable**: Tên test mô tả rõ kịch bản
5. **Maintainable**: Dùng helper/fixture tái sử dụng

## 🔄 CI/CD Integration

```yaml
# .github/workflows/e2e.yml (example)
- name: Run E2E Tests
  run: |
    cd frontend
    npm ci
    npx playwright install --with-deps
    npm run e2e
  env:
    E2E_BASE_URL: http://localhost:3000
```
