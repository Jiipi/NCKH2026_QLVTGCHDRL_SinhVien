import type { Request, Response } from 'express';
import ListUsersDto from '../../business/dto/ListUsersDto';
import CreateUserDto from '../../business/dto/CreateUserDto';
import UpdateUserDto from '../../business/dto/UpdateUserDto';
import { ApiResponse, sendResponse } from '../../../../core/http/response/apiResponse';
import { logError } from '../../../../core/logger';
import { AppError } from '../../../../core/errors/AppError';

/**
 * Authenticated request interface with user information
 */
interface AuthenticatedRequest extends Request {
  user?: {
    sub?: string | number;
    id?: string | number;
    role?: string;
    [key: string]: unknown;
  };
}

/**
 * Use case interface
 */
interface UseCase<TDto, TResult> {
  execute(dto: TDto, user?: AuthenticatedRequest['user']): Promise<TResult>;
}

/**
 * Use case with ID interface
 */
interface UseCaseWithId<TResult> {
  execute(id: string | number, user?: AuthenticatedRequest['user']): Promise<TResult>;
}

/**
 * Use case with ID and DTO interface
 */
interface UseCaseWithIdAndDto<TDto, TResult> {
  execute(id: string | number, dto: TDto, user?: AuthenticatedRequest['user']): Promise<TResult>;
}

/**
 * Users use cases collection
 */
interface UsersUseCases {
  list: UseCase<unknown, unknown>;
  getById: UseCaseWithId<unknown>;
  create: UseCase<unknown, unknown>;
  update: UseCaseWithIdAndDto<unknown, unknown>;
  delete: UseCaseWithId<void>;
  search: UseCaseWithId<unknown>;
  getStats: { execute(user?: AuthenticatedRequest['user']): Promise<unknown> };
  getByClass: UseCaseWithId<unknown>;
}

/**
 * UsersController
 * Presentation layer - handles HTTP requests/responses only
 * Follows Single Responsibility Principle (SRP)
 */
class UsersController {
  private useCases: UsersUseCases;

  constructor(useCases: UsersUseCases) {
    this.useCases = useCases;
  }

  async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const dto = ListUsersDto.fromQuery(req.query);
      const result = await this.useCases.list.execute(dto, req.user);
      sendResponse(res, 200, ApiResponse.success(result, 'Danh sách người dùng'));
    } catch (error) {
      logError('Get users error', error);
      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message));
        return;
      }
      sendResponse(res, 500, ApiResponse.error('Không lấy được danh sách người dùng'));
    }
  }

  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.useCases.getById.execute(id, req.user);
      sendResponse(res, 200, ApiResponse.success(user, 'Thông tin người dùng'));
    } catch (error) {
      logError('Get user by ID error', error);
      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message));
        return;
      }
      sendResponse(res, 500, ApiResponse.error('Không lấy được thông tin người dùng'));
    }
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const dto = CreateUserDto.fromRequest(req.body);
      const result = await this.useCases.create.execute(dto, req.user);
      sendResponse(res, 201, ApiResponse.success(result, 'Tạo người dùng thành công'));
    } catch (error) {
      logError('Create user error', error);
      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message));
        return;
      }
      sendResponse(res, 500, ApiResponse.error('Không tạo được người dùng'));
    }
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dto = UpdateUserDto.fromRequest(req.body);
      const result = await this.useCases.update.execute(id, dto, req.user);
      sendResponse(res, 200, ApiResponse.success(result, 'Cập nhật người dùng thành công'));
    } catch (error) {
      logError('Update user error', error);
      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message));
        return;
      }
      sendResponse(res, 500, ApiResponse.error('Không cập nhật được người dùng'));
    }
  }

  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.useCases.delete.execute(id, req.user);
      sendResponse(res, 200, ApiResponse.success(null, 'Xóa người dùng thành công'));
    } catch (error) {
      logError('Delete user error', error);
      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message));
        return;
      }
      sendResponse(res, 500, ApiResponse.error('Không xóa được người dùng'));
    }
  }

  async search(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { q } = req.query;
      
      if (!q) {
        sendResponse(res, 400, ApiResponse.validationError([{ message: 'Missing search query' }]));
        return;
      }
      
      const users = await this.useCases.search.execute(q as string, req.user);
      sendResponse(res, 200, ApiResponse.success(users, 'Kết quả tìm kiếm'));
    } catch (error) {
      logError('Search users error', error);
      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message));
        return;
      }
      sendResponse(res, 500, ApiResponse.error('Không tìm kiếm được người dùng'));
    }
  }

  async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const stats = await this.useCases.getStats.execute(req.user);
      sendResponse(res, 200, ApiResponse.success(stats, 'Thống kê người dùng'));
    } catch (error) {
      logError('Get user stats error', error);
      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message));
        return;
      }
      sendResponse(res, 500, ApiResponse.error('Không lấy được thống kê'));
    }
  }

  async getByClass(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { className } = req.params;
      const users = await this.useCases.getByClass.execute(className, req.user);
      sendResponse(res, 200, ApiResponse.success(users, `Danh sách lớp ${className}`));
    } catch (error) {
      logError('Get users by class error', error);
      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message));
        return;
      }
      sendResponse(res, 500, ApiResponse.error('Không lấy được danh sách lớp'));
    }
  }

  async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.sub;
      const user = await this.useCases.getById.execute(userId as string | number, req.user);
      sendResponse(res, 200, ApiResponse.success(user, 'Thông tin cá nhân'));
    } catch (error) {
      logError('Get me error', error);
      if (error instanceof AppError) {
        sendResponse(res, error.statusCode, ApiResponse.error(error.message));
        return;
      }
      sendResponse(res, 500, ApiResponse.error('Không lấy được thông tin cá nhân'));
    }
  }
}

export default UsersController;
module.exports = UsersController;
