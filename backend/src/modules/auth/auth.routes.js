/**
 * Auth Routes
 * Route definitions for authentication endpoints
 */

const { Router } = require('express');
const { createAuthController } = require('./presentation/auth.factory');
const PermissionsController = require('./permissions.controller');
const { 
  validateLogin,
  validateRegister,
  validateChangePassword,
  validateForgotPassword,
  validateVerifyOtp,
  validateResetWithOtp
} = require('./auth.validators');
const { auth } = require('../../core/http/middleware/authJwt');
const { loginLimiter } = require('../../core/http/middleware/rateLimiters');

const router = Router();

// Create controller with all dependencies (Dependency Injection)
const authController = createAuthController();

/**
 * @route   POST /api/auth/login
 * @desc    Login with maso and password
 * @access  Public
 */
router.post('/login', loginLimiter, validateLogin, (req, res) => authController.login(req, res));

/**
 * @route   POST /api/auth/register
 * @desc    Register new user account
 * @access  Public
 */
router.post('/register', validateRegister, (req, res) => authController.register(req, res));

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Private
 */
router.get('/me', auth, (req, res) => authController.me(req, res));

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', auth, validateChangePassword, (req, res) => authController.changePassword(req, res));

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset OTP
 * @access  Public
 */
router.post('/forgot-password', validateForgotPassword, (req, res) => authController.forgotPassword(req, res));

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP code
 * @access  Public
 */
router.post('/verify-otp', validateVerifyOtp, (req, res) => authController.verifyOtp(req, res));

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with OTP
 * @access  Public
 */
router.post('/reset-password', validateResetWithOtp, (req, res) => authController.resetPasswordWithOtp(req, res));

/**
 * @route   GET /api/auth/faculties
 * @desc    Get list of faculties for registration
 * @access  Public
 */
router.get('/faculties', (req, res) => authController.getFaculties(req, res));

/**
 * @route   GET /api/auth/classes/:khoa
 * @desc    Get classes by faculty
 * @access  Public
 */
router.get('/classes/:khoa', (req, res) => authController.getClassesByFaculty(req, res));

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

module.exports = router;
