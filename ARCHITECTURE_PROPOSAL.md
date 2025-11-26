# Đề xuất Kiến trúc Activities UI

## Nguyên tắc: DRY (Don't Repeat Yourself)

### ✅ Kiến trúc Hiện tại (Đã đúng)
```
features/activities/
  ├── ui/
  │   ├── shared/
  │   │   ├── ActivityForm.js          ← Form chung cho tất cả roles
  │   │   ├── ActivityCard.js          ← Card chung
  │   │   └── ...
  │   └── pages/
  │       └── manage-activity/
  │           └── ManageActivityPage.js ← Page chung cho tất cả roles
  │
  ├── admin/ui/
  │   └── AdminActivitiesPage.js       ← Chỉ list/view, navigate đến ManageActivityPage
  │
  ├── teacher/ui/
  │   └── TeacherActivitiesPage.js     ← Chỉ list/view, navigate đến ManageActivityPage
  │
  └── monitor/ui/
      └── MonitorActivityOversightPage.js ← Chỉ list/view, navigate đến ManageActivityPage
```

### 🎯 Best Practice: Re-export Pattern

Nếu các role cần customize (thêm fields, validation, layout khác), nên tạo wrapper:

```javascript
// features/admin/ui/AdminManageActivityPage.js
import ManageActivityPage from '../../activities/ui/pages/manage-activity/ManageActivityPage';
import { AdminLayout } from '../../../shared/components/layout';

// Re-export với customization nếu cần
export default function AdminManageActivityPage() {
  // Nếu cần customize, wrap lại
  return (
    <AdminLayout>
      <ManageActivityPage />
    </AdminLayout>
  );
  
  // Hoặc đơn giản re-export nếu không cần customize
  // export { default } from '../../activities/ui/pages/manage-activity/ManageActivityPage';
}
```

### 📋 Quy tắc

1. **Form/Component chung** → Đặt trong `activities/ui/shared/`
2. **Page chung** → Đặt trong `activities/ui/pages/`
3. **Role-specific customization** → Tạo wrapper trong `{role}/ui/` để re-export
4. **Tránh duplicate** → Luôn import từ `activities/` thay vì copy code

### 🔄 Flow đề xuất

```
User clicks "Tạo hoạt động"
  ↓
AdminActivitiesPage → navigate('/admin/activities/create')
  ↓
App.js Route → ManageActivityPage (từ activities/ui/pages/)
  ↓
ManageActivityPage → ActivityForm (từ activities/ui/shared/)
  ↓
ActivityForm → useManageActivity hook (từ activities/model/)
```

### ⚠️ Khi nào cần wrapper?

**KHÔNG cần wrapper nếu:**
- Form giống nhau 100%
- Chỉ khác layout (đã xử lý bằng `isAdminRoute` check)

**CẦN wrapper nếu:**
- Form có fields khác nhau giữa roles
- Validation rules khác nhau
- Business logic khác nhau
- Cần thêm permissions/guards riêng

### ✅ Kết luận

**Hiện tại đã đúng!** Không cần thay đổi gì. Chỉ cần:
1. Giữ nguyên cấu trúc hiện tại
2. Nếu sau này cần customize, tạo wrapper pages
3. Luôn import từ `activities/` thay vì duplicate

