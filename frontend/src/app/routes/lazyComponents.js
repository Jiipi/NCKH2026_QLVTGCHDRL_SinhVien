import { lazy } from 'react';

/**
 * Lazy Components - Tập trung tất cả các lazy imports
 * Giúp dễ dàng quản lý và tránh duplicate imports
 */

// ============= AUTH PAGES =============
export const LoginModern = lazy(() => import('../../features/auth/pages/LoginModern'));
export const RegisterModern = lazy(() => import('../../features/auth/pages/RegisterModern'));
export const ForgotPasswordModern = lazy(() => import('../../features/auth/pages/ForgotPasswordModern'));
export const ResetPasswordModern = lazy(() => import('../../features/auth/pages/ResetPasswordModern'));

// ============= DASHBOARD PAGES =============
export const AdminDashboard = lazy(() => import('../../features/dashboard/pages/AdminDashboardPage'));
export const TeacherDashboardPage = lazy(() => import('../../features/dashboard/pages/TeacherDashboardPage'));
export const MonitorDashboard = lazy(() => import('../../features/dashboard/pages/MonitorDashboardPage'));
export const StudentDashboardPage = lazy(() => import('../../features/dashboard/pages/StudentDashboardPage'));

// ============= USER & PROFILE PAGES =============
export const AdminUsersPage = lazy(() => import('../../features/users/pages/AdminUsersPage'));
export const AdminRolesPage = lazy(() => import('../../features/users/pages/AdminRolesPage'));
export const AdminProfilePage = lazy(() => import('../../features/users/pages/AdminProfilePage'));
export const TeacherProfilePage = lazy(() => import('../../features/users/pages/TeacherProfilePage'));
export const TeacherPreferencesPage = lazy(() => import('../../features/users/pages/TeacherPreferencesPage'));
export const MonitorProfilePage = lazy(() => import('../../features/users/pages/MonitorProfilePage'));
export const StudentProfilePage = lazy(() => import('../../features/users/pages/StudentProfilePage'));
export const StudentScoresPage = lazy(() => import('../../features/users/pages/StudentScoresPage'));
export const StudentCertificatesPage = lazy(() => import('../../features/users/pages/StudentCertificatesPage'));

// ============= ACTIVITIES PAGES =============
export const AdminActivitiesPage = lazy(() => import('../../features/activities/pages/AdminActivitiesPage'));
export const TeacherActivitiesPage = lazy(() => import('../../features/activities/pages/TeacherActivitiesPage'));
export const ActivityTypeManagementPage = lazy(() => import('../../features/activities/pages/ActivityTypeManagementPage'));
export const ManageActivityPage = lazy(() => import('../../features/activities/pages/ManageActivityPage'));
export const ActivitiesListPage = lazy(() => import('../../features/activities/pages/ActivitiesListPage.js'));
export const MyActivitiesPage = lazy(() => import('../../features/activities/pages/MyActivitiesPage'));
export const MonitorMyActivitiesPage = lazy(() => import('../../features/activities/pages/MonitorMyActivitiesPage'));
export const ClassActivitiesPage = lazy(() => import('../../features/activities/pages/ClassActivitiesPage.js'));

// ============= APPROVALS PAGES =============
export const AdminApprovalsPage = lazy(() => import('../../features/approvals/pages/AdminApprovalsPage'));
export const TeacherActivityApprovalPage = lazy(() => import('../../features/approvals/pages/TeacherActivityApprovalPage'));
export const TeacherRegistrationApprovalPage = lazy(() => import('../../features/approvals/pages/TeacherRegistrationApprovalPage'));
export const ClassApprovalsPage = lazy(() => import('../../features/approvals/pages/ClassApprovalsPage'));

// ============= NOTIFICATIONS PAGES =============
export const AdminNotificationsPage = lazy(() => import('../../features/notifications/ui/AdminNotificationsPage'));
export const TeacherNotificationsPage = lazy(() => import('../../features/notifications/ui/TeacherNotificationsPage'));
export const MonitorNotificationsPage = lazy(() => import('../../features/notifications/ui/MonitorNotificationsPage'));

// ============= REPORTS PAGES =============
export const AdminReportsPage = lazy(() => import('../../features/reports/pages/AdminReportsPage'));
export const TeacherReportsPage = lazy(() => import('../../features/reports/pages/TeacherReportsPage'));
export const MonitorReportsPage = lazy(() => import('../../features/reports/pages/MonitorReportsPage'));

// ============= QR ATTENDANCE PAGES =============
export const AdminQRAttendancePage = lazy(() => import('../../features/qr-attendance/pages/AdminQRAttendancePage'));
export const QRAttendanceManagementPage = lazy(() => import('../../features/qr-attendance/pages/QRAttendanceManagementPage'));
export const QRScannerPage = lazy(() => import('../../features/qr-attendance/pages/QRScannerPage'));

// ============= CLASSES & STUDENTS PAGES =============
export const ClassStudentsPage = lazy(() => import('../../features/classes/pages/ClassStudentsPage'));
export const ClassManagementPage = lazy(() => import('../../features/classes/pages/ClassManagementPage'));
export const ImportStudentsPage = lazy(() => import('../../features/classes/pages/ImportStudentsPage'));
export const StudentManagementPage = lazy(() => import('../../features/classes/pages/StudentManagementPage'));

// ============= SEMESTERS PAGE =============
export const SemesterManagementPage = lazy(() => import('../../features/semesters/pages/SemesterManagementPage'));

// ============= SETTINGS PAGE =============
export const AdminSettingsPage = lazy(() => import('../../features/settings/pages/AdminSettingsPage'));
