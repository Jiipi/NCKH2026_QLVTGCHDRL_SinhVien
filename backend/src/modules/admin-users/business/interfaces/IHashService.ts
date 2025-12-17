/**
 * IHashService Interface
 * Contract for password hashing service
 * Follows Dependency Inversion Principle (DIP)
 */

export interface IHashService {
  hash(plainText: string): Promise<string>;
  compare(plainText: string, hash: string): Promise<boolean>;
}

/**
 * Abstract base class for hash service implementations
 */
abstract class HashServiceBase implements IHashService {
  abstract hash(plainText: string): Promise<string>;
  abstract compare(plainText: string, hash: string): Promise<boolean>;
}

export default HashServiceBase;
module.exports = HashServiceBase;
