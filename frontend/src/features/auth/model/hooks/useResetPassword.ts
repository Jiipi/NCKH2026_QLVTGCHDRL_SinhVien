/**
 * Reset Password Hook (Tầng 2: Business Logic)
 * Xử lý logic nghiệp vụ cho đặt lại mật khẩu
 */

import { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { authApi } from '../../services/authApi';
import { useNotification } from '../../../../shared/contexts/NotificationContext';

// ============ INTERFACES ============
interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

interface ResetPasswordFormErrors {
  password?: string | null;
  confirmPassword?: string | null;
  submit?: string | null;
  [key: string]: string | null | undefined;
}

interface LocationState {
  email?: string;
  code?: string;
}

interface ResetPasswordApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

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
  const locationState = location.state as LocationState | null;
  const stateEmail = locationState?.email;
  const stateCode = locationState?.code;
  const qpEmail = searchParams.get('email');
  const qpCode = searchParams.get('code');
  const email = stateEmail || qpEmail || '';
  const code = stateCode || qpCode || '';

  // Form state
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<ResetPasswordFormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>('');

  // Validate email and code on mount
  const isValid = (email && code) || !!token;
  
  useEffect(() => {
    if (!isValid) {
      navigate('/forgot-password');
    }
  }, [email, code, token, navigate, isValid]);

  // Business logic: Handle input change
  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  // Business logic: Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: ResetPasswordFormErrors = {};
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
  const handleResetPassword = useCallback(async (e: FormEvent<HTMLFormElement>) => {
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
        const message = (!result.success && 'error' in result ? result.error : undefined) || 'Có lỗi xảy ra, vui lòng thử lại.';
        setErrors({ submit: message });
        showError(message, 'Lỗi', 5000);
      }
    } catch (err: unknown) {
      const apiError = err as ResetPasswordApiError;
      console.error('[ResetPassword] Error:', apiError);
      const backendMsg = apiError?.response?.data?.message;
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

