import React, { useState, useEffect } from 'react';
import { Calendar, Lock, CheckCircle, AlertCircle, RefreshCw, Plus } from 'lucide-react';
import { useNotification } from '../../../shared/contexts/NotificationContext';
import http from '../../../shared/api/http';

export default function SemesterManagement() {
  const { showSuccess, showError, confirm } = useNotification();
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activating, setActivating] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const loadSemesters = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await http.get('/semesters/list');
      setSemesters(res.data?.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Không thể tải danh sách học kỳ');
      showError('Không thể tải danh sách học kỳ', 'Lỗi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSemesters();
  }, []);

  const handleActivate = async (semester) => {
    try {
      setActivating(semester.value);
      await http.post('/semesters/activate', { semester: semester.value });
      
      // Invalidate cache
      try {
        sessionStorage.removeItem('semester_options');
        sessionStorage.removeItem('current_semester');
        localStorage.setItem('semester_options_invalidate', Date.now().toString());
        window.dispatchEvent(new Event('semester_options_bust'));
      } catch (_) {}

      // Reload list
      await loadSemesters();
      setShowConfirm(null);
      showSuccess('Đã kích hoạt học kỳ thành công', 'Thành công');
    } catch (e) {
      showError(e?.response?.data?.message || 'Không thể kích hoạt học kỳ', 'Lỗi');
    } finally {
      setActivating(null);
    }
  };

  const handleCreateSemester = async (auto = false) => {
    try {
      setCreating(true);
      const endpoint = auto ? '/semesters/create-next' : '/semesters/create';
      await http.post(endpoint);
      
      // Reload list
      await loadSemesters();
      setShowCreateModal(false);
      showSuccess('Đã tạo học kỳ mới thành công', 'Thành công');
    } catch (e) {
      showError(e?.response?.data?.message || 'Không thể tạo học kỳ mới', 'Lỗi');
    } finally {
      setCreating(false);
    }
  };

  const getSemesterLabel = (value) => {
    const [hk, year] = value.split('-');
    const hkNum = hk.replace('hoc_ky_', '');
    return `HK${hkNum} (${year}-${parseInt(year) + 1})`;
  };

  const getStatusBadge = (status, isActive) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-black rounded-lg bg-emerald-400 text-black border-2 border-black">
          <CheckCircle size={14} />
          Đang hoạt động
        </span>
      );
    }
    if (status === 'LOCKED_HARD') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-black rounded-lg bg-gray-300 text-black border-2 border-black">
          <Lock size={14} />
          Đã khóa
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-black rounded-lg bg-blue-300 text-black border-2 border-black">
        <Calendar size={14} />
        Chưa kích hoạt
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-bold">Đang tải...</p>
        </div>
      </div>
    );
  }

  const totalSemesters = semesters.length;
  const activeSemester = semesters.find(s => s.is_active);
  const lockedSemesters = semesters.filter(s => s.status === 'LOCKED_HARD').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header với neo-brutalism */}
        <div className="relative min-h-[280px]">
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600"></div>
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                 linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '50px 50px',
                animation: 'grid-move 20s linear infinite'
              }}
            ></div>
          </div>

          <div className="absolute top-10 right-20 w-20 h-20 border-4 border-white/30 rotate-45 animate-bounce-slow"></div>
          <div className="absolute bottom-10 left-16 w-16 h-16 bg-yellow-400/20 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 left-1/3 w-12 h-12 border-4 border-pink-300/40 rounded-full animate-spin-slow"></div>

          <div className="relative z-10 p-8">
            <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-2xl p-8 shadow-2xl">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-400 blur-xl opacity-50 animate-pulse"></div>
                    <div className="relative bg-black text-blue-400 px-4 py-2 font-black text-sm tracking-wider transform -rotate-2 shadow-lg border-2 border-blue-400">
                      📅 QUẢN LÝ HỌC KỲ
                    </div>
                  </div>
                  <div className="h-8 w-1 bg-white/40"></div>
                  <div className="text-white/90 font-bold text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-pink-300 rounded-full animate-pulse"></div>
                      {totalSemesters} học kỳ
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-300 shadow-xl hover:shadow-white/50 hover:scale-105 font-bold"
                  >
                    <Plus className="h-5 w-5" />
                    Tạo học kỳ mới
                  </button>
                </div>
              </div>

              <div className="mb-8">
                <h1 className="text-5xl lg:text-6xl font-black text-white mb-4 leading-none tracking-tight">
                  <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Q</span>
                  <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">U</span>
                  <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Ả</span>
                  <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">N</span>
                  <span className="inline-block mx-2">•</span>
                  <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">L</span>
                  <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Ý</span>
                  <br />
                  <span className="relative inline-block mt-2">
                    <span className="relative z-10 text-yellow-200 drop-shadow-[0_0_30px_rgba(251,207,232,0.5)]">
                      HỌC KỲ
                    </span>
                    <div className="absolute -bottom-2 left-0 right-0 h-4 bg-yellow-400/30 blur-sm"></div>
                  </span>
                </h1>

                <p className="text-white/80 text-xl font-medium max-w-2xl leading-relaxed">
                  Kích hoạt học kỳ mới và quản lý trạng thái - chỉ có một học kỳ được kích hoạt tại một thời điểm
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: Calendar, label: 'Tổng học kỳ', value: totalSemesters, accent: 'bg-gradient-to-br from-blue-200 to-blue-50' },
                  { icon: CheckCircle, label: 'Đang hoạt động', value: activeSemester ? 1 : 0, accent: 'bg-gradient-to-br from-emerald-200 to-emerald-50' },
                  { icon: Lock, label: 'Đã khóa', value: lockedSemesters, accent: 'bg-gradient-to-br from-gray-200 to-gray-50' }
                ].map((stat) => (
                  <div key={stat.label} className="group relative">
                    <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-2xl transition-all duration-300 group-hover:translate-x-3 group-hover:translate-y-3"></div>
                    <div className={`relative border-4 border-black ${stat.accent} p-4 rounded-2xl transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1`}>
                      <stat.icon className="h-6 w-6 text-black mb-2" />
                      <p className="text-3xl font-black text-black">{stat.value}</p>
                      <p className="text-xs font-black text-black/70 uppercase tracking-wider">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <style>{`
            @keyframes grid-move { 0% { transform: translateY(0); } 100% { transform: translateY(50px); } }
            @keyframes bounce-slow { 0%, 100% { transform: translateY(0) rotate(45deg); } 50% { transform: translateY(-20px) rotate(45deg); } }
            @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
            .animate-spin-slow { animation: spin-slow 8s linear infinite; }
          `}</style>
        </div>

        {/* Error Message */}
        {error && (
          <div className="relative">
            <div className="absolute inset-0 bg-black transform translate-x-1 translate-y-1 rounded-xl"></div>
            <div className="relative bg-red-50 border-4 border-black rounded-xl p-4 flex items-center gap-2 text-red-800">
              <AlertCircle size={20} />
              <span className="font-bold">{error}</span>
            </div>
          </div>
        )}

        {/* Semester List */}
        <div className="space-y-4">
          {semesters.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-semibold text-gray-600">Chưa có dữ liệu học kỳ</p>
            </div>
          )}
          
          {semesters.map((sem) => (
            <div
              key={sem.value}
              className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${sem.is_active ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                    <Calendar size={24} className={sem.is_active ? 'text-emerald-600' : 'text-gray-500'} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-lg">{sem.label}</div>
                    <div className="text-sm text-gray-600 font-medium">{getSemesterLabel(sem.value)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(sem.status, sem.is_active)}
                  
                  {!sem.is_active && (
                    <button
                      onClick={() => setShowConfirm(sem)}
                      disabled={activating === sem.value}
                      className={`px-5 py-2 rounded-xl text-sm font-semibold border ${
                        activating === sem.value
                          ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                          : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      {activating === sem.value ? 'Đang kích hoạt...' : 'Kích hoạt'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-blue-900 mb-3 text-lg">📋 Lưu ý:</h3>
          <ul className="text-sm text-blue-800 space-y-2 list-disc pl-4">
            <li>Chỉ có một học kỳ được kích hoạt tại một thời điểm</li>
            <li>Khi kích hoạt học kỳ mới, học kỳ hiện tại sẽ tự động bị khóa cứng</li>
            <li>Dropdown học kỳ sẽ tự động cập nhật và chọn học kỳ mới được kích hoạt</li>
            <li>Dữ liệu của học kỳ đã khóa vẫn được lưu trữ và có thể xem</li>
          </ul>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative">
            <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-2xl"></div>
            <div className="relative bg-white border-4 border-black rounded-2xl shadow-2xl p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-yellow-400 rounded-xl border-2 border-black">
                  <AlertCircle className="text-black" size={24} />
                </div>
                <h3 className="text-lg font-black text-gray-900">Xác nhận kích hoạt học kỳ</h3>
              </div>
              
              <p className="text-gray-700 mb-4 font-medium">
                Bạn có chắc chắn muốn kích hoạt <strong className="font-black">{showConfirm.label}</strong>?
              </p>
              
              <div className="bg-yellow-50 border-4 border-black rounded-xl p-4 mb-4">
                <p className="text-sm text-yellow-900 font-bold">
                  ⚠️ Học kỳ hiện tại sẽ tự động bị <strong>khóa cứng</strong> và không thể chỉnh sửa.
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowConfirm(null)}
                  disabled={activating}
                  className="px-6 py-3 text-sm font-black text-gray-900 bg-gray-100 rounded-xl border-2 border-black hover:bg-gray-200 transition-all shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-1 hover:translate-y-1 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleActivate(showConfirm)}
                  disabled={activating}
                  className="px-6 py-3 text-sm font-black text-white bg-blue-600 rounded-xl border-2 border-black hover:bg-blue-700 transition-all shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-1 hover:translate-y-1 disabled:opacity-50"
                >
                  {activating ? 'Đang kích hoạt...' : 'Xác nhận'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Semester Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Calendar className="text-emerald-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Tạo học kỳ mới</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Chọn phương thức tạo học kỳ:
            </p>
            
            <div className="space-y-3 mb-4">
              <button
                onClick={() => handleCreateSemester(true)}
                disabled={creating}
                className="w-full p-4 text-left border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <RefreshCw size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Tự động</div>
                    <div className="text-sm text-gray-600">Tạo học kỳ tiếp theo dựa trên học kỳ gần nhất</div>
                  </div>
                </div>
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
              <p className="text-sm text-blue-800">
                ℹ️ Học kỳ mới sẽ được tạo nhưng <strong>chưa kích hoạt</strong>. Bạn cần kích hoạt thủ công sau khi tạo.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
