/**
 * IOtpService Interface
 * Contract for OTP generation and verification
 * Follows Dependency Inversion Principle (DIP)
 */
class IOtpService {
  generateOtp(email) {
    throw new Error('Must implement generateOtp()');
  }

  verifyOtp(email, otp) {
    throw new Error('Must implement verifyOtp()');
  }
}

module.exports = IOtpService;

