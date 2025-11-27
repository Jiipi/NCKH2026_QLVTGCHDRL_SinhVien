/**
 * Reset Password Page (Tầng 1: UI)
 * Chỉ render UI, không chứa business logic
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import useResetPassword from '../../../model/hooks/useResetPassword';
import '../../shared/AuthModern.css';
import AuthLayout, { AuthPanel } from '../../shared/AuthLayout';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const {
    formData,
    showPassword,
    showConfirmPassword,
    errors,
    isLoading,
    success,
    isValid,
    handleInputChange,
    setShowPassword,
    setShowConfirmPassword,
    handleResetPassword
  } = useResetPassword();

  // Hook sẽ return null nếu không có valid token hoặc email+code
  if (!isValid) {
    return null;
  }

  return (
    <AuthLayout variant="reset">
      <AuthPanel wrapperClassName="" boxClassName="box">
        <form onSubmit={handleResetPassword}>
          <h1>ĐẶT LẠI MẬT KHẨU</h1>
          
          <div className="password-login">
            <input
              className="inpt"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Mật khẩu mới"
              required
            />
            <i
              className={showPassword ? "fa fa-eye" : "fa fa-eye-slash"}
              onClick={() => setShowPassword(!showPassword)}
              style={{ cursor: 'pointer' }}
            ></i>
          </div>
          {errors.password && <div className="error-message">{errors.password}</div>}

          <div className="password-login">
            <input
              className="inpt"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Xác nhận mật khẩu mới"
              required
            />
            <i
              className={showConfirmPassword ? "fa fa-eye" : "fa fa-eye-slash"}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{ cursor: 'pointer' }}
            ></i>
          </div>
          {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}

          {errors.submit && <div className="error-message">{errors.submit}</div>}
          {success && <div className="success-message">{success}</div>}

          <button type="submit" className="btn" disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : 'ĐẶT LẠI MẬT KHẨU'}
          </button>
        </form>
        <div className="register-link">
          <p>Nhớ mật khẩu rồi? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Đăng nhập</a></p>
        </div>
      </AuthPanel>
    </AuthLayout>
  );
}
