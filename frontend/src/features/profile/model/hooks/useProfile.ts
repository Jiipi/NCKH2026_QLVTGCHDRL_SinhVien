/**
 * useProfile Hook
 * Single Responsibility: Manage profile data and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../../../../shared/contexts/NotificationContext';
import profileApi from '../../services/profileApi';

export function useProfile() {
  const { showSuccess, showError } = useNotification();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await profileApi.getProfile();
      setProfile(data);
    } catch (err) {
      console.error('Load profile error:', err);
      showError('Không thể tải thông tin cá nhân');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const updateProfile = useCallback(async (profileData) => {
    try {
      setSaving(true);
      await profileApi.updateProfile(profileData);
      showSuccess('Cập nhật thông tin thành công');
      await loadProfile();
      return true;
    } catch (err) {
      console.error('Update profile error:', err);
      showError(err.response?.data?.message || 'Không thể cập nhật thông tin');
      return false;
    } finally {
      setSaving(false);
    }
  }, [showSuccess, showError, loadProfile]);

  const changePassword = useCallback(async (passwordData) => {
    try {
      setSaving(true);
      await profileApi.changePassword(passwordData);
      showSuccess('Đổi mật khẩu thành công');
      return true;
    } catch (err) {
      console.error('Change password error:', err);
      showError(err.response?.data?.message || 'Không thể đổi mật khẩu');
      return false;
    } finally {
      setSaving(false);
    }
  }, [showSuccess, showError]);

  const uploadAvatar = useCallback(async (file) => {
    try {
      setSaving(true);
      await profileApi.uploadAvatar(file);
      showSuccess('Cập nhật ảnh đại diện thành công');
      await loadProfile();
      return true;
    } catch (err) {
      console.error('Upload avatar error:', err);
      showError('Không thể cập nhật ảnh đại diện');
      return false;
    } finally {
      setSaving(false);
    }
  }, [showSuccess, showError, loadProfile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    loading,
    saving,
    loadProfile,
    updateProfile,
    changePassword,
    uploadAvatar
  };
}
