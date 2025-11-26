/**
 * Activities Shared UI Components
 * Components dùng chung cho tất cả roles (admin, student, teacher, monitor)
 */

// Cards - Hiển thị thông tin hoạt động
export { ActivityCard } from './ActivityCard';
export { AdminActivityCard } from './AdminActivityCard';
export { default as MyActivityCard } from './MyActivityCard';

// Filters - Lọc hoạt động
export { ActivityFilters } from './ActivityFilters';
export { AdminActivityFilters } from './AdminActivityFilters';
export { TeacherActivityFilters } from './TeacherActivityFilters';

// Grids/Lists - Hiển thị danh sách
export { TeacherActivityGrid } from './TeacherActivityGrid';
export { default as TeacherActivityList } from './TeacherActivityList';

// Forms - Form tạo/sửa hoạt động
export { default as ActivityForm } from './ActivityForm';
export { default as EditActivityModal } from './EditActivityModal';

// Misc
export { default as RegistrationStatusTabs } from './RegistrationStatusTabs';
