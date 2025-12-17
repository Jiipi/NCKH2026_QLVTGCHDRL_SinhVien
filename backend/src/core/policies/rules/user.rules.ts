/**
 * User-specific authorization rules
 * Fine-grained permission checks for user operations
 */

import { ROLES, RoleType } from '../ability';

/**
 * User interface for user rules
 */
export interface IUserContext {
  id?: string | number;
  vai_tro?: RoleType;
  lop_id?: string | number;
  [key: string]: unknown;
}

/**
 * Target user interface
 */
export interface ITargetUser {
  id?: string | number;
  vai_tro?: RoleType;
  lop_id?: string | number;
  is_active?: boolean;
  [key: string]: unknown;
}

/**
 * Permission result interface
 */
export interface IPermissionResult {
  allowed: boolean;
  reason?: string;
  allowedFields?: string[];
}

/**
 * Prisma where clause interface for user filter
 */
export interface IUserFilter {
  is_active?: boolean;
  lop_id?: string | number;
}

/**
 * Check if user can view another user's profile
 * @param viewer - User who wants to view
 * @param target - User being viewed
 * @returns
 */
export function canViewUser(viewer: IUserContext | null, target: ITargetUser | null): IPermissionResult {
  if (!viewer) {
    return { allowed: false, reason: 'Authentication required' };
  }

  // Admins can view all users
  if (([ROLES.ADMIN, ROLES.BAN_CAN_SU] as RoleType[]).includes(viewer.vai_tro!)) {
    return { allowed: true };
  }

  // Teachers can view students and other teachers
  if (viewer.vai_tro === ROLES.GIANG_VIEN) {
    return { allowed: true };
  }

  // Students can view their own profile and classmates
  if (viewer.vai_tro === ROLES.SINH_VIEN) {
    // Can view own profile
    if (viewer.id === target?.id) {
      return { allowed: true };
    }
    // Can view classmates
    if (viewer.lop_id && target?.lop_id === viewer.lop_id) {
      return { allowed: true };
    }
    return { allowed: false, reason: 'Can only view own profile or classmates' };
  }

  return { allowed: false, reason: 'Permission denied' };
}

/**
 * Check if user can update another user's profile
 * @param editor - User who wants to edit
 * @param target - User being edited
 * @returns
 */
export function canUpdateUser(editor: IUserContext | null, target: ITargetUser | null): IPermissionResult {
  if (!editor || !target) {
    return { allowed: false, reason: 'Missing user data' };
  }

  // Admins can update any user
  if (([ROLES.ADMIN, ROLES.BAN_CAN_SU] as RoleType[]).includes(editor.vai_tro!)) {
    return { allowed: true };
  }

  // Users can update their own profile (limited fields)
  if (editor.id === target.id) {
    return {
      allowed: true,
      allowedFields: [
        'ten_day_du',
        'email',
        'so_dien_thoai',
        'dia_chi',
        'ngay_sinh',
        'gioi_tinh',
        'anh_dai_dien',
      ],
    };
  }

  return { allowed: false, reason: 'Can only edit own profile' };
}

/**
 * Check if user can delete another user
 * @param deleter - User who wants to delete
 * @param target - User being deleted
 * @returns
 */
export function canDeleteUser(deleter: IUserContext | null, target: ITargetUser | null): IPermissionResult {
  if (!deleter || !target) {
    return { allowed: false, reason: 'Missing user data' };
  }

  // Only admins can delete users
  if (([ROLES.ADMIN, ROLES.BAN_CAN_SU] as RoleType[]).includes(deleter.vai_tro!)) {
    // Cannot delete self
    if (deleter.id === target.id) {
      return { allowed: false, reason: 'Cannot delete own account' };
    }
    return { allowed: true };
  }

  return { allowed: false, reason: 'Only admins can delete users' };
}

/**
 * Check if user can change another user's role
 * @param editor - User who wants to change role
 * @param target - User whose role is being changed
 * @param newRole
 * @returns
 */
export function canChangeUserRole(
  editor: IUserContext | null,
  target: ITargetUser | null,
  newRole: string
): IPermissionResult {
  if (!editor || !target) {
    return { allowed: false, reason: 'Missing user data' };
  }

  // Only admins can change roles
  if (!([ROLES.ADMIN, ROLES.BAN_CAN_SU] as RoleType[]).includes(editor.vai_tro!)) {
    return { allowed: false, reason: 'Only admins can change roles' };
  }

  // Cannot change own role
  if (editor.id === target.id) {
    return { allowed: false, reason: 'Cannot change own role' };
  }

  // Validate new role
  const validRoles = Object.values(ROLES);
  if (!validRoles.includes(newRole as RoleType)) {
    return { allowed: false, reason: 'Invalid role' };
  }

  return { allowed: true };
}

/**
 * Get user list filter based on viewer role
 * @param viewer
 * @returns Prisma where clause
 */
export function getUserListFilter(viewer: IUserContext | null): IUserFilter {
  if (!viewer) {
    return { is_active: false }; // No access for anonymous
  }

  // Admins see all users
  if (([ROLES.ADMIN, ROLES.BAN_CAN_SU] as RoleType[]).includes(viewer.vai_tro!)) {
    return { is_active: true };
  }

  // Teachers see all active users
  if (viewer.vai_tro === ROLES.GIANG_VIEN) {
    return { is_active: true };
  }

  // Students see only their classmates
  if (viewer.vai_tro === ROLES.SINH_VIEN && viewer.lop_id) {
    return {
      lop_id: viewer.lop_id,
      is_active: true,
    };
  }

  return { is_active: false }; // Default: no access
}

/**
 * Get allowed fields for user update based on role
 * @param editor
 * @param target
 * @returns
 */
export function getAllowedUpdateFields(editor: IUserContext | null, target: ITargetUser | null): string[] {
  // Admins can update all fields
  if (editor && ([ROLES.ADMIN, ROLES.BAN_CAN_SU] as RoleType[]).includes(editor.vai_tro!)) {
    return [
      'ten_day_du',
      'email',
      'vai_tro',
      'lop_id',
      'khoa',
      'nganh',
      'so_dien_thoai',
      'dia_chi',
      'ngay_sinh',
      'gioi_tinh',
      'anh_dai_dien',
      'is_active',
    ];
  }

  // Users editing own profile
  if (editor && editor.id === target?.id) {
    return [
      'ten_day_du',
      'email',
      'so_dien_thoai',
      'dia_chi',
      'ngay_sinh',
      'gioi_tinh',
      'anh_dai_dien',
    ];
  }

  return []; // No fields allowed
}

// CommonJS compatibility
module.exports = {
  canViewUser,
  canUpdateUser,
  canDeleteUser,
  canChangeUserRole,
  getUserListFilter,
  getAllowedUpdateFields,
};
