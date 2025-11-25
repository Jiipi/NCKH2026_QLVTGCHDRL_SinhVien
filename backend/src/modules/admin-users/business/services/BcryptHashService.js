const bcrypt = require('bcryptjs');
const IHashService = require('../../business/interfaces/IHashService');

/**
 * BcryptHashService
 * Implementation of IHashService using bcrypt
 * Follows Dependency Inversion Principle (DIP)
 */
class BcryptHashService extends IHashService {
  constructor(saltRounds = 10) {
    super();
    this.saltRounds = saltRounds;
  }

  async hash(plainText) {
    return bcrypt.hash(plainText, this.saltRounds);
  }

  async compare(plainText, hash) {
    return bcrypt.compare(plainText, hash);
  }
}

module.exports = BcryptHashService;

