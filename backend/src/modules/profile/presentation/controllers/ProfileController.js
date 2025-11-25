const { ApiResponse, sendResponse } = require('../../../../core/http/response/apiResponse');
const { logError } = require('../../../../core/logger');
const { AppError } = require('../../../../core/errors/AppError');

/**
 * ProfileController
 * Presentation layer - handles HTTP requests/responses only
 * Follows Single Responsibility Principle (SRP)
 */
class ProfileController {
  constructor(useCases) {
    this.useCases = useCases;
  }

  async getProfile(req, res) {
    try {
      const userId = req.user.sub;
      const profile = await this.useCases.getProfile.execute(userId);
      return sendResponse(res, 200, ApiResponse.success(profile));
    } catch (error) {
      logError('Get profile error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi lấy thông tin người dùng'));
    }
  }

  async updateProfile(req, res) {
    try {
      const userId = req.user.sub;
      const profile = await this.useCases.updateProfile.execute(userId, req.body);
      return sendResponse(res, 200, ApiResponse.success(profile, 'Cập nhật thông tin thành công'));
    } catch (error) {
      logError('Update profile error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi cập nhật thông tin'));
    }
  }

  async changePassword(req, res) {
    try {
      const userId = req.user.sub;
      await this.useCases.changePassword.execute(userId, req.body);
      return sendResponse(res, 200, ApiResponse.success(null, 'Đổi mật khẩu thành công'));
    } catch (error) {
      logError('Change password error', error);
      if (error instanceof AppError) {
        return sendResponse(res, error.statusCode, ApiResponse.error(error.message));
      }
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi đổi mật khẩu'));
    }
  }

  async checkMonitorStatus(req, res) {
    try {
      const userId = req.user.sub;
      const monitorStatus = await this.useCases.checkMonitorStatus.execute(userId);
      return sendResponse(res, 200, ApiResponse.success(monitorStatus));
    } catch (error) {
      logError('Check monitor status error', error);
      return sendResponse(res, 500, ApiResponse.error('Lỗi khi kiểm tra quyền lớp trưởng'));
    }
  }
}

module.exports = ProfileController;

