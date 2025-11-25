/**
 * Login Hook (Tầng 2: Business Logic)
 * Xử lý logic nghiệp vụ cho đăng nhập
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../services/authApi';
import { mapLoginResponse } from '../mappers/auth.mappers';
import { useAppStore } from '../../../../store/useAppStore';
import { useTabSession } from '../../../../contexts/TabSessionContext';
import { normalizeRole } from '../../../../shared/lib/role';

/**
 * Hook quản lý đăng nhập
 */
export default function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAppStore((s) => s.setAuth);
  const { saveSession: saveTabSession } = useTabSession();

  // Form state
  const [formData, setFormData] = useState({ username: '', password: '', remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Load saved remember settings
  useEffect(() => {
    try {
      const savedUsername = localStorage.getItem('remember_username');
      const savedRemember = localStorage.getItem('remember_flag');
      setFormData(prev => ({
        ...prev,
        username: savedUsername || '',
        remember: savedRemember === '1'
      }));
    } catch (err) {
      console.error('Error loading saved remember settings:', err);
    }
  }, []);

  // Business logic: Handle input change
  const handleInputChange = useCallback((e) => {
    const name = e.target.name;
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }, [errors]);

  // Business logic: Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.username) {
      newErrors.username = 'Vui lòng nhập tên đăng nhập hoặc email';
    }
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Business logic: Handle login
  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});

    try {
      const result = await authApi.login(formData);
      
      if (result.success && result.data?.token) {
        const { token, user } = result.data;
        const roleRaw = (user?.role || user?.roleCode || '').toString();
        const role = normalizeRole(roleRaw);

        // Save to tab session
        saveTabSession({ token, user, role });

        // Save to localStorage
        try {
          window.localStorage.setItem('token', token);
          window.localStorage.setItem('user', JSON.stringify(user));
        } catch (_) {}

        // Handle "Remember Me"
        try {
          if (formData.remember) {
            localStorage.setItem('remember_username', formData.username || '');
            localStorage.setItem('remember_flag', '1');
          } else {
            localStorage.removeItem('remember_username');
            localStorage.removeItem('remember_flag');
          }
        } catch (_) {}

        // Set auth state
        try {
          setAuth({ token, user, role });
        } catch (_) {}

        // Navigate based on role
        let target = '/';
        if (role === 'ADMIN') target = '/admin';
        else if (role === 'GIANG_VIEN') target = '/teacher';
        else if (role === 'LOP_TRUONG') target = '/monitor';
        else if (role === 'SINH_VIEN' || role === 'STUDENT') target = '/student';
        
        navigate(target);
      } else {
        setErrors({ submit: result.error || 'Đăng nhập thất bại' });
      }
    } catch (err) {
      console.error('[Login] Error details:', err);
      const status = err?.response?.status;
      const backendMsg = err?.response?.data?.message;
      let message;
      
      if (status === 401) {
        message = backendMsg || 'Sai tên đăng nhập hoặc mật khẩu';
      } else if (status === 500) {
        message = 'Lỗi máy chủ. Vui lòng thử lại sau.';
      } else if (err?.code === 'ECONNABORTED') {
        message = 'Kết nối quá thời gian. Vui lòng kiểm tra mạng và thử lại.';
      } else if (err?.message && /Network\s?Error/i.test(err.message)) {
        message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.';
      } else {
        message = backendMsg || 'Đăng nhập không thành công. Vui lòng kiểm tra thông tin.';
      }
      
      setErrors({ submit: message });
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm, navigate, setAuth, saveTabSession]);

  return {
    // State
    formData,
    showPassword,
    errors,
    isLoading,
    
    // Actions
    handleInputChange,
    setShowPassword,
    handleLogin
  };
}

