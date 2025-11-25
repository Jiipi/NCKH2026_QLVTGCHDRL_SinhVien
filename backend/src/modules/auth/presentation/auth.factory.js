const authRepository = require('../data/repositories/auth.repository');
const BcryptHashService = require('../../admin-users/business/services/BcryptHashService');
const JwtTokenService = require('../business/services/JwtTokenService');
const MemoryOtpService = require('../business/services/MemoryOtpService');
const LoginUseCase = require('../business/services/LoginUseCase');
const RegisterUseCase = require('../business/services/RegisterUseCase');
const ChangePasswordUseCase = require('../business/services/ChangePasswordUseCase');
const ForgotPasswordUseCase = require('../business/services/ForgotPasswordUseCase');
const ResetPasswordUseCase = require('../business/services/ResetPasswordUseCase');
const GetMeUseCase = require('../business/services/GetMeUseCase');
const AuthController = require('./controllers/auth.controller');

/**
 * Factory for creating AuthController with all dependencies
 * Implements Dependency Injection pattern
 */
function createAuthController() {
  // Infrastructure layer - using centralized repository
  const hashService = new BcryptHashService();
  const tokenService = new JwtTokenService();
  const otpService = new MemoryOtpService();

  // Application layer (Use Cases)
  const loginUseCase = new LoginUseCase(authRepository, hashService, tokenService, otpService);
  const registerUseCase = new RegisterUseCase(authRepository, hashService, tokenService);
  const changePasswordUseCase = new ChangePasswordUseCase(authRepository, hashService);
  const forgotPasswordUseCase = new ForgotPasswordUseCase(authRepository, otpService);
  const resetPasswordUseCase = new ResetPasswordUseCase(authRepository, hashService, otpService);
  const getMeUseCase = new GetMeUseCase(authRepository);

  // Presentation layer
  const controller = new AuthController(
    loginUseCase,
    registerUseCase,
    changePasswordUseCase,
    forgotPasswordUseCase,
    resetPasswordUseCase,
    getMeUseCase,
    otpService
  );

  return controller;
}

module.exports = { createAuthController };

