const { ApiResponse, sendResponse } = require('../../../core/http/response/apiResponse');
const { logError } = require('../../../core/logger');
const { AppError } = require('../../../core/errors/AppError');

/**
 * ExportsController
 * Presentation layer - handles HTTP requests/responses only
 * Follows Single Responsibility Principle (SRP)
 */
class ExportsController {
  constructor(useCases) {
    this.useCases = useCases;
  }

  async getOverview(req, res) {
    try {
      const { semester, hoc_ky, nam_hoc } = req.query || {};
      const data = await this.useCases.getOverview.execute({ semester, hoc_ky, nam_hoc });
      return sendResponse(res, 200, ApiResponse.success(data));
    } catch (error) {
      logError('Get overview error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi lấy báo cáo'));
    }
  }

  async exportActivities(req, res) {
    try {
      const { semester, hoc_ky, nam_hoc } = req.query || {};
      const csv = await this.useCases.exportActivities.execute({ semester, hoc_ky, nam_hoc });
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="activities.csv"');
      return res.status(200).send(csv);
    } catch (error) {
      logError('Export activities error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error(`Lỗi xuất hoạt động: ${error?.message || 'UNKNOWN'}`));
    }
  }

  async exportRegistrations(req, res) {
    try {
      const { semester, hoc_ky, nam_hoc } = req.query || {};
      const csv = await this.useCases.exportRegistrations.execute({ semester, hoc_ky, nam_hoc });
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="registrations.csv"');
      return res.status(200).send(csv);
    } catch (error) {
      logError('Export registrations error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error(`Lỗi xuất đăng ký: ${error?.message || 'UNKNOWN'}`));
    }
  }
}

module.exports = ExportsController;

