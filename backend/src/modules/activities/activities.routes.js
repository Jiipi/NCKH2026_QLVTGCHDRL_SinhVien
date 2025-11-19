/**
 * Activities Routes
 * Manual route definitions following clean architecture pattern
 * 
 * Endpoints:
 * - GET /api/core/activities - List activities (with filters)
 * - GET /api/core/activities/:id - Get activity by ID
 * - GET /api/core/activities/:id/details - Get activity details with registrations
 * - POST /api/core/activities - Create activity
 * - PUT /api/core/activities/:id - Update activity
 * - DELETE /api/core/activities/:id - Delete activity
 * - POST /api/core/activities/:id/approve - Approve activity
 * - POST /api/core/activities/:id/reject - Reject activity
 * - POST /api/core/activities/:id/register - Register for activity
 * - POST /api/core/activities/:id/cancel - Cancel registration
 */

const express = require('express');
const router = express.Router();
const ActivitiesController = require('./activities.controller');
const validators = require('./activities.validators');
const { auth, requireDynamicPermission } = require('../../core/http/middleware');
const { asyncHandler } = require('../../app/errors/AppError');
const { extractClassContext, applyClassScope } = require('../../core/http/middleware/classScope');

// All routes require authentication
router.use(auth);

// Extract class context for scope filtering
router.use(asyncHandler(extractClassContext));

// Apply class-based scope (students/monitors see only their class activities)
router.use(applyClassScope());

// ==================== CRUD ROUTES ====================

// List all activities (Requires activities.read)
router.get(
  '/',
  requireDynamicPermission('activities.read'),
  validators.validateGetAll,
  asyncHandler(ActivitiesController.getAll)
);

// Get QR data for activity (must be before /:id route)
router.get(
  '/:id/qr-data',
  requireDynamicPermission('activities.read'),
  validators.validateGetById,
  asyncHandler(ActivitiesController.getQRData)
);

// Get activity details with registrations
router.get(
  '/:id/details',
  requireDynamicPermission('activities.read'),
  validators.validateGetById,
  asyncHandler(ActivitiesController.getDetails)
);

// Get single activity
router.get(
  '/:id',
  requireDynamicPermission('activities.read'),
  validators.validateGetById,
  asyncHandler(ActivitiesController.getById)
);

// Create activity (Requires activities.write)
router.post(
  '/',
  requireDynamicPermission('activities.write'),
  validators.validateCreate,
  asyncHandler(ActivitiesController.create)
);

// Update activity (Requires activities.write)
router.put(
  '/:id',
  requireDynamicPermission('activities.write'),
  validators.validateUpdate,
  asyncHandler(ActivitiesController.update)
);

// Delete activity (Requires activities.delete)
router.delete(
  '/:id',
  requireDynamicPermission('activities.delete'),
  validators.validateGetById,
  asyncHandler(ActivitiesController.delete)
);

// ==================== APPROVAL ROUTES ====================

// Approve activity (Requires activities.approve)
router.post(
  '/:id/approve',
  requireDynamicPermission('activities.approve'),
  validators.validateApprove,
  asyncHandler(ActivitiesController.approve)
);

// Reject activity (Requires activities.approve)
router.post(
  '/:id/reject',
  requireDynamicPermission('activities.approve'),
  validators.validateReject,
  asyncHandler(ActivitiesController.reject)
);

// ==================== REGISTRATION ROUTES ====================

// Register for activity (student) (Requires registrations.write)
router.post(
  '/:id/register',
  requireDynamicPermission('registrations.write'),
  validators.validateRegister,
  asyncHandler(ActivitiesController.register)
);

// Cancel registration (student) (Requires registrations.delete)
router.post(
  '/:id/cancel',
  requireDynamicPermission('registrations.delete'),
  validators.validateGetById,
  asyncHandler(ActivitiesController.cancelRegistration)
);

// ==================== ATTENDANCE (QR SELF-SCAN) ====================

// Student self check-in via QR scan (creates DiemDanh record) (Requires attendance.write)
router.post(
  '/:id/attendance/scan',
  requireDynamicPermission('attendance.write'),
  validators.validateGetById,
  asyncHandler(ActivitiesController.scanAttendance)
);

module.exports = router;





