/**
 * Route Constants - Định nghĩa tất cả các đường dẫn trong ứng dụng
 * Giúp tránh hardcode và dễ dàng thay đổi routes
 */

// Public Routes
export const PUBLIC_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
};

// Admin Routes
export const ADMIN_ROUTES = {
  ROOT: '/admin',
  DASHBOARD: '/admin',
  USERS: '/admin/users',
  ACTIVITIES: '/admin/activities',
  ACTIVITIES_CREATE: '/admin/activities/create',
  ACTIVITIES_EDIT: '/admin/activities/:id/edit',
  ROLES: '/admin/roles',
  APPROVALS: '/admin/approvals',
  REPORTS: '/admin/reports',
  NOTIFICATIONS: '/admin/notifications',
  QR_ATTENDANCE: '/admin/qr-attendance',
  ACTIVITY_TYPES: '/admin/activity-types',
  SEMESTERS: '/admin/semesters',
  SETTINGS: '/admin/settings',
  PROFILE: '/admin/profile',
};

// Teacher Routes
export const TEACHER_ROUTES = {
  ROOT: '/teacher',
  DASHBOARD: '/teacher',
  ACTIVITIES: '/teacher/activities',
  APPROVE: '/teacher/approve',
  REGISTRATIONS_APPROVE: '/teacher/registrations/approve',
  ACTIVITY_TYPES: '/teacher/activity-types',
  STUDENTS: '/teacher/students',
  STUDENTS_IMPORT: '/teacher/students/import',
  NOTIFICATIONS: '/teacher/notifications',
  NOTIFICATIONS_CREATE: '/teacher/notifications/create',
  REPORTS: '/teacher/reports',
  REPORTS_EXPORT: '/teacher/reports/export',
  PROFILE: '/teacher/profile',
  PREFERENCES: '/teacher/preferences',
};

// Monitor Routes
export const MONITOR_ROUTES = {
  ROOT: '/monitor',
  DASHBOARD: '/monitor',
  MY_ACTIVITIES: '/monitor/my-activities',
  QR_SCANNER: '/monitor/qr-scanner',
  MY_PROFILE: '/monitor/my-profile',
  MY_CERTIFICATES: '/monitor/my-certificates',
  ACTIVITIES: '/monitor/activities',
  ACTIVITIES_CREATE: '/monitor/activities/create',
  APPROVALS: '/monitor/approvals',
  STUDENTS: '/monitor/students',
  REPORTS: '/monitor/reports',
  NOTIFICATIONS: '/monitor/notifications',
};

// Student Routes
export const STUDENT_ROUTES = {
  ROOT: '/student',
  DASHBOARD: '/student',
  ACTIVITIES: '/student/activities',
  MY_ACTIVITIES: '/student/my-activities',
  SCORES: '/student/scores',
  PROFILE: '/student/profile',
  QR_SCANNER: '/student/qr-scanner',
};

// Role-based home routes
export const ROLE_HOME_ROUTES = {
  ADMIN: ADMIN_ROUTES.ROOT,
  GIANG_VIEN: TEACHER_ROUTES.ROOT,
  LOP_TRUONG: MONITOR_ROUTES.ROOT,
  SINH_VIEN: STUDENT_ROUTES.ROOT,
  STUDENT: STUDENT_ROUTES.ROOT,
};

