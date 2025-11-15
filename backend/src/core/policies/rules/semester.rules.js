/**
 * Semester-specific authorization rules
 */

const { ROLES } = require('../ability');

/**
 * Check if user can view semester
 * @param {Object} viewer
 * @returns {Object}
 */
function canViewSemester(viewer) {
  // All authenticated users can view semesters
  if (viewer) {
    return { allowed: true };
  }
  return { allowed: false, reason: 'Authentication required' };
}

/**
 * Check if user can manage semester (create/update/delete)
 * @param {Object} user
 * @returns {Object}
 */
function canManageSemester(user) {
  if (!user) {
    return { allowed: false, reason: 'Authentication required' };
  }

  // Only admins can manage semesters
  if ([ROLES.ADMIN, ROLES.BAN_CAN_SU].includes(user.vai_tro)) {
    return { allowed: true };
  }

  return { allowed: false, reason: 'Only admins can manage semesters' };
}

/**
 * Check if user can lock/unlock semester
 * @param {Object} user
 * @param {Object} semester
 * @returns {Object}
 */
function canLockSemester(user, semester) {
  if (!user || !semester) {
    return { allowed: false, reason: 'Missing data' };
  }

  // Only admins can lock semesters
  if ([ROLES.ADMIN, ROLES.BAN_CAN_SU].includes(user.vai_tro)) {
    return { allowed: true };
  }

  return { allowed: false, reason: 'Only admins can lock semesters' };
}

module.exports = {
  canViewSemester,
  canManageSemester,
  canLockSemester,
};




