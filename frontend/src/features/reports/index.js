/**
 * Reports Feature Index
 * ======================
 * Central export for all report types
 */

// Monitor Reports (Lớp trưởng)
export { MonitorReportsPage, useMonitorReports } from './monitor';

// Teacher Reports (Giảng viên)
export { TeacherReportsPage } from './teacher';

// Admin Reports (Quản trị viên)
export { AdminReportsPage } from './admin';

// Legacy exports (for backward compatibility)
export { default as ClassReports } from './monitor/ui/MonitorReportsPage';
export { default as ModernReports } from './teacher/ui/TeacherReportsPage';
export { default as AdminReports } from './admin/ui/AdminReportsPage';
