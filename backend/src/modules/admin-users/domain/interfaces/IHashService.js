/**
 * IHashService Interface
 * Contract for password hashing service
 * Follows Dependency Inversion Principle (DIP)
 */
class IHashService {
  async hash(plainText) {
    throw new Error('Must implement hash()');
  }

  async compare(plainText, hash) {
    throw new Error('Must implement compare()');
  }
}

module.exports = IHashService;

