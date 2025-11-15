/**
 * Centralized Policy System
 * Ma trận quyền cho tất cả resources và actions
 * 
 * Format: resource -> action -> [allowed roles]
 */

const { normalizeRoleName } = require('../../core/utils/roleHelper');

const POLICIES = {
  // ==================== ACTIVITIES ====================
  activities: {
    read: ['ADMIN', 'GIANG_VIEN', 'LOP_TRUONG', 'SINH_VIEN'],
    create: ['ADMIN', 'GIANG_VIEN', 'LOP_TRUONG'],
    update: ['ADMIN', 'GIANG_VIEN', 'LOP_TRUONG'], // + ownership check
    delete: ['ADMIN', 'GIANG_VIEN'], // + ownership check
    approve: ['ADMIN', 'GIANG_VIEN'],
    reject: ['ADMIN', 'GIANG_VIEN']
  },

  // ==================== REGISTRATIONS ====================
  registrations: {
    read: ['ADMIN', 'GIANG_VIEN', 'LOP_TRUONG'],
    create: ['SINH_VIEN', 'LOP_TRUONG'], // Đăng ký hoạt động
    approve: ['ADMIN', 'GIANG_VIEN', 'LOP_TRUONG'],
    reject: ['ADMIN', 'GIANG_VIEN', 'LOP_TRUONG'],
    cancel: ['SINH_VIEN', 'LOP_TRUONG'], // + ownership check
    bulkApprove: ['ADMIN', 'GIANG_VIEN', 'LOP_TRUONG']
  },

  // ==================== USERS ====================
  users: {
    read: ['ADMIN'],
    create: ['ADMIN'],
    update: ['ADMIN'],
    delete: ['ADMIN'],
    updateOwn: ['ADMIN', 'GIANG_VIEN', 'LOP_TRUONG', 'SINH_VIEN']
  },

  // ==================== CLASSES ====================
  classes: {
    read: ['ADMIN', 'GIANG_VIEN', 'LOP_TRUONG'],
    create: ['ADMIN'],
    update: ['ADMIN'],
    delete: ['ADMIN'],
    updateMonitor: ['ADMIN', 'GIANG_VIEN']
  },

  // ==================== ACTIVITY TYPES ====================
  activityTypes: {
    read: ['ADMIN', 'GIANG_VIEN', 'LOP_TRUONG'],
    create: ['ADMIN', 'GIANG_VIEN'],
    update: ['ADMIN', 'GIANG_VIEN'],
    delete: ['ADMIN']
  },

  // ==================== NOTIFICATIONS ====================
  notifications: {
    read: ['ADMIN', 'GIANG_VIEN', 'LOP_TRUONG', 'SINH_VIEN'],
    create: ['ADMIN', 'GIANG_VIEN', 'LOP_TRUONG'],
    delete: ['ADMIN', 'GIANG_VIEN']
  },

  // ==================== REPORTS ====================
  reports: {
    read: ['ADMIN', 'GIANG_VIEN', 'LOP_TRUONG'],
    export: ['ADMIN', 'GIANG_VIEN', 'LOP_TRUONG'],
    system: ['ADMIN']
  },

  // ==================== POINTS ====================
  points: {
    viewOwn: ['SINH_VIEN', 'LOP_TRUONG', 'GIANG_VIEN', 'ADMIN'],
    viewAll: ['GIANG_VIEN', 'LOP_TRUONG', 'ADMIN'],
    calculate: ['ADMIN']
  },

  // ==================== SEMESTERS ====================
  semesters: {
    read: ['ADMIN', 'GIANG_VIEN', 'LOP_TRUONG', 'SINH_VIEN'],
    create: ['ADMIN'],
    activate: ['ADMIN'],
    proposeLock: ['LOP_TRUONG', 'GIANG_VIEN', 'ADMIN'],
    softLock: ['GIANG_VIEN', 'ADMIN'],
    hardLock: ['ADMIN'],
    rollback: ['GIANG_VIEN', 'ADMIN']
  }
};



/**
 * Check if a role has permission for an action on a resource
 * @param {string} role - User role
 * @param {string} resource - Resource name (activities, users, etc.)
 * @param {string} action - Action name (read, create, update, delete)
 * @returns {boolean}
 */
function hasPermission(role, resource, action) {
  const normalizedRole = normalizeRoleName(role);
  
  // Admin always has permission
  if (normalizedRole === 'ADMIN') {
    return true;
  }
  
  const resourcePolicies = POLICIES[resource];
  if (!resourcePolicies) {
    console.warn(`[Policy] Unknown resource: ${resource}`);
    return false;
  }
  
  const allowedRoles = resourcePolicies[action];
  if (!allowedRoles) {
    console.warn(`[Policy] Unknown action: ${action} for resource: ${resource}`);
    return false;
  }
  
  return allowedRoles.includes(normalizedRole);
}

/**
 * Get all permissions for a role
 * @param {string} role - User role
 * @returns {Object} Object mapping resource.action -> boolean
 */
function getRolePermissions(role) {
  const normalizedRole = normalizeRoleName(role);
  const permissions = {};
  
  for (const [resource, actions] of Object.entries(POLICIES)) {
    for (const [action, allowedRoles] of Object.entries(actions)) {
      const key = `${resource}.${action}`;
      permissions[key] = normalizedRole === 'ADMIN' || allowedRoles.includes(normalizedRole);
    }
  }
  
  return permissions;
}

module.exports = {
  POLICIES,
  hasPermission,
  getRolePermissions
};




