# Phân tích: Có nên Re-export tất cả UI từ activities/ui?

## 🔍 Hiện trạng

### ✅ Đã có trong `activities/ui/shared/`:
- `ActivityCard.js` - Card chung (dùng cho student)
- `AdminActivityCard.js` - Card cho admin
- `MyActivityCard.js` - Card cho "my activities"
- `ActivityForm.js` - Form chung (đã được dùng)
- `ActivityFilters.js` - Filters chung
- `AdminActivityFilters.js` - Filters cho admin
- `TeacherActivityFilters.js` - Filters cho teacher

### ❌ Các role đang có components RIÊNG:
- **Monitor**: `monitor/ui/components/Activities/ActivityCard.js` (451 dòng)
- **Teacher**: `teacher/ui/components/activities-management/TeacherActivityCardInline.js` (238 dòng)
- **Admin**: `admin/ui/components/ActivitiesList/AdminActivitiesCard.js` (358 dòng)
- **Student**: `student/ui/components/Activities/MyActivityCard.js` (riêng)

## 🤔 Vấn đề

### Có duplicate code không?
**CÓ** - Các ActivityCard có logic tương tự nhau nhưng:
- UI/UX khác nhau (design, layout, actions)
- Props khác nhau
- Business logic khác nhau (permissions, actions)

### Tại sao không dùng chung?
1. **UI/UX khác nhau**: Mỗi role có design riêng
2. **Actions khác nhau**: 
   - Admin: Approve/Reject/Delete
   - Teacher: Approve/Reject/View
   - Monitor: Edit/Delete/QR/Register
   - Student: Register/View
3. **Data structure khác nhau**: Mỗi role nhận data format khác

## ✅ Giải pháp: Re-export có điều kiện

### 🎯 Nguyên tắc:

#### 1. **Re-export những gì DÙNG CHUNG 100%**
```javascript
// ✅ ĐÚNG: Re-export form vì giống nhau 100%
// features/admin/ui/index.js
export { ActivityForm } from '../../activities/ui/shared/ActivityForm';
export { ManageActivityPage } from '../../activities/ui/pages/manage-activity/ManageActivityPage';
```

#### 2. **KHÔNG re-export những gì KHÁC NHAU**
```javascript
// ❌ SAI: Không re-export card vì UI/UX khác nhau
// Mỗi role nên giữ component riêng
```

#### 3. **Re-export với customization nếu cần**
```javascript
// ✅ ĐÚNG: Re-export và wrap nếu cần customize
// features/admin/ui/AdminActivityCard.js
import { ActivityCard } from '../../activities/ui/shared/ActivityCard';

export function AdminActivityCard(props) {
  // Customize cho admin
  return <ActivityCard {...props} adminMode={true} />;
}
```

## 📋 Đề xuất Cấu trúc

### ✅ Nên Re-export:
1. **Forms** - `ActivityForm` (đã đúng)
2. **Pages** - `ManageActivityPage`, `ActivityDetailPage` (đã đúng)
3. **Utilities** - Filters, helpers (nếu giống nhau)

### ❌ KHÔNG nên Re-export:
1. **Cards** - Mỗi role có UI/UX riêng
2. **Lists** - Layout khác nhau
3. **Modals** - Actions khác nhau

## 🎯 Best Practice

### Pattern 1: Re-export trực tiếp (nếu giống 100%)
```javascript
// features/admin/ui/index.js
export { ActivityForm } from '../../activities/ui/shared/ActivityForm';
export { ManageActivityPage } from '../../activities/ui/pages/manage-activity/ManageActivityPage';
```

### Pattern 2: Re-export với wrapper (nếu cần customize)
```javascript
// features/admin/ui/AdminActivityCard.js
import { ActivityCard } from '../../activities/ui/shared/ActivityCard';

export function AdminActivityCard(props) {
  // Thêm admin-specific logic
  return (
    <ActivityCard 
      {...props}
      showApprove={true}
      showReject={true}
      showDelete={true}
    />
  );
}
```

### Pattern 3: Giữ riêng (nếu khác nhau nhiều)
```javascript
// features/monitor/ui/components/Activities/ActivityCard.js
// Giữ riêng vì UI/UX hoàn toàn khác
```

## ✅ Kết luận

**KHÔNG nên re-export TẤT CẢ UI từ activities/ui**

### Nên re-export:
- ✅ Forms (ActivityForm)
- ✅ Pages (ManageActivityPage, ActivityDetailPage)
- ✅ Utilities/Helpers (nếu giống nhau)

### KHÔNG nên re-export:
- ❌ Cards (mỗi role có UI riêng)
- ❌ Lists (layout khác nhau)
- ❌ Modals (actions khác nhau)

### Quy tắc:
> **"Re-export khi giống nhau 100%, giữ riêng khi khác nhau"**

