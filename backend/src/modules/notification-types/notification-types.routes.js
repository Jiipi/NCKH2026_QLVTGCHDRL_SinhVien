const express = require('express');
const router = express.Router();
const NotificationTypesService = require('./notification-types.service');
const { ApiResponse, sendResponse } = require('../../core/http/response/apiResponse');
const { auth, requireAdmin } = require('../../core/http/middleware/authJwt');

/**
 * @route   GET /api/core/notification-types
 * @desc    Get all notification types
 * @access  Private (Admin)
 */
router.get('/', auth, requireAdmin, async (req, res) => {
  try {
    const types = await NotificationTypesService.list();
    return sendResponse(res, 200, ApiResponse.success(types));
  } catch (error) {
    return sendResponse(res, 500, ApiResponse.error('Lỗi lấy loại thông báo'));
  }
});

/**
 * @route   GET /api/core/notification-types/:id
 * @desc    Get notification type by ID
 * @access  Private (Admin)
 */
router.get('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const type = await NotificationTypesService.getById(id);
    return sendResponse(res, 200, ApiResponse.success(type));
  } catch (error) {
    if (error.message === 'NOTIFICATION_TYPE_NOT_FOUND') {
      return sendResponse(res, 404, ApiResponse.error('Không tìm thấy loại thông báo'));
    }
    return sendResponse(res, 500, ApiResponse.error('Lỗi lấy chi tiết loại thông báo'));
  }
});

/**
 * @route   POST /api/core/notification-types
 * @desc    Create notification type
 * @access  Private (Admin)
 */
router.post('/', auth, requireAdmin, async (req, res) => {
  try {
    const type = await NotificationTypesService.create(req.body);
    return sendResponse(res, 201, ApiResponse.success(type, 'Tạo loại thông báo thành công'));
  } catch (error) {
    if (error.message === 'NOTIFICATION_TYPE_NAME_REQUIRED') {
      return sendResponse(res, 400, ApiResponse.error('Tên loại thông báo là bắt buộc'));
    }
    if (error.message === 'NOTIFICATION_TYPE_ALREADY_EXISTS') {
      return sendResponse(res, 400, ApiResponse.error('Loại thông báo đã tồn tại'));
    }
    return sendResponse(res, 500, ApiResponse.error('Lỗi tạo loại thông báo'));
  }
});

/**
 * @route   PUT /api/core/notification-types/:id
 * @desc    Update notification type
 * @access  Private (Admin)
 */
router.put('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const type = await NotificationTypesService.update(id, req.body);
    return sendResponse(res, 200, ApiResponse.success(type, 'Cập nhật loại thông báo thành công'));
  } catch (error) {
    if (error.message === 'NOTIFICATION_TYPE_NOT_FOUND') {
      return sendResponse(res, 404, ApiResponse.error('Không tìm thấy loại thông báo'));
    }
    if (error.message === 'NOTIFICATION_TYPE_NAME_REQUIRED') {
      return sendResponse(res, 400, ApiResponse.error('Tên loại thông báo là bắt buộc'));
    }
    if (error.message === 'NOTIFICATION_TYPE_ALREADY_EXISTS') {
      return sendResponse(res, 400, ApiResponse.error('Tên loại thông báo đã tồn tại'));
    }
    return sendResponse(res, 500, ApiResponse.error('Lỗi cập nhật loại thông báo'));
  }
});

/**
 * @route   DELETE /api/core/notification-types/:id
 * @desc    Delete notification type
 * @access  Private (Admin)
 */
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await NotificationTypesService.delete(id);
    return sendResponse(res, 200, ApiResponse.success(null, 'Xóa loại thông báo thành công'));
  } catch (error) {
    if (error.message === 'NOTIFICATION_TYPE_IN_USE') {
      return sendResponse(res, 400, ApiResponse.error('Không thể xóa. Loại thông báo đang được sử dụng'));
    }
    return sendResponse(res, 500, ApiResponse.error('Lỗi xóa loại thông báo'));
  }
});

module.exports = router;





