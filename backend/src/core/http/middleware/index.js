/**
 * Core HTTP Middleware Exports
 * Central export point for all middleware functions
 */

const policies = require('../../policies');
const classMonitor = require('./classMonitor');
const sessionTracking = require('./sessionTracking');
const dynamicPermission = require('./dynamicPermission');

module.exports = {
  // Authentication & Authorization
  ...require('./authJwt'),
  
  // Request Context
  ...require('./requestContext'),
  
  // Class Monitor
  ...classMonitor,
  isClassMonitor: classMonitor.getMonitorClass, // Alias for backward compatibility
  
  // Session Tracking
  trackSession: sessionTracking.trackSession,
  updateActivity: sessionTracking.updateActivity,
  
  // RBAC Policies (Old)
  requirePermission: policies.requirePermission,
  
  // Dynamic Permission (New - Real-time từ database)
  requireDynamicPermission: dynamicPermission.requireDynamicPermission,
  requireAnyPermission: dynamicPermission.requireAnyPermission,
  requireAllPermissions: dynamicPermission.requireAllPermissions,
  clearPermissionsCache: dynamicPermission.clearPermissionsCache,
  getUserPermissions: dynamicPermission.getUserPermissions,
  
  // CORS
  cors: require('./cors'),
  
  // Input Sanitization
  sanitize: require('./sanitize'),
  
  // Error Handling
  ...require('./errorHandler'),
  
  // Validation
  ...require('./validate'),
};




