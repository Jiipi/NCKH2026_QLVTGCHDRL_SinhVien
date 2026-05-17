# Design System — Hướng Dẫn Sử Dụng

## Tổng Quan

Design System cho phép xây dựng UI nhất quán, có thể mở rộng, và dễ bảo trì. Hệ thống được xây dựng trên Tailwind CSS với semantic tokens cho light/dark mode.

---

## Cấu Trúc

```
src/shared/design-system/
├── tokens/        # Design tokens (màu, spacing, typography, motion)
├── components/    # React components (Button, Card, Input, v.v.)
├── layout/        # Layout components (Sidebar, Header, PageLayout)
├── hooks/         # Custom hooks (useDesignSystem, useTheme)
└── docs/          # Documentation
```

---

## Quick Start

### 1. Import

```tsx
import { Button, Card, Badge, Input, Table } from '@/shared/design-system';
// hoặc import riêng từng component
import { Button } from '@/shared/design-system/components';
import { PageHeader, Sidebar } from '@/shared/design-system/layout';
```

### 2. Sử dụng Component

```tsx
// Button
<Button variant="solid" colorScheme="primary" size="md">
  Tạo hoạt động
</Button>

// Card
<Card>
  <CardHeader title="Thống kê" subtitle="Tuần này" />
  <CardBody>
    Nội dung card
  </CardBody>
</Card>

// Input
<Input
  label="Tên hoạt động"
  placeholder="Nhập tên..."
  error="Tên không được để trống"
/>

// Badge
<Badge color="success">Đã duyệt</Badge>
<StatusBadge status="pending" />

// Table
<TableContainer>
  <TableHead>
    <TableRow>
      <TableTh>STT</TableTh>
      <TableTh>Tên</TableTh>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow>
      <TableTd>1</TableTd>
      <TableTd>Hoạt động</TableTd>
    </TableRow>
  </TableBody>
</TableContainer>
```

---

## Design Tokens

### Màu Sắc

```css
/* Primary (Blue) */
primary-50 → primary-950

/* Semantic */
--primary        = #2563eb
--primary-hover  = #1d4ed8
--primary-light = #eff6ff

--success       = #16a34a
--danger        = #ef4444
--warning        = #f59e0b
--info           = #0ea5e9

/* Semantic Colors */
--surface-page, --surface-card, --surface-muted
--text-primary, --text-secondary, --text-muted
--border-default, --border-hover
```

### Typography

```css
/* Font: Be Vietnam Pro */
font-sans: 'Be Vietnam Pro', Inter, system-ui, sans-serif

/* Sizes: text-xs → text-6xl */
/* Weights: font-light (300) → font-black (900) */
```

### Spacing

```css
/* 8px grid system */
/* space-1 = 4px, space-2 = 8px, ... space-16 = 64px */

/* Layout */
--sidebar-width: 280px
--header-height: 72px
--page-max-width: 1440px
```

### Border Radius

```css
rounded-sm   = 4px
rounded-md   = 6px
rounded-lg   = 8px
rounded-xl   = 12px
rounded-2xl  = 16px
rounded-full = 9999px
```

---

## Component Library

### Button

```tsx
<Button
  variant="solid"              // solid | outline | ghost | link
  colorScheme="primary"        // primary | success | danger | warning | info | slate
  size="md"                    // xs | sm | md | lg
  leftIcon={<Plus size={16} />}
  rightIcon={<ArrowRight />}
  isLoading={false}
  loadingText="Đang xử lý..."
>
  Nội dung
</Button>
```

### Card

```tsx
<Card
  variant="outlined"           // elevated | outlined | ghost | filled
  size="md"                   // sm | md | lg
  padding="md"               // none | sm | md | lg
  hoverable={false}
>
  <CardHeader title="Tiêu đề" subtitle="Mô tả" action={<Button />} />
  <CardBody padding="md">Nội dung</CardBody>
  <CardFooter>Actions</CardFooter>
</Card>

// Stat Card
<StatCard
  label="Tổng hoạt động"
  value={42}
  icon={<Activity />}
  trend={{ value: 12, label: 'so với tháng trước' }}
  colorScheme="primary"
/>
```

### Input

```tsx
<Input
  label="Email"
  placeholder="Nhập email..."
  type="email"
  size="md"                   // sm | md | lg
  variant="outlined"          // outlined | filled
  error="Email không hợp lệ"
  hint="Chúng tôi sẽ gửi email xác nhận"
  leftIcon={<Mail />}
  rightIcon={<Eye />}
/>

<Textarea label="Mô tả" rows={4} />

<Select
  label="Trạng thái"
  options={[
    { value: 'active', label: 'Hoạt động' },
    { value: 'inactive', label: 'Không hoạt động' },
  ]}
  placeholder="Chọn trạng thái"
/>

<Checkbox label="Tôi đồng ý với điều khoản" />

<Switch label="Bật thông báo" />
```

### Badge

```tsx
// Badge cơ bản
<Badge variant="soft" color="success">Đã duyệt</Badge>
<Badge variant="outline" color="danger">Từ chối</Badge>
<Badge variant="solid" color="warning">Đang chờ</Badge>

// Status Badge (tự động mapping label)
<StatusBadge status="pending" />    // → Chờ duyệt (warning)
<StatusBadge status="approved" />   // → Đã duyệt (success)
<StatusBadge status="rejected" />  // → Từ chối (danger)

// Dot indicator
<Badge color="success" dot>Hoạt động</Badge>
```

### Avatar

```tsx
<Avatar
  src="https://..."
  name="Nguyễn Văn A"
  size="md"                   // xs | sm | md | lg | xl | 2xl
  status="online"             // online | offline | away | busy
/>

// Avatar Group
<AvatarGroup max={4}>
  <Avatar name="User 1" />
  <Avatar name="User 2" />
  <Avatar name="User 3" />
</AvatarGroup>
```

### Modal

```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Xác nhận"
  description="Bạn có chắc muốn xóa?"
  size="sm"                   // xs | sm | md | lg | xl | full
  intent="danger"             // default | danger | success | warning
  footer={
    <>
      <Button variant="ghost" onClick={onClose}>Hủy</Button>
      <Button colorScheme="danger" onClick={handleDelete}>Xóa</Button>
    </>
  }
>
  Nội dung modal
</Modal>

// Confirm Dialog
<ConfirmDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleConfirm}
  message="Bạn có chắc muốn xóa hoạt động này?"
  intent="danger"
  confirmText="Xóa"
/>
```

### Table

```tsx
<TableContainer size="md" hoverable>
  <thead>
    <TableHead>
      <TableRow>
        <TableTh sortable>STT</TableTh>
        <TableTh>Tên hoạt động</TableTh>
        <TableTh>Trạng thái</TableTh>
        <TableTh align="right">Thao tác</TableTh>
      </TableRow>
    </TableHead>
  </thead>
  <TableBody striped>
    <TableRow hoverable onClick={() => handleRowClick()}>
      <TableTd>1</TableTd>
      <TableTd>Chiến dịch rèn luyện</TableTd>
      <TableTd><StatusBadge status="approved" /></TableTd>
      <TableTd align="right">
        <Button variant="ghost" size="sm">Sửa</Button>
      </TableTd>
    </TableRow>
    <TableEmpty message="Không có hoạt động nào" colSpan={4} />
  </TableBody>
</TableContainer>

// Pagination
<Pagination
  currentPage={1}
  totalPages={10}
  onPageChange={setPage}
/>
```

### Loading

```tsx
<LoadingScreen message="Đang tải dữ liệu..." />
<PageSkeleton />
<Spinner size="md" color="primary" />
<Skeleton variant="text" height={16} width="75%" />
```

### Feedback

```tsx
<Alert variant="info" title="Thông tin">
  Đây là thông báo.
</Alert>
<Alert variant="success" title="Thành công" closable onClose={handleClose}>
  Hoạt động đã được tạo.
</Alert>

<EmptyState
  icon={<Activity />}
  title="Chưa có hoạt động"
  description="Hãy tạo hoạt động đầu tiên"
  action={<Button>Tạo hoạt động</Button>}
/>

<Progress value={75} max={100} showLabel color="primary" />

<Tooltip content="Xem chi tiết" position="top">
  <Button>Hover me</Button>
</Tooltip>
```

---

## Layout System

### Sidebar

```tsx
<Sidebar
  items={[
    {
      label: 'Dashboard',
      icon: <Home />,
      path: '/dashboard',
    },
    {
      label: 'Hoạt động',
      icon: <Activity />,
      children: [
        { label: 'Tất cả', path: '/activities' },
        { label: 'Tạo mới', path: '/activities/create' },
      ],
    },
    {
      label: 'Chờ duyệt',
      icon: <Clock />,
      badge: 5,
      badgeColor: 'warning',
      path: '/pending',
    },
  ]}
  user={{ name: 'Nguyễn Văn A', email: 'a@example.com' }}
  isCollapsed={false}
  onToggle={() => setCollapsed(!collapsed)}
  onLogout={handleLogout}
/>
```

### Page Layout

```tsx
<PageLayout
  sidebar={<Sidebar items={items} />}
  header={<GlobalHeader title="Dashboard" actions={<Button>Export</Button>} />}
>
  <PageHeader title="Dashboard" subtitle="Tổng quan hệ thống" />
  <StatCard label="Tổng HV" value={120} />
</PageLayout>
```

### Header Components

```tsx
// Page header (trong trang)
<PageHeader
  title="Quản lý hoạt động"
  subtitle="12 hoạt động đang chờ duyệt"
  breadcrumb={[
    { label: 'Home', href: '/' },
    { label: 'Hoạt động' },
  ]}
  actions={<Button leftIcon={<Plus />}>Tạo mới</Button>}
/>

// Tabs
<Tabs
  tabs={[
    { id: 'all', label: 'Tất cả', badge: 10 },
    { id: 'pending', label: 'Chờ duyệt', badge: 3 },
    { id: 'approved', label: 'Đã duyệt' },
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
/>

// Filter Bar
<FilterBar>
  <Input placeholder="Tìm kiếm..." leftIcon={<Search />} />
  <Select options={statusOptions} placeholder="Trạng thái" />
  <Button variant="outline">Lọc</Button>
</FilterBar>
```

---

## Theme / Dark Mode

```tsx
// Trong App.tsx
import { DesignProvider } from '@/shared/design-system';

function App() {
  return (
    <DesignProvider defaultTheme="light">
      <YourApp />
    </DesignProvider>
  );
}

// Trong component
import { useTheme } from '@/shared/design-system';

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  return <Button onClick={toggleTheme}>{isDark ? '☀️' : '🌙'}</Button>;
}
```

### Dark Mode Classes

```tsx
// CSS
<div className="dark:bg-slate-900 dark:text-white">
  Nội dung
</div>

// Component (tự động hỗ trợ)
<Card>  // Tự động dark mode
  Nội dung
</Card>
```

---

## CSS Classes

### Design System Classes

```css
/* Card */
.ds-card, .ds-card-header, .ds-card-body, .ds-card-footer

/* Button */
.ds-btn

/* Input */
.ds-input

/* Table */
.ds-table, .ds-table thead, .ds-table th, .ds-table td

/* Utilities */
.glass        /* backdrop-blur */
.text-gradient /* gradient text */
.truncate-2    /* 2-line clamp */
.truncate-3    /* 3-line clamp */
```

---

## Animation Utilities

```tsx
// Tailwind
<Button className="animate-fade-in">Nút</Button>
<div className="animate-slide-up">Nội dung</div>
<div className="animate-scale-in">Modal</div>
<div className="animate-float">Icon</div>

// Framer Motion (cho complex)
import { motion } from 'framer-motion';
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
  Content
</motion.div>
```

---

## Migration Guide

### Old → New Component Mapping

| Old Pattern | New Pattern |
|------------|-------------|
| `<button className="bg-blue-600...">` | `<Button variant="solid" colorScheme="primary">` |
| `<div className="bg-white rounded-xl border...">` | `<Card>` |
| `<span className="px-2 py-0.5 text-xs bg-emerald-100...">` | `<Badge color="success">` |
| `<table className="w-full...">` | `<TableContainer><TableHead>...` |
| `<div className="fixed inset-0 bg-black/50">` | `<Modal isOpen onClose>` |
