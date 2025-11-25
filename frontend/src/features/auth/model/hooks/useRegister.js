/**
 * Register Hook (Tầng 2: Business Logic)
 * Xử lý logic nghiệp vụ cho đăng ký
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../services/authApi';
import { mapClassesToUI, mapFacultiesToUI } from '../mappers/auth.mappers';
import { useNotification } from '../../../../contexts/NotificationContext';

/**
 * Hook quản lý đăng ký
 */
export default function useRegister() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    maso: '',
    email: '',
    password: '',
    confirmPassword: '',
    lopId: '',
    khoa: '',
    ngaySinh: '',
    gioiTinh: '',
    diaChi: '',
    sdt: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Data state
  const [allClasses, setAllClasses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [facultiesLoading, setFacultiesLoading] = useState(true);

  // Business logic: Load classes and faculties
  const loadClassesAndFaculties = useCallback(async () => {
    try {
      setFacultiesLoading(true);
      
      const [classesResult, facultiesResult] = await Promise.all([
        authApi.getClasses(),
        authApi.getFaculties()
      ]);

      if (classesResult.success) {
        const normalized = mapClassesToUI(classesResult.data);
        setAllClasses(normalized);
        setClasses(normalized);
        
        // Extract unique faculties from classes
        const uniqueFaculties = [...new Set(normalized.map(c => c.khoa))].filter(Boolean);
        
        // Use faculties from API if available, otherwise use from classes
        if (facultiesResult.success && facultiesResult.data.length > 0) {
          const apiFaculties = mapFacultiesToUI(facultiesResult.data);
          setFaculties((apiFaculties.length ? apiFaculties : uniqueFaculties).filter(Boolean));
        } else {
          setFaculties(uniqueFaculties);
        }
      } else {
        // If classes failed, try to load faculties only
        if (facultiesResult.success) {
          const apiFaculties = mapFacultiesToUI(facultiesResult.data);
          setFaculties(apiFaculties);
        } else {
          setFaculties([]);
        }
        setAllClasses([]);
        setClasses([]);
      }
    } catch (err) {
      console.error('Error loading classes and faculties:', err);
      setAllClasses([]);
      setClasses([]);
      setFaculties([]);
    } finally {
      setFacultiesLoading(false);
    }
  }, []);

  // Load classes and faculties on mount
  useEffect(() => {
    loadClassesAndFaculties();
  }, [loadClassesAndFaculties]);

  // Filter classes when faculty changes
  useEffect(() => {
    if (formData.khoa) {
      const filtered = allClasses.filter(c => c.khoa === formData.khoa);
      setClasses(filtered);
      if (!filtered.some(c => c.id === formData.lopId)) {
        setFormData(prev => ({ ...prev, lopId: '' }));
      }
    } else {
      setClasses(allClasses);
      if (formData.lopId) {
        setFormData(prev => ({ ...prev, lopId: '' }));
      }
    }
  }, [formData.khoa, allClasses, formData.lopId]);

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
    if (!formData.name) newErrors.name = 'Vui lòng nhập họ tên';
    if (!formData.maso) newErrors.maso = 'Vui lòng nhập mã số sinh viên';
    else if (!/^\d{7}$/.test(formData.maso)) {
      newErrors.maso = 'Mã số sinh viên phải có đúng 7 chữ số';
    }
    if (!formData.email) newErrors.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';
    else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    if (!formData.khoa) newErrors.khoa = 'Vui lòng chọn khoa';
    if (!formData.ngaySinh) newErrors.ngaySinh = 'Vui lòng chọn ngày sinh';
    else {
      const birthDate = new Date(formData.ngaySinh);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 15 || age > 100) {
        newErrors.ngaySinh = 'Ngày sinh không hợp lệ (tuổi phải từ 15-100)';
      }
    }
    if (formData.sdt && !/^\d{9,10}$/.test(formData.sdt)) {
      newErrors.sdt = 'Số điện thoại không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Business logic: Handle register
  const handleRegister = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});

    try {
      const payload = {
        name: formData.name,
        maso: formData.maso,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        lopId: formData.lopId || undefined,
        khoa: formData.khoa,
        ngaySinh: formData.ngaySinh,
        gioiTinh: formData.gioiTinh || undefined,
        diaChi: formData.diaChi || undefined,
        sdt: formData.sdt || undefined
      };

      const result = await authApi.register(payload);

      if (result.success) {
        showSuccess(
          'Tài khoản của bạn đã được tạo thành công! Vui lòng đăng nhập để tiếp tục.',
          'Đăng ký thành công',
          5000
        );
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        // Handle validation errors from backend
        const validationErrors = result.error?.errors || [];
        if (Array.isArray(validationErrors) && validationErrors.length) {
          const mapped = {};
          let errorMessages = [];
          for (const e of validationErrors) {
            const field = (e?.field || e?.path || '').toString();
            const msg = e?.message || 'Dữ liệu không hợp lệ';
            const keyMap = {
              name: 'name',
              maso: 'maso',
              email: 'email',
              password: 'password',
              confirmPassword: 'confirmPassword',
              lopId: 'lopId',
              khoa: 'khoa',
              ngaySinh: 'ngaySinh',
              gioiTinh: 'gioiTinh',
              diaChi: 'diaChi',
              sdt: 'sdt'
            };
            const key = keyMap[field] || 'submit';
            if (!mapped[key]) {
              mapped[key] = msg;
              errorMessages.push(msg);
            }
          }
          if (!mapped.submit) {
            mapped.submit = result.error || 'Vui lòng kiểm tra lại các trường bị đánh dấu.';
          }
          setErrors(mapped);
          showError(
            errorMessages.length > 0
              ? errorMessages.join(', ')
              : 'Vui lòng kiểm tra lại thông tin đăng ký',
            'Đăng ký thất bại',
            6000
          );
        } else {
          const message = result.error || 'Đăng ký thất bại';
          setErrors({ submit: message });
          showError(message, 'Đăng ký thất bại', 5000);
        }
      }
    } catch (err) {
      console.error('[Register] Error:', err);
      const backendMsg = err?.response?.data?.message;
      const validationErrors = err?.response?.data?.errors;

      if (Array.isArray(validationErrors) && validationErrors.length) {
        const mapped = {};
        let errorMessages = [];
        for (const e of validationErrors) {
          const field = (e?.field || e?.path || '').toString();
          const msg = e?.message || 'Dữ liệu không hợp lệ';
          const keyMap = {
            name: 'name',
            maso: 'maso',
            email: 'email',
            password: 'password',
            confirmPassword: 'confirmPassword',
            lopId: 'lopId',
            khoa: 'khoa',
            ngaySinh: 'ngaySinh',
            gioiTinh: 'gioiTinh',
            diaChi: 'diaChi',
            sdt: 'sdt'
          };
          const key = keyMap[field] || 'submit';
          if (!mapped[key]) {
            mapped[key] = msg;
            errorMessages.push(msg);
          }
        }
        if (!mapped.submit) {
          mapped.submit = backendMsg || 'Vui lòng kiểm tra lại các trường bị đánh dấu.';
        }
        setErrors(mapped);
        showError(
          errorMessages.length > 0
            ? errorMessages.join(', ')
            : 'Vui lòng kiểm tra lại thông tin đăng ký',
          'Đăng ký thất bại',
          6000
        );
      } else {
        const message = backendMsg || 'Đăng ký thất bại';
        setErrors({ submit: message });
        showError(message, 'Đăng ký thất bại', 5000);
      }
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm, navigate, showSuccess, showError]);

  return {
    // State
    formData,
    showPassword,
    showConfirmPassword,
    errors,
    isLoading,
    allClasses,
    classes,
    faculties,
    facultiesLoading,
    
    // Actions
    handleInputChange,
    setShowPassword,
    setShowConfirmPassword,
    handleRegister
  };
}

