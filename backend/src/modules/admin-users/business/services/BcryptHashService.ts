/**
 * BcryptHashService
 * Implementation of IHashService using bcrypt
 * Follows Dependency Inversion Principle (DIP)
 */

import bcrypt from 'bcryptjs';
import HashServiceBase, { IHashService } from '../interfaces/IHashService';

class BcryptHashService extends HashServiceBase implements IHashService {
  private saltRounds: number;

  constructor(saltRounds: number = 10) {
    super();
    this.saltRounds = saltRounds;
  }

  async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, this.saltRounds);
  }

  async compare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }
}

export default BcryptHashService;
module.exports = BcryptHashService;
