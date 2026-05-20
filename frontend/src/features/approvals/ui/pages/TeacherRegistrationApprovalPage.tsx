import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UserCheck, UserX, Users, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Search, Filter, Eye, FileText, ArrowUp, ArrowDown } from 'lucide-react';
import { approvalTeacherApi } from '../../services';
import { ConfirmModal, Toast } from '../../../../shared/components/common';
import { useSemesterData } from '../../../../shared/hooks';
import RolePageHero from '../../../../shared/components/common/RolePageHero';
import AppLoadingScreen from '../../../../shared/components/common/AppLoadingScreen';

export default function TeacherRegistrationApprovals() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('cho_duyet');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [selectedRegistrations, setSelectedRegistrations] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [semester, setSemester] = useState('');
  const { options: semesterOptions, currentSemester, isWritable } = useSemesterData(semester);
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');

  // Modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: '',
    registrationId: null,
    isBulk: false,
    title: '',
    message: ''
  });
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });
  const [counts, setCounts] = useState({ cho_duyet: 0, da_duyet: 0, tu_choi: 0, da_tham_gia: 0 });
  const [scrollDown, setScrollDown] = useState(false);

  // Track latest request to ignore stale responses
  const latestRequestIdRef = useRef(0);

  // Status mappings
  const statusLabels = {
    'cho_duyet': 'Chờ duyệt',
    'da_duyet': 'Đã duyệt',
    'tu_choi': 'Từ chối',
    'da_tham_gia': 'Đã tham gia',
    'vang_mat': 'Vắng mặt'
  };

  const statusColors = {
    'cho_duyet': 'bg-yellow-100 text-yellow-800',
    'da_duyet': 'bg-green-100 text-green-800',
    'tu_choi': 'bg-red-100 text-red-800',
    'da_tham_gia': 'bg-blue-100 text-blue-800',
    'vang_mat': 'bg-gray-100 text-gray-800'
  };

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
    if (!semester) return;
    loadRegistrations();
  }, [semester, page, limit, statusFilter, searchTerm, classId]);

  useEffect(() => {
    // Load classes teacher owns
    (async () => {
      try {
        const result = await approvalTeacherApi.getTeacherClasses();
        const list = result.success ? result.data : [];
        setClasses(list);
        // Auto-select first class if none selected
        if (list.length > 0 && !classId) {
          setClassId(list[0].id);
        }
      } catch (_) {
        setClasses([]);
      }
    })();
  }, []);

  const loadRegistrations = useCallback(async () => {
    if (!semester) return;
    const requestId = ++latestRequestIdRef.current;
    try {
      setLoading(true);
      setError('');
      console.log('🔍 Đang tải danh sách đăng ký từ API...');

      const params = {
        semester: semester || undefined,
        page,
        limit,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchTerm || undefined,
        classId: classId || undefined
      };
      const result = await approvalTeacherApi.getPendingRegistrations(params);

      // Drop stale response if a newer request started
      if (requestId !== latestRequestIdRef.current) return;

      if (!result.success) throw new Error((result as { error?: string }).error || 'Không thể tải danh sách đăng ký');

      const registrationsArray = result.data.items;
      console.log('📋 Dữ liệu đăng ký:', registrationsArray);

      setRegistrations(registrationsArray);
      const p = result.data.pagination || {};
      const nextTotal = typeof p.total === 'number' ? p.total : (result.data.total || registrationsArray.length);
      setTotal(nextTotal);
      if (result.data.counts) setCounts(result.data.counts);
      setError('');

      if (registrationsArray.length > 0) {
        console.log(`✅ Tải thành công ${registrationsArray.length} đăng ký`);
      } else {
        console.log('⚠️ Không có đăng ký nào');
      }
    } catch (err) {
      if (requestId !== latestRequestIdRef.current) return;
      console.error('❌ Lỗi khi tải đăng ký:', err);
      console.error('Chi tiết lỗi:', err.response?.data);
      setError('Không thể tải danh sách đăng ký: ' + (err.response?.data?.message || err.message));
      setRegistrations([]);
    } finally {
      if (requestId === latestRequestIdRef.current) {
        setLoading(false);
      }
    }
  }, [semester, page, limit, statusFilter, searchTerm, classId]);

  const showToast = (message, type = 'success') => {
    setToast({ isOpen: true, message, type });
  };

  const handleApproveClick = (registrationId) => {
    setConfirmModal({
      isOpen: true,
      type: 'approve',
      registrationId,
      isBulk: false,
      title: 'Xác nhận phê duyệt',
      message: 'Bạn có chắc chắn muốn phê duyệt đăng ký này không?'
    });
  };

  const handleRejectClick = (registrationId) => {
    setRejectReason('');
    setConfirmModal({
      isOpen: true,
      type: 'reject',
      registrationId,
      isBulk: false,
      title: 'Xác nhận từ chối',
      message: 'Vui lòng nhập lý do từ chối đăng ký:'
    });
  };

  const handleBulkApproveClick = () => {
    if (selectedRegistrations.length === 0) {
      showToast('Vui lòng chọn ít nhất một đăng ký', 'warning');
      return;
    }

    setConfirmModal({
      isOpen: true,
      type: 'approve',
      registrationId: null,
      isBulk: true,
      title: 'Xác nhận phê duyệt hàng loạt',
      message: `Bạn có chắc chắn muốn phê duyệt ${selectedRegistrations.length} đăng ký?`
    });
  };

  const handleBulkRejectClick = () => {
    if (selectedRegistrations.length === 0) {
      showToast('Vui lòng chọn ít nhất một đăng ký', 'warning');
      return;
    }

    setRejectReason('');
    setConfirmModal({
      isOpen: true,
      type: 'reject',
      registrationId: null,
      isBulk: true,
      title: 'Xác nhận từ chối hàng loạt',
      message: `Vui lòng nhập lý do từ chối ${selectedRegistrations.length} đăng ký:`
    });
  };

  const handleConfirmAction = async () => {
    const { type, registrationId, isBulk } = confirmModal;

    try {
      setProcessing(true);

      if (type === 'approve') {
        if (isBulk) {
          const results = await Promise.all(
            selectedRegistrations.map(id =>
              approvalTeacherApi.approveRegistration(id)
            )
          );
          const failed = results.find(result => !result.success);
          if (failed) throw new Error((failed as { error?: string }).error || 'Không thể xử lý đăng ký. Vui lòng thử lại.');
          showToast(`Đã phê duyệt ${selectedRegistrations.length} đăng ký thành công!`, 'success');
          setSelectedRegistrations([]);
        } else {
          const result = await approvalTeacherApi.approveRegistration(registrationId);
          if (!result.success) throw new Error((result as { error?: string }).error || 'Không thể xử lý đăng ký. Vui lòng thử lại.');
          showToast('Đã phê duyệt đăng ký thành công!', 'success');
        }
        await loadRegistrations();
      } else if (type === 'reject') {
        if (!rejectReason || rejectReason.trim() === '') {
          showToast('Vui lòng nhập lý do từ chối', 'warning');
          setProcessing(false);
          return;
        }

        if (isBulk) {
          const results = await Promise.all(
            selectedRegistrations.map(id =>
              approvalTeacherApi.rejectRegistration(id, rejectReason.trim())
            )
          );
          const failed = results.find(result => !result.success);
          if (failed) throw new Error((failed as { error?: string }).error || 'Không thể xử lý đăng ký. Vui lòng thử lại.');
          showToast(`Đã từ chối ${selectedRegistrations.length} đăng ký thành công!`, 'success');
          setSelectedRegistrations([]);
        } else {
          const result = await approvalTeacherApi.rejectRegistration(registrationId, rejectReason.trim());
          if (!result.success) throw new Error((result as { error?: string }).error || 'Không thể xử lý đăng ký. Vui lòng thử lại.');
          showToast('Đã từ chối đăng ký thành công!', 'success');
        }
        await loadRegistrations();
      }

      setConfirmModal({ isOpen: false, type: '', registrationId: null, isBulk: false, title: '', message: '' });
      setRejectReason('');
    } catch (err) {
      console.error('Error processing registration:', err);
      const errorMsg = err?.response?.data?.message || 'Không thể xử lý đăng ký. Vui lòng thử lại.';
      showToast(errorMsg, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const toggleSelectRegistration = (id) => {
    setSelectedRegistrations(prev =>
      prev.includes(id)
        ? prev.filter(regId => regId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const filteredIds = filteredRegistrations.map(reg => reg.id);
    if (selectedRegistrations.length === filteredIds.length) {
      setSelectedRegistrations([]);
    } else {
      setSelectedRegistrations(filteredIds);
    }
  };

  // Filter registrations
  const filteredRegistrations = registrations.filter(registration => {
    const q = searchTerm.toLowerCase();

    const studentName = (
      registration.sinh_vien?.nguoi_dung?.ho_ten ||
      registration.student?.nguoi_dung?.ho_ten ||
      registration.user?.ho_ten ||
      ''
    ).toLowerCase();

    const studentCode = String(
      registration.sinh_vien?.mssv ||
      registration.student?.mssv ||
      registration.user?.ten_dn ||
      ''
    );

    const activityName = (
      registration.hoat_dong?.ten_hd ||
      registration.activity?.ten_hd ||
      ''
    ).toLowerCase();

    const matchesSearch =
      studentName.includes(q) ||
      studentCode.toLowerCase().includes(q) ||
      activityName.includes(q);

    const matchesStatus = statusFilter === 'all' || registration.trang_thai_dk === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Client-side fallback pagination to ensure rendering <= limit items
  const effectiveTotal = total && total > 0 ? total : filteredRegistrations.length;
  const startIdx = (page - 1) * limit;
  const endIdx = startIdx + limit;
  const pageItems = filteredRegistrations.slice(startIdx, endIdx);

  const RegistrationCard = ({ registration }) => (
    <div className="bg-white/90 rounded-[1.5rem] border border-white/70 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
      {/* Header with checkbox */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={selectedRegistrations.includes(registration.id)}
            onChange={() => toggleSelectRegistration(registration.id)}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div>
            <h3 className="text-lg font-black text-slate-950">
              {registration.sinh_vien?.nguoi_dung?.ho_ten ||
                registration.student?.nguoi_dung?.ho_ten ||
                registration.user?.ho_ten}
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>MSSV: {registration.sinh_vien?.mssv || registration.student?.mssv || registration.user?.ten_dn}</p>
              <p>Lớp: {registration.sinh_vien?.lop?.ten_lop || registration.student?.lop?.ten_lop}</p>
            </div>
          </div>
        </div>
        <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold ${statusColors[registration.trang_thai_dk]}`}>
          {statusLabels[registration.trang_thai_dk]}
        </span>
      </div>

      {/* Activity Info */}
      <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-4 mb-4">
        <h4 className="font-bold text-slate-950 mb-2">{registration.hoat_dong?.ten_hd || registration.activity?.ten_hd}</h4>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{new Date(registration.hoat_dong?.ngay_bd || registration.activity?.ngay_bd).toLocaleDateString('vi-VN')}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            <span>{new Date(registration.hoat_dong?.ngay_bd || registration.activity?.ngay_bd).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Registration Note */}
      {registration.ghi_chu && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 italic">"{registration.ghi_chu}"</p>
        </div>
      )}

      {/* Registration Info */}
      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <span>Ngày đăng ký: {new Date(registration.ngay_dang_ky || registration.ngay_dk).toLocaleDateString('vi-VN')}</span>
        <span className="font-semibold text-blue-600">Điểm RL: {registration.hoat_dong?.diem_rl || registration.activity?.diem_rl} điểm</span>
      </div>

      {/* Actions */}
      {registration.trang_thai_dk === 'cho_duyet' && (
        <div className="flex space-x-3">
          <button
            onClick={() => handleApproveClick(registration.id)}
            disabled={processing || !isWritable}
            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-2xl font-bold transition-colors ${isWritable ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Phê duyệt
          </button>
          <button
            onClick={() => handleRejectClick(registration.id)}
            disabled={processing || !isWritable}
            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-2xl font-bold transition-colors ${isWritable ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Từ chối
          </button>
        </div>
      )}
    </div>
  );

  useEffect(() => {
    const onScroll = () => {
      const nearTop = window.scrollY < 100;
      const nearBottom = (window.innerHeight + window.scrollY) >= (document.body.scrollHeight - 100);
      setScrollDown(nearTop && !nearBottom ? true : false);
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleScrollToggle = () => {
    if (scrollDown) window.scrollTo({ top: 0, behavior: 'smooth' });
    else window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  if (loading) {
    return <AppLoadingScreen />;
  }

  return (
    <div className="space-y-6">
      <RolePageHero
        eyebrow="Không gian giảng viên"
        title="Phê duyệt đăng ký"
        description="Quản lý đăng ký tham gia hoạt động của các lớp bạn phụ trách theo học kỳ."
        heroIcon={UserCheck}
        metrics={[
          { icon: Clock, label: 'Chờ duyệt', value: counts.cho_duyet, tone: 'text-amber-600 dark:text-amber-300' },
          { icon: CheckCircle, label: 'Đã duyệt', value: counts.da_duyet, tone: 'text-emerald-600 dark:text-emerald-300' },
          { icon: XCircle, label: 'Từ chối', value: counts.tu_choi, tone: 'text-rose-600 dark:text-rose-300' },
          { icon: Users, label: 'Đã tham gia', value: counts.da_tham_gia, tone: 'text-blue-600 dark:text-blue-300' },
        ]}
        actions={(
          <span className="inline-flex items-center rounded-2xl border border-white/70 bg-white/60 px-4 py-2.5 text-sm font-bold text-slate-600">
            Hiển thị {Math.min(page * limit, effectiveTotal)} / {effectiveTotal}
          </span>
        )}
      />



      {/* Filters and Bulk Actions */}
      <div className="bg-white/80 rounded-[1.5rem] border border-white/60 p-4 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên sinh viên, MSSV hoặc hoạt động..."
                value={searchTerm}
                onChange={(e) => { setPage(1); setSearchTerm(e.target.value); }}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 font-semibold"
              />
            </div>
          </div>

          {/* Class Filter */}
          <div className="lg:w-64">
            <select
              value={classId}
              onChange={(e) => { setPage(1); setClassId(e.target.value); }}
              className="w-full px-3 py-3 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 font-semibold"
            >
              <option value="">Tất cả lớp phụ trách</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.ten_lop || c.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter aligned right */}
          <div className="lg:w-52 ml-auto">
            <select
              value={statusFilter}
              onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}
              className="w-full px-3 py-3 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 font-semibold"
            >
              <option value="cho_duyet">Chờ duyệt</option>
              <option value="da_duyet">Đã duyệt</option>
              <option value="tu_choi">Từ chối</option>
              <option value="da_tham_gia">Đã tham gia</option>
              <option value="vang_mat">Vắng mặt</option>
            </select>
          </div>

          {/* Page size */}
          {/* Page size moved to bottom pagination */}

          {/* Bulk Actions */}
          {selectedRegistrations.length > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={handleBulkApproveClick}
                disabled={processing || !isWritable}
                className={`flex items-center px-4 py-3 rounded-2xl font-bold transition-colors ${isWritable ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Duyệt ({selectedRegistrations.length})
              </button>
              <button
                onClick={handleBulkRejectClick}
                disabled={processing || !isWritable}
                className={`flex items-center px-4 py-3 rounded-2xl font-bold transition-colors ${isWritable ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                <UserX className="h-4 w-4 mr-2" />
                Từ chối ({selectedRegistrations.length})
              </button>
            </div>
          )}
        </div>

        {/* Select All */}
        {filteredRegistrations.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedRegistrations.length === filteredRegistrations.length}
                onChange={toggleSelectAll}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-600">
                Chọn tất cả ({filteredRegistrations.length} đăng ký)
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Registrations List */}
      {pageItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pageItems.map(registration => (
            <RegistrationCard key={registration.id} registration={registration} />
          ))}
        </div>
      ) : (
            <div className="bg-white/80 rounded-[1.5rem] border border-white/60 p-12 text-center shadow-sm">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'cho_duyet' ? 'Không tìm thấy đăng ký' : 'Không có đăng ký nào cần duyệt'}
          </h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'cho_duyet'
              ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
              : 'Tất cả đăng ký đã được xử lý'}
          </p>
          <button
            onClick={loadRegistrations}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tải lại
          </button>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between bg-white/80 rounded-[1.5rem] border border-white/60 p-4 shadow-sm">
        <div className="text-sm text-gray-600">
          Đang hiển thị {filteredRegistrations.length ? (page - 1) * limit + 1 : 0} - {Math.min(page * limit, effectiveTotal)} / {effectiveTotal}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={limit}
            onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }}
            className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
          >
            {[10, 20, 30, 50, 100].map(n => <option key={n} value={n}>{n}/trang</option>)}
          </select>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className={`px-3 py-2 rounded-lg border ${page <= 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-gray-300'}`}
          >
            Trước
          </button>
          <div className="text-sm text-gray-600">
            Trang {page} / {Math.max(1, Math.ceil(effectiveTotal / limit))}
          </div>
          <button
            onClick={() => setPage(p => Math.min(Math.ceil(effectiveTotal / limit) || 1, p + 1))}
            disabled={page >= Math.ceil(effectiveTotal / limit)}
            className={`px-3 py-2 rounded-lg border ${page >= Math.ceil(effectiveTotal / limit) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-gray-300'}`}
          >
            Tiếp
          </button>
        </div>
      </div>

      {/* Summary moved to header */}

      {/* Modals */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => {
          setConfirmModal({ isOpen: false, type: '', registrationId: null, isBulk: false, title: '', message: '' });
          setRejectReason('');
        }}
        onConfirm={handleConfirmAction}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type === 'approve' ? 'confirm' : 'warning'}
        confirmText={confirmModal.type === 'approve' ? 'Phê duyệt' : 'Từ chối'}
        cancelText="Hủy"
        showInput={confirmModal.type === 'reject'}
        inputPlaceholder="Nhập lý do từ chối (tùy chọn)..."
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

      {/* Scroll toggle now handled by global footer */}
    </div>
  );
}
