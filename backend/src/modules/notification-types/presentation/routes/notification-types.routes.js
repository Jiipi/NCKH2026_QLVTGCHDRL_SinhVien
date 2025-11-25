const express = require('express');
const router = express.Router();
const { createNotificationTypesController } = require('../notification-types.factory');
const { auth, requireAdmin } = require('../../../../core/http/middleware/authJwt');
const { asyncHandler } = require('../../../../core/http/middleware/asyncHandler');

const notificationTypesController = createNotificationTypesController();

/**
 * @route   GET /api/core/notification-types
 * @desc    Get all notification types
 * @access  Private (Admin)
 */
router.get('/', auth, requireAdmin, asyncHandler((req, res) => notificationTypesController.list(req, res)));

/**
 * @route   GET /api/core/notification-types/:id
 * @desc    Get notification type by ID
 * @access  Private (Admin)
 */
router.get('/:id', auth, requireAdmin, asyncHandler((req, res) => notificationTypesController.getById(req, res)));

/**
 * @route   POST /api/core/notification-types
 * @desc    Create notification type
 * @access  Private (Admin)
 */
router.post('/', auth, requireAdmin, asyncHandler((req, res) => notificationTypesController.create(req, res)));

/**
 * @route   PUT /api/core/notification-types/:id
 * @desc    Update notification type
 * @access  Private (Admin)
 */
router.put('/:id', auth, requireAdmin, asyncHandler((req, res) => notificationTypesController.update(req, res)));

/**
 * @route   DELETE /api/core/notification-types/:id
 * @desc    Delete notification type
 * @access  Private (Admin)
 */
router.delete('/:id', auth, requireAdmin, asyncHandler((req, res) => notificationTypesController.delete(req, res)));

module.exports = router;





