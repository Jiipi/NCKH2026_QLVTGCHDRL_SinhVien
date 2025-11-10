const { Router } = require('express');
const dashboardService = require('./dashboard.service');
const { ApiResponse, sendResponse } = require('../../utils/response');
const { logError } = require('../../utils/logger');
const { auth } = require('../../middlewares/auth');

const router = Router();

// All dashboard routes require authentication
router.use(auth);

/**
 * GET /api/v2/dashboard/student
 * Get student dashboard data with points summary and activities
 * Query params: semester (optional) - format: hoc_ky_1-2024 or hoc_ky_2-2024
 */
router.get('/student', async (req, res) => {
  try {
    const userId = req.user.sub;
    const data = await dashboardService.getStudentDashboard(userId, req.query);
    return sendResponse(res, 200, ApiResponse.success(data, 'Dữ liệu dashboard sinh viên'));
  } catch (err) {
    logError('Error fetching student dashboard:', err);
    return sendResponse(res, 500, ApiResponse.error(err.message || 'Lỗi khi lấy dữ liệu dashboard', 500));
  }
});

/**
 * GET /api/v2/dashboard/activity-stats
 * Get activity statistics by time range (for admin/teacher)
 * Query params: timeRange (optional) - values: 7d, 30d, 90d (default: 30d)
 */
router.get('/activity-stats', async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    const data = await dashboardService.getActivityStats(timeRange);
    return sendResponse(res, 200, ApiResponse.success(data, 'Thống kê hoạt động'));
  } catch (err) {
    logError('Error fetching activity stats:', err);
    return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy thống kê hoạt động', 500));
  }
});

/**
 * GET /api/v2/dashboard/admin
 * Get admin dashboard statistics (Admin only)
 * Returns system-wide overview: total users, activities, registrations, pending approvals
 */
router.get('/admin', async (req, res) => {
  try {
    const data = await dashboardService.getAdminDashboard();
    return sendResponse(res, 200, ApiResponse.success(data, 'Lấy dashboard thành công'));
  } catch (err) {
    logError('Error fetching admin dashboard:', err);
    return sendResponse(res, 500, ApiResponse.error('Lỗi lấy dữ liệu dashboard', 500));
  }
});

/**
 * GET /api/v2/dashboard/activities/me
 * Get my registered activities (ALL, not just recent 5)
 * Query params: semester (optional)
 */
router.get('/activities/me', async (req, res) => {
  try {
    const userId = req.user.sub;
    const { semester, hoc_ky, nam_hoc } = req.query;
    
    // Get FULL activity list (not just dashboard's top 5)
    const myActivities = await dashboardService.getMyActivities(userId, { semester, hoc_ky, nam_hoc });
    
    return sendResponse(res, 200, ApiResponse.success(myActivities, 'Danh sách hoạt động của tôi'));
  } catch (err) {
    logError('Error fetching my activities:', err);
    return sendResponse(res, 500, ApiResponse.error('Lỗi lấy danh sách hoạt động', 500));
  }
});

/**
 * GET /api/v2/dashboard/scores/detailed
 * Get detailed score breakdown by criteria
 * Query params: semester, year
 */
router.get('/scores/detailed', async (req, res) => {
  try {
    const userId = req.user.sub;
    const { semester, year, hoc_ky, nam_hoc } = req.query;
    
    // Get full dashboard data
    const data = await dashboardService.getStudentDashboard(userId, { semester, year, hoc_ky, nam_hoc });
    
    const result = {
      student_info: data.sinh_vien || {},
      summary: data.tong_quan || {},
      criteria_breakdown: data.tien_do_tieu_chi || [],
      activities: data.hoat_dong_gan_day || [],
      class_rankings: data.so_sanh_lop || {}
    };
    
    return sendResponse(res, 200, ApiResponse.success(result, 'Chi tiết điểm rèn luyện'));
  } catch (err) {
    logError('Error fetching detailed scores:', err);
    return sendResponse(res, 500, ApiResponse.error('Lỗi lấy chi tiết điểm', 500));
  }
});

module.exports = router;
