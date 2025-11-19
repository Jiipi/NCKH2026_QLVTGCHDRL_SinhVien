const express = require('express');
const router = express.Router();
const { createRolesController } = require('./presentation/roles.factory');
const { auth, requireAdmin, clearPermissionsCache } = require('../../core/http/middleware');
const { asyncHandler } = require('../../core/http/middleware/asyncHandler');

const rolesController = createRolesController();

/**
 * @route   GET /api/core/roles
 * @desc    Get all roles with pagination
 * @access  Private (Admin)
 */
router.get('/', auth, requireAdmin, asyncHandler((req, res) => rolesController.list(req, res)));

/**
 * @route   GET /api/core/roles/:id
 * @desc    Get role by ID
 * @access  Private (Admin)
 */
router.get('/:id', auth, requireAdmin, asyncHandler((req, res) => rolesController.getById(req, res)));

/**
 * @route   POST /api/core/roles
 * @desc    Create new role
 * @access  Private (Admin)
 */
router.post('/', auth, requireAdmin, asyncHandler((req, res) => rolesController.create(req, res)));

/**
 * @route   PUT /api/core/roles/:id
 * @desc    Update role
 * @access  Private (Admin)
 */
router.put('/:id', auth, requireAdmin, asyncHandler((req, res) => {
  // Clear permissions cache khi update role để users có quyền mới ngay lập tức
  clearPermissionsCache();
  return rolesController.update(req, res);
}));

/**
 * @route   DELETE /api/core/roles/:id
 * @desc    Delete role
 * @access  Private (Admin)
 */
router.delete('/:id', auth, requireAdmin, asyncHandler((req, res) => rolesController.delete(req, res)));

/**
 * @route   POST /api/core/roles/:id/assign
 * @desc    Assign role to users
 * @access  Private (Admin)
 */
router.post('/:id/assign', auth, requireAdmin, asyncHandler((req, res) => rolesController.assignToUsers(req, res)));

/**
 * @route   DELETE /api/core/roles/user/:userId
 * @desc    Remove role from user (not allowed)
 * @access  Private (Admin)
 */
router.delete('/user/:userId', auth, requireAdmin, asyncHandler((req, res) => rolesController.removeFromUser(req, res)));

module.exports = router;





