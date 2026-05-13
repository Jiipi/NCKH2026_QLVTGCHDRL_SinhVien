/**
 * Auth Routes
 * Route definitions for authentication endpoints
 */

import { Router, Request, Response } from 'express';
import { createAuthController } from '../auth.factory';
import PermissionsController from '../controllers/permissions.controller';
import vanTayWebAuthnService from '../../../../business/services/van-tay-webauthn.service';
import { 
  validateLogin,
  validateRegister,
  validateChangePassword,
  validateForgotPassword,
  validateVerifyOtp,
  validateResetWithOtp
} from '../../business/validators/auth.validators';
import { auth } from '../../../../core/http/middleware/authJwt';
import { loginLimiter } from '../../../../core/http/middleware/rateLimiters';
import { ApiResponse, sendResponse } from '../../../../core/http/response/apiResponse';
import { AppError } from '../../../../core/errors/AppError';

const router = Router();

// Create controller with all dependencies (Dependency Injection)
const authController = createAuthController();

function requestContext(req: Request) {
  return {
    ip: req.headers['x-forwarded-for']?.toString() || req.ip,
    userAgent: req.get('user-agent') || null
  };
}

function handleWebAuthnError(res: Response, error: unknown): void {
  if (error instanceof AppError) {
    sendResponse(res, error.statusCode, ApiResponse.error(error.message, error.statusCode, error.details));
    return;
  }
  console.error('[VanTayAuth] Error:', error);
  sendResponse(res, 500, ApiResponse.error('Không xử lý được xác thực vân tay'));
}

/**
 * @route   POST /api/auth/login
 * @desc    Login with maso and password
 * @access  Public
 */
router.post('/login', loginLimiter, validateLogin, (req: Request, res: Response) => authController.login(req, res));

/**
 * @route   POST /api/auth/register
 * @desc    Register new user account
 * @access  Public
 */
router.post('/register', validateRegister, (req: Request, res: Response) => authController.register(req, res));

router.get('/van-tay/thiet-bi', auth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.sub || (req as any).user?.id;
    const result = await vanTayWebAuthnService.getRegisteredDevices(userId);
    sendResponse(res, 200, ApiResponse.success(result, 'Danh sách thiết bị vân tay'));
  } catch (error) {
    handleWebAuthnError(res, error);
  }
});

router.post('/van-tay/dang-ky/options', auth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.sub || (req as any).user?.id;
    const result = await vanTayWebAuthnService.beginRegistration(userId, { ...requestContext(req), userId });
    sendResponse(res, 200, ApiResponse.success(result, 'Tạo phiên đăng ký vân tay'));
  } catch (error) {
    handleWebAuthnError(res, error);
  }
});

router.post('/van-tay/dang-ky/verify', auth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.sub || (req as any).user?.id;
    const result = await vanTayWebAuthnService.finishRegistration(userId, req.body?.credential, req.body?.deviceName, { ...requestContext(req), userId });
    sendResponse(res, 201, ApiResponse.success(result, 'Đăng ký vân tay thành công'));
  } catch (error) {
    handleWebAuthnError(res, error);
  }
});

router.post('/van-tay/dang-nhap/options', loginLimiter, async (req: Request, res: Response) => {
  try {
    const result = await vanTayWebAuthnService.beginLogin(req.body?.username || req.body?.maso, requestContext(req));
    sendResponse(res, 200, ApiResponse.success(result, 'Tạo phiên đăng nhập vân tay'));
  } catch (error) {
    handleWebAuthnError(res, error);
  }
});

router.post('/van-tay/dang-nhap/verify', loginLimiter, async (req: Request, res: Response) => {
  try {
    const result = await vanTayWebAuthnService.finishLogin(req.body?.credential, !!req.body?.remember, requestContext(req));
    sendResponse(res, 200, ApiResponse.success(result, 'Đăng nhập vân tay thành công'));
  } catch (error) {
    handleWebAuthnError(res, error);
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Private
 */
router.get('/me', auth, (req: Request, res: Response) => authController.me(req, res));

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', auth, validateChangePassword, (req: Request, res: Response) => authController.changePassword(req, res));

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset OTP
 * @access  Public
 */
router.post('/forgot-password', validateForgotPassword, (req: Request, res: Response) => authController.forgotPassword(req, res));

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP code
 * @access  Public
 */
router.post('/verify-otp', validateVerifyOtp, (req: Request, res: Response) => authController.verifyOtp(req, res));

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with OTP
 * @access  Public
 */
router.post('/reset-password', validateResetWithOtp, (req: Request, res: Response) => authController.resetPasswordWithOtp(req, res));

/**
 * @route   GET /api/auth/faculties
 * @desc    Get list of faculties for registration
 * @access  Public
 */
router.get('/faculties', (req: Request, res: Response) => authController.getFaculties(req, res));

/**
 * @route   GET /api/auth/classes
 * @desc    Get all classes for registration
 * @access  Public
 */
router.get('/classes', (req: Request, res: Response) => authController.getAllClasses(req, res));

/**
 * @route   GET /api/auth/classes/:khoa
 * @desc    Get classes by faculty
 * @access  Public
 */
router.get('/classes/:khoa', (req: Request, res: Response) => authController.getClassesByFaculty(req, res));

/**
 * @route   GET /api/auth/permissions
 * @desc    Get current user permissions (for realtime permission checking)
 * @access  Private
 */
router.get('/permissions', auth, PermissionsController.getCurrentPermissions);

/**
 * @route   POST /api/auth/permissions/clear-cache
 * @desc    Clear permissions cache (Admin only)
 * @access  Private
 */
router.post('/permissions/clear-cache', auth, PermissionsController.clearCache);

export default router;
module.exports = router;
