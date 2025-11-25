# Kiến trúc Frontend - 3 Tầng (3-Layer Architecture)

## 📋 Tổng quan

Frontend được tổ chức theo kiến trúc 3 tầng tương tự backend, đảm bảo tách biệt rõ ràng giữa UI, Business Logic và Data Access.

## 🏗️ Cấu trúc 3 Tầng

### Tầng 1: UI / View (Presentation Layer)
**Vị trí**: `src/features/{feature}/ui/` hoặc `src/features/{feature}/components/`

**Trách nhiệm**:
- Chỉ lo hiển thị UI (JSX)
- Nhận props và render
- Gọi callbacks từ hooks
- Không chứa logic nghiệp vụ phức tạp
- Không gọi API trực tiếp

**Ví dụ**:
```javascript
// ✅ ĐÚNG - Component chỉ hiển thị
function ActivityCard({ activity, onRegister }) {
  return (
    <div>
      <h3>{activity.ten_hd}</h3>
      <button onClick={() => onRegister(activity.id)}>Đăng ký</button>
    </div>
  );
}

// ❌ SAI - Component gọi API trực tiếp
function ActivityCard({ activity }) {
  const handleRegister = async () => {
    await http.post(`/activities/${activity.id}/register`); // ❌ Không nên
  };
  return <button onClick={handleRegister}>Đăng ký</button>;
}
```

### Tầng 2: Business Logic / Domain (Business Layer)
**Vị trí**: `src/features/{feature}/model/` hoặc `src/features/{feature}/hooks/`

**Trách nhiệm**:
- Xử lý logic nghiệp vụ (use-cases)
- Quản lý state (useState, useReducer)
- Validation, mapping data
- Filtering, sorting, pagination logic
- Quyết định hiển thị dựa trên role/permission

**Ví dụ**:
```javascript
// ✅ ĐÚNG - Hook xử lý logic nghiệp vụ
function useActivities() {
  const { data, isLoading } = useActivitiesQuery();
  const [filter, setFilter] = useState({ semester: 'hoc_ky_1-2025' });
  
  // Business logic: Lọc hoạt động theo học kỳ
  const filteredActivities = useMemo(() => {
    return data?.filter(activity => 
      activity.hoc_ky === filter.semester
    ) || [];
  }, [data, filter]);
  
  // Business logic: Quyết định hiển thị nút phê duyệt
  const canApprove = useMemo(() => {
    return userRole === 'GIANG_VIEN' || userRole === 'LOP_TRUONG';
  }, [userRole]);
  
  return {
    activities: filteredActivities,
    isLoading,
    filter,
    setFilter,
    canApprove
  };
}
```

### Tầng 3: Data / API / Infrastructure (Data Layer)
**Vị trí**: `src/features/{feature}/services/` hoặc `src/shared/api/`

**Trách nhiệm**:
- **DUY NHẤT** nơi gọi API
- Định nghĩa service functions
- Xử lý request/response
- Error handling ở tầng API
- Cache management (nếu dùng)

**Ví dụ**:
```javascript
// ✅ ĐÚNG - Service chỉ gọi API
export const activitiesApi = {
  async getActivities(params) {
    const res = await http.get('/core/activities', { params });
    return res?.data?.data || res?.data || [];
  },
  
  async registerActivity(activityId) {
    const res = await http.post(`/core/activities/${activityId}/register`);
    return res?.data?.data || res?.data;
  }
};
```

## 📁 Cấu trúc thư mục đề xuất

```
src/
├── features/
│   └── activities/
│       ├── ui/                    # Tầng 1: Presentation
│       │   ├── ActivityCard.jsx
│       │   ├── ActivityList.jsx
│       │   ├── ActivityFilters.jsx
│       │   └── pages/
│       │       ├── ActivitiesPage.jsx
│       │       └── ActivityDetailPage.jsx
│       │
│       ├── model/                 # Tầng 2: Business Logic
│       │   ├── hooks/
│       │   │   ├── useActivities.js      # Fetch + filter + pagination
│       │   │   ├── useActivityFilters.js # Filter logic
│       │   │   └── useActivityPermissions.js # Permission logic
│       │   ├── types/
│       │   │   └── activity.types.js      # TypeScript types hoặc PropTypes
│       │   └── mappers/
│       │       └── activity.mappers.js    # Map API response -> UI model
│       │
│       └── services/              # Tầng 3: Data/API
│           └── activitiesApi.js   # Chỉ gọi API
│
├── shared/
│   ├── api/                       # Infrastructure chung
│   │   ├── http.js                # Axios instance
│   │   ├── endpoints.js           # API endpoints
│   │   └── interceptors.js        # Request/Response interceptors
│   │
│   └── components/                 # Components dùng chung
│       ├── Button.jsx
│       ├── Modal.jsx
│       └── Table.jsx
│
└── app/                           # App-level
    ├── App.jsx
    ├── routes/
    └── providers/
```

## 🔄 Luồng dữ liệu

```
UI Component (Tầng 1)
    ↓ gọi hook
Business Hook (Tầng 2)
    ↓ gọi service
API Service (Tầng 3)
    ↓ gọi HTTP
Backend API
```

**Ví dụ cụ thể**:

```javascript
// Tầng 1: UI Component
function ActivitiesPage() {
  const { activities, isLoading, filter, setFilter } = useActivities();
  
  return (
    <div>
      <ActivityFilters filter={filter} onFilterChange={setFilter} />
      {isLoading ? <Loading /> : <ActivityList activities={activities} />}
    </div>
  );
}

// Tầng 2: Business Hook
function useActivities() {
  const [filter, setFilter] = useState({});
  
  // Gọi service (Tầng 3)
  const { data, isLoading } = useQuery(
    ['activities', filter],
    () => activitiesApi.getActivities(filter)
  );
  
  // Business logic: Filter, sort, map
  const processedActivities = useMemo(() => {
    return data?.map(mapActivityToUI) || [];
  }, [data]);
  
  return {
    activities: processedActivities,
    isLoading,
    filter,
    setFilter
  };
}

// Tầng 3: API Service
export const activitiesApi = {
  async getActivities(params) {
    const res = await http.get('/core/activities', { params });
    return res?.data?.data || res?.data || [];
  }
};
```

## 📝 Quy tắc và Best Practices

### ✅ NÊN LÀM

1. **Tầng 1 (UI)**:
   - Chỉ render JSX
   - Nhận props và gọi callbacks
   - Sử dụng hooks từ Tầng 2

2. **Tầng 2 (Business)**:
   - Xử lý tất cả logic nghiệp vụ
   - Validation, filtering, sorting
   - Quyết định permission/role
   - Gọi services từ Tầng 3

3. **Tầng 3 (Data)**:
   - Chỉ gọi API
   - Không có business logic
   - Xử lý error ở tầng này

### ❌ KHÔNG NÊN

1. **Tầng 1 không được**:
   - Gọi API trực tiếp (`http.get`, `http.post`)
   - Chứa logic nghiệp vụ phức tạp
   - Quyết định permission/role

2. **Tầng 2 không được**:
   - Gọi API trực tiếp (phải qua Tầng 3)
   - Render JSX

3. **Tầng 3 không được**:
   - Chứa business logic
   - Render UI

## 🔍 Ví dụ Refactor

### Trước (Code hiện tại - Lẫn lộn tầng):

```javascript
// ❌ Component vừa render vừa gọi API
function ActivityCard({ activity }) {
  const [loading, setLoading] = useState(false);
  
  const handleRegister = async () => {
    setLoading(true);
    try {
      await http.post(`/activities/${activity.id}/register`); // ❌ Gọi API trực tiếp
      alert('Đăng ký thành công');
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <h3>{activity.ten_hd}</h3>
      <button onClick={handleRegister} disabled={loading}>
        Đăng ký
      </button>
    </div>
  );
}
```

### Sau (Code refactor - Tách rõ 3 tầng):

```javascript
// ✅ Tầng 1: UI Component
function ActivityCard({ activity, onRegister, isRegistering }) {
  return (
    <div>
      <h3>{activity.ten_hd}</h3>
      <button onClick={() => onRegister(activity.id)} disabled={isRegistering}>
        Đăng ký
      </button>
    </div>
  );
}

// ✅ Tầng 2: Business Hook
function useActivityRegistration() {
  const [isRegistering, setIsRegistering] = useState(false);
  const { showSuccess, showError } = useNotification();
  
  const registerActivity = async (activityId) => {
    setIsRegistering(true);
    try {
      await activitiesApi.registerActivity(activityId); // Gọi service
      showSuccess('Đăng ký thành công');
    } catch (error) {
      showError(error.message || 'Đăng ký thất bại');
    } finally {
      setIsRegistering(false);
    }
  };
  
  return { registerActivity, isRegistering };
}

// ✅ Tầng 3: API Service
export const activitiesApi = {
  async registerActivity(activityId) {
    const res = await http.post(`/core/activities/${activityId}/register`);
    return res?.data?.data || res?.data;
  }
};

// ✅ Sử dụng trong Page
function ActivitiesPage() {
  const { activities } = useActivities();
  const { registerActivity, isRegistering } = useActivityRegistration();
  
  return (
    <div>
      {activities.map(activity => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          onRegister={registerActivity}
          isRegistering={isRegistering}
        />
      ))}
    </div>
  );
}
```

## 🎯 Lợi ích

1. **Tách biệt rõ ràng**: Mỗi tầng có trách nhiệm riêng
2. **Dễ test**: Test từng tầng độc lập
3. **Dễ maintain**: Thay đổi API không ảnh hưởng UI
4. **Tái sử dụng**: Business logic có thể dùng ở nhiều UI
5. **Consistency**: Đồng nhất với backend architecture

## 📚 Tài liệu tham khảo

- Backend Architecture: `backend/APP_CORE_ANALYSIS.md`
- Feature-Sliced Design: https://feature-sliced.design/
- Clean Architecture: https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html

