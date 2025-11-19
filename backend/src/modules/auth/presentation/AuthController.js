const LoginDto = require('../application/dto/LoginDto');
const RegisterDto = require('../application/dto/RegisterDto');
const { ApiResponse, sendResponse } = require('../../../core/http/response/apiResponse');
const { logError } = require('../../../core/logger');
const { AppError } = require('../../../core/errors/AppError');
const { ReferenceDataService } = require('../../../services');

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
      const dto = RegisterDto.fromRequest(req.body);
      const result = await this.registerUseCase.execute(dto);

      return sendResponse(
        res,
        201,
        ApiResponse.success(result, 'Đăng ký thành công')
      );
    } catch (error) {
      logError('Register error', error);

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
      const result = await this.forgotPasswordUseCase.execute(email);

      return sendResponse(
        res,
        200,
        ApiResponse.success(
          { otp: result.otp },
          result.sent ? 'Mã OTP đã được gửi đến email của bạn' : 'Nếu email tồn tại, mã OTP đã được gửi'
        )
      );
    } catch (error) {
      logError('Forgot password error', error);
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

      const isValid = this.otpService.verifyOtp(email, otp);

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

