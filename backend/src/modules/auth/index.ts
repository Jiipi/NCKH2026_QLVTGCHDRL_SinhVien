/**
 * Auth Module - TypeScript Index
 * Exports types and module components
 * 
 * @module modules/auth
 */

// Export all types
export type {
  // Repository types
  UserWithRelations,
  StudentWithRelations,
  CreateUserData,
  UpdateUserData,
  
  // DTO types
  LoginDto,
  RegisterDto,
  UserDto,
  LoginResult,
  RegisterResult,
  
  // Service interfaces
  IHashService,
  ITokenService,
  IOtpService,
  
  // Repository interface
  IAuthRepository,
  
  // Use case interfaces
  ILoginUseCase,
  IRegisterUseCase,
  IChangePasswordUseCase,
  IForgotPasswordUseCase,
  IResetPasswordUseCase,
  IGetMeUseCase
} from './auth.types';

// Export routes for CommonJS require() compatibility
// Use require to get the router directly (bypassing ES module wrapping)
const authRoutes = require('./presentation/routes/auth.routes');

// Handle ES module interop
const routes = authRoutes.default || authRoutes;
export { routes };

// Default export for CommonJS  
export default { routes };
