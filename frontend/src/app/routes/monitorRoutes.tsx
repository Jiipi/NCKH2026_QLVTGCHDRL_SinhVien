import React from 'react';
import { Route } from 'react-router-dom';
import { PermissionRouteGuard, RoleGuard } from './guards';

const MonitorLayout = React.lazy(() => import('../../widgets/layout/ui/MonitorLayout'));
const QRManagementPage = React.lazy(() => import('../../features/qr-attendance/ui/QRManagementPage'));
const QRScannerPage = React.lazy(() => import('../../features/qr-attendance/ui/QRScannerModernPage'));
const ActivityDetailPage = React.lazy(() => import('../../features/activities/ui/pages/activity-detail/ActivityDetailPage'));
const ManageActivityPage = React.lazy(() => import('../../features/activities/ui/pages/manage-activity/ManageActivityPage'));
const MonitorActivityOversightPage = React.lazy(() => import('../../features/monitor/ui/MonitorActivityOversightPage'));
const MonitorDashboardPage = React.lazy(() => import('../../features/monitor/ui/MonitorDashboardPage'));
const MonitorMyActivitiesPage = React.lazy(() => import('../../features/monitor/ui/MonitorMyActivitiesPage'));
const MonitorMyProfilePage = React.lazy(() => import('../../features/monitor/ui/MonitorMyProfilePage'));
const MonitorStudentManagementPage = React.lazy(() => import('../../features/monitor/ui/MonitorStudentManagementPage'));
const MyCertificatesPage = React.lazy(() => import('../../features/certificates/ui/pages/MyCertificatesPage'));
const MonitorReportsPage = React.lazy(() => import('../../features/reports/monitor/ui/MonitorReportsPage'));
const AttendanceAuditPage = React.lazy(() => import('../../features/attendance-audit/ui/AttendanceAuditPage'));
const ClassApprovalsPage = React.lazy(() => import('../../features/approvals/ui/pages/ClassApprovalsPage'));
const MonitorNotificationsPage = React.lazy(() => import('../../features/notifications/ui/MonitorNotificationsPage'));

function MonitorHome() {
  return React.createElement(MonitorDashboardPage, null);
}

export function monitorRoutes() {
  return React.createElement(Route, { key: 'monitor-root', path: '/monitor', element: React.createElement(RoleGuard, { allow: ['LOP_TRUONG', 'GIANG_VIEN', 'ADMIN'], element: React.createElement(MonitorLayout) }) }, [
    React.createElement(Route, { key: 'monitor-index', index: true, element: React.createElement(MonitorHome) }),
    React.createElement(Route, { key: 'monitor-my-activities', path: 'my-activities', element: React.createElement(PermissionRouteGuard, { anyOf: ['registrations.view', 'registrations.read', 'registrations.register'], fallbackPath: '/monitor', element: React.createElement(MonitorMyActivitiesPage) }) }),
    React.createElement(Route, { key: 'monitor-qr-scanner', path: 'qr-scanner', element: React.createElement(PermissionRouteGuard, { anyOf: ['attendance.write', 'attendance.view', 'attendance.mark'], fallbackPath: '/monitor', element: React.createElement(QRScannerPage) }) }),
    React.createElement(Route, { key: 'monitor-my-profile', path: 'my-profile', element: React.createElement(PermissionRouteGuard, { anyOf: ['profile.read', 'profile.view'], fallbackPath: '/monitor', element: React.createElement(MonitorMyProfilePage) }) }),
    React.createElement(Route, { key: 'monitor-my-certificates', path: 'my-certificates', element: React.createElement(PermissionRouteGuard, { anyOf: ['registrations.view', 'registrations.read'], fallbackPath: '/monitor', element: React.createElement(MyCertificatesPage) }) }),
    React.createElement(Route, { key: 'class-activities', path: 'activities', element: React.createElement(PermissionRouteGuard, { anyOf: ['activities.view', 'activities.read', 'activities.write'], fallbackPath: '/monitor', element: React.createElement(MonitorActivityOversightPage) }) }),
    React.createElement(Route, { key: 'class-activity-create', path: 'activities/create', element: React.createElement(RoleGuard, { allow: ['LOP_TRUONG', 'ADMIN'], element: React.createElement(PermissionRouteGuard, { anyOf: ['activities.create', 'activities.write'], fallbackPath: '/monitor/activities', element: React.createElement(ManageActivityPage) }) }) }),
    React.createElement(Route, { key: 'class-activity-edit', path: 'activities/:id/edit', element: React.createElement(RoleGuard, { allow: ['LOP_TRUONG', 'ADMIN'], element: React.createElement(PermissionRouteGuard, { anyOf: ['activities.update', 'activities.write'], fallbackPath: '/monitor/activities', element: React.createElement(ManageActivityPage) }) }) }),
    React.createElement(Route, { key: 'class-activity-detail', path: 'activities/:id', element: React.createElement(PermissionRouteGuard, { anyOf: ['activities.view', 'activities.read'], fallbackPath: '/monitor/activities', element: React.createElement(ActivityDetailPage) }) }),
    React.createElement(Route, { key: 'monitor-qr-management', path: 'qr-management', element: React.createElement(PermissionRouteGuard, { anyOf: ['attendance.view', 'attendance.read', 'attendance.write', 'attendance.mark'], fallbackPath: '/monitor', element: React.createElement(QRManagementPage) }) }),
    React.createElement(Route, { key: 'class-approvals', path: 'approvals', element: React.createElement(PermissionRouteGuard, { anyOf: ['registrations.approve', 'registrations.reject', 'registrations.write'], fallbackPath: '/monitor', element: React.createElement(ClassApprovalsPage) }) }),
    React.createElement(Route, { key: 'class-students', path: 'students', element: React.createElement(PermissionRouteGuard, { anyOf: ['students.read', 'classmates.read', 'classmates.assist'], fallbackPath: '/monitor', element: React.createElement(MonitorStudentManagementPage) }) }),
    React.createElement(Route, { key: 'class-reports', path: 'reports', element: React.createElement(PermissionRouteGuard, { anyOf: ['reports.read', 'reports.view', 'reports.export'], fallbackPath: '/monitor', element: React.createElement(MonitorReportsPage) }) }),
    React.createElement(Route, { key: 'monitor-attendance-audit', path: 'attendance-audit', element: React.createElement(PermissionRouteGuard, { anyOf: ['reports.read', 'reports.view', 'attendance.read', 'attendance.view'], fallbackPath: '/monitor', element: React.createElement(AttendanceAuditPage, { scope: 'monitor' }) }) }),
    React.createElement(Route, { key: 'class-notifications', path: 'notifications', element: React.createElement(PermissionRouteGuard, { anyOf: ['notifications.view', 'notifications.read', 'notifications.write', 'notifications.create'], fallbackPath: '/monitor', element: React.createElement(MonitorNotificationsPage) }) }),
  ]);
}
