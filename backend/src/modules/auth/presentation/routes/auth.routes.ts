/**
 * Auth Routes
 * Route definitions for authentication endpoints
 */

import { Router, Request, Response } from 'express';
import { createAuthController } from '../auth.factory';
import PermissionsController from '../controllers/permissions.controller';
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

const router = Router();

// Create controller with all dependencies (Dependency Injection)
const authController = createAuthController();

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
