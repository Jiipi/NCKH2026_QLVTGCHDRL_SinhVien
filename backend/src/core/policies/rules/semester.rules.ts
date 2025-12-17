/**
 * Semester-specific authorization rules
 */

import { ROLES, RoleType } from '../ability';

/**
 * User interface for semester rules
 */
export interface ISemesterUser {
  id?: string | number;
  vai_tro?: RoleType;
  [key: string]: unknown;
}

/**
 * Semester data interface
 */
export interface ISemester {
  id?: string | number;
  is_locked?: boolean;
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
 * Check if user can view semester
 * @param viewer
 * @returns
 */
export function canViewSemester(viewer: ISemesterUser | null): IPermissionResult {
  // All authenticated users can view semesters
  if (viewer) {
    return { allowed: true };
  }
  return { allowed: false, reason: 'Authentication required' };
}

/**
 * Check if user can manage semester (create/update/delete)
 * @param user
 * @returns
 */
export function canManageSemester(user: ISemesterUser | null): IPermissionResult {
  if (!user) {
    return { allowed: false, reason: 'Authentication required' };
  }

  // Only admins can manage semesters
  if (([ROLES.ADMIN, ROLES.BAN_CAN_SU] as RoleType[]).includes(user.vai_tro!)) {
    return { allowed: true };
  }

  return { allowed: false, reason: 'Only admins can manage semesters' };
}

/**
 * Check if user can lock/unlock semester
 * @param user
 * @param semester
 * @returns
 */
export function canLockSemester(user: ISemesterUser | null, semester: ISemester | null): IPermissionResult {
  if (!user || !semester) {
    return { allowed: false, reason: 'Missing data' };
  }

  // Only admins can lock semesters
  if (([ROLES.ADMIN, ROLES.BAN_CAN_SU] as RoleType[]).includes(user.vai_tro!)) {
    return { allowed: true };
  }

  return { allowed: false, reason: 'Only admins can lock semesters' };
}

// CommonJS compatibility
module.exports = {
  canViewSemester,
  canManageSemester,
  canLockSemester,
};
