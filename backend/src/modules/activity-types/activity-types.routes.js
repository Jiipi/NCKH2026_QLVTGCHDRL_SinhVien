const express = require('express');
const router = express.Router();
const activityTypesService = require('./activity-types.service');
const { ApiResponse, sendResponse } = require('../../core/http/response/apiResponse');
const { logError } = require('../../core/logger');
const { auth: authenticateJWT, requireAdmin } = require('../../core/http/middleware/authJwt');

// Apply authentication to all routes
router.use(authenticateJWT);

/**
 * @route   GET /api/core/activity-types
 * @desc    Get paginated list of activity types with search
 * @access  Authenticated users (students need this for filtering)
 */
router.get('/', async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const result = await activityTypesService.getList({ page, limit, search });
    return sendResponse(res, 200, ApiResponse.success(result));
  } catch (error) {
    logError('Error fetching activity types:', error);
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy danh sách loại hoạt động'));
  }
});

/**
 * @route   GET /api/core/activity-types/:id
 * @desc    Get single activity type by ID
 * @access  Authenticated users
 */
router.get('/:id', async (req, res) => {
  try {
    const activityType = await activityTypesService.getById(req.params.id);
    if (!activityType) {
      return sendResponse(res, 404, ApiResponse.notFound('Không tìm thấy loại hoạt động'));
    }
    return sendResponse(res, 200, ApiResponse.success(activityType));
  } catch (error) {
    logError('Error fetching activity type:', error);
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy thông tin loại hoạt động'));
  }
});

/**
 * @route   POST /api/core/activity-types
 * @desc    Create new activity type
 * @access  Admin only
 */
router.post('/', requireAdmin, async (req, res) => {
  try {
    const activityType = await activityTypesService.create(req.body, req.user.id);
    return sendResponse(res, 201, ApiResponse.success(activityType, 'Tạo loại hoạt động thành công'));
  } catch (error) {
    logError('Error creating activity type:', error);
    return sendResponse(res, 400, ApiResponse.error(error.message || 'Lỗi khi tạo loại hoạt động'));
  }
});

/**
 * @route   PUT /api/core/activity-types/:id
 * @desc    Update existing activity type
 * @access  Admin only
 */
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const activityType = await activityTypesService.update(req.params.id, req.body, req.user.id);
    return sendResponse(res, 200, ApiResponse.success(activityType, 'Cập nhật loại hoạt động thành công'));
  } catch (error) {
    logError('Error updating activity type:', error);
    const status = error.message.includes('không tồn tại') ? 404 : 400;
    return sendResponse(res, status, ApiResponse.error(error.message || 'Lỗi khi cập nhật loại hoạt động'));
  }
});

/**
 * @route   DELETE /api/core/activity-types/:id
 * @desc    Delete activity type
 * @access  Admin only
 */
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await activityTypesService.delete(req.params.id, req.user.id);
    return sendResponse(res, 200, ApiResponse.success(null, 'Xóa loại hoạt động thành công'));
  } catch (error) {
    logError('Error deleting activity type:', error);
    const status = error.message.includes('không tồn tại') ? 404 : 400;
    return sendResponse(res, status, ApiResponse.error(error.message || 'Lỗi khi xóa loại hoạt động'));
  }
});

module.exports = router;





