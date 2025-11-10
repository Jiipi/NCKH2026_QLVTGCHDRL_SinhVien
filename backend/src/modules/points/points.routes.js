/**
 * Points Routes (V2)
 * RESTful endpoints for student points and attendance operations
 */

const express = require('express');
const router = express.Router();
const service = require('./points.service');
const { ApiResponse, sendResponse } = require('../../utils/response');
const { logError, logInfo } = require('../../utils/logger');
const { auth: authenticateJWT } = require('../../middlewares/auth');

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
 * GET /api/v2/points/summary
 * Get points summary for current student
 */
router.get('/summary', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng', 401));
    }

    const { hoc_ky, nam_hoc } = req.query;
    const filters = { hoc_ky, nam_hoc };

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
 * GET /api/v2/points/detail
 * Get detailed points with pagination
 */
router.get('/detail', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng', 401));
    }

    const { hoc_ky, nam_hoc, page = 1, limit = 10 } = req.query;
    const filters = { hoc_ky, nam_hoc };
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
 * GET /api/v2/points/attendance-history
 * Get attendance history
 */
router.get('/attendance-history', async (req, res) => {
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
 * GET /api/v2/points/filter-options
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
 * GET /api/v2/points/report
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
