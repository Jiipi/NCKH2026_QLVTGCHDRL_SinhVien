const ListRegistrationsDto = require('../application/dto/ListRegistrationsDto');
const CreateRegistrationDto = require('../application/dto/CreateRegistrationDto');
const { ApiResponse, sendResponse } = require('../../../core/http/response/apiResponse');
const { logError } = require('../../../core/logger');
const { AppError } = require('../../../core/errors/AppError');

/**
 * RegistrationsController
 * Presentation layer - handles HTTP requests/responses only
 */
class RegistrationsController {
  constructor(useCases) {
    this.useCases = useCases;
  }

  async list(req, res) {
    try {
      const dto = ListRegistrationsDto.fromQuery(req.query);
      const result = await this.useCases.list.execute(dto, req.user);
      return sendResponse(
        res,
        200,
        ApiResponse.paginated(result.data, result.pagination.total, result.pagination.page, result.pagination.limit, 'Danh sách đăng ký')
      );
    } catch (error) {
      logError('List registrations error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không lấy được danh sách đăng ký'));
    }
  }

  async get(req, res) {
    try {
      const registration = await this.useCases.get.execute(req.params.id, req.user);
      return sendResponse(res, 200, ApiResponse.success(registration, 'Thông tin đăng ký'));
    } catch (error) {
      logError('Get registration error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không lấy được đăng ký'));
    }
  }

  async create(req, res) {
    try {
      const dto = CreateRegistrationDto.fromRequest(req.body, req.user);
      const registration = await this.useCases.create.execute(dto, req.user);
      return sendResponse(res, 201, ApiResponse.success(registration, 'Đăng ký thành công'));
    } catch (error) {
      logError('Create registration error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không thể tạo đăng ký'));
    }
  }

  async update(req, res) {
    try {
      const registration = await this.useCases.update.execute(req.params.id, req.body, req.user);
      return sendResponse(res, 200, ApiResponse.success(registration, 'Cập nhật đăng ký thành công'));
    } catch (error) {
      logError('Update registration error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không thể cập nhật đăng ký'));
    }
  }

  async delete(req, res) {
    try {
      await this.useCases.delete.execute(req.params.id, req.user);
      return sendResponse(res, 200, ApiResponse.success(null, 'Xóa đăng ký thành công'));
    } catch (error) {
      logError('Delete registration error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không thể xóa đăng ký'));
    }
  }

  async approve(req, res) {
    try {
      const registration = await this.useCases.approve.execute(req.params.id, req.user);
      return sendResponse(res, 200, ApiResponse.success(registration, 'Đã duyệt đăng ký'));
    } catch (error) {
      logError('Approve registration error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không thể duyệt đăng ký'));
    }
  }

  async reject(req, res) {
    try {
      const registration = await this.useCases.reject.execute(req.params.id, req.body.reason, req.user);
      return sendResponse(res, 200, ApiResponse.success(registration, 'Đã từ chối đăng ký'));
    } catch (error) {
      logError('Reject registration error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không thể từ chối đăng ký'));
    }
  }

  async cancel(req, res) {
    try {
      const result = await this.useCases.cancel.execute(req.params.id, req.user);
      return sendResponse(res, 200, ApiResponse.success(result, result?.message || 'Hủy đăng ký thành công'));
    } catch (error) {
      logError('Cancel registration error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không hủy được đăng ký'));
    }
  }

  async checkIn(req, res) {
    try {
      const registration = await this.useCases.checkIn.execute(req.params.id, req.user);
      return sendResponse(res, 200, ApiResponse.success(registration, 'Điểm danh thành công'));
    } catch (error) {
      logError('Check-in registration error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không thể điểm danh'));
    }
  }

  async bulkApprove(req, res) {
    try {
      const result = await this.useCases.bulkApprove.execute(req.body.ids, req.user);
      return sendResponse(res, 200, ApiResponse.success(result, 'Đã duyệt đăng ký'));
    } catch (error) {
      logError('Bulk approve registration error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không thể duyệt đăng ký'));
    }
  }

  async myRegistrations(req, res) {
    try {
      const filters = {};
      if (req.query.status) filters.status = req.query.status;
      const registrations = await this.useCases.my.execute(req.user, filters);
      return sendResponse(res, 200, ApiResponse.success(registrations, 'Danh sách đăng ký của bạn'));
    } catch (error) {
      logError('Get my registrations error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không lấy được danh sách đăng ký'));
    }
  }

  async activityStats(req, res) {
    try {
      const stats = await this.useCases.stats.execute(req.params.activityId, req.user);
      return sendResponse(res, 200, ApiResponse.success(stats, 'Thống kê đăng ký'));
    } catch (error) {
      logError('Get registration stats error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không lấy được thống kê'));
    }
  }
}

module.exports = RegistrationsController;

