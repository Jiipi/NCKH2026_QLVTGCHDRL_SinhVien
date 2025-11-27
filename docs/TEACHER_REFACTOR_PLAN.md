# Teacher Pages Refactoring Plan
## 3-Tier Architecture + SOLID UI Components

### 📌 Tổng quan

Tài liệu này mô tả kế hoạch refactor các trang Teacher role theo chuẩn 3-tier architecture và SOLID principles, dựa trên pattern mẫu từ Monitor pages.

---

## 🗂️ 1. Current State Analysis

### 1.1 Teacher Routes (từ App.js)
| Route | Page Component | Mô tả |
|-------|----------------|-------|
| `/teacher` | `TeacherDashboardPage` | Dashboard giảng viên |
| `/teacher/activities` | `TeacherActivitiesPage` | Quản lý hoạt động |
| `/teacher/approve` | `TeacherActivityApprovalPage` | Phê duyệt hoạt động |
| `/teacher/registrations/approve` | `TeacherRegistrationApprovalsPage` | Phê duyệt đăng ký |
| `/teacher/students` | `ModernStudentManagement` | Quản lý sinh viên |
| `/teacher/reports` | `ModernReports` | Báo cáo |
| `/teacher/notifications` | `ModernNotifications` | Thông báo |

### 1.2 File Structure - Current
```
frontend/src/
├── features/teacher/
│   ├── ui/
│   │   ├── TeacherDashboardPage.js         ✅ 3-tier (có hook)
│   │   ├── TeacherActivitiesPage.js        ✅ 3-tier (có hook)
│   │   ├── TeacherActivityApprovalPage.js  ⚠️ Cần xem xét
│   │   ├── TeacherRegistrationApprovalsPage.js ❌ Monolithic
│   │   ├── TeacherAttendancePage.js        ⚠️ Cần xem xét
│   │   ├── TeacherStudentScoresPage.js     ⚠️ Cần xem xét
│   │   └── components/
│   │       ├── activities-management/      ✅ Có components
│   │       ├── activity-approval/          ⚠️ Ít components
│   │       ├── dashboard/                  ⚠️ Cần bổ sung
│   │       └── registration-approvals/     ❌ Chưa có
│   ├── services/
│   │   ├── teacherActivitiesApi.js         ✅
│   │   ├── teacherApprovalApi.js           ✅
│   │   ├── teacherAttendanceApi.js         ✅
│   │   ├── teacherDashboardApi.js          ✅
│   │   ├── teacherRegistrationsApi.js      ✅
│   │   └── teacherStudentScoresApi.js      ✅
│   └── model/
│       ├── hooks/
│       │   ├── useTeacherActivities.js     ✅
│       │   ├── useTeacherActivitiesPage.js ✅
│       │   ├── useTeacherActivityApprovalPage.js ✅
│       │   ├── useTeacherApprovals.js      ✅
│       │   ├── useTeacherAttendance.js     ✅
│       │   ├── useTeacherDashboard.js      ✅
│       │   ├── useTeacherRegistrationActions.js ✅
│       │   ├── useTeacherRegistrations.js  ✅
│       │   └── useTeacherStudentScores.js  ✅
│       └── mappers/
│           └── teacher.mappers.js          ✅
│
├── pages/teacher/                          ❌ Legacy - cần migrate
│   ├── ModernStudentManagement.js          ❌ Monolithic (1400+ lines)
│   ├── ModernReports.js                    ❌ Monolithic (1154 lines)
│   ├── ModernNotifications.js              ⚠️ Medium (283 lines)
│   ├── ClassManagement.js                  ❌ Legacy
│   ├── ImportStudents.js                   ⚠️ Cần xem xét
│   └── TeacherProfile.js                   ⚠️ Cần xem xét
```

---

## 🎯 2. Monitor Pattern Reference (Mẫu chuẩn)

### 2.1 3-Tier Architecture
```
features/monitor/
├── ui/                          # Tầng 1: Presentation
│   ├── MonitorDashboardPage.js  # Page component (chỉ render UI)
│   └── components/              # UI Components (SOLID)
│       ├── Dashboard/
│       │   ├── DashboardProfileHeader.js
│       │   ├── DashboardPointsCard.js
│       │   ├── DashboardStatsCard.js
│       │   ├── ActivityListItem.js
│       │   ├── TopStudentItem.js
│       │   └── ActivitySummaryModal.js
│       ├── Activities/
│       ├── Approvals/
│       ├── Students/
│       ├── Reports/
│       └── Notifications/
│
├── model/                       # Tầng 2: Business Logic
│   ├── hooks/
│   │   ├── useMonitorDashboard.js    # Hook chứa business logic
│   │   ├── useMonitorApprovals.js
│   │   └── ...
│   └── mappers/
│       └── monitor.mappers.js        # Data transformation
│
└── services/                    # Tầng 3: Data/API
    ├── monitorDashboardApi.js       # API calls only
    ├── monitorApprovalsApi.js
    └── ...
```

### 2.2 SOLID Principles trong UI Components

| Principle | Áp dụng |
|-----------|---------|
| **S**ingle Responsibility | Mỗi component chỉ làm 1 việc: `DashboardStatsCard` chỉ hiển thị stat card |
| **O**pen/Closed | Components mở rộng qua props, không sửa code gốc |
| **L**iskov Substitution | Các card components có thể thay thế nhau với cùng props interface |
| **I**nterface Segregation | Props được tách riêng, không force component nhận props không cần |
| **D**ependency Inversion | UI phụ thuộc vào abstractions (hooks) không phụ thuộc concrete implementations |

---

## 📋 3. Refactoring Checklist

### 3.1 Page Components cần Refactor

#### ✅ Priority 1: ModernStudentManagement.js (1400+ lines) - **COMPLETED**
**Location:** `pages/teacher/ModernStudentManagement.js` → **MIGRATED**
**Target:** `features/teacher/ui/TeacherStudentManagementPage.js` ✅

**Đã tạo:**
```
features/teacher/
├── ui/
│   ├── TeacherStudentManagementPage.js    ✅ Main page (clean composition)
│   └── components/students/
│       ├── StudentHeader.js               ✅ Neo-brutalism header
│       ├── StudentCard.js                 ✅ Grid view card
│       ├── StudentListItem.js             ✅ List view row
│       ├── StudentList.js                 ✅ Container với view toggle
│       ├── StudentViewModal.js            ✅ View detail với tabs
│       ├── StudentFormModal.js            ✅ Add/Edit form
│       ├── ClassSidebar.js                ✅ Class selection
│       ├── MonitorAssignment.js           ✅ Assign monitor section
│       ├── StudentActionBar.js            ✅ Search & action buttons
│       ├── BulkActionBar.js               ✅ Bulk actions toolbar
│       └── index.js                       ✅ Barrel export
├── model/hooks/
│   └── useTeacherStudentManagement.js     ✅ Business logic (~400 lines)
└── services/
    ├── teacherStudentsApi.js              ✅ API calls
    └── index.js                           ✅ Services index
```

**Migration Notes:**
- Giảm từ 1400+ lines monolithic → ~180 lines page component
- Hook chứa ~400 lines business logic (validation, CRUD, pagination)
- 10 UI components nhỏ, mỗi component ~50-100 lines
- Tuân thủ SOLID: Single Responsibility cho từng component
- Reusable: StudentCard/StudentListItem có thể dùng lại

#### ❌ Priority 2: ModernReports.js (1154 lines)
**Location:** `pages/teacher/ModernReports.js`
**Target:** `features/teacher/ui/TeacherReportsPage.js`

**Cần tạo:**
```
features/teacher/
├── ui/
│   ├── TeacherReportsPage.js              # Main page
│   └── components/reports/
│       ├── ReportsHeader.js               # Header với stats
│       ├── ReportsOverviewTab.js          # Overview charts
│       ├── ReportsDetailedTab.js          # Detailed tables
│       ├── ChartCard.js                   # Reusable chart wrapper
│       ├── StatsSummaryCard.js            # Summary stats
│       ├── TopStudentsTable.js            # Top students
│       └── ExportButtons.js               # Export CSV/PDF
├── model/hooks/
│   └── useTeacherReports.js               # Business logic
└── services/
    └── teacherReportsApi.js               # API calls
```

#### ⚠️ Priority 3: TeacherRegistrationApprovalsPage.js (Monolithic)
**Location:** `features/teacher/ui/TeacherRegistrationApprovalsPage.js`
**Status:** Đã trong features/ nhưng chưa tách components

**Cần tạo:**
```
features/teacher/
├── ui/
│   └── components/registration-approvals/
│       ├── RegistrationHeader.js          # Neo-brutalism header
│       ├── RegistrationStatsCard.js       # Stats cards
│       ├── RegistrationFilters.js         # Search & filters
│       ├── RegistrationCard.js            # Grid/List item
│       ├── BulkActionsBar.js              # Bulk approve/reject
│       └── StatusFilterSection.js         # Status pills
├── model/hooks/
│   └── useTeacherRegistrationApprovals.js # Business logic (tách từ page)
```

#### ⚠️ Priority 4: ModernNotifications.js (283 lines)
**Location:** `pages/teacher/ModernNotifications.js`
**Target:** `features/teacher/ui/TeacherNotificationsPage.js`

**Cần tạo:**
```
features/teacher/
├── ui/
│   ├── TeacherNotificationsPage.js        # Main page
│   └── components/notifications/
│       ├── NotificationHeader.js          # Header với stats
│       ├── NotificationTemplates.js       # Quick templates
│       ├── NotificationForm.js            # Send form
│       ├── NotificationHistory.js         # Sent history
│       └── NotificationDetailModal.js     # View detail
├── model/hooks/
│   └── useTeacherNotifications.js         # Business logic
└── services/
    └── teacherNotificationsApi.js         # API calls
```

---

## 🧩 4. Shared Components (Dùng chung)

### 4.1 Neo-Brutalism Components
```
shared/components/neo-brutalism/
├── NeoBrutalistHeader.js          # Animated header với grid background
├── NeoBrutalistStatsCard.js       # Stat card với shadow effect
├── NeoBrutalistBadge.js           # Badge component
├── NeoBrutalistButton.js          # Button variants
└── index.js                       # Export all
```

### 4.2 Common UI Components
```
shared/components/common/
├── Pagination.js                  # ✅ Đã có
├── SearchBar.js                   # Search input
├── StatusFilter.js                # Status pills/dropdown
├── ViewModeToggle.js              # Grid/List toggle
├── AdvancedFilters.js             # Expandable filters
├── EmptyState.js                  # No data state
├── LoadingState.js                # Loading spinner
└── index.js
```

### 4.3 Form Components
```
shared/components/forms/
├── FormInput.js
├── FormSelect.js
├── FormTextarea.js
├── FormDatePicker.js
├── FormCheckbox.js
└── index.js
```

---

## 📊 5. Implementation Priority

### Phase 1: Shared Components (1-2 ngày)
1. ✅ Tạo `NeoBrutalistHeader.js`
2. ✅ Tạo `NeoBrutalistStatsCard.js`
3. ✅ Tạo `ViewModeToggle.js`
4. ✅ Tạo `StatusFilter.js`
5. ✅ Tạo `SearchBar.js`
6. ✅ Tạo `AdvancedFilters.js`

### Phase 2: TeacherRegistrationApprovalsPage (1 ngày)
1. Tách components từ page hiện có
2. Tạo hook `useTeacherRegistrationApprovals.js`
3. Refactor page sử dụng hook và components

### Phase 3: ModernStudentManagement (2-3 ngày)
1. Tạo `teacherStudentsApi.js`
2. Tạo `useTeacherStudentManagement.js`
3. Tạo các UI components
4. Migrate page từ `pages/` sang `features/`

### Phase 4: ModernReports (1-2 ngày)
1. Tạo `teacherReportsApi.js`
2. Tạo `useTeacherReports.js`
3. Tạo các UI components
4. Migrate page

### Phase 5: ModernNotifications (1 ngày)
1. Tạo `teacherNotificationsApi.js`
2. Tạo `useTeacherNotifications.js`
3. Tạo các UI components
4. Migrate page

---

## 📝 6. Code Examples

### 6.1 Hook Pattern (Business Logic Layer)
```javascript
// features/teacher/model/hooks/useTeacherStudentManagement.js

import { useState, useEffect, useCallback, useMemo } from 'react';
import { teacherStudentsApi } from '../../services/teacherStudentsApi';
import { mapStudentsToUI } from '../mappers/teacher.mappers';

export default function useTeacherStudentManagement() {
  // State
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [studentsRes, classesRes] = await Promise.all([
        teacherStudentsApi.getStudents({ classId: selectedClass, search: searchTerm }),
        teacherStudentsApi.getClasses()
      ]);
      
      if (studentsRes.success) {
        setStudents(mapStudentsToUI(studentsRes.data));
        setPagination(prev => ({ ...prev, total: studentsRes.data.length }));
      }
      
      if (classesRes.success) {
        setClasses(classesRes.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedClass, searchTerm]);

  // Effects
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Memoized values
  const filteredStudents = useMemo(() => {
    // Filter logic
    return students;
  }, [students, searchTerm]);

  const paginatedStudents = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;
    return filteredStudents.slice(start, start + pagination.limit);
  }, [filteredStudents, pagination]);

  // Actions
  const handleAddStudent = useCallback(async (data) => {
    const result = await teacherStudentsApi.addStudent(data);
    if (result.success) {
      await loadData();
    }
    return result;
  }, [loadData]);

  // Return
  return {
    // Data
    students: paginatedStudents,
    classes,
    loading,
    error,
    
    // UI State
    selectedClass,
    setSelectedClass,
    searchTerm,
    setSearchTerm,
    viewMode,
    setViewMode,
    pagination,
    setPagination,
    
    // Actions
    refresh: loadData,
    addStudent: handleAddStudent,
    // ... more actions
  };
}
```

### 6.2 API Service Pattern (Data Layer)
```javascript
// features/teacher/services/teacherStudentsApi.js

import http from '../../../shared/api/http';

const handleError = (error) => {
  const message = error.response?.data?.message || error.message || 'Đã có lỗi xảy ra.';
  return { success: false, error: message };
};

export const teacherStudentsApi = {
  async getStudents(params = {}) {
    try {
      const response = await http.get('/teacher/students', { params });
      return { success: true, data: response?.data?.data || [] };
    } catch (error) {
      return handleError(error);
    }
  },

  async getClasses() {
    try {
      const response = await http.get('/teacher/classes');
      return { success: true, data: response?.data?.data || [] };
    } catch (error) {
      return handleError(error);
    }
  },

  async addStudent(data) {
    try {
      const response = await http.post('/teacher/students', data);
      return { success: true, data: response?.data?.data };
    } catch (error) {
      return handleError(error);
    }
  },
  
  // ... more methods
};

export default teacherStudentsApi;
```

### 6.3 UI Component Pattern (Presentation Layer)
```javascript
// features/teacher/ui/components/students/StudentStatsCard.js

import React from 'react';

export default function StudentStatsCard({ 
  icon: Icon, 
  value, 
  label, 
  bgColor = 'bg-blue-400',
  textColor = 'text-white' 
}) {
  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
      <div className={`relative ${bgColor} border-4 border-black rounded-xl p-3 transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 h-full flex flex-col`}>
        <div className="flex items-center justify-between mb-2">
          <Icon className={`w-5 h-5 ${textColor}`} />
        </div>
        <p className={`text-3xl font-black ${textColor} mb-0.5`}>{value}</p>
        <p className={`text-[10px] font-black ${textColor}/70 uppercase tracking-wider`}>{label}</p>
      </div>
    </div>
  );
}
```

---

## ✅ 7. Checklist hoàn thành

- [ ] Phase 1: Shared Components
  - [ ] NeoBrutalistHeader
  - [ ] NeoBrutalistStatsCard
  - [ ] ViewModeToggle
  - [ ] StatusFilter
  - [ ] SearchBar
  - [ ] AdvancedFilters

- [ ] Phase 2: TeacherRegistrationApprovalsPage
  - [ ] Tạo components/registration-approvals/
  - [ ] Tạo useTeacherRegistrationApprovals.js
  - [ ] Refactor page

- [ ] Phase 3: ModernStudentManagement
  - [ ] Tạo teacherStudentsApi.js
  - [ ] Tạo useTeacherStudentManagement.js
  - [ ] Tạo components/students/
  - [ ] Migrate TeacherStudentManagementPage.js

- [ ] Phase 4: ModernReports
  - [ ] Tạo teacherReportsApi.js
  - [ ] Tạo useTeacherReports.js
  - [ ] Tạo components/reports/
  - [ ] Migrate TeacherReportsPage.js

- [ ] Phase 5: ModernNotifications
  - [ ] Tạo teacherNotificationsApi.js
  - [ ] Tạo useTeacherNotifications.js
  - [ ] Tạo components/notifications/
  - [ ] Migrate TeacherNotificationsPage.js

- [ ] Phase 6: Cleanup
  - [ ] Remove legacy pages/teacher/ files
  - [ ] Update App.js imports
  - [ ] Update tests

---

## 📚 8. References

- Monitor Dashboard Pattern: `features/monitor/ui/MonitorDashboardPage.js`
- Monitor Hook Pattern: `features/monitor/model/hooks/useMonitorDashboard.js`
- Monitor API Pattern: `features/monitor/services/monitorDashboardApi.js`
- Existing Teacher Hook: `features/teacher/model/hooks/useTeacherDashboard.js`

---

*Last updated: 2025-01-25*
