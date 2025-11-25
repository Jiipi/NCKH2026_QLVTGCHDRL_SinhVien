const GetActivitiesDto = require('../../business/dto/GetActivitiesDto');
const CreateActivityDto = require('../../business/dto/CreateActivityDto');
const { ApiResponse, sendResponse } = require('../../../../core/http/response/apiResponse');
const { logError } = require('../../../../core/logger');
const { AppError } = require('../../../../core/errors/AppError');

/**
 * ActivitiesController
 * Presentation layer - handles HTTP requests/responses only
 * Follows Single Responsibility Principle (SRP)
 */
class ActivitiesController {
  constructor(useCases) {
    this.useCases = useCases;
  }

  async getAll(req, res) {
    try {
      const dto = GetActivitiesDto.fromQuery(req.query, req.scope);
      const result = await this.useCases.getAll.execute(dto, req.user);
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
      const activity = await this.useCases.getById.execute(id, scope, req.user);

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
      const result = await this.useCases.getDetails.execute(id, req.user);
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
      const result = await this.useCases.create.execute(dto, req.user);
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
      const result = await this.useCases.update.execute(id, dto, req.user, scope);

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
      await this.useCases.delete.execute(id, req.user, scope);

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
      const result = await this.useCases.approve.execute(id);
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
      const result = await this.useCases.reject.execute(id, reason);
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
      const result = await this.useCases.register.execute(id, req.user);
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
      const result = await this.useCases.cancelRegistration.execute(id, req.user);
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
    console.log('[GetQRData Controller] ====== START ======');
    console.log('[GetQRData Controller] Request received');
    try {
      const { id } = req.params;
      const scope = req.scope || {};
      
      // Debug logging
      console.log('[GetQRData Controller] Activity ID:', id);
      console.log('[GetQRData Controller] User:', req.user?.sub);
      console.log('[GetQRData Controller] Scope:', scope);
      
      const qrData = await this.useCases.getQRData.execute(id, scope, req.user);
      
      console.log('[GetQRData Controller] QR Data:', {
        activity_id: qrData?.activity_id,
        qr_token: qrData?.qr_token ? '***' + qrData.qr_token.slice(-4) : 'null'
      });
      
      console.log('[GetQRData Controller] ====== SUCCESS ======');
      return sendResponse(res, 200, ApiResponse.success(qrData, 'Mã QR hoạt động'));
    } catch (error) {
      console.error('[GetQRData Controller] ====== ERROR ======');
      console.error('[GetQRData Controller] Error:', error.message);
      console.error('[GetQRData Controller] Stack:', error.stack);
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
      
      // Debug logging
      console.log('[ScanAttendance Controller] Activity ID:', id);
      console.log('[ScanAttendance Controller] Token from body:', token);
      console.log('[ScanAttendance Controller] User:', req.user?.sub);
      
      const result = await this.useCases.scanAttendance.execute(id, token, scope, req.user);
      
      return sendResponse(res, 201, ApiResponse.success(result, 'Điểm danh thành công'));
    } catch (error) {
      console.error('[ScanAttendance Controller] Error:', error.message);
      console.error('[ScanAttendance Controller] Stack:', error.stack);
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

