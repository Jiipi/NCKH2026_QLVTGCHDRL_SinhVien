const express = require('express');
const router = express.Router();
const broadcastService = require('../services/broadcast.service');
const { ApiResponse, sendResponse } = require('../utils/response');
const { logError } = require('../utils/logger');
const { auth: authenticateJWT, requireAdmin } = require('../middlewares/auth');

// Apply authentication and admin authorization to all routes
router.use(authenticateJWT);
router.use(requireAdmin);

/**
 * @route   POST /api/v2/broadcast
 * @desc    Send broadcast notification to multiple recipients
 * @access  Admin only
 * @body    {
 *   tieu_de: string (required),
 *   noi_dung: string (required),
 *   scope: 'system' | 'role' | 'class' | 'department' | 'activity' (required),
 *   loai_tb_id?: number,
 *   muc_do_uu_tien?: 'thap' | 'trung_binh' | 'cao',
 *   phuong_thuc_gui?: string,
 *   targetRole?: string (required if scope='role'),
 *   targetClass?: number (required if scope='class'),
 *   targetDepartment?: string (required if scope='department'),
 *   activityId?: number (required if scope='activity')
 * }
 */
router.post('/', async (req, res) => {
  try {
    const nguoi_gui_id = req.user?.sub || req.user?.id;

    const result = await broadcastService.broadcastNotification({
      ...req.body,
      nguoi_gui_id
    });

    const statusCode = result.count === 0 ? 200 : 201;
    return sendResponse(res, statusCode, ApiResponse.success(result, result.message));

  } catch (error) {
    logError('Error broadcasting notification', error, { userId: req.user?.id });
    const statusCode = error.message.includes('Thiếu') || error.message.includes('không hợp lệ') ? 400 : 500;
    return sendResponse(res, statusCode, ApiResponse.error(error.message || 'Lỗi khi gửi thông báo'));
  }
});

/**
 * @route   GET /api/v2/broadcast/stats
 * @desc    Get broadcast statistics (total, weekly, by scope)
 * @access  Admin only
 */
router.get('/stats', async (req, res) => {
  try {
    const adminId = req.user?.sub || req.user?.id;
    const stats = await broadcastService.getBroadcastStats(adminId);

    return sendResponse(res, 200, ApiResponse.success(stats, 'Lấy thống kê broadcast thành công'));

  } catch (error) {
    logError('Error fetching broadcast stats', { error: error.message, userId: req.user?.id });
    return sendResponse(res, 500, ApiResponse.error('Lỗi lấy thống kê broadcast'));
  }
});

/**
 * @route   GET /api/v2/broadcast/history
 * @desc    Get broadcast notification history
 * @access  Admin only
 * @query   limit?: number (default 500)
 */
router.get('/history', async (req, res) => {
  try {
    const adminId = req.user?.sub || req.user?.id;
    const limit = req.query.limit ? parseInt(req.query.limit) : 500;

    const result = await broadcastService.getBroadcastHistory(adminId, limit);

    return sendResponse(res, 200, ApiResponse.success(result, 'Lấy lịch sử broadcast thành công'));

  } catch (error) {
    logError('Error fetching broadcast history', { error: error.message, userId: req.user?.id });
    return sendResponse(res, 500, ApiResponse.error('Lỗi lấy lịch sử broadcast'));
  }
});

module.exports = router;
