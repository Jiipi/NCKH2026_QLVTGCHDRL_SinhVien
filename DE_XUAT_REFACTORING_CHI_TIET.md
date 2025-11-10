# ĐỀ XUẤT REFACTORING CHI TIẾT

## 1. REFACTORING FRONTEND COMPONENTS

### 1.1. Ví dụ: ActivitiesListModern.js (1109 dòng → Tách thành nhiều components)

#### ❌ Vấn đề hiện tại:
```javascript
// ActivitiesListModern.js - 1109 dòng, quá nhiều responsibilities
export default function ActivitiesListModern() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({...});
  const [items, setItems] = useState([]);
  const [activityTypes, setActivityTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  // ... 16+ state variables
  // ... 500+ dòng JSX
  // ... Business logic lẫn với UI
}
```

#### ✅ Giải pháp đề xuất:

**1. Tách Custom Hook:**
```javascript
// hooks/useActivitiesList.js
import { useState, useEffect } from 'react';
import http from '../services/http';

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
    try {
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      };
      const res = await http.get('/v2/activities', { params });
      setItems(res.data?.data || []);
      setTotal(res.data?.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { items, loading, error, total, refetch: loadActivities };
}
```

**2. Tách Filter Component:**
```javascript
// components/ActivityFilters.js
export function ActivityFilters({ filters, onChange, activityTypes }) {
  return (
    <div className="filters-panel">
      <input
        value={filters.query}
        onChange={(e) => onChange({ ...filters, query: e.target.value })}
        placeholder="Tìm kiếm..."
      />
      <select
        value={filters.type}
        onChange={(e) => onChange({ ...filters, type: e.target.value })}
      >
        {/* options */}
      </select>
      {/* More filters */}
    </div>
  );
}
```

**3. Tách Activity Card Component:**
```javascript
// components/ActivityCard.js
export function ActivityCard({ activity, onView, onRegister }) {
  return (
    <div className="activity-card">
      <img src={getActivityImage(activity)} alt={activity.ten_hd} />
      <h3>{activity.ten_hd}</h3>
      <p>{activity.mo_ta}</p>
      <div className="activity-meta">
        <span>{activity.ngay_bd}</span>
        <span>{activity.dia_diem}</span>
      </div>
      <button onClick={() => onView(activity.id)}>Xem chi tiết</button>
      <button onClick={() => onRegister(activity.id)}>Đăng ký</button>
    </div>
  );
}
```

**4. Component chính (simplified):**
```javascript
// pages/student/ActivitiesListModern.js
import { useState } from 'react';
import { useActivitiesList } from '../../hooks/useActivitiesList';
import { ActivityFilters } from '../../components/ActivityFilters';
import { ActivityCard } from '../../components/ActivityCard';
import { ActivityDetailModal } from '../../components/ActivityDetailModal';

export default function ActivitiesListModern() {
  const [filters, setFilters] = useState({ type: '', status: '', query: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 20 });
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  
  const { items, loading, error, total } = useActivitiesList(filters, pagination);

  return (
    <div className="activities-list">
      <ActivityFilters 
        filters={filters} 
        onChange={setFilters}
      />
      
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}
      
      <div className="activities-grid">
        {items.map(activity => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onView={setSelectedActivityId}
            onRegister={handleRegister}
          />
        ))}
      </div>
      
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

**Kết quả:**
- Component chính: ~100 dòng (giảm 90%)
- Tách biệt concerns: Logic / UI / Data
- Dễ test từng phần
- Dễ maintain và extend

---

### 1.2. Refactor App.js

#### ❌ Vấn đề hiện tại:
```javascript
// App.js - 273 dòng, quá nhiều imports, routes phức tạp
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
// ... 70+ imports
```

#### ✅ Giải pháp đề xuất:

**1. Tách Route Configuration:**
```javascript
// config/routes.js
export const routes = {
  public: [
    { path: '/login', component: 'LoginModern' },
    { path: '/register', component: 'RegisterModern' },
  ],
  admin: [
    { path: '/admin', component: 'AdminDashboard', index: true },
    { path: '/admin/users', component: 'AdminUsers' },
    // ...
  ],
  student: [
    { path: '/student', component: 'DashboardStudentModern', index: true },
    // ...
  ],
  // ...
};
```

**2. Tách Route Components:**
```javascript
// routes/AdminRoutes.js
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { RoleGuard } from '../components/RoleGuard';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'));
// ...

export function AdminRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        {/* ... */}
      </Routes>
    </Suspense>
  );
}
```

**3. App.js simplified:**
```javascript
// App.js
import { BrowserRouter } from 'react-router-dom';
import { AdminRoutes } from './routes/AdminRoutes';
import { StudentRoutes } from './routes/StudentRoutes';
import { TeacherRoutes } from './routes/TeacherRoutes';
import { PublicRoutes } from './routes/PublicRoutes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<PublicRoutes />} />
        <Route path="/admin/*" element={<RoleGuard allow={['ADMIN']}><AdminRoutes /></RoleGuard>} />
        <Route path="/student/*" element={<RoleGuard allow={['SINH_VIEN']}><StudentRoutes /></RoleGuard>} />
        {/* ... */}
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 2. REFACTORING BACKEND SERVICES

### 2.1. Ví dụ: activities.service.js

#### ❌ Vấn đề hiện tại:
```javascript
// activities.service.js - Logic phức tạp, nhiều responsibilities
async list(filters, user) {
  // 100+ dòng code
  // Scope filtering logic
  // Text search
  // Status filtering
  // Date filtering
  // Permission checks
  // All mixed together
}
```

#### ✅ Giải pháp đề xuất:

**1. Tách Scope Builder:**
```javascript
// shared/scopes/activityScopeBuilder.js
class ActivityScopeBuilder {
  static async buildForStudent(user) {
    const student = await this.getStudent(user.sub);
    if (!student?.lop_id) return { nguoi_tao_id: { in: [] } };
    
    const classStudents = await this.getClassStudents(student.lop_id);
    const homeroomTeacher = await this.getHomeroomTeacher(student.lop_id);
    
    return {
      nguoi_tao_id: { in: [...classStudents, homeroomTeacher] }
    };
  }
  
  static async buildForMonitor(user) {
    // Similar logic but with OR condition
  }
}
```

**2. Tách Filter Builder:**
```javascript
// shared/filters/activityFilterBuilder.js
class ActivityFilterBuilder {
  static buildTextSearch(q) {
    if (!q) return {};
    return { ten_hd: { contains: String(q), mode: 'insensitive' } };
  }
  
  static buildTypeFilter(loaiId) {
    if (!loaiId) return {};
    return { loai_hd_id: String(loaiId) };
  }
  
  static buildStatusFilter(status) {
    if (!status) return {};
    return { trang_thai: String(status) };
  }
  
  static buildDateRange(from, to) {
    const where = {};
    if (from) where.ngay_bd = { gte: new Date(from) };
    if (to) where.ngay_kt = { lte: new Date(to) };
    return where;
  }
  
  static build(filters) {
    return {
      ...this.buildTextSearch(filters.q),
      ...this.buildTypeFilter(filters.loaiId),
      ...this.buildStatusFilter(filters.status),
      ...this.buildDateRange(filters.from, filters.to),
    };
  }
}
```

**3. Service simplified:**
```javascript
// activities.service.js
const ActivityScopeBuilder = require('../../shared/scopes/activityScopeBuilder');
const ActivityFilterBuilder = require('../../shared/filters/activityFilterBuilder');

class ActivitiesService {
  async list(filters, user) {
    // Build scope
    const scope = await ActivityScopeBuilder.buildForUser(user);
    
    // Build filters
    const where = ActivityFilterBuilder.build(filters);
    
    // Combine
    const finalWhere = { ...scope, ...where };
    
    // Execute query
    return await activitiesRepo.findMany({
      where: finalWhere,
      page: filters.page,
      limit: filters.limit,
      sort: filters.sort,
      order: filters.order
    });
  }
}
```

**Kết quả:**
- Service method: ~20 dòng (giảm 80%)
- Logic tách biệt, dễ test
- Reusable components
- Dễ maintain

---

## 3. STATE MANAGEMENT IMPROVEMENTS

### 3.1. Mở rộng Zustand Store

#### ❌ Vấn đề hiện tại:
```javascript
// store/useAppStore.js - Chỉ có auth
const useAppStore = create((set) => ({
  token: null,
  user: null,
  role: null,
  setAuth: (auth) => set(auth),
}));
```

#### ✅ Giải pháp đề xuất:

```javascript
// store/useAppStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAppStore = create(
  persist(
    (set, get) => ({
      // Auth
      token: null,
      user: null,
      role: null,
      setAuth: (auth) => set(auth),
      
      // Activities cache
      activities: {
        items: [],
        lastFetch: null,
        filters: {},
      },
      setActivities: (activities) => set((state) => ({
        activities: {
          ...state.activities,
          items: activities,
          lastFetch: Date.now(),
        }
      })),
      
      // User preferences
      preferences: {
        theme: 'light',
        language: 'vi',
        notifications: true,
      },
      setPreferences: (prefs) => set((state) => ({
        preferences: { ...state.preferences, ...prefs }
      })),
      
      // UI state
      ui: {
        sidebarOpen: true,
        viewMode: 'grid',
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

export { useAppStore };
```

---

## 4. API LAYER ABSTRACTION

### 4.1. Tạo API Service Layer

#### ❌ Vấn đề hiện tại:
```javascript
// API calls rải rác trong components
http.get('/v2/activities')
http.post('/v2/registrations')
// Không có error handling nhất quán
// Không có type safety
```

#### ✅ Giải pháp đề xuất:

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
  
  async create(activity) {
    try {
      const response = await http.post('/v2/activities', activity);
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
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;
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

**Sử dụng:**
```javascript
// components/ActivitiesList.js
import activitiesApi from '../../services/api/activitiesApi';

const { data, error, success } = await activitiesApi.list(filters);
if (success) {
  setItems(data);
} else {
  showError(error);
}
```

---

## 5. ERROR HANDLING STANDARDIZATION

### 5.1. Backend Error Handling

```javascript
// shared/errors/AppError.js
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class ValidationError extends AppError {
  constructor(message, fields = {}) {
    super(message, 400, 'VALIDATION_ERROR');
    this.fields = fields;
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'FORBIDDEN');
  }
}

module.exports = {
  AppError,
  NotFoundError,
  ValidationError,
  ForbiddenError,
};
```

```javascript
// middlewares/error.js
const { AppError } = require('../shared/errors/AppError');

function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.code,
        ...(err.fields && { fields: err.fields }),
      },
    });
  }
  
  // Unknown errors
  console.error('Unhandled error:', err);
  return res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
  });
}

module.exports = errorHandler;
```

### 5.2. Frontend Error Boundaries

```javascript
// components/ErrorBoundary.js
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error reporting service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Đã xảy ra lỗi</h2>
          <p>{this.state.error?.message || 'Lỗi không xác định'}</p>
          <button onClick={() => window.location.reload()}>
            Tải lại trang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

---

## 6. TESTING STRATEGY

### 6.1. Backend Unit Tests

```javascript
// __tests__/services/activities.service.test.js
const ActivitiesService = require('../../src/modules/activities/activities.service');
const activitiesRepo = require('../../src/modules/activities/activities.repo');

jest.mock('../../src/modules/activities/activities.repo');

describe('ActivitiesService', () => {
  let service;
  
  beforeEach(() => {
    service = new ActivitiesService();
    jest.clearAllMocks();
  });
  
  describe('list', () => {
    it('should return activities for admin', async () => {
      const mockActivities = [{ id: '1', ten_hd: 'Test' }];
      activitiesRepo.findMany.mockResolvedValue({
        data: mockActivities,
        total: 1,
      });
      
      const result = await service.list({}, { role: 'ADMIN', sub: 'user1' });
      
      expect(result.data).toEqual(mockActivities);
      expect(activitiesRepo.findMany).toHaveBeenCalled();
    });
    
    it('should filter by class for student', async () => {
      // Test scope filtering
    });
  });
});
```

### 6.2. Frontend Component Tests

```javascript
// __tests__/components/ActivityCard.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import { ActivityCard } from '../components/ActivityCard';

describe('ActivityCard', () => {
  const mockActivity = {
    id: '1',
    ten_hd: 'Test Activity',
    mo_ta: 'Test description',
    ngay_bd: '2024-01-01',
  };
  
  it('should render activity information', () => {
    render(<ActivityCard activity={mockActivity} />);
    
    expect(screen.getByText('Test Activity')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });
  
  it('should call onView when view button clicked', () => {
    const onView = jest.fn();
    render(<ActivityCard activity={mockActivity} onView={onView} />);
    
    fireEvent.click(screen.getByText('Xem chi tiết'));
    expect(onView).toHaveBeenCalledWith('1');
  });
});
```

---

## 7. PERFORMANCE OPTIMIZATION

### 7.1. React Performance

```javascript
// Memoize expensive components
const ActivityCard = React.memo(({ activity, onView }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  return prevProps.activity.id === nextProps.activity.id;
});

// Use useMemo for expensive calculations
const filteredItems = useMemo(() => {
  return items.filter(item => {
    // Expensive filtering logic
  });
}, [items, filters]);

// Use useCallback for event handlers
const handleRegister = useCallback((id) => {
  // Handler logic
}, [dependencies]);
```

### 7.2. Code Splitting

```javascript
// routes/index.js
import { lazy, Suspense } from 'react';

const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const StudentDashboard = lazy(() => import('../pages/student/DashboardStudentModern'));

function LoadingFallback() {
  return <div>Đang tải...</div>;
}

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/student" element={<StudentDashboard />} />
      </Routes>
    </Suspense>
  );
}
```

---

## KẾT LUẬN

Các đề xuất refactoring này sẽ giúp:
- ✅ Giảm độ phức tạp code
- ✅ Cải thiện maintainability
- ✅ Tăng khả năng mở rộng
- ✅ Cải thiện performance
- ✅ Dễ test hơn

**Ưu tiên thực hiện:**
1. Refactor large components (Frontend)
2. Add testing (Backend + Frontend)
3. Improve state management
4. Performance optimization

