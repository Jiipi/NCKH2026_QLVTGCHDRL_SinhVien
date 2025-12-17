/**
 * ITokenService Interface
 * Contract for JWT token generation and verification
 * Follows Dependency Inversion Principle (DIP)
 */

import { UserWithRole } from './IAuthRepository';

export interface TokenPayload {
  sub: string;
  role: string;
  email: string | null;
  ho_ten: string;
  iat?: number;
  exp?: number;
}

export interface ITokenService {
  generateToken(user: UserWithRole, remember?: boolean): string;
  verifyToken(token: string): TokenPayload | null;
}

/**
 * Abstract base class for implementations
 */
export abstract class TokenServiceBase implements ITokenService {
  abstract generateToken(user: UserWithRole, remember?: boolean): string;
  abstract verifyToken(token: string): TokenPayload | null;
}

export default ITokenService;
