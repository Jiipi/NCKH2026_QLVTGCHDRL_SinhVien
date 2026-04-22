/**
 * AuthController
 * Presentation layer - handles HTTP requests/responses only
 * Follows Single Responsibility Principle (SRP)
 */

import { Request, Response } from 'express';
import { LoginDto } from '../../business/dto/LoginDto';
import { RegisterDto } from '../../business/dto/RegisterDto';
import { ApiResponse, sendResponse } from '../../../../core/http/response/apiResponse';
import { logError } from '../../../../core/logger';
import { logAudit } from '../../../../core/logger/audit';
import { AppError } from '../../../../core/errors/AppError';
import { ReferenceDataService } from '../../../../business/services';
import LoginUseCase from '../../business/services/LoginUseCase';
import RegisterUseCase from '../../business/services/RegisterUseCase';
import ChangePasswordUseCase from '../../business/services/ChangePasswordUseCase';
import ForgotPasswordUseCase from '../../business/services/ForgotPasswordUseCase';
import ResetPasswordUseCase from '../../business/services/ResetPasswordUseCase';
import GetMeUseCase from '../../business/services/GetMeUseCase';
import { IOtpService } from '../../business/interfaces/IOtpService';

// Extended OTP service with markAsUsed
interface IOtpServiceExtended extends IOtpService {
  verifyOtp(email: string, otp: string, markAsUsed?: boolean): boolean | Promise<boolean>;
}

// Authenticated request with user info
interface AuthRequest extends Request {
  user?: {
    sub: string;
    role: string;
  };
}

class AuthController {
  private loginUseCase: LoginUseCase;
  private registerUseCase: RegisterUseCase;
  private changePasswordUseCase: ChangePasswordUseCase;
  private forgotPasswordUseCase: ForgotPasswordUseCase;
  private resetPasswordUseCase: ResetPasswordUseCase;
  private getMeUseCase: GetMeUseCase;
  private otpService: IOtpServiceExtended;

  constructor(
    loginUseCase: LoginUseCase,
    registerUseCase: RegisterUseCase,
    changePasswordUseCase: ChangePasswordUseCase,
    forgotPasswordUseCase: ForgotPasswordUseCase,
    resetPasswordUseCase: ResetPasswordUseCase,
    getMeUseCase: GetMeUseCase,
    otpService: IOtpServiceExtended
  ) {
    this.loginUseCase = loginUseCase;
    this.registerUseCase = registerUseCase;
    this.changePasswordUseCase = changePasswordUseCase;
    this.forgotPasswordUseCase = forgotPasswordUseCase;
    this.resetPasswordUseCase = resetPasswordUseCase;
    this.getMeUseCase = getMeUseCase;
    this.otpService = otpService;
  }

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const dto = LoginDto.fromRequest(req.body);
      const ip = req.ip || null;
      const tabId = (req.headers['x-tab-id'] as string) || req.body.tabId || null;

      const result = await this.loginUseCase.execute(dto, ip, tabId);
      logAudit('login', req, { module: 'auth', entityType: 'NguoiDung' });

      return sendResponse(
        res,
        200,
        ApiResponse.success(result, 'Đăng nhập thành công')
      );
    } catch (error: unknown) {
      logError('Login error', error, { ip: req.ip });

      if (error instanceof AppError) {
        return sendResponse(
          res,
          error.statusCode,
          ApiResponse.error(error.message, error.statusCode, error.details)
        );
      }

      return sendResponse(
        res,
        500,
        ApiResponse.error('Lỗi server, vui lòng thử lại sau')
      );
    }
  }

  async register(req: Request, res: Response): Promise<Response> {
    try {
      const dto = RegisterDto.fromRequest(req.body);
      const result = await this.registerUseCase.execute(dto);
      logAudit('register', req, { module: 'auth', entityType: 'NguoiDung' });

      return sendResponse(
        res,
        201,
        ApiResponse.success(result, 'Đăng ký thành công')
      );
    } catch (error: unknown) {
      logError('Register error', error);

      if (error instanceof AppError) {
        return sendResponse(
          res,
          error.statusCode,
          ApiResponse.error(error.message, error.statusCode, error.details)
        );
      }

      return sendResponse(
        res,
        500,
        ApiResponse.error('Lỗi server, vui lòng thử lại sau')
      );
    }
  }

  async me(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user!.sub;
      const dto = await this.getMeUseCase.execute(userId);

      return sendResponse(
        res,
        200,
        ApiResponse.success(dto, 'Thông tin người dùng')
      );
    } catch (error: unknown) {
      logError('Get me error', error);

      if (error instanceof AppError) {
        return sendResponse(
          res,
          error.statusCode,
          ApiResponse.error(error.message)
        );
      }

      return sendResponse(
        res,
        500,
        ApiResponse.error('Lỗi server, vui lòng thử lại sau')
      );
    }
  }

  async changePassword(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user!.sub;
      const { currentPassword, newPassword } = req.body;

      await this.changePasswordUseCase.execute(userId, currentPassword, newPassword);
      logAudit('change_password', req, { module: 'auth', entityType: 'NguoiDung' });

      return sendResponse(
        res,
        200,
        ApiResponse.success(null, 'Đổi mật khẩu thành công')
      );
    } catch (error: unknown) {
      logError('Change password error', error);

      if (error instanceof AppError) {
        return sendResponse(
          res,
          error.statusCode,
          ApiResponse.error(error.message)
        );
      }

      return sendResponse(
        res,
        500,
        ApiResponse.error('Lỗi server, vui lòng thử lại sau')
      );
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.body;
      
      const result = await this.forgotPasswordUseCase.execute(email);

      return sendResponse(
        res,
        200,
        ApiResponse.success(
          { otp: result.otp },
          result.sent ? 'Mã OTP đã được gửi đến email của bạn' : 'Nếu email tồn tại, mã OTP đã được gửi'
        )
      );
    } catch (error: unknown) {
      logError('Forgot password error', error);
      const errorMessage = error instanceof Error ? error.message : '';
      
      if (errorMessage.includes('SMTP configuration is missing')) {
        return sendResponse(
          res,
          500,
          ApiResponse.error('Hệ thống email chưa được cấu hình. Vui lòng liên hệ quản trị viên.')
        );
      }
      
      if (errorMessage.includes('SMTP')) {
        return sendResponse(
          res,
          500,
          ApiResponse.error('Không thể gửi email. Vui lòng kiểm tra cấu hình email hoặc thử lại sau.')
        );
      }
      
      return sendResponse(
        res,
        500,
        ApiResponse.error('Lỗi server, vui lòng thử lại sau')
      );
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<Response> {
    try {
      const { email, otp } = req.body;

      const isValid = await this.otpService.verifyOtp(email, otp, false);

      if (!isValid) {
        return sendResponse(
          res,
          400,
          ApiResponse.error('Mã OTP không hợp lệ hoặc đã hết hạn')
        );
      }

      return sendResponse(
        res,
        200,
        ApiResponse.success(null, 'Xác thực OTP thành công')
      );
    } catch (error) {
      logError('Verify OTP error', error);
      return sendResponse(
        res,
        500,
        ApiResponse.error('Lỗi server, vui lòng thử lại sau')
      );
    }
  }

  async resetPasswordWithOtp(req: Request, res: Response): Promise<Response> {
    try {
      const { email, otp, newPassword } = req.body;

      await this.resetPasswordUseCase.execute(email, otp, newPassword);
      logAudit('reset_password', req, { module: 'auth', entityType: 'NguoiDung' });

      return sendResponse(
        res,
        200,
        ApiResponse.success(null, 'Đặt lại mật khẩu thành công')
      );
    } catch (error: unknown) {
      logError('Reset password error', error);

      if (error instanceof AppError) {
        return sendResponse(
          res,
          error.statusCode,
          ApiResponse.error(error.message)
        );
      }

      return sendResponse(
        res,
        500,
        ApiResponse.error('Lỗi server, vui lòng thử lại sau')
      );
    }
  }

  async getFaculties(req: Request, res: Response): Promise<Response> {
    try {
      const faculties = await ReferenceDataService.getFaculties();
      const data = faculties.map((f: string) => ({ value: f, label: f }));

      return sendResponse(
        res,
        200,
        ApiResponse.success(data, 'Danh sách khoa')
      );
    } catch (error) {
      logError('Get faculties error', error);
      return sendResponse(
        res,
        500,
        ApiResponse.error('Không lấy được danh sách khoa')
      );
    }
  }

  async getAllClasses(req: Request, res: Response): Promise<Response> {
    try {
      const classes = await ReferenceDataService.getAllClasses();
      const data = classes.map((c) => ({ 
        value: c.id, 
        label: c.ten_lop,
        id: c.id,
        ten_lop: c.ten_lop,
        khoa: c.khoa
      }));

      return sendResponse(
        res,
        200,
        ApiResponse.success(data, 'Danh sách lớp')
      );
    } catch (error) {
      logError('Get all classes error', error);
      return sendResponse(
        res,
        500,
        ApiResponse.error('Không lấy được danh sách lớp')
      );
    }
  }

  async getClassesByFaculty(req: Request, res: Response): Promise<Response> {
    try {
      const { khoa } = req.params;
      const classes = await ReferenceDataService.getClassesByFaculty(khoa);
      const data = classes.map((c) => ({ value: c.id, label: c.ten_lop }));

      return sendResponse(
        res,
        200,
        ApiResponse.success(data, 'Danh sách lớp')
      );
    } catch (error) {
      logError('Get classes error', error);
      return sendResponse(
        res,
        500,
        ApiResponse.error('Không lấy được danh sách lớp')
      );
    }
  }
}

export default AuthController;
