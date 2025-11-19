const AuthPrismaRepository = require('../infrastructure/repositories/AuthPrismaRepository');
const BcryptHashService = require('../../admin-users/infrastructure/services/BcryptHashService');
const JwtTokenService = require('../infrastructure/services/JwtTokenService');
const MemoryOtpService = require('../infrastructure/services/MemoryOtpService');
const LoginUseCase = require('../application/use-cases/LoginUseCase');
const RegisterUseCase = require('../application/use-cases/RegisterUseCase');
const ChangePasswordUseCase = require('../application/use-cases/ChangePasswordUseCase');
const ForgotPasswordUseCase = require('../application/use-cases/ForgotPasswordUseCase');
const ResetPasswordUseCase = require('../application/use-cases/ResetPasswordUseCase');
const GetMeUseCase = require('../application/use-cases/GetMeUseCase');
const AuthController = require('./AuthController');

/**
 * Factory for creating AuthController with all dependencies
 * Implements Dependency Injection pattern
 */
function createAuthController() {
  // Infrastructure layer
  const authRepository = new AuthPrismaRepository();
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

