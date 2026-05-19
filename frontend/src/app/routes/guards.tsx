import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { normalizeRole, roleMatches } from '../../shared/lib/role';
import { useAppStore } from '../../shared/store';
import { usePermissions } from '../../shared/hooks/usePermissions';
import AppLoadingScreen from '../../shared/components/common/AppLoadingScreen';

interface RoleGuardProps {
  allow: string[];
  element: React.ReactElement;
}

export function RoleGuard({ allow, element }: RoleGuardProps) {
  const rawRole = useAppStore(s => s.role);
  const token = useAppStore(s => s.token);
  const current = normalizeRole(rawRole);

  if (!token) {
    console.log('[RoleGuard] No token; redirect login');
    return React.createElement(Navigate, { to: '/login', replace: true });
  }

  if (!allow || allow.length === 0) {
    console.log('[RoleGuard] Public route - allow all authenticated users');
    return element;
  }

  if (!roleMatches(current, allow)) {
    console.log('[RoleGuard] Blocked role', { rawRole, current, allow });
    return React.createElement(Navigate, { to: '/', replace: true });
  }

  return element;
}

interface PermissionRouteGuardProps {
  permission?: string;
  anyOf?: string[];
  allOf?: string[];
  element: React.ReactElement;
  fallbackPath?: string;
}

export function PermissionRouteGuard({ permission, anyOf, allOf, element, fallbackPath = '/student' }: PermissionRouteGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading, permissions } = usePermissions();
  const location = useLocation();

  if (loading) {
    return React.createElement(AppLoadingScreen, { fullScreen: true });
  }

  let hasAccess = true;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (anyOf && anyOf.length > 0) {
    hasAccess = hasAnyPermission(anyOf);
  } else if (allOf && allOf.length > 0) {
    hasAccess = hasAllPermissions(allOf);
  }

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
