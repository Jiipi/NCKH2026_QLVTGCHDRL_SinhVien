/**
 * Auth Routes
 * Route definitions for authentication endpoints
 */

const { Router } = require('express');
const AuthController = require('./auth.controller');
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

/**
 * @route   POST /api/auth/login
 * @desc    Login with maso and password
 * @access  Public
 */
router.post('/login', loginLimiter, validateLogin, AuthController.login);

/**
 * @route   POST /api/auth/register
 * @desc    Register new user account
 * @access  Public
 */
router.post('/register', validateRegister, AuthController.register);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Private
 */
router.get('/me', auth, AuthController.me);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', auth, validateChangePassword, AuthController.changePassword);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset OTP
 * @access  Public
 */
router.post('/forgot-password', validateForgotPassword, AuthController.forgotPassword);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP code
 * @access  Public
 */
router.post('/verify-otp', validateVerifyOtp, AuthController.verifyOtp);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with OTP
 * @access  Public
 */
router.post('/reset-password', validateResetWithOtp, AuthController.resetPasswordWithOtp);

/**
 * @route   GET /api/auth/faculties
 * @desc    Get list of faculties for registration
 * @access  Public
 */
router.get('/faculties', AuthController.getFaculties);

/**
 * @route   GET /api/auth/classes/:khoa
 * @desc    Get classes by faculty
 * @access  Public
 */
router.get('/classes/:khoa', AuthController.getClassesByFaculty);

module.exports = router;
