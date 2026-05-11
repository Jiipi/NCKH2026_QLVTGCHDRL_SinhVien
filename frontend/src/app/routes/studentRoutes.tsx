import React from 'react';
import { Route } from 'react-router-dom';
import { PermissionRouteGuard, RoleGuard } from './guards';

const StudentLayout = React.lazy(() => import('../../widgets/layout/ui/StudentLayout'));
const MyActivitiesPage = React.lazy(() => import('../../features/student/ui/MyActivitiesPage'));
const StudentActivitiesListPage = React.lazy(() => import('../../features/student/ui/StudentActivitiesListPage'));
const StudentActivityDetailPage = React.lazy(() => import('../../features/student/ui/StudentActivityDetailPage'));
const StudentDashboardPage = React.lazy(() => import('../../features/student/ui/StudentDashboardPage').then(module => ({ default: module.StudentDashboardPage })));
const StudentProfilePage = React.lazy(() => import('../../features/student/ui/StudentProfilePage'));
const StudentScoresPage = React.lazy(() => import('../../features/student/ui/StudentScoresPage'));
const QRScannerPage = React.lazy(() => import('../../features/qr-attendance/ui/QRScannerModernPage'));
const MyCertificatesPage = React.lazy(() => import('../../features/certificates/ui/pages/MyCertificatesPage'));

export function studentRoutes() {
  return React.createElement(Route, { key: 'student-root', path: '/student', element: React.createElement(RoleGuard, { allow: ['SINH_VIEN', 'STUDENT', 'LOP_TRUONG'], element: React.createElement(StudentLayout) }) }, [
    React.createElement(Route, { key: 'student-index', index: true, element: React.createElement(StudentDashboardPage) }),
    React.createElement(Route, { key: 'student-activities', path: 'activities', element: React.createElement(PermissionRouteGuard, { anyOf: ['activities.view', 'activities.read'], element: React.createElement(StudentActivitiesListPage) }) }),
    React.createElement(Route, { key: 'student-activity-detail', path: 'activities/:id', element: React.createElement(PermissionRouteGuard, { anyOf: ['activities.view', 'activities.read'], element: React.createElement(StudentActivityDetailPage) }) }),
    React.createElement(Route, { key: 'student-my-activities', path: 'my-activities', element: React.createElement(PermissionRouteGuard, { anyOf: ['registrations.view', 'registrations.read', 'registrations.register'], element: React.createElement(MyActivitiesPage) }) }),
    React.createElement(Route, { key: 'student-scores', path: 'scores', element: React.createElement(PermissionRouteGuard, { anyOf: ['points.view_own', 'points.view_all', 'scores.read'], element: React.createElement(StudentScoresPage) }) }),
    React.createElement(Route, { key: 'student-my-certificates', path: 'my-certificates', element: React.createElement(PermissionRouteGuard, { anyOf: ['registrations.view', 'registrations.read'], element: React.createElement(MyCertificatesPage) }) }),
    React.createElement(Route, { key: 'student-profile', path: 'profile', element: React.createElement(PermissionRouteGuard, { anyOf: ['profile.read', 'profile.view'], element: React.createElement(StudentProfilePage) }) }),
    React.createElement(Route, { key: 'student-qr-scanner', path: 'qr-scanner', element: React.createElement(PermissionRouteGuard, { anyOf: ['attendance.write', 'attendance.view', 'attendance.mark'], element: React.createElement(QRScannerPage) }) }),
  ]);
}
