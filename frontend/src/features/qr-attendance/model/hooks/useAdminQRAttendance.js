import { useCallback, useEffect, useState } from 'react';
import http from '../../../../shared/api/http';
import { extractActivitiesFromAxiosResponse } from '../../../../shared/lib/apiNormalization';

export function useAdminQRAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [stats, setStats] = useState({ total: 0, coMat: 0, vangMat: 0, muon: 0, veSom: 0 });

  const fetchAttendanceRecords = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.activity_id) queryParams.append('activity_id', params.activity_id);
      if (params.status) queryParams.append('status', params.status);
      
      const response = await http.get(`/admin/reports/attendance?${queryParams.toString()}`);
      const data = response.data?.data || response.data;
      
      // Parse response theo format từ GetAttendanceReportUseCase
      if (data.attendance && Array.isArray(data.attendance)) {
        setAttendanceRecords(data.attendance);
        if (data.pagination) {
          setPagination(data.pagination);
        }
        // Lưu stats từ backend
        if (data.stats) {
          setStats(data.stats);
        }
        return data.attendance;
      } else {
        // Fallback cho format cũ
        const normalized = Array.isArray(data) ? data : [];
        setAttendanceRecords(normalized);
        return normalized;
      }
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

  const getQRCodeData = useCallback(async (activityId) => {
    try {
      // Lấy QR code từ backend
      const response = await http.get(`/activities/${activityId}/qr-data`);
      const data = response.data?.data || response.data || {};
      const code = data.qr_token || data.qr || `QR-${activityId}`;
      const activity = activities.find((a) => a.id === activityId) || null;
      return { code, activity };
    } catch (error) {
      console.error('Lỗi khi tạo mã QR:', error);
      // Fallback nếu API không có
      const code = `QR-${activityId}-${Date.now()}`;
      const activity = activities.find((a) => a.id === activityId) || null;
      return { code, activity };
    }
  }, [activities]);

  const updateAttendanceStatus = useCallback(async (recordId, status) => {
    try {
      // Cập nhật trạng thái điểm danh
      await http.patch(`/admin/attendance/${recordId}`, { status });
      await fetchAttendanceRecords();
      return true;
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      // Fallback: chỉ refresh
      await fetchAttendanceRecords();
      return false;
    }
  }, [fetchAttendanceRecords]);

  return {
    // state
    attendanceRecords,
    activities,
    loading,
    pagination,
    stats,
    // loaders
    refreshAttendance: fetchAttendanceRecords,
    refreshActivities: fetchActivities,
    fetchAttendanceRecords, // Export để dùng với params
    // actions
    fetchAttendanceDetails,
    getQRCodeData,
    updateAttendanceStatus,
  };
}
