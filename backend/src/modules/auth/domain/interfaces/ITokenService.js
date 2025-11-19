/**
 * ITokenService Interface
 * Contract for JWT token generation and verification
 * Follows Dependency Inversion Principle (DIP)
 */
class ITokenService {
  generateToken(user, remember = false) {
    throw new Error('Must implement generateToken()');
  }

  verifyToken(token) {
    throw new Error('Must implement verifyToken()');
  }
}

module.exports = ITokenService;

