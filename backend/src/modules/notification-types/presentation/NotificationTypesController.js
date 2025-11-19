const { ApiResponse, sendResponse } = require('../../../core/http/response/apiResponse');
const { logError } = require('../../../core/logger');
const { AppError } = require('../../../core/errors/AppError');

/**
 * NotificationTypesController
 * Presentation layer - handles HTTP requests/responses only
 * Follows Single Responsibility Principle (SRP)
 */
class NotificationTypesController {
  constructor(useCases) {
    this.useCases = useCases;
  }

  async list(req, res) {
    try {
      const types = await this.useCases.list.execute();
      return sendResponse(res, 200, ApiResponse.success(types));
    } catch (error) {
      logError('List notification types error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi lấy loại thông báo'));
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const type = await this.useCases.getById.execute(id);
      return sendResponse(res, 200, ApiResponse.success(type));
    } catch (error) {
      logError('Get notification type error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi lấy chi tiết loại thông báo'));
    }
  }

  async create(req, res) {
    try {
      const type = await this.useCases.create.execute(req.body);
      return sendResponse(res, 201, ApiResponse.success(type, 'Tạo loại thông báo thành công'));
    } catch (error) {
      logError('Create notification type error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi tạo loại thông báo'));
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const type = await this.useCases.update.execute(id, req.body);
      return sendResponse(res, 200, ApiResponse.success(type, 'Cập nhật loại thông báo thành công'));
    } catch (error) {
      logError('Update notification type error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi cập nhật loại thông báo'));
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await this.useCases.delete.execute(id);
      return sendResponse(res, 200, ApiResponse.success(null, 'Xóa loại thông báo thành công'));
    } catch (error) {
      logError('Delete notification type error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi xóa loại thông báo'));
    }
  }
}

module.exports = NotificationTypesController;

