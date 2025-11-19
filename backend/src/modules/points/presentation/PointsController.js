const { ApiResponse, sendResponse } = require('../../../core/http/response/apiResponse');
const { logError } = require('../../../core/logger');
const { AppError } = require('../../../core/errors/AppError');

/**
 * PointsController
 * Presentation layer - handles HTTP requests/responses only
 * Follows Single Responsibility Principle (SRP)
 */
class PointsController {
  constructor(useCases) {
    this.useCases = useCases;
  }

  _getUserId(req) {
    return (
      req.user?.sub ||
      req.user?.id ||
      req.user?.userId ||
      req.user?.uid ||
      null
    );
  }

  async getPointsSummary(req, res) {
    try {
      const userId = this._getUserId(req);
      if (!userId) {
        return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng', 401));
      }

      const { semester } = req.query;
      const filters = { semester };

      const result = await this.useCases.getPointsSummary.execute(userId, filters);
      return sendResponse(res, 200, ApiResponse.success(result));
    } catch (error) {
      logError('Error fetching student points summary:', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy thông tin điểm rèn luyện', 500));
    }
  }

  async getPointsDetail(req, res) {
    try {
      const userId = this._getUserId(req);
      if (!userId) {
        return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng', 401));
      }

      const { semester, page = 1, limit = 10 } = req.query;
      const filters = { semester };
      const pagination = { page, limit };

      const result = await this.useCases.getPointsDetail.execute(userId, filters, pagination);
      return sendResponse(res, 200, ApiResponse.success(result));
    } catch (error) {
      logError('Error fetching student points detail:', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy chi tiết điểm rèn luyện', 500));
    }
  }

  async getAttendanceHistory(req, res) {
    try {
      const userId = this._getUserId(req);
      if (!userId) {
        return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng', 401));
      }

      const { page = 1, limit = 10 } = req.query;
      const pagination = { page, limit };

      const result = await this.useCases.getAttendanceHistory.execute(userId, pagination);
      return sendResponse(res, 200, ApiResponse.success(result));
    } catch (error) {
      logError('Error fetching attendance history:', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy lịch sử điểm danh', 500));
    }
  }

  async getFilterOptions(req, res) {
    try {
      const userId = this._getUserId(req);
      if (!userId) {
        return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng', 401));
      }

      const result = await this.useCases.getFilterOptions.execute(userId);
      return sendResponse(res, 200, ApiResponse.success(result));
    } catch (error) {
      logError('Error getting filter options:', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy danh sách bộ lọc', 500));
    }
  }

  async getPointsReport(req, res) {
    try {
      const userId = this._getUserId(req);
      if (!userId) {
        return sendResponse(res, 401, ApiResponse.error('Không xác định được người dùng', 401));
      }

      const { nam_hoc } = req.query;
      const result = await this.useCases.getPointsReport.execute(userId, nam_hoc);
      return sendResponse(res, 200, ApiResponse.success(result));
    } catch (error) {
      logError('Error generating points report:', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi tạo báo cáo điểm rèn luyện', 500));
    }
  }
}

module.exports = PointsController;

