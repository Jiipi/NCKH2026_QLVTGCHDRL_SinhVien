/**
 * Registrations Routes - V2 API
 * Sử dụng CRUD Factory + custom endpoints
 */

const express = require('express');
const router = express.Router();
const { createRegistrationsController } = require('./presentation/registrations.factory');
const { auth, requireDynamicPermission } = require('../../core/http/middleware');
const { asyncHandler } = require('../../core/http/middleware/asyncHandler');

const controller = createRegistrationsController();

// Base CRUD routes
router.get(
  '/',
  auth,
  requireDynamicPermission('registrations.read'),
  asyncHandler((req, res) => controller.list(req, res))
);

router.get(
  '/:id',
  auth,
  requireDynamicPermission('registrations.read'),
  asyncHandler((req, res) => controller.get(req, res))
);

router.post(
  '/',
  auth,
  requireDynamicPermission('registrations.write'),
  asyncHandler((req, res) => controller.create(req, res))
);

router.put(
  '/:id',
  auth,
  requireDynamicPermission('registrations.write'),
  asyncHandler((req, res) => controller.update(req, res))
);

router.delete(
  '/:id',
  auth,
  requireDynamicPermission('registrations.delete'),
  asyncHandler((req, res) => controller.delete(req, res))
);

// ========== Custom Endpoints ==========

/**
 * POST /registrations/:id/approve
 * Duyệt đăng ký (GIANG_VIEN, LOP_TRUONG, ADMIN)
 * Requires: registrations.write permission
 */
router.post('/:id/approve', auth, requireDynamicPermission('registrations.write'), asyncHandler((req, res) => controller.approve(req, res)));

/**
 * POST /registrations/:id/reject
 * Từ chối đăng ký
 * Requires: registrations.write permission
 */
router.post('/:id/reject', auth, requireDynamicPermission('registrations.write'), asyncHandler((req, res) => controller.reject(req, res)));

/**
 * POST /registrations/:id/cancel
 * Hủy đăng ký (student tự hủy)
 * Requires: registrations.delete permission
 */
router.post('/:id/cancel', auth, requireDynamicPermission('registrations.delete'), asyncHandler((req, res) => controller.cancel(req, res)));

/**
 * POST /registrations/:id/checkin
 * Điểm danh (GIANG_VIEN check attendance)
 * Requires: attendance.write permission
 */
router.post('/:id/checkin', auth, requireDynamicPermission('attendance.write'), asyncHandler((req, res) => controller.checkIn(req, res)));

/**
 * POST /registrations/bulk-approve
 * Duyệt nhiều đăng ký cùng lúc
 */
router.post('/bulk-approve', auth, asyncHandler((req, res) => controller.bulkApprove(req, res)));

/**
 * GET /registrations/my
 * Lấy danh sách đăng ký của mình
 * Requires: registrations.read permission
 */
router.get('/my', auth, requireDynamicPermission('registrations.read'), asyncHandler((req, res) => controller.myRegistrations(req, res)));

/**
 * GET /registrations/activity/:activityId/stats
 * Lấy thống kê đăng ký của activity
 * Requires: registrations.read permission
 */
router.get('/activity/:activityId/stats', auth, requireDynamicPermission('registrations.read'), asyncHandler((req, res) => controller.activityStats(req, res)));

module.exports = router;





