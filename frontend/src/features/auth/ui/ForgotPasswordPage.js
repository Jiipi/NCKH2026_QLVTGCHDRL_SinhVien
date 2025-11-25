/**
 * Forgot Password Page (Tầng 1: UI)
 * Chỉ render UI, không chứa business logic
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import useForgotPassword from '../model/hooks/useForgotPassword';
import './AuthModern.css';
import AuthLayout, { AuthPanel } from './components/AuthLayout';

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
            <div className="email-login">
              <input
                className="inpt"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email đã đăng ký"
                required
              />
              <i className='fa fa-envelope'></i>
            </div>
          )}
          
          {step === 2 && (
            <div className="email-login">
              <input
                className="inpt"
                type="text"
                name="otp"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Nhập mã xác minh 6 số"
                required
              />
              <ShieldCheck className='icon-inline' />
            </div>
          )}
          
          {step === 3 && (
            <>
              <div className="email-login">
                <input
                  className="inpt"
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu mới"
                  required
                />
                <i className='fa fa-lock'></i>
              </div>
              <div className="email-login">
                <input
                  className="inpt"
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Xác nhận mật khẩu mới"
                  required
                />
                <i className='fa fa-lock'></i>
              </div>
            </>
          )}
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {step === 1 && (
            <button type="submit" className="btn" disabled={isLoading}>
              {isLoading ? 'Đang gửi...' : 'GỬI MÃ XÁC MINH'}
            </button>
          )}
          
          {step === 2 && (
            <>
              <button onClick={handleVerifyCode} className="btn" disabled={isLoading}>
                {isLoading ? 'Đang kiểm tra...' : 'XÁC MINH MÃ'}
              </button>
              <div className="register-link" style={{ marginTop: 8 }}>
                <p>Mã chưa tới? <a href="#" onClick={(e) => { e.preventDefault(); resendCode(); }}>{countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã'}</a></p>
              </div>
            </>
          )}
          
          {step === 3 && (
            <button onClick={handleResetPassword} className="btn" disabled={isLoading}>
              {isLoading ? 'Đang đặt lại...' : 'ĐẶT LẠI MẬT KHẨU'}
            </button>
          )}
        </form>
        <div className="register-link">
          <p>Nhớ mật khẩu rồi? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Đăng nhập</a></p>
        </div>
      </AuthPanel>
    </AuthLayout>
  );
}
