/**
 * Forgot Password Hook (Tầng 2: Business Logic)
 * Xử lý logic nghiệp vụ cho quên mật khẩu
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../services/authApi';
import { useNotification } from '../../../../shared/contexts/NotificationContext';

/**
 * Hook quản lý quên mật khẩu
 */
export default function useForgotPassword() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  // State
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: email, 2: verify code, 3: reset password
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Business logic: Send OTP
  const handleSendOTP = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email) {
      setError('Vui lòng nhập email đã đăng ký');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authApi.forgotPassword(email);
      
      if (result.success) {
        setSuccess('Mã xác minh đã được gửi đến email (nếu email đã đăng ký). Vui lòng kiểm tra hộp thư của bạn. Lưu ý: Nếu email chưa đăng ký, bạn sẽ không nhận được mã.');
        setStep(2);
        setCountdown(60);
      } else {
        setError(result.error || 'Có lỗi xảy ra, vui lòng thử lại.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  // Business logic: Verify OTP code
  const handleVerifyCode = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!/^[0-9]{6}$/.test(code)) {
      setError('Mã OTP gồm 6 chữ số');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authApi.verifyForgotPasswordCode(email, code);
      
      if (result.success) {
        setSuccess('Xác minh thành công. Vui lòng đặt lại mật khẩu.');
        setStep(3);
      } else {
        const errMsg = result.error || 'Mã không đúng hoặc đã hết hạn.';
        if (errMsg.includes('không hợp lệ')) {
          setError('Mã không hợp lệ hoặc đã hết hạn. Nếu bạn không nhận được email, có thể địa chỉ email chưa được đăng ký trong hệ thống.');
        } else {
          setError(errMsg);
        }
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || 'Mã không đúng hoặc đã hết hạn.';
      if (errMsg.includes('không hợp lệ')) {
        setError('Mã không hợp lệ hoặc đã hết hạn. Nếu bạn không nhận được email, có thể địa chỉ email chưa được đăng ký trong hệ thống.');
      } else {
        setError(errMsg);
      }
    } finally {
      setIsLoading(false);
    }
  }, [email, code]);

  // Business logic: Reset password
  const handleResetPassword = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!password || password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);
    try {
      // Backend expects: { email, otp, newPassword }
      const result = await authApi.resetPassword({
        email: email.trim(),
        code: code.trim(), // This will be mapped to 'otp' in authApi
        password // This will be mapped to 'newPassword' in authApi
      });
      
      if (result.success) {
        setSuccess('Đặt lại mật khẩu thành công.');
        showSuccess('Đặt lại mật khẩu thành công', 'Thành công', 3000);
        setTimeout(() => navigate('/login'), 600);
      } else {
        setError(result.error || 'Không thể đặt lại mật khẩu.');
        showError(result.error || 'Không thể đặt lại mật khẩu.', 'Lỗi', 5000);
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || 'Không thể đặt lại mật khẩu.';
      setError(errMsg);
      showError(errMsg, 'Lỗi', 5000);
    } finally {
      setIsLoading(false);
    }
  }, [email, code, password, confirmPassword, navigate, showSuccess, showError]);

  // Business logic: Resend OTP
  const resendCode = useCallback(async () => {
    if (countdown > 0) return;
    
    try {
      const result = await authApi.forgotPassword(email);
      if (result.success) {
        setCountdown(60);
        setSuccess('Mã xác minh đã được gửi lại.');
      }
    } catch (_) {
      // Silent fail for resend
    }
  }, [email, countdown]);

  return {
    // State
    email,
    setEmail,
    code,
    setCode,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    step,
    countdown,
    isLoading,
    error,
    success,
    
    // Actions
    handleSendOTP,
    handleVerifyCode,
    handleResetPassword,
    resendCode
  };
}

