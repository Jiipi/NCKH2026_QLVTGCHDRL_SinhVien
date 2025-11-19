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
const { createActivitiesController } = require('./presentation/activities.factory');
const validators = require('./activities.validators');
const { auth, requireDynamicPermission } = require('../../core/http/middleware');
const { asyncHandler } = require('../../core/http/middleware/asyncHandler');
const { extractClassContext, applyClassScope } = require('../../core/http/middleware/classScope');

// All routes require authentication
router.use(auth);

// Extract class context for scope filtering
router.use(asyncHandler(extractClassContext));

// Apply class-based scope (students/monitors see only their class activities)
router.use(applyClassScope());

// Create controller with all dependencies (Dependency Injection)
const activitiesController = createActivitiesController();

// ==================== CRUD ROUTES ====================

// List all activities (Requires activities.read)
router.get(
  '/',
  requireDynamicPermission('activities.read'),
  validators.validateGetAll,
  asyncHandler((req, res) => activitiesController.getAll(req, res))
);

// Get QR data for activity (must be before /:id route)
router.get(
  '/:id/qr-data',
  requireDynamicPermission('activities.read'),
  validators.validateGetById,
  asyncHandler((req, res) => activitiesController.getQRData(req, res))
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

// Create activity (Requires activities.write)
router.post(
  '/',
  requireDynamicPermission('activities.write'),
  validators.validateCreate,
  asyncHandler((req, res) => activitiesController.create(req, res))
);

// Update activity (Requires activities.write)
router.put(
  '/:id',
  requireDynamicPermission('activities.write'),
  validators.validateUpdate,
  asyncHandler((req, res) => activitiesController.update(req, res))
);

// Delete activity (Requires activities.delete)
router.delete(
  '/:id',
  requireDynamicPermission('activities.delete'),
  validators.validateGetById,
  asyncHandler((req, res) => activitiesController.delete(req, res))
);

// ==================== APPROVAL ROUTES ====================

// Approve activity (Requires activities.approve)
router.post(
  '/:id/approve',
  requireDynamicPermission('activities.approve'),
  validators.validateApprove,
  asyncHandler((req, res) => activitiesController.approve(req, res))
);

// Reject activity (Requires activities.approve)
router.post(
  '/:id/reject',
  requireDynamicPermission('activities.approve'),
  validators.validateReject,
  asyncHandler((req, res) => activitiesController.reject(req, res))
);

// ==================== REGISTRATION ROUTES ====================

// Register for activity (student) (Requires registrations.write)
router.post(
  '/:id/register',
  requireDynamicPermission('registrations.write'),
  validators.validateRegister,
  asyncHandler((req, res) => activitiesController.register(req, res))
);

// Cancel registration (student) (Requires registrations.delete)
router.post(
  '/:id/cancel',
  requireDynamicPermission('registrations.delete'),
  validators.validateGetById,
  asyncHandler((req, res) => activitiesController.cancelRegistration(req, res))
);

// ==================== ATTENDANCE (QR SELF-SCAN) ====================

// Student self check-in via QR scan (creates DiemDanh record) (Requires attendance.write)
router.post(
  '/:id/attendance/scan',
  requireDynamicPermission('attendance.write'),
  validators.validateGetById,
  asyncHandler((req, res) => activitiesController.scanAttendance(req, res))
);

module.exports = router;





