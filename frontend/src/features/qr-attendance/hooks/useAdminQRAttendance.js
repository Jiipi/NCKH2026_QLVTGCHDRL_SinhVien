import { useCallback, useEffect, useState } from 'react';
import http from '../../../shared/api/http';
import { extractAttendanceFromAxiosResponse, extractActivitiesFromAxiosResponse } from '../../../shared/lib/apiNormalization';

export function useAdminQRAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendanceRecords = useCallback(async () => {
    try {
      setLoading(true);
      const response = await http.get('/admin/attendance');
      const normalized = extractAttendanceFromAxiosResponse(response);
      setAttendanceRecords(Array.isArray(normalized) ? normalized : []);
      return normalized;
    } catch (error) {
      console.error('Lỗi khi tải danh sách điểm danh:', error);
      setAttendanceRecords([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActivities = useCallback(async () => {
    try {
      const response = await http.get('/admin/activities');
      const normalized = extractActivitiesFromAxiosResponse(response);
      setActivities(Array.isArray(normalized) ? normalized : []);
      return normalized;
    } catch (error) {
      console.error('Lỗi khi tải danh sách hoạt động:', error);
      setActivities([]);
      return [];
    }
  }, []);

  useEffect(() => {
    // Initial load
    (async () => {
      await Promise.all([fetchAttendanceRecords(), fetchActivities()]);
    })();
  }, [fetchAttendanceRecords, fetchActivities]);

  const fetchAttendanceDetails = useCallback(async (recordId) => {
    try {
      // Backend chưa hỗ trợ: giữ nguyên hành vi cũ (no-op)
      return null;
    } catch (error) {
      console.error('Lỗi khi tải chi tiết điểm danh:', error);
      return null;
    }
  }, []);

  const getQRCodeData = useCallback((activityId) => {
    try {
      // Backend chưa hỗ trợ: giữ nguyên hành vi cũ (demo dữ liệu QR)
      const code = 'DEMO-QR-' + activityId;
      const activity = activities.find((a) => a.id === activityId) || null;
      return { code, activity };
    } catch (error) {
      console.error('Lỗi khi tạo mã QR:', error);
      throw error;
    }
  }, [activities]);

  const updateAttendanceStatus = useCallback(async (recordId, status) => {
    try {
      // Backend chưa hỗ trợ: giữ nguyên hành vi cũ (no-op) + refresh
      await fetchAttendanceRecords();
      return true;
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      return false;
    }
  }, [fetchAttendanceRecords]);

  return {
    // state
    attendanceRecords,
    activities,
    loading,
    // loaders
    refreshAttendance: fetchAttendanceRecords,
    refreshActivities: fetchActivities,
    // actions
    fetchAttendanceDetails,
    getQRCodeData,
    updateAttendanceStatus,
  };
}
