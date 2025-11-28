const { ApiResponse, sendResponse } = require('../../../../core/http/response/apiResponse');
const { logError } = require('../../../../core/logger');
const { AppError } = require('../../../../core/errors/AppError');

/**
 * DashboardController
 * Handles HTTP requests for dashboard module
 */
class DashboardController {
  constructor(useCases) {
    this.useCases = useCases;
  }

  async getStudentDashboard(req, res) {
    try {
      const userId = req.user.sub;
      const data = await this.useCases.getStudentDashboard.execute(userId, req.query);
      return sendResponse(res, 200, ApiResponse.success(data, 'Dữ liệu dashboard sinh viên'));
    } catch (error) {
      logError('Get student dashboard error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error(error.message || 'Lỗi khi lấy dữ liệu dashboard'));
    }
  }

  async getActivityStats(req, res) {
    try {
      const { timeRange = '30d' } = req.query;
      const data = await this.useCases.getActivityStats.execute(timeRange);
      return sendResponse(res, 200, ApiResponse.success(data, 'Thống kê hoạt động'));
    } catch (error) {
      logError('Get activity stats error', error);
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy thống kê hoạt động'));
    }
  }

  async getAdminDashboard(req, res) {
    try {
      const data = await this.useCases.getAdminDashboard.execute();
      return sendResponse(res, 200, ApiResponse.success(data, 'Lấy dashboard thành công'));
    } catch (error) {
      logError('Get admin dashboard error', error);
      return sendResponse(res, 500, ApiResponse.error('Lỗi lấy dữ liệu dashboard'));
    }
  }

  async getMyActivities(req, res) {
    try {
      const userId = req.user.sub;
      const { semester, semesterValue, hoc_ky, nam_hoc } = req.query;
      const semesterParam = semesterValue || semester;
      const myActivities = await this.useCases.getMyActivities.execute(userId, {
        semester: semesterParam,
        hoc_ky,
        nam_hoc
      });
      return sendResponse(res, 200, ApiResponse.success(myActivities, 'Danh sách hoạt động của tôi'));
    } catch (error) {
      logError('Get my activities error', error);
      return sendResponse(res, 500, ApiResponse.error('Lỗi lấy danh sách hoạt động'));
    }
  }

  async getDetailedScores(req, res) {
    try {
      const userId = req.user.sub;
      // Pass full query to ensure semester parsing is consistent with getStudentDashboard
      const data = await this.useCases.getDetailedScores.execute(userId, req.query);
      return sendResponse(res, 200, ApiResponse.success(data, 'Chi tiết điểm rèn luyện'));
    } catch (error) {
      logError('Get detailed scores error', error);
      return sendResponse(res, 500, ApiResponse.error('Lỗi lấy chi tiết điểm'));
    }
  }
}

module.exports = DashboardController;

