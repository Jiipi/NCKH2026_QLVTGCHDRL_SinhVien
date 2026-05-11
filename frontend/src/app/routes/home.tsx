import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import sessionStorageManager from '../../shared/api/sessionStorageManager';
import { normalizeRole } from '../../shared/lib/role';
import { useAppStore } from '../../shared/store';

export function getRoleHomePath(role: string | null | undefined) {
  const finalRole = normalizeRole(role);
  if (finalRole === 'ADMIN') return '/admin';
  if (finalRole === 'GIANG_VIEN') return '/teacher';
  if (finalRole === 'LOP_TRUONG') return '/monitor';
  if (finalRole === 'SINH_VIEN' || finalRole === 'STUDENT') return '/student';
  return '/login';
}

function useCurrentRole() {
  const storeRole = useAppStore(s => s.role);
  const session = sessionStorageManager.getSession();
  return normalizeRole(storeRole || session?.role);
}

export function CompatibilityRedirect({ type }: { type: 'activity-detail' | 'activity-create' | 'activity-edit' | 'qr-scanner' | 'qr-management' | 'profile' }) {
  const role = useCurrentRole();
  const params = useParams();
  const id = params.id;

  let target = getRoleHomePath(role);

  if (type === 'activity-detail' && id) {
    if (role === 'ADMIN') target = `/admin/activities/${id}`;
    else if (role === 'GIANG_VIEN') target = `/teacher/activities/${id}`;
    else if (role === 'LOP_TRUONG') target = `/monitor/activities/${id}`;
    else target = `/student/activities/${id}`;
  } else if (type === 'activity-create') {
    if (role === 'ADMIN') target = '/admin/activities/create';
    else if (role === 'GIANG_VIEN') target = '/teacher/activities/create';
    else if (role === 'LOP_TRUONG') target = '/monitor/activities/create';
  } else if (type === 'activity-edit' && id) {
    if (role === 'ADMIN') target = `/admin/activities/${id}/edit`;
    else if (role === 'GIANG_VIEN') target = `/teacher/activities/${id}/edit`;
    else if (role === 'LOP_TRUONG') target = `/monitor/activities/${id}/edit`;
  } else if (type === 'qr-scanner') {
    if (role === 'LOP_TRUONG') target = '/monitor/qr-scanner';
    else if (role === 'SINH_VIEN' || role === 'STUDENT') target = '/student/qr-scanner';
  } else if (type === 'qr-management') {
    if (role === 'ADMIN') target = '/admin/qr-attendance';
    else if (role === 'GIANG_VIEN') target = '/teacher/qr-management';
    else if (role === 'LOP_TRUONG') target = '/monitor/qr-management';
  } else if (type === 'profile') {
    if (role === 'ADMIN') target = '/admin/profile';
    else if (role === 'GIANG_VIEN') target = '/teacher/profile';
    else if (role === 'LOP_TRUONG') target = '/monitor/my-profile';
    else if (role === 'SINH_VIEN' || role === 'STUDENT') target = '/student/profile';
  }

  return React.createElement(Navigate, { to: target, replace: true });
}

export function HomeRouter() {
  const storeRole = useAppStore(s => s.role);
  const session = sessionStorageManager.getSession();
  const roleFromSession = normalizeRole(session?.role);
  const finalRole = normalizeRole(storeRole || roleFromSession);
  return React.createElement(Navigate, { to: getRoleHomePath(finalRole), replace: true });
}
