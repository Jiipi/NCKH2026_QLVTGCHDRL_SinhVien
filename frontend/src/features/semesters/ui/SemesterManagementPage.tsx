import React, { useState, useEffect } from 'react';
import { Calendar, Lock, CheckCircle, AlertCircle, RefreshCw, Plus, Sparkles } from 'lucide-react';
import { useNotification } from '../../../shared/contexts/NotificationContext';
import { invalidateSemesterCache } from '../model/semesterCache';
import semestersApi from '../services/semestersApi';

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
      const list = await semestersApi.getSemesterList();
      setSemesters(list);
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
      await semestersApi.activateSemester(semester.value);
      
      invalidateSemesterCache();

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
      if (auto) {
        await semestersApi.createNextSemester();
      } else {
        await semestersApi.createCurrentSemester();
      }
      
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
    if (!value) return 'N/A';
    // Support both formats: hoc_ky_1_2025 (new) and hoc_ky_1-2025 (legacy)
    const match = value.match(/^hoc_ky_([12])[_-](\d{4})$/);
    if (match) {
      const hkNum = match[1];
      const year = parseInt(match[2]);
      return `HK${hkNum}_${year} (${year}-${year + 1})`;
    }
    return value; // fallback to raw value
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
    <div className="space-y-6">
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20 sm:p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(129,140,248,0.16),transparent_30%),radial-gradient(circle_at_100%_0%,rgba(245,158,11,0.12),transparent_28%)]" />
          <div className="relative z-10 grid gap-6 lg:grid-cols-[1.05fr_1fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-indigo-300">
                <Sparkles className="h-4 w-4" />
                {totalSemesters} học kỳ
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/70 bg-white/55 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                  <Calendar className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-3xl">Quản lý học kỳ</h1>
                  <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500 dark:text-slate-300">Kích hoạt học kỳ mới và quản lý trạng thái, chỉ có một học kỳ được kích hoạt tại một thời điểm.</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="ml-auto flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md"
              >
                <Plus className="h-5 w-5" />
                Tạo học kỳ mới
              </button>
              <div className="grid grid-cols-3 gap-3 rounded-[1.5rem] border border-white/60 bg-white/40 p-3 shadow-inner shadow-white/50 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-none">
                {[
                  { icon: Calendar, label: 'Tổng học kỳ', value: totalSemesters, tone: 'text-indigo-600 dark:text-indigo-300' },
                  { icon: CheckCircle, label: 'Đang hoạt động', value: activeSemester ? 1 : 0, tone: 'text-emerald-600 dark:text-emerald-300' },
                  { icon: Lock, label: 'Đã khóa', value: lockedSemesters, tone: 'text-slate-600 dark:text-slate-300' }
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/65 bg-white/55 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/45">
                    <stat.icon className={`mb-3 h-5 w-5 ${stat.tone}`} />
                    <p className="text-3xl font-black tracking-[-0.05em] text-slate-950 dark:text-white">{stat.value}</p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

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
