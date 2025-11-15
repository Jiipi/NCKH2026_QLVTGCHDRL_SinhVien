/**
 * Registrations Routes - V2 API
 * Sử dụng CRUD Factory + custom endpoints
 */

const express = require('express');
const router = express.Router();
const { createCRUDRouter } = require('../../app/factories/crudRouter');
const registrationsService = require('./registrations.service');
const auth = require('../../core/http/middleware/authJwt').auth;
const { asyncHandler } = require('../../app/errors/AppError');

// ========== Base CRUD Routes (Factory) ==========
const crudRouter = createCRUDRouter({
  resource: 'registrations',
  service: registrationsService,
  permissions: {
    list: 'read',
    get: 'read',
    create: 'create',
    update: 'update',
    delete: 'delete'
  }
});

router.use('/', crudRouter);

// ========== Custom Endpoints ==========

/**
 * POST /registrations/:id/approve
 * Duyệt đăng ký (GIANG_VIEN, LOP_TRUONG, ADMIN)
 */
router.post('/:id/approve', auth, asyncHandler(async (req, res) => {
  const registration = await registrationsService.approve(req.params.id, req.user);
  
  res.json({
    success: true,
    message: 'Đã duyệt đăng ký thành công',
    data: registration
  });
}));

/**
 * POST /registrations/:id/reject
 * Từ chối đăng ký
 */
router.post('/:id/reject', auth, asyncHandler(async (req, res) => {
  const { reason } = req.body;
  
  const registration = await registrationsService.reject(
    req.params.id,
    reason,
    req.user
  );
  
  res.json({
    success: true,
    message: 'Đã từ chối đăng ký',
    data: registration
  });
}));

/**
 * POST /registrations/:id/cancel
 * Hủy đăng ký (student tự hủy)
 */
router.post('/:id/cancel', auth, asyncHandler(async (req, res) => {
  const result = await registrationsService.cancel(req.params.id, req.user);
  
  res.json({
    success: true,
    ...result
  });
}));

/**
 * POST /registrations/:id/checkin
 * Điểm danh (GIANG_VIEN check attendance)
 */
router.post('/:id/checkin', auth, asyncHandler(async (req, res) => {
  const registration = await registrationsService.checkIn(req.params.id, req.user);
  
  res.json({
    success: true,
    message: 'Đã điểm danh thành công',
    data: registration
  });
}));

/**
 * POST /registrations/bulk-approve
 * Duyệt nhiều đăng ký cùng lúc
 */
router.post('/bulk-approve', auth, asyncHandler(async (req, res) => {
  const { ids } = req.body;
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'ids phải là array và không được rỗng'
    });
  }
  
  const result = await registrationsService.bulkApprove(ids, req.user);
  
  res.json({
    success: true,
    ...result
  });
}));

/**
 * GET /registrations/my
 * Lấy danh sách đăng ký của mình
 */
router.get('/my', auth, asyncHandler(async (req, res) => {
  const { status } = req.query;
  
  const filters = {};
  if (status) filters.status = status;
  
  const registrations = await registrationsService.getMyRegistrations(req.user, filters);
  
  res.json({
    success: true,
    data: registrations
  });
}));

/**
 * GET /registrations/activity/:activityId/stats
 * Lấy thống kê đăng ký của activity
 */
router.get('/activity/:activityId/stats', auth, asyncHandler(async (req, res) => {
  const stats = await registrationsService.getActivityStats(
    req.params.activityId,
    req.user
  );
  
  res.json({
    success: true,
    data: stats
  });
}));

module.exports = router;





