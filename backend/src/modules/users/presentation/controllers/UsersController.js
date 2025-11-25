const ListUsersDto = require('../../business/dto/ListUsersDto');
const CreateUserDto = require('../../business/dto/CreateUserDto');
const UpdateUserDto = require('../../business/dto/UpdateUserDto');
const { ApiResponse, sendResponse } = require('../../../../core/http/response/apiResponse');
const { logError } = require('../../../../core/logger');
const { AppError } = require('../../../../core/errors/AppError');

/**
 * UsersController
 * Presentation layer - handles HTTP requests/responses only
 * Follows Single Responsibility Principle (SRP)
 */
class UsersController {
  constructor(useCases) {
    this.useCases = useCases;
  }

  async getAll(req, res) {
    try {
      const dto = ListUsersDto.fromQuery(req.query);
      const result = await this.useCases.list.execute(dto, req.user);
      return sendResponse(res, 200, ApiResponse.success(result, 'Danh sách người dùng'));
    } catch (error) {
      logError('Get users error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không lấy được danh sách người dùng'));
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const user = await this.useCases.getById.execute(id, req.user);
      return sendResponse(res, 200, ApiResponse.success(user, 'Thông tin người dùng'));
    } catch (error) {
      logError('Get user by ID error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không lấy được thông tin người dùng'));
    }
  }

  async create(req, res) {
    try {
      const dto = CreateUserDto.fromRequest(req.body);
      const result = await this.useCases.create.execute(dto, req.user);
      return sendResponse(res, 201, ApiResponse.success(result, 'Tạo người dùng thành công'));
    } catch (error) {
      logError('Create user error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không tạo được người dùng'));
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const dto = UpdateUserDto.fromRequest(req.body);
      const result = await this.useCases.update.execute(id, dto, req.user);
      return sendResponse(res, 200, ApiResponse.success(result, 'Cập nhật người dùng thành công'));
    } catch (error) {
      logError('Update user error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không cập nhật được người dùng'));
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await this.useCases.delete.execute(id, req.user);
      return sendResponse(res, 200, ApiResponse.success(null, 'Xóa người dùng thành công'));
    } catch (error) {
      logError('Delete user error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không xóa được người dùng'));
    }
  }

  async search(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return sendResponse(res, 400, ApiResponse.validationError([{ message: 'Missing search query' }]));
      }
      
      const users = await this.useCases.search.execute(q, req.user);
      return sendResponse(res, 200, ApiResponse.success(users, 'Kết quả tìm kiếm'));
    } catch (error) {
      logError('Search users error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không tìm kiếm được người dùng'));
    }
  }

  async getStats(req, res) {
    try {
      const stats = await this.useCases.getStats.execute(req.user);
      return sendResponse(res, 200, ApiResponse.success(stats, 'Thống kê người dùng'));
    } catch (error) {
      logError('Get user stats error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không lấy được thống kê'));
    }
  }

  async getByClass(req, res) {
    try {
      const { className } = req.params;
      const users = await this.useCases.getByClass.execute(className, req.user);
      return sendResponse(res, 200, ApiResponse.success(users, `Danh sách lớp ${className}`));
    } catch (error) {
      logError('Get users by class error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không lấy được danh sách lớp'));
    }
  }

  async getMe(req, res) {
    try {
      const userId = req.user?.sub;
      const user = await this.useCases.getById.execute(userId, req.user);
      return sendResponse(res, 200, ApiResponse.success(user, 'Thông tin cá nhân'));
    } catch (error) {
      logError('Get me error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Không lấy được thông tin cá nhân'));
    }
  }
}

module.exports = UsersController;

