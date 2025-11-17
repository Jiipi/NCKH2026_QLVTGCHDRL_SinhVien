import React, { useState, useEffect } from 'react';
import { 
  Clock, Calendar, MapPin, Award, Eye, 
  Filter, Search, X, AlertCircle, Trophy, 
  CheckCircle, XCircle, Sparkles, RefreshCw, SlidersHorizontal, Grid3X3, List
} from 'lucide-react';
import { useNotification } from '../../../contexts/NotificationContext';
import http from '../../../shared/api/http';
import ActivityDetailModal from '../../../entities/activity/ui/ActivityDetailModal';
import ActivityQRModal from '../../../components/ActivityQRModal';
import { getBestActivityImage } from '../../../shared/lib/activityImages';
import useSemesterData from '../../../hooks/useSemesterData';
import SemesterFilter from '../../../widgets/semester/ui/SemesterSwitcher';
import Pagination from '../../../shared/components/common/Pagination';

export default function MonitorMyActivitiesPage() {
  const [viewMode, setViewMode] = useState('pending');
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({ type: '', status: '', from: '', to: '', minPoints: '', maxPoints: '' });
  const [activityTypes, setActivityTypes] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [displayViewMode, setDisplayViewMode] = useState('grid');
  const [statusViewMode, setStatusViewMode] = useState('pills');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  const [semester, setSemester] = useState(() => {
    try { return sessionStorage.getItem('current_semester') || ''; } catch (_) { return ''; }
  });

  const { options: semesterOptions, currentSemester, isWritable } = useSemesterData(semester);
  const { showSuccess, showError, confirm } = useNotification();

  useEffect(() => { if (currentSemester && currentSemester !== semester) setSemester(currentSemester); }, [currentSemester]);
  useEffect(() => { if (semester) { try { sessionStorage.setItem('current_semester', semester); } catch (_) {} } }, [semester]);

  useEffect(() => { loadActivityTypes(); loadMyRegistrations(); }, [semester]);
  useEffect(() => { setPagination(prev => ({ ...prev, page: 1 })); }, [viewMode, searchText, filters, semester]);
  useEffect(() => { loadMyRegistrations(); }, [viewMode, searchText, filters, semester, pagination.page, pagination.limit]);

  function loadActivityTypes() {
    http.get('/core/activity-types')
      .then(res => {
        const data = res.data?.data;
        const types = Array.isArray(data) ? data : (data?.items || data?.data || []);
        setActivityTypes(types || []);
      })
      .catch(() => setActivityTypes([]));
  }

  function loadMyRegistrations() {
    setLoading(true);
    const params = { semester: semester || undefined, page: pagination.page, limit: pagination.limit };
    http.get('/core/dashboard/activities/me', { params })
      .then(res => {
        const responseData = res.data?.data || res.data || {};
        const data = responseData.items || responseData.data || responseData || [];
        const total = responseData.total || (Array.isArray(data) ? data.length : 0);
        setMyRegistrations(Array.isArray(data) ? data : []);
        setPagination(prev => ({ ...prev, total }));
        const points = (Array.isArray(data) ? data : [])
          .filter(reg => reg.trang_thai_dk === 'da_tham_gia')
          .reduce((sum, reg) => sum + (parseFloat(reg.hoat_dong?.diem_rl) || 0), 0);
        setTotalPoints(points);
      })
      .catch(() => { setMyRegistrations([]); setPagination(prev => ({ ...prev, total: 0 })); })
      .finally(() => setLoading(false));
  }

  async function handleCancel(hdId, activityName) {
    if (!isWritable) return;
    const confirmed = await confirm({ title: 'Xác nhận hủy đăng ký', message: `Bạn có chắc muốn hủy đăng ký hoạt động "${activityName}"?`, confirmText: 'Hủy đăng ký', cancelText: 'Không' });
    if (!confirmed) return;
    http.post(`/core/registrations/${hdId}/cancel`)
      .then(res => { showSuccess(res.data?.message || 'Hủy đăng ký thành công'); loadMyRegistrations(); })
      .catch(err => showError(err?.response?.data?.message || 'Hủy đăng ký thất bại'));
  }

  function handleViewDetail(activityId) { setSelectedActivity(activityId); setShowDetailModal(true); }
  function handleShowQR(activityId, activityName) { setSelectedActivity({ id: activityId, ten_hd: activityName }); setShowQRModal(true); }

  function getFilteredRegistrations() {
    let filtered = myRegistrations;
    if (viewMode === 'pending') filtered = filtered.filter(r => r.trang_thai_dk === 'cho_duyet');
    else if (viewMode === 'approved') filtered = filtered.filter(r => r.trang_thai_dk === 'da_duyet');
    else if (viewMode === 'joined') filtered = filtered.filter(r => r.trang_thai_dk === 'da_tham_gia');
    else if (viewMode === 'rejected') filtered = filtered.filter(r => r.trang_thai_dk === 'tu_choi');
    if (searchText) filtered = filtered.filter(reg => reg.hoat_dong?.ten_hd?.toLowerCase().includes(searchText.toLowerCase()));
    if (filters.type) {
      filtered = filtered.filter(reg => {
        const activity = reg.hoat_dong || {};
        const filterValue = filters.type;
        const activityTypeName = typeof activity.loai === 'string' ? activity.loai : (activity.loai?.name || activity.loai_hd?.ten_loai_hd || '');
        const activityTypeId = activity.loai_hd_id || activity.loai_hd?.id;
        if (activityTypeName && activityTypeName.toLowerCase() === filterValue.toLowerCase()) return true;
        const filterId = parseInt(filterValue);
        if (!isNaN(filterId) && activityTypeId) return parseInt(activityTypeId) === filterId;
        return false;
      });
    }
    if (filters.minPoints) { const minPoints = parseFloat(filters.minPoints); if (!isNaN(minPoints)) filtered = filtered.filter(reg => (parseFloat(reg.hoat_dong?.diem_rl) || 0) >= minPoints); }
    if (filters.maxPoints) { const maxPoints = parseFloat(filters.maxPoints); if (!isNaN(maxPoints)) filtered = filtered.filter(reg => (parseFloat(reg.hoat_dong?.diem_rl) || 0) <= maxPoints); }
    if (filters.from) { const fromDate = new Date(filters.from); fromDate.setHours(0,0,0,0); filtered = filtered.filter(reg => reg.hoat_dong?.ngay_bd && new Date(reg.hoat_dong.ngay_bd).setHours(0,0,0,0) >= fromDate.getTime()); }
    if (filters.to) { const toDate = new Date(filters.to); toDate.setHours(23,59,59,999); filtered = filtered.filter(reg => reg.hoat_dong?.ngay_bd && new Date(reg.hoat_dong.ngay_bd) <= toDate); }
    return filtered;
  }

  function parseDateSafe(dateStr) { if (!dateStr) return null; try { return new Date(dateStr); } catch { return null; } }
  function formatDate(dateStr) { const date = parseDateSafe(dateStr); return date ? date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'; }
  function getStatusBadge(status) {
    const badges = {
      'cho_duyet': { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      'da_duyet': { label: 'Đã duyệt', color: 'bg-green-100 text-green-700 border-green-200' },
      'tu_choi': { label: 'Từ chối', color: 'bg-red-100 text-red-700 border-red-200' },
      'da_tham_gia': { label: 'Đã tham gia', color: 'bg-blue-100 text-blue-700 border-blue-200' }
    };
    const badge = badges[status] || badges['cho_duyet'];
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
        {status === 'da_duyet' && <CheckCircle className="h-3 w-3" />}
        {status === 'tu_choi' && <XCircle className="h-3 w-3" />}
        {status === 'da_tham_gia' && <Trophy className="h-3 w-3" />}
        {badge.label}
      </span>
    );
  }
  function getActiveFilterCount() { let count = 0; if (filters.type) count++; if (filters.from) count++; if (filters.to) count++; if (filters.minPoints) count++; if (filters.maxPoints) count++; return count; }
  function clearAllFilters() { setFilters({ type: '', status: '', from: '', to: '', minPoints: '', maxPoints: '' }); setSearchText(''); }

  const totalActivities = myRegistrations.length;
  const filteredRegs = getFilteredRegistrations();

  return (
    <div className="space-y-6">
      <div className="relative min-h-[280px]">
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-600 via-purple-600 to-blue-600"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),\n                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            animation: 'grid-move 20s linear infinite'
          }}></div>
        </div>
        <div className="absolute top-10 right-20 w-20 h-20 border-4 border-white/30 rotate-45 animate-bounce-slow"></div>
        <div className="absolute bottom-10 left-16 w-16 h-16 bg-yellow-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-1/3 w-12 h-12 border-4 border-pink-300/40 rounded-full animate-spin-slow"></div>
        <div className="relative z-10 p-8">
          <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative bg-black text-yellow-400 px-4 py-2 font-black text-sm tracking-wider transform -rotate-2 shadow-lg border-2 border-yellow-400">
                    ⭐ CỦA TÔI
                  </div>
                </div>
                <div className="h-8 w-1 bg-white/40"></div>
                <div className="text-white/90 font-bold text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    {totalActivities} HOẠT ĐỘNG
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-8">
              <h1 className="text-6xl lg:text-7xl font-black text-white mb-4 leading-none tracking-tight">
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">H</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">O</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Ạ</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">T</span>
                <span className="inline-block mx-2">•</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Đ</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Ộ</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">N</span>
                <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">G</span>
                <br />
                <span className="relative inline-block mt-2">
                  <span className="relative z-10 text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)]">CỦA TÔI</span>
                  <div className="absolute -bottom-2 left-0 right-0 h-4 bg-yellow-400/30 blur-sm"></div>
                </span>
              </h1>
              <p className="text-white/80 text-xl font-medium max-w-2xl leading-relaxed">Theo dõi, quản lý và chinh phục các hoạt động rèn luyện bạn đã đăng ký</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-yellow-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <Clock className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{myRegistrations.filter(r => r.trang_thai_dk === 'cho_duyet').length}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">CHỜ DUYỆT</p>
                </div>
              </div>
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-green-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <CheckCircle className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{myRegistrations.filter(r => r.trang_thai_dk === 'da_duyet').length}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">ĐÃ DUYỆT</p>
                </div>
              </div>
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-blue-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <Trophy className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{myRegistrations.filter(r => r.trang_thai_dk === 'da_tham_gia').length}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">HOÀN THÀNH</p>
                </div>
              </div>
              <div className="group relative">
                <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-xl"></div>
                <div className="relative bg-purple-400 border-4 border-black p-4 rounded-xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                  <Award className="h-6 w-6 text-black mb-2" />
                  <p className="text-3xl font-black text-black">{totalPoints.toFixed(1)}</p>
                  <p className="text-xs font-black text-black/70 uppercase tracking-wider">TỔNG ĐIỂM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes grid-move { 0% { transform: translateY(0); } 100% { transform: translateY(50px); } }
          @keyframes bounce-slow { 0%, 100% { transform: translateY(0) rotate(45deg); } 50% { transform: translateY(-20px) rotate(45deg); } }
          @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
          .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        `}} />
      </div>

      <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input type="text" value={searchText} onChange={e => setSearchText(e.target.value)} className="block w-full pl-12 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300" placeholder="Tìm kiếm hoạt động..." />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Học kỳ:</span>
                <SemesterFilter value={semester} onChange={setSemester} label="" />
              </div>
              <div className="hidden lg:block w-px h-8 bg-gray-200"></div>
              <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 font-medium border-2 border-gray-200 hover:border-gray-300">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="text-sm">Lọc nâng cao</span>
                {getActiveFilterCount() > 0 && (<span className="px-2 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-full min-w-[20px] text-center">{getActiveFilterCount()}</span>)}
                <span className={`text-xs transform transition-transform ${showFilters ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {getActiveFilterCount() > 0 && (
                <button onClick={clearAllFilters} className="flex items-center gap-2 px-4 py-2.5 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 font-medium border-2 border-red-200 hover:border-red-300" title="Xóa tất cả bộ lọc">
                  <RefreshCw className="h-4 w-4" />
                  <span className="text-sm">Xóa lọc</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Hiển thị:</span>
              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 border-2 border-gray-200">
                <button onClick={() => setDisplayViewMode('grid')} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${displayViewMode === 'grid' ? 'bg-white shadow-md text-blue-600 border border-blue-200' : 'text-gray-500 hover:text-gray-700'}`} title="Hiển thị dạng lưới">
                  <Grid3X3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Lưới</span>
                </button>
                <button onClick={() => setDisplayViewMode('list')} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${displayViewMode === 'list' ? 'bg-white shadow-md text-blue-600 border border-blue-200' : 'text-gray-500 hover:text-gray-700'}`} title="Hiển thị dạng danh sách">
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">Danh sách</span>
                </button>
              </div>
            </div>
          </div>
          {showFilters && (
            <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-gray-200 animate-slideDown">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Filter className="h-5 w-5 text-blue-600" />
                  Bộ lọc nâng cao
                </h3>
                {getActiveFilterCount() > 0 && (<span className="text-sm text-gray-600">✓ Đang áp dụng <strong>{getActiveFilterCount()}</strong> bộ lọc</span>)}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Loại hoạt động</label>
                  <select value={filters.type} onChange={e => setFilters(prev => ({ ...prev, type: e.target.value }))} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all">
                    <option value="">Tất cả loại</option>
                    {(Array.isArray(activityTypes) ? activityTypes : []).map(type => {
                      const typeName = typeof type === 'string' ? type : (type?.name || type?.ten_loai_hd || '');
                      const typeValue = typeof type === 'string' ? type : (type?.name || type?.ten_loai_hd || type?.id || '');
                      const typeKey = typeof type === 'string' ? type : (type?.id || type?.name || type?.ten_loai_hd || '');
                      return (<option key={typeKey} value={typeValue}>{typeName}</option>);
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Từ ngày</label>
                  <input type="date" value={filters.from} onChange={e => setFilters(prev => ({ ...prev, from: e.target.value }))} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Đến ngày</label>
                  <input type="date" value={filters.to} onChange={e => setFilters(prev => ({ ...prev, to: e.target.value }))} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Điểm RL tối thiểu</label>
                  <input type="number" step="0.5" min="0" value={filters.minPoints} onChange={e => setFilters(prev => ({ ...prev, minPoints: e.target.value }))} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Điểm RL tối đa</label>
                  <input type="number" step="0.5" min="0" value={filters.maxPoints} onChange={e => setFilters(prev => ({ ...prev, maxPoints: e.target.value }))} className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all" placeholder="Không giới hạn" />
                </div>
              </div>
              {getActiveFilterCount() > 0 && (
                <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-200">
                  <button onClick={clearAllFilters} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-all duration-200">
                    <RefreshCw className="h-4 w-4" />
                    Xóa tất cả bộ lọc
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-pink-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
        <div className="relative bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <h3 className="text-base font-bold text-gray-900">Trạng thái</h3>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setStatusViewMode(statusViewMode === 'pills' ? 'dropdown' : statusViewMode === 'dropdown' ? 'compact' : 'pills')} className="p-1 text-gray-400 hover:text-purple-600 transition-colors" title="Chuyển chế độ hiển thị">
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          {statusViewMode === 'pills' && (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setViewMode('pending')} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${viewMode === 'pending' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <Clock className="h-4 w-4" />
                Chờ duyệt
                {myRegistrations.filter(r => r.trang_thai_dk === 'cho_duyet').length > 0 && (<span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{myRegistrations.filter(r => r.trang_thai_dk === 'cho_duyet').length}</span>)}
              </button>
              <button onClick={() => setViewMode('approved')} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${viewMode === 'approved' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <CheckCircle className="h-4 w-4" />
                Đã duyệt
                {myRegistrations.filter(r => r.trang_thai_dk === 'da_duyet').length > 0 && (<span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{myRegistrations.filter(r => r.trang_thai_dk === 'da_duyet').length}</span>)}
              </button>
              <button onClick={() => setViewMode('joined')} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${viewMode === 'joined' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <Trophy className="h-4 w-4" />
                Đã tham gia
                {myRegistrations.filter(r => r.trang_thai_dk === 'da_tham_gia').length > 0 && (<span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{myRegistrations.filter(r => r.trang_thai_dk === 'da_tham_gia').length}</span>)}
              </button>
              <button onClick={() => setViewMode('rejected')} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${viewMode === 'rejected' ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <XCircle className="h-4 w-4" />
                Bị từ chối
                {myRegistrations.filter(r => r.trang_thai_dk === 'tu_choi').length > 0 && (<span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{myRegistrations.filter(r => r.trang_thai_dk === 'tu_choi').length}</span>)}
              </button>
            </div>
          )}
          {statusViewMode === 'dropdown' && (
            <div className="flex items-center gap-3">
              <select value={viewMode} onChange={e => setViewMode(e.target.value)} className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all duration-200 hover:border-purple-300 font-semibold text-sm">
                <option value="pending">Chờ duyệt ({myRegistrations.filter(r => r.trang_thai_dk === 'cho_duyet').length})</option>
                <option value="approved">Đã duyệt ({myRegistrations.filter(r => r.trang_thai_dk === 'da_duyet').length})</option>
                <option value="completed">Đã tham gia ({myRegistrations.filter(r => r.trang_thai_dk === 'da_tham_gia').length})</option>
                <option value="rejected">Bị từ chối ({myRegistrations.filter(r => r.trang_thai_dk === 'tu_choi').length})</option>
              </select>
              {(() => {
                const configs = {
                  pending: { icon: Clock, gradient: 'from-yellow-500 to-orange-500', count: myRegistrations.filter(r => r.trang_thai_dk === 'cho_duyet').length },
                  approved: { icon: CheckCircle, gradient: 'from-green-500 to-emerald-500', count: myRegistrations.filter(r => r.trang_thai_dk === 'da_duyet').length },
                  completed: { icon: Trophy, gradient: 'from-blue-600 to-indigo-600', count: myRegistrations.filter(r => r.trang_thai_dk === 'da_tham_gia').length },
                  rejected: { icon: XCircle, gradient: 'from-red-500 to-rose-500', count: myRegistrations.filter(r => r.trang_thai_dk === 'tu_choi').length }
                };
                const currentConfig = configs[viewMode];
                const CurrentIcon = currentConfig?.icon || Clock;
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
              <button onClick={() => setViewMode('pending')} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${viewMode === 'pending' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'}`} title="Chờ duyệt">
                <Clock className={`h-5 w-5 ${viewMode === 'pending' ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-bold ${viewMode === 'pending' ? 'text-purple-600' : 'text-gray-600'}`}>{myRegistrations.filter(r => r.trang_thai_dk === 'cho_duyet').length}</span>
              </button>
              <button onClick={() => setViewMode('approved')} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${viewMode === 'approved' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'}`} title="Đã duyệt">
                <CheckCircle className={`h-5 w-5 ${viewMode === 'approved' ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-bold ${viewMode === 'approved' ? 'text-purple-600' : 'text-gray-600'}`}>{myRegistrations.filter(r => r.trang_thai_dk === 'da_duyet').length}</span>
              </button>
              <button onClick={() => setViewMode('completed')} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${viewMode === 'completed' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'}`} title="Đã tham gia">
                <Trophy className={`h-5 w-5 ${viewMode === 'completed' ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-bold ${viewMode === 'completed' ? 'text-purple-600' : 'text-gray-600'}`}>{myRegistrations.filter(r => r.trang_thai_dk === 'da_tham_gia').length}</span>
              </button>
              <button onClick={() => setViewMode('rejected')} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${viewMode === 'rejected' ? 'bg-white shadow-md scale-105' : 'hover:bg-white/50'}`} title="Bị từ chối">
                <XCircle className={`h-5 w-5 ${viewMode === 'rejected' ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-bold ${viewMode === 'rejected' ? 'text-purple-600' : 'text-gray-600'}`}>{myRegistrations.filter(r => r.trang_thai_dk === 'tu_choi').length}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className={displayViewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
          {filteredRegs.map(reg => {
            const activity = reg.hoat_dong || {};
            const imageUrl = getBestActivityImage(activity);
            const canCancel = reg.trang_thai_dk === 'cho_duyet';
            const canShowQR = reg.trang_thai_dk === 'da_duyet';
            if (displayViewMode === 'list') {
              return (
                <div key={reg.id} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-200"></div>
                  <div className="relative bg-white border-2 border-gray-200 rounded-xl hover:shadow-lg transition-all duration-200">
                    <div className="flex items-stretch gap-4 p-4">
                      <div className="relative w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                        <img src={imageUrl} alt={activity.ten_hd} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                        <div className="absolute top-2 left-2">{getStatusBadge(reg.trang_thai_dk)}</div>
                        {activity.diem_rl && (
                          <div className="absolute bottom-2 left-2">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/90 backdrop-blur-sm text-white shadow-sm text-xs font-bold">
                              <Award className="h-3 w-3" />+{activity.diem_rl}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-2">{activity.ten_hd}</h3>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-gray-400" /><span className="text-gray-600 truncate">{activity.loai_hd?.ten_loai_hd || activity.loai || 'Chưa phân loại'}</span></div>
                            {activity.ngay_bd && (<div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-gray-400" /><span className="text-gray-900 font-medium">{formatDate(activity.ngay_bd)}</span></div>)}
                            {activity.dia_diem && (<div className="flex items-center gap-1.5 col-span-2"><MapPin className="h-3.5 w-3.5 text-gray-400" /><span className="text-gray-600 truncate">{activity.dia_diem}</span></div>)}
                          </div>
                          {reg.trang_thai_dk === 'tu_choi' && reg.ly_do_tu_choi && (
                            <div className="flex items-start gap-1.5 mt-2 px-2 py-1 bg-red-50 border border-red-200 rounded-md">
                              <AlertCircle className="h-3.5 w-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                              <span className="text-xs text-red-600 line-clamp-1">{reg.ly_do_tu_choi}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col justify-center gap-2 flex-shrink-0">
                        <button onClick={() => handleViewDetail(activity.id)} className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap min-w-[90px]">
                          <Eye className="h-4 w-4" />Chi tiết
                        </button>
                        {canShowQR && (
                          <button onClick={() => handleShowQR(activity.id, activity.ten_hd)} disabled={!isWritable} className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm shadow-md transition-all duration-200 whitespace-nowrap min-w-[90px] ${isWritable ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600 hover:shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                            <Trophy className="h-4 w-4" />QR
                          </button>
                        )}
                        {canCancel && (
                          <button onClick={() => handleCancel(reg.id, activity.ten_hd)} disabled={!isWritable} className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm shadow-md transition-all duration-200 whitespace-nowrap min-w-[90px] ${isWritable ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 hover:shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                            <XCircle className="h-4 w-4" />Hủy
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <div key={reg.id} className="group relative h-full">
                <div className="relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col h-full">
                  <div className="relative w-full h-36 overflow-hidden">
                    <img src={imageUrl} alt={activity.ten_hd} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    <div className="absolute top-2 left-2">{getStatusBadge(reg.trang_thai_dk)}</div>
                    {activity.diem_rl && (
                      <div className="absolute bottom-2 right-2"><span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/95 backdrop-blur-sm text-white rounded-lg text-xs font-bold shadow-md"><Award className="h-3 w-3" />+{activity.diem_rl}</span></div>
                    )}
                  </div>
                  <div className="flex-1 p-4 space-y-3 relative z-10">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors mb-1.5 leading-tight">{activity.ten_hd}</h3>
                      {activity.loai_hd?.ten_loai_hd && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded border border-blue-200"><Calendar className="h-3 w-3" />{activity.loai_hd.ten_loai_hd}</span>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      {activity.ngay_bd && (<div className="flex items-center gap-1.5 text-xs"><Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" /><span className="text-gray-900 font-medium">{formatDate(activity.ngay_bd)}</span></div>)}
                      {activity.dia_diem && (<div className="flex items-center gap-1.5 text-xs"><MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" /><span className="text-gray-600 truncate">{activity.dia_diem}</span></div>)}
                      {reg.ngay_dang_ky && (<div className="flex items-center gap-1.5 text-xs"><Clock className="h-3.5 w-3.5 text-gray-400" /><span className="text-gray-600 truncate">ĐK: {formatDate(reg.ngay_dang_ky)}</span></div>)}
                      {reg.trang_thai_dk === 'tu_choi' && reg.ly_do_tu_choi && (<div className="flex items-start gap-1 p-2 bg-red-50 border border-red-200 rounded text-xs"><AlertCircle className="h-3 w-3 text-red-600 flex-shrink-0 mt-0.5" /><span className="text-red-600 line-clamp-2">{reg.ly_do_tu_choi}</span></div>)}
                    </div>
                  </div>
                  <div className="p-3 pt-0 mt-auto flex gap-2">
                    <button onClick={() => handleViewDetail(activity.id)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 font-medium text-xs shadow-md hover:shadow-lg transition-all duration-200"><Eye className="h-3.5 w-3.5" />Chi tiết</button>
                    {canShowQR && (
                      <button onClick={() => handleShowQR(activity.id, activity.ten_hd)} disabled={!isWritable} className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs shadow-md transition-all duration-200 ${isWritable ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600 hover:shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}><Trophy className="h-3.5 w-3.5" />QR</button>
                    )}
                    {canCancel && (
                      <button onClick={() => handleCancel(reg.id, activity.ten_hd)} disabled={!isWritable} className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs shadow-md transition-all duration-200 ${isWritable ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 hover:shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}><XCircle className="h-3.5 w-3.5" />Hủy</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredRegs.length > 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm p-6">
          <Pagination pagination={pagination} onPageChange={(newPage) => setPagination(prev => ({ ...prev, page: newPage }))} onLimitChange={(newLimit) => setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }))} itemLabel="hoạt động" showLimitSelector={true} />
        </div>
      )}

      {showDetailModal && (
        <ActivityDetailModal activityId={selectedActivity} isOpen={showDetailModal} onClose={() => { setShowDetailModal(false); setSelectedActivity(null); loadMyRegistrations(); }} />
      )}
      {showQRModal && selectedActivity && (
        <ActivityQRModal activityId={selectedActivity.id} activityName={selectedActivity.ten_hd} isOpen={showQRModal} onClose={() => { setShowQRModal(false); setSelectedActivity(null); loadMyRegistrations(); }} />
      )}
    </div>
  );
}
