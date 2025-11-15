/**
 * Class-specific authorization rules
 */

const { ROLES } = require('../ability');

/**
 * Check if user can view class
 * @param {Object} viewer
 * @param {Object} classData
 * @returns {Object}
 */
function canViewClass(viewer, classData) {
  if (!viewer) {
    return { allowed: false, reason: 'Authentication required' };
  }

  // Admins can view all classes
  if ([ROLES.ADMIN, ROLES.BAN_CAN_SU].includes(viewer.vai_tro)) {
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
 * @param {Object} user
 * @param {Object} classData
 * @returns {Object}
 */
function canManageClass(user, classData) {
  if (!user) {
    return { allowed: false, reason: 'Authentication required' };
  }

  // Admins can manage all classes
  if ([ROLES.ADMIN, ROLES.BAN_CAN_SU].includes(user.vai_tro)) {
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
 * @param {Object} viewer
 * @returns {Object}
 */
function getClassListFilter(viewer) {
  if (!viewer) {
    return { id: -1 }; // No access
  }

  // Admins and teachers see all
  if ([ROLES.ADMIN, ROLES.BAN_CAN_SU, ROLES.GIANG_VIEN].includes(viewer.vai_tro)) {
    return {};
  }

  // Students see only their class
  if (viewer.vai_tro === ROLES.SINH_VIEN && viewer.lop_id) {
    return { id: viewer.lop_id };
  }

  return { id: -1 };
}

module.exports = {
  canViewClass,
  canManageClass,
  getClassListFilter,
};




