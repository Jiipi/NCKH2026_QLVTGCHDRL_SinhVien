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
  History,
  FileCheck,
  BookOpen
} from 'lucide-react';
import { approvalTeacherApi } from '../../services';
import { ConfirmModal, Toast } from '../../../../shared/components/common';
import ActivityDetailModal from '../../../../entities/activity/ui/ActivityDetailModal';
import { useSemesterData } from '../../../../shared/hooks';
import RolePageHero from '../../../../shared/components/common/RolePageHero';
import AppLoadingScreen from '../../../../shared/components/common/AppLoadingScreen';

export default function ModernActivityApproval() {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' hoặc 'history'
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [semester, setSemester] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  // Modal states
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', activityId: null, title: '', message: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });
  const [detailModal, setDetailModal] = useState({ isOpen: false, activity: null });

  // Unified semester options
  const { options: semesterOptions, currentSemester, isWritable } = useSemesterData(semester);

  // Initialize semester when options are loaded
  useEffect(() => {
    if (semesterOptions.length > 0) {
      const semesterInOptions = semesterOptions.some(opt => opt.value === semester);
      if (!semester || !semesterInOptions) {
        const currentInOptions = currentSemester && semesterOptions.some(opt => opt.value === currentSemester);
        const newSemester = currentInOptions ? currentSemester : semesterOptions[0]?.value;
        if (newSemester && newSemester !== semester) {
          setSemester(newSemester);
        }
      }
    }
  }, [semesterOptions, currentSemester, semester]);

  useEffect(() => {
    // Clear old data immediately when semester/activeTab/filter changes
    setActivities([]);
    if (activeTab === 'pending') {
      setStats({ total: 0, pending: 0, approved: 0, rejected: 0 });
    }
    setError('');

    loadActivities();
  }, [semester, activeTab, filter]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError('');

      // Chọn endpoint dựa trên tab hiện tại
      const endpoint = activeTab === 'pending'
        ? '/teacher/activities/pending'
        : '/teacher/activities/history';

      const params: {
        page: number;
        limit: number;
        search?: string;
        semester?: string;
        status?: string;
      } = {
        page: 1,
        limit: 100,
        search: searchTerm || undefined,
        semester: semester || undefined
      };

      // Nếu là tab history, thêm status filter
      if (activeTab === 'history' && filter !== 'all') {
        params.status = filter;
      }

      console.log('[TeacherActivityApproval] Loading activities:', { endpoint, params, activeTab });

      const result = await approvalTeacherApi.getApprovalActivities(endpoint, params);
      if (!result.success) throw new Error((result as { error?: string }).error || 'Không thể tải danh sách hoạt động');

      const responseData = result.data.raw || {};
      const activitiesArray = result.data.items;

      setActivities(activitiesArray);

      // Cập nhật stats từ API (chỉ cho tab pending)
      if (activeTab === 'pending' && responseData.stats) {
        setStats(responseData.stats);
      } else if (activeTab === 'pending') {
        // Fallback nếu backend chưa trả stats
        setStats({ total: 0, pending: 0, approved: 0, rejected: 0 });
      }

      setError('');

      console.log(`✅ Loaded ${activitiesArray.length} activities (tab: ${activeTab})`);
      if (activeTab === 'pending') console.log(`📊 Stats:`, responseData.stats);
    } catch (err) {
      console.error('Error loading activities:', err);
      setError('Không thể tải danh sách hoạt động');
      setActivities([]);
      if (activeTab === 'pending') {
        setStats({ total: 0, pending: 0, approved: 0, rejected: 0 });
      }
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
        const result = await approvalTeacherApi.approveActivity(activityId);
        if (!result.success) throw new Error((result as { error?: string }).error || 'Không thể xử lý hoạt động. Vui lòng thử lại.');
        showToast('Phê duyệt hoạt động thành công!', 'success');
        await loadActivities();
      } else if (type === 'reject') {
        if (!rejectReason || rejectReason.trim() === '') {
          showToast('Vui lòng nhập lý do từ chối', 'warning');
          return;
        }
        const result = await approvalTeacherApi.rejectActivity(activityId, rejectReason.trim());
        if (!result.success) throw new Error((result as { error?: string }).error || 'Không thể xử lý hoạt động. Vui lòng thử lại.');
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
    const matchesFilter = filter === 'all' || activity.trang_thai === filter;
    const matchesSearch = activity.ten_hd.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.mo_ta?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
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
    return <AppLoadingScreen />;
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
    <div className="space-y-6">
      <RolePageHero
        eyebrow="Không gian giảng viên"
        title="Phê duyệt hoạt động"
        description={`Xem và phê duyệt các hoạt động do sinh viên trong lớp tạo${semester ? ` (${(semesterOptions || []).find(opt => opt.value === semester)?.label || ''})` : ''}.`}
        heroIcon={FileCheck}
        metrics={[
          { icon: BookOpen, label: 'Tổng hoạt động', value: stats.total, tone: 'text-indigo-600 dark:text-indigo-300' },
          { icon: Clock, label: 'Chờ duyệt', value: stats.pending, tone: 'text-amber-600 dark:text-amber-300' },
          { icon: CheckCircle, label: 'Đã duyệt', value: stats.approved, tone: 'text-emerald-600 dark:text-emerald-300' },
        ]}
      />

      {/* Tabs */}
      <div className="rounded-[1.5rem] border border-white/60 bg-white/70 p-2 shadow-sm backdrop-blur-xl">
          <nav className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('pending')}
              className={`rounded-2xl px-4 py-2.5 font-bold text-sm transition-colors ${activeTab === 'pending'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-white hover:text-slate-900'
                }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>Chờ phê duyệt</span>
                {activeTab === 'pending' && stats.pending > 0 && (
                  <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                    {stats.pending}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`rounded-2xl px-4 py-2.5 font-bold text-sm transition-colors ${activeTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-white hover:text-slate-900'
                }`}
            >
              <div className="flex items-center gap-2">
                <History className="w-5 h-5" />
                <span>Lịch sử phê duyệt</span>
              </div>
            </button>
          </nav>
      </div>

      {/* Stats Summary - Only show for pending tab */}
      {!loading && activeTab === 'pending' && !isWritable && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
          Học kỳ này không cho phép phê duyệt hoặc chỉnh sửa.
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white/80 rounded-[1.5rem] border border-white/60 p-4 sm:p-5 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm hoạt động..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 text-sm font-semibold"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {activeTab === 'history' && (
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 sm:px-4 py-3 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 text-sm font-semibold min-w-[140px]"
              >
                <option value="all">Tất cả</option>
                <option value="da_duyet">Đã duyệt</option>
                <option value="tu_choi">Từ chối</option>
              </select>
            )}
            {activeTab === 'pending' && (
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 sm:px-4 py-3 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 text-sm font-semibold min-w-[140px]"
              >
                <option value="all">Tất cả</option>
                <option value="cho_duyet">Chờ duyệt</option>
                <option value="da_duyet">Đã duyệt</option>
                <option value="tu_choi">Từ chối</option>
              </select>
            )}
            <button
              onClick={loadActivities}
              className="flex items-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-colors text-sm font-bold"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Tải lại</span>
            </button>
          </div>
        </div>
      </div>

      {/* Activities Grid - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredActivities.length > 0 ? (
          filteredActivities.map(activity => (
            <div key={activity.id} className="bg-white/90 border border-white/70 rounded-[1.5rem] overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg flex flex-col">
              <div className="border-b border-slate-100 p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-indigo-500">{activity.loai_hd?.ten_loai_hd || 'Hoạt động'}</p>
                    <h3 className="mt-1 text-lg font-black text-slate-950 line-clamp-2">{activity.ten_hd}</h3>
                  </div>
                  <span className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border ${statusColors[activity.trang_thai]}`}>
                    {statusLabels[activity.trang_thai]}
                  </span>
                </div>
                <p className="text-slate-500 text-sm line-clamp-2">{activity.mo_ta || 'Không có mô tả'}</p>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                {/* Creator Info - Lớp trưởng */}
                {activity.nguoi_tao && (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-3 mb-3 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-600" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs text-indigo-600 font-medium">Người tạo</div>
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {activity.nguoi_tao.ho_ten}
                        </div>
                        {activity.nguoi_tao.sinh_vien?.lop?.ten_lop && (
                          <div className="text-xs text-gray-600">
                            Lớp: {activity.nguoi_tao.sinh_vien.lop.ten_lop}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-3 flex-shrink-0">
                  <div className="flex items-center gap-2 bg-amber-50 rounded-2xl p-3">
                    <Award className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500">Điểm</div>
                      <div className="font-semibold text-sm text-gray-900">{activity.diem_rl}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-blue-50 rounded-2xl p-3">
                    <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500">Ngày</div>
                      <div className="font-semibold text-sm text-gray-900 truncate">
                        {new Date(activity.ngay_bd).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-green-50 rounded-2xl p-3">
                    <Users className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500">SL tối đa</div>
                      <div className="font-semibold text-sm text-gray-900">{activity.sl_toi_da}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-purple-50 rounded-2xl p-3">
                    <Clock className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500">Tạo lúc</div>
                      <div className="font-semibold text-sm text-gray-900 truncate">
                        {new Date(activity.ngay_tao).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Always at bottom */}
                <div className="mt-auto pt-4 border-t border-gray-100">
                  {activeTab === 'pending' && activity.trang_thai === 'cho_duyet' ? (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleApproveClick(activity.id)}
                        className={`w-full px-4 py-3 rounded-2xl transition-all flex items-center justify-center gap-2 font-bold text-sm shadow-sm ${isWritable ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                        disabled={!isWritable}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Phê duyệt
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRejectClick(activity.id)}
                          className={`flex-1 px-3 py-2.5 rounded-2xl transition-colors flex items-center justify-center gap-1.5 font-bold text-sm ${isWritable ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                          disabled={!isWritable}
                        >
                          <XCircle className="w-4 h-4" />
                          Từ chối
                        </button>
                        <button
                          onClick={() => handleViewDetail(activity)}
                          className="flex-1 border border-slate-200 text-slate-700 px-3 py-2.5 rounded-2xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 text-sm font-bold"
                        >
                          <Eye className="w-4 h-4" />
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Display reason if rejected */}
                      {activity.trang_thai === 'tu_choi' && activity.ly_do_tu_choi && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
                          <div className="text-xs text-red-600 font-medium mb-1">Lý do từ chối:</div>
                          <div className="text-sm text-gray-700">{activity.ly_do_tu_choi}</div>
                        </div>
                      )}
                      <button
                        onClick={() => handleViewDetail(activity)}
                        className="w-full border border-slate-200 text-slate-700 px-4 py-2.5 rounded-2xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm font-bold"
                      >
                        <Eye className="w-4 h-4" />
                        Xem chi tiết
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-200">
            {activeTab === 'pending' ? (
              <>
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-500 mb-2">Không có hoạt động nào</h3>
                <p className="text-gray-400 text-sm">
                  {searchTerm || filter !== 'all'
                    ? 'Không tìm thấy hoạt động phù hợp với bộ lọc'
                    : semester
                      ? `Chưa có hoạt động nào cần phê duyệt trong ${(semesterOptions || []).find(opt => opt.value === semester)?.label || 'học kỳ này'}`
                      : 'Chưa có hoạt động nào cần phê duyệt'
                  }
                </p>
                <p className="text-gray-400 text-xs mt-2">Hãy thử chọn học kỳ khác hoặc thay đổi bộ lọc</p>
              </>
            ) : (
              <>
                <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-500 mb-2">Chưa có lịch sử phê duyệt</h3>
                <p className="text-gray-400 text-sm">
                  {searchTerm || filter !== 'all'
                    ? 'Không tìm thấy hoạt động phù hợp với bộ lọc'
                    : semester
                      ? `Chưa có hoạt động nào đã xử lý trong ${(semesterOptions || []).find(opt => opt.value === semester)?.label || 'học kỳ này'}`
                      : 'Chưa có hoạt động nào đã được phê duyệt hoặc từ chối'
                  }
                </p>
                <p className="text-gray-400 text-xs mt-2">Các hoạt động đã duyệt hoặc từ chối sẽ xuất hiện ở đây</p>
              </>
            )}
          </div>
        )}
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
