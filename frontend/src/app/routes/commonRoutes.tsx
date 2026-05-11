import React from 'react';
import { Route } from 'react-router-dom';
import { CompatibilityRedirect, HomeRouter } from './home';
import { RoleGuard } from './guards';

const LoginPage = React.lazy(() => import('../../features/auth/ui/pages/login/LoginPage'));
const RegisterPage = React.lazy(() => import('../../features/auth/ui/pages/register/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('../../features/auth/ui/pages/forgot-password/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('../../features/auth/ui/pages/reset-password/ResetPasswordPage'));

export function commonRoutes() {
  return [
    React.createElement(Route, { key: 'login', path: '/login', element: React.createElement(LoginPage) }),
    React.createElement(Route, { key: 'register', path: '/register', element: React.createElement(RegisterPage) }),
    React.createElement(Route, { key: 'forgot', path: '/forgot', element: React.createElement(ForgotPasswordPage) }),
    React.createElement(Route, { key: 'forgot-password', path: '/forgot-password', element: React.createElement(ForgotPasswordPage) }),
    React.createElement(Route, { key: 'reset', path: '/reset', element: React.createElement(ResetPasswordPage) }),
    React.createElement(Route, { key: 'profile', path: '/profile', element: React.createElement(RoleGuard, { allow: ['STUDENT', 'SINH_VIEN', 'LOP_TRUONG', 'GIANG_VIEN', 'ADMIN'], element: React.createElement(CompatibilityRedirect, { type: 'profile' }) }) }),
    React.createElement(Route, { key: 'user-profile', path: '/profile/user', element: React.createElement(RoleGuard, { allow: ['STUDENT', 'SINH_VIEN', 'LOP_TRUONG', 'GIANG_VIEN', 'ADMIN'], element: React.createElement(CompatibilityRedirect, { type: 'profile' }) }) }),
    React.createElement(Route, { key: 'create-activity', path: '/activities/create', element: React.createElement(RoleGuard, { allow: ['GIANG_VIEN', 'LOP_TRUONG', 'ADMIN'], element: React.createElement(CompatibilityRedirect, { type: 'activity-create' }) }) }),
    React.createElement(Route, { key: 'edit-activity', path: '/activities/edit/:id', element: React.createElement(RoleGuard, { allow: ['GIANG_VIEN', 'LOP_TRUONG', 'ADMIN'], element: React.createElement(CompatibilityRedirect, { type: 'activity-edit' }) }) }),
    React.createElement(Route, { key: 'activity-detail', path: '/activities/:id', element: React.createElement(RoleGuard, { allow: ['SINH_VIEN', 'STUDENT', 'LOP_TRUONG', 'GIANG_VIEN', 'ADMIN'], element: React.createElement(CompatibilityRedirect, { type: 'activity-detail' }) }) }),
    React.createElement(Route, { key: 'qr-scanner-root', path: '/qr-scanner', element: React.createElement(RoleGuard, { allow: ['SINH_VIEN', 'STUDENT', 'LOP_TRUONG'], element: React.createElement(CompatibilityRedirect, { type: 'qr-scanner' }) }) }),
    React.createElement(Route, { key: 'qr-management', path: '/qr-management', element: React.createElement(RoleGuard, { allow: ['GIANG_VIEN', 'LOP_TRUONG', 'ADMIN'], element: React.createElement(CompatibilityRedirect, { type: 'qr-management' }) }) }),
    React.createElement(Route, { key: 'router-catchall', path: '*', element: React.createElement(RoleGuard, { allow: ['ADMIN', 'GIANG_VIEN', 'LOP_TRUONG', 'SINH_VIEN', 'STUDENT'], element: React.createElement(HomeRouter) }) })
  ];
}
