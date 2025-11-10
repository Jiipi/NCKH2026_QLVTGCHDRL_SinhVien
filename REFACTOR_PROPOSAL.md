# 🏗️ ĐỀ XUẤT TÁI CẤU TRÚC DỰ ÁN - GIẢM 60-70% CODE

## 📋 Tóm tắt vấn đề

Dự án hiện tại có **các file quá lớn (1000-1800 dòng)** với **code lặp lại nhiều** giữa các role (Admin, Teacher, Monitor, Student). Logic nghiệp vụ nằm rải rác trong routes, controllers, và components.

### Số liệu thực tế:
- **Backend:** 
  - `teacher.route.js`: 1835 dòng
  - `activities.route.js`: 1514 dòng
  - `admin.controller.js`: 1367 dòng
  
- **Frontend:**
  - `ClassActivities.js`: 1885 dòng
  - `AdminUsers.js`: 1388 dòng
  - `MyActivitiesModern.js`: 1158 dòng

---

## 🎯 MỤC TIÊU CẢI TIẾN

1. ✅ **Giảm code lặp 60-70%** bằng CRUD Factory pattern
2. ✅ **Tách biệt concerns:** Controller → Service → Repository
3. ✅ **Tập trung phân quyền:** RBAC + Scope middleware thống nhất
4. ✅ **Reusable Frontend:** Generic components + hooks cho tất cả role
5. ✅ **Không breaking changes:** Tương thích ngược với API hiện tại

---

## 🏗️ KIẾN TRÚC MỚI - BACKEND

### 1. Cấu trúc thư mục mới

```
backend/src/
├── shared/                        # Core utilities (dùng chung)
│   ├── policies/
│   │   ├── index.js              # Ma trận quyền cho tất cả resources
│   │   └── permissions.js        # Permission constants
│   ├── scopes/
│   │   ├── scopeBuilder.js       # Build where clause theo role
│   │   └── scopeMiddleware.js    # Apply scope tự động
│   ├── factories/
│   │   ├── crudRouter.js         # Factory tạo CRUD router
│   │   └── crudService.js        # Factory tạo CRUD service
│   ├── validators/
│   │   └── schemas.js            # Validation schemas (Zod/Joi)
│   └── errors/
│       └── AppError.js           # Custom error classes
│
├── modules/                       # Feature modules
│   ├── activities/
│   │   ├── activities.schema.js  # Validation schemas
│   │   ├── activities.repo.js    # Data access layer (Prisma)
│   │   ├── activities.service.js # Business logic
│   │   └── activities.routes.js  # Routes (thin, chỉ khai báo)
│   │
│   ├── registrations/
│   │   ├── registrations.schema.js
│   │   ├── registrations.repo.js
│   │   ├── registrations.service.js
│   │   └── registrations.routes.js
│   │
│   ├── classes/
│   ├── users/
│   └── reports/
│
└── middlewares/
    ├── auth.js                    # Authentication
    ├── rbac.js                    # Permission checking (cải tiến)
    └── scope.js                   # Scope enforcement (NEW)
```

### 2. Policy System - Tập trung phân quyền

**File: `shared/policies/index.js`**

```javascript
// Ma trận quyền rõ ràng, dễ bảo trì
const POLICIES = {
  activities: {
    read: ['ADMIN', 'GIANG_VIEN', 'LOP_TRUONG', 'SINH_VIEN'],
    create: ['ADMIN', 'GIANG_VIEN', 'LOP_TRUONG'],
    update: ['ADMIN', 'GIANG_VIEN', 'LOP_TRUONG'], // + owner check
    delete: ['ADMIN', 'GIANG_VIEN'], // + owner check
    approve: ['ADMIN', 'GIANG_VIEN'],
    reject: ['ADMIN', 'GIANG_VIEN']
  },
  
  registrations: {
    read: ['ADMIN', 'GIANG_VIEN', 'LOP_TRUONG'],
    create: ['SINH_VIEN', 'LOP_TRUONG'], // Đăng ký hoạt động
    approve: ['ADMIN', 'GIANG_VIEN', 'LOP_TRUONG'],
    reject: ['ADMIN', 'GIANG_VIEN', 'LOP_TRUONG'],
    cancel: ['SINH_VIEN', 'LOP_TRUONG'] // + owner check
  },
  
  users: {
    read: ['ADMIN'],
    create: ['ADMIN'],
    update: ['ADMIN'],
    delete: ['ADMIN'],
    updateOwn: ['ADMIN', 'GIANG_VIEN', 'LOP_TRUONG', 'SINH_VIEN']
  }
};

module.exports = { POLICIES };
```

### 3. Scope Builder - Tự động filter theo lớp

**File: `shared/scopes/scopeBuilder.js`**

```javascript
const { prisma } = require('../../config/database');

/**
 * Build WHERE clause dựa trên role và userId
 * Đảm bảo user chỉ thấy data thuộc phạm vi của mình
 */
async function buildScope(resource, user) {
  const { role, sub: userId } = user;
  
  switch (role) {
    case 'ADMIN':
      // Admin thấy tất cả
      return {};
    
    case 'GIANG_VIEN':
      // Teacher chỉ thấy data của các lớp mình phụ trách
      const teacherClasses = await prisma.lop.findMany({
        where: { chu_nhiem: userId },
        select: { id: true }
      });
      const classIds = teacherClasses.map(c => c.id);
      
      if (resource === 'activities' || resource === 'registrations') {
        return { lop_id: { in: classIds } };
      }
      return {};
    
    case 'LOP_TRUONG':
    case 'SINH_VIEN':
      // Student/Monitor chỉ thấy data của lớp mình
      const student = await prisma.sinhVien.findUnique({
        where: { nguoi_dung_id: userId },
        select: { lop_id: true }
      });
      
      if (!student?.lop_id) return { id: -1 }; // Không có lớp → không thấy gì
      
      if (resource === 'activities' || resource === 'registrations') {
        return { lop_id: student.lop_id };
      }
      return {};
    
    default:
      return { id: -1 }; // Unknown role → deny all
  }
}

module.exports = { buildScope };
```

### 4. CRUD Factory - Giảm 70% code lặp

**File: `shared/factories/crudRouter.js`**

```javascript
const { Router } = require('express');
const { requirePermission } = require('../../middlewares/rbac');
const { applyScope } = require('../../middlewares/scope');

/**
 * Factory tạo CRUD router cho bất kỳ resource nào
 * Tự động apply: auth, permission, scope
 */
function createCRUDRouter(config) {
  const {
    resource,           // 'activities', 'users', 'classes'
    service,            // Service instance
    permissions,        // { list, create, update, delete }
    validate           // Validation schemas
  } = config;
  
  const router = Router();
  
  // LIST - Tự động apply scope
  router.get('/',
    requirePermission(permissions.list),
    applyScope(resource),
    async (req, res, next) => {
      try {
        const { page = 1, limit = 20, ...filters } = req.query;
        const scope = req.scope; // Đã được inject bởi applyScope middleware
        
        const result = await service.list({ 
          ...filters, 
          ...scope,
          page: parseInt(page), 
          limit: parseInt(limit) 
        });
        
        res.json({ success: true, data: result });
      } catch (error) {
        next(error);
      }
    }
  );
  
  // GET BY ID - Check scope ownership
  router.get('/:id',
    requirePermission(permissions.list),
    applyScope(resource),
    async (req, res, next) => {
      try {
        const item = await service.getById(req.params.id, req.scope);
        if (!item) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
        res.json({ success: true, data: item });
      } catch (error) {
        next(error);
      }
    }
  );
  
  // CREATE - Tự động ép lopId theo scope
  router.post('/',
    requirePermission(permissions.create),
    validate?.create,
    applyScope(resource),
    async (req, res, next) => {
      try {
        const data = req.body;
        
        // Nếu không phải Admin, ép lopId theo scope
        if (req.user.role !== 'ADMIN' && req.scope.lop_id) {
          data.lop_id = req.scope.lop_id;
        }
        
        const created = await service.create(data, req.user);
        res.status(201).json({ success: true, data: created });
      } catch (error) {
        next(error);
      }
    }
  );
  
  // UPDATE - Check ownership
  router.put('/:id',
    requirePermission(permissions.update),
    validate?.update,
    applyScope(resource),
    async (req, res, next) => {
      try {
        const updated = await service.update(req.params.id, req.body, req.user, req.scope);
        res.json({ success: true, data: updated });
      } catch (error) {
        next(error);
      }
    }
  );
  
  // DELETE - Check ownership
  router.delete('/:id',
    requirePermission(permissions.delete),
    applyScope(resource),
    async (req, res, next) => {
      try {
        await service.delete(req.params.id, req.user, req.scope);
        res.json({ success: true, message: 'Xóa thành công' });
      } catch (error) {
        next(error);
      }
    }
  );
  
  return router;
}

module.exports = { createCRUDRouter };
```

### 5. Ví dụ: Activities Module theo kiến trúc mới

**File: `modules/activities/activities.routes.js`** (CHỈ 50 dòng thay vì 1500 dòng!)

```javascript
const { Router } = require('express');
const { createCRUDRouter } = require('../../shared/factories/crudRouter');
const { requirePermission } = require('../../middlewares/rbac');
const activitiesService = require('./activities.service');
const { validateCreate, validateUpdate } = require('./activities.schema');

const router = Router();

// CRUD chuẩn - tự động có list/get/create/update/delete với scope
const crudRouter = createCRUDRouter({
  resource: 'activities',
  service: activitiesService,
  permissions: {
    list: 'activities.view',
    create: 'activities.create',
    update: 'activities.update',
    delete: 'activities.delete'
  },
  validate: {
    create: validateCreate,
    update: validateUpdate
  }
});

router.use('/', crudRouter);

// Custom endpoints (nếu cần)
router.post('/:id/approve',
  requirePermission('activities.approve'),
  async (req, res, next) => {
    try {
      const result = await activitiesService.approve(req.params.id, req.user);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/:id/register',
  requirePermission('registrations.create'),
  async (req, res, next) => {
    try {
      const result = await activitiesService.register(req.params.id, req.user);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
```

**File: `modules/activities/activities.service.js`**

```javascript
const activitiesRepo = require('./activities.repo');
const { buildScope } = require('../../shared/scopes/scopeBuilder');
const { AppError } = require('../../shared/errors/AppError');

class ActivitiesService {
  async list(filters, user) {
    const scope = await buildScope('activities', user);
    return activitiesRepo.findMany({ ...filters, ...scope });
  }
  
  async getById(id, scope) {
    const activity = await activitiesRepo.findById(id, scope);
    if (!activity) throw new AppError('Không tìm thấy hoạt động', 404);
    return activity;
  }
  
  async create(data, user) {
    // Business logic: normalize semester, validate dates, etc.
    const normalized = this.normalizeSemester(data);
    
    return activitiesRepo.create({
      ...normalized,
      nguoi_tao_id: user.sub
    });
  }
  
  async update(id, data, user, scope) {
    // Check ownership
    const existing = await this.getById(id, scope);
    
    // Chỉ creator hoặc ADMIN/GIANG_VIEN mới sửa được
    if (existing.nguoi_tao_id !== user.sub && !['ADMIN', 'GIANG_VIEN'].includes(user.role)) {
      throw new AppError('Bạn không có quyền sửa hoạt động này', 403);
    }
    
    const normalized = this.normalizeSemester(data);
    return activitiesRepo.update(id, normalized);
  }
  
  async approve(id, user) {
    const activity = await activitiesRepo.findById(id);
    if (!activity) throw new AppError('Không tìm thấy hoạt động', 404);
    
    // Business logic: chỉ approve được hoạt động chờ duyệt
    if (activity.trang_thai === 'da_duyet') {
      throw new AppError('Hoạt động đã được duyệt', 400);
    }
    
    return activitiesRepo.update(id, { 
      trang_thai: 'da_duyet',
      nguoi_duyet_id: user.sub,
      ngay_duyet: new Date()
    });
  }
  
  normalizeSemester(data) {
    // Helper: infer hoc_ky and nam_hoc from ngay_bd if missing
    // (Logic này được tái sử dụng cho create và update)
    // ...
    return data;
  }
}

module.exports = new ActivitiesService();
```

**File: `modules/activities/activities.repo.js`** (Pure data access)

```javascript
const { prisma } = require('../../config/database');

class ActivitiesRepo {
  async findMany(filters = {}) {
    const { page = 1, limit = 20, semester, ...where } = filters;
    const skip = (page - 1) * limit;
    
    const [items, total] = await Promise.all([
      prisma.hoatDong.findMany({
        where,
        skip,
        take: limit,
        include: {
          loai_hoat_dong: true,
          nguoi_tao: { select: { ho_ten: true } },
          lop: { select: { ten_lop: true } }
        },
        orderBy: { ngay_bd: 'desc' }
      }),
      prisma.hoatDong.count({ where })
    ]);
    
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
  
  async findById(id, scope = {}) {
    return prisma.hoatDong.findFirst({
      where: { id: parseInt(id), ...scope },
      include: {
        loai_hoat_dong: true,
        nguoi_tao: { select: { ho_ten: true } }
      }
    });
  }
  
  async create(data) {
    return prisma.hoatDong.create({
      data,
      include: { loai_hoat_dong: true }
    });
  }
  
  async update(id, data) {
    return prisma.hoatDong.update({
      where: { id: parseInt(id) },
      data,
      include: { loai_hoat_dong: true }
    });
  }
  
  async delete(id) {
    return prisma.hoatDong.delete({
      where: { id: parseInt(id) }
    });
  }
}

module.exports = new ActivitiesRepo();
```

---

## 🎨 KIẾN TRÚC MỚI - FRONTEND

### 1. Cấu trúc thư mục mới

```
frontend/src/
├── features/                      # Feature-based organization
│   ├── activities/
│   │   ├── api/
│   │   │   └── activitiesApi.js  # API calls (React Query)
│   │   ├── hooks/
│   │   │   ├── useActivities.js  # Data fetching
│   │   │   ├── useActivityMutations.js
│   │   │   └── useActivityFilters.js
│   │   ├── components/
│   │   │   ├── ActivityCard.jsx
│   │   │   ├── ActivityList.jsx
│   │   │   ├── ActivityFilters.jsx
│   │   │   └── ActivityForm.jsx
│   │   └── pages/
│   │       └── ActivitiesPage.jsx  # Universal page cho tất cả role
│   │
│   ├── registrations/
│   ├── users/
│   └── reports/
│
├── shared/                        # Shared components & utilities
│   ├── components/
│   │   ├── DataTable/            # Generic table với filter/sort/pagination
│   │   ├── Guard/                # Permission guard component
│   │   ├── SemesterFilter/
│   │   └── StatusBadge/
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── usePermissions.js
│   │   └── usePagination.js
│   └── utils/
│       ├── permissions.js         # Permission checking utilities
│       └── api.js                # Axios instance
│
└── pages/                         # Route pages (thin, chỉ compose)
    ├── student/
    │   └── StudentActivitiesPage.jsx  → uses features/activities
    ├── monitor/
    │   └── MonitorActivitiesPage.jsx  → uses features/activities
    └── teacher/
        └── TeacherActivitiesPage.jsx  → uses features/activities
```

### 2. Generic DataTable Component

**File: `shared/components/DataTable/DataTable.jsx`**

```jsx
import React from 'react';
import { useTable, usePagination, useFilters, useSortBy } from 'react-table';

/**
 * Generic DataTable - dùng chung cho tất cả resources
 * Tự động có: filter, sort, pagination
 */
export default function DataTable({ 
  columns,        // Column definitions
  data,           // Data array
  loading,        // Loading state
  pageCount,      // Total pages
  onFetchData,    // Callback khi change page/filter/sort
  onRowClick,     // Callback khi click row
  actions         // Custom actions per row
}) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    gotoPage,
    nextPage,
    previousPage,
    state: { pageIndex, pageSize, filters, sortBy }
  } = useTable(
    { columns, data, manualPagination: true, pageCount },
    useFilters,
    useSortBy,
    usePagination
  );
  
  // Trigger fetch khi filters/pagination thay đổi
  React.useEffect(() => {
    onFetchData?.({ pageIndex, pageSize, filters, sortBy });
  }, [pageIndex, pageSize, filters, sortBy]);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render('Header')}
                  <span>
                    {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} onClick={() => onRowClick?.(row.original)}>
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {/* Pagination */}
      <div className="pagination">
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>{'<<'}</button>
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>{'<'}</button>
        <span>
          Page {pageIndex + 1} of {pageOptions.length}
        </span>
        <button onClick={() => nextPage()} disabled={!canNextPage}>{'>'}</button>
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>{'>>'}</button>
      </div>
    </div>
  );
}
```

### 3. Permission Guard Component

**File: `shared/components/Guard/Guard.jsx`**

```jsx
import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';

/**
 * Guard component - ẩn/hiện UI dựa trên permission
 * FE guard chỉ để UX, bảo mật thực sự ở BE
 */
export function Guard({ action, resource, children, fallback = null }) {
  const { can } = usePermissions();
  
  if (!can(action, resource)) {
    return fallback;
  }
  
  return <>{children}</>;
}

// Usage:
// <Guard action="create" resource="activities">
//   <button>Tạo hoạt động</button>
// </Guard>
```

### 4. Universal Activities Page (dùng cho tất cả role)

**File: `features/activities/pages/ActivitiesPage.jsx`** (CHỈ 200 dòng thay vì 1800 dòng!)

```jsx
import React from 'react';
import { useActivities } from '../hooks/useActivities';
import { useActivityMutations } from '../hooks/useActivityMutations';
import { usePermissions } from '../../../shared/hooks/usePermissions';
import DataTable from '../../../shared/components/DataTable/DataTable';
import ActivityFilters from '../components/ActivityFilters';
import ActivityForm from '../components/ActivityForm';
import { Guard } from '../../../shared/components/Guard/Guard';

export default function ActivitiesPage() {
  const { can } = usePermissions();
  const [filters, setFilters] = React.useState({ semester: '', status: '' });
  const [showForm, setShowForm] = React.useState(false);
  
  // React Query hooks - tự động handle loading, error, caching
  const { data, isLoading } = useActivities(filters);
  const { createActivity, updateActivity, deleteActivity } = useActivityMutations();
  
  // Column definitions - tự động ẩn/hiện theo permission
  const columns = React.useMemo(() => [
    { Header: 'Tên hoạt động', accessor: 'ten_HD' },
    { Header: 'Loại', accessor: 'loai_hoat_dong.ten_loai' },
    { Header: 'Ngày bắt đầu', accessor: 'ngay_bd', Cell: ({ value }) => new Date(value).toLocaleDateString() },
    { Header: 'Trạng thái', accessor: 'trang_thai' },
    can('update', 'activities') && {
      Header: 'Hành động',
      Cell: ({ row }) => (
        <div>
          <Guard action="update" resource="activities">
            <button onClick={() => handleEdit(row.original)}>Sửa</button>
          </Guard>
          <Guard action="delete" resource="activities">
            <button onClick={() => handleDelete(row.original.id)}>Xóa</button>
          </Guard>
        </div>
      )
    }
  ].filter(Boolean), [can]);
  
  const handleCreate = (data) => {
    createActivity.mutate(data, {
      onSuccess: () => setShowForm(false)
    });
  };
  
  const handleDelete = (id) => {
    if (confirm('Xác nhận xóa?')) {
      deleteActivity.mutate(id);
    }
  };
  
  return (
    <div>
      <h1>Quản lý hoạt động</h1>
      
      {/* Filters - dùng chung */}
      <ActivityFilters value={filters} onChange={setFilters} />
      
      {/* Create button - chỉ hiện nếu có quyền */}
      <Guard action="create" resource="activities">
        <button onClick={() => setShowForm(true)}>+ Tạo hoạt động</button>
      </Guard>
      
      {/* Data table - generic, dùng chung */}
      <DataTable
        columns={columns}
        data={data?.items || []}
        loading={isLoading}
        pageCount={data?.totalPages || 0}
      />
      
      {/* Form modal */}
      {showForm && (
        <ActivityForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
```

### 5. React Query Hooks - Centralized data fetching

**File: `features/activities/hooks/useActivities.js`**

```javascript
import { useQuery } from '@tanstack/react-query';
import { activitiesApi } from '../api/activitiesApi';

/**
 * Hook fetch danh sách activities
 * Tự động cache, refetch, background update
 */
export function useActivities(filters = {}) {
  return useQuery({
    queryKey: ['activities', filters],
    queryFn: () => activitiesApi.list(filters),
    keepPreviousData: true,
    staleTime: 30 * 1000, // 30s
  });
}

export function useActivity(id) {
  return useQuery({
    queryKey: ['activities', id],
    queryFn: () => activitiesApi.getById(id),
    enabled: !!id,
  });
}
```

**File: `features/activities/hooks/useActivityMutations.js`**

```javascript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { activitiesApi } from '../api/activitiesApi';
import { useNotification } from '../../../contexts/NotificationContext';

export function useActivityMutations() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  
  const createActivity = useMutation({
    mutationFn: activitiesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['activities']);
      showSuccess('Tạo hoạt động thành công');
    },
    onError: (error) => showError(error.message)
  });
  
  const updateActivity = useMutation({
    mutationFn: ({ id, data }) => activitiesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['activities']);
      showSuccess('Cập nhật thành công');
    },
    onError: (error) => showError(error.message)
  });
  
  const deleteActivity = useMutation({
    mutationFn: activitiesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['activities']);
      showSuccess('Xóa thành công');
    },
    onError: (error) => showError(error.message)
  });
  
  return { createActivity, updateActivity, deleteActivity };
}
```

---

## 📊 SO SÁNH TRƯỚC/SAU

### Backend

| File | Trước | Sau | Giảm |
|------|-------|-----|------|
| `teacher.route.js` | 1835 dòng | **150 dòng** | **-92%** |
| `activities.route.js` | 1514 dòng | **50 dòng** (dùng factory) | **-97%** |
| `admin.controller.js` | 1367 dòng | **200 dòng** (service) | **-85%** |
| **TỔNG BACKEND** | ~5000 dòng | **~1000 dòng** | **-80%** |

### Frontend

| Component | Trước | Sau | Giảm |
|-----------|-------|-----|------|
| `ClassActivities.js` | 1885 dòng | **250 dòng** (dùng DataTable + hooks) | **-87%** |
| `MyActivitiesModern.js` | 1158 dòng | **200 dòng** | **-83%** |
| `AdminUsers.js` | 1388 dòng | **300 dòng** | **-78%** |
| **TỔNG FRONTEND** | ~8000 dòng | **~2000 dòng** | **-75%** |

---

## 🛠️ ROADMAP TRIỂN KHAI

### Phase 1: Core Infrastructure (Week 1-2)
1. ✅ Tạo `shared/policies` và `shared/scopes`
2. ✅ Implement `crudRouter` và `crudService` factory
3. ✅ Cải tiến RBAC middleware
4. ✅ Tạo scope middleware
5. ✅ Unit tests cho core utilities

### Phase 2: Migrate 1 Module (Week 3)
1. ✅ Refactor **Activities module** theo kiến trúc mới
2. ✅ Test đầy đủ tất cả use cases
3. ✅ Đảm bảo backward compatible với FE hiện tại

### Phase 3: Frontend Infrastructure (Week 4)
1. ✅ Setup React Query
2. ✅ Tạo generic DataTable component
3. ✅ Tạo Guard component và usePermissions hook
4. ✅ Migrate ActivitiesPage

### Phase 4: Migrate Remaining Modules (Week 5-6)
1. ✅ Registrations module
2. ✅ Users module
3. ✅ Classes module
4. ✅ Reports module

### Phase 5: Cleanup & Optimize (Week 7)
1. ✅ Xóa code cũ
2. ✅ Documentation
3. ✅ Performance optimization
4. ✅ Final testing

---

## ⚡ LỢI ÍCH

1. **Giảm 60-70% code** → Dễ bảo trì hơn
2. **Tách biệt concerns** → Dễ test hơn
3. **Phân quyền tập trung** → Ít bug hơn
4. **Reusable components** → Thêm feature nhanh hơn
5. **Type-safe** (nếu dùng TypeScript) → Ít lỗi runtime
6. **Better DX** (Developer Experience)

---

## 🎯 KẾT LUẬN

Kiến trúc hiện tại đang **phức tạp hóa không cần thiết** một web app đơn giản. Bằng cách áp dụng:

- ✅ **CRUD Factory Pattern**
- ✅ **Scope Middleware**
- ✅ **Generic Components**
- ✅ **React Query**

Chúng ta có thể **giảm 60-70% code** mà **KHÔNG ẢNH HƯỞNG** đến tính năng hiện tại, đồng thời làm cho code:

- 🚀 Dễ bảo trì hơn
- 🧪 Dễ test hơn
- 📈 Dễ mở rộng hơn
- 🐛 Ít bug hơn

---

**Tác giả:** GitHub Copilot  
**Ngày:** 2025-11-10  
**Status:** ✅ Ready for Review
