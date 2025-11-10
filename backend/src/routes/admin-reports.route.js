const { Router } = require('express');
const adminReportsService = require('../services/admin-reports.service');
const { ApiResponse, sendResponse } = require('../utils/response');
const { logError } = require('../utils/logger');
const { auth: authenticateJWT, requireAdmin } = require('../middlewares/auth');
const AdminReportsController = require('../controllers/admin.reports.controller');

const router = Router();

// All routes require authentication and admin role
router.use(authenticateJWT);
router.use(requireAdmin);

/**
 * GET /api/v2/admin/reports/users/:id/points
 * Get detailed points report for a specific user
 * Query params:
 * - semester (optional): Semester filter
 * - year (optional): Year filter
 * 
 * Returns:
 * - summary: Total points, activities count, average, rank
 * - details: Array of activity details with points
 * - attendance: Array of attendance records
 */
router.get('/users/:id/points', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await adminReportsService.getUserPointsReport(id, req.query);
    return sendResponse(res, 200, ApiResponse.success(data, 'Lấy điểm rèn luyện thành công'));
  } catch (err) {
    logError('Error fetching user points report:', err);
    const statusCode = err.message === 'Không tìm thấy người dùng' ? 404 : 500;
    return sendResponse(res, statusCode, ApiResponse.error(err.message || 'Lỗi lấy điểm rèn luyện', statusCode));
  }
});

/**
 * GET /api/v2/admin/reports/attendance
 * Get paginated attendance report with filters
 * Query params:
 * - page (optional): Page number (default: 1)
 * - limit (optional): Records per page (default: 15, max: 50)
 * - search (optional): Search by student name or MSSV
 * - activity_id (optional): Filter by activity ID
 * - status (optional): Filter by attendance status (co_mat, vang_mat, etc.)
 * 
 * Returns:
 * - attendance: Array of transformed attendance records
 * - pagination: Page metadata (page, limit, total, totalPages, etc.)
 */
router.get('/attendance', async (req, res) => {
  try {
    const data = await adminReportsService.getAttendanceReport(req.query);
    return sendResponse(res, 200, ApiResponse.success(data, 'Lấy danh sách điểm danh thành công'));
  } catch (err) {
    logError('Error fetching attendance report:', err);
    return sendResponse(res, 500, ApiResponse.error('Lỗi lấy danh sách điểm danh', 500));
  }
});

/**
 * GET /api/v2/admin/reports/classes
 * Get all classes with student counts
 * Used for admin notification targeting and class management
 * 
 * Returns:
 * - Array of classes with: id, ten_lop, khoa, nien_khoa, soLuongSinhVien
 * - Sorted by khoa and ten_lop
 */
router.get('/classes', async (req, res) => {
  try {
    const data = await adminReportsService.getClassesList();
    return sendResponse(res, 200, ApiResponse.success(data, 'Lấy danh sách lớp thành công'));
  } catch (err) {
    logError('Error fetching classes list:', err);
    return sendResponse(res, 500, ApiResponse.error('Lỗi lấy danh sách lớp', 500));
  }
});

/**
 * GET /api/v2/admin/reports/overview
 * V2 alias of legacy /admin/reports/overview
 */
router.get('/overview', (req, res) => AdminReportsController.getOverview(req, res));

/**
 * GET /api/v2/admin/reports/export/activities
 * V2 alias of legacy /admin/reports/export/activities
 */
router.get('/export/activities', (req, res) => AdminReportsController.exportActivities(req, res));

/**
 * GET /api/v2/admin/reports/export/registrations
 * V2 alias of legacy /admin/reports/export/registrations
 */
router.get('/export/registrations', (req, res) => AdminReportsController.exportRegistrations(req, res));

module.exports = router;
