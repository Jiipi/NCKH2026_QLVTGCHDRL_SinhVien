/**
 * Login Page (Tầng 1: UI)
 * Chỉ render UI, không chứa business logic
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import useLogin from '../model/hooks/useLogin';
import './AuthModern.css';
import AuthLayout, { AuthPanel } from './components/AuthLayout';

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
          <div className="email-login">
            <input
              className="inpt"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Mã số sinh viên hoặc Email"
              required
            />
            <i className='fa fa-envelope'></i>
          </div>
          {errors.username && <div className="error-message">{errors.username}</div>}

          <div className="password-login">
            <input
              className="inpt"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Mật khẩu"
              required
            />
            <i
              id="eye-login"
              className={showPassword ? "fa fa-eye" : "fa fa-eye-slash"}
              onClick={() => setShowPassword(!showPassword)}
              style={{ cursor: 'pointer' }}
            ></i>
          </div>
          {errors.password && <div className="error-message">{errors.password}</div>}

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

          {errors.submit && <div className="error-message">{errors.submit}</div>}

          <button type="submit" className="btn" disabled={isLoading}>
            {isLoading ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP'}
          </button>
        </form>
        <div className="register-link">
          <p>Chưa có tài khoản? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>Đăng ký ngay</a></p>
        </div>
      </AuthPanel>
    </AuthLayout>
  );
}
