/**
 * Login Hook (Tier 2: Business Logic)
 */

import { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../services/authApi';
import { useAppStore } from '../../../../shared/store';
import { useTabSession } from '../../../../shared/contexts/TabSessionContext';
import { normalizeRole } from '../../../../shared/lib/role';

interface LoginFormData {
  username: string;
  password: string;
  remember: boolean;
}

interface LoginFormErrors {
  username?: string;
  password?: string;
  submit?: string;
  [key: string]: string | undefined;
}

interface LoginApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  code?: string;
  message?: string;
}

interface LoginApiResult {
  success: boolean;
  data?: {
    token?: string;
    user?: Record<string, unknown>;
  };
  error?: string;
}

export default function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAppStore((s) => s.setAuth);
  const { saveSession: saveTabSession } = useTabSession();

  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
    remember: false
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof LoginFormData;
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

  const validateForm = useCallback((): boolean => {
    const newErrors: LoginFormErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Vui lòng nhập mã số sinh viên, email hoặc tên đăng nhập';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const completeLogin = useCallback((token: string, user: Record<string, unknown> | undefined | null) => {
    const userRecord = user || {};
    const roleRaw = (userRecord.role || userRecord.roleCode || '').toString();
    const role = normalizeRole(roleRaw);

    saveTabSession({ token, user, role });

    try {
      window.localStorage.setItem('token', token);
      window.localStorage.setItem('user', JSON.stringify(user));
    } catch (_) {}

    try {
      if (formData.remember) {
        localStorage.setItem('remember_username', formData.username || '');
        localStorage.setItem('remember_flag', '1');
      } else {
        localStorage.removeItem('remember_username');
        localStorage.removeItem('remember_flag');
      }
    } catch (_) {}

    try {
      setAuth({ token, user, role });
    } catch (_) {}

    let target = '/';
    if (role === 'ADMIN') target = '/admin';
    else if (role === 'GIANG_VIEN') target = '/teacher';
    else if (role === 'LOP_TRUONG') target = '/monitor';
    else if (role === 'SINH_VIEN' || role === 'STUDENT') target = '/student';

    navigate(target);
  }, [formData.remember, formData.username, navigate, saveTabSession, setAuth]);

  const handleLogin = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const result = await authApi.login(formData) as LoginApiResult;

      if (result.success && result.data?.token) {
        const { token, user } = result.data;
        completeLogin(token, user);
      } else {
        setErrors({
          submit: result.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'
        });
      }
    } catch (err: unknown) {
      const error = err as LoginApiError;
      console.error('[Login] Error details:', error);

      const status = error?.response?.status;
      const backendMsg = error?.response?.data?.message;
      let message: string;

      if (status === 401) {
        message = backendMsg || 'Sai tên đăng nhập hoặc mật khẩu';
      } else if (status === 500) {
        message = 'Lỗi máy chủ. Vui lòng thử lại sau.';
      } else if (error?.code === 'ECONNABORTED') {
        message = 'Kết nối quá thời gian. Vui lòng kiểm tra mạng và thử lại.';
      } else if (error?.message && /Network\s?Error/i.test(error.message)) {
        message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.';
      } else {
        message = backendMsg || 'Đăng nhập không thành công. Vui lòng kiểm tra thông tin.';
      }

      setErrors({ submit: message });
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm, completeLogin]);

  const handleFingerprintLogin = useCallback(async () => {
    setIsLoading(true);
    setErrors({});
    try {
      const result = await authApi.loginWithFingerprint('', formData.remember) as LoginApiResult;
      if (result.success && result.data?.token) {
        completeLogin(result.data.token, result.data.user);
        return;
      }
      setErrors({ submit: result.error || 'Đăng nhập vân tay thất bại. Vui lòng thử lại.' });
    } catch (err: unknown) {
      const error = err as LoginApiError;
      setErrors({ submit: error?.message || 'Không thể đăng nhập bằng vân tay.' });
    } finally {
      setIsLoading(false);
    }
  }, [formData.remember, completeLogin]);

  return {
    formData,
    showPassword,
    errors,
    isLoading,
    handleInputChange,
    setShowPassword,
    handleLogin,
    handleFingerprintLogin
  };
}
