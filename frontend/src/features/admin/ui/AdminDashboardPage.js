import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Activity, CheckCircle, Clock,
  UserCheck, AlertCircle, Shield, Zap, TrendingUp,
  Bell, Database, GraduationCap, Calendar, FileCheck, ChevronDown, X, ArrowRight
} from 'lucide-react';
import useAdminDashboard from '../model/useAdminDashboard';
import http from '../../../shared/api/http';
import API_ENDPOINTS from '../../../shared/api/endpoints';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { stats, loading } = useAdminDashboard();
  const [activeTab, setActiveTab] = useState('recent');
  
  // States for classes
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showClassDetail, setShowClassDetail] = useState(false);
  
  // States for semesters
  const [semesters, setSemesters] = useState([]);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  
  // States for registrations
  const [registrations, setRegistrations] = useState([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  // States for teachers (sidebar)
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  // Initial fetch for sidebar lists
  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  // Fetch semesters
  useEffect(() => {
    if (activeTab === 'semesters') {
      fetchSemesters();
    }
  }, [activeTab]);

  // Fetch registrations for both recent tab and approvals tab
  useEffect(() => {
    if (activeTab === 'approvals' || activeTab === 'recent') {
      fetchRegistrations();
    }
  }, [activeTab]);

  const fetchClasses = async () => {
    setLoadingClasses(true);
    try {
      // Use semesters module which exposes a stable classes endpoint
      const response = await http.get('/semesters/classes');
      console.log('Classes response:', response);
      const data = response.data;
      // Backend may return ApiResponse.success(data) or direct array
      const payload = data?.data || data;
      const classList = Array.isArray(payload)
        ? payload
        : (payload?.items || payload?.classes || payload?.rows || []);
      console.log('Classes list:', classList);
      setClasses(Array.isArray(classList) ? classList : []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    try {
      // Explicit query string because custom http wrapper may drop params
      const response = await http.get('/core/users?role=GIANG_VIEN&limit=10');
      console.log('Teachers response:', response);
      const data = response.data;
      console.log('Teachers data:', data);
      // Backend returns ApiResponse.success({items, total, ...}) 
      // So structure is: {success, data: {items, total}}
      const payload = data?.data || data;
      console.log('Teachers payload:', payload);
      const list = Array.isArray(payload) ? payload : (payload?.items || payload?.data || payload?.users || payload?.rows || []);
      console.log('Teachers list extracted:', list);
      setTeachers(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setTeachers([]);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const fetchSemesters = async () => {
    setLoadingSemesters(true);
    try {
      // Fetch all system semesters without filters
      const response = await http.get('/semesters/list');
      console.log('Semesters response:', response);
      const data = response.data;
      // Backend may return ApiResponse.success(data) or direct array
      const payload = data?.data || data;
      const semesterList = Array.isArray(payload) ? payload : (payload?.items || payload?.semesters || payload?.rows || []);
      console.log('Semesters list (system-wide):', semesterList);
      setSemesters(Array.isArray(semesterList) ? semesterList : []);
    } catch (error) {
      console.error('Error fetching semesters:', error);
      setSemesters([]);
    } finally {
      setLoadingSemesters(false);
    }
  };

  const fetchRegistrations = async () => {
    setLoadingRegistrations(true);
    try {
      // For 'recent' tab: fetch all statuses, for 'approvals': only pending
      const statusFilter = activeTab === 'recent' ? '' : 'status=cho_duyet&';
      const response = await http.get(`${API_ENDPOINTS.registrations.list}?${statusFilter}limit=100`);
      console.log(`Registrations response (${activeTab} tab):`, response);
      const data = response.data;
      // Backend returns ApiResponse.success({items, total, counts})
      // So we need data.data.items or response.data.data.items
      const payload = data?.data || data;
      const registrationsList = payload?.items || (Array.isArray(payload) ? payload : []);
      console.log(`Registrations list (${activeTab === 'recent' ? 'all statuses' : 'pending only'}):`, registrationsList);
      console.log('Registrations counts:', payload?.counts);
      setRegistrations(Array.isArray(registrationsList) ? registrationsList : []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setRegistrations([]);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const handleClassDetail = async (classItem) => {
    setSelectedClass(classItem);
    setShowClassDetail(true);
  };

  const handleApproveRegistration = async (registrationId) => {
    setProcessingId(registrationId);
    try {
      await http.put(API_ENDPOINTS.registrations.approve(registrationId));
      // Refresh registrations
      await fetchRegistrations();
      alert('Đã phê duyệt đăng ký thành công!');
    } catch (error) {
      console.error('Error approving registration:', error);
      alert('Có lỗi xảy ra khi phê duyệt đăng ký!');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectRegistration = async (registrationId) => {
    setProcessingId(registrationId);
    try {
      await http.put(API_ENDPOINTS.registrations.reject(registrationId));
      // Refresh registrations
      await fetchRegistrations();
      alert('Đã từ chối đăng ký thành công!');
    } catch (error) {
      console.error('Error rejecting registration:', error);
      alert('Có lỗi xảy ra khi từ chối đăng ký!');
    } finally {
      setProcessingId(null);
    }
  };

  const adminName = 'Quản trị viên';
  const adminInitials = 'QT';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-red-50 to-orange-50">
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-red-600 border-r-orange-600 absolute inset-0"></div>
            <Zap className="absolute inset-0 m-auto h-6 w-6 text-red-600 animate-pulse" />
          </div>
          <p className="text-gray-700 font-semibold text-lg">Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-4">
          {/* Greeting Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <svg className="absolute inset-0 w-20 h-20 -rotate-90 transform -translate-x-2 -translate-y-2" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="36" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                  <circle cx="40" cy="40" r="36" fill="none" stroke="url(#adminGradient)" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 36}`} strokeDashoffset={`${2 * Math.PI * 36 * (1 - 100 / 100)}`} className="transition-all duration-1000 ease-out" />
                  <defs>
                    <linearGradient id="adminGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#dc2626" />
                      <stop offset="50%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#ea580c" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 border-4 border-white flex items-center justify-center shadow-lg overflow-hidden">
                  <span className="text-2xl font-black text-white">{adminInitials}</span>
                </div>
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full z-10 shadow-sm"></div>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent flex items-center gap-2 mb-1">
                  Xin chào, {adminName}!
                  <Shield className="h-6 w-6 text-red-500 animate-pulse" />
                </h1>
                <p className="text-gray-600 text-sm mb-2">Chào mừng bạn quay trở lại hệ thống quản trị</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-4 py-1.5 rounded-full text-sm font-black border-2 bg-red-50 text-red-700 border-red-300">
                    Quản trị viên
                  </span>
                  <span className="px-3 py-1 rounded-lg text-xs font-bold bg-orange-100 text-orange-700 border border-orange-300">
                    Toàn quyền hệ thống
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="group relative">
            <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
            <div className="relative bg-gradient-to-br from-blue-400 to-indigo-500 border-4 border-black p-3 rounded-xl transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 h-full flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-white" />
                <div className="bg-black text-blue-400 px-2 py-0.5 rounded-md font-black text-[9px] uppercase tracking-wider">USER</div>
              </div>
              <p className="text-3xl font-black text-white mb-0.5">{stats.totalUsers || 0}</p>
              <p className="text-[10px] font-black text-white/80 uppercase tracking-wider">Tổng người dùng</p>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
            <div className="relative bg-green-400 border-4 border-black rounded-xl p-3 transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 h-full flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-5 h-5 text-black" />
                <div className="bg-black text-green-400 px-2 py-0.5 rounded-md font-black text-[9px] uppercase tracking-wider">ACTIVITY</div>
              </div>
              <p className="text-3xl font-black text-black mb-0.5">{stats.totalActivities || 0}</p>
              <p className="text-[10px] font-black text-black/70 uppercase tracking-wider">Hoạt động</p>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
            <div className="relative bg-yellow-400 border-4 border-black rounded-xl p-3 transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 h-full flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-black" />
                <div className="bg-black text-yellow-400 px-2 py-0.5 rounded-md font-black text-[9px] uppercase tracking-wider">PENDING</div>
              </div>
              <p className="text-3xl font-black text-black mb-0.5">{stats.pendingApprovals || 0}</p>
              <p className="text-[10px] font-black text-black/70 uppercase tracking-wider">Chờ duyệt</p>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
            <div className="relative bg-purple-400 border-4 border-black rounded-xl p-3 transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 h-full flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <UserCheck className="w-5 h-5 text-white" />
                <div className="bg-black text-purple-400 px-2 py-0.5 rounded-md font-black text-[9px] uppercase tracking-wider">ACTIVE</div>
              </div>
              <p className="text-3xl font-black text-white mb-0.5">{stats.activeUsers || 0}</p>
              <p className="text-[10px] font-black text-white/80 uppercase tracking-wider">Đang hoạt động</p>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
            <div className="relative bg-pink-400 border-4 border-black rounded-xl p-3 transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 h-full flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-5 h-5 text-black" />
                <div className="bg-black text-pink-400 px-2 py-0.5 rounded-md font-black text-[9px] uppercase tracking-wider">TODAY</div>
              </div>
              <p className="text-3xl font-black text-black mb-0.5">{stats.todayApprovals || 0}</p>
              <p className="text-[10px] font-black text-black/70 uppercase tracking-wider">Duyệt hôm nay</p>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
            <div className="relative bg-orange-400 border-4 border-black rounded-xl p-3 transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 h-full flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-black" />
                <div className="bg-black text-orange-400 px-2 py-0.5 rounded-md font-black text-[9px] uppercase tracking-wider">GROWTH</div>
              </div>
              <p className="text-3xl font-black text-black mb-0.5">+{stats.newUsersThisMonth || 0}</p>
              <p className="text-[10px] font-black text-black/70 uppercase tracking-wider">User tháng này</p>
            </div>
          </div>
        </div>
      </div>
      

      {/* Main Content: Tabs (left) + Sidebar (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md border border-gray-200">
            {/* Tab Headers */}
            <div className="border-b border-gray-200">
              <div className="flex flex-wrap gap-2 p-4">
                <button
                  onClick={() => setActiveTab('recent')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                    activeTab === 'recent'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Bell className="h-5 w-5" />
                  Hoạt động gần đây
                </button>
                <button
                  onClick={() => setActiveTab('semesters')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                    activeTab === 'semesters'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Calendar className="h-5 w-5" />
                  Danh sách học kỳ
                </button>
                <button
                  onClick={() => setActiveTab('approvals')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                    activeTab === 'approvals'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FileCheck className="h-5 w-5" />
                  Phê duyệt đăng ký
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-4">
              <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#6366f1 #f3f4f6' }}>
                {activeTab === 'recent' && (
                  <>
                    {!Array.isArray(registrations) || registrations.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">Chưa có hoạt động gần đây</p>
                      </div>
                    ) : (
                      registrations.slice(0, 10).map((reg, idx) => {
                        const statusColor = reg.trang_thai_dk === 'da_duyet' || reg.trang_thai_dk === 'da_tham_gia'
                          ? 'green' : reg.trang_thai_dk === 'cho_duyet' ? 'yellow' : 'red';
                        const statusLabel = reg.trang_thai_dk === 'da_duyet' ? 'Đã duyệt' 
                          : reg.trang_thai_dk === 'da_tham_gia' ? 'Đã tham gia'
                          : reg.trang_thai_dk === 'cho_duyet' ? 'Chờ duyệt' : 'Từ chối';
                        const Icon = statusColor === 'green' ? CheckCircle : statusColor === 'yellow' ? AlertCircle : Activity;
                        return (
                          <div key={reg.id || idx} className={`flex items-center gap-3 p-4 bg-${statusColor}-50 border border-${statusColor}-200 rounded-lg hover:shadow-md transition-all cursor-pointer`}>
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-${statusColor}-500 flex items-center justify-center`}>
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 text-sm mb-1">
                                {reg.sinh_vien?.nguoi_dung?.ho_ten || 'N/A'} - {reg.hoat_dong?.ten_hd || 'N/A'}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-600 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {reg.ngay_dang_ky ? new Date(reg.ngay_dang_ky).toLocaleDateString('vi-VN') : 'N/A'}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full bg-${statusColor}-100 text-${statusColor}-700 font-medium`}>
                                  {statusLabel.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </>
                )}

                {activeTab === 'semesters' && (
                  <>
                    <div className="flex items-center justify-between mb-4 px-1">
                      <h3 className="text-base font-bold text-gray-900">Quản lý học kỳ</h3>
                      <button 
                        onClick={() => navigate('/admin/semesters')}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm transition-colors"
                      >
                        Quản lý học kỳ →
                      </button>
                    </div>
                    {loadingSemesters ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-600 border-t-transparent mx-auto mb-3"></div>
                        <p className="text-gray-600 text-sm">Đang tải danh sách học kỳ...</p>
                      </div>
                    ) : semesters.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">Chưa có học kỳ nào trong hệ thống</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {semesters.map((semester, idx) => (
                          <div key={semester.value || semester.id || idx} className={`flex items-center justify-between p-4 rounded-lg hover:shadow-md transition-all cursor-pointer ${
                            semester.is_active ? 'bg-purple-50 border border-purple-300' : 'bg-gray-50 border border-gray-200'
                          }`}>
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                semester.is_active ? 'bg-purple-600' : 'bg-gray-400'
                              }`}>
                                <Calendar className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 text-sm mb-1 truncate">
                                  {semester.label || semester.name || semester.ten_hoc_ky || 'Học kỳ'}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {semester.value ? `Mã: ${semester.value}` : 
                                   semester.start_date && semester.end_date 
                                    ? `${new Date(semester.start_date).toLocaleDateString('vi-VN')} - ${new Date(semester.end_date).toLocaleDateString('vi-VN')}`
                                    : semester.year ? `Năm học ${semester.year}` : 'Chưa có thông tin'}
                                </p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full font-medium text-xs flex-shrink-0 ml-2 ${
                              semester.is_active || semester.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-700' 
                                : semester.is_locked
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-200 text-gray-700'
                            }`}>
                              {semester.is_active || semester.status === 'ACTIVE' ? 'Đang diễn ra' : semester.is_locked ? 'Đã khóa' : 'Đã kết thúc'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'approvals' && (
                  <>
                    <div className="flex items-center justify-between mb-4 px-1">
                      <h3 className="text-base font-bold text-gray-900">Phê duyệt đăng ký</h3>
                      <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium text-xs">
                        {Array.isArray(registrations)
                          ? registrations.filter(r => {
                              const s = (r.status || r.trang_thai_dk || '').toString().toLowerCase();
                              return s === 'pending' || s === 'cho_duyet' || s === 'chờ duyệt' || s === 'pending_approval';
                            }).length
                          : 0} chờ duyệt
                      </span>
                    </div>
                    {loadingRegistrations ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent mx-auto mb-3"></div>
                        <p className="text-gray-600 text-sm">Đang tải danh sách đăng ký...</p>
                      </div>
                    ) : !Array.isArray(registrations) || registrations.filter(r => {
                        const s = (r.status || r.trang_thai_dk || '').toString().toLowerCase();
                        return s === 'pending' || s === 'cho_duyet' || s === 'chờ duyệt' || s === 'pending_approval';
                      }).length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">Không có đăng ký nào cần phê duyệt</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {registrations
                          .filter(r => {
                            const s = (r.status || r.trang_thai_dk || '').toString().toLowerCase();
                            return s === 'pending' || s === 'cho_duyet' || s === 'chờ duyệt' || s === 'pending_approval';
                          })
                          .map((registration, idx) => (
                          <div key={registration.id || registration._id || idx} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:shadow-md transition-all">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 text-sm mb-1">
                                  {registration.user?.name || registration.user?.fullName || registration.user?.full_name || registration.user?.ho_ten || registration.sinh_vien?.nguoi_dung?.ho_ten || 'N/A'}
                                </p>
                                <p className="text-sm text-gray-700 mb-1 truncate">
                                  {registration.activity?.name || registration.activity?.ten_hd || registration.activity?.title || registration.hoat_dong?.ten_hd || 'N/A'}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Đăng ký lúc {registration.created_at || registration.ngay_dang_ky ? new Date(registration.created_at || registration.ngay_dang_ky).toLocaleString('vi-VN') : 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleApproveRegistration(registration.id)}
                                disabled={processingId === registration.id}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                              >
                                <CheckCircle className="h-4 w-4" />
                                {processingId === registration.id ? 'Đang xử lý...' : 'Duyệt'}
                              </button>
                              <button 
                                onClick={() => handleRejectRegistration(registration.id)}
                                disabled={processingId === registration.id}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                              >
                                <AlertCircle className="h-4 w-4" />
                                {processingId === registration.id ? 'Đang xử lý...' : 'Từ chối'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar column with two-column grid */}
        <aside>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sidebar: Danh sách lớp */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900">Danh sách lớp</h3>
                </div>
                <button onClick={() => navigate('/admin/classes')} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Xem tất cả →
                </button>
              </div>
              {loadingClasses ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto mb-2"></div>
                  <p className="text-gray-500 text-sm">Đang tải...</p>
                </div>
              ) : classes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <GraduationCap className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Chưa có lớp</p>
                </div>
              ) : (
                <div className="max-h-[400px] overflow-y-auto space-y-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#3b82f6 #f3f4f6' }}>
                  {classes.map((c, idx) => (
                    <div
                      key={c.id || c.ma_lop || c.class_id || c._id || idx}
                      className="rounded-lg p-3 border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer"
                      onClick={() => handleClassDetail(c)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                            {c.name || c.ten_lop || c.class_name || 'Lớp'}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Users className="h-3 w-3" />
                            <span>{c.studentCount || c.si_so || c.so_luong_sv || (Array.isArray(c.students) ? c.students.length : undefined) || c._count?.students || 0} sinh viên</span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-blue-600 flex-shrink-0 ml-2" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar: Danh sách giảng viên */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-bold text-gray-900">Danh sách giảng viên</h3>
                </div>
                <button onClick={() => navigate('/admin/users?role=GIANG_VIEN')} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                  Quản lý →
                </button>
              </div>
              {loadingTeachers ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mx-auto mb-2"></div>
                  <p className="text-gray-500 text-sm">Đang tải...</p>
                </div>
              ) : teachers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Chưa có dữ liệu</p>
                </div>
              ) : (
                <div className="max-h-[400px] overflow-y-auto space-y-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#6366f1 #f3f4f6' }}>
                  {teachers.map((t, idx) => (
                    <div
                      key={t.id || t.user_id || t._id || idx}
                      className="rounded-lg p-3 border border-gray-200 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-300 transition-all cursor-pointer"
                      onClick={() => navigate(`/admin/users/${t.id || t.user_id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-bold text-sm">
                            {(t.ho_ten || t.fullName || t.full_name || t.name || t.ten_dn || 'G')?.split(' ').pop()?.charAt(0)?.toUpperCase() || 'G'}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                            {t.ho_ten || t.fullName || t.full_name || t.name || t.ten_dn || 'Giảng viên'}
                          </h4>
                          <p className="text-xs text-gray-600 truncate">
                            {t.email || t.ten_dn || t.username || '—'}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium flex-shrink-0">
                          GV
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Class Detail Modal */}
      {showClassDetail && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-8 w-8" />
                  <div>
                    <h2 className="text-2xl font-bold">{selectedClass.name}</h2>
                    <p className="text-blue-100 text-sm">Chi tiết lớp học</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowClassDetail(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">Mã lớp</p>
                    <p className="text-lg font-bold text-gray-900">{selectedClass.id}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">Số sinh viên</p>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedClass.studentCount || selectedClass._count?.students || 0}
                    </p>
                  </div>
                </div>
                {selectedClass.teacher && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600 mb-1">Giảng viên chủ nhiệm</p>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedClass.teacher.name || selectedClass.teacher.full_name}
                    </p>
                  </div>
                )}
                {selectedClass.description && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Mô tả</p>
                    <p className="text-gray-900">{selectedClass.description}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
              <button 
                onClick={() => setShowClassDetail(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
              >
                Đóng
              </button>
              <button 
                onClick={() => navigate(`/admin/classes/${selectedClass.id}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Xem chi tiết đầy đủ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activities bottom block removed; content now in tabs */}
    </div>
  );
}
