/**
 * Factory for creating AuthController with all dependencies
 * Implements Dependency Injection pattern
 */

import authRepository from '../data/repositories/auth.repository';
import BcryptHashService from '../../admin-users/business/services/BcryptHashService';
import JwtTokenService from '../business/services/JwtTokenService';
import MemoryOtpService from '../business/services/MemoryOtpService';
import LoginUseCase from '../business/services/LoginUseCase';
import RegisterUseCase from '../business/services/RegisterUseCase';
import ChangePasswordUseCase from '../business/services/ChangePasswordUseCase';
import ForgotPasswordUseCase from '../business/services/ForgotPasswordUseCase';
import ResetPasswordUseCase from '../business/services/ResetPasswordUseCase';
import GetMeUseCase from '../business/services/GetMeUseCase';
import AuthController from './controllers/auth.controller';

export function createAuthController(): AuthController {
  // Infrastructure layer - using centralized repository
  const hashService = new BcryptHashService();
  const tokenService = new JwtTokenService();
  const otpService = new MemoryOtpService();

  // Application layer (Use Cases)
  const loginUseCase = new LoginUseCase(authRepository, hashService, tokenService, otpService);
  const registerUseCase = new RegisterUseCase(authRepository as any, hashService, tokenService);
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

export default { createAuthController };
