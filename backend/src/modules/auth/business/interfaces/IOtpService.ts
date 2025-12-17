/**
 * IOtpService Interface
 * Contract for OTP generation and verification
 * Follows Dependency Inversion Principle (DIP)
 */

export interface OtpResult {
  otp: string;
  expiresAt: Date;
}

export interface IOtpService {
  generateOtp(email: string): OtpResult | Promise<OtpResult>;
  verifyOtp(email: string, otp: string): boolean | Promise<boolean>;
}

/**
 * Abstract base class for implementations
 */
export abstract class OtpServiceBase implements IOtpService {
  abstract generateOtp(email: string): OtpResult | Promise<OtpResult>;
  abstract verifyOtp(email: string, otp: string): boolean | Promise<boolean>;
}

export default IOtpService;
