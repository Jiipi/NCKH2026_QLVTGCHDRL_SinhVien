/**
 * Activities Routes
 * Sử dụng CRUD Factory - CHỈ khai báo endpoints cần thiết
 * 
 * Tự động có:
 * - GET /api/v2/activities - List (với scope)
 * - GET /api/v2/activities/:id - Get by ID
 * - POST /api/v2/activities - Create
 * - PUT /api/v2/activities/:id - Update
 * - DELETE /api/v2/activities/:id - Delete
 */

const { Router } = require('express');
const { createCRUDRouter } = require('../../shared/factories/crudRouter');
const { applyScope } = require('../../shared/scopes/scopeMiddleware');
const { asyncHandler } = require('../../shared/errors/AppError');
const { hasPermission } = require('../../shared/policies');
const activitiesService = require('./activities.service');
const registrationsService = require('../registrations/registrations.service');
const { ApiResponse, sendResponse } = require('../../utils/response');

const router = Router();

// ==================== CRUD STANDARD (AUTO-GENERATED) ====================
const crudRouter = createCRUDRouter({
  resource: 'activities',
  service: activitiesService,
  permissions: {
    list: 'read',
    read: 'read',
    create: 'create',
    update: 'update',
    delete: 'delete'
  },
  // Custom routes được thêm bên dưới
  customRoutes: (router, { service, applyScope, asyncHandler }) => {
    
    // ==================== APPROVE ====================
    router.post('/:id/approve',
      (req, res, next) => {
        if (!hasPermission(req.user?.role, 'activities', 'approve')) {
          return res.status(403).json({
            success: false,
            message: 'Bạn không có quyền duyệt hoạt động'
          });
        }
        next();
      },
      asyncHandler(async (req, res) => {
        const result = await service.approve(req.params.id, req.user);
        return sendResponse(res, 200, ApiResponse.success(result, 'Duyệt hoạt động thành công'));
      })
    );
    
    // ==================== REJECT ====================
    router.post('/:id/reject',
      (req, res, next) => {
        if (!hasPermission(req.user?.role, 'activities', 'reject')) {
          return res.status(403).json({
            success: false,
            message: 'Bạn không có quyền từ chối hoạt động'
          });
        }
        next();
      },
      asyncHandler(async (req, res) => {
        const { reason } = req.body;
        const result = await service.reject(req.params.id, reason, req.user);
        return sendResponse(res, 200, ApiResponse.success(result, 'Từ chối hoạt động thành công'));
      })
    );
    
    // ==================== GET DETAILS (with registrations) ====================
    router.get('/:id/details',
      (req, res, next) => {
        if (!hasPermission(req.user?.role, 'activities', 'read')) {
          return res.status(403).json({
            success: false,
            message: 'Bạn không có quyền xem chi tiết hoạt động'
          });
        }
        next();
      },
      asyncHandler(async (req, res) => {
        const result = await service.getDetails(req.params.id, req.user);
        return sendResponse(res, 200, ApiResponse.success(result, 'Lấy chi tiết thành công'));
      })
    );
    
    // ==================== REGISTER (Đăng ký hoạt động) ====================
    router.post('/:id/register',
      (req, res, next) => {
        if (!hasPermission(req.user?.role, 'registrations', 'create')) {
          return res.status(403).json({
            success: false,
            message: 'Bạn không có quyền đăng ký hoạt động'
          });
        }
        next();
      },
      asyncHandler(async (req, res) => {
        const result = await registrationsService.register(req.params.id, req.user);
        return sendResponse(res, 201, ApiResponse.success(result, 'Đăng ký hoạt động thành công'));
      })
    );
    
    // ==================== CANCEL REGISTRATION ====================
    router.post('/:id/cancel',
      (req, res, next) => {
        if (!hasPermission(req.user?.role, 'registrations', 'cancel')) {
          return res.status(403).json({
            success: false,
            message: 'Bạn không có quyền hủy đăng ký'
          });
        }
        next();
      },
      asyncHandler(async (req, res) => {
        // TODO: Implement cancel logic (sẽ làm ở registrations module)
        return sendResponse(res, 501, ApiResponse.error('Tính năng đang phát triển'));
      })
    );
  }
});

router.use('/', crudRouter);

module.exports = router;
