const crypto = require('crypto');
const IOtpService = require('../interfaces/IOtpService');

/**
 * MemoryOtpService
 * In-memory OTP storage implementation
 * Replace with Redis in production
 * Follows Dependency Inversion Principle (DIP)
 */
class MemoryOtpService extends IOtpService {
  constructor() {
    super();
    this.otpMemory = new Map();
  }

  generateOtp(email) {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const hash = crypto.createHash('sha256').update(otp).digest('hex');

    this.otpMemory.set(email, {
      hash,
      created_at: new Date(),
      attempts: 0,
      used_at: null
    });

    return otp;
  }

  verifyOtp(email, otp, markAsUsed = false) {
    const record = this.otpMemory.get(email);
    if (!record) {
      console.log('[MemoryOtpService] No OTP record found for:', email);
      return false;
    }

    // Check if OTP is expired (10 minutes)
    const now = new Date();
    const age = (now - record.created_at) / 1000 / 60;
    if (age > 10) {
      console.log('[MemoryOtpService] OTP expired:', { email, age: age.toFixed(2) });
      this.otpMemory.delete(email);
      return false;
    }

    // Check if already used (only block if markAsUsed is true and already used)
    if (record.used_at) {
      console.log('[MemoryOtpService] OTP already used:', { email, used_at: record.used_at });
      return false;
    }

    // Check attempts
    if (record.attempts >= 3) {
      console.log('[MemoryOtpService] Too many attempts:', { email, attempts: record.attempts });
      this.otpMemory.delete(email);
      return false;
    }

    // Verify OTP
    const hash = crypto.createHash('sha256').update(String(otp)).digest('hex');
    const isValid = hash === record.hash;

    if (isValid) {
      // Only mark as used if explicitly requested (e.g., after password reset)
      if (markAsUsed) {
        record.used_at = now;
        console.log('[MemoryOtpService] OTP marked as used:', { email });
      } else {
        // Mark as verified but not used yet (allow one more use for password reset)
        record.verified_at = now;
        console.log('[MemoryOtpService] OTP verified (not marked as used):', { email });
      }
    } else {
      record.attempts++;
      console.log('[MemoryOtpService] OTP invalid, attempts:', { email, attempts: record.attempts });
    }

    return isValid;
  }
}

module.exports = MemoryOtpService;

