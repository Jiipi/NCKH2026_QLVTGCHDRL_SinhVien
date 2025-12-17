import type { Request, Response } from 'express';
import { ApiResponse, sendResponse } from '../../../../core/http/response/apiResponse';
import { logError } from '../../../../core/logger';
import { AppError } from '../../../../core/errors/AppError';
import type CreateNotificationTypeUseCase from '../../business/services/CreateNotificationTypeUseCase';
import type DeleteNotificationTypeUseCase from '../../business/services/DeleteNotificationTypeUseCase';
import type GetNotificationTypeByIdUseCase from '../../business/services/GetNotificationTypeByIdUseCase';
import type ListNotificationTypesUseCase from '../../business/services/ListNotificationTypesUseCase';
import type UpdateNotificationTypeUseCase from '../../business/services/UpdateNotificationTypeUseCase';

/**
 * AuthenticatedRequest interface for requests with user authentication
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    role?: string;
    [key: string]: unknown;
  };
}

/**
 * Use cases interface for the controller
 */
export interface NotificationTypeUseCases {
  list: ListNotificationTypesUseCase;
  getById: GetNotificationTypeByIdUseCase;
  create: CreateNotificationTypeUseCase;
  update: UpdateNotificationTypeUseCase;
  delete: DeleteNotificationTypeUseCase;
}

/**
 * NotificationTypesController
 * Presentation layer - handles HTTP requests/responses only
 * Follows Single Responsibility Principle (SRP)
 */
class NotificationTypesController {
  private useCases: NotificationTypeUseCases;

  constructor(useCases: NotificationTypeUseCases) {
    this.useCases = useCases;
  }

  async list(req: AuthenticatedRequest, res: Response): Promise<Response> {
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

  async getById(req: AuthenticatedRequest, res: Response): Promise<Response> {
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

  async create(req: AuthenticatedRequest, res: Response): Promise<Response> {
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

  async update(req: AuthenticatedRequest, res: Response): Promise<Response> {
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

  async delete(req: AuthenticatedRequest, res: Response): Promise<Response> {
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

export default NotificationTypesController;
module.exports = NotificationTypesController;
