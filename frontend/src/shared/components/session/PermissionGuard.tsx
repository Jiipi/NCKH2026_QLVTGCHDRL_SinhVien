/**
 * PermissionGuard Component
 * Ẩn hoặc disable component khi user không có quyền
 * 
 * Usage:
 * 
 * // Ẩn hoàn toàn
 * <PermissionGuard permission="profile.update">
 *   <button>Cập nhật</button>
 * </PermissionGuard>
 * 
 * // Disable thay vì ẩn
 * <PermissionGuard permission="profile.update" mode="disable">
 *   <button>Cập nhật</button>
 * </PermissionGuard>
 * 
 * // Kiểm tra nhiều quyền (OR logic)
 * <PermissionGuard anyOf={['users.read', 'users.write']}>
 *   <div>...</div>
 * </PermissionGuard>
 * 
 * // Kiểm tra nhiều quyền (AND logic)
 * <PermissionGuard allOf={['users.read', 'users.write']}>
 *   <div>...</div>
 * </PermissionGuard>
 */

import React, { ReactNode, ReactElement } from 'react';
import { usePermissions } from '../../hooks/usePermissions';

interface PermissionGuardProps {
  children?: ReactNode;
  permission?: string;
  anyOf?: string[];
  allOf?: string[];
  mode?: 'hide' | 'disable' | 'replace';
  fallback?: ReactNode;
  // For route-based usage
  element?: ReactElement;
  fallbackPath?: string;
}

export default function PermissionGuard({
  children,
  permission,
  anyOf,
  allOf,
  mode = 'hide',
  fallback = null,
  element,
}: PermissionGuardProps): ReactNode {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();

  // If element is provided, use it as children (for route compatibility)
  const content = element || children;

  // Đợi loading xong
  if (loading) {
    return mode === 'hide' ? null : content;
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
    if (mode === 'hide') {
      return fallback;
    }

    if (mode === 'replace') {
      return fallback;
    }

    if (mode === 'disable') {
      // Clone children và thêm disabled prop
      return React.Children.map(content, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            disabled: true,
            className: ((child.props as { className?: string }).className || '') + ' opacity-50 cursor-not-allowed',
            title: 'Bạn không có quyền thực hiện thao tác này',
          } as Record<string, unknown>);
        }
        return child;
      });
    }
  }

  // Có quyền - render bình thường
  return content;
}
