import type { Request, Response } from 'express';
import {
  ApproveActivityUseCase,
  CancelActivityRegistrationUseCase,
  CreateActivityUseCase,
  DeleteActivityUseCase,
  GetActivitiesUseCase,
  GetActivityByIdUseCase,
  GetActivityDetailsUseCase,
  GetActivityQRDataUseCase,
  RegisterActivityUseCase,
  RejectActivityUseCase,
  ScanAttendanceUseCase,
  UpdateActivityUseCase,
  CreateAttendanceFallbackRequestUseCase,
  ListAttendanceFallbackRequestsUseCase,
  ApproveAttendanceFallbackRequestUseCase,
  RejectAttendanceFallbackRequestUseCase,
  CancelAttendanceFallbackRequestUseCase,
} from '../../business/services';

import GetActivitiesDto from '../../business/dto/GetActivitiesDto';
import CreateActivityDto from '../../business/dto/CreateActivityDto';
import UpdateActivityDto from '../../business/dto/UpdateActivityDto';
import { ApiResponse, sendResponse } from '../../../../core/http/response/apiResponse';
import { qrAttendanceTokenService } from '../../../../business/services/qr-attendance-token.service';
import { logError } from '../../../../core/logger';
import { logAudit } from '../../../../core/logger/audit';
import { AppError } from '../../../../core/errors/AppError';

/**
 * Semester context from middleware
 */
interface SemesterContext {
  hoc_ky: string;
  nam_hoc: string;
  key: string;
}

/**
 * Authenticated request with user info and semester
 */
interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    id?: string;
    role: string;
  };
  scope?: Record<string, unknown>;
  semester?: SemesterContext;
}

/**
 * Use cases interface for dependency injection
 */
interface ActivitiesUseCases {
  getAll: GetActivitiesUseCase;
  getById: GetActivityByIdUseCase;
  getDetails: GetActivityDetailsUseCase;
  create: CreateActivityUseCase;
  update: UpdateActivityUseCase;
  delete: DeleteActivityUseCase;
  approve: ApproveActivityUseCase;
  reject: RejectActivityUseCase;
  register: RegisterActivityUseCase;
  cancelRegistration: CancelActivityRegistrationUseCase;
  getQRData: GetActivityQRDataUseCase;
  scanAttendance: ScanAttendanceUseCase;
  createFallbackRequest: CreateAttendanceFallbackRequestUseCase;
  listFallbackRequests: ListAttendanceFallbackRequestsUseCase;
  approveFallbackRequest: ApproveAttendanceFallbackRequestUseCase;
  rejectFallbackRequest: RejectAttendanceFallbackRequestUseCase;
  cancelFallbackRequest: CancelAttendanceFallbackRequestUseCase;
}

/**
 * ActivitiesController
 * Presentation layer - handles HTTP requests/responses only
 * Follows Single Responsibility Principle (SRP)
 */
class ActivitiesController {
  private useCases: ActivitiesUseCases;

  constructor(useCases: ActivitiesUseCases) {
    this.useCases = useCases;
  }

  async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const dto = GetActivitiesDto.fromQuery(req.query, req.scope);
      const result = await this.useCases.getAll.execute(dto, req.user);
      sendResponse(res, 200, ApiResponse.success(result, 'Danh sách hoạt động'));
    } catch (error) {
      logError('Get activities error', error);
      sendResponse(res, 500, ApiResponse.error('Không lấy được danh sách hoạt động'));
    }
  }

  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const scope = req.scope || {};
      const activity = await this.useCases.getById.execute(id, scope, req.user, req.semester);

      sendResponse(res, 200, ApiResponse.success(activity, 'Chi tiết hoạt động'));
    } catch (error) {
      logError('Get activity by ID error', error);

      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message));
        return;
      }

      sendResponse(res, 500, ApiResponse.error('Không lấy được thông tin hoạt động'));
    }
  }

  async getDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.useCases.getDetails.execute(id, req.user);
      sendResponse(res, 200, ApiResponse.success(result, 'Chi tiết hoạt động'));
    } catch (error) {
      logError('Get activity details error', error);
      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message));
        return;
      }
      sendResponse(res, 500, ApiResponse.error('Không lấy được chi tiết hoạt động'));
    }
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const dto = CreateActivityDto.fromRequest(req.body);
      const result = await this.useCases.create.execute(dto, req.user);
      logAudit('create_activity', req, { module: 'activities', entityId: result?.id, entityType: 'HoatDong' });
      sendResponse(res, 201, ApiResponse.success(result, 'Tạo hoạt động thành công'));
    } catch (error) {
      logError('Create activity error', error);

      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message, error.statusCode, error.details));
        return;
      }

      sendResponse(res, 500, ApiResponse.error('Không tạo được hoạt động'));
    }
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dto = UpdateActivityDto.fromRequest(req.body);
      const scope = req.scope || {};
      const result = await this.useCases.update.execute(id, dto, req.user, scope, req.semester);
      logAudit('update_activity', req, { module: 'activities', entityId: id, entityType: 'HoatDong' });

      sendResponse(res, 200, ApiResponse.success(result, 'Cập nhật hoạt động thành công'));
    } catch (error) {
      logError('Update activity error', error);

      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message));
        return;
      }

      sendResponse(res, 500, ApiResponse.error('Không cập nhật được hoạt động'));
    }
  }

  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const scope = req.scope || {};
      await this.useCases.delete.execute(id, req.user, scope, req.semester);
      logAudit('delete_activity', req, { module: 'activities', entityId: id, entityType: 'HoatDong' });

      sendResponse(res, 200, ApiResponse.success(null, 'Xóa hoạt động thành công'));
    } catch (error) {
      logError('Delete activity error', error);

      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message));
        return;
      }

      sendResponse(res, 500, ApiResponse.error('Không xóa được hoạt động'));
    }
  }

  async approve(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.useCases.approve.execute(id, req.semester);
      logAudit('approve_activity', req, { module: 'activities', entityId: id, entityType: 'HoatDong' });
      sendResponse(res, 200, ApiResponse.success(result, 'Duyệt hoạt động thành công'));
    } catch (error) {
      logError('Approve activity error', error);

      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message));
        return;
      }

      sendResponse(res, 500, ApiResponse.error('Không duyệt được hoạt động'));
    }
  }

  async reject(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const result = await this.useCases.reject.execute(id, reason, req.semester);
      logAudit('reject_activity', req, { module: 'activities', entityId: id, entityType: 'HoatDong', reason });
      sendResponse(res, 200, ApiResponse.success(result, 'Từ chối hoạt động thành công'));
    } catch (error) {
      logError('Reject activity error', error);

      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message));
        return;
      }

      sendResponse(res, 500, ApiResponse.error('Không từ chối được hoạt động'));
    }
  }

  async register(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.useCases.register.execute(id, req.user);
      sendResponse(res, 201, ApiResponse.success(result, 'Đăng ký hoạt động thành công'));
    } catch (error) {
      logError('Register activity error', error);
      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message));
        return;
      }
      sendResponse(res, 500, ApiResponse.error('Không đăng ký được hoạt động'));
    }
  }

  async cancelRegistration(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.useCases.cancelRegistration.execute(id, req.user);
      sendResponse(res, 200, ApiResponse.success(result, 'Hủy đăng ký thành công'));
    } catch (error) {
      logError('Cancel registration error', error);
      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message));
        return;
      }
      sendResponse(res, 500, ApiResponse.error('Không hủy được đăng ký'));
    }
  }

  async getQRData(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const scope = req.scope || {};

      const qrData = await this.useCases.getQRData.execute(id, scope, req.user, req.semester);

      sendResponse(res, 200, ApiResponse.success(qrData, 'Mã QR hoạt động'));
    } catch (error) {
      logError('Get QR data error', error);
      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message));
        return;
      }
      sendResponse(res, 500, ApiResponse.error('Không lấy được mã QR'));
    }
  }

  async createAttendanceSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.sub || req.user?.id;
      if (!userId) {
        sendResponse(res, 401, ApiResponse.error('Chưa đăng nhập'));
        return;
      }

      const session = await qrAttendanceTokenService.createSession(id, userId, req.body?.ttlMinutes, {
        actorId: userId,
        ip: req.headers['x-forwarded-for']?.toString() || req.ip,
        userAgent: req.get('user-agent') || null
      });
      sendResponse(res, 201, ApiResponse.success(session, 'Tạo phiên QR thành công'));
    } catch (error) {
      logError('Create QR attendance session error', error);
      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message));
        return;
      }
      sendResponse(res, 500, ApiResponse.error('Không tạo được phiên QR'));
    }
  }

  async getCurrentAttendanceSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const session = await qrAttendanceTokenService.getCurrentSession(id);
      sendResponse(res, 200, ApiResponse.success(session, 'Phiên QR hiện tại'));
    } catch (error) {
      logError('Get current QR attendance session error', error);
      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message));
        return;
      }
      sendResponse(res, 500, ApiResponse.error('Không lấy được phiên QR'));
    }
  }

  async createAttendanceSessionToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id, sessionId } = req.params;
      const userId = req.user?.sub || req.user?.id;
      const token = await qrAttendanceTokenService.generateToken(id, sessionId, req.body?.ttlSeconds, {
        actorId: userId || null,
        ip: req.headers['x-forwarded-for']?.toString() || req.ip,
        userAgent: req.get('user-agent') || null
      });
      sendResponse(res, 201, ApiResponse.success(token, 'Tạo mã QR động thành công'));
    } catch (error) {
      logError('Create QR attendance token error', error);
      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message));
        return;
      }
      sendResponse(res, 500, ApiResponse.error('Không tạo được mã QR động'));
    }
  }

  async closeAttendanceSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id, sessionId } = req.params;
      const userId = req.user?.sub || req.user?.id;
      if (!userId) {
        sendResponse(res, 401, ApiResponse.error('Chưa đăng nhập'));
        return;
      }

      const session = await qrAttendanceTokenService.closeSession(id, sessionId, userId);
      sendResponse(res, 200, ApiResponse.success(session, 'Đóng phiên QR thành công'));
    } catch (error) {
      logError('Close QR attendance session error', error);
      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message));
        return;
      }
      sendResponse(res, 500, ApiResponse.error('Không đóng được phiên QR'));
    }
  }

  async scanAttendance(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { token, sessionId, location } = req.body || {};
      const scope = req.scope || {};

      const userId = req.user?.sub || req.user?.id;
      const result = await this.useCases.scanAttendance.execute(id, { token, sessionId, location }, scope, req.user, req.semester, {
        actorId: userId || null,
        ip: req.headers['x-forwarded-for']?.toString() || req.ip,
        userAgent: req.get('user-agent') || null
      });

      sendResponse(res, 201, ApiResponse.success(result, 'Điểm danh thành công'));
    } catch (error) {
      logError('QR scan attendance error', error);
      if (error instanceof AppError) {
        const statusCode = error.statusCode || 500;
        sendResponse(res, statusCode, ApiResponse.error(error.message, statusCode, error.details));
        return;
      }
      sendResponse(res, 500, ApiResponse.error('Không thể điểm danh'));
    }
  }

  async createFallbackRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.useCases.createFallbackRequest.execute(id, {
        ...req.body,
        ip: req.headers['x-forwarded-for']?.toString() || req.ip,
        userAgent: req.get('user-agent') || null
      }, req.user);
      sendResponse(res, 201, ApiResponse.success(result, 'Gửi yêu cầu điểm danh thủ công thành công'));
    } catch (error) {
      logError('Create attendance fallback request error', error);
      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message, error.statusCode, error.details));
        return;
      }
      sendResponse(res, 500, ApiResponse.error('Không gửi được yêu cầu điểm danh thủ công'));
    }
  }

  async listFallbackRequests(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.useCases.listFallbackRequests.listByActivity(id);
      sendResponse(res, 200, ApiResponse.success(result, 'Danh sách yêu cầu điểm danh thủ công'));
    } catch (error) {
      logError('List attendance fallback requests error', error);
      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message, error.statusCode, error.details));
        return;
      }
      sendResponse(res, 500, ApiResponse.error('Không lấy được danh sách yêu cầu điểm danh thủ công'));
    }
  }

  async listMyFallbackRequests(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await this.useCases.listFallbackRequests.listMine(req.user);
      sendResponse(res, 200, ApiResponse.success(result, 'Danh sách yêu cầu điểm danh thủ công của bạn'));
    } catch (error) {
      logError('List my attendance fallback requests error', error);
      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message, error.statusCode, error.details));
        return;
      }
      sendResponse(res, 500, ApiResponse.error('Không lấy được yêu cầu điểm danh thủ công của bạn'));
    }
  }

  async approveFallbackRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { requestId } = req.params;
      const result = await this.useCases.approveFallbackRequest.execute(requestId, req.body?.ghi_chu_duyet || req.body?.note, req.user, {
        ip: req.headers['x-forwarded-for']?.toString() || req.ip,
        userAgent: req.get('user-agent') || null
      });
      sendResponse(res, 200, ApiResponse.success(result, 'Duyệt yêu cầu điểm danh thủ công thành công'));
    } catch (error) {
      logError('Approve attendance fallback request error', error);
      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message, error.statusCode, error.details));
        return;
      }
      sendResponse(res, 500, ApiResponse.error('Không duyệt được yêu cầu điểm danh thủ công'));
    }
  }

  async rejectFallbackRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { requestId } = req.params;
      const result = await this.useCases.rejectFallbackRequest.execute(requestId, req.body?.ghi_chu_duyet || req.body?.note, req.user, {
        ip: req.headers['x-forwarded-for']?.toString() || req.ip,
        userAgent: req.get('user-agent') || null
      });
      sendResponse(res, 200, ApiResponse.success(result, 'Từ chối yêu cầu điểm danh thủ công thành công'));
    } catch (error) {
      logError('Reject attendance fallback request error', error);
      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message, error.statusCode, error.details));
        return;
      }
      sendResponse(res, 500, ApiResponse.error('Không từ chối được yêu cầu điểm danh thủ công'));
    }
  }

  async cancelFallbackRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { requestId } = req.params;
      const result = await this.useCases.cancelFallbackRequest.execute(requestId, req.user, {
        ip: req.headers['x-forwarded-for']?.toString() || req.ip,
        userAgent: req.get('user-agent') || null
      });
      sendResponse(res, 200, ApiResponse.success(result, 'Hủy yêu cầu điểm danh thủ công thành công'));
    } catch (error) {
      logError('Cancel attendance fallback request error', error);
      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message, error.statusCode, error.details));
        return;
      }
      sendResponse(res, 500, ApiResponse.error('Không hủy được yêu cầu điểm danh thủ công'));
    }
  }
}

export default ActivitiesController;
module.exports = ActivitiesController;
