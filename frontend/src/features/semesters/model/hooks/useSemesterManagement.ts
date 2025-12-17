/**
 * useSemesterManagement Hook
 * Single Responsibility: Manage semesters data and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../../../../shared/contexts/NotificationContext';
import semestersApi from '../../services/semestersApi';

export function useSemesterManagement() {
  const { showSuccess, showError } = useNotification();
  
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSemesters = useCallback(async () => {
    try {
      setLoading(true);
      const data = await semestersApi.getSemesters();
      setSemesters(data);
    } catch (err) {
      console.error('Load semesters error:', err);
      showError('Không thể tải danh sách học kỳ');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const createSemester = useCallback(async (semesterData) => {
    try {
      setSaving(true);
      await semestersApi.createSemester(semesterData);
      showSuccess('Tạo học kỳ thành công');
      await loadSemesters();
      return true;
    } catch (err) {
      console.error('Create semester error:', err);
      showError(err.response?.data?.message || 'Không thể tạo học kỳ');
      return false;
    } finally {
      setSaving(false);
    }
  }, [showSuccess, showError, loadSemesters]);

  const updateSemester = useCallback(async (semesterId, semesterData) => {
    try {
      setSaving(true);
      await semestersApi.updateSemester(semesterId, semesterData);
      showSuccess('Cập nhật học kỳ thành công');
      await loadSemesters();
      return true;
    } catch (err) {
      console.error('Update semester error:', err);
      showError(err.response?.data?.message || 'Không thể cập nhật học kỳ');
      return false;
    } finally {
      setSaving(false);
    }
  }, [showSuccess, showError, loadSemesters]);

  const deleteSemester = useCallback(async (semesterId) => {
    try {
      setSaving(true);
      await semestersApi.deleteSemester(semesterId);
      showSuccess('Xóa học kỳ thành công');
      await loadSemesters();
      return true;
    } catch (err) {
      console.error('Delete semester error:', err);
      showError(err.response?.data?.message || 'Không thể xóa học kỳ');
      return false;
    } finally {
      setSaving(false);
    }
  }, [showSuccess, showError, loadSemesters]);

  const setActiveSemester = useCallback(async (semesterId) => {
    try {
      setSaving(true);
      await semestersApi.setActiveSemester(semesterId);
      showSuccess('Đã kích hoạt học kỳ');
      await loadSemesters();
      return true;
    } catch (err) {
      console.error('Set active semester error:', err);
      showError(err.response?.data?.message || 'Không thể kích hoạt học kỳ');
      return false;
    } finally {
      setSaving(false);
    }
  }, [showSuccess, showError, loadSemesters]);

  const toggleLock = useCallback(async (semesterId, locked) => {
    try {
      setSaving(true);
      await semestersApi.toggleSemesterLock(semesterId, locked);
      showSuccess(locked ? 'Đã khóa học kỳ' : 'Đã mở khóa học kỳ');
      await loadSemesters();
      return true;
    } catch (err) {
      console.error('Toggle lock error:', err);
      showError(err.response?.data?.message || 'Không thể thay đổi trạng thái khóa');
      return false;
    } finally {
      setSaving(false);
    }
  }, [showSuccess, showError, loadSemesters]);

  useEffect(() => {
    loadSemesters();
  }, [loadSemesters]);

  return {
    semesters,
    loading,
    saving,
    loadSemesters,
    createSemester,
    updateSemester,
    deleteSemester,
    setActiveSemester,
    toggleLock
  };
}
