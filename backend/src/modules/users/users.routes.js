/**
 * Users Routes - V2 API
 * Manual route definitions following clean architecture pattern
 */

const express = require('express');
const router = express.Router();
const { createUsersController } = require('./presentation/users.factory');
const validators = require('./users.validators');
const { auth } = require('../../core/http/middleware/authJwt');
const { asyncHandler } = require('../../core/http/middleware/asyncHandler');

const usersController = createUsersController();

// All routes require authentication
router.use(auth);

// ==================== CUSTOM ROUTES (Must be before /:id) ====================

// Search users
router.get(
  '/search',
  validators.validateSearch,
  asyncHandler((req, res) => usersController.search(req, res))
);

// Get user statistics
router.get(
  '/stats',
  asyncHandler((req, res) => usersController.getStats(req, res))
);

// Get current user profile
router.get(
  '/me',
  asyncHandler((req, res) => usersController.getMe(req, res))
);

// Get users by class
router.get(
  '/class/:className',
  validators.validateGetByClass,
  asyncHandler((req, res) => usersController.getByClass(req, res))
);

// ==================== CRUD ROUTES ====================

// List all users
router.get(
  '/',
  validators.validateGetAll,
  asyncHandler((req, res) => usersController.getAll(req, res))
);

// Get single user
router.get(
  '/:id',
  validators.validateGetById,
  asyncHandler((req, res) => usersController.getById(req, res))
);

// Create user
router.post(
  '/',
  validators.validateCreate,
  asyncHandler((req, res) => usersController.create(req, res))
);

// Update user
router.put(
  '/:id',
  validators.validateUpdate,
  asyncHandler((req, res) => usersController.update(req, res))
);

// Delete user
router.delete(
  '/:id',
  validators.validateGetById,
  asyncHandler((req, res) => usersController.delete(req, res))
);

module.exports = router;





