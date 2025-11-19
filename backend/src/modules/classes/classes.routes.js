/**
 * Classes Routes - V2 API
 * Manual route definitions following clean architecture pattern
 */

const express = require('express');
const router = express.Router();
const { createClassesController } = require('./presentation/classes.factory');
const validators = require('./classes.validators');
const { auth } = require('../../core/http/middleware/authJwt');
const { asyncHandler } = require('../../core/http/middleware/asyncHandler');

const classesController = createClassesController();

// All routes require authentication
router.use(auth);

// ==================== CUSTOM ROUTES (Must be before /:id) ====================

// Assign teacher to class
router.post(
  '/:id/assign-teacher',
  validators.validateAssignTeacher,
  asyncHandler((req, res) => classesController.assignTeacher(req, res))
);

// Get students in class
router.get(
  '/:id/students',
  validators.validateGetById,
  asyncHandler((req, res) => classesController.getStudents(req, res))
);

// Get activities for class
router.get(
  '/:id/activities',
  validators.validateGetById,
  asyncHandler((req, res) => classesController.getActivities(req, res))
);

// ==================== CRUD ROUTES ====================

// List all classes
router.get(
  '/',
  validators.validateGetAll,
  asyncHandler((req, res) => classesController.getAll(req, res))
);

// Get single class
router.get(
  '/:id',
  validators.validateGetById,
  asyncHandler((req, res) => classesController.getById(req, res))
);

// Create class
router.post(
  '/',
  validators.validateCreate,
  asyncHandler((req, res) => classesController.create(req, res))
);

// Update class
router.put(
  '/:id',
  validators.validateUpdate,
  asyncHandler((req, res) => classesController.update(req, res))
);

// Delete class
router.delete(
  '/:id',
  validators.validateGetById,
  asyncHandler((req, res) => classesController.delete(req, res))
);

module.exports = router;






