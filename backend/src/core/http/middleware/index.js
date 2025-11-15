/**
 * Core HTTP Middleware Exports
 * Central export point for all middleware functions
 */

const policies = require('../../policies');
const classMonitor = require('./classMonitor');

module.exports = {
  // Authentication & Authorization
  ...require('./authJwt'),
  
  // Request Context
  ...require('./requestContext'),
  
  // Class Monitor
  ...classMonitor,
  isClassMonitor: classMonitor.getMonitorClass, // Alias for backward compatibility
  
  // RBAC Policies
  requirePermission: policies.requirePermission,
  
  // CORS
  cors: require('./cors'),
  
  // Input Sanitization
  sanitize: require('./sanitize'),
  
  // Error Handling
  ...require('./errorHandler'),
  
  // Validation
  ...require('./validate'),
};




