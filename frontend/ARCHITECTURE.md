# Frontend Architecture - Clean Architecture + 3-Tier Pattern

## 📁 Cấu trúc thư mục

```
src/
├── App.js               # Main application component
├── index.js             # Entry point
│
├── shared/              # 🔧 Shared resources (cross-cutting concerns)
│   ├── api/             # HTTP client, base URLs, session storage
│   ├── components/      # Reusable UI components
│   │   ├── common/      # LoadingSpinner, Pagination, Toast, etc.
│   │   ├── forms/       # Form components
│   │   ├── layout/      # Header, Sidebars, Layouts
│   │   ├── neo-brutalism/ # Design system components
│   │   ├── semester/    # SemesterClosureBanner, Widget
│   │   └── session/     # MultiSession, SessionMonitor, PermissionGuard
│   ├── contexts/        # React Contexts (Auth, Notification, TabSession)
│   ├── hooks/           # Custom hooks (useSemesterData, useDebounce, etc.)
│   ├── lib/             # Utility functions (date, role, validation)
│   ├── services/        # Shared services
│   ├── store/           # Zustand store (useAppStore)
│   ├── styles/          # Global CSS
│   └── ui/              # Base UI primitives (Modal, Button, etc.)
│
├── features/            # 🎯 Feature modules (domain-driven)
│   ├── activities/      # Hoạt động
│   ├── admin/           # Admin dashboard
│   ├── approvals/       # Phê duyệt
│   ├── auth/            # Đăng nhập/đăng ký
│   ├── classes/         # Quản lý lớp
│   ├── dashboard/       # Dashboard
│   ├── monitor/         # Lớp trưởng
│   ├── notifications/   # Thông báo
│   ├── profile/         # Hồ sơ
│   ├── qr-attendance/   # Điểm danh QR
│   ├── reports/         # Báo cáo
│   ├── semesters/       # Học kỳ
│   ├── settings/        # Cài đặt
│   ├── student/         # Sinh viên
│   ├── teacher/         # Giảng viên
│   └── users/           # Quản lý người dùng
│
├── entities/            # 📦 Domain entities
│   ├── activity/        # Activity entity
│   └── user/            # User entity
│
└── widgets/             # 🧩 Complex composed components
    ├── header/          # Header widget
    ├── layout/          # Layout widgets
    └── semester/        # Semester widgets
```

## 🏗️ 3-Tier Architecture (trong mỗi feature)

```
features/[feature-name]/
├── model/               # Tầng 1: Business Logic
│   ├── hooks/           # Custom hooks cho feature
│   ├── mappers/         # Data transformation
│   └── utils/           # Feature-specific utilities
│
├── services/            # Tầng 2: Data Access
│   └── [feature]Api.js  # API calls
│
└── ui/                  # Tầng 3: Presentation
    ├── [Feature]Page.js # Page components
    └── components/      # Feature-specific components
```

## 📝 Import Convention

### ✅ Đúng cách (sử dụng shared/)

```javascript
// Contexts
import { useNotification } from '../../../shared/contexts/NotificationContext';
import { useTabSession } from '../../../shared/contexts/TabSessionContext';

// Hooks
import useSemesterData from '../../../shared/hooks/useSemesterData';
import { useDebounce } from '../../../shared/hooks';

// Store
import { useAppStore } from '../../../shared/store';

// Components
import { LoadingSpinner, Pagination } from '../../../shared/components/common';
import Header from '../../../shared/components/layout/Header';
import SemesterClosureBanner from '../../../shared/components/semester/SemesterClosureBanner';

// API
import http from '../../../shared/api/http';

// Utils
import { formatDateVN } from '../../../shared/lib/date';
import { normalizeRole } from '../../../shared/lib/role';
```

### ❌ Không dùng (legacy paths - deprecated)

```javascript
// DON'T USE - these are deprecated re-exports
import { useNotification } from '../../../contexts/NotificationContext';
import useSemesterData from '../../../hooks/useSemesterData';
import { useAppStore } from '../../../store/useAppStore';
import Header from '../../../components/Header';
```

## 🔄 Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   UI Layer  │────▶│ Model Layer │────▶│Service Layer│
│  (ui/*.js)  │     │ (hooks/*.js)│     │ (*Api.js)   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                  │                    │
       │                  │                    │
       ▼                  ▼                    ▼
   Components         Business            HTTP Client
   + Pages            Logic               + Backend API
```

## 📦 Barrel Exports

Mỗi folder có `index.js` để export tất cả public APIs:

```javascript
// shared/hooks/index.js
export { useDebounce } from './useDebounce';
export { usePagination } from './usePagination';
export { default as useSemesterData } from './useSemesterData';
// ...

// Usage
import { useDebounce, usePagination, useSemesterData } from '../../../shared/hooks';
```

## 🎨 Component Categories

### shared/components/common/
- `LoadingSpinner` - Loading indicator
- `Pagination` - Pagination component
- `Toast` - Toast notifications
- `ConfirmModal` - Confirmation dialog
- `EmptyState` - Empty state display
- `AvatarUpload` - Avatar upload component
- `SemesterFilter` - Semester filter dropdown

### shared/components/layout/
- `Header` - Main header
- `StudentSidebar` - Student navigation
- `TeacherSidebar` - Teacher navigation
- `MonitorSidebar` - Monitor navigation
- `AdminStudentLayout` - Admin layout for student management
- `ClassManagementLayout` - Class management layout

### shared/components/session/
- `MultiSessionIndicator` - Multi-session warning
- `SessionMonitor` - Session activity monitor
- `PermissionGuard` - Permission-based access control
- `TabManager` - Browser tab management

### shared/components/semester/
- `SemesterClosureBanner` - Semester closure notification
- `SemesterClosureWidget` - Dashboard semester widget

## 🔐 State Management

### Zustand Store (useAppStore)
```javascript
import { useAppStore } from '../../../shared/store';

const { user, token, setAuth, logout } = useAppStore();
```

### React Context
```javascript
// Notifications
import { useNotification } from '../../../shared/contexts/NotificationContext';
const { showSuccess, showError, showWarning } = useNotification();

// Tab Session
import { useTabSession } from '../../../shared/contexts/TabSessionContext';
const { saveSession, clearSession } = useTabSession();
```

## 📊 Build Stats

- **Bundle size**: ~659 KB gzip
- **CSS size**: ~26 KB gzip
- **Total features**: 18 modules
- **Shared components**: 30+ components

---

*Last updated: November 2025*
