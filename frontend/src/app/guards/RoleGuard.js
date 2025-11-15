import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppStore } from '../../shared/store/useAppStore';
import { normalizeRole, roleMatches } from '../../shared/lib/role';

/**
 * RoleGuard - Bảo vệ routes dựa trên vai trò người dùng
 * @param {string[]} allow - Danh sách các vai trò được phép truy cập
 * @param {React.ReactNode} children - Component con được bảo vệ
 */
export function RoleGuard({ allow, children }) {
  // Select primitives separately to avoid returning a new object each render
  const token = useAppStore(state => state.token);
  const role = useAppStore(state => state.role);
  const currentRole = normalizeRole(role);

  // Chưa đăng nhập -> chuyển đến trang login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra quyền truy cập nếu có danh sách allow
  if (allow && allow.length > 0 && !roleMatches(currentRole, allow)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

