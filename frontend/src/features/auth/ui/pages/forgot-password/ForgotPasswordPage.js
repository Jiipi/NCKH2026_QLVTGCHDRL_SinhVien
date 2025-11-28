/**
 * Forgot Password Page (3-Tier Architecture)
 * 
 * Tier 1: Services - authApi
 * Tier 2: Model - useForgotPassword hook
 * Tier 3: UI - Shared components from shared/
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import useForgotPassword from '../../../model/hooks/useForgotPassword';
import '../../shared/AuthModern.css';
import {
  AuthLayout,
  AuthPanel,
  AuthInput,
  AuthButton,
  AuthErrorMessage,
  AuthSuccessMessage,
  AuthLink
} from '../../shared';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const {
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
    handleSendOTP,
    handleVerifyCode,
    handleResetPassword,
    resendCode
  } = useForgotPassword();

  return (
    <AuthLayout variant="forgot">
      <AuthPanel>
        <form onSubmit={handleSendOTP}>
          <h1 className="auth-form-title">QUÊN MẬT KHẨU</h1>
          
          {step === 1 && (
            <AuthInput
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email đã đăng ký"
              icon="fa fa-envelope"
              required
            />
          )}
          
          {step === 2 && (
            <AuthInput
              type="text"
              name="otp"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Nhập mã xác minh 6 số"
              iconComponent={ShieldCheck}
              required
            />
          )}
          
          {step === 3 && (
            <>
              <AuthInput
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu mới"
                icon="fa fa-lock"
                required
              />
              <AuthInput
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Xác nhận mật khẩu mới"
                icon="fa fa-lock"
                required
              />
            </>
          )}
          
          <AuthErrorMessage message={error} />
          <AuthSuccessMessage message={success} />

          {step === 1 && (
            <AuthButton
              type="submit"
              isLoading={isLoading}
              loadingText="Đang gửi..."
            >
              GỬI MÃ XÁC MINH
            </AuthButton>
          )}
          
          {step === 2 && (
            <>
              <AuthButton
                onClick={handleVerifyCode}
                isLoading={isLoading}
                loadingText="Đang kiểm tra..."
              >
                XÁC MINH MÃ
              </AuthButton>
              <div className="register-link" style={{ marginTop: 8 }}>
                <p>Mã chưa tới? <a href="#" onClick={(e) => { e.preventDefault(); resendCode(); }}>{countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã'}</a></p>
              </div>
            </>
          )}
          
          {step === 3 && (
            <AuthButton
              onClick={handleResetPassword}
              isLoading={isLoading}
              loadingText="Đang đặt lại..."
            >
              ĐẶT LẠI MẬT KHẨU
            </AuthButton>
          )}
        </form>
        <AuthLink to="/login">
          Nhớ mật khẩu rồi? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Đăng nhập</a>
        </AuthLink>
      </AuthPanel>
    </AuthLayout>
  );
}
