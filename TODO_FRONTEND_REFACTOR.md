# TODO LIST: NÂNG CẤP FRONTEND

**Mục tiêu:** Giảm độ phức tạp code, dễ bảo trì, dễ mở rộng, tách logic

**Thời gian ước tính:** 4-6 tuần

---

## 📋 PHASE 1: CHUẨN BỊ CẤU TRÚC (Tuần 1)

### ✅ Task 1.1: Tạo cấu trúc thư mục mới
- [ ] Tạo `components/activities/` folder
- [ ] Tạo `components/filters/` folder  
- [ ] Tạo `components/modals/` folder
- [ ] Tạo `hooks/activities/` folder
- [ ] Tạo `services/api/` folder

**Files cần tạo:**
```
frontend/src/
├── components/
│   ├── activities/
│   │   ├── ActivityCard.js
│   │   ├── ActivityGrid.js
│   │   └── ActivityList.js
│   ├── filters/
│   │   ├── ActivityFilters.js
│   │   ├── ActivityTypeFilter.js
│   │   └── ActivityStatusFilter.js
│   └── modals/
│       └── ActivityDetailModal.js (move từ root)
├── hooks/
│   └── activities/
│       ├── useActivitiesList.js
│       ├── useActivityFilters.js
│       └── useActivityRegistration.js
└── services/
    └── api/
        ├── activitiesApi.js
        ├── registrationsApi.js
        └── index.js
```

---

## 📋 PHASE 2: TẠO API SERVICE LAYER (Tuần 1-2)

### ✅ Task 2.1: Tạo Activities API Service
- [ ] Tạo `services/api/activitiesApi.js`
- [ ] Implement `list(filters)` method
- [ ] Implement `getById(id)` method
- [ ] Implement `create(activity)` method
- [ ] Implement `update(id, activity)` method
- [ ] Implement `delete(id)` method
- [ ] Implement `register(activityId)` method
- [ ] Implement `cancelRegistration(activityId)` method
- [ ] Standardize error handling

**Code template:**
```javascript
// services/api/activitiesApi.js
import http from '../http';

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
  
  buildParams(filters) {
    // Build query params from filters
  }
  
  handleError(error) {
    // Standardize error response
  }
}

export default new ActivitiesAPI();
```

### ✅ Task 2.2: Tạo Registrations API Service
- [ ] Tạo `services/api/registrationsApi.js`
- [ ] Implement các methods cần thiết
- [ ] Standardize error handling

### ✅ Task 2.3: Tạo API Index
- [ ] Tạo `services/api/index.js`
- [ ] Export tất cả API services
- [ ] Tạo API client wrapper nếu cần

---

## 📋 PHASE 3: TẠO CUSTOM HOOKS (Tuần 2)

### ✅ Task 3.1: Tạo useActivitiesList Hook
- [ ] Tạo `hooks/activities/useActivitiesList.js`
- [ ] Move logic data fetching từ ActivitiesListModern.js
- [ ] Handle loading, error states
- [ ] Handle pagination
- [ ] Handle filters
- [ ] Return: `{ items, loading, error, total, refetch }`

**Code template:**
```javascript
// hooks/activities/useActivitiesList.js
import { useState, useEffect } from 'react';
import activitiesApi from '../../services/api/activitiesApi';

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

### ✅ Task 3.2: Tạo useActivityFilters Hook
- [ ] Tạo `hooks/activities/useActivityFilters.js`
- [ ] Manage filter state
- [ ] Handle filter changes
- [ ] Reset filters functionality

### ✅ Task 3.3: Tạo useActivityRegistration Hook
- [ ] Tạo `hooks/activities/useActivityRegistration.js`
- [ ] Handle register/cancel registration logic
- [ ] Handle success/error notifications

### ✅ Task 3.4: Tạo Shared Hooks
- [ ] Improve `hooks/usePagination.js` (nếu chưa có)
- [ ] Improve `hooks/useDebounce.js` (nếu chưa có)
- [ ] Tạo `hooks/useModal.js` cho modal state management

---

## 📋 PHASE 4: TẠO COMPONENTS NHỎ (Tuần 2-3)

### ✅ Task 4.1: Tạo ActivityCard Component
- [ ] Tạo `components/activities/ActivityCard.js`
- [ ] Extract card UI từ ActivitiesListModern.js
- [ ] Props: `activity`, `onView`, `onRegister`, `onCancel`
- [ ] Handle different states (registered, full, closed)
- [ ] Add loading state cho actions

**Code template:**
```javascript
// components/activities/ActivityCard.js
import React from 'react';
import { getActivityImage } from '../../utils/activityImages';

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

### ✅ Task 4.2: Tạo ActivityFilters Component
- [ ] Tạo `components/filters/ActivityFilters.js`
- [ ] Extract filter UI từ ActivitiesListModern.js
- [ ] Props: `filters`, `onChange`, `activityTypes`
- [ ] Include: search, type filter, status filter, date range
- [ ] Include semester filter integration

### ✅ Task 4.3: Tạo ActivityGrid Component
- [ ] Tạo `components/activities/ActivityGrid.js`
- [ ] Grid layout với ActivityCard
- [ ] Handle empty state
- [ ] Handle loading state

### ✅ Task 4.4: Tạo ActivityList Component (List view)
- [ ] Tạo `components/activities/ActivityList.js`
- [ ] List layout với ActivityCard
- [ ] Alternative view mode

### ✅ Task 4.5: Tạo Shared Components
- [ ] Improve `components/LoadingSpinner.js` (nếu chưa có)
- [ ] Improve `components/ErrorMessage.js` (nếu chưa có)
- [ ] Improve `components/EmptyState.js` (đã có, kiểm tra và improve)

---

## 📋 PHASE 5: REFACTOR ACTIVITIESLISTMODERN (Tuần 3)

### ✅ Task 5.1: Refactor ActivitiesListModern.js
- [ ] Import các components và hooks mới
- [ ] Remove duplicate logic
- [ ] Simplify component to composition only
- [ ] Giảm từ 1109 dòng xuống ~100-150 dòng
- [ ] Test functionality

**Target structure:**
```javascript
// pages/student/ActivitiesListModern.js
import React, { useState } from 'react';
import { useActivitiesList } from '../../hooks/activities/useActivitiesList';
import { useActivityFilters } from '../../hooks/activities/useActivityFilters';
import { ActivityFilters } from '../../components/filters/ActivityFilters';
import { ActivityGrid } from '../../components/activities/ActivityGrid';
import { ActivityList } from '../../components/activities/ActivityList';
import { ActivityDetailModal } from '../../components/modals/ActivityDetailModal';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';
import Pagination from '../../components/Pagination';

export default function ActivitiesListModern() {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20 });
  
  const { filters, updateFilter, resetFilters } = useActivityFilters();
  const { items, loading, error, total } = useActivitiesList(filters, pagination);

  return (
    <div className="activities-list-modern">
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

---

## 📋 PHASE 6: REFACTOR MYACTIVITIESMODERN (Tuần 3-4)

### ✅ Task 6.1: Tạo useMyActivitiesList Hook
- [ ] Tạo `hooks/activities/useMyActivitiesList.js`
- [ ] Similar to useActivitiesList nhưng filter by user registrations
- [ ] Handle registration status filtering

### ✅ Task 6.2: Tạo MyActivityCard Component
- [ ] Tạo `components/activities/MyActivityCard.js`
- [ ] Similar to ActivityCard nhưng với registration info
- [ ] Show registration status, points, attendance

### ✅ Task 6.3: Refactor MyActivitiesModern.js
- [ ] Apply same pattern như ActivitiesListModern
- [ ] Giảm từ 1234 dòng xuống ~150 dòng
- [ ] Test functionality

---

## 📋 PHASE 7: REFACTOR MONITORMYACTIVITIES (Tuần 4)

### ✅ Task 7.1: Refactor MonitorMyActivities.js
- [ ] Apply same pattern
- [ ] Giảm từ 1166 dòng xuống ~150 dòng
- [ ] Reuse components đã tạo
- [ ] Test functionality

---

## 📋 PHASE 8: STATE MANAGEMENT (Tuần 4-5)

### ✅ Task 8.1: Mở rộng Zustand Store
- [ ] Update `store/useAppStore.js`
- [ ] Add activities cache
- [ ] Add user preferences (theme, viewMode, etc.)
- [ ] Add UI state (sidebar open/close, etc.)
- [ ] Add persistence cho preferences

**Code template:**
```javascript
// store/useAppStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAppStore = create(
  persist(
    (set, get) => ({
      // Existing auth state
      token: null,
      user: null,
      role: null,
      setAuth: (auth) => set(auth),
      
      // Activities cache
      activitiesCache: {
        items: [],
        lastFetch: null,
        filters: {},
      },
      setActivitiesCache: (cache) => set((state) => ({
        activitiesCache: { ...state.activitiesCache, ...cache }
      })),
      
      // User preferences
      preferences: {
        theme: 'light',
        viewMode: 'grid',
        notifications: true,
      },
      setPreferences: (prefs) => set((state) => ({
        preferences: { ...state.preferences, ...prefs }
      })),
      
      // UI state
      ui: {
        sidebarOpen: true,
      },
      setUI: (ui) => set((state) => ({
        ui: { ...state.ui, ...ui }
      })),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        role: state.role,
        preferences: state.preferences,
        ui: state.ui,
      }),
    }
  )
);
```

---

## 📋 PHASE 9: REFACTOR APP.JS & ROUTING (Tuần 5)

### ✅ Task 9.1: Tạo Route Configuration
- [ ] Tạo `config/routes.js`
- [ ] Define route structure
- [ ] Export route configs

### ✅ Task 9.2: Tách Route Components
- [ ] Tạo `routes/AdminRoutes.js`
- [ ] Tạo `routes/StudentRoutes.js`
- [ ] Tạo `routes/TeacherRoutes.js`
- [ ] Tạo `routes/MonitorRoutes.js`
- [ ] Tạo `routes/PublicRoutes.js`
- [ ] Implement React.lazy cho code splitting

**Code template:**
```javascript
// routes/AdminRoutes.js
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'));
// ... other admin pages

export function AdminRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        {/* ... other routes */}
      </Routes>
    </Suspense>
  );
}
```

### ✅ Task 9.3: Refactor App.js
- [ ] Simplify App.js
- [ ] Use route components
- [ ] Giảm từ 273 dòng xuống ~50-80 dòng
- [ ] Test routing

---

## 📋 PHASE 10: ERROR HANDLING & PERFORMANCE (Tuần 5-6)

### ✅ Task 10.1: Tạo ErrorBoundary
- [ ] Tạo `components/ErrorBoundary.js`
- [ ] Wrap main routes
- [ ] Add error reporting (optional: Sentry)

### ✅ Task 10.2: Performance Optimization
- [ ] Add React.memo cho ActivityCard
- [ ] Add useMemo cho filtered items
- [ ] Add useCallback cho event handlers
- [ ] Check và fix unnecessary re-renders

### ✅ Task 10.3: Code Splitting Verification
- [ ] Verify lazy loading works
- [ ] Check bundle sizes
- [ ] Optimize if needed

---

## 📋 PHASE 11: CSS CONSOLIDATION (Tuần 6)

### ✅ Task 11.1: Consolidate CSS Files
- [ ] Review 11 CSS files
- [ ] Merge common styles
- [ ] Create design tokens (colors, spacing, typography)
- [ ] Remove duplicate styles
- [ ] Update components to use consolidated styles

---

## 📋 PHASE 12: TESTING & CLEANUP (Tuần 6)

### ✅ Task 12.1: Testing
- [ ] Test tất cả functionality
- [ ] Test edge cases
- [ ] Fix bugs

### ✅ Task 12.2: Code Review
- [ ] Review code quality
- [ ] Check for unused code
- [ ] Remove commented code
- [ ] Update comments/documentation

### ✅ Task 12.3: Documentation
- [ ] Update component documentation
- [ ] Document new hooks
- [ ] Document API services
- [ ] Update README nếu cần

---

## 📊 METRICS ĐỂ THEO DÕI

### Code Metrics
- [ ] **ActivitiesListModern.js:** < 150 dòng (hiện tại: 1109)
- [ ] **MyActivitiesModern.js:** < 150 dòng (hiện tại: 1234)
- [ ] **MonitorMyActivities.js:** < 150 dòng (hiện tại: 1166)
- [ ] **App.js:** < 100 dòng (hiện tại: 273)
- [ ] **Component size:** Tất cả components < 300 dòng
- [ ] **Function complexity:** Cyclomatic complexity < 10

### Quality Metrics
- [ ] **Code duplication:** < 5%
- [ ] **Test coverage:** > 60% (nếu có tests)
- [ ] **Bundle size:** Giảm ít nhất 20% nhờ code splitting

---

## ✅ DEFINITION OF DONE

Mỗi task được coi là hoàn thành khi:
- [ ] Code đã được implement
- [ ] Không có linter errors
- [ ] Functionality hoạt động đúng
- [ ] Code đã được review (nếu có team)
- [ ] Đã test trên development environment

---

## 🎯 PRIORITY ORDER

**Tuần 1-2 (Critical):**
1. API Service Layer
2. Custom Hooks
3. Basic Components

**Tuần 3-4 (High):**
4. Refactor ActivitiesListModern
5. Refactor MyActivitiesModern
6. Refactor MonitorMyActivities

**Tuần 5-6 (Medium):**
7. State Management
8. App.js Refactoring
9. Error Handling & Performance

**Tuần 6+ (Nice to have):**
10. CSS Consolidation
11. Testing & Documentation

---

**Last updated:** $(date)  
**Status:** 🟡 Ready to Start

