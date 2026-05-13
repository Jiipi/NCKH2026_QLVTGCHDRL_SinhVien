/**
 * Login Page (3-Tier Architecture)
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import useLogin from '../../../model/hooks/useLogin';
import '../../shared/AuthModern.css';
import AuthLayout, { AuthPanel } from '../../shared/AuthLayout';
import AuthInput from '../../shared/AuthInput';
import AuthPasswordInput from '../../shared/AuthPasswordInput';
import AuthButton from '../../shared/AuthButton';
import AuthErrorMessage from '../../shared/AuthErrorMessage';
import AuthLink from '../../shared/AuthLink';

export default function LoginPage() {
  const navigate = useNavigate();
  const {
    formData,
    showPassword,
    errors,
    isLoading,
    handleInputChange,
    setShowPassword,
    handleLogin,
    handleFingerprintLogin
  } = useLogin();

  return (
    <AuthLayout variant="login">
      <AuthPanel>
        <form onSubmit={handleLogin} className="auth-form auth-login-form">
          <div className="auth-form-header">
            <span className="auth-form-eyebrow">Tài khoản hệ thống</span>
            <h1 className="auth-form-title">Đăng nhập</h1>
            <p className="auth-form-subtitle">
              Sử dụng mã số sinh viên, email hoặc tên đăng nhập để tiếp tục.
            </p>
          </div>

          <AuthInput
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Mã số sinh viên, email hoặc tên đăng nhập"
            icon="fa fa-envelope"
            autoComplete="username"
            required
            error={errors.username}
          />

          <AuthPasswordInput
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Mật khẩu"
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            autoComplete="current-password"
            required
            error={errors.password}
          />

          <div className="forget auth-login-options">
            <div className="auth-checkbox-row">
              <input
                type="checkbox"
                name="remember"
                id="remember-login"
                checked={formData.remember}
                onChange={handleInputChange}
              />
              <label htmlFor="remember-login">Ghi nhớ đăng nhập</label>
            </div>
            <a
              href="/forgot-password"
              onClick={(e) => {
                e.preventDefault();
                navigate('/forgot-password');
              }}
            >
              Quên mật khẩu?
            </a>
          </div>

          <AuthErrorMessage message={errors.submit} />

          <AuthButton
            type="submit"
            isLoading={isLoading}
            loadingText="Đang đăng nhập..."
          >
            Đăng nhập
          </AuthButton>
          <button
            type="button"
            onClick={handleFingerprintLogin}
            disabled={isLoading}
            className="btn auth-fingerprint-btn"
          >
            <i className="fa fa-fingerprint" aria-hidden="true" />
            Đăng nhập bằng vân tay
          </button>
        </form>

        <AuthLink to="/register" text="Đăng ký ngay">
          Chưa có tài khoản?
        </AuthLink>
      </AuthPanel>
    </AuthLayout>
  );
}
