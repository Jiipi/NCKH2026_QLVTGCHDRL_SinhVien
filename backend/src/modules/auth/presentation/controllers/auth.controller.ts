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

      return sendResponse(
        res,
        200,
        ApiResponse.success(result, 'Đăng nhập thành công')
      );
    } catch (error: any) {
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
      console.log('[AuthController] Register request:', { 
        body: req.body,
        hasName: !!req.body.name,
        hasHo_ten: !!req.body.ho_ten,
        hasMaso: !!req.body.maso,
        hasEmail: !!req.body.email,
        hasLopId: !!req.body.lop_id,
        hasLopIdCamel: !!req.body.lopId,
        hasNgaySinh: !!req.body.ngay_sinh,
        hasNgaySinhCamel: !!req.body.ngaySinh
      });
      
      const dto = RegisterDto.fromRequest(req.body);
      console.log('[AuthController] DTO created:', {
        maso: dto.maso,
        email: dto.email,
        ho_ten: dto.ho_ten,
        hasLopId: !!dto.lop_id,
        hasNgaySinh: !!dto.ngay_sinh
      });
      
      const result = await this.registerUseCase.execute(dto);
      console.log('[AuthController] Registration successful:', {
        userId: result.user?.id,
        maso: result.user?.maso
      });

      return sendResponse(
        res,
        201,
        ApiResponse.success(result, 'Đăng ký thành công')
      );
    } catch (error: any) {
      console.error('[AuthController] Register error:', error.message);
      console.error('[AuthController] Error stack:', error.stack);
      logError('Register error', error);

      if (error instanceof AppError) {
        console.log('[AuthController] Returning AppError response:', {
          statusCode: error.statusCode,
          message: error.message,
          details: error.details
        });
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
    } catch (error: any) {
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

      return sendResponse(
        res,
        200,
        ApiResponse.success(null, 'Đổi mật khẩu thành công')
      );
    } catch (error: any) {
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
      console.log('[AuthController] Forgot password request:', { email: email?.trim() });
      
      const result = await this.forgotPasswordUseCase.execute(email);
      console.log('[AuthController] Forgot password result:', { 
        sent: result.sent, 
        hasOtp: !!result.otp,
        email: email?.trim()
      });

      return sendResponse(
        res,
        200,
        ApiResponse.success(
          { otp: result.otp },
          result.sent ? 'Mã OTP đã được gửi đến email của bạn' : 'Nếu email tồn tại, mã OTP đã được gửi'
        )
      );
    } catch (error: any) {
      console.error('[AuthController] Forgot password error:', error.message);
      console.error('[AuthController] Error stack:', error.stack);
      logError('Forgot password error', error);
      
      if (error.message && error.message.includes('SMTP configuration is missing')) {
        return sendResponse(
          res,
          500,
          ApiResponse.error('Hệ thống email chưa được cấu hình. Vui lòng liên hệ quản trị viên.')
        );
      }
      
      if (error.message && error.message.includes('SMTP')) {
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
      console.log('[AuthController] Verify OTP request:', { email, hasOtp: !!otp });

      const isValid = await this.otpService.verifyOtp(email, otp, false);
      console.log('[AuthController] OTP verification result:', isValid);

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

      return sendResponse(
        res,
        200,
        ApiResponse.success(null, 'Đặt lại mật khẩu thành công')
      );
    } catch (error: any) {
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
