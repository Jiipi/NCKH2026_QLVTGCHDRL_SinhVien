/**
 * Activities Routes
 * PRESENTATION LAYER - Route definitions
 */

const express = require('express');
const router = express.Router();
const { createActivitiesController } = require('../activities.factory');
const validators = require('../../business/validators/activities.validators');
const { auth, requireDynamicPermission } = require('../../../../core/http/middleware');
const { asyncHandler } = require('../../../../core/http/middleware/asyncHandler');
const { extractClassContext, applyClassScope } = require('../../../../core/http/middleware/classScope');

// Create controller with all dependencies (Dependency Injection)
const activitiesController = createActivitiesController();

// All routes require authentication
router.use(auth);

// Extract class context for scope filtering
router.use(asyncHandler(extractClassContext));

// Apply class-based scope
router.use(applyClassScope());

// ==================== CRUD ROUTES ====================

// List all activities
router.get(
  '/',
  requireDynamicPermission('activities.read'),
  validators.validateGetAll,
  asyncHandler((req, res) => activitiesController.getAll(req, res))
);

// Get QR data (must be before /:id route)
router.get(
  '/:id/qr-data',
  (req, res, next) => {
    console.log('[QR-Data Route] Middleware - Request received:', req.params.id);
    next();
  },
  requireDynamicPermission('activities.read'),
  (req, res, next) => {
    console.log('[QR-Data Route] After permission check');
    next();
  },
  validators.validateGetById,
  (req, res, next) => {
    console.log('[QR-Data Route] After validation');
    next();
  },
  asyncHandler((req, res) => {
    console.log('[QR-Data Route] Calling controller');
    return activitiesController.getQRData(req, res);
  })
);

// Get activity details with registrations
router.get(
  '/:id/details',
  requireDynamicPermission('activities.read'),
  validators.validateGetById,
  asyncHandler((req, res) => activitiesController.getDetails(req, res))
);

// Get single activity
router.get(
  '/:id',
  requireDynamicPermission('activities.read'),
  validators.validateGetById,
  asyncHandler((req, res) => activitiesController.getById(req, res))
);

// Create activity
router.post(
  '/',
  requireDynamicPermission('activities.write'),
  validators.validateCreate,
  asyncHandler((req, res) => activitiesController.create(req, res))
);

// Update activity
router.put(
  '/:id',
  requireDynamicPermission('activities.write'),
  validators.validateUpdate,
  asyncHandler((req, res) => activitiesController.update(req, res))
);

// Delete activity
router.delete(
  '/:id',
  requireDynamicPermission('activities.delete'),
  validators.validateGetById,
  asyncHandler((req, res) => activitiesController.delete(req, res))
);

// ==================== APPROVAL ROUTES ====================

// Approve activity
router.post(
  '/:id/approve',
  requireDynamicPermission('activities.approve'),
  validators.validateApprove,
  asyncHandler((req, res) => activitiesController.approve(req, res))
);

// Reject activity
router.post(
  '/:id/reject',
  requireDynamicPermission('activities.approve'),
  validators.validateReject,
  asyncHandler((req, res) => activitiesController.reject(req, res))
);

// ==================== REGISTRATION ROUTES ====================

// Register for activity
router.post(
  '/:id/register',
  requireDynamicPermission('registrations.write'),
  validators.validateRegister,
  asyncHandler((req, res) => activitiesController.register(req, res))
);

// Cancel registration
router.post(
  '/:id/cancel',
  requireDynamicPermission('registrations.delete'),
  validators.validateGetById,
  asyncHandler((req, res) => activitiesController.cancelRegistration(req, res))
);

// ==================== ATTENDANCE (QR SELF-SCAN) ====================

// Student self check-in via QR scan
router.post(
  '/:id/attendance/scan',
  requireDynamicPermission('attendance.write'),
  validators.validateGetById,
  asyncHandler((req, res) => activitiesController.scanAttendance(req, res))
);

module.exports = router;

