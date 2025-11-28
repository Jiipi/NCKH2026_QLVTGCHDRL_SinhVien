/**
 * Reset Password Page (3-Tier Architecture)
 * 
 * Tier 1: Services - authApi
 * Tier 2: Model - useResetPassword hook
 * Tier 3: UI - Shared components from shared/
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import useResetPassword from '../../../model/hooks/useResetPassword';
import '../../shared/AuthModern.css';
import {
  AuthLayout,
  AuthPanel,
  AuthPasswordInput,
  AuthButton,
  AuthErrorMessage,
  AuthSuccessMessage,
  AuthLink
} from '../../shared';

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
          
          <AuthPasswordInput
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Mật khẩu mới"
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            required
            error={errors.password}
          />

          <AuthPasswordInput
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Xác nhận mật khẩu mới"
            showPassword={showConfirmPassword}
            onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
            required
            error={errors.confirmPassword}
          />

          <AuthErrorMessage message={errors.submit} />
          <AuthSuccessMessage message={success} />

          <AuthButton
            type="submit"
            isLoading={isLoading}
            loadingText="Đang xử lý..."
          >
            ĐẶT LẠI MẬT KHẨU
          </AuthButton>
        </form>
        <AuthLink to="/login">
          Nhớ mật khẩu rồi? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Đăng nhập</a>
        </AuthLink>
      </AuthPanel>
    </AuthLayout>
  );
}
