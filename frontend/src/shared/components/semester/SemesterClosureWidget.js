import React, { useEffect, useState } from 'react';
import { Lock, Unlock, Hourglass, AlertCircle, ShieldCheck, Calendar, Send, ArrowRight } from 'lucide-react';
import http from '../../api/http';
import { invalidateSemesterDataCache } from '../../hooks/useSemesterData';
import { useNotification } from '../../contexts/NotificationContext';

export default function SemesterClosureWidget({ compact = false, onChanged, classId: forcedClassId = null, enableSoftLock = false, enableHardLock = false, className = '', allowProposeWithoutClass = false }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState(null); // { classId, semester: { semester, year }, state: {...}, activeSemester }
  const [busy, setBusy] = useState(false);
  const { showSuccess, showError, confirm } = useNotification();

  const loadStatus = async () => {
    try {
      setLoading(true);
      const res = await http.get('/semesters/status', { params: forcedClassId ? { classId: forcedClassId } : {} });
      const data = res.data?.data;
      
      // Nếu allowProposeWithoutClass=true, luôn cho phép đề xuất (override state)
      if (allowProposeWithoutClass) {
        // Lấy semester hiện tại
        const currentRes = await http.get('/semesters/current');
        const current = currentRes.data?.data;
        if (current) {
          setInfo({
            classId: data?.classId || null,
            semester: current,
            state: { state: 'ACTIVE' } // Override để luôn hiện nút đề xuất
          });
        } else {
          setInfo(null);
        }
      } else {
        setInfo(data || null);
      }
      setError('');
    } catch (e) {
      setError(e?.response?.data?.message || 'Không thể tải trạng thái học kỳ');
      setInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowProposeWithoutClass]);

  const labelForState = (s) => {
    switch (s) {
      case 'ACTIVE': return { text: 'Đang mở', color: 'text-emerald-700', bg: 'bg-emerald-50', icon: <Unlock className="w-4 h-4"/> };
      case 'CLOSING': return { text: 'Đang đề xuất đóng', color: 'text-amber-700', bg: 'bg-amber-50', icon: <Hourglass className="w-4 h-4"/> };
      case 'LOCKED_SOFT': return { text: 'Đã chốt mềm', color: 'text-indigo-700', bg: 'bg-indigo-50', icon: <Lock className="w-4 h-4"/> };
      case 'LOCKED_HARD': return { text: 'Đã khóa', color: 'text-rose-700', bg: 'bg-rose-50', icon: <ShieldCheck className="w-4 h-4"/> };
      default: return { text: s || 'Không xác định', color: 'text-gray-700', bg: 'bg-gray-50', icon: <AlertCircle className="w-4 h-4"/> };
    }
  };

  const formatSemester = (sem) => {
    if (!sem) return '';
    const hk = sem.semester === 'hoc_ky_1' ? 'HK1' : 'HK2';
    return `${hk} - ${sem.year}`;
  };

  // Gửi thông báo đề xuất đóng học kỳ đến tất cả Admin
  const sendNotificationToAdmins = async (semester, reason = '') => {
    try {
      // Sử dụng endpoint mới không cần quyền admin
      const semesterKey = `${semester.semester}-${semester.year}`;
      await http.post('/semesters/request-closure', {
        semester: semesterKey,
        reason: reason || 'Giảng viên/Lớp trưởng đề xuất đóng học kỳ'
      });
      return true;
    } catch (e) {
      console.warn('Không thể gửi thông báo đến admin:', e);
      throw e; // Re-throw để xử lý ở caller
    }
  };

  const proposeClose = async () => {
    const classId = forcedClassId || info?.classId;
    
    const semesterLabel = formatSemester(info.semester);
    const confirmed = await confirm({
      title: 'Xác nhận đề xuất đóng học kỳ',
      message: `Bạn có chắc muốn đề xuất đóng ${semesterLabel}? Thông báo sẽ được gửi đến Admin để xác nhận.`,
      confirmText: 'Đề xuất',
      cancelText: 'Hủy'
    });
    
    if (!confirmed) return;
    
    try {
      setBusy(true);
      
      // Nếu có classId, gọi API propose-close để thay đổi state
      if (classId) {
        try {
          await http.post('/semesters/propose-close', { 
            classId, 
            semester: `${info.semester.semester}-${info.semester.year}` 
          });
        } catch (e) {
          // Ignore if no permission, vẫn tiếp tục gửi notification
          console.warn('Không thể thay đổi state lớp:', e);
        }
      }
      
      // Gửi thông báo đến tất cả Admin
      await sendNotificationToAdmins(info.semester);
      
      await loadStatus();
      showSuccess(`Đã đề xuất đóng ${semesterLabel}. Thông báo đã gửi đến Admin.`);
      onChanged && onChanged();
    } catch (e) {
      showError(e?.response?.data?.message || 'Không thể đề xuất đóng');
      setError(e?.response?.data?.message || 'Không thể đề xuất đóng');
    } finally {
      setBusy(false);
    }
  };

  const rollback = async () => {
    const classId = forcedClassId || info?.classId;
    if (!classId) return;
    try {
      setBusy(true);
      await http.post('/semesters/rollback', { classId, semester: `${info.semester.semester}-${info.semester.year}` });
      await loadStatus();
      showSuccess('Đã hủy đề xuất đóng học kỳ');
      onChanged && onChanged();
    } catch (e) {
      showError(e?.response?.data?.message || 'Không thể hủy');
      setError(e?.response?.data?.message || 'Không thể hủy chốt mềm');
    } finally {
      setBusy(false);
    }
  };

  const softLock = async () => {
    const classId = forcedClassId || info?.classId;
    if (!classId) return;
    try {
      setBusy(true);
      await http.post('/semesters/soft-lock', { classId, semester: `${info.semester.semester}-${info.semester.year}`, graceHours: 72 });
      await loadStatus();
      showSuccess('Đã chốt mềm học kỳ (72 giờ để hủy)');
      onChanged && onChanged();
    } catch (e) {
      showError(e?.response?.data?.message || 'Không thể chốt mềm');
      setError(e?.response?.data?.message || 'Không thể chốt mềm');
    } finally {
      setBusy(false);
    }
  };

  const hardLock = async () => {
    const classId = forcedClassId || info?.classId;
    if (!classId) return;
    
    const semesterLabel = formatSemester(info.semester);
    const confirmed = await confirm({
      title: 'Xác nhận đóng học kỳ',
      message: `Bạn chắc chắn muốn xác nhận đóng ${semesterLabel}?\n\nSau khi đóng cứng sẽ không thể chỉnh sửa dữ liệu học kỳ này và hệ thống sẽ tự động chuyển sang học kỳ tiếp theo.`,
      confirmText: 'Xác nhận đóng',
      cancelText: 'Hủy'
    });
    
    if (!confirmed) return;
    
    try {
      setBusy(true);
      
      // 1. Hard lock học kỳ hiện tại
      await http.post('/semesters/hard-lock', { classId, semester: `${info.semester.semester}-${info.semester.year}` });
      
      // 2. Tạo và kích hoạt học kỳ tiếp theo
      try {
        const nextResult = await http.post('/semesters/create-next');
        if (nextResult.data?.success) {
          showSuccess(`Đã đóng ${semesterLabel} và chuyển sang học kỳ mới: ${nextResult.data.data?.label || 'Học kỳ tiếp theo'}`);
        }
      } catch (nextErr) {
        console.warn('Không thể tạo học kỳ tiếp theo:', nextErr);
        showSuccess(`Đã đóng ${semesterLabel}. Vui lòng tạo học kỳ mới thủ công.`);
      }
      
      // Invalidate semester cache so new semester becomes visible immediately
      invalidateSemesterDataCache();
      
      await loadStatus();
      onChanged && onChanged();
    } catch (e) {
      showError(e?.response?.data?.message || 'Không thể chốt cứng');
      setError(e?.response?.data?.message || 'Không thể chốt cứng');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className={`rounded-xl border p-3 ${compact ? '' : 'bg-white'}`}>
        <div className="text-sm text-gray-500">Đang tải trạng thái học kỳ...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border p-3 bg-rose-50 border-rose-200 text-rose-700 text-sm flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        {error}
      </div>
    );
  }

  // Graceful: when API returns { success: true, data: null } meaning no class context
  if (!info) {
    return (
      <div className={`rounded-xl border p-3 ${compact ? '' : 'bg-white'} text-sm text-gray-500 ${className}`}>
        Chưa có lớp phụ trách hoặc chưa gán lớp
      </div>
    );
  }

  const stateMeta = labelForState(info?.state?.state);
  // Cho phép đề xuất nếu state là ACTIVE
  const canPropose = info?.state?.state === 'ACTIVE';
  const canRollback = info?.state?.state === 'LOCKED_SOFT';
  const canSoftLock = enableSoftLock && info?.state?.state === 'CLOSING';
  const canHardLock = enableHardLock && ['LOCKED_SOFT', 'CLOSING'].includes(info?.state?.state);

  // Compact mode for integration into filter card
  if (compact && className.includes('!p-0')) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-600" />
            <div>
              <div className="text-xs text-gray-500 font-medium">Học kỳ đang kích hoạt</div>
              <div className="font-bold text-gray-900 text-sm">{formatSemester(info.semester)}</div>
            </div>
          </div>
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border ${stateMeta.bg} ${stateMeta.color}`}>
            {stateMeta.icon}
            <span>{stateMeta.text}</span>
          </div>
        </div>
        {(canPropose || canSoftLock || canRollback || canHardLock) && (
          <div className="flex items-center gap-2">
            {info.state?.state === 'LOCKED_SOFT' && info.state?.grace_until && (
              <div className="text-xs text-gray-600 flex-1">
                Có thể hủy trước: <span className="font-medium">{new Date(info.state.grace_until).toLocaleString('vi-VN')}</span>
              </div>
            )}
            <div className="flex items-center gap-2 ml-auto">
              {canPropose && (
                <button onClick={proposeClose} disabled={busy} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-60 border-2 border-black shadow-sm flex items-center gap-1">
                  <Send className="w-3 h-3" />
                  Đề xuất đóng học kỳ
                </button>
              )}
              {canSoftLock && (
                <button onClick={softLock} disabled={busy} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60 border-2 border-black shadow-sm">
                  Chốt mềm 72h
                </button>
              )}
              {canRollback && (
                <button onClick={rollback} disabled={busy} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-600 hover:bg-gray-700 text-white disabled:opacity-60 border-2 border-black shadow-sm">
                  Hủy đề xuất
                </button>
              )}
              {canHardLock && (
                <button onClick={hardLock} disabled={busy} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-60 border-2 border-black shadow-sm flex items-center gap-1">
                  <ArrowRight className="w-3 h-3" />
                  Xác nhận khóa & Chuyển kỳ
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
  <div className={`rounded-2xl border ${compact ? 'p-3' : 'p-4 bg-white'} ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Học kỳ đang kích hoạt</div>
            <div className="font-semibold text-gray-900">{formatSemester(info.semester)}</div>
          </div>
        </div>
        <div className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium border ${stateMeta.bg} ${stateMeta.color}`}>
          {stateMeta.icon}
          <span>{stateMeta.text}</span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        {info.state?.state === 'LOCKED_SOFT' && info.state?.grace_until && (
          <div className="text-xs text-gray-600">
            Có thể hủy trước: <span className="font-medium">{new Date(info.state.grace_until).toLocaleString('vi-VN')}</span>
          </div>
        )}
        <div className="flex items-center gap-2 ml-auto">
          {canPropose && (
            <button onClick={proposeClose} disabled={busy} className="px-3 py-1.5 rounded-lg text-sm bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-60 flex items-center gap-1">
              <Send className="w-3.5 h-3.5" />
              Đề xuất đóng học kỳ
            </button>
          )}
          {canSoftLock && (
            <button onClick={softLock} disabled={busy} className="px-3 py-1.5 rounded-lg text-sm bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60">
              Chốt mềm 72h
            </button>
          )}
          {canRollback && (
            <button onClick={rollback} disabled={busy} className="px-3 py-1.5 rounded-lg text-sm bg-gray-600 hover:bg-gray-700 text-white disabled:opacity-60">
              Hủy đề xuất
            </button>
          )}
          {canHardLock && (
            <button onClick={hardLock} disabled={busy} className="px-3 py-1.5 rounded-lg text-sm bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-60 flex items-center gap-1">
              <ArrowRight className="w-3.5 h-3.5" />
              Xác nhận khóa & Chuyển kỳ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
