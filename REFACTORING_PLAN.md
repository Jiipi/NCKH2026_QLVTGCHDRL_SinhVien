# 🔄 Kế hoạch Refactoring - Đồng bộ dữ liệu cho tất cả Role

## 📊 **Vấn đề hiện tại**

### 1. **Code Duplication (Lặp code)**
- Mỗi role tự code logic filter riêng
- Logic tính toán không nhất quán giữa các role
- Mỗi component tự parse data theo cách riêng

### 2. **Data Inconsistency (Dữ liệu không đồng nhất)**
- Student thấy 10 hoạt động, Monitor thấy 8 hoạt động → **SAI**
- Cùng 1 filter học kỳ nhưng kết quả khác nhau
- Đếm số lượng hoạt động không chính xác

### 3. **Maintainability (Khó bảo trì)**
- Sửa logic ở 1 chỗ phải sửa ở 4 chỗ (4 roles)
- Dễ quên update một role → bug
- Khó test vì mỗi role khác nhau

---

## ✅ **Giải pháp: Single Source of Truth**

### **Nguyên tắc:**
> "Một logic chỉ code ở MỘT NƠI duy nhất, tất cả các role đều dùng chung"

### **Kiến trúc mới:**

```
┌─────────────────────────────────────────┐
│   SHARED UTILITIES (utils/)             │
│   ✓ activityFilters.js                  │
│     - normalizeActivity()               │
│     - isClassActivity()                 │
│     - isAvailableForRegistration()      │
│     - filterUpcomingActivities()        │
│     ... (tất cả logic filter)           │
└─────────────────────────────────────────┘
                    ▲
                    │ import & use
                    │
    ┌───────────────┴───────────────┐
    │                               │
┌───▼─────┐  ┌──────▼───┐  ┌──────▼────┐  ┌──────▼───┐
│ Student │  │ Monitor  │  │  Teacher  │  │  Admin   │
│Dashboard│  │Dashboard │  │ Dashboard │  │Dashboard │
└─────────┘  └──────────┘  └───────────┘  └──────────┘
   │              │              │              │
   │              │              │              │
   └──────────────┴──────────────┴──────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │   CUSTOM HOOKS        │
        │   ✓ useActivities()   │
        │   ✓ useMyActivities() │
        └───────────────────────┘
```

---

## 🎯 **Migration Strategy (Chiến lược chuyển đổi)**

### **Phase 1: Foundation (Nền tảng) - 1-2 ngày**

#### ✅ **Đã hoàn thành:**
- [x] Tạo `utils/activityFilters.js`
- [x] Tạo `hooks/useActivities.js`
- [x] Tạo tài liệu migration

#### 🔜 **Cần làm tiếp:**
- [ ] Test các utility functions riêng lẻ
- [ ] Viết unit tests cho các filter functions

---

### **Phase 2: Migrate Student Role - 1 ngày**

#### **Files cần sửa:**
1. `pages/student/DashboardStudentModern.js`
2. `pages/student/ActivitiesListModern.js`

#### **Cách migrate:**

**TRƯỚC (code cũ):**
```javascript
// ❌ Code riêng, khó maintain
const loadActivities = async () => {
  const response = await http.get('/activities', { params: { semester } });
  const data = response.data?.data || {};
  const items = data.items || [];
  
  // Logic lọc riêng
  const available = items.filter(a => 
    a.is_class_activity === true && 
    a.trang_thai === 'da_duyet' &&
    // ... nhiều điều kiện khác
  );
};
```

**SAU (dùng shared utilities):**
```javascript
// ✅ Dùng hook & utilities chung
import { useActivities } from '../../hooks/useActivities';

const { 
  activities, 
  loading, 
  getFiltered, 
  getCounts 
} = useActivities({ semester, role: 'student' });

// Lấy hoạt động có sẵn
const availableActivities = getFiltered('available', { 
  userRegistrations: myRegistrations 
});

// Lấy counts
const counts = getCounts();
```

**Lợi ích:**
- ✅ Code ngắn gọn hơn 70%
- ✅ Logic đồng nhất với các role khác
- ✅ Tự động chuẩn hóa data
- ✅ Dễ debug

---

### **Phase 3: Migrate Monitor Role - 1 ngày**

#### **Files cần sửa:**
1. `pages/monitor/MonitorDashboard.js`
2. `pages/monitor/ClassActivities.js`

#### **Ví dụ migrate `MonitorDashboard.js`:**

**TRƯỚC:**
```javascript
// ❌ Logic riêng, khác với student
const allActsRaw = activitiesRes?.data?.data || activitiesRes?.data?.items || [];
const allActs = (Array.isArray(allActsRaw) ? allActsRaw : [])
  .filter(filterBySemester)
  .filter(isClassActivity)
  .filter(a => (a.trang_thai || '').toLowerCase() === 'da_duyet');
```

**SAU:**
```javascript
// ✅ Dùng chung logic với student
import { useActivities, useMyActivities } from '../../hooks/useActivities';

const { getFiltered: getActivities } = useActivities({ 
  semester, 
  role: 'monitor' 
});

const { myActivities } = useMyActivities({ semester });

// Lấy upcoming activities
const upcomingActivities = getActivities('upcoming');

// Lấy my activities cho "Hoạt động gần đây"
const recentActivities = myActivities.slice(0, 20);
```

---

### **Phase 4: Migrate Teacher & Admin Roles - 1-2 ngày**

Tương tự như Monitor, áp dụng cùng pattern.

---

## 📋 **Checklist Migration cho mỗi Component**

### **Khi migrate một component:**

- [ ] **Import shared utilities**
  ```javascript
  import { useActivities } from '../../hooks/useActivities';
  import { normalizeActivity } from '../../utils/activityFilters';
  ```

- [ ] **Replace custom fetch logic**
  - Xóa các hàm `loadActivities()` tự viết
  - Dùng `useActivities()` hook

- [ ] **Replace custom filter logic**
  - Xóa các filter riêng như `isAvailable()`, `isClassActivity()`
  - Dùng `getFiltered()` method

- [ ] **Update counts**
  - Xóa manual counting
  - Dùng `getCounts()` method

- [ ] **Normalize data trước khi render**
  ```javascript
  const normalized = normalizeActivity(activity);
  // Giờ có thể dùng normalized.ten_hd, normalized.ngay_bd, etc.
  ```

- [ ] **Test kỹ:**
  - [ ] Filter học kỳ hoạt động đúng
  - [ ] Số lượng hoạt động khớp với role khác
  - [ ] Tab switching không bị lỗi
  - [ ] Modal detail mở đúng

---

## 🧪 **Testing Plan**

### **Test Case 1: Semester Filter Consistency**
```
Given: Có 10 hoạt động lớp trong học kỳ 1-2024
When: 
  - Student chọn học kỳ 1-2024
  - Monitor chọn học kỳ 1-2024
  - Teacher chọn học kỳ 1-2024
Then: 
  - Tất cả phải thấy CÙNG 10 hoạt động
  - Counts phải giống nhau
```

### **Test Case 2: Available Activities Filter**
```
Given: 
  - 10 hoạt động lớp đã duyệt
  - 2 trong số đó đã hết chỗ
  - 1 đã kết thúc
  - User đã đăng ký 1 hoạt động
When: Xem tab "Có sẵn"
Then: 
  - Phải hiện 6 hoạt động (10 - 2 - 1 - 1)
  - Student và Monitor thấy CÙNG 6 hoạt động này
```

### **Test Case 3: Status Badge Consistency**
```
Given: User có 1 đăng ký trạng thái "cho_duyet"
When: Xem "Hoạt động của tôi"
Then:
  - Student dashboard: badge vàng "Chờ duyệt"
  - Monitor dashboard: badge vàng "Chờ duyệt" (GIỐNG HỆT)
```

---

## 🚀 **Implementation Order (Thứ tự thực hiện)**

### **Tuần 1: Foundation + Student**
1. ✅ Setup utilities & hooks (DONE)
2. Migrate Student Dashboard
3. Migrate Student Activities List
4. Test Student role thoroughly

### **Tuần 2: Monitor + Teacher**
5. Migrate Monitor Dashboard
6. Migrate Monitor Class Activities
7. Migrate Teacher Dashboard
8. Migrate Teacher Class Management
9. Test Monitor + Teacher roles

### **Tuần 3: Admin + Polish**
10. Migrate Admin Dashboard
11. Migrate Admin Activity Management
12. Cross-role testing
13. Performance optimization
14. Documentation update

---

## 📚 **Usage Examples**

### **Example 1: Dashboard Component**
```javascript
import { useActivities, useMyActivities } from '../../hooks/useActivities';

function Dashboard() {
  const semester = sessionStorage.getItem('current_semester');
  
  // Get all activities
  const { getFiltered, getCounts } = useActivities({ semester });
  
  // Get my registrations
  const { myActivities, pending, approved } = useMyActivities({ semester });
  
  // Filter upcoming
  const upcoming = getFiltered('upcoming');
  
  // Get counts
  const { da_duyet, cho_duyet } = getCounts();
  
  return (
    <div>
      <h2>Hoạt động sắp diễn ra ({upcoming.length})</h2>
      {upcoming.map(act => <ActivityCard key={act.id} activity={act} />)}
      
      <h2>Hoạt động của tôi</h2>
      <p>Chờ duyệt: {pending.length}</p>
      <p>Đã duyệt: {approved.length}</p>
    </div>
  );
}
```

### **Example 2: Class Activities Page**
```javascript
import { useActivities } from '../../hooks/useActivities';
import { normalizeActivity } from '../../utils/activityFilters';

function ClassActivities() {
  const semester = sessionStorage.getItem('current_semester');
  const [statusFilter, setStatusFilter] = useState('da_duyet');
  
  const { getFiltered, getCounts } = useActivities({ semester });
  
  // Get filtered by status
  const filteredActivities = getFiltered('status', { status: statusFilter });
  
  // Get counts for tabs
  const counts = getCounts();
  
  return (
    <div>
      <Tabs>
        <Tab label={`Đã duyệt (${counts.da_duyet})`} />
        <Tab label={`Chờ duyệt (${counts.cho_duyet})`} />
      </Tabs>
      
      {filteredActivities.map(act => {
        const normalized = normalizeActivity(act);
        return <ActivityCard key={normalized.id} activity={normalized} />;
      })}
    </div>
  );
}
```

---

## ⚠️ **Common Pitfalls (Lỗi thường gặp)**

### 1. **Không normalize data**
```javascript
// ❌ BAD: Dùng raw data
<p>{activity.ten_hd}</p> // có thể undefined

// ✅ GOOD: Normalize trước
const normalized = normalizeActivity(activity);
<p>{normalized.ten_hd}</p> // luôn có giá trị
```

### 2. **Filter nhiều lần**
```javascript
// ❌ BAD: Filter lại trong component
const available = activities.filter(a => a.trang_thai === 'da_duyet');

// ✅ GOOD: Dùng getFiltered
const available = getFiltered('available');
```

### 3. **Không dùng semester param**
```javascript
// ❌ BAD: Fetch all rồi filter client-side
const all = await http.get('/activities');
const filtered = all.filter(a => a.hoc_ky === semester);

// ✅ GOOD: Backend filter luôn
const { activities } = useActivities({ semester });
```

---

## 📊 **Success Metrics (Đo lường thành công)**

- [ ] **Code reduction**: Giảm 60-70% code lặp
- [ ] **Data consistency**: 100% roles thấy cùng data với cùng filter
- [ ] **Bug reduction**: Giảm 80% bug liên quan đến filter/counting
- [ ] **Development speed**: Thêm feature mới nhanh gấp 3 lần
- [ ] **Test coverage**: 80%+ utility functions có tests

---

## 🎓 **Next Steps (Bước tiếp theo)**

1. **Review tài liệu này**
2. **Chọn 1 component đơn giản để migrate đầu tiên** (recommend: Student Dashboard)
3. **Test kỹ sau khi migrate**
4. **So sánh kết quả với component cũ**
5. **Nếu OK → migrate tiếp component khác**
6. **Repeat cho đến hết**

---

## 💡 **Tips**

- Migrate **từng component một**, đừng migrate hết cùng lúc
- **Test kỹ** sau mỗi component
- **Commit thường xuyên** để dễ rollback nếu có lỗi
- **Document** các edge case gặp phải
- **Hỏi** nếu không chắc chắn

---

## 📞 **Support**

Nếu gặp khó khăn trong quá trình migrate:
1. Check examples trong tài liệu này
2. Xem implementation trong `utils/activityFilters.js`
3. Test từng function riêng lẻ
4. Document lại vấn đề gặp phải

---

**Created**: 2025-11-10  
**Last Updated**: 2025-11-10  
**Status**: 🟢 Ready for implementation
