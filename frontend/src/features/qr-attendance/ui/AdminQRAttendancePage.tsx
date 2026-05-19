import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  QrCode, Download, Search, Filter, 
  Activity, CheckCircle, XCircle, Clock, AlertCircle, Eye,
  Users, Calendar, MapPin, Smartphone,
  Zap, TrendingUp, GraduationCap, FileText
} from 'lucide-react';
import { useAdminQRAttendance } from '../model/hooks/useAdminQRAttendance';
import { useNotification } from '../../../shared/contexts/NotificationContext';
import { useSemesterData } from '../../../shared/hooks';
import Pagination from '../../../shared/components/common/Pagination';
import { StudentPageHero } from '../../../shared/components/student';
import AppLoadingScreen from '../../../shared/components/common/AppLoadingScreen';
import { downloadExcelWorkbook } from '../../../shared/lib/exportExcel';
import AdminQRModal from './components/AdminQRModal';
import AdminDetailModal from './components/AdminDetailModal';
import qrApi from '../services/qrApi';

export default function AdminQRAttendancePage() {
  const location = useLocation();
  const { showSuccess, showError, showInfo } = useNotification();
  const {
    attendanceRecords,
    activities,
    loading,
    pagination,
    stats,
    refreshAttendance,
    refreshActivities,
    fetchAttendanceRecords,
    getQRCodeData,
    updateAttendanceStatus,
    fallbackRequests,
    fallbackLoading,
    fetchFallbackRequests,
    approveFallbackRequest,
    rejectFallbackRequest,
  } = useAdminQRAttendance();

  const [searchTerm, setSearchTerm] = useState('');
  const [activityFilter, setActivityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [qrCodeData, setQrCodeData] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [exporting, setExporting] = useState(false);
  const [activeSection, setActiveSection] = useState<'attendance' | 'fallback'>('attendance');
  const [fallbackNotes, setFallbackNotes] = useState<Record<string, string>>({});
  const isMonitorRoute = location.pathname.startsWith('/monitor');
  const isTeacherRoute = location.pathname.startsWith('/teacher');
  
  // Bộ lọc cho tạo QR
  const [qrSemester, setQrSemester] = useState('');
  const [qrActivityId, setQrActivityId] = useState('');
  const [classes, setClasses] = useState([]);
  const [qrClassFilter, setQrClassFilter] = useState('');
  
  // Semester options
  const { options: semesterOptions, currentSemester } = useSemesterData(qrSemester || undefined);
  
  // Set default semester
  useEffect(() => {
    if (currentSemester && !qrSemester) {
      setQrSemester(currentSemester);
    }
  }, [currentSemester, qrSemester]);
  
  // Load classes
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const items = await qrApi.fetchCoreClasses();
        setClasses(items);
      } catch (err) {
        console.warn('Không thể tải danh sách lớp', err);
      }
    };
    loadClasses();
  }, []);

  // Fetch với filters và pagination
  const fetchWithFilters = useCallback(() => {
    fetchAttendanceRecords({
      page: currentPage,
      limit: pageLimit,
      search: searchTerm || undefined,
      activity_id: activityFilter || undefined,
      status: statusFilter || undefined,
    });
  }, [currentPage, pageLimit, searchTerm, activityFilter, statusFilter, fetchAttendanceRecords]);

  useEffect(() => {
    fetchWithFilters();
  }, [fetchWithFilters]);

  useEffect(() => {
    if (activeSection === 'fallback') {
      fetchFallbackRequests(activityFilter || qrActivityId || '');
    }
  }, [activeSection, activityFilter, qrActivityId, fetchFallbackRequests]);

  // Lọc hoạt động theo học kỳ đã chọn (chỉ hoạt động đã duyệt)
  const filteredActivitiesForQR = useMemo(() => {
    if (!qrSemester) return [];
    
    // Parse semester string: "hoc_ky_1_2025" or "hoc_ky_1-2025" -> { hoc_ky: "hoc_ky_1", nam_hoc: "2025" }
    const match = qrSemester.match(/^(hoc_ky_[12])[_-](\d{4})$/);
    if (!match) return [];
    const [, hocKy, namHoc] = match;
    
    return activities.filter(a => {
      if (a.trang_thai !== 'da_duyet') return false;
      if (a.hoc_ky !== hocKy || a.nam_hoc !== namHoc) return false;
      return true;
    });
  }, [activities, qrSemester]);

  // Tính % điểm danh
  const attendanceRate = React.useMemo(() => {
    if (stats.total === 0) return 0;
    return Math.round((stats.coMat / stats.total) * 100);
  }, [stats]);

  const generateQRCode = async (activityId) => {
    try {
      showInfo('Đang tạo mã QR...', 'Đang xử lý');
      const { code, activity } = await getQRCodeData(activityId);
      setQrCodeData(code);
      setSelectedActivity(activity);
      setShowQRModal(true);
      showSuccess('Đã tạo mã QR thành công', 'Thành công');
    } catch (error) {
      console.error('Lỗi khi tạo mã QR:', error);
      showError('Không thể tạo mã QR. Vui lòng thử lại.', 'Lỗi');
    }
  };

  const handleUpdateStatus = async (recordId, status) => {
    try {
      await updateAttendanceStatus(recordId, status);
      showSuccess('Đã cập nhật trạng thái điểm danh', 'Thành công');
      fetchWithFilters();
    } catch (error) {
      showError('Không thể cập nhật trạng thái', 'Lỗi');
    }
  };

  const handleApproveFallback = async (requestId: string) => {
    try {
      await approveFallbackRequest(requestId, fallbackNotes[requestId] || '', activityFilter || qrActivityId || '');
      showSuccess('Đã duyệt yêu cầu điểm danh thủ công', 'Thành công');
      fetchWithFilters();
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Không thể duyệt yêu cầu', 'Lỗi');
    }
  };

  const handleRejectFallback = async (requestId: string) => {
    const note = (fallbackNotes[requestId] || '').trim();
    if (!note) {
      showError('Vui lòng nhập ghi chú từ chối', 'Thiếu ghi chú');
      return;
    }
    try {
      await rejectFallbackRequest(requestId, note, activityFilter || qrActivityId || '');
      showSuccess('Đã từ chối yêu cầu điểm danh thủ công', 'Thành công');
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Không thể từ chối yêu cầu', 'Lỗi');
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      showInfo('Đang xuất báo cáo...', 'Đang xử lý');
      
      const queryParams: Record<string, string> = { limit: '5000' };
      if (activityFilter) queryParams.activity_id = activityFilter;
      if (statusFilter) queryParams.status = statusFilter;
      if (searchTerm) queryParams.search = searchTerm;

      const report = await qrApi.fetchAdminAttendanceReport(queryParams);
      const records = report.attendance || [];

      if (records.length === 0) {
        showError('Không có dữ liệu để xuất', 'Lỗi');
        return;
      }

      downloadExcelWorkbook([
        {
          name: 'Điểm danh',
          rows: [
            ['MSSV', 'Họ tên', 'Lớp', 'Hoạt động', 'Thời gian điểm danh', 'Phương thức', 'Trạng thái', 'Người điểm danh'],
            ...records.map(record => [
              record.student?.mssv || '',
              record.student?.name || '',
              typeof record.student?.class === 'object'
                ? record.student?.class?.ten_lop || ''
                : record.student?.class || '',
              record.activity?.name || '',
              record.attendance?.time ? new Date(record.attendance.time).toLocaleString('vi-VN') : '',
              record.attendance?.method || '',
              record.attendance?.status === 'co_mat' ? 'Có mặt'
                : record.attendance?.status === 'vang_mat' ? 'Vắng mặt'
                  : record.attendance?.status === 'muon' ? 'Muộn'
                    : record.attendance?.status === 've_som' ? 'Về sớm'
                      : record.attendance?.status || '',
              record.checked_by?.name || '',
            ]),
          ],
        },
      ], `diem_danh_${new Date().toISOString().split('T')[0]}.xls`);
      
      showSuccess(`Đã xuất ${records.length} bản ghi điểm danh`, 'Thành công');
    } catch (error) {
      console.error('Lỗi xuất Excel:', error);
      showError('Không thể xuất báo cáo', 'Lỗi');
    } finally {
      setExporting(false);
    }
  };

  // Normalize record data từ API response
  const normalizeRecord = (record) => {
    // Format từ GetAttendanceReportUseCase
    if (record.student && record.activity && record.attendance) {
      // Handle class field - có thể là string hoặc object
      const classValue = record.student.class;
      const className = typeof classValue === 'object' && classValue !== null 
        ? (classValue.ten_lop || '') 
        : (classValue || '');
      
      return {
        id: record.id,
        sinh_vien: {
          id: record.student.id,
          mssv: record.student.mssv,
          nguoi_dung: {
            ho_ten: record.student.name,
            email: record.student.email
          },
          lop: {
            ten_lop: className
          }
        },
        hoat_dong: {
          id: record.activity.id,
          ten_hd: record.activity.name,
          ma_hd: record.activity.id,
          dia_diem: record.activity.location || '',
          diem_rl: record.activity.points,
          loai_hd: {
            ten_loai_hd: record.activity.type
          }
        },
        tg_diem_danh: record.attendance.time,
        thoi_gian_diem_danh: record.attendance.time,
        phuong_thuc: record.attendance.method,
        trang_thai_tham_gia: record.attendance.status,
        trang_thai: record.attendance.status,
        ghi_chu: record.attendance.notes,
        dia_chi_ip: record.attendance.ip_address,
        vi_tri_gps: record.attendance.gps_location,
        xac_nhan_tham_gia: record.attendance.confirmed,
        nguoi_diem_danh: record.checked_by
      };
    }
    return record;
  };

  const normalizedRecords = attendanceRecords.map(normalizeRecord);

  if (loading && normalizedRecords.length === 0) {
    return <AppLoadingScreen />;
  }

  return (
    <div className="space-y-6">
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      <div className="space-y-6">
        <StudentPageHero
          eyebrow={isMonitorRoute ? 'Không gian lớp trưởng' : isTeacherRoute ? 'Không gian giảng viên' : 'Quản lý điểm danh'}
          title="Quản lý QR điểm danh"
          description="Quản lý điểm danh bằng QR code, theo dõi trạng thái tham gia và phương thức điểm danh cho tất cả hoạt động."
          heroIcon={QrCode}
          metrics={[
            { icon: QrCode, label: 'Tổng điểm danh', value: stats.total, tone: 'text-indigo-600 dark:text-indigo-300' },
            { icon: CheckCircle, label: 'Có mặt', value: stats.coMat, tone: 'text-emerald-600 dark:text-emerald-300' },
            { icon: XCircle, label: 'Vắng mặt', value: stats.vangMat, tone: 'text-rose-600 dark:text-rose-300' },
            { icon: Clock, label: 'Muộn / Về sớm', value: stats.muon + stats.veSom, tone: 'text-amber-600 dark:text-amber-300' },
            { icon: TrendingUp, label: 'Tỷ lệ có mặt', value: `${attendanceRate}%`, tone: 'text-blue-600 dark:text-blue-300' },
          ]}
          actions={(
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-5 w-5" />
              {exporting ? 'Đang xuất...' : 'Xuất Excel'}
            </button>
          )}
        />

        {/* Quick Actions - Style đơn giản */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="h-6 w-6 text-indigo-600" />
            Tạo mã QR điểm danh
          </h3>
          
          {/* Bộ lọc học kỳ và lớp */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Học kỳ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Học kỳ
              </label>
              <select
                value={qrSemester}
                onChange={(e) => {
                  setQrSemester(e.target.value);
                  setQrActivityId(''); // Reset activity khi đổi học kỳ
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-medium bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">-- Chọn học kỳ --</option>
                {semesterOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            
            {/* Lớp (tham khảo) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <GraduationCap className="h-4 w-4 inline mr-1" />
                Lớp (tham khảo)
              </label>
              <select
                value={qrClassFilter}
                onChange={(e) => setQrClassFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-medium bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">-- Tất cả lớp --</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.ten_lop}</option>
                ))}
              </select>
            </div>
            
            {/* Hoạt động */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Activity className="h-4 w-4 inline mr-1" />
                Hoạt động ({filteredActivitiesForQR.length})
              </label>
              <select
                value={qrActivityId}
                onChange={(e) => setQrActivityId(e.target.value)}
                disabled={!qrSemester || filteredActivitiesForQR.length === 0}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-medium bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">-- Chọn hoạt động --</option>
                {filteredActivitiesForQR.map(activity => {
                  const startDate = new Date(activity.ngay_bd);
                  const now = new Date();
                  const endDate = new Date(activity.ngay_kt);
                  const isOngoing = now >= startDate && now <= endDate;
                  const isPast = now > endDate;
                  const icon = isPast ? '⚫' : isOngoing ? '🟢' : '🔵';
                  return (
                    <option key={activity.id} value={activity.id}>
                      {icon} {activity.ten_hd} - {startDate.toLocaleDateString('vi-VN')}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          
          {/* Nút tạo QR */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="p-4 bg-indigo-600 rounded-xl">
                <QrCode className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-1">Tạo mã QR cho hoạt động đã chọn</h4>
                <p className="text-sm text-gray-600 mb-3">
                  {!qrSemester 
                    ? 'Vui lòng chọn học kỳ để xem danh sách hoạt động'
                    : filteredActivitiesForQR.length === 0 
                      ? 'Không có hoạt động đã duyệt trong học kỳ này'
                      : !qrActivityId 
                        ? 'Chọn hoạt động từ dropdown bên trên'
                        : `Hoạt động: ${filteredActivitiesForQR.find(a => a.id === qrActivityId)?.ten_hd || ''}`
                  }
                </p>
                <button
                  onClick={() => qrActivityId && generateQRCode(qrActivityId)}
                  disabled={!qrActivityId}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <QrCode className="h-5 w-5" />
                  Tạo mã QR
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-2 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveSection('attendance')}
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold ${activeSection === 'attendance' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <CheckCircle className="h-4 w-4" />
            Bản ghi điểm danh
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('fallback')}
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold ${activeSection === 'fallback' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <FileText className="h-4 w-4" />
            Yêu cầu thủ công
          </button>
        </div>

        {/* Filters - Style đơn giản */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Tìm kiếm sinh viên, hoạt động, MSSV..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 focus:bg-white"
              />
            </div>
            <div className="relative">
              <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={activityFilter}
                onChange={(e) => {
                  setActivityFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-8 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 hover:bg-white cursor-pointer appearance-none min-w-[200px]"
              >
                <option value="">Tất cả hoạt động</option>
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.id}>{activity.ten_hd}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-8 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 hover:bg-white cursor-pointer appearance-none min-w-[180px]"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="co_mat">Có mặt</option>
                <option value="vang_mat">Vắng mặt</option>
                <option value="muon">Muộn</option>
                <option value="ve_som">Về sớm</option>
              </select>
            </div>
            <button
              onClick={() => {
                setSearchTerm('');
                setActivityFilter('');
                setStatusFilter('');
                setCurrentPage(1);
              }}
              className="px-6 py-3 border-2 border-gray-200 rounded-xl font-medium bg-gray-100 hover:bg-gray-200 transition-all"
            >
              Đặt lại
            </button>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Hiển thị <span className="font-semibold text-indigo-600">{normalizedRecords.length}</span> / <span className="font-semibold text-indigo-600">{pagination.total || 0}</span> điểm danh
            </p>
          </div>
        </div>

        {activeSection === 'fallback' && (
          <div className="bg-white rounded-2xl border-2 border-amber-200 shadow-lg overflow-hidden">
            {!activityFilter && !qrActivityId ? (
              <div className="p-10 text-center text-gray-600">
                <FileText className="mx-auto mb-3 h-12 w-12 text-amber-500" />
                <p className="font-bold">Chọn một hoạt động ở bộ lọc hoặc khu vực tạo QR để xem yêu cầu thủ công.</p>
              </div>
            ) : fallbackLoading ? (
              <div className="p-10 text-center font-semibold text-gray-600">Đang tải yêu cầu thủ công...</div>
            ) : fallbackRequests.length === 0 ? (
              <div className="p-10 text-center text-gray-600">
                <AlertCircle className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                <p className="font-bold">Không có yêu cầu điểm danh thủ công nào</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gradient-to-r from-amber-600 to-orange-600">
                    <tr>
                      <th className="px-6 py-4 text-left text-white font-semibold text-sm uppercase">Sinh viên</th>
                      <th className="px-6 py-4 text-left text-white font-semibold text-sm uppercase">Hoạt động</th>
                      <th className="px-6 py-4 text-left text-white font-semibold text-sm uppercase">Lý do / GPS</th>
                      <th className="px-6 py-4 text-left text-white font-semibold text-sm uppercase">Trạng thái</th>
                      <th className="px-6 py-4 text-left text-white font-semibold text-sm uppercase">Ghi chú duyệt</th>
                      <th className="px-6 py-4 text-left text-white font-semibold text-sm uppercase">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fallbackRequests.map((request: any, index) => {
                      const status = getFallbackStatusInfo(request.trang_thai);
                      return (
                        <tr key={request.id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-amber-50/40'} hover:bg-amber-50`}>
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">{request.sinh_vien?.nguoi_dung?.ho_ten || 'N/A'}</div>
                            <div className="text-sm text-gray-600">{request.sinh_vien?.mssv || 'N/A'}</div>
                            <div className="text-xs text-gray-500">{request.sinh_vien?.lop?.ten_lop || ''}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">{request.hoat_dong?.ten_hd || 'N/A'}</div>
                            <div className="text-xs text-gray-500">{request.ngay_tao ? new Date(request.ngay_tao).toLocaleString('vi-VN') : ''}</div>
                          </td>
                          <td className="px-6 py-4 max-w-sm">
                            <div className="text-sm font-medium text-gray-900 whitespace-pre-wrap">{request.ly_do}</div>
                            <div className="mt-1 text-xs text-gray-500">
                              {request.gps_latitude && request.gps_longitude ? `${request.gps_latitude}, ${request.gps_longitude}` : 'Không có GPS'}
                              {request.gps_accuracy_m ? ` • ±${Math.round(Number(request.gps_accuracy_m))}m` : ''}
                              {request.dia_chi_ip ? ` • IP ${request.dia_chi_ip}` : ''}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-gray-300 font-medium text-xs" style={{ backgroundColor: status.bg, color: status.color }}>
                              {status.icon}
                              {status.text}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {request.trang_thai === 'cho_duyet' ? (
                              <textarea
                                value={fallbackNotes[request.id] || ''}
                                onChange={(e) => setFallbackNotes(prev => ({ ...prev, [request.id]: e.target.value }))}
                                rows={2}
                                className="w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
                                placeholder="Ghi chú duyệt/từ chối"
                              />
                            ) : (
                              <div className="text-sm text-gray-700">{request.ghi_chu_duyet || '-'}</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {request.trang_thai === 'cho_duyet' ? (
                              <div className="flex gap-2">
                                <button onClick={() => handleApproveFallback(request.id)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700">Duyệt</button>
                                <button onClick={() => handleRejectFallback(request.id)} className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700">Từ chối</button>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">Đã xử lý</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Attendance Table - Style đơn giản */}
        {activeSection === 'attendance' && <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden">
          {normalizedRecords.length === 0 ? (
            <div className="text-center" style={{ padding: '60px 24px' }}>
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-bold text-gray-600">Không tìm thấy bản ghi điểm danh nào</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                    <tr>
                      <th className="px-6 py-4 text-left text-white font-semibold text-sm uppercase border-b border-white/20">Sinh viên</th>
                      <th className="px-6 py-4 text-left text-white font-semibold text-sm uppercase border-b border-white/20">Hoạt động</th>
                      <th className="px-6 py-4 text-left text-white font-semibold text-sm uppercase border-b border-white/20">Thời gian</th>
                      <th className="px-6 py-4 text-left text-white font-semibold text-sm uppercase border-b border-white/20">Phương thức</th>
                      <th className="px-6 py-4 text-left text-white font-semibold text-sm uppercase border-b border-white/20">Trạng thái</th>
                      <th className="px-6 py-4 text-left text-white font-semibold text-sm uppercase border-b border-white/20">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {normalizedRecords.map((record, index) => {
                      const statusInfo = getStatusInfo(record.trang_thai_tham_gia || record.trang_thai);
                      const methodInfo = getMethodInfo(record.phuong_thuc);
                      return (
                        <tr 
                          key={record.id} 
                          className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-50 transition-colors`}
                        >
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-bold text-gray-900">{record.sinh_vien?.nguoi_dung?.ho_ten || 'N/A'}</div>
                              <div className="text-sm text-gray-600">{record.sinh_vien?.mssv || 'N/A'}</div>
                              {record.sinh_vien?.lop?.ten_lop && (
                                <div className="text-xs text-gray-500">
                                  {typeof record.sinh_vien.lop.ten_lop === 'object' 
                                    ? record.sinh_vien.lop.ten_lop.ten_lop || JSON.stringify(record.sinh_vien.lop.ten_lop)
                                    : record.sinh_vien.lop.ten_lop}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-bold text-gray-900">{record.hoat_dong?.ten_hd || 'N/A'}</div>
                              <div className="text-sm text-gray-600 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {record.hoat_dong?.dia_diem || 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="font-bold text-gray-900 flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {record.tg_diem_danh ? new Date(record.tg_diem_danh).toLocaleDateString('vi-VN') : 'N/A'}
                              </div>
                              <div className="text-gray-600 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {record.tg_diem_danh ? new Date(record.tg_diem_danh).toLocaleTimeString('vi-VN') : 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-gray-300 font-medium text-xs shadow-sm" style={{ backgroundColor: methodInfo.bg, color: methodInfo.color }}>
                              {methodInfo.icon}
                              {methodInfo.text}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-gray-300 font-medium text-xs shadow-sm" style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}>
                              {statusInfo.icon}
                              {statusInfo.text}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setSelectedRecord(record); setShowDetailModal(true); }}
                                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
                                title="Xem chi tiết"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(record.id, 'co_mat')}
                                className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg"
                                title="Đánh dấu có mặt"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(record.id, 'vang_mat')}
                                className="p-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-all shadow-md hover:shadow-lg"
                                title="Đánh dấu vắng mặt"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {pagination.total > 0 && (
                <div className="p-6 border-t-4 border-black">
                  <Pagination
                    pagination={pagination}
                    onPageChange={(newPage) => setCurrentPage(newPage)}
                    onLimitChange={(newLimit) => { setPageLimit(newLimit); setCurrentPage(1); }}
                    itemLabel="điểm danh"
                    showLimitSelector={true}
                  />
                </div>
              )}
            </>
          )}
        </div>}
      </div>

      {/* QR Modal */}
      <AdminQRModal
        open={showQRModal}
        code={qrCodeData}
        activity={selectedActivity}
        onDownload={() => showInfo('Tính năng tải xuống QR sẽ được triển khai', 'Thông tin')}
        onClose={() => { setShowQRModal(false); setQrCodeData(''); setSelectedActivity(null); }}
      />

      {/* Detail Modal */}
      <AdminDetailModal
        open={showDetailModal}
        record={selectedRecord}
        onClose={() => { setShowDetailModal(false); setSelectedRecord(null); }}
      />
    </div>
  );
}

// Helper functions
function getStatusInfo(status) {
  switch (status) {
    case 'co_mat':
      return { bg: '#dcfce7', color: '#15803d', text: 'Có mặt', icon: <CheckCircle className="h-3 w-3" /> };
    case 'vang_mat':
      return { bg: '#fef2f2', color: '#dc2626', text: 'Vắng mặt', icon: <XCircle className="h-3 w-3" /> };
    case 'muon':
      return { bg: '#fef3c7', color: '#92400e', text: 'Muộn', icon: <Clock className="h-3 w-3" /> };
    case 've_som':
      return { bg: '#e0e7ff', color: '#3730a3', text: 'Về sớm', icon: <Clock className="h-3 w-3" /> };
    default:
      return { bg: '#f3f4f6', color: '#374151', text: 'Chưa xác định', icon: <AlertCircle className="h-3 w-3" /> };
  }
}

function getFallbackStatusInfo(status) {
  switch (status) {
    case 'cho_duyet':
      return { bg: '#fef3c7', color: '#92400e', text: 'Chờ duyệt', icon: <Clock className="h-3 w-3" /> };
    case 'da_duyet':
      return { bg: '#dcfce7', color: '#15803d', text: 'Đã duyệt', icon: <CheckCircle className="h-3 w-3" /> };
    case 'tu_choi':
      return { bg: '#fef2f2', color: '#dc2626', text: 'Từ chối', icon: <XCircle className="h-3 w-3" /> };
    case 'da_huy':
      return { bg: '#f3f4f6', color: '#374151', text: 'Đã hủy', icon: <AlertCircle className="h-3 w-3" /> };
    default:
      return { bg: '#f3f4f6', color: '#374151', text: status || 'N/A', icon: <AlertCircle className="h-3 w-3" /> };
  }
}

function getMethodInfo(method) {
  switch (method) {
    case 'qr':
      return { bg: '#dbeafe', color: '#1e40af', text: 'QR Code', icon: <QrCode className="h-3 w-3" /> };
    case 'ma_vach':
      return { bg: '#fef3c7', color: '#92400e', text: 'Mã vạch', icon: <QrCode className="h-3 w-3" /> };
    case 'truyen_thong':
      return { bg: '#e0e7ff', color: '#3730a3', text: 'Truyền thống', icon: <Users className="h-3 w-3" /> };
    case 'thu_cong_fallback':
      return { bg: '#ffedd5', color: '#c2410c', text: 'Thủ công fallback', icon: <FileText className="h-3 w-3" /> };
    default:
      return { bg: '#f3f4f6', color: '#374151', text: method || 'N/A', icon: <Smartphone className="h-3 w-3" /> };
  }
}
