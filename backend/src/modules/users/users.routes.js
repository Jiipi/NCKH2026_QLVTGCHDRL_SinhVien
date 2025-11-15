/**
 * Users Routes - V2 API
 * Manual route definitions following clean architecture pattern
 */

const express = require('express');
const router = express.Router();
const UsersController = require('./users.controller');
const validators = require('./users.validators');
const { auth } = require('../../core/http/middleware/authJwt');
const { asyncHandler } = require('../../app/errors/AppError');

// All routes require authentication
router.use(auth);

// ==================== CUSTOM ROUTES (Must be before /:id) ====================

// Search users
router.get(
  '/search',
  validators.validateSearch,
  asyncHandler(UsersController.search)
);

// Get user statistics
router.get(
  '/stats',
  asyncHandler(UsersController.getStats)
);

// Get current user profile
router.get(
  '/me',
  asyncHandler(UsersController.getMe)
);

// Get users by class
router.get(
  '/class/:className',
  validators.validateGetByClass,
  asyncHandler(UsersController.getByClass)
);

// ==================== CRUD ROUTES ====================

// List all users
router.get(
  '/',
  validators.validateGetAll,
  asyncHandler(UsersController.getAll)
);

// Get single user
router.get(
  '/:id',
  validators.validateGetById,
  asyncHandler(UsersController.getById)
);

// Create user
router.post(
  '/',
  validators.validateCreate,
  asyncHandler(UsersController.create)
);

// Update user
router.put(
  '/:id',
  validators.validateUpdate,
  asyncHandler(UsersController.update)
);

// Delete user
router.delete(
  '/:id',
  validators.validateGetById,
  asyncHandler(UsersController.delete)
);

module.exports = router;





