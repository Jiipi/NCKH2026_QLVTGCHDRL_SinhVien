import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  Calendar, 
  Award,
  AlertCircle,
  Eye,
  Filter,
  Search,
  FileCheck,
  Sparkles,
  RefreshCw,
  Trophy,
  Grid3X3,
  List
} from 'lucide-react';
import http from '../../../shared/api/http';
import { getActivityImage } from '../../../shared/lib/activityImages';
import ConfirmModal from '../../../components/ConfirmModal';
import Toast from '../../../components/Toast';
import ActivityDetailModal from '../../../entities/activity/ui/ActivityDetailModal';
import useSemesterData from '../../../hooks/useSemesterData';
import SemesterFilter from '../../../widgets/semester/ui/SemesterSwitcher';

export default function TeacherActivityApprovalPage() {
  const [viewMode, setViewMode] = useState('pending'); // 'pending', 'approved', 'rejected'
  const [statusViewMode, setStatusViewMode] = useState('pills'); // 'pills', 'dropdown', 'compact'
  const [displayViewMode, setDisplayViewMode] = useState('grid'); // 'grid', 'list'
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [semester, setSemester] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  
  // Modal states
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', activityId: null, title: '', message: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });
  const [detailModal, setDetailModal] = useState({ isOpen: false, activity: null });

  // Auto-detect current semester on mount
  useEffect(() => {
    const currentSemester = getCurrentSemesterValue();
    setSemester(currentSemester);
  }, []);

  useEffect(() => {
    loadActivities();
  }, [semester, viewMode]);

  // Helper function to get current semester
  const getCurrentSemesterValue = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    
    // Học kỳ 1: tháng 9 - tháng 1 (năm sau)
    // Học kỳ 2: tháng 2 - tháng 8
    if (month >= 2 && month <= 8) {
      return `hoc_ky_2-${year}`;
    } else {
      // Tháng 9-12: HK1 năm hiện tại
      // Tháng 1: HK1 năm trước
      const academicYear = month === 1 ? year - 1 : year;
      return `hoc_ky_1-${academicYear}`;
    }
  };

  // Unified semester options
  const { options: semesterOptions, isWritable } = useSemesterData(semester);

  const loadActivities = async () => {
    try {
      setLoading(true);
      
      // Luôn load tất cả hoạt động (pending + history)
      const params = { 
        page: 1, 
        limit: 100,
        search: searchTerm || undefined,
        semester: semester || undefined
      };
      
      const res = await http.get('/teacher/activities/history', { params });
      
      // Parse response
      const responseData = res.data?.data || res.data || {};
      const activities = responseData.items || responseData.data || responseData || [];
      const activitiesArray = Array.isArray(activities) ? activities : [];
      
      setActivities(activitiesArray);
      
      // Tính stats từ dữ liệu
      const total = activitiesArray.length;
      const pending = activitiesArray.filter(a => a.trang_thai === 'cho_duyet').length;
      const approved = activitiesArray.filter(a => a.trang_thai === 'da_duyet').length;
      const rejected = activitiesArray.filter(a => a.trang_thai === 'tu_choi').length;
      
      setStats({ total, pending, approved, rejected });
      setError('');
      
      console.log(`✅ Loaded ${total} activities (pending: ${pending}, approved: ${approved}, rejected: ${rejected})`);
    } catch (err) {
      console.error('Error loading activities:', err);
      setError('Không thể tải danh sách hoạt động');
      setActivities([]);
      setStats({ total: 0, pending: 0, approved: 0, rejected: 0 });
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ isOpen: true, message, type });
  };

  const handleApproveClick = (activityId) => {
    setConfirmModal({
      isOpen: true,
      type: 'approve',
      activityId,
      title: 'Xác nhận phê duyệt',
      message: 'Bạn có chắc chắn muốn phê duyệt hoạt động này không?'
    });
  };

  const handleRejectClick = (activityId) => {
    setRejectReason('');
    setConfirmModal({
      isOpen: true,
      type: 'reject',
      activityId,
      title: 'Xác nhận từ chối',
      message: 'Vui lòng nhập lý do từ chối hoạt động này:'
    });
  };

  const handleConfirmAction = async () => {
    const { type, activityId } = confirmModal;
    
    try {
      if (type === 'approve') {
        await http.post(`/teacher/activities/${activityId}/approve`);
        showToast('Phê duyệt hoạt động thành công!', 'success');
        await loadActivities();
      } else if (type === 'reject') {
        if (!rejectReason || rejectReason.trim() === '') {
          showToast('Vui lòng nhập lý do từ chối', 'warning');
          return;
        }
        await http.post(`/teacher/activities/${activityId}/reject`, { reason: rejectReason.trim() });
        showToast('Từ chối hoạt động thành công!', 'success');
        await loadActivities();
      }
      setConfirmModal({ isOpen: false, type: '', activityId: null, title: '', message: '' });
      setRejectReason('');
    } catch (err) {
      console.error('Error processing activity:', err);
      const errorMsg = err?.response?.data?.message || 'Không thể xử lý hoạt động. Vui lòng thử lại.';
      showToast(errorMsg, 'error');
    }
  };

  const handleViewDetail = (activity) => {
    setDetailModal({ isOpen: true, activity });
  };

  const filteredActivities = activities.filter(activity => {
    // Lọc theo viewMode
    let matchesViewMode = false;
    switch (viewMode) {
      case 'pending':
        matchesViewMode = activity.trang_thai === 'cho_duyet';
        break;
      case 'approved':
        matchesViewMode = activity.trang_thai === 'da_duyet';
        break;
      case 'rejected':
        matchesViewMode = activity.trang_thai === 'tu_choi';
        break;
      default:
        matchesViewMode = activity.trang_thai === 'cho_duyet';
    }
    
    const matchesSearch = activity.ten_hd.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.mo_ta?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesViewMode && matchesSearch;
  }).sort((a, b) => {
    const ta = new Date(a.ngay_cap_nhat || a.updated_at || a.updatedAt || a.ngay_tao || a.createdAt || a.ngay_bd || 0).getTime();
    const tb = new Date(b.ngay_cap_nhat || b.updated_at || b.updatedAt || b.ngay_tao || b.createdAt || b.ngay_bd || 0).getTime();
    return tb - ta; // most recent first
  });

  const statusColors = {
    'cho_duyet': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'da_duyet': 'bg-green-100 text-green-800 border-green-200',
    'tu_choi': 'bg-red-100 text-red-800 border-red-200'
  };

  const statusLabels = {
    'cho_duyet': 'Chờ duyệt',
    'da_duyet': 'Đã duyệt',
    'tu_choi': 'Từ chối'
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Có lỗi xảy ra</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={loadActivities}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header matching Monitor's registration approval page */}
      <div className="relative mb-6 rounded-3xl overflow-hidden">
        {/* Animated Grid Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600"></div>
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.1) 2px, transparent 2px)`,
              backgroundSize: '50px 50px',
              animation: 'grid-move 20s linear infinite'
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>

        {/* Floating decorative elements */}
        <div className="absolute top-8 right-12 w-20 h-20 border-4 border-white/20 transform rotate-45 animate-bounce-slow"></div>
        <div className="absolute bottom-10 left-16 w-16 h-16 bg-yellow-400/20 rounded-full blur-sm animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-12 h-12 border-4 border-green-400/30 rounded-full animate-spin-slow"></div>

        {/* Main Content */}
        <div className="relative z-10 px-6 sm:px-10 py-8 sm:py-12">
          <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl">
            {/* Top badge and semester */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-400 blur-lg opacity-50"></div>
                  <div className="relative bg-black text-green-300 px-4 py-2 font-black text-xs sm:text-sm tracking-wider transform -rotate-2 border-2 border-green-300 shadow-lg">
                    ✓ PHÊ DUYỆT HOẠT ĐỘNG
                  </div>
                </div>
                <div className="h-8 w-1 bg-white/40"></div>
                <div className="text-white/90 font-bold text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    {stats.total} HOẠT ĐỘNG
                  </div>
                </div>
              </div>
            </div>

            {/* Main Title Section */}
            <div className="mb-8">
              <h1 className="text-6xl lg:text-7xl font-black text-white mb-4 leading-none tracking-tight">
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">P</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">H</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Ê</span>
                <span className="inline-block mx-2">•</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">D</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">U</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Y</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Ệ</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">T</span>
                <br />
                <span className="relative inline-block mt-2">
                  <span className="relative z-10 text-green-400 drop-shadow-[0_0_30px_rgba(74,222,128,0.5)]">
                    HOẠT ĐỘNG
                  </span>
                  <div className="absolute -bottom-2 left-0 right-0 h-4 bg-green-400/30 blur-sm"></div>
                </span>
              </h1>
              
              <p className="text-white/80 text-xl font-medium max-w-2xl leading-relaxed">
                Xem và phê duyệt các hoạt động do sinh viên trong lớp tạo
              </p>
            </div>

            {/* Stats Bar with Brutalist Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1 - Total */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-cyan-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <Clock className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{stats.total}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">TỔNG HOẠT ĐỘNG</p>
                </div>
              </div>

              {/* Card 2 - Pending */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-yellow-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <AlertCircle className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{stats.pending}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">CHỜ DUYỆT</p>
                </div>
              </div>

              {/* Card 3 - Approved */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-green-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <CheckCircle className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{stats.approved}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">ĐÃ DUYỆT</p>
                </div>
              </div>

              {/* Card 4 - Rejected */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-red-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <XCircle className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{stats.rejected}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">TỪ CHỐI</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom CSS for animations */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes grid-move {
            0% { transform: translateY(0); }
            100% { transform: translateY(50px); }
          }
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0) rotate(45deg); }
            50% { transform: translateY(-20px) rotate(45deg); }
          }
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-bounce-slow {
            animation: bounce-slow 3s ease-in-out infinite;
          }
          .animate-spin-slow {
            animation: spin-slow 8s linear infinite;
          }
        `}} />
      </div>

      {/* Search + Filters (aligned with Monitor UI) */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-6 mb-6">
        {/* Search */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm hoạt động..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-12 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
          />
        </div>
        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Học kỳ:</span>
            <SemesterFilter value={semester} onChange={setSemester} label="" />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Hiển thị:</span>
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 border-2 border-gray-200">
              <button
                onClick={() => setDisplayViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                  displayViewMode === 'grid' 
                    ? 'bg-white shadow-md text-blue-600 border border-blue-200' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Hiển thị dạng lưới"
              >
                <Grid3X3 className="h-4 w-4" />
                <span className="hidden sm:inline">Lưới</span>
              </button>
              <button
                onClick={() => setDisplayViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                  displayViewMode === 'list' 
                    ? 'bg-white shadow-md text-blue-600 border border-blue-200' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Hiển thị dạng danh sách"
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Danh sách</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Filter Pills (like Monitor) */}
      <div className="relative group mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-pink-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
        <div className="relative bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <h3 className="text-base font-bold text-gray-900">Trạng thái</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStatusViewMode(statusViewMode === 'pills' ? 'dropdown' : statusViewMode === 'dropdown' ? 'compact' : 'pills')}
                className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                title="Chuyển chế độ hiển thị"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {statusViewMode === 'pills' && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setViewMode('pending')}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                  viewMode === 'pending'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Clock className="h-4 w-4" />
                Chờ duyệt
                {stats.pending > 0 && (
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{stats.pending}</span>
                )}
              </button>
              <button
                onClick={() => setViewMode('approved')}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                  viewMode === 'approved'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                Đã duyệt
                {stats.approved > 0 && (
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{stats.approved}</span>
                )}
              </button>
              <button
                onClick={() => setViewMode('rejected')}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                  viewMode === 'rejected'
                    ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <XCircle className="h-4 w-4" />
                Từ chối
                {stats.rejected > 0 && (
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{stats.rejected}</span>
                )}
              </button>
            </div>
          )}

          {statusViewMode === 'dropdown' && (
            <div className="flex items-center gap-3">
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all duration-200 hover:border-purple-300 font-semibold text-sm"
              >
                <option value="pending">Chờ duyệt ({stats.pending})</option>
                <option value="approved">Đã duyệt ({stats.approved})</option>
                <option value="rejected">Từ chối ({stats.rejected})</option>
              </select>
              {(() => {
                const configs = {
                  pending: { icon: Clock, gradient: 'from-yellow-500 to-orange-500', count: stats.pending },
                  approved: { icon: CheckCircle, gradient: 'from-green-500 to-emerald-500', count: stats.approved },
                  rejected: { icon: XCircle, gradient: 'from-red-500 to-rose-500', count: stats.rejected }
                };
                const currentConfig = configs[viewMode] || configs.pending;
                const CurrentIcon = currentConfig?.icon || Filter;
                return (
                  <div className={`flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r ${currentConfig?.gradient || 'from-gray-400 to-gray-500'} text-white rounded-xl shadow-md`}>
                    <CurrentIcon className="h-4 w-4" />
                    <span className="font-bold text-sm">{currentConfig?.count || 0}</span>
                  </div>
                );
              })()}
            </div>
          )}

          {statusViewMode === 'compact' && (
            <div className="flex items-center justify-between gap-3 p-3 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border border-gray-200">
              <button
                onClick={() => setViewMode('pending')}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'pending' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                }`}
                title="Chờ duyệt"
              >
                <Clock className={`h-5 w-5 ${viewMode === 'pending' ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-bold ${viewMode === 'pending' ? 'text-purple-600' : 'text-gray-600'}`}>
                  {stats.pending}
                </span>
              </button>
              <button
                onClick={() => setViewMode('approved')}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'approved' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                }`}
                title="Đã duyệt"
              >
                <CheckCircle className={`h-5 w-5 ${viewMode === 'approved' ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-bold ${viewMode === 'approved' ? 'text-purple-600' : 'text-gray-600'}`}>
                  {stats.approved}
                </span>
              </button>
              <button
                onClick={() => setViewMode('rejected')}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'rejected' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'
                }`}
                title="Từ chối"
              >
                <XCircle className={`h-5 w-5 ${viewMode === 'rejected' ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-bold ${viewMode === 'rejected' ? 'text-purple-600' : 'text-gray-600'}`}>
                  {stats.rejected}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Activities Display - Grid or List */}
      <div className={displayViewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredActivities.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-200">
            {viewMode === 'pending' && (
              <>
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-500 mb-2">Không có hoạt động chờ duyệt</h3>
                <p className="text-gray-400 text-sm">
                  {searchTerm
                    ? 'Không tìm thấy hoạt động phù hợp'
                    : semester
                    ? `Chưa có hoạt động nào cần phê duyệt trong ${(semesterOptions || []).find(opt => opt.value === semester)?.label || 'học kỳ này'}`
                    : 'Chưa có hoạt động nào cần phê duyệt'}
                </p>
              </>
            )}
            {viewMode === 'approved' && (
              <>
                <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-500 mb-2">Không có hoạt động đã duyệt</h3>
                <p className="text-gray-400 text-sm">
                  {searchTerm
                    ? 'Không tìm thấy hoạt động phù hợp'
                    : 'Chưa có hoạt động nào được phê duyệt'}
                </p>
              </>
            )}
            {viewMode === 'rejected' && (
              <>
                <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-500 mb-2">Không có hoạt động bị từ chối</h3>
                <p className="text-gray-400 text-sm">
                  {searchTerm
                    ? 'Không tìm thấy hoạt động phù hợp'
                    : 'Chưa có hoạt động nào bị từ chối'}
                </p>
              </>
            )}
          </div>
        )}

        {filteredActivities.length > 0 && filteredActivities.map(activity => (
          displayViewMode === 'list' ? (
            // List View
            <div key={activity.id} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-200"></div>
              <div className="relative bg-white border-2 border-gray-200 rounded-xl hover:shadow-lg transition-all duration-200">
                <div className="flex items-stretch gap-4 p-4">
                  {/* Image */}
                  <div className="relative w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                    <img
                      src={getActivityImage(activity.hinh_anh, activity.loai_hd?.ten_loai_hd)}
                      alt={activity.ten_hd}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    <div className="absolute top-2 left-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColors[activity.trang_thai]}`}>
                        {statusLabels[activity.trang_thai]}
                      </span>
                    </div>
                    {activity.diem_rl && (
                      <div className="absolute bottom-2 left-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/90 backdrop-blur-sm text-white shadow-sm text-xs font-bold">
                          <Award className="h-3 w-3" />+{activity.diem_rl}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-2">{activity.ten_hd}</h3>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-gray-600 truncate">{activity.loai_hd?.ten_loai_hd || 'Chưa phân loại'}</span>
                        </div>
                        {activity.ngay_bd && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-gray-900 font-medium">
                              {new Date(activity.ngay_bd).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </span>
                          </div>
                        )}
                        {activity.nguoi_tao && (
                          <div className="flex items-center gap-1.5 col-span-2">
                            <Users className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-gray-600 truncate">
                              {activity.nguoi_tao.ho_ten}
                              {activity.nguoi_tao.sinh_vien?.lop?.ten_lop && ` - ${activity.nguoi_tao.sinh_vien.lop.ten_lop}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col justify-center gap-2 flex-shrink-0">
                    {viewMode === 'pending' && activity.trang_thai === 'cho_duyet' ? (
                      <>
                        <button
                          onClick={() => handleApproveClick(activity.id)}
                          disabled={!isWritable}
                          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[90px] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Duyệt
                        </button>
                        <button
                          onClick={() => handleRejectClick(activity.id)}
                          disabled={!isWritable}
                          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[90px] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <XCircle className="h-4 w-4" />
                          Từ chối
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleViewDetail(activity)}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[90px]"
                      >
                        <Eye className="h-4 w-4" />
                        Chi tiết
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Grid View
          <div key={activity.id} className="group relative h-full">
            <div className="relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col h-full">
              {/* Activity Image */}
              <div className="relative w-full h-36 overflow-hidden">
                <img
                  src={getActivityImage(activity.hinh_anh, activity.loai_hd?.ten_loai_hd)}
                  alt={activity.ten_hd}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                {/* Status Badge */}
                <div className="absolute top-2 left-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColors[activity.trang_thai]}`}>
                    {statusLabels[activity.trang_thai]}
                  </span>
                </div>
                {activity.diem_rl && (
                  <div className="absolute bottom-2 right-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/95 backdrop-blur-sm text-white rounded-lg text-xs font-bold shadow-md">
                      <Award className="h-3 w-3" />+{activity.diem_rl}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-4 space-y-3 relative z-10">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors mb-1.5 leading-tight">{activity.ten_hd}</h3>
                  {activity.loai_hd?.ten_loai_hd && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded border border-blue-200">
                      <Calendar className="h-3 w-3" />{activity.loai_hd.ten_loai_hd}
                    </span>
                  )}
                </div>
                {/* Creator Info */}
                {activity.nguoi_tao && (
                  <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-1 ring-white">
                      {activity.nguoi_tao.ho_ten?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{activity.nguoi_tao.ho_ten || 'Không rõ tên'}</p>
                      {activity.nguoi_tao.sinh_vien?.lop?.ten_lop && (
                        <p className="text-xs text-gray-600 truncate">Lớp: {activity.nguoi_tao.sinh_vien.lop.ten_lop}</p>
                      )}
                    </div>
                  </div>
                )}
                <div className="space-y-1.5">
                  {activity.ngay_bd && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-900 font-medium">
                        {new Date(activity.ngay_bd).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                  {activity.dia_diem && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Users className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600 truncate">{activity.dia_diem}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-3 pt-0 mt-auto flex gap-2">
                {viewMode === 'pending' && activity.trang_thai === 'cho_duyet' ? (
                  <>
                    <button
                      onClick={() => handleApproveClick(activity.id)}
                      disabled={!isWritable}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />Duyệt
                    </button>
                    <button
                      onClick={() => handleRejectClick(activity.id)}
                      disabled={!isWritable}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="h-3.5 w-3.5" />Từ chối
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleViewDetail(activity)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Eye className="h-3.5 w-3.5" />Chi tiết
                  </button>
                )}
              </div>
            </div>
          </div>
          )
        ))}
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => {
          setConfirmModal({ isOpen: false, type: '', activityId: null, title: '', message: '' });
          setRejectReason('');
        }}
        onConfirm={handleConfirmAction}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type === 'approve' ? 'confirm' : 'warning'}
        confirmText={confirmModal.type === 'approve' ? 'Phê duyệt' : 'Từ chối'}
        cancelText="Hủy"
        showInput={confirmModal.type === 'reject'}
        inputPlaceholder="Nhập lý do từ chối..."
        inputValue={rejectReason}
        onInputChange={setRejectReason}
      />

      {/* Toast Notification */}
      {toast.isOpen && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ isOpen: false, message: '', type: 'success' })}
          duration={3000}
        />
      )}

      {/* Activity Detail Modal */}
      {detailModal.isOpen && detailModal.activity && (
        <ActivityDetailModal
          activityId={detailModal.activity.id}
          isOpen={detailModal.isOpen}
          onClose={() => setDetailModal({ isOpen: false, activity: null })}
        />
      )}
    </div>
  );
}
