# HƯỚNG DẪN MIGRATION: CẤU TRÚC CŨ → CẤU TRÚC MỚI

**Mục tiêu:** Hướng dẫn chi tiết cách migrate từ cấu trúc cũ sang cấu trúc mới

---

## 📋 TỔNG QUAN MIGRATION

### Timeline: 6 tuần
- **Tuần 1:** Setup structure + Shared code
- **Tuần 2-3:** Migrate Frontend features
- **Tuần 4-5:** Migrate Backend domains
- **Tuần 6:** Cleanup + Testing

---

## 🎯 PHASE 1: SETUP STRUCTURE (Tuần 1)

### Step 1.1: Tạo cấu trúc thư mục mới

#### Frontend:
```bash
# Tạo cấu trúc features
mkdir -p frontend/src/features/{auth,activities,registrations,dashboard,users,notifications,profile,qr-attendance}

# Tạo cấu trúc shared
mkdir -p frontend/src/shared/{components/{layout,common,forms,filters},hooks,services/{api,storage},store,utils,constants}

# Tạo cấu trúc app
mkdir -p frontend/src/app/{routes,providers,guards}

# Tạo cấu trúc config
mkdir -p frontend/src/config
```

#### Backend:
```bash
# Tạo cấu trúc domain
mkdir -p backend/src/domain/{auth,activities,registrations,users,dashboard,notifications,points,qr-attendance}

# Tạo cấu trúc shared
mkdir -p backend/src/shared/{middleware,services,repositories,utils,errors,types,constants}

# Tạo cấu trúc infrastructure
mkdir -p backend/src/infrastructure/{database,cache,storage}
```

### Step 1.2: Move shared code

#### Frontend - Move shared components:
```bash
# Move layout components
mv frontend/src/components/AdminStudentLayout.js frontend/src/shared/components/layout/AdminLayout.js
mv frontend/src/components/StudentLayout.js frontend/src/shared/components/layout/StudentLayout.js
mv frontend/src/components/ModernTeacherLayout.js frontend/src/shared/components/layout/TeacherLayout.js
mv frontend/src/components/MonitorLayout.js frontend/src/shared/components/layout/MonitorLayout.js

# Move common components
mv frontend/src/components/Pagination.js frontend/src/shared/components/common/Pagination.js
mv frontend/src/components/EmptyState.js frontend/src/shared/components/common/EmptyState.js
mv frontend/src/components/ConfirmModal.js frontend/src/shared/components/common/ConfirmModal.js
mv frontend/src/components/Card.js frontend/src/shared/components/common/Card.js
```

#### Frontend - Move shared hooks:
```bash
# Move shared hooks
mv frontend/src/hooks/usePagination.js frontend/src/shared/hooks/usePagination.js
mv frontend/src/hooks/useDebounce.js frontend/src/shared/hooks/useDebounce.js
```

#### Frontend - Move shared services:
```bash
# Move API client
mv frontend/src/services/http.js frontend/src/shared/services/api/client.js

# Move storage services
mv frontend/src/services/sessionStorageManager.js frontend/src/shared/services/storage/sessionStorage.js
```

#### Frontend - Move shared utils:
```bash
# Move utils
mv frontend/src/utils/dateFormat.js frontend/src/shared/utils/dateFormat.js
mv frontend/src/utils/role.js frontend/src/shared/utils/role.js
mv frontend/src/utils/activityImages.js frontend/src/shared/utils/activityImages.js
mv frontend/src/utils/avatarUtils.js frontend/src/shared/utils/avatarUtils.js
```

#### Backend - Move shared middleware:
```bash
# Move middleware
mv backend/src/middlewares/auth.js backend/src/shared/middleware/auth.middleware.js
mv backend/src/middlewares/rbac.js backend/src/shared/middleware/rbac.middleware.js
mv backend/src/middlewares/error.js backend/src/shared/middleware/error.middleware.js
mv backend/src/middlewares/sanitize.js backend/src/shared/middleware/sanitize.middleware.js
```

#### Backend - Move shared utils:
```bash
# Move utils
mv backend/src/utils/logger.js backend/src/shared/utils/logger.js
mv backend/src/utils/response.js backend/src/shared/utils/response.js
mv backend/src/utils/pagination.js backend/src/shared/utils/pagination.js
```

#### Backend - Move shared errors:
```bash
# Move errors
mv backend/src/shared/errors/AppError.js backend/src/shared/errors/AppError.js
```

---

## 🎯 PHASE 2: MIGRATE FRONTEND FEATURES (Tuần 2-3)

### Step 2.1: Migrate Activities Feature

#### 2.1.1: Tạo API Service
```bash
# Tạo file mới
touch frontend/src/features/activities/services/activitiesApi.js
```

**Code:**
```javascript
// features/activities/services/activitiesApi.js
import http from '../../../shared/services/api/client';

class ActivitiesAPI {
  async list(filters = {}) {
    try {
      const params = this.buildParams(filters);
      const response = await http.get('/v2/activities', { params });
      return {
        success: true,
        data: response.data?.data || [],
        total: response.data?.total || 0,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  async getById(id) {
    try {
      const response = await http.get(`/v2/activities/${id}`);
      return {
        success: true,
        data: response.data?.data || response.data,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  buildParams(filters) {
    const params = {};
    if (filters.q) params.q = filters.q;
    if (filters.type) params.type = filters.type;
    if (filters.status) params.status = filters.status;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;
    if (filters.semester) params.semester = filters.semester;
    return params;
  }
  
  handleError(error) {
    const message = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
    return {
      success: false,
      error: message,
      code: error.response?.status,
    };
  }
}

export default new ActivitiesAPI();
```

#### 2.1.2: Tạo Custom Hooks
```bash
# Tạo hooks
touch frontend/src/features/activities/hooks/useActivitiesList.js
touch frontend/src/features/activities/hooks/useActivityFilters.js
touch frontend/src/features/activities/hooks/useActivityRegistration.js
```

**Code useActivitiesList.js:**
```javascript
// features/activities/hooks/useActivitiesList.js
import { useState, useEffect } from 'react';
import activitiesApi from '../services/activitiesApi';

export function useActivitiesList(filters, pagination) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadActivities();
  }, [filters, pagination]);

  async function loadActivities() {
    setLoading(true);
    setError('');
    try {
      const result = await activitiesApi.list({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });
      if (result.success) {
        setItems(result.data);
        setTotal(result.total);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { items, loading, error, total, refetch: loadActivities };
}
```

#### 2.1.3: Tạo Components
```bash
# Tạo components
touch frontend/src/features/activities/components/ActivityCard.js
touch frontend/src/features/activities/components/ActivityGrid.js
touch frontend/src/features/activities/components/ActivityList.js
touch frontend/src/features/activities/components/ActivityFilters.js
```

**Code ActivityCard.js:**
```javascript
// features/activities/components/ActivityCard.js
import React from 'react';
import { getActivityImage } from '../../../shared/utils/activityImages';

export function ActivityCard({ activity, onView, onRegister, onCancel, isRegistered }) {
  return (
    <div className="activity-card">
      <img src={getActivityImage(activity)} alt={activity.ten_hd} />
      <h3>{activity.ten_hd}</h3>
      <p>{activity.mo_ta}</p>
      <div className="activity-meta">
        <span>{activity.ngay_bd}</span>
        <span>{activity.dia_diem}</span>
      </div>
      <div className="activity-actions">
        <button onClick={() => onView(activity.id)}>Xem chi tiết</button>
        {!isRegistered ? (
          <button onClick={() => onRegister(activity.id)}>Đăng ký</button>
        ) : (
          <button onClick={() => onCancel(activity.id)}>Hủy đăng ký</button>
        )}
      </div>
    </div>
  );
}
```

#### 2.1.4: Refactor ActivitiesListModern.js
```bash
# Move và refactor
mv frontend/src/pages/student/ActivitiesListModern.js frontend/src/features/activities/pages/ActivitiesListPage.js
```

**Code mới (simplified):**
```javascript
// features/activities/pages/ActivitiesListPage.js
import React, { useState } from 'react';
import { useActivitiesList } from '../hooks/useActivitiesList';
import { useActivityFilters } from '../hooks/useActivityFilters';
import { ActivityFilters } from '../components/ActivityFilters';
import { ActivityGrid } from '../components/ActivityGrid';
import { ActivityList } from '../components/ActivityList';
import { ActivityDetailModal } from '../components/ActivityDetailModal';
import { LoadingSpinner } from '../../../shared/components/common/LoadingSpinner';
import { ErrorMessage } from '../../../shared/components/common/ErrorMessage';
import { Pagination } from '../../../shared/components/common/Pagination';

export default function ActivitiesListPage() {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20 });
  
  const { filters, updateFilter, resetFilters } = useActivityFilters();
  const { items, loading, error, total } = useActivitiesList(filters, pagination);

  return (
    <div className="activities-list-page">
      <ActivityFilters 
        filters={filters}
        onChange={updateFilter}
        onReset={resetFilters}
      />
      
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}
      
      {viewMode === 'grid' ? (
        <ActivityGrid 
          activities={items}
          onView={setSelectedActivityId}
          onRegister={handleRegister}
        />
      ) : (
        <ActivityList 
          activities={items}
          onView={setSelectedActivityId}
          onRegister={handleRegister}
        />
      )}
      
      <Pagination
        page={pagination.page}
        total={total}
        limit={pagination.limit}
        onChange={setPagination}
      />
      
      {selectedActivityId && (
        <ActivityDetailModal
          activityId={selectedActivityId}
          onClose={() => setSelectedActivityId(null)}
        />
      )}
    </div>
  );
}
```

### Step 2.2: Migrate Auth Feature

#### 2.2.1: Move auth pages
```bash
# Move auth pages
mv frontend/src/pages/auth/LoginModern.js frontend/src/features/auth/pages/LoginPage.js
mv frontend/src/pages/auth/RegisterModern.js frontend/src/features/auth/pages/RegisterPage.js
mv frontend/src/pages/auth/ForgotPasswordModern.js frontend/src/features/auth/pages/ForgotPasswordPage.js
mv frontend/src/pages/auth/ResetPasswordModern.js frontend/src/features/auth/pages/ResetPasswordPage.js
```

#### 2.2.2: Create auth components
```bash
# Tạo components
touch frontend/src/features/auth/components/LoginForm.js
touch frontend/src/features/auth/components/RegisterForm.js
touch frontend/src/features/auth/components/ForgotPasswordForm.js
```

#### 2.2.3: Create auth hooks
```bash
# Tạo hooks
touch frontend/src/features/auth/hooks/useAuth.js
touch frontend/src/features/auth/hooks/useLogin.js
```

#### 2.2.4: Create auth API service
```bash
# Tạo service
touch frontend/src/features/auth/services/authApi.js
```

### Step 2.3: Migrate các features khác

Tương tự như Activities và Auth:
- [ ] Migrate `registrations` feature
- [ ] Migrate `dashboard` feature
- [ ] Migrate `users` feature
- [ ] Migrate `notifications` feature
- [ ] Migrate `profile` feature
- [ ] Migrate `qr-attendance` feature

---

## 🎯 PHASE 3: MIGRATE BACKEND DOMAINS (Tuần 4-5)

### Step 3.1: Migrate Activities Domain

#### 3.1.1: Move module to domain
```bash
# Move activities module
mv backend/src/modules/activities backend/src/domain/activities

# Reorganize structure
mkdir -p backend/src/domain/activities/{controllers,services,repositories,routes,validators,types}
```

#### 3.1.2: Move files
```bash
# Move files
mv backend/src/domain/activities/activities.service.js backend/src/domain/activities/services/activities.service.js
mv backend/src/domain/activities/activities.repo.js backend/src/domain/activities/repositories/activities.repository.js
mv backend/src/domain/activities/activities.routes.js backend/src/domain/activities/routes/activities.routes.js
```

#### 3.1.3: Create controller
```bash
# Tạo controller
touch backend/src/domain/activities/controllers/activities.controller.js
```

**Code:**
```javascript
// domain/activities/controllers/activities.controller.js
const activitiesService = require('../services/activities.service');
const { successResponse, errorResponse } = require('../../../shared/utils/response');

class ActivitiesController {
  async list(req, res, next) {
    try {
      const filters = req.query;
      const user = req.user;
      const result = await activitiesService.list(filters, user);
      return successResponse(res, result.data, result.total);
    } catch (error) {
      next(error);
    }
  }
  
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user;
      const activity = await activitiesService.getById(id, user);
      return successResponse(res, activity);
    } catch (error) {
      next(error);
    }
  }
  
  // ... other methods
}

module.exports = new ActivitiesController();
```

#### 3.1.4: Create validators
```bash
# Tạo validators
touch backend/src/domain/activities/validators/activities.validator.js
```

**Code:**
```javascript
// domain/activities/validators/activities.validator.js
const { z } = require('zod');

const createActivitySchema = z.object({
  ten_hd: z.string().min(1).max(200),
  mo_ta: z.string().optional(),
  loai_hd_id: z.string().uuid(),
  diem_rl: z.number().min(0).max(10),
  dia_diem: z.string().max(200).optional(),
  ngay_bd: z.string().datetime(),
  ngay_kt: z.string().datetime(),
  han_dk: z.string().datetime().optional(),
  sl_toi_da: z.number().int().min(1),
});

const updateActivitySchema = createActivitySchema.partial();

module.exports = {
  createActivitySchema,
  updateActivitySchema,
};
```

#### 3.1.5: Update routes
```javascript
// domain/activities/routes/activities.routes.js
const { Router } = require('express');
const activitiesController = require('../controllers/activities.controller');
const { validate } = require('../../../shared/middleware/validation.middleware');
const { createActivitySchema, updateActivitySchema } = require('../validators/activities.validator');
const { auth } = require('../../../shared/middleware/auth.middleware');

const router = Router();

router.get('/', auth, activitiesController.list);
router.get('/:id', auth, activitiesController.getById);
router.post('/', auth, validate(createActivitySchema), activitiesController.create);
router.put('/:id', auth, validate(updateActivitySchema), activitiesController.update);
router.delete('/:id', auth, activitiesController.delete);

module.exports = router;
```

#### 3.1.6: Create index.js
```javascript
// domain/activities/index.js
const activitiesRoutes = require('./routes/activities.routes');
const activitiesService = require('./services/activities.service');
const activitiesRepo = require('./repositories/activities.repository');

module.exports = {
  routes: activitiesRoutes,
  service: activitiesService,
  repository: activitiesRepo,
};
```

### Step 3.2: Migrate các domains khác

Tương tự như Activities:
- [ ] Migrate `auth` domain
- [ ] Migrate `registrations` domain
- [ ] Migrate `users` domain
- [ ] Migrate `dashboard` domain
- [ ] Migrate `notifications` domain
- [ ] Migrate `points` domain
- [ ] Migrate `qr-attendance` domain

---

## 🎯 PHASE 4: UPDATE ROUTES & IMPORTS (Tuần 5-6)

### Step 4.1: Update Frontend Routes

#### 4.1.1: Create route configuration
```bash
# Tạo route config
touch frontend/src/app/routes/index.js
touch frontend/src/app/routes/AdminRoutes.js
touch frontend/src/app/routes/StudentRoutes.js
touch frontend/src/app/routes/TeacherRoutes.js
touch frontend/src/app/routes/MonitorRoutes.js
touch frontend/src/app/routes/PublicRoutes.js
```

#### 4.1.2: Update App.js
```javascript
// app/App.js
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './providers/AppProvider';
import { AuthGuard } from './guards/AuthGuard';
import { RoleGuard } from './guards/RoleGuard';
import { AdminRoutes } from './routes/AdminRoutes';
import { StudentRoutes } from './routes/StudentRoutes';
import { TeacherRoutes } from './routes/TeacherRoutes';
import { MonitorRoutes } from './routes/MonitorRoutes';
import { PublicRoutes } from './routes/PublicRoutes';
import { LoadingSpinner } from '../shared/components/common/LoadingSpinner';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/*" element={<PublicRoutes />} />
            <Route 
              path="/admin/*" 
              element={
                <AuthGuard>
                  <RoleGuard allow={['ADMIN']}>
                    <AdminRoutes />
                  </RoleGuard>
                </AuthGuard>
              } 
            />
            <Route 
              path="/student/*" 
              element={
                <AuthGuard>
                  <RoleGuard allow={['SINH_VIEN', 'STUDENT']}>
                    <StudentRoutes />
                  </RoleGuard>
                </AuthGuard>
              } 
            />
            {/* ... other routes */}
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
```

### Step 4.2: Update Backend Routes

#### 4.2.1: Update main routes
```javascript
// routes/index.js
const { Router } = require('express');
const authDomain = require('../domain/auth');
const activitiesDomain = require('../domain/activities');
const registrationsDomain = require('../domain/registrations');
// ... other domains

const router = Router();

// Auth routes
router.use('/auth', authDomain.routes);

// Activities routes
router.use('/v2/activities', activitiesDomain.routes);

// Registrations routes
router.use('/v2/registrations', registrationsDomain.routes);

// ... other routes

module.exports = router;
```

---

## 🎯 PHASE 5: CLEANUP & TESTING (Tuần 6)

### Step 5.1: Remove old structure
```bash
# Remove old frontend structure (sau khi đã migrate xong)
rm -rf frontend/src/pages/student/ActivitiesListModern.js
rm -rf frontend/src/pages/student/MyActivitiesModern.js
# ... remove other old files

# Remove old backend structure
rm -rf backend/src/modules/activities
rm -rf backend/src/controllers/activities.controller.js
# ... remove other old files
```

### Step 5.2: Update imports
- [ ] Update tất cả imports trong frontend
- [ ] Update tất cả imports trong backend
- [ ] Fix linter errors
- [ ] Fix build errors

### Step 5.3: Testing
- [ ] Test tất cả features
- [ ] Test edge cases
- [ ] Fix bugs
- [ ] Performance testing

### Step 5.4: Documentation
- [ ] Update README
- [ ] Update component documentation
- [ ] Update API documentation

---

## ✅ CHECKLIST MIGRATION

### Frontend
- [ ] Tạo cấu trúc `features/` và `shared/`
- [ ] Move shared code
- [ ] Migrate `activities` feature
- [ ] Migrate `auth` feature
- [ ] Migrate các features khác
- [ ] Refactor large components
- [ ] Update routes
- [ ] Update imports
- [ ] Remove old structure
- [ ] Test functionality

### Backend
- [ ] Tạo cấu trúc `domain/` và `shared/`
- [ ] Move shared code
- [ ] Migrate `activities` domain
- [ ] Migrate `auth` domain
- [ ] Migrate các domains khác
- [ ] Create controllers
- [ ] Create validators
- [ ] Update routes
- [ ] Update imports
- [ ] Remove old structure
- [ ] Test functionality

---

## 🚨 LƯU Ý QUAN TRỌNG

1. **Backup trước khi migrate:** Luôn backup code trước khi bắt đầu migration
2. **Migrate từng feature:** Không migrate tất cả cùng lúc, làm từng feature một
3. **Test sau mỗi bước:** Test functionality sau mỗi bước migration
4. **Update imports:** Đảm bảo update tất cả imports
5. **Remove old code:** Chỉ remove code cũ sau khi đã test kỹ

---

**Last updated:** $(date)  
**Status:** 🟡 Migration Guide

