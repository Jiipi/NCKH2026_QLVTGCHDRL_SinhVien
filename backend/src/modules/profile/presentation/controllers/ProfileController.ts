import type { Request, Response } from 'express';
import { ApiResponse, sendResponse } from '../../../../core/http/response/apiResponse';
import { logError } from '../../../../core/logger';
import { AppError } from '../../../../core/errors/AppError';
import type GetProfileUseCase from '../../business/services/GetProfileUseCase';
import type UpdateProfileUseCase from '../../business/services/UpdateProfileUseCase';
import type ChangePasswordUseCase from '../../business/services/ChangePasswordUseCase';
import type CheckClassMonitorUseCase from '../../business/services/CheckClassMonitorUseCase';

/**
 * ProfileController
 * Presentation layer - handles HTTP requests/responses only
 * Follows Single Responsibility Principle (SRP)
 */

export interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    [key: string]: unknown;
  };
}

export interface ProfileUseCases {
  getProfile: GetProfileUseCase;
  updateProfile: UpdateProfileUseCase;
  changePassword: ChangePasswordUseCase;
  checkMonitorStatus: CheckClassMonitorUseCase;
}

class ProfileController {
  private useCases: ProfileUseCases;

  constructor(useCases: ProfileUseCases) {
    this.useCases = useCases;
  }

  async getProfile(req: AuthenticatedRequest, res: Response): Promise<Response> {
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

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<Response> {
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

  async changePassword(req: AuthenticatedRequest, res: Response): Promise<Response> {
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

  async checkMonitorStatus(req: AuthenticatedRequest, res: Response): Promise<Response> {
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

export default ProfileController;
module.exports = ProfileController;
