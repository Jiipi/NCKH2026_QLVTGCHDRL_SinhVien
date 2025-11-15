/**
 * Classes Routes - V2 API
 * Manual route definitions following clean architecture pattern
 */

const express = require('express');
const router = express.Router();
const ClassesController = require('./classes.controller');
const validators = require('./classes.validators');
const { auth } = require('../../core/http/middleware/authJwt');
const { asyncHandler } = require('../../app/errors/AppError');

// All routes require authentication
router.use(auth);

// ==================== CUSTOM ROUTES (Must be before /:id) ====================

// Assign teacher to class
router.post(
  '/:id/assign-teacher',
  validators.validateAssignTeacher,
  asyncHandler(ClassesController.assignTeacher)
);

// Get students in class
router.get(
  '/:id/students',
  validators.validateGetById,
  asyncHandler(ClassesController.getStudents)
);

// Get activities for class
router.get(
  '/:id/activities',
  validators.validateGetById,
  asyncHandler(ClassesController.getActivities)
);

// ==================== CRUD ROUTES ====================

// List all classes
router.get(
  '/',
  validators.validateGetAll,
  asyncHandler(ClassesController.getAll)
);

// Get single class
router.get(
  '/:id',
  validators.validateGetById,
  asyncHandler(ClassesController.getById)
);

// Create class
router.post(
  '/',
  validators.validateCreate,
  asyncHandler(ClassesController.create)
);

// Update class
router.put(
  '/:id',
  validators.validateUpdate,
  asyncHandler(ClassesController.update)
);

// Delete class
router.delete(
  '/:id',
  validators.validateGetById,
  asyncHandler(ClassesController.delete)
);

module.exports = router;






