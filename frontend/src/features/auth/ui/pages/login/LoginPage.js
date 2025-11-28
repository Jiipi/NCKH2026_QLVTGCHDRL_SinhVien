/**
 * Login Page (3-Tier Architecture)
 * 
 * Tier 1: Services - authApi
 * Tier 2: Model - useLogin hook
 * Tier 3: UI - Shared components from shared/
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import useLogin from '../../../model/hooks/useLogin';
import '../../shared/AuthModern.css';
import {
  AuthLayout,
  AuthPanel,
  AuthInput,
  AuthPasswordInput,
  AuthButton,
  AuthErrorMessage,
  AuthLink
} from '../../shared';

export default function LoginPage() {
  const navigate = useNavigate();
  const {
    formData,
    showPassword,
    errors,
    isLoading,
    handleInputChange,
    setShowPassword,
    handleLogin
  } = useLogin();

  return (
    <AuthLayout variant="login">
      <AuthPanel>
        <form onSubmit={handleLogin}>
          <h1 className="auth-form-title">ĐĂNG NHẬP</h1>
          
          <AuthInput
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Mã số sinh viên hoặc Email"
            icon="fa fa-envelope"
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
            required
            error={errors.password}
          />

          <div className="forget" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                name="remember"
                id="checkbox"
                checked={formData.remember}
                onChange={handleInputChange}
                style={{ width: 16, height: 16, marginRight: 6 }}
              />
              <label htmlFor="checkbox" style={{ margin: 0 }}>Ghi nhớ đăng nhập</label>
            </div>
            <a href="/forgot-password" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}>Quên mật khẩu?</a>
          </div>

          <AuthErrorMessage message={errors.submit} />

          <AuthButton
            type="submit"
            isLoading={isLoading}
            loadingText="Đang đăng nhập..."
          >
            ĐĂNG NHẬP
          </AuthButton>
        </form>
        <AuthLink to="/register">
          Chưa có tài khoản? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>Đăng ký ngay</a>
        </AuthLink>
      </AuthPanel>
    </AuthLayout>
  );
}
