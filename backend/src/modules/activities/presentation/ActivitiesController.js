const GetActivitiesDto = require('../application/dto/GetActivitiesDto');
const CreateActivityDto = require('../application/dto/CreateActivityDto');
const { ApiResponse, sendResponse } = require('../../../core/http/response/apiResponse');
const { logError } = require('../../../core/logger');
const { AppError } = require('../../../core/errors/AppError');

/**
 * ActivitiesController
 * Presentation layer - handles HTTP requests/responses only
 * Follows Single Responsibility Principle (SRP)
 */
class ActivitiesController {
  constructor(
    getActivitiesUseCase,
    getActivityByIdUseCase,
    createActivityUseCase,
    updateActivityUseCase,
    deleteActivityUseCase,
    approveActivityUseCase,
    rejectActivityUseCase,
    getActivityDetailsUseCase,
    registerActivityUseCase,
    cancelActivityRegistrationUseCase,
    getActivityQRDataUseCase,
    scanAttendanceUseCase
  ) {
    this.getActivitiesUseCase = getActivitiesUseCase;
    this.getActivityByIdUseCase = getActivityByIdUseCase;
    this.createActivityUseCase = createActivityUseCase;
    this.updateActivityUseCase = updateActivityUseCase;
    this.deleteActivityUseCase = deleteActivityUseCase;
    this.approveActivityUseCase = approveActivityUseCase;
    this.rejectActivityUseCase = rejectActivityUseCase;
    this.getActivityDetailsUseCase = getActivityDetailsUseCase;
    this.registerActivityUseCase = registerActivityUseCase;
    this.cancelActivityRegistrationUseCase = cancelActivityRegistrationUseCase;
    this.getActivityQRDataUseCase = getActivityQRDataUseCase;
    this.scanAttendanceUseCase = scanAttendanceUseCase;
  }

  async getAll(req, res) {
    try {
      const dto = GetActivitiesDto.fromQuery(req.query, req.scope);
      const result = await this.getActivitiesUseCase.execute(dto, req.user);
      return sendResponse(res, 200, ApiResponse.success(result, 'Danh sách hoạt động'));
    } catch (error) {
      logError('Get activities error', error);
      return sendResponse(res, 500, ApiResponse.error('Không lấy được danh sách hoạt động'));
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const scope = req.scope || {};
      const activity = await this.getActivityByIdUseCase.execute(id, scope, req.user);

      return sendResponse(res, 200, ApiResponse.success(activity, 'Chi tiết hoạt động'));
    } catch (error) {
      logError('Get activity by ID error', error);

      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }

      return sendResponse(res, 500, ApiResponse.error('Không lấy được thông tin hoạt động'));
    }
  }

  async getDetails(req, res) {
    try {
      const { id } = req.params;
      const result = await this.getActivityDetailsUseCase.execute(id, req.user);
      return sendResponse(res, 200, ApiResponse.success(result, 'Chi tiết hoạt động'));
    } catch (error) {
      logError('Get activity details error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không lấy được chi tiết hoạt động'));
    }
  }

  async create(req, res) {
    try {
      const dto = CreateActivityDto.fromRequest(req.body);
      const result = await this.createActivityUseCase.execute(dto, req.user);
      return sendResponse(res, 201, ApiResponse.success(result, 'Tạo hoạt động thành công'));
    } catch (error) {
      logError('Create activity error', error);

      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message, error.details));
      }

      return sendResponse(res, 500, ApiResponse.error('Không tạo được hoạt động'));
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const dto = CreateActivityDto.fromRequest(req.body);
      const scope = req.scope || {};
      const result = await this.updateActivityUseCase.execute(id, dto, req.user, scope);

      return sendResponse(res, 200, ApiResponse.success(result, 'Cập nhật hoạt động thành công'));
    } catch (error) {
      logError('Update activity error', error);

      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }

      return sendResponse(res, 500, ApiResponse.error('Không cập nhật được hoạt động'));
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const scope = req.scope || {};
      await this.deleteActivityUseCase.execute(id, req.user, scope);

      return sendResponse(res, 200, ApiResponse.success(null, 'Xóa hoạt động thành công'));
    } catch (error) {
      logError('Delete activity error', error);

      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }

      return sendResponse(res, 500, ApiResponse.error('Không xóa được hoạt động'));
    }
  }

  async approve(req, res) {
    try {
      const { id } = req.params;
      const result = await this.approveActivityUseCase.execute(id);
      return sendResponse(res, 200, ApiResponse.success(result, 'Duyệt hoạt động thành công'));
    } catch (error) {
      logError('Approve activity error', error);

      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }

      return sendResponse(res, 500, ApiResponse.error('Không duyệt được hoạt động'));
    }
  }

  async reject(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const result = await this.rejectActivityUseCase.execute(id, reason);
      return sendResponse(res, 200, ApiResponse.success(result, 'Từ chối hoạt động thành công'));
    } catch (error) {
      logError('Reject activity error', error);

      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }

      return sendResponse(res, 500, ApiResponse.error('Không từ chối được hoạt động'));
    }
  }

  async register(req, res) {
    try {
      const { id } = req.params;
      const result = await this.registerActivityUseCase.execute(id, req.user);
      return sendResponse(res, 201, ApiResponse.success(result, 'Đăng ký hoạt động thành công'));
    } catch (error) {
      logError('Register activity error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không đăng ký được hoạt động'));
    }
  }

  async cancelRegistration(req, res) {
    try {
      const { id } = req.params;
      const result = await this.cancelActivityRegistrationUseCase.execute(id, req.user);
      return sendResponse(res, 200, ApiResponse.success(result, 'Hủy đăng ký thành công'));
    } catch (error) {
      logError('Cancel registration error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không hủy được đăng ký'));
    }
  }

  async getQRData(req, res) {
    try {
      const { id } = req.params;
      const scope = req.scope || {};
      const qrData = await this.getActivityQRDataUseCase.execute(id, scope, req.user);
      return sendResponse(res, 200, ApiResponse.success(qrData, 'Mã QR hoạt động'));
    } catch (error) {
      logError('Get QR data error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không lấy được mã QR'));
    }
  }

  async scanAttendance(req, res) {
    try {
      const { id } = req.params;
      const { token } = req.body || {};
      const scope = req.scope || {};
      
      const result = await this.scanAttendanceUseCase.execute(id, token, scope, req.user);
      
      return sendResponse(res, 201, ApiResponse.success(result, 'Điểm danh thành công'));
    } catch (error) {
      logError('QR scan attendance error', error);
      if (error instanceof AppError) {
        const statusCode = error.statusCode || 500;
        return sendResponse(res, statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không thể điểm danh'));
    }
  }
}

module.exports = ActivitiesController;

