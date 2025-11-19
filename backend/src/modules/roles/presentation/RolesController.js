const { ApiResponse, sendResponse } = require('../../../core/http/response/apiResponse');
const { logError } = require('../../../core/logger');
const { AppError } = require('../../../core/errors/AppError');

/**
 * RolesController
 * Presentation layer - handles HTTP requests/responses only
 * Follows Single Responsibility Principle (SRP)
 */
class RolesController {
  constructor(useCases) {
    this.useCases = useCases;
  }

  async list(req, res) {
    try {
      const { page, limit, search } = req.query;
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

  async getById(req, res) {
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

  async create(req, res) {
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

  async update(req, res) {
    try {
      const { id } = req.params;
      
      // Log request body để debug
      console.log('[RolesController] Update request:', {
        id,
        body_keys: Object.keys(req.body),
        quyen_han_in_body: 'quyen_han' in req.body,
        quyen_han_type: typeof req.body.quyen_han,
        quyen_han_isArray: Array.isArray(req.body.quyen_han),
        quyen_han_value: req.body.quyen_han
      });
      
      const role = await this.useCases.update.execute(id, req.body);
      
      // Log response
      console.log('[RolesController] Update success:', {
        id: role.id,
        ten_vt: role.ten_vt,
        quyen_han_in_response: 'quyen_han' in role,
        quyen_han_type: typeof role.quyen_han
      });
      
      return sendResponse(res, 200, ApiResponse.success(role, 'Cập nhật vai trò thành công'));
    } catch (error) {
      logError('Update role error', error);
      console.error('[RolesController] Update error details:', {
        message: error.message,
        stack: error.stack,
        body: req.body
      });
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi cập nhật vai trò: ' + error.message));
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const { reassignTo, cascadeUsers } = req.query || {};
      
      await this.useCases.delete.execute(id, { reassignTo, cascadeUsers });
      return sendResponse(res, 200, ApiResponse.success(null, 'Xóa vai trò thành công'));
    } catch (error) {
      logError('Delete role error', error);
      if (error instanceof AppError) {
        if (error.usersCount) {
          return sendResponse(res, 409, ApiResponse.error(
            `Không thể xóa vai trò do còn ${error.usersCount} người dùng đang sử dụng. ` +
            `Vui lòng gán sang vai trò khác trước (reassignTo) hoặc gọi lại với ?cascadeUsers=true để xóa cả người dùng.`
          ));
        }
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi xóa vai trò'));
    }
  }

  async assignToUsers(req, res) {
    try {
      const { id } = req.params;
      const { user_ids } = req.body;
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

  async removeFromUser(req, res) {
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

module.exports = RolesController;

