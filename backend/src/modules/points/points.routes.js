/**
 * Points Routes (V2)
 * RESTful endpoints for student points and attendance operations
 */

const express = require('express');
const router = express.Router();
const service = require('./points.service');
const { ApiResponse, sendResponse } = require('../../core/http/response/apiResponse');
const { logError, logInfo } = require('../../core/logger');
const { auth: authenticateJWT, requireDynamicPermission } = require('../../core/http/middleware');

// Apply authentication to all routes
router.use(authenticateJWT);

/**
 * Helper to extract user ID from JWT
 */
function getUserId(req) {
  return (
    req.user?.sub ||
    req.user?.id ||
    req.user?.userId ||
    req.user?.uid ||
    null
  );
}

/**
 * GET /api/core/points/summary
 * Get points summary for current student
 * Requires: scores.read permission
 */
router.get('/summary', requireDynamicPermission('scores.read'), async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng', 401));
    }

    const { semester } = req.query; // Accept semester in format: hoc_ky_1-2025
    const filters = { semester };

    const result = await service.getPointsSummary(userId, filters);

    if (!result) {
      return sendResponse(res, 404, ApiResponse.error('Không tìm thấy thông tin sinh viên', 404));
    }

    return sendResponse(res, 200, ApiResponse.success(result));
  } catch (error) {
    logError('Error fetching student points summary:', error);
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy thông tin điểm rèn luyện', 500));
  }
});

/**
 * GET /api/core/points/detail
 * Get detailed points with pagination
 * Requires: scores.read permission
 */
router.get('/detail', requireDynamicPermission('scores.read'), async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng', 401));
    }

    const { semester, page = 1, limit = 10 } = req.query; // Accept semester in format: hoc_ky_1-2025
    const filters = { semester };
    const pagination = { page, limit };

    const result = await service.getPointsDetail(userId, filters, pagination);

    if (!result) {
      return sendResponse(res, 404, ApiResponse.error('Không tìm thấy thông tin sinh viên', 404));
    }

    return sendResponse(res, 200, ApiResponse.success(result));
  } catch (error) {
    logError('Error fetching student points detail:', error);
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy chi tiết điểm rèn luyện', 500));
  }
});

/**
 * GET /api/core/points/attendance-history
 * Get attendance history
 * Requires: attendance.read permission
 */
router.get('/attendance-history', requireDynamicPermission('attendance.read'), async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng', 401));
    }

    const { page = 1, limit = 10 } = req.query;
    const pagination = { page, limit };

    const result = await service.getAttendanceHistory(userId, pagination);

    if (!result) {
      return sendResponse(res, 404, ApiResponse.error('Không tìm thấy thông tin sinh viên', 404));
    }

    return sendResponse(res, 200, ApiResponse.success(result));
  } catch (error) {
    logError('Error fetching attendance history:', error);
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy lịch sử điểm danh', 500));
  }
});

/**
 * GET /api/core/points/filter-options
 * Get available semesters and academic years
 */
router.get('/filter-options', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng', 401));
    }

    const result = await service.getFilterOptions(userId);

    if (!result) {
      return sendResponse(res, 404, ApiResponse.error('Không tìm thấy thông tin sinh viên', 404));
    }

    return sendResponse(res, 200, ApiResponse.success(result));
  } catch (error) {
    logError('Error getting filter options:', error);
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy danh sách bộ lọc', 500));
  }
});

/**
 * GET /api/core/points/report
 * Get points report by academic year
 */
router.get('/report', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng', 401));
    }

    const { nam_hoc } = req.query;

    const result = await service.getPointsReport(userId, nam_hoc);

    if (!result) {
      return sendResponse(res, 404, ApiResponse.error('Không tìm thấy thông tin sinh viên', 404));
    }

    return sendResponse(res, 200, ApiResponse.success(result));
  } catch (error) {
    logError('Error generating points report:', error);
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi tạo báo cáo điểm rèn luyện', 500));
  }
});

module.exports = router;





