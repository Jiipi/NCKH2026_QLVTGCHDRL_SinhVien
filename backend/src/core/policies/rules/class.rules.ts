/**
 * Class-specific authorization rules
 */

import { ROLES, RoleType } from '../ability';

/**
 * User interface for class rules
 */
export interface IClassUser {
  id?: string | number;
  vai_tro?: RoleType;
  lop_id?: string | number;
  [key: string]: unknown;
}

/**
 * Class data interface
 */
export interface IClassData {
  id?: string | number;
  giao_vien_chu_nhiem_id?: string | number;
  [key: string]: unknown;
}

/**
 * Permission result interface
 */
export interface IPermissionResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Prisma where clause interface for class filter
 */
export interface IClassFilter {
  id?: string | number;
}

/**
 * Check if user can view class
 * @param viewer
 * @param classData
 * @returns
 */
export function canViewClass(viewer: IClassUser | null, classData: IClassData | null): IPermissionResult {
  if (!viewer) {
    return { allowed: false, reason: 'Authentication required' };
  }

  // Admins can view all classes
  if (([ROLES.ADMIN, ROLES.BAN_CAN_SU] as RoleType[]).includes(viewer.vai_tro!)) {
    return { allowed: true };
  }

  // Teachers can view all classes
  if (viewer.vai_tro === ROLES.GIANG_VIEN) {
    return { allowed: true };
  }

  // Students can view their own class
  if (viewer.vai_tro === ROLES.SINH_VIEN) {
    if (viewer.lop_id === classData?.id) {
      return { allowed: true };
    }
    return { allowed: false, reason: 'Can only view own class' };
  }

  return { allowed: false };
}

/**
 * Check if user can manage class
 * @param user
 * @param classData
 * @returns
 */
export function canManageClass(user: IClassUser | null, classData: IClassData | null): IPermissionResult {
  if (!user) {
    return { allowed: false, reason: 'Authentication required' };
  }

  // Admins can manage all classes
  if (([ROLES.ADMIN, ROLES.BAN_CAN_SU] as RoleType[]).includes(user.vai_tro!)) {
    return { allowed: true };
  }

  // Homeroom teachers can manage their classes
  if (user.vai_tro === ROLES.GIANG_VIEN) {
    if (classData?.giao_vien_chu_nhiem_id === user.id) {
      return { allowed: true };
    }
    return { allowed: false, reason: 'Can only manage your homeroom class' };
  }

  return { allowed: false, reason: 'Permission denied' };
}

/**
 * Get class list filter
 * @param viewer
 * @returns
 */
export function getClassListFilter(viewer: IClassUser | null): IClassFilter {
  if (!viewer) {
    return { id: -1 }; // No access
  }

  // Admins and teachers see all
  if (([ROLES.ADMIN, ROLES.BAN_CAN_SU, ROLES.GIANG_VIEN] as RoleType[]).includes(viewer.vai_tro!)) {
    return {};
  }

  // Students see only their class
  if (viewer.vai_tro === ROLES.SINH_VIEN && viewer.lop_id) {
    return { id: viewer.lop_id };
  }

  return { id: -1 };
}

// CommonJS compatibility
module.exports = {
  canViewClass,
  canManageClass,
  getClassListFilter,
};
