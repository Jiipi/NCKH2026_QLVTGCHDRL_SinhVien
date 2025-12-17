/**
 * CRUD Router Factory
 * Tự động tạo CRUD endpoints cho bất kỳ resource nào
 * 
 * Features:
 * - Auto apply authentication
 * - Auto apply permission checks
 * - Auto apply scope filtering
 * - Auto handle errors
 * - Support pagination, filtering, sorting
 * 
 * @module app/factories/crudRouter
 */

import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { defineAbilitiesFor, can } from '../../core/policies';
import { applyScope } from '../scopes/scopeMiddleware';
import { asyncHandler } from '../../core/http/middleware/asyncHandler';
import { ForbiddenError, NotFoundError } from '../../core/errors/AppError';
import { auth } from '../../core/http/middleware/authJwt';
import { ApiResponse, sendResponse } from '../../core/http/response/apiResponse';
import type { AuthenticatedRequest } from '../../core/http/http.types';

/**
 * Service interface for CRUD operations
 */
interface CRUDService {
  list?: (params: Record<string, unknown>, user: AuthenticatedRequest['user']) => Promise<unknown>;
  getById?: (id: string, scope: Record<string, unknown>, user: AuthenticatedRequest['user']) => Promise<unknown>;
  create?: (data: Record<string, unknown>, user: AuthenticatedRequest['user']) => Promise<unknown>;
  update?: (id: string, data: Record<string, unknown>, user: AuthenticatedRequest['user'], scope: Record<string, unknown>) => Promise<unknown>;
  delete?: (id: string, user: AuthenticatedRequest['user'], scope: Record<string, unknown>) => Promise<void>;
}

/**
 * Permission mapping for CRUD operations
 */
interface CRUDPermissions {
  list?: string;
  read?: string;
  create?: string;
  update?: string;
  delete?: string;
}

/**
 * Validation middleware mapping
 */
interface CRUDValidation {
  create?: RequestHandler;
  update?: RequestHandler;
}

/**
 * Custom routes callback function type
 */
type CustomRoutesCallback = (
  router: Router,
  context: {
    service: CRUDService;
    resource: string;
    applyScope: typeof applyScope;
    asyncHandler: typeof asyncHandler;
  }
) => void;

/**
 * CRUD Router configuration
 */
interface CRUDRouterConfig {
  resource: string;
  service: CRUDService;
  permissions?: CRUDPermissions;
  validate?: CRUDValidation;
  customRoutes?: CustomRoutesCallback | null;
  options?: Record<string, unknown>;
}

/**
 * Extended request with scope
 */
interface ScopedRequest extends AuthenticatedRequest {
  scope?: Record<string, unknown>;
  scopedResource?: string;
}

/**
 * Create CRUD router for a resource
 * @param config - Configuration object
 * @returns Express router with CRUD endpoints
 */
function createCRUDRouter(config: CRUDRouterConfig): Router {
  const {
    resource,
    service,
    permissions = {},
    validate = {},
    customRoutes = null,
    options = {}
  } = config;
  
  const router = Router();
  
  // All routes require authentication
  router.use(auth as RequestHandler);
  
  // ==================== LIST ====================
  if (service.list && permissions.list) {
    router.get('/',
      createPermissionMiddleware(resource, permissions.list),
      applyScope(resource) as RequestHandler,
      asyncHandler(async (req: Request, res: Response) => {
        const scopedReq = req as ScopedRequest;
        const { page = '1', limit = '20', sort, order, ...filters } = req.query;
        const scope = scopedReq.scope || {};
        
        const result = await service.list!({
          ...filters,
          ...scope,
          page: parseInt(page as string, 10),
          limit: Math.min(parseInt(limit as string, 10), 100), // Max 100 items per page
          sort,
          order
        }, scopedReq.user);
        
        return sendResponse(res, 200, ApiResponse.success(result, 'Lấy danh sách thành công'));
      })
    );
  }
  
  // ==================== GET BY ID ====================
  if (service.getById && permissions.read) {
    router.get('/:id',
      createPermissionMiddleware(resource, permissions.read || permissions.list || ''),
      applyScope(resource) as RequestHandler,
      asyncHandler(async (req: Request, res: Response) => {
        const scopedReq = req as ScopedRequest;
        const item = await service.getById!(req.params.id, scopedReq.scope || {}, scopedReq.user);
        
        if (!item) {
          throw new NotFoundError(resource, req.params.id);
        }
        
        return sendResponse(res, 200, ApiResponse.success(item, 'Lấy dữ liệu thành công'));
      })
    );
  }
  
  // ==================== CREATE ====================
  if (service.create && permissions.create) {
    router.post('/',
      createPermissionMiddleware(resource, permissions.create),
      validate.create || ((req: Request, res: Response, next: NextFunction) => next()),
      applyScope(resource) as RequestHandler,
      asyncHandler(async (req: Request, res: Response) => {
        const scopedReq = req as ScopedRequest;
        const data = req.body as Record<string, unknown>;
        const scope = scopedReq.scope || {};
        
        // Auto-inject scope fields for non-admin users
        if (scopedReq.user?.role !== 'ADMIN') {
          const scopeLopId = (scope as { lop_id?: unknown }).lop_id;
          if (scopeLopId && !Array.isArray(scopeLopId)) {
            // Single class - force lop_id
            data.lop_id = scopeLopId;
          }
        }
        
        const created = await service.create!(data, scopedReq.user);
        
        return sendResponse(res, 201, ApiResponse.success(created, 'Tạo mới thành công'));
      })
    );
  }
  
  // ==================== UPDATE ====================
  if (service.update && permissions.update) {
    router.put('/:id',
      createPermissionMiddleware(resource, permissions.update),
      validate.update || ((req: Request, res: Response, next: NextFunction) => next()),
      applyScope(resource) as RequestHandler,
      asyncHandler(async (req: Request, res: Response) => {
        const scopedReq = req as ScopedRequest;
        const updated = await service.update!(
          req.params.id, 
          req.body as Record<string, unknown>, 
          scopedReq.user, 
          scopedReq.scope || {}
        );
        
        if (!updated) {
          throw new NotFoundError(resource, req.params.id);
        }
        
        return sendResponse(res, 200, ApiResponse.success(updated, 'Cập nhật thành công'));
      })
    );
  }
  
  // ==================== DELETE ====================
  if (service.delete && permissions.delete) {
    router.delete('/:id',
      createPermissionMiddleware(resource, permissions.delete),
      applyScope(resource) as RequestHandler,
      asyncHandler(async (req: Request, res: Response) => {
        const scopedReq = req as ScopedRequest;
        await service.delete!(req.params.id, scopedReq.user, scopedReq.scope || {});
        
        return sendResponse(res, 200, ApiResponse.success(null, 'Xóa thành công'));
      })
    );
  }
  
  // ==================== CUSTOM ROUTES ====================
  if (customRoutes && typeof customRoutes === 'function') {
    customRoutes(router, { service, resource, applyScope, asyncHandler });
  }
  
  return router;
}

/**
 * Create permission check middleware
 * @param resource - Resource name
 * @param action - Action name or permission string
 * @returns Express middleware function
 */
function createPermissionMiddleware(resource: string, action: string): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    const userRole = authReq.user?.role;
    
    // Check permission using ability system
    // Convert user to IUserContext - map id to the expected interface
    const userContext = authReq.user ? { id: authReq.user.id, vai_tro: authReq.user.role as import('../../core/policies').RoleType } : {};
    const ability = defineAbilitiesFor((userRole || 'SINH_VIEN') as import('../../core/policies').RoleType, userContext);
    const allowed = can(ability, action as import('../../core/policies').ActionType, resource as import('../../core/policies').ResourceType);
    
    if (!allowed) {
      throw new ForbiddenError(`Bạn không có quyền ${action} cho ${resource}`);
    }
    
    next();
  };
}

export { createCRUDRouter };
export default { createCRUDRouter };

// CommonJS compatibility
module.exports = { createCRUDRouter };
