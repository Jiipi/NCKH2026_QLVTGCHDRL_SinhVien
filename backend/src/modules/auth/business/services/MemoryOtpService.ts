/**
 * MemoryOtpService
 * In-memory OTP storage implementation
 * Replace with Redis in production
 * Follows Dependency Inversion Principle (DIP)
 */

import crypto from 'crypto';
import { IOtpService, OtpResult, OtpServiceBase } from '../interfaces/IOtpService';
import { logInfo, logWarn } from '../../../../core/logger';

interface OtpRecord {
  hash: string;
  created_at: Date;
  attempts: number;
  used_at: Date | null;
  verified_at?: Date;
}

class MemoryOtpService extends OtpServiceBase {
  private otpMemory: Map<string, OtpRecord>;

  constructor() {
    super();
    this.otpMemory = new Map();
  }

  generateOtp(email: string): OtpResult {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const hash = crypto.createHash('sha256').update(otp).digest('hex');

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    this.otpMemory.set(email, {
      hash,
      created_at: new Date(),
      attempts: 0,
      used_at: null
    });

    return { otp, expiresAt };
  }

  verifyOtp(email: string, otp: string, markAsUsed: boolean = false): boolean {
    const record = this.otpMemory.get(email);
    if (!record) {
      logWarn('OTP verify failed: no record found');
      return false;
    }

    // Check if OTP is expired (10 minutes)
    const now = new Date();
    const age = (now.getTime() - record.created_at.getTime()) / 1000 / 60;
    if (age > 10) {
      logWarn('OTP verify failed: expired', { ageMinutes: Number(age.toFixed(2)) });
      this.otpMemory.delete(email);
      return false;
    }

    // Check if already used
    if (record.used_at) {
      logWarn('OTP verify failed: already used');
      return false;
    }

    // Check attempts
    if (record.attempts >= 3) {
      logWarn('OTP verify failed: too many attempts', { attempts: record.attempts });
      this.otpMemory.delete(email);
      return false;
    }

    // Verify OTP
    const hash = crypto.createHash('sha256').update(String(otp)).digest('hex');
    const isValid = hash === record.hash;

    if (isValid) {
      if (markAsUsed) {
        record.used_at = now;
        logInfo('OTP marked as used');
      } else {
        record.verified_at = now;
        logInfo('OTP verified');
      }
    } else {
      record.attempts++;
      logWarn('OTP verify failed: invalid code', { attempts: record.attempts });
    }

    return isValid;
  }
}

export default MemoryOtpService;
