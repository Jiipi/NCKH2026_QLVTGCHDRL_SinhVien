# Phân tích Files trong Activities Feature

## 📊 Tổng quan

### ✅ Files ĐƯỢC SỬ DỤNG

#### 1. **Services** ✅
- `activitiesApi.js` - Được dùng bởi nhiều modules
- `apiErrorHandler.js` - Được export và dùng

#### 2. **Model Hooks** ✅
- `useManageActivity.js` - ✅ ĐƯỢC DÙNG bởi `ManageActivityPage`

#### 3. **Model Utils** ✅
- `activityUtils.js` - Được dùng bởi `activityFilters.js`
- `activityFilters.js` - Được export
- `activityStatus.js` - Được export
- `activityUiHelpers.js` - ✅ ĐƯỢC DÙNG bởi `TeacherActivityGrid.js` và `TeacherActivityList.js`

#### 4. **UI Pages** ✅
- `ManageActivityPage.js` - ✅ ĐƯỢC DÙNG trong App.js
- `ActivityDetailPage.js` - ✅ Re-export StudentActivityDetailPage
- `ClassActivitiesPage.js` - ✅ Forward đến MonitorActivityOversightPage

#### 5. **UI Shared Components** ✅
- `ActivityForm.js` - ✅ ĐƯỢC DÙNG bởi ManageActivityPage
- `ActivityCard.js` - Được export
- `AdminActivityCard.js` - Được export
- `MyActivityCard.js` - Được export
- `ActivityFilters.js` - Được export
- `AdminActivityFilters.js` - Được export
- `TeacherActivityFilters.js` - Được export
- `TeacherActivityGrid.js` - ✅ ĐƯỢC DÙNG (import activityUiHelpers)
- `TeacherActivityList.js` - ✅ ĐƯỢC DÙNG (import activityUiHelpers)

---

## ❌ Files KHÔNG ĐƯỢC SỬ DỤNG (Có thể xóa)

### 1. **Model Hooks** ❌

#### `useAdminActivities.js` ❌
- **Lý do**: Admin đang dùng `admin/model/useAdminActivitiesList.js` thay vì file này
- **Kiểm tra**: `AdminActivitiesPage.js` import từ `admin/model/useAdminActivitiesList`
- **Đề xuất**: ❌ XÓA

#### `useActivitiesList.js` ❌
- **Lý do**: Không thấy file nào import hook này
- **Kiểm tra**: Không có import nào từ file này
- **Đề xuất**: ❌ XÓA

#### `useMyActivities.js` ❌
- **Lý do**: Student và Monitor đang dùng `student/model/hooks/useMyActivities.js` thay vì file này
- **Kiểm tra**: 
  - `StudentMyActivitiesPage.js` import từ `student/model/hooks/useMyActivities`
  - `MonitorMyActivitiesPage.js` import từ `student/model/hooks/useMyActivities`
- **Đề xuất**: ❌ XÓA

#### `useTeacherActivities.js` ❌
- **Lý do**: Teacher đang dùng `teacher/model/hooks/useTeacherActivities.js` thay vì file này
- **Kiểm tra**: `TeacherActivitiesPage.js` dùng `useTeacherActivitiesPage` từ `teacher/model/hooks/`
- **Đề xuất**: ❌ XÓA

#### `useClassActivities.js` ❌
- **Lý do**: Không thấy file nào import hook này
- **Kiểm tra**: Không có import nào từ file này
- **Đề xuất**: ❌ XÓA

---

## 📋 Tóm tắt

### Files cần XÓA:
1. ❌ `activities/model/hooks/useAdminActivities.js`
2. ❌ `activities/model/hooks/useActivitiesList.js`
3. ❌ `activities/model/hooks/useMyActivities.js`
4. ❌ `activities/model/hooks/useTeacherActivities.js`
5. ❌ `activities/model/hooks/useClassActivities.js`

### Files cần GIỮ:
- ✅ Tất cả services
- ✅ `useManageActivity.js` (được dùng)
- ✅ Tất cả utils
- ✅ Tất cả UI components và pages

### Lý do có duplicate hooks:
- Các role (admin, teacher, student, monitor) đã tạo hooks riêng trong module của họ
- Hooks trong `activities/model/hooks/` là legacy code, không còn được sử dụng
- Chỉ `useManageActivity` được dùng vì `ManageActivityPage` là shared page

---

## 🔧 Hành động đề xuất

1. **Xóa 5 hooks không dùng** trong `activities/model/hooks/`
2. **Cập nhật `activities/model/hooks/index.js`** để chỉ export `useManageActivity`
3. **Giữ nguyên** tất cả services, utils, và UI components

