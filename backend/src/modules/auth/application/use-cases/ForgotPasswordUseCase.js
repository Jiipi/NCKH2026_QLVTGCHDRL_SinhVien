const { logError } = require('../../../../core/logger');

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
    const user = await this.authRepository.findUserByEmail(email);
    
    // Return success even if email doesn't exist (security best practice)
    if (!user) {
      return { sent: false };
    }

    const otp = this.otpService.generateOtp(email);

    // Send OTP via email
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
      await sendMail({ to: email, subject, html, text });
    } catch (mailErr) {
      logError('FORGOT_MAIL_SEND_FAILED', mailErr, { email });
    }

    return {
      sent: true,
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    };
  }
}

module.exports = ForgotPasswordUseCase;

