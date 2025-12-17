import type { Request, Response } from 'express';
import { ApiResponse, sendResponse } from '../../../../core/http/response/apiResponse';
import { logError } from '../../../../core/logger';
import { AppError } from '../../../../core/errors/AppError';
import type ListRolesUseCase from '../../business/services/ListRolesUseCase';
import type GetRoleByIdUseCase from '../../business/services/GetRoleByIdUseCase';
import type CreateRoleUseCase from '../../business/services/CreateRoleUseCase';
import type UpdateRoleUseCase from '../../business/services/UpdateRoleUseCase';
import type DeleteRoleUseCase from '../../business/services/DeleteRoleUseCase';
import type AssignRoleToUsersUseCase from '../../business/services/AssignRoleToUsersUseCase';

/**
 * AuthenticatedRequest interface for requests with user context
 */
export interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    username?: string;
    role?: string;
    permissions?: string[];
  };
}

interface AppErrorWithUsersCount extends AppError {
  usersCount?: number;
}

export interface RolesUseCases {
  list: ListRolesUseCase;
  getById: GetRoleByIdUseCase;
  create: CreateRoleUseCase;
  update: UpdateRoleUseCase;
  delete: DeleteRoleUseCase;
  assignToUsers: AssignRoleToUsersUseCase;
}

/**
 * RolesController
 * Presentation layer - handles HTTP requests/responses only
 * Follows Single Responsibility Principle (SRP)
 */
class RolesController {
  private useCases: RolesUseCases;

  constructor(useCases: RolesUseCases) {
    this.useCases = useCases;
  }

  async list(req: Request, res: Response): Promise<Response> {
    try {
      const { page, limit, search } = req.query as { page?: string; limit?: string; search?: string };
      const result = await this.useCases.list.execute({ page, limit, search });
      return sendResponse(res, 200, ApiResponse.success(result));
    } catch (error) {
      logError('List roles error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi lấy danh sách vai trò'));
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const role = await this.useCases.getById.execute(id);
      return sendResponse(res, 200, ApiResponse.success(role));
    } catch (error) {
      logError('Get role error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi lấy vai trò'));
    }
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const adminId = req.user.sub;
      const role = await this.useCases.create.execute(req.body, adminId);
      return sendResponse(res, 201, ApiResponse.success(role, 'Tạo vai trò thành công'));
    } catch (error) {
      logError('Create role error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi tạo vai trò'));
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const role = await this.useCases.update.execute(id, req.body);
      return sendResponse(res, 200, ApiResponse.success(role, 'Cập nhật vai trò thành công'));
    } catch (error) {
      logError('Update role error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi cập nhật vai trò: ' + (error as Error).message));
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { reassignTo, cascadeUsers } = (req.query || {}) as { reassignTo?: string; cascadeUsers?: string };
      
      await this.useCases.delete.execute(id, { reassignTo, cascadeUsers });
      return sendResponse(res, 200, ApiResponse.success(null, 'Xóa vai trò thành công'));
    } catch (error) {
      logError('Delete role error', error);
      if (error instanceof AppError) {
        const appError = error as AppErrorWithUsersCount;
        if (appError.usersCount) {
          return sendResponse(res, 409, ApiResponse.error(
            `Không thể xóa vai trò do còn ${appError.usersCount} người dùng đang sử dụng. ` +
            `Vui lòng gán sang vai trò khác trước (reassignTo) hoặc gọi lại với ?cascadeUsers=true để xóa cả người dùng.`
          ));
        }
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi xóa vai trò'));
    }
  }

  async assignToUsers(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { user_ids } = req.body as { user_ids: string[] };
      const adminId = req.user.sub;
      
      const result = await this.useCases.assignToUsers.execute(id, user_ids, adminId);
      return sendResponse(res, 200, ApiResponse.success(result, `Đã gán vai trò cho ${result.count} người dùng`));
    } catch (error) {
      logError('Assign role error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi gán vai trò'));
    }
  }

  async removeFromUser(_req: Request, res: Response): Promise<Response> {
    try {
      // Don't allow removing role from user - they must have a role
      return sendResponse(res, 400, ApiResponse.error(
        'Không thể xóa vai trò khỏi người dùng. Hãy gán vai trò khác thay thế.'
      ));
    } catch (error) {
      logError('Remove role error', error);
      return sendResponse(res, 500, ApiResponse.error('Lỗi xóa vai trò'));
    }
  }
}

export default RolesController;
module.exports = RolesController;
