/**
 * JwtTokenService
 * Implementation of ITokenService using JWT
 * Follows Dependency Inversion Principle (DIP)
 */

import jwt, { SignOptions } from 'jsonwebtoken';
import { ITokenService, TokenPayload, TokenServiceBase } from '../interfaces/ITokenService';
import { UserWithRole } from '../interfaces/IAuthRepository';
import config from '../../../../core/config';

class JwtTokenService extends TokenServiceBase {
  generateToken(user: UserWithRole, remember: boolean = false): string {
    const payload: object = {
      sub: user.id,
      maso: user.ten_dn,
      role: (user.vai_tro?.ten_vt || 'STUDENT').toUpperCase()
    };

    const expiresIn = remember
      ? (process.env.JWT_EXPIRES_IN_REMEMBER || '30d')
      : config.jwt.expiresIn;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return jwt.sign(payload, config.jwt.secret, { expiresIn } as any);
  }

  verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, config.jwt.secret) as TokenPayload;
    } catch {
      return null;
    }
  }
}

export default JwtTokenService;
