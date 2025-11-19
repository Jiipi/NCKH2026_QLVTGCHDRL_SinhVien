const express = require('express');
const router = express.Router();
const { createProfileController } = require('./presentation/profile.factory');
const { auth, requireDynamicPermission } = require('../../core/http/middleware');
const { asyncHandler } = require('../../core/http/middleware/asyncHandler');

const profileController = createProfileController();

/**
 * @route   GET /api/core/profile
 * @desc    Get current user profile
 * @access  Private (Requires profile.read permission)
 */
router.get('/', auth, requireDynamicPermission('profile.read'), asyncHandler((req, res) => profileController.getProfile(req, res)));

/**
 * @route   PUT /api/core/profile
 * @desc    Update current user profile
 * @access  Private (Requires profile.update permission)
 */
router.put('/', auth, requireDynamicPermission('profile.update'), asyncHandler((req, res) => profileController.updateProfile(req, res)));

/**
 * @route   POST /api/core/profile/change-password
 * @desc    Change current user password
 * @access  Private
 */
router.post('/change-password', auth, asyncHandler((req, res) => profileController.changePassword(req, res)));

/**
 * @route   GET /api/core/profile/monitor-status
 * @desc    Check if current user is a class monitor
 * @access  Private
 */
router.get('/monitor-status', auth, asyncHandler((req, res) => profileController.checkMonitorStatus(req, res)));

module.exports = router;





