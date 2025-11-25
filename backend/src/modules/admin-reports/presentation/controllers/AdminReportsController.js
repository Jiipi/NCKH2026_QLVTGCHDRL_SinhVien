const { ApiResponse, sendResponse } = require('../../../../core/http/response/apiResponse');
const { logError } = require('../../../../core/logger');

class AdminReportsController {
  constructor(useCases) {
    this.useCases = useCases;
  }

  async getUserPointsReport(req, res) {
    try {
      const { id } = req.params;
      const data = await this.useCases.getUserPointsReport.execute(id, req.query);
      return sendResponse(res, 200, ApiResponse.success(data, 'Lấy điểm rèn luyện thành công'));
    } catch (err) {
      logError('Error fetching user points report:', err);
      const statusCode = err.statusCode || (err.message === 'Không tìm thấy người dùng' ? 404 : 500);
      return sendResponse(res, statusCode, ApiResponse.error(err.message || 'Lỗi lấy điểm rèn luyện', statusCode));
    }
  }

  async getAttendanceReport(req, res) {
    try {
      const data = await this.useCases.getAttendanceReport.execute(req.query);
      return sendResponse(res, 200, ApiResponse.success(data, 'Lấy danh sách điểm danh thành công'));
    } catch (err) {
      logError('Error fetching attendance report:', err);
      return sendResponse(res, 500, ApiResponse.error('Lỗi lấy danh sách điểm danh', 500));
    }
  }

  async getClassesList(req, res) {
    try {
      const data = await this.useCases.getClassesList.execute();
      return sendResponse(res, 200, ApiResponse.success(data, 'Lấy danh sách lớp thành công'));
    } catch (err) {
      logError('Error fetching classes list:', err);
      return sendResponse(res, 500, ApiResponse.error('Lỗi lấy danh sách lớp', 500));
    }
  }

  async getOverview(req, res) {
    try {
      const data = await this.useCases.getOverview.execute(req.query);
      return sendResponse(res, 200, ApiResponse.success(data, 'Lấy báo cáo tổng quan thành công'));
    } catch (err) {
      logError('Error fetching overview:', err);
      const statusCode = err.statusCode || (err.message === 'Tham số học kỳ không hợp lệ' ? 400 : 500);
      return sendResponse(res, statusCode, ApiResponse.error(err.message || 'Lỗi lấy báo cáo', statusCode));
    }
  }

  async exportActivities(req, res) {
    try {
      const csv = await this.useCases.exportActivities.execute(req.query);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="activities.csv"');
      return res.status(200).send(csv);
    } catch (err) {
      logError('Error exporting activities:', err);
      const statusCode = err.statusCode || (err.message === 'Tham số học kỳ không hợp lệ' ? 400 : 500);
      return sendResponse(res, statusCode, ApiResponse.error(err.message || 'Lỗi xuất hoạt động', statusCode));
    }
  }

  async exportRegistrations(req, res) {
    try {
      const csv = await this.useCases.exportRegistrations.execute(req.query);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="registrations.csv"');
      return res.status(200).send(csv);
    } catch (err) {
      logError('Error exporting registrations:', err);
      const statusCode = err.statusCode || (err.message === 'Tham số học kỳ không hợp lệ' ? 400 : 500);
      return sendResponse(res, statusCode, ApiResponse.error(err.message || 'Lỗi xuất đăng ký', statusCode));
    }
  }
}

module.exports = AdminReportsController;

