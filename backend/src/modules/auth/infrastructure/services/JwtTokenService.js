const jwt = require('jsonwebtoken');
const ITokenService = require('../../domain/interfaces/ITokenService');
const config = require('../../../../core/config');

/**
 * JwtTokenService
 * Implementation of ITokenService using JWT
 * Follows Dependency Inversion Principle (DIP)
 */
class JwtTokenService extends ITokenService {
  generateToken(user, remember = false) {
    const payload = {
      sub: user.id,
      maso: user.ten_dn,
      role: (user.vai_tro?.ten_vt || 'STUDENT').toUpperCase()
    };

    const expiresIn = remember
      ? (process.env.JWT_EXPIRES_IN_REMEMBER || '30d')
      : config.jwt.expiresIn;

    return jwt.sign(payload, config.jwt.secret, { expiresIn });
  }

  verifyToken(token) {
    return jwt.verify(token, config.jwt.secret);
  }
}

module.exports = JwtTokenService;

