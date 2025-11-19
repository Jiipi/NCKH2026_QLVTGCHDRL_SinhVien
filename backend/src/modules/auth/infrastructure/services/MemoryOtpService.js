const crypto = require('crypto');
const IOtpService = require('../../domain/interfaces/IOtpService');

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

  verifyOtp(email, otp) {
    const record = this.otpMemory.get(email);
    if (!record) return false;

    // Check if OTP is expired (10 minutes)
    const now = new Date();
    const age = (now - record.created_at) / 1000 / 60;
    if (age > 10) {
      this.otpMemory.delete(email);
      return false;
    }

    // Check if already used
    if (record.used_at) return false;

    // Check attempts
    if (record.attempts >= 3) {
      this.otpMemory.delete(email);
      return false;
    }

    // Verify OTP
    const hash = crypto.createHash('sha256').update(String(otp)).digest('hex');
    const isValid = hash === record.hash;

    if (isValid) {
      record.used_at = now;
    } else {
      record.attempts++;
    }

    return isValid;
  }
}

module.exports = MemoryOtpService;

