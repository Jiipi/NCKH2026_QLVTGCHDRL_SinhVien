/**
 * Reset Password Hook (Tầng 2: Business Logic)
 * Xử lý logic nghiệp vụ cho đặt lại mật khẩu
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { authApi } from '../../services/authApi';
import { useNotification } from '../../../../contexts/NotificationContext';

/**
 * Hook quản lý đặt lại mật khẩu
 */
export default function useResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { showSuccess, showError } = useNotification();

  // Extract email and code from URL params or location state
  const token = searchParams.get('token');
  const stateEmail = location.state?.email;
  const stateCode = location.state?.code;
  const qpEmail = searchParams.get('email');
  const qpCode = searchParams.get('code');
  const email = stateEmail || qpEmail || '';
  const code = stateCode || qpCode || '';

  // Form state
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Validate email and code on mount
  const isValid = (email && code) || !!token;
  
  useEffect(() => {
    if (!isValid) {
      navigate('/forgot-password');
    }
  }, [email, code, token, navigate, isValid]);

  // Business logic: Handle input change
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  // Business logic: Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu mới';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Business logic: Handle reset password
  const handleResetPassword = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    setSuccess('');

    try {
      let resetData;
      if (email && code) {
        resetData = {
          email,
          code,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        };
      } else if (token) {
        resetData = {
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        };
      } else {
        throw new Error('Token-based reset is not supported');
      }

      const result = await authApi.resetPassword(resetData);

      if (result.success) {
        setSuccess('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.');
        showSuccess('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.', 'Thành công', 3000);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        const message = result.error || 'Có lỗi xảy ra, vui lòng thử lại.';
        setErrors({ submit: message });
        showError(message, 'Lỗi', 5000);
      }
    } catch (err) {
      console.error('[ResetPassword] Error:', err);
      const backendMsg = err?.response?.data?.message;
      const message = backendMsg || 'Có lỗi xảy ra, vui lòng thử lại.';
      setErrors({ submit: message });
      showError(message, 'Lỗi', 5000);
    } finally {
      setIsLoading(false);
    }
  }, [email, code, token, formData, validateForm, navigate, showSuccess, showError]);

  return {
    // Validation
    isValid,
    // State
    formData,
    showPassword,
    showConfirmPassword,
    errors,
    isLoading,
    success,
    
    // Actions
    handleInputChange,
    setShowPassword,
    setShowConfirmPassword,
    handleResetPassword
  };
}

