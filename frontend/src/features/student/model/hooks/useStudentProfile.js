/**
 * Student Profile Hook (Tầng 2: Business Logic)
 * Xử lý logic nghiệp vụ cho profile sinh viên
 */

import { useEffect, useState, useCallback } from 'react';
import { studentProfileApi } from '../../services/studentProfileApi';
import { useNotification } from '../../../../shared/contexts/NotificationContext';
import { formatDateVN } from '../../../../shared/lib/date';

/**
 * Hook quản lý profile của sinh viên
 */
export default function useStudentProfile() {
  const { showSuccess, showError } = useNotification();

  // State
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [formData, setFormData] = useState({
    ho_ten: '',
    email: '',
    anh_dai_dien: '',
    mssv: '',
    ngay_sinh: '',
    gt: '',
    dia_chi: '',
    sdt: '',
    lop: '',
    khoa: '',
    nienkhoa: ''
  });
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });

  // Business logic: Load profile
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const timestamp = new Date().getTime();
      
      const result = await studentProfileApi.getProfile();
      
      if (!result.success) {
        showError('Không thể tải thông tin profile');
        return;
      }

      const raw = result.data || {};
      const nguoiDung = raw.nguoi_dung || raw.user || raw || {};
      const sinhVien = raw.sinh_vien || raw.student || {};
      const lopObj = sinhVien.lop || sinhVien.class || raw.lop || {};

      const normalized = {
        id: nguoiDung.id || raw.id,
        ten_dn: nguoiDung.ten_dn || nguoiDung.username || raw.ten_dn,
        email: nguoiDung.email || raw.email,
        ho_ten: nguoiDung.ho_ten || nguoiDung.name || raw.ho_ten || raw.name,
        vai_tro: nguoiDung.vai_tro || raw.vai_tro,
        roleLabel: raw.roleLabel || undefined,
        trang_thai: nguoiDung.trang_thai || nguoiDung.trangthai || raw.trang_thai,
        ngay_tao: nguoiDung.ngay_tao || nguoiDung.createdAt || raw.ngay_tao,
        ngay_cap_nhat: nguoiDung.ngay_cap_nhat || nguoiDung.updatedAt || raw.ngay_cap_nhat,
        lan_cuoi_dn: nguoiDung.lan_cuoi_dn || raw.lan_cuoi_dn,
        anh_dai_dien: nguoiDung.anh_dai_dien || raw.anh_dai_dien,
        mssv: sinhVien.mssv || raw.mssv || nguoiDung.mssv,
        ngay_sinh: sinhVien.ngay_sinh || raw.ngay_sinh || raw.ngaysinh,
        gt: sinhVien.gt || raw.gt,
        sdt: sinhVien.sdt || raw.sdt,
        dia_chi: sinhVien.dia_chi || raw.dia_chi,
        lop: lopObj.ten_lop || raw.lop,
        khoa: lopObj.khoa || raw.khoa,
        nienkhoa: lopObj.nien_khoa || raw.nien_khoa || raw.nienkhoa,
      };

      setProfile(normalized);
      setFormData({
        ho_ten: normalized.ho_ten || '',
        email: normalized.email || '',
        anh_dai_dien: normalized.anh_dai_dien || '',
        mssv: normalized.mssv || '',
        ngay_sinh: normalized.ngay_sinh ? new Date(normalized.ngay_sinh).toISOString().split('T')[0] : '',
        gt: normalized.gt || '',
        dia_chi: normalized.dia_chi || '',
        sdt: normalized.sdt || '',
        lop: normalized.lop || '',
        khoa: normalized.khoa || '',
        nienkhoa: normalized.nienkhoa || ''
      });
    } catch (error) {
      showError('Không thể tải thông tin profile');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Business logic: Update profile
  const handleUpdateProfile = useCallback(async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        ho_ten: formData.ho_ten,
        email: formData.email,
        anh_dai_dien: formData.anh_dai_dien || undefined
      };

      const result = await studentProfileApi.updateProfile(updateData);
      
      if (result.success) {
        setEditing(false);
        const updatedProfile = { ...profile, ...updateData };
        setProfile(updatedProfile);
        localStorage.setItem('profile', JSON.stringify(updatedProfile));
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('profileUpdated', { detail: { profile: updatedProfile } }));
        }, 100);
        showSuccess('Cập nhật thông tin thành công', 'Thành công', 8000);
      } else {
        showError(result.error || 'Lỗi cập nhật');
      }
    } catch (error) {
      showError('Lỗi cập nhật: ' + (error?.response?.data?.message || error?.message || ''));
    }
  }, [formData, profile, showSuccess, showError]);

  // Business logic: Change password
  const handleChangePassword = useCallback(async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      showError('Mật khẩu mới và xác nhận không khớp');
      return;
    }
    try {
      // Note: Change password endpoint might be different
      // Sử dụng API service layer
      const result = await studentProfileApi.changePassword(passwordData);
      
      if (!result.success) {
        showError(result.error || 'Lỗi đổi mật khẩu');
        return;
      }
      setChangingPassword(false);
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      showSuccess('Đổi mật khẩu thành công', 'Thành công', 8000);
    } catch (error) {
      showError('Lỗi đổi mật khẩu: ' + (error?.response?.data?.message || error?.message || ''));
    }
  }, [passwordData, showSuccess, showError]);

  // Business logic: Helper functions
  const getGenderDisplay = useCallback((gt) => {
    if (!gt) return 'Chưa cập nhật';
    const genderMap = { nam: '👨 Nam', nu: '👩 Nữ', khac: '🧑 Khác' };
    return genderMap[String(gt).toLowerCase()] || gt;
  }, []);

  const getStatusText = useCallback((status) => {
    const statusMap = { hoat_dong: '✅ Hoạt động', khoa: '🔒 Đã khóa', cho_duyet: '⏳ Chờ duyệt' };
    return statusMap[status] || status;
  }, []);

  const isValidImageUrl = useCallback((url) => {
    if (!url) return false;
    if (url.startsWith('data:image/') || url.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i) || 
        url.includes('i.pinimg.com') || url.includes('images.unsplash.com') || 
        url.includes('cdn') || url.includes('imgur.com') || url.includes('googleusercontent.com')) {
      return true;
    }
    return false;
  }, []);

  const getDirectImageUrl = useCallback((url) => {
    if (!url) return null;
    if (url.startsWith('data:image/')) return url;
    if (url.includes('drive.google.com')) {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match) return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
    return url;
  }, []);

  const canDisplayImage = profile?.anh_dai_dien && isValidImageUrl(profile.anh_dai_dien);
  const directImageUrl = getDirectImageUrl(profile?.anh_dai_dien);

  return {
    profile,
    loading,
    editing,
    setEditing,
    changingPassword,
    setChangingPassword,
    activeTab,
    setActiveTab,
    formData,
    setFormData,
    passwordData,
    setPasswordData,
    showPasswords,
    setShowPasswords,
    handleUpdateProfile,
    handleChangePassword,
    getGenderDisplay,
    getStatusText,
    canDisplayImage,
    directImageUrl,
    formatDateVN,
  };
}

