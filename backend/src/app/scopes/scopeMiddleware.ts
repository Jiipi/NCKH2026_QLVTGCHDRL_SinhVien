/**
 * Scope Middleware
 * Automatically inject scope into request based on user role
 * This ensures all queries are automatically filtered by class/ownership
 * 
 * @module app/scopes/scopeMiddleware
 */

import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { buildScope } from './scopeBuilder';
import { logError } from '../../core/logger';
import type { AuthenticatedRequest } from '../../core/http/http.types';

/**
 * Extended request with scope
 */
interface ScopedRequest extends AuthenticatedRequest {
  scope?: Record<string, unknown>;
  scopedResource?: string;
}

/**
 * Middleware factory to apply scope for a specific resource
 * @param resource - Resource name (activities, registrations, etc.)
 * @returns Express middleware
 */
function applyScope(resource: string): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as ScopedRequest;
      
      // User must be authenticated (req.user set by auth middleware)
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }
      
      // Build scope based on user role
      const scope = await buildScope(resource, {
        sub: String(authReq.user.id),
        role: authReq.user.role,
        ...authReq.user
      });
      
      // Attach scope to request for use in route handlers
      authReq.scope = scope;
      authReq.scopedResource = resource;
      
      next();
    } catch (error) {
      const authReq = req as ScopedRequest;
      logError('[Scope Middleware] Error applying scope', error as Error, {
        resource,
        userId: authReq.user?.id,
        role: authReq.user?.role
      });
      
      res.status(500).json({
        success: false,
        message: 'Error applying access scope'
      });
    }
  };
}

/**
 * Middleware to enforce scope on specific item access (for UPDATE/DELETE)
 * Should be used after applyScope() middleware
 * @returns Express middleware
 */
function enforceScopeOnItem(): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const scopedReq = req as ScopedRequest;
      const { scope } = scopedReq;
      const itemId = req.params.id;
      
      if (!scope) {
        res.status(500).json({
          success: false,
          message: 'Scope not initialized. Apply applyScope() middleware first.'
        });
        return;
      }
      
      // Scope will be checked in service layer
      // This middleware just ensures scope exists
      next();
    } catch (error) {
      const authReq = req as ScopedRequest;
      logError('[Scope Middleware] Error enforcing scope on item', error as Error, {
        itemId: req.params.id,
        userId: authReq.user?.id
      });
      
      res.status(500).json({
        success: false,
        message: 'Error enforcing scope'
      });
    }
  };
}

export {
  applyScope,
  enforceScopeOnItem,
  ScopedRequest
};

export default {
  applyScope,
  enforceScopeOnItem
};

// CommonJS compatibility
module.exports = {
  applyScope,
  enforceScopeOnItem
};
