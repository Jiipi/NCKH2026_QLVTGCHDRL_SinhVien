const express = require('express');
const router = express.Router();
const { createActivityTypesController } = require('./presentation/activity-types.factory');
const { auth: authenticateJWT, requireTeacher } = require('../../core/http/middleware/authJwt');
const { uploadImage, handleUploadError } = require('../../core/http/middleware/upload');
const { asyncHandler } = require('../../core/http/middleware/asyncHandler');

const activityTypesController = createActivityTypesController();

// Apply authentication to all routes
router.use(authenticateJWT);

/**
 * @route   GET /api/core/activity-types
 * @desc    Get paginated list of activity types with search
 * @access  Authenticated users (students need this for filtering)
 */
router.get('/', asyncHandler((req, res) => activityTypesController.list(req, res)));

/**
 * @route   GET /api/core/activity-types/:id
 * @desc    Get single activity type by ID
 * @access  Authenticated users
 */
router.get('/:id', asyncHandler((req, res) => activityTypesController.getById(req, res)));

/**
 * @route   POST /api/core/activity-types
 * @desc    Create new activity type
 * @access  Teacher or Admin
 */
router.post('/', requireTeacher, asyncHandler((req, res) => activityTypesController.create(req, res)));

/**
 * @route   POST /api/core/activity-types/upload-image
 * @desc    Upload image for activity type
 * @access  Teacher or Admin
 */
router.post('/upload-image', requireTeacher, uploadImage.single('image'), handleUploadError, asyncHandler((req, res) => activityTypesController.uploadImage(req, res)));

/**
 * @route   PUT /api/core/activity-types/:id
 * @desc    Update existing activity type
 * @access  Teacher or Admin
 */
router.put('/:id', requireTeacher, asyncHandler((req, res) => activityTypesController.update(req, res)));

/**
 * @route   DELETE /api/core/activity-types/:id
 * @desc    Delete activity type
 * @access  Teacher or Admin
 */
router.delete('/:id', requireTeacher, asyncHandler((req, res) => activityTypesController.delete(req, res)));

module.exports = router;





