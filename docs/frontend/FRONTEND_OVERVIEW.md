# Frontend Technical Overview

## 🏗️ Kiến trúc tổng quan

Frontend được xây dựng theo **Feature-Sliced Design (FSD)** kết hợp **3-Tier Architecture**, đảm bảo code modular và dễ bảo trì.

```
frontend/src/
├── App.js           # Main application component
├── index.js         # Entry point
├── entities/        # Domain entities (6 files)
├── features/        # Feature modules (17 features, 531 files)
├── shared/          # Shared resources (105 files)
└── widgets/         # Layout widgets (13 files)
```

---

## 📦 Features (17 feature modules)

| Feature | Mô tả | Files |
|---------|-------|-------|
| `activities` | Danh sách hoạt động | 38 |
| `activity-types` | Loại hoạt động | 17 |
| `admin` | Admin dashboard & quản lý | 55 |
| `approvals` | Phê duyệt hoạt động | 27 |
| `auth` | Đăng nhập/đăng xuất | 27 |
| `classes` | Quản lý lớp học | 20 |
| `dashboard` | Dashboard theo role | 27 |
| `monitor` | Lớp trưởng chức năng | 59 |
| `notifications` | Hệ thống thông báo | 11 |
| `profile` | Hồ sơ cá nhân | 9 |
| `qr-attendance` | Điểm danh QR | 31 |
| `reports` | Báo cáo & thống kê | 41 |
| `semesters` | Quản lý học kỳ | 7 |
| `settings` | Cài đặt | 7 |
| `student` | Sinh viên chức năng | 53 |
| `teacher` | Giảng viên chức năng | 87 |
| `users` | Quản lý người dùng | 14 |

---

## 🎯 3-Tier Architecture (per feature)

Mỗi feature được tổ chức theo 3 tầng:

```
features/[feature-name]/
├── services/        # Tầng 3: Data/API Layer
│   └── *Api.js      # HTTP calls only
├── model/           # Tầng 2: Business Logic
│   ├── hooks/       # Custom React hooks
│   ├── mappers/     # Data transformation
│   └── utils/       # Feature utilities
└── ui/              # Tầng 1: Presentation
    ├── pages/       # Page components
    └── components/  # UI components
```

### Ví dụ Flow
```
UI Component → useHook() → serviceApi.fetch() → Backend API
```

---

## 🔧 Shared Layer

Shared layer chứa resources dùng chung:

```
shared/
├── api/             # HTTP client (axios)
├── components/      # Reusable components
├── contexts/        # React Contexts (Auth, Notification)
├── hooks/           # Shared hooks
├── lib/             # Utilities (date, role, validation)
├── store/           # Zustand store
├── styles/          # Global CSS
└── ui/              # Base UI primitives
```

---

## 🧩 Widgets

Layout và composite components:

```
widgets/
├── header/          # Header component
├── layout/          # Student/Teacher/Monitor/Admin layouts
└── semester/        # Semester filter & switcher
```

---

## 🎨 Component Categories

### UI Primitives (`shared/ui/`)
- Card, Modal, Button, Input, Table, Pagination

### Common Components (`shared/components/common/`)
- LoadingSpinner, EmptyState, Toast, ConfirmModal

### Layout Components (`shared/components/layout/`)
- Header, StudentSidebar, TeacherSidebar, MonitorSidebar

### Session Components (`shared/components/session/`)
- MultiSessionIndicator, PermissionGuard, TabManager

---

## 🔐 State Management

### Zustand Store
```javascript
import { useAppStore } from '../shared/store';
const { user, token, setAuth, logout } = useAppStore();
```

### React Context
```javascript
// Notifications
import { useNotification } from '../shared/contexts/NotificationContext';
const { showSuccess, showError } = useNotification();

// Tab Session
import { useTabSession } from '../shared/contexts/TabSessionContext';
```

---

## 🔄 Routing & Guards

- **React Router v6** cho điều hướng
- **Route Guards** theo role (SINH_VIEN, GIANG_VIEN, LOP_TRUONG, ADMIN)
- **Permission-based rendering** cho UI elements

---

## 🚀 Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI Library |
| **React Router v6** | Routing |
| **Axios** | HTTP Client |
| **Zustand** | State Management |
| **React Query** | Data Fetching Cache |
| **TailwindCSS** | Styling |
| **Chart.js** | Charts |
| **QRCode.react** | QR Generation |

---

## 📊 Build Stats

| Metric | Value |
|--------|-------|
| Main JS | ~537 kB |
| Chunk JS | ~121 kB |
| CSS | ~26 kB |

---

## 📝 Scripts

```bash
npm run dev        # Development server
npm run build      # Production build
npm run test       # Run tests
npm run lint       # ESLint check
```

---

*Cập nhật: Tháng 12/2025*
