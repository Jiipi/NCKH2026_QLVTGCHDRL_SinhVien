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
} from '../../business/services';

import GetActivitiesDto from '../../business/dto/GetActivitiesDto';
import CreateActivityDto from '../../business/dto/CreateActivityDto';
import UpdateActivityDto from '../../business/dto/UpdateActivityDto';
import { ApiResponse, sendResponse } from '../../../../core/http/response/apiResponse';
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
        sendResponse(res, error.statusCode, ApiResponse.error(error.message, error.details));
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

  async scanAttendance(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { token } = req.body || {};
      const scope = req.scope || {};

      const result = await this.useCases.scanAttendance.execute(id, token, scope, req.user, req.semester);

      sendResponse(res, 201, ApiResponse.success(result, 'Điểm danh thành công'));
    } catch (error) {
      logError('QR scan attendance error', error);
      if (error instanceof AppError) {
        const statusCode = error.statusCode || 500;
        sendResponse(res, statusCode, ApiResponse.error(error.message));
        return;
      }
      sendResponse(res, 500, ApiResponse.error('Không thể điểm danh'));
    }
  }
}

export default ActivitiesController;
module.exports = ActivitiesController;
