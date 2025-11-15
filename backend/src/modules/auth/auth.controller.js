/**
 * Auth Controller
 * Handles HTTP requests for authentication
 * Controllers should only handle request/response, not business logic
 */

const AuthService = require('./auth.service');
const { ApiResponse, sendResponse } = require('../../core/http/response/apiResponse');
const { logError } = require('../../core/logger');
const { ReferenceDataService } = require('../../services');

class AuthController {
  /**
   * @route   POST /api/auth/login
   * @desc    Login with maso and password
   * @access  Public
   */
  static async login(req, res) {
    try {
      const { maso, password, remember } = req.body;
      const ip = req.ip;

      const result = await AuthService.login(maso, password, remember, ip);
      
      return sendResponse(
        res, 
        200, 
        ApiResponse.success(result, 'Đăng nhập thành công')
      );
    } catch (error) {
      logError('Login error', error, { ip: req.ip });
      
      if (error.status) {
        return sendResponse(
          res, 
          error.status, 
          ApiResponse.error(error.message, error.errors)
        );
      }
      
      return sendResponse(
        res, 
        500, 
        ApiResponse.error('Lỗi server, vui lòng thử lại sau')
      );
    }
  }

  /**
   * @route   POST /api/auth/register
   * @desc    Register new user account
   * @access  Public
   */
  static async register(req, res) {
    try {
      const userData = req.body;
      const result = await AuthService.register(userData);

      return sendResponse(
        res,
        201,
        ApiResponse.success(result, 'Đăng ký thành công')
      );
    } catch (error) {
      logError('Register error', error);

      if (error.status === 400) {
        return sendResponse(
          res,
          400,
          ApiResponse.validationError(error.errors || [{ message: error.message }])
        );
      }

      if (error.status) {
        return sendResponse(
          res,
          error.status,
          ApiResponse.error(error.message, error.errors)
        );
      }

      return sendResponse(
        res,
        500,
        ApiResponse.error('Lỗi server, vui lòng thử lại sau')
      );
    }
  }

  /**
   * @route   GET /api/auth/me
   * @desc    Get current user info
   * @access  Private
   */
  static async me(req, res) {
    try {
      const userId = req.user.sub;
      
      const user = await AuthService.findByEmailOrMaso(userId);
      if (!user) {
        return sendResponse(
          res,
          404,
          ApiResponse.notFound('Người dùng không tồn tại')
        );
      }

      const dto = AuthService.toUserDTO(user);
      return sendResponse(
        res,
        200,
        ApiResponse.success(dto, 'Thông tin người dùng')
      );
    } catch (error) {
      logError('Get me error', error);
      return sendResponse(
        res,
        500,
        ApiResponse.error('Lỗi server, vui lòng thử lại sau')
      );
    }
  }

  /**
   * @route   POST /api/auth/change-password
   * @desc    Change user password
   * @access  Private
   */
  static async changePassword(req, res) {
    try {
      const userId = req.user.sub;
      const { currentPassword, newPassword } = req.body;

      await AuthService.changePassword(userId, currentPassword, newPassword);

      return sendResponse(
        res,
        200,
        ApiResponse.success(null, 'Đổi mật khẩu thành công')
      );
    } catch (error) {
      logError('Change password error', error);

      if (error.status === 400) {
        return sendResponse(
          res,
          400,
          ApiResponse.error(error.message)
        );
      }

      if (error.status) {
        return sendResponse(
          res,
          error.status,
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

  /**
   * @route   POST /api/auth/forgot-password
   * @desc    Request password reset OTP
   * @access  Public
   */
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await AuthService.findUserByEmail(email);
      if (!user) {
        // Return success even if email doesn't exist (security best practice)
        return sendResponse(
          res,
          200,
          ApiResponse.success(null, 'Nếu email tồn tại, mã OTP đã được gửi')
        );
      }

      const otp = AuthService.generateOtp(email);

      // TODO: Send OTP via email
      // For now, log it (development only)
      if (process.env.NODE_ENV === 'development') {
        console.log(`OTP for ${email}: ${otp}`);
      }

      return sendResponse(
        res,
        200,
        ApiResponse.success(
          { otp: process.env.NODE_ENV === 'development' ? otp : undefined },
          'Mã OTP đã được gửi đến email của bạn'
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

  /**
   * @route   POST /api/auth/verify-otp
   * @desc    Verify OTP code
   * @access  Public
   */
  static async verifyOtp(req, res) {
    try {
      const { email, otp } = req.body;

      const isValid = AuthService.verifyOtp(email, otp);

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

  /**
   * @route   POST /api/auth/reset-password
   * @desc    Reset password with OTP
   * @access  Public
   */
  static async resetPasswordWithOtp(req, res) {
    try {
      const { email, otp, newPassword } = req.body;

      // Verify OTP first
      const isValid = AuthService.verifyOtp(email, otp);
      if (!isValid) {
        return sendResponse(
          res,
          400,
          ApiResponse.error('Mã OTP không hợp lệ hoặc đã hết hạn')
        );
      }

      // Find user and update password
      const user = await AuthService.findUserByEmail(email);
      if (!user) {
        return sendResponse(
          res,
          404,
          ApiResponse.notFound('Người dùng không tồn tại')
        );
      }

      // Use a dummy current password since we've verified OTP
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await require('../../infrastructure/prisma/client').prisma.nguoiDung.update({
        where: { id: user.id },
        data: { mat_khau: hashedPassword }
      });

      return sendResponse(
        res,
        200,
        ApiResponse.success(null, 'Đặt lại mật khẩu thành công')
      );
    } catch (error) {
      logError('Reset password error', error);
      return sendResponse(
        res,
        500,
        ApiResponse.error('Lỗi server, vui lòng thử lại sau')
      );
    }
  }

  /**
   * @route   GET /api/auth/faculties
   * @desc    Get list of faculties
   * @access  Public
   */
  static async getFaculties(req, res) {
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

  /**
   * @route   GET /api/auth/classes/:khoa
   * @desc    Get classes by faculty
   * @access  Public
   */
  static async getClassesByFaculty(req, res) {
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
