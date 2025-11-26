import React, { useState, useEffect, useCallback } from 'react';
import { Lock, Unlock, Bell, RefreshCw, Check, User } from 'lucide-react';
import http from '../../../../../shared/api/http';
import { useNotification } from '../../../../../shared/contexts/NotificationContext';

/**
 * Widget nhỏ gọn hiển thị các yêu cầu đóng học kỳ từ GV/LT
 * Dành cho Admin Dashboard
 */
export default function SemesterClosureRequestsWidget() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [currentSemester, setCurrentSemester] = useState(null);
  const { showSuccess, showError } = useNotification();

  // Load requests qua API mới
  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      
      // Lấy học kỳ hiện tại
      const currentRes = await http.get('/semesters/current');
      const current = currentRes.data?.data;
      setCurrentSemester(current);
      
      // Lấy closure requests qua API mới
      try {
        const reqRes = await http.get('/semesters/closure-requests');
        const data = reqRes.data?.data || [];
        
        // Chỉ lấy các request chưa đọc
        const pendingRequests = data.filter(r => !r.isRead);
        setRequests(pendingRequests);
      } catch (e) {
        console.warn('Failed to load closure requests:', e);
        setRequests([]);
      }
    } catch (e) {
      console.error('Failed to load semester:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
    // Auto refresh mỗi 30s
    const interval = setInterval(loadRequests, 30000);
    return () => clearInterval(interval);
  }, [loadRequests]);

  const formatSemester = (sem) => {
    if (!sem) return '';
    const hk = sem.semester === 'hoc_ky_1' ? 'HK1' : 'HK2';
    return `${hk} - ${sem.year}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  // Đánh dấu đã xử lý
  const handleDismiss = async (request) => {
    try {
      await http.patch(`/core/notifications/${request.id}/read`);
      showSuccess('Đã xử lý yêu cầu');
      await loadRequests();
    } catch (e) {
      showError('Không thể cập nhật');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-amber-600" />
          <span className="font-semibold text-gray-900 text-sm">Yêu cầu đóng học kỳ</span>
          {requests.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 min-w-[18px] text-center">
              {requests.length}
            </span>
          )}
        </div>
        <button 
          onClick={loadRequests}
          disabled={loading}
          className="p-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50"
          title="Làm mới"
        >
          <RefreshCw className={`w-3 h-3 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {currentSemester && (
        <div className="mb-2 px-2 py-1 rounded-md bg-blue-50 text-[11px] text-blue-700 flex items-center gap-1">
          <Unlock className="w-3 h-3" />
          Học kỳ hiện tại: <strong>{formatSemester(currentSemester)}</strong>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-3">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-600 border-t-transparent"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-3 text-gray-400">
          <Unlock className="w-6 h-6 mx-auto mb-1 opacity-50" />
          <p className="text-[11px]">Không có yêu cầu chờ xử lý</p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
          {requests.map((req) => (
            <div 
              key={req.id} 
              className="p-2 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <Bell className="w-3 h-3 text-amber-600 flex-shrink-0" />
                    <span className="text-[11px] font-medium text-gray-900 truncate">{req.title}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <User className="w-2.5 h-2.5 text-gray-400" />
                    <span className="text-[10px] text-gray-500">{req.sender?.name} ({req.sender?.role})</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">{formatDate(req.date)}</p>
                </div>
                <button
                  onClick={() => handleDismiss(req)}
                  className="p-1 rounded hover:bg-amber-200 text-amber-700 transition-colors flex-shrink-0"
                  title="Đánh dấu đã xử lý"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
