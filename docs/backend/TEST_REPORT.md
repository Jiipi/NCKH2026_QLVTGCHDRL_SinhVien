# 📋 BÁO CÁO TEST SUITE - HỆ THỐNG QUẢN LÝ HOẠT ĐỘNG RÈN LUYỆN

## Ngày tạo: 26/11/2025
## Phiên bản: 1.0.0

---

## 📊 TỔNG QUAN TEST SUITE

### Thông tin kỹ thuật
| Thông số | Giá trị |
|----------|---------|
| Testing Framework | Jest v30.2.0 |
| HTTP Testing | Supertest v7.1.4 |
| Database | PostgreSQL + Prisma ORM |
| Authentication | JWT Bearer Token |
| Test Timeout | 30000ms |

### Cấu trúc thư mục Tests
```
backend/tests/
├── setup.js                 # Global setup (env vars, timeout)
├── teardown.js              # Global teardown (DB disconnect)
├── helpers/
│   ├── authHelper.js        # JWT generation, user creation
│   └── dbHelper.js          # DB cleanup, test data seeding
└── integration/
    ├── auth/
    │   ├── login.test.js    # TC-AUTH-001 to TC-AUTH-006 ✅
    │   └── me.test.js       # TC-AUTH-011 (needs fixes)
    ├── activities/
    │   └── activities.test.js  # TC-ACT-001 to TC-ACT-013
    ├── registrations/
    │   └── registrations.test.js # TC-REG-001 to TC-REG-012
    ├── attendance/
    │   └── attendance.test.js    # TC-ATT-001 to TC-ATT-007
    ├── approval/
    │   └── approval.test.js      # TC-APP-001 to TC-APP-006
    ├── users/
    │   └── profile.test.js       # TC-USR-001 to TC-USR-008
    ├── reports/
    │   └── statistics.test.js    # TC-RPT-001 to TC-RPT-006
    ├── semesters/
    │   └── semesters.test.js     # TC-SEM-001 to TC-SEM-002
    ├── notifications/
    │   └── notifications.test.js # TC-NTF-001 to TC-NTF-003
    └── search/
        └── search.test.js        # Search functionality
```

---

## ✅ KẾT QUẢ TEST LOGIN MODULE

### Tổng quan
- **Test Suites**: 1 passed
- **Tests**: 10/10 passed (100%)
- **Thời gian**: ~8 seconds

### Chi tiết Test Cases

| Test ID | Mô tả | Kết quả | Thời gian |
|---------|-------|---------|-----------|
| TC-AUTH-001a | Đăng nhập thành công với credentials hợp lệ | ✅ PASS | 376ms |
| TC-AUTH-001b | Response chứa redirect path | ✅ PASS | 265ms |
| TC-AUTH-002 | Sai mật khẩu → 401 | ✅ PASS | 221ms |
| TC-AUTH-003 | Tài khoản không tồn tại → 401 | ✅ PASS | 90ms |
| TC-AUTH-004 | Tài khoản bị khóa → 403 | ✅ PASS | 159ms |
| TC-AUTH-005 | Thiếu username → 400 | ✅ PASS | 37ms |
| TC-AUTH-006 | Thiếu password → 400 | ✅ PASS | 40ms |
| Additional-1 | Empty request body → 400 | ✅ PASS | 38ms |
| Additional-2 | Special characters in username | ✅ PASS | 72ms |
| Additional-3 | Very long input handling | ✅ PASS | 138ms |

### API Request/Response Format

**Login Request:**
```json
POST /api/auth/login
{
  "maso": "username_or_student_id",
  "password": "user_password"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "maso": "username",
      "email": "user@dlu.edu.vn",
      "ho_ten": "Họ Tên",
      "roleCode": "SINH_VIEN",
      "roleName": "Sinh viên",
      "status": "hoat_dong"
    }
  }
}
```

**Error Response (401/400):**
```json
{
  "success": false,
  "message": "Mã số hoặc mật khẩu không đúng"
}
```

---

## 📝 DANH SÁCH TEST CASES ĐÃ TẠO

### Module Authentication (11 test cases)
| ID | Mô tả | File |
|----|-------|------|
| TC-AUTH-001 | Đăng nhập thành công | login.test.js |
| TC-AUTH-002 | Đăng nhập thất bại - Sai mật khẩu | login.test.js |
| TC-AUTH-003 | Đăng nhập thất bại - Tài khoản không tồn tại | login.test.js |
| TC-AUTH-004 | Đăng nhập thất bại - Tài khoản bị khóa | login.test.js |
| TC-AUTH-005 | Validation - Thiếu username | login.test.js |
| TC-AUTH-006 | Validation - Thiếu password | login.test.js |
| TC-AUTH-011 | Lấy thông tin user hiện tại (GET /me) | me.test.js |

### Module Activities (13 test cases)
| ID | Mô tả | File |
|----|-------|------|
| TC-ACT-001 | Lấy danh sách hoạt động | activities.test.js |
| TC-ACT-002 | Filter hoạt động theo trạng thái | activities.test.js |
| TC-ACT-003 | Filter hoạt động theo học kỳ | activities.test.js |
| TC-ACT-004 | Tìm kiếm hoạt động theo tên | activities.test.js |
| TC-ACT-005 | Phân trang danh sách hoạt động | activities.test.js |
| TC-ACT-006 | Xem chi tiết hoạt động | activities.test.js |
| TC-ACT-007 | Tạo hoạt động mới (Admin) | activities.test.js |
| TC-ACT-008 | Cập nhật hoạt động (Admin) | activities.test.js |
| TC-ACT-009 | Xóa hoạt động (Admin) | activities.test.js |
| TC-ACT-010 | Duyệt hoạt động (Admin) | activities.test.js |
| TC-ACT-011 | Từ chối hoạt động (Admin) | activities.test.js |
| TC-ACT-012 | Tạo hoạt động - Permission denied (Student) | activities.test.js |
| TC-ACT-013 | Unauthorized access | activities.test.js |

### Module Registrations (12 test cases)
| ID | Mô tả | File |
|----|-------|------|
| TC-REG-001 | Đăng ký hoạt động | registrations.test.js |
| TC-REG-002 | Đăng ký trùng lặp | registrations.test.js |
| TC-REG-003 | Đăng ký đã quá hạn | registrations.test.js |
| TC-REG-004 | Đăng ký hoạt động đã hết slot | registrations.test.js |
| TC-REG-005 | Hủy đăng ký | registrations.test.js |
| TC-REG-006 | Lấy danh sách đăng ký | registrations.test.js |
| TC-REG-007 | Filter đăng ký theo trạng thái | registrations.test.js |
| TC-REG-008 | Xem chi tiết đăng ký | registrations.test.js |
| TC-REG-009 | Duyệt đăng ký (Admin) | registrations.test.js |
| TC-REG-010 | Từ chối đăng ký (Admin) | registrations.test.js |
| TC-REG-011 | Duyệt hàng loạt (Admin) | registrations.test.js |
| TC-REG-012 | Unauthorized access | registrations.test.js |

### Module Attendance (7 test cases)
| ID | Mô tả | File |
|----|-------|------|
| TC-ATT-001 | Tạo mã QR điểm danh | attendance.test.js |
| TC-ATT-002 | Điểm danh bằng mã QR | attendance.test.js |
| TC-ATT-003 | Xem danh sách điểm danh | attendance.test.js |
| TC-ATT-004 | Điểm danh thủ công | attendance.test.js |
| TC-ATT-005 | Điểm danh hàng loạt | attendance.test.js |
| TC-ATT-006 | Kiểm tra trạng thái điểm danh | attendance.test.js |
| TC-ATT-007 | Lịch sử điểm danh cá nhân | attendance.test.js |

### Module Approval (6 test cases)
| ID | Mô tả | File |
|----|-------|------|
| TC-APP-001 | Xem danh sách chờ duyệt | approval.test.js |
| TC-APP-002 | Duyệt đăng ký | approval.test.js |
| TC-APP-003 | Từ chối đăng ký | approval.test.js |
| TC-APP-004 | Duyệt hàng loạt | approval.test.js |
| TC-APP-005 | Từ chối hàng loạt | approval.test.js |
| TC-APP-006 | Lớp trưởng duyệt sinh viên lớp | approval.test.js |

### Module Users/Profile (8 test cases)
| ID | Mô tả | File |
|----|-------|------|
| TC-USR-001 | Xem thông tin profile | profile.test.js |
| TC-USR-002 | Cập nhật profile | profile.test.js |
| TC-USR-004 | Admin lấy danh sách người dùng | profile.test.js |
| TC-USR-007 | Permission - SV không xem users list | profile.test.js |
| TC-USR-008 | Kiểm tra trạng thái lớp trưởng | profile.test.js |

### Module Reports/Statistics (6 test cases)
| ID | Mô tả | File |
|----|-------|------|
| TC-RPT-001 | Dashboard statistics | statistics.test.js |
| TC-RPT-002 | Thống kê theo lớp | statistics.test.js |
| TC-RPT-003 | Thống kê cá nhân | statistics.test.js |
| TC-RPT-004 | Xuất báo cáo Excel | statistics.test.js |
| TC-RPT-005 | Thống kê theo khoảng thời gian | statistics.test.js |
| TC-RPT-006 | Báo cáo đăng ký theo hoạt động | statistics.test.js |

### Module Semesters (2 test cases)
| ID | Mô tả | File |
|----|-------|------|
| TC-SEM-001 | Lấy danh sách học kỳ | semesters.test.js |
| TC-SEM-002 | Lấy học kỳ hiện tại | semesters.test.js |

### Module Notifications (3 test cases)
| ID | Mô tả | File |
|----|-------|------|
| TC-NTF-001 | Lấy danh sách thông báo | notifications.test.js |
| TC-NTF-002 | Đánh dấu đã đọc | notifications.test.js |
| TC-NTF-003 | Gửi thông báo (Admin) | notifications.test.js |

---

## 🔧 HELPER FUNCTIONS

### authHelper.js
```javascript
// Token generation
generateToken(user, options)      // Generate valid JWT
generateExpiredToken(user)        // Generate expired JWT
generateInvalidToken()            // Generate malformed JWT

// User creation
createStudentUser(data)           // Create test student
createTeacherUser(data)           // Create test teacher
createAdminUser(data)             // Create test admin
createMonitorUser(data)           // Create test monitor (lớp trưởng)
createLockedUser(data)            // Create locked/disabled user

// Password utilities
hashPassword(password)            // Hash password
verifyPassword(plain, hashed)     // Verify password
```

### dbHelper.js
```javascript
cleanupTestData()                 // Cleanup all test data
createTestActivity(data)          // Create test activity
createTestRegistration(svId, hdId) // Create test registration
createTestAttendance(svId, hdId)  // Create test attendance
createTestNotification(from, to)  // Create test notification
seedTestData()                    // Seed basic test data
disconnectPrisma()                // Disconnect Prisma client
```

---

## 📈 METRICS & COVERAGE

### Test Metrics Summary
| Metric | Value |
|--------|-------|
| Total Test Files | 12 |
| Total Test Cases | ~80+ |
| Modules Covered | 10 |
| Login Tests Passing | 10/10 (100%) |

### Modules với Test Coverage
1. ✅ Authentication (Login) - 100% tests passing
2. 🔄 Authentication (Me) - Needs API endpoint fixes
3. 🔄 Activities - Schema alignment needed
4. 🔄 Registrations - Schema alignment needed
5. 🔄 Attendance - Schema alignment needed
6. 🔄 Approval - Schema alignment needed
7. 🔄 Users/Profile - API path verification needed
8. 🔄 Reports - API path verification needed
9. 🔄 Semesters - Basic tests ready
10. 🔄 Notifications - Schema verification needed

---

## 🛠️ NHỮNG VẤN ĐỀ CẦN XỬ LÝ

### 1. Schema Prisma không khớp với test helpers
- **Vấn đề**: Field names trong Prisma schema khác với hardcoded values
- **Ví dụ**: `diem_rl_toi_da` vs `diem_toi_da`, `sv` vs `sinh_vien`
- **Giải pháp**: Update dbHelper.js theo đúng schema

### 2. API Endpoint paths
- **Vấn đề**: Một số API paths cần verify
- **Ví dụ**: `/api/core/profile` có thể là `/api/auth/me`
- **Giải pháp**: Map lại routes từ actual implementation

### 3. Request/Response format
- **Vấn đề**: API response wrapped trong `{ success, data, message }`
- **Đã fix**: Login tests đã cập nhật đúng format

---

## 🚀 HƯỚNG DẪN CHẠY TESTS

### Chạy tất cả tests
```bash
cd backend
npm test
```

### Chạy test cụ thể
```bash
# Chạy login tests
npm test -- --testPathPatterns="tests/integration/auth/login"

# Chạy activities tests  
npm test -- --testPathPatterns="tests/integration/activities"

# Chạy với verbose output
npm test -- --verbose --detectOpenHandles --forceExit
```

### Debug tests
```bash
# Node inspect mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

## 📝 KẾT LUẬN

### Đã hoàn thành:
1. ✅ Tạo 12 file test cho 10 modules
2. ✅ Tạo 2 helper files (authHelper.js, dbHelper.js)
3. ✅ Setup Jest configuration (setup.js, teardown.js)
4. ✅ 10/10 login tests PASS (100%)
5. ✅ Fix teardown.js import paths
6. ✅ Verify API response format

### Cần tiếp tục:
1. 🔄 Align test helpers với Prisma schema
2. 🔄 Verify và fix API endpoint paths cho các modules khác
3. 🔄 Chạy và fix lỗi cho từng module test
4. 🔄 Tăng test coverage

---

*Báo cáo được tạo tự động bởi Test Runner*
*Version: 1.0.0 | Date: 26/11/2025*
