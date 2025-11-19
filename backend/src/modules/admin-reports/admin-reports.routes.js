const { Router } = require('express');
const adminReportsService = require('./admin-reports.service');
const { ApiResponse, sendResponse } = require('../../core/http/response/apiResponse');
const { logError } = require('../../core/logger');
const { auth: authenticateJWT, requireAdmin } = require('../../core/http/middleware/authJwt');

const router = Router();

// All routes require authentication and admin role
router.use(authenticateJWT);
router.use(requireAdmin);

/**
 * GET /api/core/admin/reports/users/:id/points
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
 * GET /api/core/admin/reports/attendance
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
 * GET /api/core/admin/reports/classes
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
 * GET /api/core/admin/reports/overview
 * Get overview statistics for admin dashboard
 */
router.get('/overview', async (req, res) => {
  try {
    const data = await adminReportsService.getOverview(req.query);
    return sendResponse(res, 200, ApiResponse.success(data, 'Lấy báo cáo tổng quan thành công'));
  } catch (err) {
    logError('Error fetching overview:', err);
    const statusCode = err.message === 'Tham số học kỳ không hợp lệ' ? 400 : 500;
    return sendResponse(res, statusCode, ApiResponse.error(err.message || 'Lỗi lấy báo cáo', statusCode));
  }
});

/**
 * GET /api/core/admin/reports/export/activities
 * Export activities to CSV
 */
router.get('/export/activities', async (req, res) => {
  try {
    const csv = await adminReportsService.exportActivities(req.query);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="activities.csv"');
    return res.status(200).send(csv);
  } catch (err) {
    logError('Error exporting activities:', err);
    const statusCode = err.message === 'Tham số học kỳ không hợp lệ' ? 400 : 500;
    return sendResponse(res, statusCode, ApiResponse.error(err.message || 'Lỗi xuất hoạt động', statusCode));
  }
});

/**
 * GET /api/core/admin/reports/export/registrations
 * Export registrations to CSV
 */
router.get('/export/registrations', async (req, res) => {
  try {
    const csv = await adminReportsService.exportRegistrations(req.query);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="registrations.csv"');
    return res.status(200).send(csv);
  } catch (err) {
    logError('Error exporting registrations:', err);
    const statusCode = err.message === 'Tham số học kỳ không hợp lệ' ? 400 : 500;
    return sendResponse(res, statusCode, ApiResponse.error(err.message || 'Lỗi xuất đăng ký', statusCode));
  }
});

module.exports = router;

