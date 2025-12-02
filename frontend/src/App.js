import React from 'react';
import http from './shared/api/http';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { normalizeRole, roleMatches } from './shared/lib/role';
import './shared/styles/sidebar-fix.css';
import './shared/styles/layout-fix.css';
import './shared/styles/modern-admin.css';
import MultiSessionGuard from './shared/components/MultiSessionGuard';
import sessionStorageManager from './shared/api/sessionStorageManager';
import { TabSessionProvider } from './shared/contexts/TabSessionContext';
// import AdminLayout from './components/AdminLayout';
// import SimpleAdminLayout from './components/SimpleAdminLayout';
import AdminStudentLayout from './widgets/layout/ui/AdminStudentLayout';
import MonitorLayout from './widgets/layout/ui/MonitorLayout';
import StudentLayout from './widgets/layout/ui/StudentLayout';
// Active admin pages
import { 
  AdminDashboardPage as AdminDashboard,
  AdminUsersPage as AdminUsers,
  AdminActivitiesPage as AdminActivities,
} from './features/admin';
import { AdminApprovalsPage } from './features/approvals';
import QRManagementPage from './features/qr-attendance/ui/QRManagementPage';
import { AdminReportsPage as AdminReports } from './features/reports';
import { AdminRolesPage as AdminRoles, AdminProfilePage as AdminProfile } from './features/users';
import AdminNotifications from './features/notifications/ui/AdminNotificationsPage';
import AdminSettings from './features/settings/ui/AdminSettingsPage';
import SemesterManagement from './features/semesters/ui/SemesterManagementPage';
import ModernTeacherLayout from './widgets/layout/ui/TeacherLayout';
// Legacy pages removed in favor of modern auth pages
// Domain grouped imports (refactored) - use explicit index.js to avoid case conflicts on Linux
import ProfilePage from './features/profile/ui/ProfilePage';
import UserProfilePage from './features/profile/ui/UserProfilePage';
// Cleaned: remove StudentPointsModern import if not used elsewhere
import ManageActivityPage from './features/activities/ui/pages/manage-activity/ManageActivityPage';
import StudentActivityDetailPage from './features/student/ui/StudentActivityDetailPage';
import { StudentDashboardPage } from './features/student/ui/StudentDashboardPage';
import StudentActivitiesListPage from './features/student/ui/StudentActivitiesListPage';
import MyActivitiesPage from './features/student/ui/MyActivitiesPage';
import StudentProfilePage from './features/student/ui/StudentProfilePage';
import StudentScoresPage from './features/student/ui/StudentScoresPage';
import QRScannerPage from './features/qr-attendance/ui/QRScannerModernPage';
import {
  ClassManagementPage,
  ImportStudentsPage,
  TeacherActivitiesPage,
  TeacherActivityApprovalPage,
  TeacherAttendancePage,
  TeacherDashboardPage,
  TeacherNotificationsPage,
  TeacherProfilePage,
  TeacherRegistrationApprovalsPage,
  TeacherReportsPage,
  TeacherStudentManagementPage,
  TeacherStudentScoresPage
} from './features/teacher';
import { ActivityTypesManagementPage } from './features/activity-types';
import MonitorDashboardPage from './features/monitor/ui/MonitorDashboardPage';
import MonitorMyActivitiesPage from './features/monitor/ui/MonitorMyActivitiesPage';
import MonitorMyProfilePage from './features/monitor/ui/MonitorMyProfilePage';
import MonitorMyCertificatesPage from './features/monitor/ui/MonitorMyCertificatesPage';
import MonitorActivityOversightPage from './features/monitor/ui/MonitorActivityOversightPage';
import MonitorStudentManagementPage from './features/monitor/ui/MonitorStudentManagementPage';
import MonitorReportsPage from './features/monitor/ui/MonitorReportsPage';
import MonitorApprovalsPage from './features/monitor/ui/MonitorApprovalsPage';
import ClassNotificationsPage from './features/monitor/ui/ClassNotificationsPage';
import { useAppStore } from './shared/store';
import { NotificationProvider } from './shared/contexts/NotificationContext';
import { SemesterProvider } from './shared/contexts/SemesterContext';
import { useSessionTracking } from './shared/hooks/useSessionTracking';
import { usePermissions } from './shared/hooks/usePermissions';
// import { TabSessionProvider } from './contexts/TabSessionContext';
// Modern auth pages - using barrel exports
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage } from './features/auth';

// Use Neo-brutalism design for student dashboard
// const StudentDashboardModern = DashboardStudentImproved;

function RoleGuard({ allow, element }) {
  const rawRole = useAppStore(s => s.role);
  const token = useAppStore(s => s.token);
  const current = normalizeRole(rawRole);
  
  // Check authentication - ONLY check sessionStorage (tab-specific)
  if (!token) {
    console.log('[RoleGuard] No token; redirect login');
    return React.createElement(Navigate, { to: '/login', replace: true });
  }
  
  // If allow is empty array, allow all authenticated users
  if (!allow || allow.length === 0) {
    console.log('[RoleGuard] Public route - allow all authenticated users');
    return element;
  }
  
  // Check role permission
  if (!roleMatches(current, allow)) {
    console.log('[RoleGuard] Blocked role', { rawRole, current, allow });
    return React.createElement(Navigate, { to: '/', replace: true });
  }
  
  return element;
}

/**
 * PermissionRouteGuard - Chặn route nếu user không có permission cần thiết
 * Sử dụng cho các trang cần kiểm tra permission động (admin có thể bật/tắt)
 */
function PermissionRouteGuard({ permission, anyOf, allOf, element, fallbackPath = '/student' }) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading, permissions } = usePermissions();
  const location = useLocation();
  
  // Đợi loading xong
  if (loading) {
    return React.createElement('div', { 
      className: 'flex items-center justify-center min-h-screen' 
    }, React.createElement('div', { 
      className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' 
    }));
  }
  
  // Kiểm tra quyền
  let hasAccess = true;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (anyOf && anyOf.length > 0) {
    hasAccess = hasAnyPermission(anyOf);
  } else if (allOf && allOf.length > 0) {
    hasAccess = hasAllPermissions(allOf);
  }
  
  // Nếu không có quyền
  if (!hasAccess) {
    console.log('[PermissionRouteGuard] Access denied', { 
      path: location.pathname,
      permission, 
      anyOf, 
      allOf, 
      userPermissions: permissions 
    });
    return React.createElement(Navigate, { to: fallbackPath, replace: true });
  }
  
  return element;
}

function StudentHome() { return React.createElement(Navigate, { to: '/student', replace: true }); }
function TeacherHome() { return React.createElement(TeacherDashboardPage, null); }
function MonitorHome() { return React.createElement(MonitorDashboardPage, null); }
// function AdminHome() { 
//   return React.createElement(SimpleAdminLayout, null, React.createElement(AdminDashboard, null)); 
// }

function HomeRouter() {
  const storeRole = useAppStore(s => s.role);
  // Use ONLY tab session (no localStorage fallback)
  const session = sessionStorageManager.getSession();
  const roleFromSession = normalizeRole(session?.role);
  const finalRole = normalizeRole(storeRole || roleFromSession);
  console.log('HomeRouter Debug v3:', { storeRole, roleFromSession, finalRole, tabId: sessionStorageManager.getTabId() });
  if (finalRole === 'ADMIN') return React.createElement(Navigate, { to: '/admin', replace: true });
  if (finalRole === 'GIANG_VIEN') return React.createElement(Navigate, { to: '/teacher', replace: true });
  if (finalRole === 'LOP_TRUONG') return React.createElement(Navigate, { to: '/monitor', replace: true });
  if (finalRole === 'SINH_VIEN' || finalRole === 'STUDENT') return React.createElement(Navigate, { to: '/student', replace: true });
  return React.createElement(Navigate, { to: '/login', replace: true });
}

function App() {
  const [hydrated, setHydrated] = React.useState(false);
  const token = useAppStore(s => s.token);
  
  // Enable session tracking when authenticated
  useSessionTracking(!!token);

  // Central route change logger for deep debugging of unexpected redirects
  function RouteLogger() {
    const location = useLocation();
    const role = useAppStore(s => s.role);
    React.useEffect(() => {
      console.log('[RouteLogger] path change =>', location.pathname, 'role:', role);
    }, [location, role]);
    return null;
  }

  // Sync role/token early BEFORE first paint with tab-scoped session
  React.useLayoutEffect(() => {
    try {
      const session = sessionStorageManager.getSession();
      if (session && session.token) {
        const token = session.token;
        const user = session.user;
        const derivedRole = normalizeRole(session.role);
        if (token && derivedRole) {
          useAppStore.getState().setAuth({ token, user, role: derivedRole });
          console.log('[Hydration] Set auth from sessionStorage (tab-specific)', { derivedRole, tabId: sessionStorageManager.getTabId() });
        } else {
          console.log('[Hydration] Session data incomplete', { tokenPresent: !!token, derivedRole });
        }
      } else {
        console.log('[Hydration] No session found for tab:', sessionStorageManager.getTabId());
      }
    } catch (e) {
      console.warn('[Hydration] Failed to load session data', e);
    } finally {
      setHydrated(true);
    }
  }, []);

  // Global listener for role permission changes
  React.useEffect(() => {
    const handleRoleChange = async (event) => {
      if (event.key === '__role_permissions_updated_at__') {
        console.log('⚡️ Detected role permission change, forcing profile refresh...');
        const token = sessionStorageManager.getToken();
        if (!token) return;

        try {
          // Attempt to refetch profile from primary endpoint
          const response = await http.get('/users/profile');
          const payload = response?.data?.data || response?.data || null;
          if (payload) {
            const currentSession = sessionStorageManager.getSession() || {};
            // Force update session with new user data (which includes permissions)
            sessionStorageManager.saveSession({ ...currentSession, token, user: payload, role: payload.vai_tro?.ten_vt || payload.role });
            // Force a reload to ensure all guards and components re-evaluate with new permissions
            window.location.reload();
          }
        } catch (err) {
          console.error('Failed to refresh profile after role change, logging out as a security measure.', err);
          sessionStorageManager.clearSession();
          window.location.href = '/login';
        }
      }
    };

    window.addEventListener('storage', handleRoleChange);
    return () => {
      window.removeEventListener('storage', handleRoleChange);
    };
  }, []);

  if (!hydrated) {
    return React.createElement('div', { className: 'flex items-center justify-center min-h-screen text-sm text-gray-500' }, 'Đang tải phiên...');
  }

  return React.createElement(
    TabSessionProvider,
    null,
    React.createElement(
      NotificationProvider,
      null,
      React.createElement(
        SemesterProvider,
        null,
        React.createElement(
          BrowserRouter,
          null,
      React.createElement(
        'div',
        { style: { minHeight: '100vh' } },
        React.createElement(RouteLogger, null),
        React.createElement(
          Routes,
          null,
          React.createElement(Route, { key: 'login', path: '/login', element: React.createElement(LoginPage) }),
          React.createElement(Route, { key: 'register', path: '/register', element: React.createElement(RegisterPage) }),
          React.createElement(Route, { key: 'forgot', path: '/forgot', element: React.createElement(ForgotPasswordPage) }),
          React.createElement(Route, { key: 'forgot-password', path: '/forgot-password', element: React.createElement(ForgotPasswordPage) }),
          React.createElement(Route, { key: 'reset', path: '/reset', element: React.createElement(ResetPasswordPage) }),
          React.createElement(Route, { key: 'profile', path: '/profile', element: React.createElement(RoleGuard, { allow: ['STUDENT','SINH_VIEN','LOP_TRUONG','ADMIN'], element: React.createElement(ProfilePage) }) }),
          React.createElement(Route, { key: 'user-profile', path: '/profile/user', element: React.createElement(RoleGuard, { allow: ['STUDENT','SINH_VIEN','LOP_TRUONG','ADMIN'], element: React.createElement(UserProfilePage) }) }),
          // removed student points modern route (cleanup)

          // Admin layout: áp dụng mẫu sidebar kiểu sinh viên (AdminStudentLayout) với Permission Guards
          React.createElement(Route, { key: 'admin-root', path: '/admin', element: React.createElement(RoleGuard, { allow: ['ADMIN'], element: React.createElement(AdminStudentLayout) }) }, [
            React.createElement(Route, { key: 'admin-index', index: true, element: React.createElement(AdminDashboard) }),
            // Quản lý người dùng - cần users.view/users.read
            React.createElement(Route, { key: 'admin-users', path: 'users', element: React.createElement(PermissionRouteGuard, { anyOf: ['users.view', 'users.read', 'users.write'], fallbackPath: '/admin', element: React.createElement(AdminUsers) }) }),
            // Quản lý hoạt động - cần activities.view/activities.read
            React.createElement(Route, { key: 'admin-activities', path: 'activities', element: React.createElement(PermissionRouteGuard, { anyOf: ['activities.view', 'activities.read', 'activities.write'], fallbackPath: '/admin', element: React.createElement(AdminActivities) }) }),
            // Quản lý vai trò - cần roles.read/system.roles
            React.createElement(Route, { key: 'admin-roles', path: 'roles', element: React.createElement(PermissionRouteGuard, { anyOf: ['roles.read', 'roles.write', 'system.roles'], fallbackPath: '/admin', element: React.createElement(AdminRoles) }) }),
            // Tạo hoạt động - cần activities.create/activities.write
            React.createElement(Route, { key: 'admin-activity-create', path: 'activities/create', element: React.createElement(PermissionRouteGuard, { anyOf: ['activities.create', 'activities.write'], fallbackPath: '/admin/activities', element: React.createElement(ManageActivityPage) }) }),
            // Sửa hoạt động - cần activities.update/activities.write
            React.createElement(Route, { key: 'admin-activity-edit', path: 'activities/:id/edit', element: React.createElement(PermissionRouteGuard, { anyOf: ['activities.update', 'activities.write'], fallbackPath: '/admin/activities', element: React.createElement(ManageActivityPage) }) }),
            // Duyệt hoạt động - cần activities.approve
            React.createElement(Route, { key: 'admin-approvals', path: 'approvals', element: React.createElement(PermissionRouteGuard, { anyOf: ['activities.approve', 'registrations.approve'], fallbackPath: '/admin', element: React.createElement(AdminApprovalsPage) }) }),
            // Báo cáo - cần reports.read/reports.view
            React.createElement(Route, { key: 'admin-reports', path: 'reports', element: React.createElement(PermissionRouteGuard, { anyOf: ['reports.read', 'reports.view', 'reports.export'], fallbackPath: '/admin', element: React.createElement(AdminReports) }) }),
            // Thông báo - cần notifications.view/notifications.read
            React.createElement(Route, { key: 'admin-notifications', path: 'notifications', element: React.createElement(PermissionRouteGuard, { anyOf: ['notifications.view', 'notifications.read', 'notifications.write', 'notifications.create'], fallbackPath: '/admin', element: React.createElement(AdminNotifications) }) }),
            // Điểm danh QR - cần attendance.view/attendance.write
            React.createElement(Route, { key: 'admin-qr-attendance', path: 'qr-attendance', element: React.createElement(PermissionRouteGuard, { anyOf: ['attendance.view', 'attendance.read', 'attendance.write', 'attendance.mark'], fallbackPath: '/admin', element: React.createElement(QRManagementPage) }) }),
            // Loại hoạt động - cần activityTypes.read
            React.createElement(Route, { key: 'admin-activity-types', path: 'activity-types', element: React.createElement(PermissionRouteGuard, { anyOf: ['activityTypes.read', 'activityTypes.write'], fallbackPath: '/admin', element: React.createElement(ActivityTypesManagementPage) }) }),
            // Học kỳ - cần system.settings
            React.createElement(Route, { key: 'admin-semesters', path: 'semesters', element: React.createElement(PermissionRouteGuard, { anyOf: ['system.settings', 'system.manage'], fallbackPath: '/admin', element: React.createElement(SemesterManagement) }) }),
            // Cài đặt - cần system.settings/system.configure
            React.createElement(Route, { key: 'admin-settings', path: 'settings', element: React.createElement(PermissionRouteGuard, { anyOf: ['system.settings', 'system.configure', 'system.manage'], fallbackPath: '/admin', element: React.createElement(AdminSettings) }) }),
            // Hồ sơ - cần profile.read
            React.createElement(Route, { key: 'admin-profile', path: 'profile', element: React.createElement(PermissionRouteGuard, { anyOf: ['profile.read', 'profile.view'], fallbackPath: '/admin', element: React.createElement(AdminProfile) }) }),
          ]),

          // Teacher nested layout - Modern UI với Permission Guards
          React.createElement(Route, { key: 'teacher-root', path: '/teacher', element: React.createElement(RoleGuard, { allow: ['GIANG_VIEN','ADMIN'], element: React.createElement(ModernTeacherLayout) }) }, [
            React.createElement(Route, { key: 'teacher-index', index: true, element: React.createElement(TeacherDashboardPage) }),
            // Quản lý hoạt động - cần activities.view
            React.createElement(Route, { key: 'teacher-activities', path: 'activities', element: React.createElement(PermissionRouteGuard, { anyOf: ['activities.view', 'activities.read', 'activities.write'], fallbackPath: '/teacher', element: React.createElement(TeacherActivitiesPage) }) }),
            // Duyệt hoạt động - cần activities.approve
            React.createElement(Route, { key: 'teacher-approve', path: 'approve', element: React.createElement(PermissionRouteGuard, { anyOf: ['activities.approve', 'activities.reject'], fallbackPath: '/teacher', element: React.createElement(TeacherActivityApprovalPage) }) }),
            // Duyệt đăng ký - cần registrations.approve
            React.createElement(Route, { key: 'teacher-registrations-approve', path: 'registrations/approve', element: React.createElement(PermissionRouteGuard, { anyOf: ['registrations.approve', 'registrations.reject', 'registrations.write'], fallbackPath: '/teacher', element: React.createElement(TeacherRegistrationApprovalsPage) }) }),
            // Điểm danh - cần attendance.view/attendance.write
            React.createElement(Route, { key: 'teacher-attendance', path: 'attendance', element: React.createElement(PermissionRouteGuard, { anyOf: ['attendance.view', 'attendance.read', 'attendance.write', 'attendance.mark'], fallbackPath: '/teacher', element: React.createElement(TeacherAttendancePage) }) }),
            // Xem điểm sinh viên - cần points.view_all/scores.read
            React.createElement(Route, { key: 'teacher-student-scores', path: 'student-scores', element: React.createElement(PermissionRouteGuard, { anyOf: ['points.view_all', 'scores.read', 'students.read'], fallbackPath: '/teacher', element: React.createElement(TeacherStudentScoresPage) }) }),
            // Quản lý sinh viên - cần students.read
            React.createElement(Route, { key: 'teacher-students', path: 'students', element: React.createElement(PermissionRouteGuard, { anyOf: ['students.read', 'students.update', 'classmates.read'], fallbackPath: '/teacher', element: React.createElement(TeacherStudentManagementPage) }) }),
            // Import sinh viên - cần students.update
            React.createElement(Route, { key: 'teacher-students-import', path: 'students/import', element: React.createElement(PermissionRouteGuard, { anyOf: ['students.update', 'users.write'], fallbackPath: '/teacher/students', element: React.createElement(ImportStudentsPage) }) }),
            React.createElement(Route, { key: 'teacher-classes-redirect', path: 'classes', element: React.createElement(Navigate, { to: '/teacher/students', replace: true }) }),
            // Thông báo - cần notifications.view
            React.createElement(Route, { key: 'teacher-notifications', path: 'notifications', element: React.createElement(PermissionRouteGuard, { anyOf: ['notifications.view', 'notifications.read', 'notifications.write', 'notifications.create'], fallbackPath: '/teacher', element: React.createElement(TeacherNotificationsPage) }) }),
            // Báo cáo - cần reports.read
            React.createElement(Route, { key: 'teacher-reports', path: 'reports', element: React.createElement(PermissionRouteGuard, { anyOf: ['reports.read', 'reports.view', 'reports.export'], fallbackPath: '/teacher', element: React.createElement(TeacherReportsPage) }) }),
            React.createElement(Route, { key: 'teacher-reports-export', path: 'reports/export', element: React.createElement(PermissionRouteGuard, { anyOf: ['reports.export', 'reports.read'], fallbackPath: '/teacher', element: React.createElement(TeacherReportsPage) }) }),
            // Hồ sơ - cần profile.read
            React.createElement(Route, { key: 'teacher-profile', path: 'profile', element: React.createElement(PermissionRouteGuard, { anyOf: ['profile.read', 'profile.view'], fallbackPath: '/teacher', element: React.createElement(TeacherProfilePage) }) }),
            // Tạo thông báo - cần notifications.create
            React.createElement(Route, { key: 'teacher-notifications-create', path: 'notifications/create', element: React.createElement(PermissionRouteGuard, { anyOf: ['notifications.create', 'notifications.write'], fallbackPath: '/teacher/notifications', element: React.createElement(TeacherNotificationsPage) }) })
          ]),

          // Monitor nested layout với Permission Guards
          React.createElement(Route, { key: 'monitor-root', path: '/monitor', element: React.createElement(RoleGuard, { allow: ['LOP_TRUONG','GIANG_VIEN','ADMIN'], element: React.createElement(MonitorLayout) }) }, [
            React.createElement(Route, { key: 'monitor-index', index: true, element: React.createElement(MonitorHome) }),
            // Personal section (Student features for Monitor)
            // Hoạt động của tôi - cần registrations.view
            React.createElement(Route, { key: 'monitor-my-activities', path: 'my-activities', element: React.createElement(PermissionRouteGuard, { anyOf: ['registrations.view', 'registrations.read', 'registrations.register'], fallbackPath: '/monitor', element: React.createElement(MonitorMyActivitiesPage) }) }),
            // QR Scanner - cần attendance.write
            React.createElement(Route, { key: 'monitor-qr-scanner', path: 'qr-scanner', element: React.createElement(PermissionRouteGuard, { anyOf: ['attendance.write', 'attendance.view', 'attendance.mark'], fallbackPath: '/monitor', element: React.createElement(QRScannerPage) }) }),
            // Hồ sơ của tôi - cần profile.read
            React.createElement(Route, { key: 'monitor-my-profile', path: 'my-profile', element: React.createElement(PermissionRouteGuard, { anyOf: ['profile.read', 'profile.view'], fallbackPath: '/monitor', element: React.createElement(MonitorMyProfilePage) }) }),
            // Chứng chỉ - cần registrations.view
            React.createElement(Route, { key: 'monitor-my-certificates', path: 'my-certificates', element: React.createElement(PermissionRouteGuard, { anyOf: ['registrations.view', 'registrations.read'], fallbackPath: '/monitor', element: React.createElement(MonitorMyCertificatesPage) }) }),
            // Class management section
            // Quản lý hoạt động lớp - cần activities.view
            React.createElement(Route, { key: 'class-activities', path: 'activities', element: React.createElement(PermissionRouteGuard, { anyOf: ['activities.view', 'activities.read', 'activities.write'], fallbackPath: '/monitor', element: React.createElement(MonitorActivityOversightPage) }) }),
            // Tạo hoạt động - cần activities.create
            React.createElement(Route, { key: 'class-activity-create', path: 'activities/create', element: React.createElement(RoleGuard, { allow: ['LOP_TRUONG','ADMIN'], element: React.createElement(PermissionRouteGuard, { anyOf: ['activities.create', 'activities.write'], fallbackPath: '/monitor/activities', element: React.createElement(ManageActivityPage) }) }) }),
            // Duyệt đăng ký - cần registrations.approve
            React.createElement(Route, { key: 'class-approvals', path: 'approvals', element: React.createElement(PermissionRouteGuard, { anyOf: ['registrations.approve', 'registrations.reject', 'registrations.write'], fallbackPath: '/monitor', element: React.createElement(MonitorApprovalsPage) }) }),
            // Quản lý sinh viên - cần students.read/classmates.read
            React.createElement(Route, { key: 'class-students', path: 'students', element: React.createElement(PermissionRouteGuard, { anyOf: ['students.read', 'classmates.read', 'classmates.assist'], fallbackPath: '/monitor', element: React.createElement(MonitorStudentManagementPage) }) }),
            // Báo cáo - cần reports.read
            React.createElement(Route, { key: 'class-reports', path: 'reports', element: React.createElement(PermissionRouteGuard, { anyOf: ['reports.read', 'reports.view', 'reports.export'], fallbackPath: '/monitor', element: React.createElement(MonitorReportsPage) }) }),
            // Thông báo lớp - cần notifications.view
            React.createElement(Route, { key: 'class-notifications', path: 'notifications', element: React.createElement(PermissionRouteGuard, { anyOf: ['notifications.view', 'notifications.read', 'notifications.write', 'notifications.create'], fallbackPath: '/monitor', element: React.createElement(ClassNotificationsPage) }) }),
          ]),

          // Student nested layout - Modern UI with Permission Guards
          React.createElement(Route, { key: 'student-root', path: '/student', element: React.createElement(RoleGuard, { allow: ['SINH_VIEN','STUDENT','LOP_TRUONG'], element: React.createElement(StudentLayout) }) }, [
            React.createElement(Route, { key: 'student-index', index: true, element: React.createElement(StudentDashboardPage) }),
            // Xem hoạt động - cần permission activities.view
            React.createElement(Route, { key: 'student-activities', path: 'activities', element: React.createElement(PermissionRouteGuard, { anyOf: ['activities.view', 'activities.read'], element: React.createElement(StudentActivitiesListPage) }) }),
            // Xem đăng ký của tôi - cần permission registrations.view
            React.createElement(Route, { key: 'student-my-activities', path: 'my-activities', element: React.createElement(PermissionRouteGuard, { anyOf: ['registrations.view', 'registrations.read', 'registrations.register'], element: React.createElement(MyActivitiesPage) }) }),
            // Xem điểm rèn luyện - cần permission points.view_own hoặc points.view_all
            React.createElement(Route, { key: 'student-scores', path: 'scores', element: React.createElement(PermissionRouteGuard, { anyOf: ['points.view_own', 'points.view_all', 'scores.read'], element: React.createElement(StudentScoresPage) }) }),
            // Xem hồ sơ - cần permission profile.read
            React.createElement(Route, { key: 'student-profile', path: 'profile', element: React.createElement(PermissionRouteGuard, { anyOf: ['profile.read', 'profile.view'], element: React.createElement(StudentProfilePage) }) }),
            // QR Scanner - cần permission attendance.write hoặc attendance.view
            React.createElement(Route, { key: 'student-qr-scanner', path: 'qr-scanner', element: React.createElement(PermissionRouteGuard, { anyOf: ['attendance.write', 'attendance.view', 'attendance.mark'], element: React.createElement(QRScannerPage) }) }),
          ]),

          // Common routes
          React.createElement(Route, { key: 'create-activity', path: '/activities/create', element: React.createElement(RoleGuard, { allow: ['GIANG_VIEN','LOP_TRUONG','ADMIN'], element: React.createElement(ManageActivityPage) }) }),
          React.createElement(Route, { key: 'edit-activity', path: '/activities/edit/:id', element: React.createElement(RoleGuard, { allow: ['GIANG_VIEN','LOP_TRUONG','ADMIN'], element: React.createElement(ManageActivityPage) }) }),
          // Chi tiết hoạt động - cần permission activities.view
          React.createElement(Route, { key: 'activity-detail', path: '/activities/:id', element: React.createElement(RoleGuard, { allow: ['SINH_VIEN','STUDENT','LOP_TRUONG','GIANG_VIEN','ADMIN'], element: React.createElement(PermissionRouteGuard, { anyOf: ['activities.view', 'activities.read'], fallbackPath: '/student', element: React.createElement(StudentLayout, null, React.createElement(StudentActivityDetailPage)) }) }) }),
          // (Re-added) Root-level QR Scanner fallback route to bypass potential nested routing edge cases.
          // Accessible by students and monitors. If nested route fails, this ensures accessibility.
          React.createElement(Route, { key: 'qr-scanner-root', path: '/qr-scanner', element: React.createElement(RoleGuard, { allow: ['SINH_VIEN','STUDENT','LOP_TRUONG'], element: React.createElement(PermissionRouteGuard, { anyOf: ['attendance.write', 'attendance.view', 'attendance.mark'], element: React.createElement(QRScannerPage) }) }) }),
          React.createElement(Route, { key: 'qr-management', path: '/qr-management', element: React.createElement(RoleGuard, { allow: ['GIANG_VIEN','LOP_TRUONG','ADMIN'], element: React.createElement(QRManagementPage) }) }),

          React.createElement(Route, { key: 'router-catchall', path: '*', element: React.createElement(RoleGuard, { allow: ['ADMIN','GIANG_VIEN','LOP_TRUONG','SINH_VIEN','STUDENT'], element: React.createElement(HomeRouter) }) })
        )
      )
    )
    )
    )
  );
}

export default App;
