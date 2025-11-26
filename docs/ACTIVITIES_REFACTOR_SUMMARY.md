# Activities Feature - Cấu trúc sau Refactor

## Tổng quan

Feature `activities` đã được refactor theo Clean Architecture với các cải tiến:

### ✅ Các thay đổi đã thực hiện

## Backend (`backend/src/modules/activities/`)

### 1. Barrel Exports
- ✅ Tạo `business/services/index.js` - Export tất cả Use Cases
- ✅ Tạo `business/dto/index.js` - Export tất cả DTOs

### 2. Repository Improvements
- ✅ `ActivitiesRepository` extends `IActivityRepository` (DIP)
- ✅ Sử dụng `this.prisma` thay vì import trực tiếp
- ✅ Thêm các phương thức cross-module:
  - `findStudentByUserId()` - Tìm sinh viên theo user ID
  - `findRegistrationsByStudent()` - Lấy đăng ký của sinh viên
  - `findStudentsByClass()` - Lấy danh sách sinh viên trong lớp
  - `findClassById()` - Lấy thông tin lớp
  - `countRegistrationsByClass()` - Đếm đăng ký theo lớp

### 3. Use Cases Improvements
- ✅ `GetActivitiesUseCase` - Sử dụng repository thay vì import prisma trực tiếp
- ✅ `RegisterActivityUseCase` - Nhận repository qua constructor (DI)

### 4. New DTOs
- ✅ `UpdateActivityDto` - DTO riêng cho update operation

### Cấu trúc Backend mới:
```
activities/
├── index.js
├── business/
│   ├── dto/
│   │   ├── index.js                 ← NEW
│   │   ├── CreateActivityDto.js
│   │   ├── GetActivitiesDto.js
│   │   └── UpdateActivityDto.js     ← NEW
│   ├── interfaces/
│   │   └── IActivityRepository.js
│   ├── services/
│   │   ├── index.js                 ← NEW
│   │   ├── ApproveActivityUseCase.js
│   │   ├── CancelActivityRegistrationUseCase.js
│   │   ├── CreateActivityUseCase.js
│   │   ├── DeleteActivityUseCase.js
│   │   ├── GetActivitiesUseCase.js  ← UPDATED (no direct prisma)
│   │   ├── GetActivityByIdUseCase.js
│   │   ├── GetActivityDetailsUseCase.js
│   │   ├── GetActivityQRDataUseCase.js
│   │   ├── RegisterActivityUseCase.js ← UPDATED (DI)
│   │   ├── RejectActivityUseCase.js
│   │   ├── ScanAttendanceUseCase.js
│   │   └── UpdateActivityUseCase.js
│   └── validators/
│       └── activities.validators.js
├── data/
│   └── repositories/
│       └── activities.repository.js  ← UPDATED (extends Interface, new methods)
└── presentation/
    ├── activities.factory.js         ← UPDATED (pass repo to RegisterUseCase)
    ├── controllers/
    │   └── ActivitiesController.js
    └── routes/
        └── activities.routes.js
```

---

## Frontend (`frontend/src/features/activities/`)

### 1. New Hooks
- ✅ `useActivities` - Hook quản lý danh sách với filter/pagination
- ✅ `useActivityDetail` - Hook quản lý chi tiết hoạt động
- ✅ `useActivityRegistration` - Hook quản lý đăng ký

### 2. Modular APIs
- ✅ `activityCrudApi` - CRUD operations
- ✅ `activityListApi` - List/filter operations
- ✅ `activityRegistrationApi` - Registration operations
- ✅ `activityAdminApi` - Admin operations
- ✅ `activityTeacherApi` - Teacher operations

### 3. Backward Compatibility
- ✅ `activitiesApi` vẫn được giữ nguyên để không breaking change

### Cấu trúc Frontend mới:
```
activities/
├── index.js                          ← UPDATED
├── model/
│   ├── index.js
│   ├── hooks/
│   │   ├── index.js                  ← UPDATED
│   │   ├── useActivities.js          ← NEW
│   │   ├── useActivityDetail.js      ← NEW
│   │   ├── useActivityRegistration.js ← NEW
│   │   └── useManageActivity.js
│   └── utils/
│       ├── index.js
│       ├── activityFilters.js
│       ├── activityStatus.js
│       ├── activityUiHelpers.js
│       └── activityUtils.js
├── services/
│   ├── index.js                      ← UPDATED
│   ├── activitiesApi.js              (legacy - kept for compatibility)
│   ├── activityAdminApi.js           ← NEW
│   ├── activityCrudApi.js            ← NEW
│   ├── activityListApi.js            ← NEW
│   ├── activityRegistrationApi.js    ← NEW
│   ├── activityTeacherApi.js         ← NEW
│   └── apiErrorHandler.js
└── ui/
    ├── index.js
    ├── pages/
    │   ├── index.js
    │   ├── activity-detail/
    │   ├── class-activities/
    │   └── manage-activity/
    └── shared/
        ├── index.js
        └── ... (components)
```

---

## Cách sử dụng mới

### Backend - Import Use Cases
```javascript
// Before
const GetActivitiesUseCase = require('./business/services/GetActivitiesUseCase');

// After
const { GetActivitiesUseCase, CreateActivityUseCase } = require('./business/services');
```

### Frontend - Import APIs
```javascript
// Legacy (still works)
import { activitiesApi } from '@/features/activities';
activitiesApi.listActivities(params);

// New modular way
import { activityListApi, activityCrudApi } from '@/features/activities';
activityListApi.list(params);
activityCrudApi.create(data);
```

### Frontend - Import Hooks
```javascript
import { useActivities, useActivityDetail, useActivityRegistration } from '@/features/activities';

// In component
const { activities, loading, filters, updateFilters } = useActivities({ mode: 'list' });
const { activity, register, cancelRegistration } = useActivityDetail(activityId);
const { register, cancel, loading } = useActivityRegistration();
```

---

## SOLID Principles Applied

| Principle | Implementation |
|-----------|----------------|
| **S**ingle Responsibility | Mỗi UseCase một nhiệm vụ, APIs tách theo role |
| **O**pen/Closed | Repository methods có thể extend, không cần sửa UseCase |
| **L**iskov Substitution | Repository có thể mock trong tests |
| **I**nterface Segregation | APIs tách nhỏ theo domain (CRUD, List, Registration...) |
| **D**ependency Inversion | UseCase nhận Repository qua constructor (DI) |

---

## Ghi chú

- **Backward Compatible**: Code cũ vẫn hoạt động, không breaking change
- **Type Safety**: DTOs validate input, output normalized
- **Testable**: Dependencies được inject, dễ mock
- **Scalable**: Dễ thêm UseCase/Hook/API mới mà không ảnh hưởng code cũ
