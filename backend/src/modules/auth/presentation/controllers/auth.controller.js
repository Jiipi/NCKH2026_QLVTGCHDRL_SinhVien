const LoginDto = require('../../business/dto/LoginDto');
const RegisterDto = require('../../business/dto/RegisterDto');
const { ApiResponse, sendResponse } = require('../../../../core/http/response/apiResponse');
const { logError } = require('../../../../core/logger');
const { AppError } = require('../../../../core/errors/AppError');
const { ReferenceDataService } = require('../../../../business/services');

/**
 * AuthController
 * Presentation layer - handles HTTP requests/responses only
 * Follows Single Responsibility Principle (SRP)
 */
class AuthController {
  constructor(
    loginUseCase,
    registerUseCase,
    changePasswordUseCase,
    forgotPasswordUseCase,
    resetPasswordUseCase,
    getMeUseCase,
    otpService
  ) {
    this.loginUseCase = loginUseCase;
    this.registerUseCase = registerUseCase;
    this.changePasswordUseCase = changePasswordUseCase;
    this.forgotPasswordUseCase = forgotPasswordUseCase;
    this.resetPasswordUseCase = resetPasswordUseCase;
    this.getMeUseCase = getMeUseCase;
    this.otpService = otpService;
  }

  async login(req, res) {
    try {
      const dto = LoginDto.fromRequest(req.body);
      const ip = req.ip;
      const tabId = req.headers['x-tab-id'] || req.body.tabId || null;

      const result = await this.loginUseCase.execute(dto, ip, tabId);

      return sendResponse(
        res,
        200,
        ApiResponse.success(result, 'Đăng nhập thành công')
      );
    } catch (error) {
      logError('Login error', error, { ip: req.ip });

      if (error instanceof AppError) {
        return sendResponse(
          res,
          error.statusCode,
          ApiResponse.error(error.message, error.details)
        );
      }

      return sendResponse(
        res,
        500,
        ApiResponse.error('Lỗi server, vui lòng thử lại sau')
      );
    }
  }

  async register(req, res) {
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
    } catch (error) {
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
          ApiResponse.error(error.message, error.details)
        );
      }

      return sendResponse(
        res,
        500,
        ApiResponse.error('Lỗi server, vui lòng thử lại sau')
      );
    }
  }

  async me(req, res) {
    try {
      const userId = req.user.sub;
      const dto = await this.getMeUseCase.execute(userId);

      return sendResponse(
        res,
        200,
        ApiResponse.success(dto, 'Thông tin người dùng')
      );
    } catch (error) {
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

  async changePassword(req, res) {
    try {
      const userId = req.user.sub;
      const { currentPassword, newPassword } = req.body;

      await this.changePasswordUseCase.execute(userId, currentPassword, newPassword);

      return sendResponse(
        res,
        200,
        ApiResponse.success(null, 'Đổi mật khẩu thành công')
      );
    } catch (error) {
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

  async forgotPassword(req, res) {
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
    } catch (error) {
      console.error('[AuthController] Forgot password error:', error.message);
      console.error('[AuthController] Error stack:', error.stack);
      logError('Forgot password error', error);
      
      // Check if it's a mailer configuration error
      if (error.message && error.message.includes('SMTP configuration is missing')) {
        return sendResponse(
          res,
          500,
          ApiResponse.error('Hệ thống email chưa được cấu hình. Vui lòng liên hệ quản trị viên.')
        );
      }
      
      // Check if it's a mail send error
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

  async verifyOtp(req, res) {
    try {
      const { email, otp } = req.body;
      console.log('[AuthController] Verify OTP request:', { email, hasOtp: !!otp });

      // Verify OTP but don't mark as used yet (allow reuse for password reset)
      const isValid = this.otpService.verifyOtp(email, otp, false);
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

  async resetPasswordWithOtp(req, res) {
    try {
      const { email, otp, newPassword } = req.body;

      await this.resetPasswordUseCase.execute(email, otp, newPassword);

      return sendResponse(
        res,
        200,
        ApiResponse.success(null, 'Đặt lại mật khẩu thành công')
      );
    } catch (error) {
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

  async getFaculties(req, res) {
    try {
      const faculties = await ReferenceDataService.getFaculties();
      const data = faculties.map((f) => ({ value: f, label: f }));

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

  async getAllClasses(req, res) {
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

  async getClassesByFaculty(req, res) {
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

module.exports = AuthController;

