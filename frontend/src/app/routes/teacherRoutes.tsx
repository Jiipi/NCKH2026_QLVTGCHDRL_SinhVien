import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import { PermissionRouteGuard, RoleGuard } from './guards';

const ModernTeacherLayout = React.lazy(() => import('../../widgets/layout/ui/TeacherLayout'));
const QRManagementPage = React.lazy(() => import('../../features/qr-attendance/ui/QRManagementPage'));
const ActivityDetailPage = React.lazy(() => import('../../features/activities/ui/pages/activity-detail/ActivityDetailPage'));
const ManageActivityPage = React.lazy(() => import('../../features/activities/ui/pages/manage-activity/ManageActivityPage'));
const ImportStudentsPage = React.lazy(() => import('../../features/teacher/ui/pages/import-students/ImportStudentsPage'));
const TeacherActivitiesPage = React.lazy(() => import('../../features/teacher/ui/pages/teacher-activities/TeacherActivitiesPage'));
const TeacherAttendancePage = React.lazy(() => import('../../features/teacher/ui/pages/teacher-attendance/TeacherAttendancePage'));
const TeacherDashboardPage = React.lazy(() => import('../../features/teacher/ui/pages/teacher-dashboard/TeacherDashboardPage'));
const TeacherProfilePage = React.lazy(() => import('../../features/teacher/ui/pages/teacher-profile/TeacherProfilePage'));
const TeacherStudentManagementPage = React.lazy(() => import('../../features/teacher/ui/pages/teacher-student-management/TeacherStudentManagementPage'));
const TeacherStudentScoresPage = React.lazy(() => import('../../features/teacher/ui/pages/teacher-student-scores/TeacherStudentScoresPage'));
const TeacherActivityApprovalPage = React.lazy(() => import('../../features/approvals/ui/pages/TeacherActivityApprovalPage'));
const TeacherRegistrationApprovalPage = React.lazy(() => import('../../features/approvals/ui/pages/TeacherRegistrationApprovalPage'));
const TeacherNotificationsPage = React.lazy(() => import('../../features/notifications/ui/TeacherNotificationsPage'));
const TeacherReportsPage = React.lazy(() => import('../../features/reports/teacher/ui/TeacherReportsPage'));
const AdminFaceManagementPage = React.lazy(() => import('../../features/face-recognition/ui/pages/AdminFaceManagementPage'));

export function teacherRoutes() {
  return React.createElement(Route, { key: 'teacher-root', path: '/teacher', element: React.createElement(RoleGuard, { allow: ['GIANG_VIEN', 'ADMIN'], element: React.createElement(ModernTeacherLayout) }) }, [
    React.createElement(Route, { key: 'teacher-index', index: true, element: React.createElement(TeacherDashboardPage) }),
    React.createElement(Route, { key: 'teacher-activities', path: 'activities', element: React.createElement(PermissionRouteGuard, { anyOf: ['activities.view', 'activities.read', 'activities.write'], fallbackPath: '/teacher', element: React.createElement(TeacherActivitiesPage) }) }),
    React.createElement(Route, { key: 'teacher-activity-create', path: 'activities/create', element: React.createElement(PermissionRouteGuard, { anyOf: ['activities.create', 'activities.write'], fallbackPath: '/teacher/activities', element: React.createElement(ManageActivityPage) }) }),
    React.createElement(Route, { key: 'teacher-activity-edit', path: 'activities/:id/edit', element: React.createElement(PermissionRouteGuard, { anyOf: ['activities.update', 'activities.write'], fallbackPath: '/teacher/activities', element: React.createElement(ManageActivityPage) }) }),
    React.createElement(Route, { key: 'teacher-activity-detail', path: 'activities/:id', element: React.createElement(PermissionRouteGuard, { anyOf: ['activities.view', 'activities.read'], fallbackPath: '/teacher/activities', element: React.createElement(ActivityDetailPage) }) }),
    React.createElement(Route, { key: 'teacher-qr-management', path: 'qr-management', element: React.createElement(PermissionRouteGuard, { anyOf: ['attendance.view', 'attendance.read', 'attendance.write', 'attendance.mark'], fallbackPath: '/teacher', element: React.createElement(QRManagementPage) }) }),
    React.createElement(Route, { key: 'teacher-approve', path: 'approve', element: React.createElement(PermissionRouteGuard, { anyOf: ['activities.approve', 'activities.reject'], fallbackPath: '/teacher', element: React.createElement(TeacherActivityApprovalPage) }) }),
    React.createElement(Route, { key: 'teacher-registrations-approve', path: 'registrations/approve', element: React.createElement(PermissionRouteGuard, { anyOf: ['registrations.approve', 'registrations.reject', 'registrations.write'], fallbackPath: '/teacher', element: React.createElement(TeacherRegistrationApprovalPage) }) }),
    React.createElement(Route, { key: 'teacher-attendance', path: 'attendance', element: React.createElement(PermissionRouteGuard, { anyOf: ['attendance.view', 'attendance.read', 'attendance.write', 'attendance.mark'], fallbackPath: '/teacher', element: React.createElement(TeacherAttendancePage) }) }),
    React.createElement(Route, { key: 'teacher-student-scores', path: 'student-scores', element: React.createElement(PermissionRouteGuard, { anyOf: ['points.view_all', 'scores.read', 'students.read'], fallbackPath: '/teacher', element: React.createElement(TeacherStudentScoresPage) }) }),
    React.createElement(Route, { key: 'teacher-students', path: 'students', element: React.createElement(PermissionRouteGuard, { anyOf: ['students.read', 'students.update', 'classmates.read'], fallbackPath: '/teacher', element: React.createElement(TeacherStudentManagementPage) }) }),
    React.createElement(Route, { key: 'teacher-students-import', path: 'students/import', element: React.createElement(PermissionRouteGuard, { anyOf: ['students.update', 'users.write'], fallbackPath: '/teacher/students', element: React.createElement(ImportStudentsPage) }) }),
    React.createElement(Route, { key: 'teacher-classes-redirect', path: 'classes', element: React.createElement(Navigate, { to: '/teacher/students', replace: true }) }),
    React.createElement(Route, { key: 'teacher-notifications', path: 'notifications', element: React.createElement(PermissionRouteGuard, { anyOf: ['notifications.view', 'notifications.read', 'notifications.write', 'notifications.create'], fallbackPath: '/teacher', element: React.createElement(TeacherNotificationsPage) }) }),
    React.createElement(Route, { key: 'teacher-reports', path: 'reports', element: React.createElement(PermissionRouteGuard, { anyOf: ['reports.read', 'reports.view', 'reports.export'], fallbackPath: '/teacher', element: React.createElement(TeacherReportsPage) }) }),
    React.createElement(Route, { key: 'teacher-reports-export', path: 'reports/export', element: React.createElement(PermissionRouteGuard, { anyOf: ['reports.export', 'reports.read'], fallbackPath: '/teacher', element: React.createElement(TeacherReportsPage) }) }),
    React.createElement(Route, { key: 'teacher-profile', path: 'profile', element: React.createElement(PermissionRouteGuard, { anyOf: ['profile.read', 'profile.view'], fallbackPath: '/teacher', element: React.createElement(TeacherProfilePage) }) }),
    React.createElement(Route, { key: 'teacher-notifications-create', path: 'notifications/create', element: React.createElement(PermissionRouteGuard, { anyOf: ['notifications.create', 'notifications.write'], fallbackPath: '/teacher/notifications', element: React.createElement(TeacherNotificationsPage) }) }),
    React.createElement(Route, { key: 'teacher-face-management', path: 'face-management', element: React.createElement(AdminFaceManagementPage) })
  ]);
}
