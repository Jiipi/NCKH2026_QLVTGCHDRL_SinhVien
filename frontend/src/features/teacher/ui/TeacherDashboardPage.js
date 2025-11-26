import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import http from '../../../shared/api/http';
import { useNotification } from '../../../shared/contexts/NotificationContext';
import { SemesterClosureWidget } from '../../../shared/components/semester';
import SemesterFilter from '../../../widgets/semester/ui/SemesterSwitcher';
import { useSemesterData } from '../../../shared/hooks';
import useTeacherDashboard from '../model/hooks/useTeacherDashboard';
import useTeacherRegistrationActions from '../model/hooks/useTeacherRegistrationActions';

// Activity Card Component (kept for approval actions)
function ActivityCard({ activity, onSelect, onApprove, onReject }) {
  const statusColors = {
    'cho_duyet': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'da_duyet': 'bg-green-100 text-green-800 border-green-200', 
    'tu_choi': 'bg-red-100 text-red-800 border-red-200',
    'hoan_thanh': 'bg-blue-100 text-blue-800 border-blue-200'
  };

  const statusLabels = {
    'cho_duyet': 'Chờ duyệt',
    'da_duyet': 'Đã duyệt',
    'tu_choi': 'Từ chối',
    'hoan_thanh': 'Hoàn thành'
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg mb-2">{activity.ten_hd}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{activity.mo_ta}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[activity.trang_thai]}`}>
          {statusLabels[activity.trang_thai]}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-yellow-500" />
          <span className="text-gray-600">Điểm:</span>
          <span className="font-medium">{activity.diem_rl}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-500" />
          <span className="text-gray-600">Ngày:</span>
          <span className="font-medium">{new Date(activity.ngay_bd).toLocaleDateString('vi-VN')}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-green-500" />
          <span className="text-gray-600">Sức chứa:</span>
          <span className="font-medium">{activity.sl_toi_da}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-500" />
          <span className="text-gray-600">Tạo:</span>
          <span className="font-medium">{new Date(activity.ngay_tao).toLocaleDateString('vi-VN')}</span>
        </div>
      </div>

      {activity.trang_thai === 'cho_duyet' && (
        <div className="flex gap-2">
          <button
            onClick={() => onApprove(activity.id)}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Phê duyệt
          </button>
          <button
            onClick={() => onReject(activity.id)}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            Từ chối
          </button>
        </div>
      )}
    </div>
  );
}

export default function TeacherDashboardPage() {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useNotification();

  const [semester, setSemester] = useState(() => {
    try {
      return sessionStorage.getItem('current_semester') || null;
    } catch {
      return null;
    }
  });
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [teacherName, setTeacherName] = useState('Giảng viên');
  const [teacherInitials, setTeacherInitials] = useState('GV');
  const [activeTab, setActiveTab] = useState('activities');

  const { options: semesterOptions, currentSemester, loading: semesterLoading } = useSemesterData();

  useEffect(() => {
    if (!semester && !semesterLoading) {
      if (currentSemester) {
        setSemester(currentSemester);
      } else if (semesterOptions.length > 0) {
        setSemester(semesterOptions[0]?.value || null);
      }
    }
  }, [semester, semesterLoading, currentSemester, semesterOptions]);

  const handleSetSemester = useCallback((value) => {
    setSemester(value);
    try {
      if (value) {
        sessionStorage.setItem('current_semester', value);
      }
    } catch (_) {}
  }, []);

  const {
    stats,
    recentActivities,
    pendingRegistrations,
    classes,
    students,
    loading,
    error,
    refresh,
    approve: approveActivity,
    reject: rejectActivity
  } = useTeacherDashboard({ semester, classId: selectedClassId });

  const { approveRegistration, rejectRegistration } = useTeacherRegistrationActions();

  useEffect(() => {
    if (!selectedClassId && classes?.length) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await http.get('/core/profile');
        const profile = res.data?.data || {};
        if (cancelled) return;
        const name = profile.ho_ten || profile.name || 'Giảng viên';
        setTeacherName(name);
        const initials = String(name)
          .split(' ')
          .filter(Boolean)
          .map((part) => part[0])
          .join('')
          .slice(0, 2)
          .toUpperCase();
        setTeacherInitials(initials || 'GV');
      } catch (_) {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleApproveActivity = useCallback(async (id) => {
    try {
      await approveActivity(id);
      showSuccess('Đã phê duyệt hoạt động');
    } catch (err) {
      console.error(err);
      showError('Không thể phê duyệt hoạt động');
    }
  }, [approveActivity, showError, showSuccess]);

  const handleRejectActivity = useCallback(async (id) => {
    const reason = window.prompt('Nhập lý do từ chối:');
    if (!reason || !reason.trim()) {
      showWarning('Vui lòng nhập lý do hợp lệ');
      return;
    }
    try {
      await rejectActivity(id, reason.trim());
      showSuccess('Đã từ chối hoạt động');
    } catch (err) {
      console.error(err);
      showError('Không thể từ chối hoạt động');
    }
  }, [rejectActivity, showError, showSuccess, showWarning]);

  const handleApproveRegistration = useCallback(async (registration) => {
    try {
      const result = await approveRegistration(registration.id);
      if (!result.success) {
        throw new Error(result.error || 'Không thể phê duyệt');
      }
      showSuccess('Đã phê duyệt đăng ký');
      refresh();
    } catch (err) {
      console.error(err);
      showError('Không thể phê duyệt đăng ký');
    }
  }, [approveRegistration, refresh, showError, showSuccess]);

  const handleRejectRegistration = useCallback(async (registration) => {
    const reason = window.prompt('Nhập lý do từ chối:', 'Không đáp ứng yêu cầu');
    if (!reason || !reason.trim()) {
      showWarning('Vui lòng nhập lý do hợp lệ');
      return;
    }
    try {
      const result = await rejectRegistration(registration.id, reason.trim());
      if (!result.success) {
        throw new Error(result.error || 'Không thể từ chối');
      }
      showSuccess('Đã từ chối đăng ký');
      refresh();
    } catch (err) {
      console.error(err);
      showError('Không thể từ chối đăng ký');
    }
  }, [rejectRegistration, refresh, showError, showSuccess, showWarning]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white border border-red-200 rounded-xl p-8 text-center shadow">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Có lỗi xảy ra</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={refresh}
            className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-4">
          {/* Greeting + Avatar */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <svg className="absolute inset-0 w-20 h-20 -rotate-90 transform -translate-x-2 -translate-y-2" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="36" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                  <circle cx="40" cy="40" r="36" fill="none" stroke="url(#teacherGradient)" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 36}`} strokeDashoffset={`${2 * Math.PI * 36 * (1 - Math.min(100,100) / 100)}`} className="transition-all duration-1000 ease-out" />
                  <defs>
                    <linearGradient id="teacherGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="50%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border-4 border-white flex items-center justify-center shadow-lg overflow-hidden">
                  <span className="text-2xl font-black text-white">{teacherInitials}</span>
                </div>
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full z-10 shadow-sm"></div>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2 mb-1">
                  Xin chào, {teacherName}!
                  <Zap className="h-6 w-6 text-yellow-400 animate-pulse" />
                </h1>
                <p className="text-gray-600 text-sm mb-2">Chào mừng bạn quay trở lại với hệ thống điểm rèn luyện</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-4 py-1.5 rounded-full text-sm font-black border-2 bg-blue-50 text-blue-700 border-blue-300">
                    Giảng viên
                  </span>
                  {classes.length > 0 && (
                    <select
                      value={selectedClassId || ''}
                      onChange={(e) => setSelectedClassId(e.target.value || null)}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-700 border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.ten_lop}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Semester Filter + Closure Widget */}
          <div className="group relative">
            <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-3xl"></div>
            <div className="relative bg-gradient-to-br from-cyan-400 to-blue-500 border-4 border-black p-4 rounded-3xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-black font-bold" />
                <h3 className="text-base font-black text-black uppercase tracking-wider">BỘ LỌC HỌC KỲ</h3>
              </div>
              <div className="bg-white rounded-xl p-3 border-2 border-black shadow-lg mb-3">
                <SemesterFilter value={semester} onChange={handleSetSemester} />
              </div>
              <div className="bg-white/90 rounded-xl p-3 border-2 border-black">
                <SemesterClosureWidget compact enableSoftLock={false} enableHardLock={false} className="!p-0 !bg-transparent !border-0" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col h-full">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 grid-rows-2 h-full">
            <div className="group relative">
              <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
              <div className="relative bg-yellow-400 border-4 border-black rounded-xl p-3 transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 h-full flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-5 h-5 text-black" />
                </div>
                <p className="text-3xl font-black text-black mb-0.5">{stats.pendingApprovals}</p>
                <p className="text-[10px] font-black text-black/70 uppercase tracking-wider">Chờ phê duyệt</p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
              <div className="relative bg-purple-400 border-4 border-black rounded-xl p-3 transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 h-full flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <p className="text-3xl font-black text-white mb-0.5">{stats.totalActivities}</p>
                <p className="text-[10px] font-black text-white/80 uppercase tracking-wider">Tổng hoạt động</p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
              <div className="relative bg-blue-400 border-4 border-black rounded-xl p-3 transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 h-full flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <p className="text-3xl font-black text-white mb-0.5">{stats.totalStudents}</p>
                <p className="text-[10px] font-black text-white/80 uppercase tracking-wider">Tổng sinh viên</p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
              <div className="relative bg-green-400 border-4 border-black rounded-xl p-3 transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 h-full flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <Award className="w-5 h-5 text-black" />
                </div>
                <p className="text-3xl font-black text-black mb-0.5">{stats.avgClassScore}</p>
                <p className="text-[10px] font-black text-black/70 uppercase tracking-wider">Điểm TB lớp</p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
              <div className="relative bg-pink-400 border-4 border-black rounded-xl p-3 transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 h-full flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-5 h-5 text-black" />
                </div>
                <p className="text-3xl font-black text-black mb-0.5">{stats.approvedThisWeek}</p>
                <p className="text-[10px] font-black text-black/70 uppercase tracking-wider">Duyệt tuần này</p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-black transform translate-x-1.5 translate-y-1.5 rounded-xl"></div>
              <div className="relative bg-orange-400 border-4 border-black rounded-xl p-3 transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 h-full flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-5 h-5 text-black" />
                </div>
                <p className="text-3xl font-black text-black mb-0.5">{stats.participationRate}%</p>
                <p className="text-[10px] font-black text-black/70 uppercase tracking-wider">Tỉ lệ tham gia</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-4">
            {/* Tabs */}
            <div className="flex items-center gap-3 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('activities')}
                className={`px-4 py-2 font-bold text-sm transition-all duration-200 border-b-2 ${
                  activeTab === 'activities'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Hoạt động chờ duyệt
                  {recentActivities?.length > 0 && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">
                      {recentActivities.length}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('registrations')}
                className={`px-4 py-2 font-bold text-sm transition-all duration-200 border-b-2 ${
                  activeTab === 'registrations'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Đăng ký chờ duyệt
                  {pendingRegistrations?.length > 0 && (
                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-bold">
                      {pendingRegistrations.length}
                    </span>
                  )}
                </div>
              </button>
              <div className="ml-auto">
                <button
                  onClick={() => navigate(activeTab === 'activities' ? '/teacher/approve' : '/teacher/registrations')}
                  className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
                >
                  Xem tất cả →
                </button>
              </div>
            </div>
            {/* Tab Content */}
            <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#a855f7 #f3f4f6' }}>
              {activeTab === 'activities' ? (
                recentActivities?.length ? (
                  recentActivities.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} onApprove={handleApproveActivity} onReject={handleRejectActivity} />
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Chưa có hoạt động chờ duyệt</p>
                  </div>
                )
              ) : (
                pendingRegistrations?.length ? (
                  pendingRegistrations.map((reg) => (
                    <div key={reg.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {reg.hoat_dong?.ten_hd || 'Hoạt động không xác định'}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>{reg.sinh_vien?.nguoi_dung?.ho_ten || 'N/A'}</span>
                            <span className="text-gray-400">•</span>
                            <span className="font-mono text-xs">{reg.sinh_vien?.mssv}</span>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-yellow-100 text-yellow-800 border-yellow-200">
                          Chờ duyệt
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveRegistration(reg)}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Phê duyệt
                        </button>
                        <button
                          onClick={() => handleRejectRegistration(reg)}
                          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <AlertCircle className="w-4 h-4" />
                          Từ chối
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Chưa có đăng ký chờ duyệt</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-gray-900">Danh sách sinh viên</h3>
            </div>
            <span className="text-sm text-gray-500">
              {students?.length || 0} sinh viên
            </span>
          </div>
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {students?.length ? (
              students
                .slice()
                .sort((a, b) => (Number(b.diem_rl) || 0) - (Number(a.diem_rl) || 0))
                .map((student) => (
                <div
                  key={student.id}
                  className="rounded-lg p-3 border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <div className="relative flex-shrink-0">
                      {student.avatar ? (
                        <img
                          src={student.avatar}
                          alt={student.ho_ten}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 text-white font-bold text-sm"
                        style={{ display: student.avatar ? 'none' : 'flex' }}
                      >
                        {student.ho_ten?.split(' ').pop()?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">{student.ho_ten}</h4>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-gray-600">{student.mssv}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-600">{student.lop}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs text-gray-700">
                          Điểm RL: <span className="font-semibold text-indigo-600">{student.diem_rl}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Chưa có sinh viên</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

