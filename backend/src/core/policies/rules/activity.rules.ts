/**
 * Activity-specific authorization rules
 * Fine-grained permission checks for activity operations
 */

import { ROLES, RoleType } from '../ability';

/**
 * User interface for activity rules
 */
export interface IActivityUser {
  id?: string | number;
  vai_tro?: RoleType;
  [key: string]: unknown;
}

/**
 * Activity interface
 */
export interface IActivity {
  id?: string | number;
  nguoi_tao_id?: string | number;
  trang_thai?: string;
  [key: string]: unknown;
}

/**
 * Permission result interface
 */
export interface IPermissionResult {
  allowed: boolean;
  reason?: string;
  data?: Record<string, unknown>;
}

/**
 * Prisma where clause interface
 */
export interface IActivityFilter {
  trang_thai?: string;
  OR?: Array<{
    trang_thai?: string;
    nguoi_tao_id?: string | number;
  }>;
}

/**
 * Check if user can create activity
 * @param user
 * @param activityData
 * @returns { allowed: boolean, reason?: string }
 */
export function canCreateActivity(user: IActivityUser | null, activityData: Record<string, unknown>): IPermissionResult {
  // All authenticated users can create activities
  if (!user) {
    return { allowed: false, reason: 'Authentication required' };
  }

  // Students create as PENDING
  if (user.vai_tro === ROLES.SINH_VIEN) {
    return {
      allowed: true,
      data: {
        ...activityData,
        trang_thai: 'PENDING',
        nguoi_tao_id: user.id,
      },
    };
  }

  // Teachers/Admins can create as APPROVED
  if (([ROLES.GIANG_VIEN, ROLES.ADMIN, ROLES.BAN_CAN_SU] as RoleType[]).includes(user.vai_tro!)) {
    return {
      allowed: true,
      data: {
        ...activityData,
        nguoi_tao_id: user.id,
      },
    };
  }

  return { allowed: false, reason: 'Invalid role' };
}

/**
 * Check if user can update activity
 * @param user
 * @param activity
 * @returns
 */
export function canUpdateActivity(user: IActivityUser | null, activity: IActivity | null): IPermissionResult {
  if (!user || !activity) {
    return { allowed: false, reason: 'Missing user or activity' };
  }

  // Admins can update any activity
  if (([ROLES.ADMIN, ROLES.BAN_CAN_SU] as RoleType[]).includes(user.vai_tro!)) {
    return { allowed: true };
  }

  // Teachers can update any activity
  if (user.vai_tro === ROLES.GIANG_VIEN) {
    return { allowed: true };
  }

  // Students can only update their own PENDING activities
  if (user.vai_tro === ROLES.SINH_VIEN) {
    if (activity.nguoi_tao_id === user.id && activity.trang_thai === 'PENDING') {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Students can only edit their own pending activities',
    };
  }

  return { allowed: false, reason: 'Permission denied' };
}

/**
 * Check if user can delete activity
 * @param user
 * @param activity
 * @returns
 */
export function canDeleteActivity(user: IActivityUser | null, activity: IActivity | null): IPermissionResult {
  if (!user || !activity) {
    return { allowed: false, reason: 'Missing user or activity' };
  }

  // Admins can delete any activity
  if (([ROLES.ADMIN, ROLES.BAN_CAN_SU] as RoleType[]).includes(user.vai_tro!)) {
    return { allowed: true };
  }

  // Students can only delete their own PENDING activities
  if (user.vai_tro === ROLES.SINH_VIEN) {
    if (activity.nguoi_tao_id === user.id && activity.trang_thai === 'PENDING') {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Students can only delete their own pending activities',
    };
  }

  return { allowed: false, reason: 'Permission denied' };
}

/**
 * Check if user can approve/reject activity
 * @param user
 * @param activity
 * @returns
 */
export function canApproveActivity(user: IActivityUser | null, activity: IActivity | null): IPermissionResult {
  if (!user || !activity) {
    return { allowed: false, reason: 'Missing user or activity' };
  }

  // Only teachers and admins can approve
  if (([ROLES.GIANG_VIEN, ROLES.ADMIN, ROLES.BAN_CAN_SU] as RoleType[]).includes(user.vai_tro!)) {
    // Can only approve PENDING activities
    if (activity.trang_thai === 'PENDING') {
      return { allowed: true };
    }
    return { allowed: false, reason: 'Activity is not pending' };
  }

  return { allowed: false, reason: 'Only teachers/admins can approve activities' };
}

/**
 * Filter activities based on user role and permissions
 * @param user
 * @returns Prisma where clause
 */
export function getActivityViewFilter(user: IActivityUser | null): IActivityFilter {
  if (!user) {
    return { trang_thai: 'APPROVED' }; // Public only sees approved
  }

  // Admins and teachers see everything
  if (([ROLES.ADMIN, ROLES.BAN_CAN_SU, ROLES.GIANG_VIEN] as RoleType[]).includes(user.vai_tro!)) {
    return {}; // No filter
  }

  // Students see approved + their own pending
  if (user.vai_tro === ROLES.SINH_VIEN) {
    return {
      OR: [
        { trang_thai: 'APPROVED' },
        {
          nguoi_tao_id: user.id,
          trang_thai: 'PENDING',
        },
      ],
    };
  }

  return { trang_thai: 'APPROVED' };
}

// CommonJS compatibility
module.exports = {
  canCreateActivity,
  canUpdateActivity,
  canDeleteActivity,
  canApproveActivity,
  getActivityViewFilter,
};
