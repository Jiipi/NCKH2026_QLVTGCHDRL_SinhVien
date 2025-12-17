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
  const [attendanceData, setAttendanceData] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Business logic: Load attendance
  const load = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await teacherAttendanceApi.list(params);
      
      if (result.success && 'data' in result) {
        setAttendanceData(result.data || []);
      } else {
        const errorMsg = 'error' in result ? result.error : 'Không thể tải danh sách điểm danh';
        console.error('[useTeacherAttendance] Load error:', errorMsg);
        setError(errorMsg);
        setAttendanceData([]);
      }
    } catch (err: unknown) {
      console.error('[useTeacherAttendance] Load error:', err);
      setError((err as Error)?.message || 'Không thể tải danh sách điểm danh');
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
  const updateAttendance = useCallback(async (attendanceId: string, data: Record<string, unknown>) => {
    try {
      const result = await teacherAttendanceApi.updateAttendance(attendanceId, data);
      if (result.success && 'data' in result) {
        await refresh();
        return result.data;
      } else {
        const errorMsg = 'error' in result ? result.error : 'Không thể cập nhật điểm danh';
        setError(errorMsg);
        return null;
      }
    } catch (err: unknown) {
      console.error('[useTeacherAttendance] Update error:', err);
      setError((err as Error)?.message || 'Không thể cập nhật điểm danh');
      return null;
    }
  }, [refresh]);

  // Business logic: Create attendance
  const createAttendance = useCallback(async (data: Record<string, unknown>) => {
    try {
      const result = await teacherAttendanceApi.createAttendance(data);
      if (result.success && 'data' in result) {
        await refresh();
        return result.data;
      } else {
        const errorMsg = 'error' in result ? result.error : 'Không thể tạo điểm danh';
        setError(errorMsg);
        return null;
      }
    } catch (err: unknown) {
      console.error('[useTeacherAttendance] Create error:', err);
      setError((err as Error)?.message || 'Không thể tạo điểm danh');
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

