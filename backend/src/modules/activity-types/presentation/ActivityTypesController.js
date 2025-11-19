const { ApiResponse, sendResponse } = require('../../../core/http/response/apiResponse');
const { logError } = require('../../../core/logger');
const { AppError } = require('../../../core/errors/AppError');

/**
 * ActivityTypesController
 * Presentation layer - handles HTTP requests/responses only
 * Follows Single Responsibility Principle (SRP)
 */
class ActivityTypesController {
  constructor(useCases) {
    this.useCases = useCases;
  }

  async list(req, res) {
    try {
      const { page, limit, search } = req.query;
      const result = await this.useCases.list.execute({ page, limit, search });
      return sendResponse(res, 200, ApiResponse.success(result));
    } catch (error) {
      logError('List activity types error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy danh sách loại hoạt động'));
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const activityType = await this.useCases.getById.execute(id);
      return sendResponse(res, 200, ApiResponse.success(activityType));
    } catch (error) {
      logError('Get activity type error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy thông tin loại hoạt động'));
    }
  }

  async create(req, res) {
    try {
      const activityType = await this.useCases.create.execute(req.body, req.user.id);
      return sendResponse(res, 201, ApiResponse.success(activityType, 'Tạo loại hoạt động thành công'));
    } catch (error) {
      logError('Create activity type error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 400, ApiResponse.error('Lỗi khi tạo loại hoạt động'));
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const activityType = await this.useCases.update.execute(id, req.body, req.user.id);
      return sendResponse(res, 200, ApiResponse.success(activityType, 'Cập nhật loại hoạt động thành công'));
    } catch (error) {
      logError('Update activity type error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 400, ApiResponse.error('Lỗi khi cập nhật loại hoạt động'));
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await this.useCases.delete.execute(id, req.user.id);
      return sendResponse(res, 200, ApiResponse.success(null, 'Xóa loại hoạt động thành công'));
    } catch (error) {
      logError('Delete activity type error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 400, ApiResponse.error('Lỗi khi xóa loại hoạt động'));
    }
  }

  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return sendResponse(res, 400, ApiResponse.error('Không có file ảnh được tải lên'));
      }

      const imagePath = `/uploads/images/${req.file.filename}`;
      return sendResponse(res, 200, ApiResponse.success({ path: imagePath }, 'Tải ảnh thành công'));
    } catch (error) {
      logError('Upload image error', error);
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi tải ảnh lên'));
    }
  }
}

module.exports = ActivityTypesController;

