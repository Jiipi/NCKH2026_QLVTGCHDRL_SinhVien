/**
 * Teacher Attendance Hook (Tầng 2: Business Logic)
 * Xử lý logic nghiệp vụ cho điểm danh giáo viên
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { teacherAttendanceApi } from '../../services/teacherAttendanceApi';
import { mapAttendanceToUI } from '../mappers/teacher.mappers';

/**
 * Hook quản lý điểm danh của giáo viên
 */
export function useTeacherAttendance() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Business logic: Load attendance
  const load = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await teacherAttendanceApi.list(params);
      
      if (result.success) {
        setAttendanceData(result.data || []);
      } else {
        console.error('[useTeacherAttendance] Load error:', result.error);
        setError(result.error || 'Không thể tải danh sách điểm danh');
        setAttendanceData([]);
      }
    } catch (err) {
      console.error('[useTeacherAttendance] Load error:', err);
      setError(err?.message || 'Không thể tải danh sách điểm danh');
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Business logic: Transform attendance records
  const records = useMemo(() => {
    if (!attendanceData || attendanceData.length === 0) {
      return [];
    }
    return attendanceData.map(mapAttendanceToUI);
  }, [attendanceData]);

  // Business logic: Refresh
  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  // Business logic: Update attendance
  const updateAttendance = useCallback(async (attendanceId, data) => {
    try {
      const result = await teacherAttendanceApi.updateAttendance(attendanceId, data);
      if (result.success) {
        await refresh();
        return result.data;
      } else {
        setError(result.error || 'Không thể cập nhật điểm danh');
        return null;
      }
    } catch (err) {
      console.error('[useTeacherAttendance] Update error:', err);
      setError(err?.message || 'Không thể cập nhật điểm danh');
      return null;
    }
  }, [refresh]);

  // Business logic: Create attendance
  const createAttendance = useCallback(async (data) => {
    try {
      const result = await teacherAttendanceApi.createAttendance(data);
      if (result.success) {
        await refresh();
        return result.data;
      } else {
        setError(result.error || 'Không thể tạo điểm danh');
        return null;
      }
    } catch (err) {
      console.error('[useTeacherAttendance] Create error:', err);
      setError(err?.message || 'Không thể tạo điểm danh');
      return null;
    }
  }, [refresh]);

  return {
    // Data
    records,
    
    // State
    loading,
    error,
    
    // Actions
    refresh,
    updateAttendance,
    createAttendance,
    load
  };
}

