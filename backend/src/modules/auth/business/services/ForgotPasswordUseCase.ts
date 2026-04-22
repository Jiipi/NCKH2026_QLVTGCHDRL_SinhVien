/**
 * ForgotPasswordUseCase
 * Use case for requesting password reset OTP
 * Follows Single Responsibility Principle (SRP)
 */

import { logError, logInfo } from '../../../../core/logger';
import { IAuthRepository } from '../interfaces/IAuthRepository';
import { IOtpService, OtpResult } from '../interfaces/IOtpService';

interface ForgotPasswordResult {
  sent: boolean;
  otp?: string;
}

class ForgotPasswordUseCase {
  private authRepository: IAuthRepository;
  private otpService: IOtpService;

  constructor(authRepository: IAuthRepository, otpService: IOtpService) {
    this.authRepository = authRepository;
    this.otpService = otpService;
  }

  async execute(email: string): Promise<ForgotPasswordResult> {
    const trimmedEmail = email?.trim();
    logInfo('Forgot password flow started');
    
    const user = await this.authRepository.findUserByEmail(trimmedEmail);
    
    // Return success even if email doesn't exist (security best practice)
    if (!user) {
      logInfo('Forgot password requested for non-existing account');
      return { sent: false };
    }

    const otpResult = await this.otpService.generateOtp(trimmedEmail);
    const otp = typeof otpResult === 'string' ? otpResult : otpResult.otp;

    // Send OTP via email
    let mailSent = false;
    try {
      const { sendMail } = await import('../../../../core/utils/mailer');
      const subject = 'Mã xác minh đặt lại mật khẩu';
      const html = `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6">
        <p>Xin chào ${user.ho_ten || ''},</p>
        <p>Bạn vừa yêu cầu đặt lại mật khẩu. Mã xác minh (OTP) của bạn là:</p>
        <p style="font-size:24px;font-weight:bold;letter-spacing:4px">${otp}</p>
        <p>Mã có hiệu lực trong 10 phút. Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
        <p>Trân trọng.</p>
      </div>`;
      const text = `Ma xac minh dat lai mat khau: ${otp} (hieu luc 10 phut)`;
      
      const mailResult = await sendMail({ to: trimmedEmail, subject, html, text });
      mailSent = true;
      logInfo('FORGOT_MAIL_SENT', { messageId: mailResult?.messageId });
    } catch (mailErr: unknown) {
      const error = mailErr instanceof Error ? mailErr : new Error(String(mailErr));
      logError('FORGOT_MAIL_SEND_FAILED', error);
      throw error;
    }

    const result: ForgotPasswordResult = {
      sent: mailSent,
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    };
    logInfo('Forgot password flow completed', { sent: mailSent });
    return result;
  }
}

export default ForgotPasswordUseCase;
