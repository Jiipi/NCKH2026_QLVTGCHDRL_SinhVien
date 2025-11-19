/**
 * Session Routes
 * API endpoints for session management and user activity tracking
 */

const express = require('express');
const router = express.Router();
const SessionTrackingService = require('../services/session-tracking.service');
const { auth } = require('../core/http/middleware/authJwt');
const { ApiResponse, sendResponse } = require('../core/http/response/apiResponse');
const { logError } = require('../core/logger');

// Debug middleware to trace session route hits (can be removed later)
router.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[SessionsRoute] Incoming:', req.method, req.originalUrl);
  }
  next();
});
/**
 * @route   GET /api/sessions/active-users
 * @desc    Get list of active user IDs and codes
 * @access  Private (Admin/Teacher)
 */
router.get('/active-users', auth, async (req, res) => {
  try {
    const minutesThreshold = parseInt(req.query.minutes) || 5;
    
    const activeUsers = await SessionTrackingService.getActiveUsers(minutesThreshold);
    
    return sendResponse(
      res,
      200,
      ApiResponse.success(activeUsers, 'Active users retrieved successfully')
    );
  } catch (error) {
    logError('Failed to get active users', error);
    return sendResponse(
      res,
      500,
      ApiResponse.error('Lỗi khi lấy danh sách người dùng đang hoạt động')
    );
  }
});

/**
 * @route   GET /api/sessions/my-sessions
 * @desc    Get current user's active sessions
 * @access  Private
 */
router.get('/my-sessions', auth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const minutesThreshold = parseInt(req.query.minutes) || 5;
    
    const sessions = await SessionTrackingService.getActiveSessions(userId, minutesThreshold);
    
    return sendResponse(
      res,
      200,
      ApiResponse.success(sessions, 'Your sessions retrieved successfully')
    );
  } catch (error) {
    logError('Failed to get user sessions', error);
    return sendResponse(
      res,
      500,
      ApiResponse.error('Lỗi khi lấy danh sách phiên đăng nhập')
    );
  }
});

/**
 * @route   GET /api/sessions/status/:userId
 * @desc    Get user activity status
 * @access  Private (Admin/Teacher)
 */
router.get('/status/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check permissions - only admin, teacher, or self can view
    const requesterId = req.user.sub;
    const role = req.user.role;
    const isAllowed = ['ADMIN', 'GIANG_VIEN'].includes(role) || requesterId === userId;
    
    if (!isAllowed) {
      return sendResponse(
        res,
        403,
        ApiResponse.forbidden('Bạn không có quyền xem thông tin này')
      );
    }
    
    const status = await SessionTrackingService.getUserActivityStatus(userId);
    
    if (!status) {
      return sendResponse(
        res,
        404,
        ApiResponse.notFound('Không tìm thấy người dùng')
      );
    }
    
    return sendResponse(
      res,
      200,
      ApiResponse.success(status, 'User activity status retrieved')
    );
  } catch (error) {
    logError('Failed to get user activity status', error);
    return sendResponse(
      res,
      500,
      ApiResponse.error('Lỗi khi lấy trạng thái hoạt động')
    );
  }
});

/**
 * @route   POST /api/sessions/heartbeat
 * @desc    Update session activity (heartbeat)
 * @access  Private
 */
router.post('/heartbeat', auth, async (req, res) => {
  try {
    const tabId = req.headers['x-tab-id'] || req.body.tabId;
    const userId = req.user?.sub;
    const userRole = req.user?.role;
    
    if (!tabId) {
      return sendResponse(
        res,
        400,
        ApiResponse.error('Tab ID is required')
      );
    }
    
    // Try to update existing session, or create new one if doesn't exist
    let success = await SessionTrackingService.updateSessionActivity(tabId);
    
    // If session doesn't exist and we have userId, create it
    if (!success && userId) {
      const newSession = await SessionTrackingService.trackSession(userId, tabId, userRole);
      success = !!newSession;
    }
    
    return sendResponse(
      res,
      200,
      ApiResponse.success({ updated: success }, 'Heartbeat recorded')
    );
  } catch (error) {
    logError('Failed to update heartbeat', error);
    return sendResponse(
      res,
      500,
      ApiResponse.error('Lỗi khi cập nhật heartbeat')
    );
  }
});

/**
 * @route   DELETE /api/sessions/logout
 * @desc    Remove current session
 * @access  Private
 */
router.delete('/logout', auth, async (req, res) => {
  try {
    const tabId = req.headers['x-tab-id'] || req.body.tabId;
    
    if (tabId) {
      await SessionTrackingService.removeSession(tabId);
    }
    
    return sendResponse(
      res,
      200,
      ApiResponse.success(null, 'Session removed successfully')
    );
  } catch (error) {
    logError('Failed to remove session', error);
    return sendResponse(
      res,
      500,
      ApiResponse.error('Lỗi khi xóa phiên đăng nhập')
    );
  }
});

/**
 * @route   POST /api/sessions/cleanup
 * @desc    Cleanup old sessions (Admin only)
 * @access  Private (Admin)
 */
router.post('/cleanup', auth, async (req, res) => {
  try {
    // Check admin permission
    if (req.user.role !== 'ADMIN') {
      return sendResponse(
        res,
        403,
        ApiResponse.forbidden('Chỉ admin mới có quyền này')
      );
    }
    
    const hoursThreshold = parseInt(req.body.hours) || 24;
    const deletedCount = await SessionTrackingService.cleanupOldSessions(hoursThreshold);
    
    return sendResponse(
      res,
      200,
      ApiResponse.success(
        { deletedCount },
        `Đã xóa ${deletedCount} phiên đăng nhập cũ`
      )
    );
  } catch (error) {
    logError('Failed to cleanup sessions', error);
    return sendResponse(
      res,
      500,
      ApiResponse.error('Lỗi khi dọn dẹp phiên đăng nhập')
    );
  }
});

module.exports = router;
