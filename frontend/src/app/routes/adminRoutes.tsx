import React from 'react';
import { Route } from 'react-router-dom';
import { PermissionRouteGuard, RoleGuard } from './guards';

const AdminStudentLayout = React.lazy(() => import('../../widgets/layout/ui/AdminStudentLayout'));
const AdminDashboard = React.lazy(() => import('../../features/admin/ui/pages/admin-dashboard/AdminDashboardPage'));
const AdminUsers = React.lazy(() => import('../../features/admin/ui/pages/user-management/UserManagementPage'));
const AdminActivities = React.lazy(() => import('../../features/admin/ui/pages/admin-activities/AdminActivitiesPage'));
const AdminApprovalsPage = React.lazy(() => import('../../features/approvals/ui/pages/AdminApprovalsPage'));
const QRManagementPage = React.lazy(() => import('../../features/qr-attendance/ui/QRManagementPage'));
const AdminReports = React.lazy(() => import('../../features/reports/admin/ui/AdminReportsPage'));
const AttendanceAuditPage = React.lazy(() => import('../../features/attendance-audit/ui/AttendanceAuditPage'));
const AdminRoles = React.lazy(() => import('../../features/users/ui/pages/admin-roles/AdminRolesPage'));
const AdminProfile = React.lazy(() => import('../../features/users/ui/pages/admin-profile/AdminProfilePage'));
const AdminNotifications = React.lazy(() => import('../../features/notifications/ui/AdminNotificationsPage'));
const AdminSettings = React.lazy(() => import('../../features/settings/ui/AdminSettingsPage'));
const SemesterManagement = React.lazy(() => import('../../features/semesters/ui/SemesterManagementPage'));
const ActivityDetailPage = React.lazy(() => import('../../features/activities/ui/pages/activity-detail/ActivityDetailPage'));
const ManageActivityPage = React.lazy(() => import('../../features/activities/ui/pages/manage-activity/ManageActivityPage'));
const ActivityTypesManagementPage = React.lazy(() => import('../../features/activity-types/ui/pages/activity-types-management/ActivityTypesManagementPage'));
const AdminFaceManagementPage = React.lazy(() => import('../../features/face-recognition/ui/pages/AdminFaceManagementPage'));

export function adminRoutes() {
  return React.createElement(Route, { key: 'admin-root', path: '/admin', element: React.createElement(RoleGuard, { allow: ['ADMIN'], element: React.createElement(AdminStudentLayout) }) }, [
    React.createElement(Route, { key: 'admin-index', index: true, element: React.createElement(AdminDashboard) }),
    React.createElement(Route, { key: 'admin-users', path: 'users', element: React.createElement(PermissionRouteGuard, { anyOf: ['users.view', 'users.read', 'users.write'], fallbackPath: '/admin', element: React.createElement(AdminUsers) }) }),
    React.createElement(Route, { key: 'admin-activities', path: 'activities', element: React.createElement(PermissionRouteGuard, { anyOf: ['activities.view', 'activities.read', 'activities.write'], fallbackPath: '/admin', element: React.createElement(AdminActivities) }) }),
    React.createElement(Route, { key: 'admin-roles', path: 'roles', element: React.createElement(PermissionRouteGuard, { anyOf: ['roles.read', 'roles.write', 'system.roles'], fallbackPath: '/admin', element: React.createElement(AdminRoles) }) }),
    React.createElement(Route, { key: 'admin-activity-create', path: 'activities/create', element: React.createElement(PermissionRouteGuard, { anyOf: ['activities.create', 'activities.write'], fallbackPath: '/admin/activities', element: React.createElement(ManageActivityPage) }) }),
    React.createElement(Route, { key: 'admin-activity-edit', path: 'activities/:id/edit', element: React.createElement(PermissionRouteGuard, { anyOf: ['activities.update', 'activities.write'], fallbackPath: '/admin/activities', element: React.createElement(ManageActivityPage) }) }),
    React.createElement(Route, { key: 'admin-activity-detail', path: 'activities/:id', element: React.createElement(PermissionRouteGuard, { anyOf: ['activities.view', 'activities.read'], fallbackPath: '/admin/activities', element: React.createElement(ActivityDetailPage) }) }),
    React.createElement(Route, { key: 'admin-approvals', path: 'approvals', element: React.createElement(PermissionRouteGuard, { anyOf: ['activities.approve', 'registrations.approve'], fallbackPath: '/admin', element: React.createElement(AdminApprovalsPage) }) }),
    React.createElement(Route, { key: 'admin-reports', path: 'reports', element: React.createElement(PermissionRouteGuard, { anyOf: ['reports.read', 'reports.view', 'reports.export'], fallbackPath: '/admin', element: React.createElement(AdminReports) }) }),
    React.createElement(Route, { key: 'admin-attendance-audit', path: 'attendance-audit', element: React.createElement(PermissionRouteGuard, { anyOf: ['reports.read', 'reports.view', 'attendance.read', 'attendance.view'], fallbackPath: '/admin', element: React.createElement(AttendanceAuditPage, { scope: 'admin' }) }) }),
    React.createElement(Route, { key: 'admin-notifications', path: 'notifications', element: React.createElement(PermissionRouteGuard, { anyOf: ['notifications.view', 'notifications.read', 'notifications.write', 'notifications.create'], fallbackPath: '/admin', element: React.createElement(AdminNotifications) }) }),
    React.createElement(Route, { key: 'admin-qr-attendance', path: 'qr-attendance', element: React.createElement(PermissionRouteGuard, { anyOf: ['attendance.view', 'attendance.read', 'attendance.write', 'attendance.mark'], fallbackPath: '/admin', element: React.createElement(QRManagementPage) }) }),
    React.createElement(Route, { key: 'admin-activity-types', path: 'activity-types', element: React.createElement(PermissionRouteGuard, { anyOf: ['activityTypes.read', 'activityTypes.write'], fallbackPath: '/admin', element: React.createElement(ActivityTypesManagementPage) }) }),
    React.createElement(Route, { key: 'admin-semesters', path: 'semesters', element: React.createElement(PermissionRouteGuard, { anyOf: ['system.settings', 'system.manage'], fallbackPath: '/admin', element: React.createElement(SemesterManagement) }) }),
    React.createElement(Route, { key: 'admin-settings', path: 'settings', element: React.createElement(PermissionRouteGuard, { anyOf: ['system.settings', 'system.configure', 'system.manage'], fallbackPath: '/admin', element: React.createElement(AdminSettings) }) }),
    React.createElement(Route, { key: 'admin-profile', path: 'profile', element: React.createElement(PermissionRouteGuard, { anyOf: ['profile.read', 'profile.view'], fallbackPath: '/admin', element: React.createElement(AdminProfile) }) }),
    React.createElement(Route, { key: 'admin-face-management', path: 'face-management', element: React.createElement(AdminFaceManagementPage) }),
  ]);
}
