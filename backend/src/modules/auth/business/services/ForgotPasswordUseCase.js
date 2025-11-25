const { logError, logInfo } = require('../../../../core/logger');

/**
 * ForgotPasswordUseCase
 * Use case for requesting password reset OTP
 * Follows Single Responsibility Principle (SRP)
 */
class ForgotPasswordUseCase {
  constructor(authRepository, otpService) {
    this.authRepository = authRepository;
    this.otpService = otpService;
  }

  async execute(email) {
    const trimmedEmail = email?.trim();
    console.log('[ForgotPasswordUseCase] Starting forgot password for:', trimmedEmail);
    
    const user = await this.authRepository.findUserByEmail(trimmedEmail);
    console.log('[ForgotPasswordUseCase] User found:', !!user, user ? { id: user.id, email: user.email } : null);
    
    // Return success even if email doesn't exist (security best practice)
    if (!user) {
      console.log('[ForgotPasswordUseCase] User not found, returning sent: false');
      return { sent: false };
    }

    const otp = this.otpService.generateOtp(trimmedEmail);
    console.log('[ForgotPasswordUseCase] OTP generated:', otp);

    // Send OTP via email
    let mailSent = false;
    try {
      const { sendMail } = require('../../../../core/utils/mailer');
      const subject = 'Mã xác minh đặt lại mật khẩu';
      const html = `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6">
        <p>Xin chào ${user.ho_ten || ''},</p>
        <p>Bạn vừa yêu cầu đặt lại mật khẩu. Mã xác minh (OTP) của bạn là:</p>
        <p style="font-size:24px;font-weight:bold;letter-spacing:4px">${otp}</p>
        <p>Mã có hiệu lực trong 10 phút. Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
        <p>Trân trọng.</p>
      </div>`;
      const text = `Ma xac minh dat lai mat khau: ${otp} (hieu luc 10 phut)`;
      
      console.log('[ForgotPasswordUseCase] Attempting to send email to:', trimmedEmail);
      const mailResult = await sendMail({ to: trimmedEmail, subject, html, text });
      console.log('[ForgotPasswordUseCase] Email sent successfully:', {
        messageId: mailResult?.messageId,
        accepted: mailResult?.accepted,
        rejected: mailResult?.rejected
      });
      mailSent = true;
      logInfo('FORGOT_MAIL_SENT', { email: trimmedEmail, messageId: mailResult?.messageId });
    } catch (mailErr) {
      console.error('[ForgotPasswordUseCase] Email send failed:', mailErr.message);
      console.error('[ForgotPasswordUseCase] Error stack:', mailErr.stack);
      logError('FORGOT_MAIL_SEND_FAILED', mailErr, { email: trimmedEmail });
      // Re-throw error so controller can handle it properly
      throw mailErr;
    }

    const result = {
      sent: mailSent,
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    };
    console.log('[ForgotPasswordUseCase] Returning result:', { sent: result.sent, hasOtp: !!result.otp });
    return result;
  }
}

module.exports = ForgotPasswordUseCase;

