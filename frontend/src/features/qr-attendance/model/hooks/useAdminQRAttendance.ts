import { useCallback, useEffect, useState } from 'react';
import qrApi from '../../services/qrApi';
import {
  approveAttendanceFallbackRequest,
  listActivityAttendanceFallbackRequests,
  rejectAttendanceFallbackRequest,
} from '../../services/attendanceFallbackApi';

interface AttendanceParams {
  page?: string | number;
  limit?: string | number;
  search?: string;
  activity_id?: string;
  status?: string;
}

export function useAdminQRAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [stats, setStats] = useState({ total: 0, coMat: 0, vangMat: 0, muon: 0, veSom: 0 });
  const [fallbackRequests, setFallbackRequests] = useState([]);
  const [fallbackLoading, setFallbackLoading] = useState(false);

  const fetchAttendanceRecords = useCallback(async (params: AttendanceParams = {}) => {
    try {
      setLoading(true);
      const data = await qrApi.fetchAdminAttendanceReport(params);
      
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
      const normalized = await qrApi.fetchAdminActivities();
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
    // Backend chưa hỗ trợ: giữ nguyên hành vi cũ (no-op)
    return null;
  }, []);

  const getQRCodeData = useCallback(async (activityId) => {
    try {
      let session = await qrApi.getCurrentAttendanceSession(activityId);
      if (!session?.id) {
        session = await qrApi.createAttendanceSession(activityId);
      }
      const data = await qrApi.fetchDynamicQrToken(activityId, session.id);
      const code = data.qrJson || data.qr_json || data.token || `QR-${activityId}`;
      const activity = activities.find((a) => a.id === activityId) || null;
      return { code, activity };
    } catch (error) {
      console.error('Lỗi khi tạo mã QR:', error);
      const code = `QR-${activityId}-${Date.now()}`;
      const activity = activities.find((a) => a.id === activityId) || null;
      return { code, activity };
    }
  }, [activities]);

  const updateAttendanceStatus = useCallback(async (recordId, status) => {
    try {
      await qrApi.updateAdminAttendanceStatus(recordId, status);
      await fetchAttendanceRecords();
      return true;
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      // Fallback: chỉ refresh
      await fetchAttendanceRecords();
      return false;
    }
  }, [fetchAttendanceRecords]);

  const fetchFallbackRequests = useCallback(async (activityId?: string) => {
    if (!activityId) {
      setFallbackRequests([]);
      return [];
    }
    try {
      setFallbackLoading(true);
      const data = await listActivityAttendanceFallbackRequests(activityId);
      const normalized = Array.isArray(data) ? data : [];
      setFallbackRequests(normalized);
      return normalized;
    } catch (error) {
      console.error('Lỗi khi tải yêu cầu điểm danh thủ công:', error);
      setFallbackRequests([]);
      return [];
    } finally {
      setFallbackLoading(false);
    }
  }, []);

  const approveFallbackRequest = useCallback(async (requestId: string, note?: string, activityId?: string) => {
    await approveAttendanceFallbackRequest(requestId, note);
    await Promise.all([fetchFallbackRequests(activityId), fetchAttendanceRecords()]);
  }, [fetchAttendanceRecords, fetchFallbackRequests]);

  const rejectFallbackRequest = useCallback(async (requestId: string, note: string, activityId?: string) => {
    await rejectAttendanceFallbackRequest(requestId, note);
    await fetchFallbackRequests(activityId);
  }, [fetchFallbackRequests]);

  return {
    // state
    attendanceRecords,
    activities,
    loading,
    pagination,
    stats,
    fallbackRequests,
    fallbackLoading,
    // loaders
    refreshAttendance: fetchAttendanceRecords,
    refreshActivities: fetchActivities,
    fetchAttendanceRecords, // Export để dùng với params
    // actions
    fetchAttendanceDetails,
    getQRCodeData,
    updateAttendanceStatus,
    fetchFallbackRequests,
    approveFallbackRequest,
    rejectFallbackRequest,
  };
}
