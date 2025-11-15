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
const { auth } = require('../../core/http/middleware/authJwt');
const { asyncHandler } = require('../../app/errors/AppError');
const { extractClassContext, applyClassScope } = require('../../core/http/middleware/classScope');

// All routes require authentication
router.use(auth);

// Extract class context for scope filtering
router.use(asyncHandler(extractClassContext));

// Apply class-based scope (students/monitors see only their class activities)
router.use(applyClassScope());

// ==================== CRUD ROUTES ====================

// List all activities
router.get(
  '/',
  validators.validateGetAll,
  asyncHandler(ActivitiesController.getAll)
);

// Get activity details with registrations
router.get(
  '/:id/details',
  validators.validateGetById,
  asyncHandler(ActivitiesController.getDetails)
);

// Get single activity
router.get(
  '/:id',
  validators.validateGetById,
  asyncHandler(ActivitiesController.getById)
);

// Create activity
router.post(
  '/',
  validators.validateCreate,
  asyncHandler(ActivitiesController.create)
);

// Update activity
router.put(
  '/:id',
  validators.validateUpdate,
  asyncHandler(ActivitiesController.update)
);

// Delete activity
router.delete(
  '/:id',
  validators.validateGetById,
  asyncHandler(ActivitiesController.delete)
);

// ==================== APPROVAL ROUTES ====================

// Approve activity
router.post(
  '/:id/approve',
  validators.validateApprove,
  asyncHandler(ActivitiesController.approve)
);

// Reject activity
router.post(
  '/:id/reject',
  validators.validateReject,
  asyncHandler(ActivitiesController.reject)
);

// ==================== REGISTRATION ROUTES ====================

// Register for activity (student)
router.post(
  '/:id/register',
  validators.validateRegister,
  asyncHandler(ActivitiesController.register)
);

// Cancel registration (student)
router.post(
  '/:id/cancel',
  validators.validateGetById,
  asyncHandler(ActivitiesController.cancelRegistration)
);

// Get QR data for activity
router.get(
  '/:id/qr-data',
  validators.validateGetById,
  asyncHandler(ActivitiesController.getQRData)
);

// ==================== ATTENDANCE (QR SELF-SCAN) ====================

// Student self check-in via QR scan (creates DiemDanh record)
router.post(
  '/:id/attendance/scan',
  validators.validateGetById,
  asyncHandler(ActivitiesController.scanAttendance)
);

module.exports = router;





