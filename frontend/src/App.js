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
import AdminDashboard from './features/admin/ui/AdminDashboardPage';
import AdminUsers from './features/admin/ui/AdminUsersPage';
import AdminActivities from './features/admin/ui/AdminActivitiesPage';
import AdminApprovalsPage from './features/approvals/ui/AdminApprovalsPage';
import QRManagementPage from './features/qr-attendance/ui/QRManagementPage';
import { AdminReportsPage as AdminReports } from './features/reports';
import AdminRoles from './features/users/ui/AdminRolesPage';
import AdminNotifications from './features/notifications/ui/AdminNotificationsPage';
import AdminSettings from './features/settings/ui/AdminSettingsPage';
import AdminProfile from './features/users/ui/AdminProfilePage';
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
import TeacherDashboardPage from './features/teacher/ui/TeacherDashboardPage';
// TeacherProfile moved to features - was ./pages/teacher/TeacherProfile
import TeacherProfilePage from './features/teacher/ui/TeacherProfilePage';
import TeacherPreferencesPage from './features/teacher/ui/TeacherPreferencesPage';
// Legacy approval page replaced by FSD implementation
// import ModernActivityApproval from './pages/teacher/ModernActivityApproval';
import TeacherActivityApprovalPage from './features/teacher/ui/TeacherActivityApprovalPage';
// Legacy registration approvals replaced by FSD page
// import TeacherRegistrationApprovals from './pages/teacher/TeacherRegistrationApprovals';
import TeacherRegistrationApprovalsPage from './features/teacher/ui/TeacherRegistrationApprovalsPage';
// Legacy student management replaced by FSD 3-tier implementation
// import ModernStudentManagement from './pages/teacher/ModernStudentManagement';
import TeacherStudentManagementPage from './features/teacher/ui/TeacherStudentManagementPage';
// ImportStudents, ModernReports, ModernNotifications moved to features
import ImportStudentsPage from './features/teacher/ui/ImportStudentsPage';
import ClassManagementPage from './features/teacher/ui/ClassManagementPage';
import TeacherReportsPage from './features/teacher/ui/TeacherReportsPage';
import TeacherNotificationsPage from './features/teacher/ui/TeacherNotificationsPage';
import ActivityTypesManagementPage from './features/activity-types/ui/ActivityTypesManagementPage';
import TeacherActivitiesPage from './features/teacher/ui/TeacherActivitiesPage';
import TeacherAttendancePage from './features/teacher/ui/TeacherAttendancePage';
import TeacherStudentScoresPage from './features/teacher/ui/TeacherStudentScoresPage';
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
import { useSessionTracking } from './shared/hooks/useSessionTracking';
// import { TabSessionProvider } from './contexts/TabSessionContext';
// Modern auth pages (legacy path kept due to different shared structure)
import LoginPage from './features/auth/ui/LoginPage';
import RegisterPage from './features/auth/ui/RegisterPage';
import ForgotPasswordPage from './features/auth/ui/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/ui/ResetPasswordPage';

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

          // Admin layout: áp dụng mẫu sidebar kiểu sinh viên (AdminStudentLayout)
          React.createElement(Route, { key: 'admin-root', path: '/admin', element: React.createElement(RoleGuard, { allow: ['ADMIN'], element: React.createElement(AdminStudentLayout) }) }, [
            React.createElement(Route, { key: 'admin-index', index: true, element: React.createElement(AdminDashboard) }),
            React.createElement(Route, { key: 'admin-users', path: 'users', element: React.createElement(AdminUsers) }),
            React.createElement(Route, { key: 'admin-activities', path: 'activities', element: React.createElement(AdminActivities) }),
            React.createElement(Route, { key: 'admin-roles', path: 'roles', element: React.createElement(AdminRoles) }),
            React.createElement(Route, { key: 'admin-activity-create', path: 'activities/create', element: React.createElement(ManageActivityPage) }),
            React.createElement(Route, { key: 'admin-activity-edit', path: 'activities/:id/edit', element: React.createElement(ManageActivityPage) }),
            React.createElement(Route, { key: 'admin-approvals', path: 'approvals', element: React.createElement(AdminApprovalsPage) }),
            React.createElement(Route, { key: 'admin-reports', path: 'reports', element: React.createElement(AdminReports) }),
            React.createElement(Route, { key: 'admin-notifications', path: 'notifications', element: React.createElement(AdminNotifications) }),
            React.createElement(Route, { key: 'admin-qr-attendance', path: 'qr-attendance', element: React.createElement(QRManagementPage) }),
            // Admin manage Activity Types (reuse teacher page for now)
            React.createElement(Route, { key: 'admin-activity-types', path: 'activity-types', element: React.createElement(ActivityTypesManagementPage) }),
            React.createElement(Route, { key: 'admin-semesters', path: 'semesters', element: React.createElement(SemesterManagement) }),
            React.createElement(Route, { key: 'admin-settings', path: 'settings', element: React.createElement(AdminSettings) }),
            React.createElement(Route, { key: 'admin-profile', path: 'profile', element: React.createElement(AdminProfile) }),
          ]),

          // Teacher nested layout - Modern UI
          React.createElement(Route, { key: 'teacher-root', path: '/teacher', element: React.createElement(RoleGuard, { allow: ['GIANG_VIEN','ADMIN'], element: React.createElement(ModernTeacherLayout) }) }, [
            React.createElement(Route, { key: 'teacher-index', index: true, element: React.createElement(TeacherDashboardPage) }),
            React.createElement(Route, { key: 'teacher-activities', path: 'activities', element: React.createElement(TeacherActivitiesPage) }),
            React.createElement(Route, { key: 'teacher-approve', path: 'approve', element: React.createElement(TeacherActivityApprovalPage) }),
            React.createElement(Route, { key: 'teacher-registrations-approve', path: 'registrations/approve', element: React.createElement(TeacherRegistrationApprovalsPage) }),
            React.createElement(Route, { key: 'teacher-attendance', path: 'attendance', element: React.createElement(TeacherAttendancePage) }),
            React.createElement(Route, { key: 'teacher-student-scores', path: 'student-scores', element: React.createElement(TeacherStudentScoresPage) }),
            React.createElement(Route, { key: 'teacher-students', path: 'students', element: React.createElement(TeacherStudentManagementPage) }),
            React.createElement(Route, { key: 'teacher-students-import', path: 'students/import', element: React.createElement(ImportStudentsPage) }),
            React.createElement(Route, { key: 'teacher-classes-redirect', path: 'classes', element: React.createElement(Navigate, { to: '/teacher/students', replace: true }) }),
            React.createElement(Route, { key: 'teacher-notifications', path: 'notifications', element: React.createElement(TeacherNotificationsPage) }),
            React.createElement(Route, { key: 'teacher-reports', path: 'reports', element: React.createElement(TeacherReportsPage) }),
          React.createElement(Route, { key: 'teacher-reports-export', path: 'reports/export', element: React.createElement(TeacherReportsPage) }),
            React.createElement(Route, { key: 'teacher-profile', path: 'profile', element: React.createElement(TeacherProfilePage) }),
          React.createElement(Route, { key: 'teacher-notifications-create', path: 'notifications/create', element: React.createElement(TeacherNotificationsPage) }),
            React.createElement(Route, { key: 'teacher-preferences', path: 'preferences', element: React.createElement(TeacherPreferencesPage) })
          ]),

          // Monitor nested layout
          React.createElement(Route, { key: 'monitor-root', path: '/monitor', element: React.createElement(RoleGuard, { allow: ['LOP_TRUONG','GIANG_VIEN','ADMIN'], element: React.createElement(MonitorLayout) }) }, [
            React.createElement(Route, { key: 'monitor-index', index: true, element: React.createElement(MonitorHome) }),
            // Personal section (Student features for Monitor)
            React.createElement(Route, { key: 'monitor-my-activities', path: 'my-activities', element: React.createElement(MonitorMyActivitiesPage) }),
            React.createElement(Route, { key: 'monitor-qr-scanner', path: 'qr-scanner', element: React.createElement(QRScannerPage) }),
            React.createElement(Route, { key: 'monitor-my-profile', path: 'my-profile', element: React.createElement(MonitorMyProfilePage) }),
            React.createElement(Route, { key: 'monitor-my-certificates', path: 'my-certificates', element: React.createElement(MonitorMyCertificatesPage) }),
            // Class management section
            React.createElement(Route, { key: 'class-activities', path: 'activities', element: React.createElement(MonitorActivityOversightPage) }),
            React.createElement(Route, { key: 'class-activity-create', path: 'activities/create', element: React.createElement(RoleGuard, { allow: ['LOP_TRUONG','ADMIN'], element: React.createElement(ManageActivityPage) }) }),
            React.createElement(Route, { key: 'class-approvals', path: 'approvals', element: React.createElement(MonitorApprovalsPage) }),
            React.createElement(Route, { key: 'class-students', path: 'students', element: React.createElement(MonitorStudentManagementPage) }),
            React.createElement(Route, { key: 'class-reports', path: 'reports', element: React.createElement(MonitorReportsPage) }),
            React.createElement(Route, { key: 'class-notifications', path: 'notifications', element: React.createElement(ClassNotificationsPage) }),
          ]),

          // Student nested layout - Modern UI
          React.createElement(Route, { key: 'student-root', path: '/student', element: React.createElement(RoleGuard, { allow: ['SINH_VIEN','STUDENT','LOP_TRUONG'], element: React.createElement(StudentLayout) }) }, [
            React.createElement(Route, { key: 'student-index', index: true, element: React.createElement(StudentDashboardPage) }),
            React.createElement(Route, { key: 'student-activities', path: 'activities', element: React.createElement(StudentActivitiesListPage) }),
            React.createElement(Route, { key: 'student-my-activities', path: 'my-activities', element: React.createElement(MyActivitiesPage) }),
            React.createElement(Route, { key: 'student-scores', path: 'scores', element: React.createElement(StudentScoresPage) }),
            React.createElement(Route, { key: 'student-profile', path: 'profile', element: React.createElement(StudentProfilePage) }),
            React.createElement(Route, { key: 'student-qr-scanner', path: 'qr-scanner', element: React.createElement(QRScannerPage) }),
          ]),

          // Common routes
          React.createElement(Route, { key: 'create-activity', path: '/activities/create', element: React.createElement(RoleGuard, { allow: ['GIANG_VIEN','LOP_TRUONG','ADMIN'], element: React.createElement(ManageActivityPage) }) }),
          React.createElement(Route, { key: 'edit-activity', path: '/activities/edit/:id', element: React.createElement(RoleGuard, { allow: ['GIANG_VIEN','LOP_TRUONG','ADMIN'], element: React.createElement(ManageActivityPage) }) }),
          React.createElement(Route, { key: 'activity-detail', path: '/activities/:id', element: React.createElement(RoleGuard, { allow: ['SINH_VIEN','STUDENT','LOP_TRUONG','GIANG_VIEN','ADMIN'], element: React.createElement(StudentLayout, null, React.createElement(StudentActivityDetailPage)) }) }),
          // (Re-added) Root-level QR Scanner fallback route to bypass potential nested routing edge cases.
          // Accessible by students and monitors. If nested route fails, this ensures accessibility.
          React.createElement(Route, { key: 'qr-scanner-root', path: '/qr-scanner', element: React.createElement(RoleGuard, { allow: ['SINH_VIEN','STUDENT','LOP_TRUONG'], element: React.createElement(QRScannerPage) }) }),
          React.createElement(Route, { key: 'qr-management', path: '/qr-management', element: React.createElement(RoleGuard, { allow: ['GIANG_VIEN','LOP_TRUONG','ADMIN'], element: React.createElement(QRManagementPage) }) }),

          React.createElement(Route, { key: 'router-catchall', path: '*', element: React.createElement(RoleGuard, { allow: ['ADMIN','GIANG_VIEN','LOP_TRUONG','SINH_VIEN','STUDENT'], element: React.createElement(HomeRouter) }) })
        )
      )
    )
    )
  );
}

export default App;
