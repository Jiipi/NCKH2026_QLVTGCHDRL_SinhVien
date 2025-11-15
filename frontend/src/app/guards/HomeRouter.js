import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppStore } from '../../shared/store/useAppStore';
import { normalizeRole } from '../../shared/lib/role';
import { ROLE_HOME_ROUTES, PUBLIC_ROUTES } from '../routes/constants';

/**
 * HomeRouter - Điều hướng người dùng đến trang chủ phù hợp với vai trò
 */
export function HomeRouter() {
  const role = useAppStore(state => state.role);
  const finalRole = normalizeRole(role);

  // Lấy route tương ứng với role, mặc định là login
  const homeRoute = ROLE_HOME_ROUTES[finalRole] || PUBLIC_ROUTES.LOGIN;

  return <Navigate to={homeRoute} replace />;
}

