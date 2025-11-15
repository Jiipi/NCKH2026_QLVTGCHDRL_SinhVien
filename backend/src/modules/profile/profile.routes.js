const express = require('express');
const router = express.Router();
const ProfileService = require('./profile.service');
const { ApiResponse, sendResponse } = require('../../core/http/response/apiResponse');
const { auth } = require('../../core/http/middleware/authJwt');

/**
 * @route   GET /api/core/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const profile = await ProfileService.getProfile(userId);
    return sendResponse(res, 200, ApiResponse.success(profile));
  } catch (error) {
    if (error.message === 'USER_NOT_FOUND') {
      return sendResponse(res, 404, ApiResponse.notFound('Không tìm thấy người dùng'));
    }
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy thông tin người dùng'));
  }
});

/**
 * @route   PUT /api/core/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/', auth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const profile = await ProfileService.updateProfile(userId, req.body);
    return sendResponse(res, 200, ApiResponse.success(profile, 'Cập nhật thông tin thành công'));
  } catch (error) {
    if (error.message === 'USER_NOT_FOUND') {
      return sendResponse(res, 404, ApiResponse.notFound('Không tìm thấy người dùng'));
    }
    if (error.message === 'EMAIL_ALREADY_EXISTS') {
      return sendResponse(res, 400, ApiResponse.error('Email đã được sử dụng'));
    }
    if (error.name === 'ZodError') {
      return sendResponse(res, 400, ApiResponse.error('Dữ liệu không hợp lệ', error.errors));
    }
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi cập nhật thông tin'));
  }
});

/**
 * @route   POST /api/core/profile/change-password
 * @desc    Change current user password
 * @access  Private
 */
router.post('/change-password', auth, async (req, res) => {
  try {
    const userId = req.user.sub;
    await ProfileService.changePassword(userId, req.body);
    return sendResponse(res, 200, ApiResponse.success(null, 'Đổi mật khẩu thành công'));
  } catch (error) {
    if (error.message === 'USER_NOT_FOUND') {
      return sendResponse(res, 404, ApiResponse.notFound('Không tìm thấy người dùng'));
    }
    if (error.message === 'INVALID_OLD_PASSWORD') {
      return sendResponse(res, 400, ApiResponse.error('Mật khẩu cũ không đúng'));
    }
    if (error.name === 'ZodError') {
      return sendResponse(res, 400, ApiResponse.error('Dữ liệu không hợp lệ', error.errors));
    }
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi đổi mật khẩu'));
  }
});

/**
 * @route   GET /api/core/profile/monitor-status
 * @desc    Check if current user is a class monitor
 * @access  Private
 */
router.get('/monitor-status', auth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const monitorStatus = await ProfileService.checkClassMonitor(userId);
    return sendResponse(res, 200, ApiResponse.success(monitorStatus));
  } catch (error) {
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi kiểm tra quyền lớp trưởng'));
  }
});

module.exports = router;





