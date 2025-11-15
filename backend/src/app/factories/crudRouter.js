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
 */

const { Router } = require('express');
const { hasPermission } = require('../policies');
const { applyScope } = require('../scopes/scopeMiddleware');
const { asyncHandler, ForbiddenError, NotFoundError } = require('../errors/AppError');
const { auth } = require('../../core/http/middleware/authJwt');
const { ApiResponse, sendResponse } = require('../../core/http/response/apiResponse');

/**
 * Create CRUD router for a resource
 * @param {Object} config - Configuration object
 * @param {string} config.resource - Resource name (activities, registrations, etc.)
 * @param {Object} config.service - Service instance with CRUD methods
 * @param {Object} config.permissions - Permission mapping { list, create, update, delete }
 * @param {Object} config.validate - Validation middleware { create, update }
 * @param {Object} config.customRoutes - Custom routes to add (optional)
 * @returns {Router} Express router with CRUD endpoints
 */
function createCRUDRouter(config) {
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
  router.use(auth);
  
  // ==================== LIST ====================
  if (service.list && permissions.list) {
    router.get('/',
      createPermissionMiddleware(resource, permissions.list),
      applyScope(resource),
      asyncHandler(async (req, res) => {
        const { page = 1, limit = 20, sort, order, ...filters } = req.query;
        const scope = req.scope;
        
        const result = await service.list({
          ...filters,
          ...scope,
          page: parseInt(page),
          limit: Math.min(parseInt(limit), 100), // Max 100 items per page
          sort,
          order
        }, req.user);
        
        return sendResponse(res, 200, ApiResponse.success(result, 'Lấy danh sách thành công'));
      })
    );
  }
  
  // ==================== GET BY ID ====================
  if (service.getById && permissions.read) {
    router.get('/:id',
      createPermissionMiddleware(resource, permissions.read || permissions.list),
      applyScope(resource),
      asyncHandler(async (req, res) => {
        const item = await service.getById(req.params.id, req.scope, req.user);
        
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
      validate.create || ((req, res, next) => next()),
      applyScope(resource),
      asyncHandler(async (req, res) => {
        const data = req.body;
        const scope = req.scope;
        
        // Auto-inject scope fields for non-admin users
        if (req.user.role !== 'ADMIN') {
          if (scope.lop_id && !Array.isArray(scope.lop_id)) {
            // Single class - force lop_id
            data.lop_id = scope.lop_id;
          }
        }
        
        const created = await service.create(data, req.user);
        
        return sendResponse(res, 201, ApiResponse.success(created, 'Tạo mới thành công'));
      })
    );
  }
  
  // ==================== UPDATE ====================
  if (service.update && permissions.update) {
    router.put('/:id',
      createPermissionMiddleware(resource, permissions.update),
      validate.update || ((req, res, next) => next()),
      applyScope(resource),
      asyncHandler(async (req, res) => {
        const updated = await service.update(req.params.id, req.body, req.user, req.scope);
        
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
      applyScope(resource),
      asyncHandler(async (req, res) => {
        await service.delete(req.params.id, req.user, req.scope);
        
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
 * @param {string} resource - Resource name
 * @param {string} action - Action name or permission string
 */
function createPermissionMiddleware(resource, action) {
  return (req, res, next) => {
    const userRole = req.user?.role;
    
    // Check permission
    const allowed = hasPermission(userRole, resource, action);
    
    if (!allowed) {
      throw new ForbiddenError(`Bạn không có quyền ${action} cho ${resource}`);
    }
    
    next();
  };
}

module.exports = {
  createCRUDRouter
};




