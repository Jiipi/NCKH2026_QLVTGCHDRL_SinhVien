const GetUsersUseCase = require('../application/use-cases/GetUsersUseCase');
const GetUserByIdUseCase = require('../application/use-cases/GetUserByIdUseCase');
const CreateUserUseCase = require('../application/use-cases/CreateUserUseCase');
const UpdateUserUseCase = require('../application/use-cases/UpdateUserUseCase');
const DeleteUserUseCase = require('../application/use-cases/DeleteUserUseCase');
const ExportUsersUseCase = require('../application/use-cases/ExportUsersUseCase');
const GetUsersDto = require('../application/dto/GetUsersDto');
const CreateUserDto = require('../application/dto/CreateUserDto');
const UpdateUserDto = require('../application/dto/UpdateUserDto');
const { ApiResponse, sendResponse } = require('../../../core/http/response/apiResponse');
const { logError } = require('../../../core/logger');
const { AppError } = require('../../../core/errors/AppError');

/**
 * AdminUsersController
 * Presentation layer - handles HTTP requests/responses only
 * Follows Single Responsibility Principle (SRP)
 */
class AdminUsersController {
  constructor(
    getUsersUseCase,
    getUserByIdUseCase,
    createUserUseCase,
    updateUserUseCase,
    deleteUserUseCase,
    exportUsersUseCase
  ) {
    this.getUsersUseCase = getUsersUseCase;
    this.getUserByIdUseCase = getUserByIdUseCase;
    this.createUserUseCase = createUserUseCase;
    this.updateUserUseCase = updateUserUseCase;
    this.deleteUserUseCase = deleteUserUseCase;
    this.exportUsersUseCase = exportUsersUseCase;
  }

  async getUsers(req, res) {
    try {
      const dto = GetUsersDto.fromQuery(req.query);
      const result = await this.getUsersUseCase.execute(dto);
      return sendResponse(res, 200, ApiResponse.success(result, 'Lấy danh sách người dùng thành công'));
    } catch (error) {
      logError('Error fetching users', { error: error.message, userId: req.user?.id });
      return sendResponse(res, 500, ApiResponse.error('Lỗi lấy danh sách người dùng'));
    }
  }

  async getUserById(req, res) {
    try {
      const user = await this.getUserByIdUseCase.execute(req.params.id);
      return sendResponse(res, 200, ApiResponse.success(user, 'Lấy thông tin người dùng thành công'));
    } catch (error) {
      logError('Error fetching user details', { error: error.message, adminId: req.user?.id });
      const status = error instanceof AppError ? error.statusCode : 500;
      return sendResponse(res, status, ApiResponse.error(error.message || 'Lỗi lấy thông tin người dùng'));
    }
  }

  async createUser(req, res) {
    try {
      const dto = CreateUserDto.fromRequest(req.body);
      const adminId = req.user?.sub || req.user?.id;
      const result = await this.createUserUseCase.execute(dto, adminId);
      return sendResponse(res, 201, ApiResponse.success(result, 'Tạo người dùng thành công'));
    } catch (error) {
      logError('Error creating user', { error: error.message, userId: req.user?.id });
      const status = error instanceof AppError ? error.statusCode : 500;
      return sendResponse(res, status, ApiResponse.error(error.message || 'Lỗi tạo người dùng', error.details));
    }
  }

  async updateUser(req, res) {
    try {
      const dto = UpdateUserDto.fromRequest(req.body);
      const adminId = req.user?.sub || req.user?.id;
      const result = await this.updateUserUseCase.execute(req.params.id, dto, adminId);
      return sendResponse(res, 200, ApiResponse.success(result, 'Cập nhật người dùng thành công'));
    } catch (error) {
      logError('Error updating user', { error: error.message, userId: req.user?.id });
      const status = error instanceof AppError ? error.statusCode : 500;
      return sendResponse(res, status, ApiResponse.error(error.message || 'Lỗi cập nhật người dùng', error.details));
    }
  }

  async deleteUser(req, res) {
    try {
      const adminId = req.user?.sub || req.user?.id;
      await this.deleteUserUseCase.execute(req.params.id, adminId);
      return sendResponse(res, 200, ApiResponse.success(null, 'Đã xóa người dùng và toàn bộ dữ liệu liên quan khỏi hệ thống'));
    } catch (error) {
      logError('Error deleting user completely', {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id
      });
      const status = error instanceof AppError ? error.statusCode : 500;
      return sendResponse(res, status, ApiResponse.error(error.message || 'Lỗi xóa người dùng'));
    }
  }

  async exportUsers(req, res) {
    try {
      const dto = GetUsersDto.fromQuery(req.query);
      const csv = await this.exportUsersUseCase.execute(dto);

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
      return res.status(200).send(csv);
    } catch (error) {
      logError('Error export users', { error: error.message });
      return sendResponse(res, 500, ApiResponse.error('Lỗi xuất người dùng'));
    }
  }
}

module.exports = AdminUsersController;

