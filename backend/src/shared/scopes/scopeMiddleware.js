/**
 * Scope Middleware
 * Automatically inject scope into request based on user role
 * This ensures all queries are automatically filtered by class/ownership
 */

const { buildScope } = require('../scopes/scopeBuilder');
const { logError } = require('../../utils/logger');

/**
 * Middleware factory to apply scope for a specific resource
 * @param {string} resource - Resource name (activities, registrations, etc.)
 * @returns {Function} Express middleware
 */
function applyScope(resource) {
  return async (req, res, next) => {
    try {
      // User must be authenticated (req.user set by auth middleware)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
      
      // Build scope based on user role
      const scope = await buildScope(resource, req.user);
      
      // Attach scope to request for use in route handlers
      req.scope = scope;
      req.scopedResource = resource;
      
      next();
    } catch (error) {
      logError('[Scope Middleware] Error applying scope', error, {
        resource,
        userId: req.user?.sub,
        role: req.user?.role
      });
      
      return res.status(500).json({
        success: false,
        message: 'Error applying access scope'
      });
    }
  };
}

/**
 * Middleware to enforce scope on specific item access (for UPDATE/DELETE)
 * Should be used after applyScope() middleware
 */
function enforceScopeOnItem() {
  return async (req, res, next) => {
    try {
      const { scope } = req;
      const itemId = req.params.id;
      
      if (!scope) {
        return res.status(500).json({
          success: false,
          message: 'Scope not initialized. Apply applyScope() middleware first.'
        });
      }
      
      // Scope will be checked in service layer
      // This middleware just ensures scope exists
      next();
    } catch (error) {
      logError('[Scope Middleware] Error enforcing scope on item', error, {
        itemId: req.params.id,
        userId: req.user?.sub
      });
      
      return res.status(500).json({
        success: false,
        message: 'Error enforcing scope'
      });
    }
  };
}

module.exports = {
  applyScope,
  enforceScopeOnItem
};
