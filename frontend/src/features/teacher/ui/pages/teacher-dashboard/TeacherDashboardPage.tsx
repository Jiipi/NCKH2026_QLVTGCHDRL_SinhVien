import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Calendar, Award, Clock, CheckCircle, AlertCircle,
  Activity, Target, Loader2
} from 'lucide-react';
import { useNotification } from '../../../../../shared/contexts/NotificationContext';
import useSemesterData, { useGlobalSemesterSync, setGlobalSemester, getGlobalSemester } from '../../../../../shared/hooks/useSemesterData';
import useTeacherDashboard from '../../../model/hooks/useTeacherDashboard';
import useTeacherRegistrationActions from '../../../model/hooks/useTeacherRegistrationActions';
import { teacherDashboardApi } from '../../../services';
import { getUserAvatar, getAvatarGradient } from '../../../../../shared/lib/avatar';
import AppLoadingScreen from '../../../../../shared/components/common/AppLoadingScreen';
import { TeacherChartsSection } from '../../shared/dashboard';

// --- Framer Motion Variants ---
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const, staggerChildren: 0.12 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } }
} as const;

const sectionVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } }
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } }
} as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } }
} as const;

// --- Activity Card (Clean Design) ---
function DashboardMetric({ icon: Icon, value, label, tone, bg }: { icon: any; value: any; label: string; tone: string; bg: string }) {
  return (
    <motion.div variants={cardVariants} className="rounded-[1.75rem] border border-white/60 bg-white/60 p-5 shadow-sm backdrop-blur-2xl transition-all hover:-translate-y-0.5 hover:bg-white/75 hover:shadow-lg dark:border-white/10 dark:bg-slate-950/55 dark:hover:bg-white/10">
      <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-2xl ${bg}`}>
        <Icon className={`h-5 w-5 ${tone}`} />
      </div>
      <p className="text-3xl font-black tracking-[-0.05em] text-slate-950 dark:text-white">{value}</p>
      <p className="mt-1 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{label}</p>
    </motion.div>
  );
}

function ActivityCard({ activity, onApprove, onReject }: { activity: any; onApprove: any; onReject: any }) {
  const statusMap: Record<string, { label: string; cls: string }> = {
    'cho_duyet': { label: 'Chờ duyệt', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    'da_duyet': { label: 'Đã duyệt', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    'tu_choi': { label: 'Từ chối', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
    'hoan_thanh': { label: 'Hoàn thành', cls: 'bg-blue-50 text-blue-700 border-blue-200' }
  };
  const status = statusMap[activity.trang_thai] || { label: activity.trang_thai, cls: 'bg-slate-50 text-slate-700 border-slate-200' };

  return (
    <motion.div variants={cardVariants} className="rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-sm backdrop-blur-2xl transition-all hover:-translate-y-0.5 hover:bg-white/75 hover:shadow-xl dark:border-white/10 dark:bg-slate-950/55 dark:hover:bg-white/10">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 dark:text-white text-base mb-1 truncate">{activity.ten_hd}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{activity.mo_ta}</p>
        </div>
        <span className={`ml-3 px-2.5 py-1 rounded-full text-xs font-medium border ${status.cls}`}>{status.label}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Award className="w-4 h-4 text-amber-500" /><span>Điểm: <b>{activity.diem_rl}</b></span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Calendar className="w-4 h-4 text-blue-500" /><span>{new Date(activity.ngay_bd).toLocaleDateString('vi-VN')}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Users className="w-4 h-4 text-emerald-500" /><span>Sức chứa: <b>{activity.sl_toi_da}</b></span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Clock className="w-4 h-4 text-purple-500" /><span>{new Date(activity.ngay_tao).toLocaleDateString('vi-VN')}</span>
        </div>
      </div>
      {activity.trang_thai === 'cho_duyet' && (
        <div className="flex gap-2">
          <button onClick={() => onApprove(activity.id)} className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
            <CheckCircle className="w-4 h-4" /> Phê duyệt
          </button>
          <button onClick={() => onReject(activity.id)} className="flex-1 bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
            <AlertCircle className="w-4 h-4" /> Từ chối
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default function TeacherDashboardPage() {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useNotification();

  const [semester, setSemesterState] = useState(() => { try { return getGlobalSemester() || null; } catch { return null; } });
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [teacherName, setTeacherName] = useState('Giảng viên');
  const [teacherInitials, setTeacherInitials] = useState('GV');
  const [teacherProfile, setTeacherProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('activities');

  const { options: semesterOptions, currentSemester, loading: semesterLoading } = useSemesterData();
  useGlobalSemesterSync(semester, setSemesterState);

  useEffect(() => { const stored = getGlobalSemester(); if (stored && stored !== semester) setSemesterState(stored); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (semesterLoading) return;
    if (semesterOptions.length === 0 && !currentSemester) return;
    const hasSemesterInOptions = semester && semesterOptions.some(opt => opt.value === semester);
    const fallbackSemester = (() => {
      if (currentSemester && semesterOptions.some(opt => opt.value === currentSemester)) return currentSemester;
      return semesterOptions[0]?.value || null;
    })();
    if ((!semester || !hasSemesterInOptions) && fallbackSemester && fallbackSemester !== semester) {
      setSemesterState(fallbackSemester);
      setGlobalSemester(fallbackSemester);
    }
  }, [semester, semesterLoading, currentSemester, semesterOptions]);

  const handleSetSemester = useCallback((value) => { setSemesterState(value); setGlobalSemester(value); }, []);

  const { stats, recentActivities, pendingRegistrations, classes, students, loading, error, refresh, approve: approveActivity, reject: rejectActivity } = useTeacherDashboard({ semester, classId: selectedClassId });
  const { approveRegistration, rejectRegistration } = useTeacherRegistrationActions();

  useEffect(() => { if (!selectedClassId && classes?.length) setSelectedClassId(classes[0].id); }, [classes, selectedClassId]);

  useEffect(() => {
    let cancelled = false;
    const updateProfile = (p: any) => {
      setTeacherProfile(p);
      const name = p.ho_ten || p.name || 'Giảng viên';
      setTeacherName(name);
      setTeacherInitials(String(name).split(' ').filter(Boolean).map(s => s[0]).join('').slice(0, 2).toUpperCase() || 'GV');
    };
    (async () => {
      try {
        const result = await teacherDashboardApi.getProfile();
        if (!cancelled && result.success) updateProfile(result.data || {});
      } catch {}
    })();
    const handler = (e: any) => { if (e.detail?.profile) updateProfile(e.detail.profile); };
    window.addEventListener('profileUpdated', handler);
    return () => { cancelled = true; window.removeEventListener('profileUpdated', handler); };
  }, []);

  const handleApproveActivity = useCallback(async (id) => { try { await approveActivity(id); showSuccess('Đã phê duyệt hoạt động'); } catch { showError('Không thể phê duyệt'); } }, [approveActivity, showError, showSuccess]);
  const handleRejectActivity = useCallback(async (id) => { const r = window.prompt('Nhập lý do từ chối:'); if (!r?.trim()) { showWarning('Vui lòng nhập lý do'); return; } try { await rejectActivity(id, r.trim()); showSuccess('Đã từ chối'); } catch { showError('Không thể từ chối'); } }, [rejectActivity, showError, showSuccess, showWarning]);
  const handleApproveRegistration = useCallback(async (reg) => { try { const result = await approveRegistration(reg.id); if (!result.success && 'error' in result) throw new Error(result.error); showSuccess('Đã phê duyệt đăng ký'); refresh(); } catch { showError('Không thể phê duyệt đăng ký'); } }, [approveRegistration, refresh, showError, showSuccess]);
  const handleRejectRegistration = useCallback(async (reg) => { const r = window.prompt('Nhập lý do từ chối:', 'Không đáp ứng yêu cầu'); if (!r?.trim()) { showWarning('Vui lòng nhập lý do'); return; } try { const result = await rejectRegistration(reg.id, r.trim()); if (!result.success && 'error' in result) throw new Error(result.error); showSuccess('Đã từ chối đăng ký'); refresh(); } catch { showError('Không thể từ chối'); } }, [rejectRegistration, refresh, showError, showSuccess, showWarning]);

  // Avatar
  const avatarData = teacherProfile ? getUserAvatar(teacherProfile) : null;
  const avatarSrc = avatarData?.hasValidAvatar ? avatarData.src : null;

  return (
    <motion.div className="space-y-6" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <motion.section variants={sectionVariants} className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20 sm:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(99,102,241,0.15),transparent_30%),radial-gradient(circle_at_100%_0%,rgba(20,184,166,0.14),transparent_28%)]" />
        <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${getAvatarGradient(teacherName)} text-white shadow-lg ring-1 ring-white/70 dark:ring-white/10`}>
                {avatarSrc ? (
                  <img src={avatarSrc} alt={teacherName} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <span className="text-xl font-black">{teacherInitials}</span>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-950" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-300">Không gian giảng viên</p>
              <h1 className="mt-1 text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-3xl">Xin chào, {teacherName}!</h1>
              <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-500 dark:text-slate-300">Theo dõi hoạt động, đăng ký, sinh viên và điểm rèn luyện theo học kỳ.</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center xl:justify-end">
            <span className="inline-flex items-center justify-center rounded-2xl border border-indigo-200/70 bg-indigo-50/70 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-indigo-700 shadow-sm backdrop-blur-xl dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-200">Giảng viên</span>
            {classes.length > 0 && (
              <select value={selectedClassId || ''} onChange={(e) => setSelectedClassId(e.target.value || null)}
                className="rounded-2xl border border-white/70 bg-white/55 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm backdrop-blur-xl transition-all focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                {classes.map(c => (<option key={c.id} value={c.id}>{c.ten_lop}</option>))}
              </select>
            )}
          </div>
        </div>
      </motion.section>

      {/* Loading */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AppLoadingScreen />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && !loading && (
        <div className="rounded-[2rem] border border-rose-200/70 bg-rose-50/70 p-8 text-center shadow-sm backdrop-blur-2xl dark:border-rose-400/20 dark:bg-rose-950/20">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-rose-500" />
          <h3 className="mb-2 text-lg font-black text-rose-800 dark:text-rose-200">Có lỗi xảy ra</h3>
          <p className="mb-4 text-sm font-semibold text-rose-600 dark:text-rose-300">{error}</p>
          <button onClick={refresh} className="rounded-2xl bg-rose-600 px-5 py-2 font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-rose-700">Thử lại</button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {!loading && !error && (
          <motion.div key="content" className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <DashboardMetric icon={Clock} value={stats.pendingApprovals} label="Việc cần duyệt" tone="text-amber-600 dark:text-amber-300" bg="bg-amber-50 dark:bg-amber-400/10" />
              <DashboardMetric icon={Activity} value={stats.totalActivities} label="Hoạt động học kỳ" tone="text-indigo-600 dark:text-indigo-300" bg="bg-indigo-50 dark:bg-indigo-400/10" />
              <DashboardMetric icon={Users} value={stats.totalStudents} label="Sinh viên phụ trách" tone="text-sky-600 dark:text-sky-300" bg="bg-sky-50 dark:bg-sky-400/10" />
              <DashboardMetric icon={Target} value={`${stats.participationRate}%`} label="Tỉ lệ tham gia" tone="text-emerald-600 dark:text-emerald-300" bg="bg-emerald-50 dark:bg-emerald-400/10" />
            </motion.div>

            <TeacherChartsSection
              stats={stats}
              students={students}
              recentActivities={recentActivities}
              pendingRegistrations={pendingRegistrations}
            />

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.9fr)]">
              <div className="rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20">
                <div className="mb-5 flex flex-col gap-3 border-b border-white/60 pb-4 dark:border-white/10 sm:flex-row sm:items-center">
                  <button onClick={() => setActiveTab('activities')} className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold transition-all ${activeTab === 'activities' ? 'bg-indigo-50/80 text-indigo-700 shadow-sm ring-1 ring-indigo-100 dark:bg-indigo-400/10 dark:text-indigo-200 dark:ring-indigo-400/20' : 'text-slate-500 hover:bg-white/60 hover:text-slate-800 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white'}`}>
                    <Clock className="w-4 h-4" /> HĐ chờ duyệt
                    {recentActivities?.length > 0 && <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-black text-indigo-700 dark:bg-indigo-400/20 dark:text-indigo-200">{recentActivities.length}</span>}
                  </button>
                  <button onClick={() => setActiveTab('registrations')} className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold transition-all ${activeTab === 'registrations' ? 'bg-purple-50/80 text-purple-700 shadow-sm ring-1 ring-purple-100 dark:bg-purple-400/10 dark:text-purple-200 dark:ring-purple-400/20' : 'text-slate-500 hover:bg-white/60 hover:text-slate-800 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white'}`}>
                    <Users className="w-4 h-4" /> ĐK chờ duyệt
                    {pendingRegistrations?.length > 0 && <span className="rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-black text-purple-700 dark:bg-purple-400/20 dark:text-purple-200">{pendingRegistrations.length}</span>}
                  </button>
                  <button onClick={() => navigate(activeTab === 'activities' ? '/teacher/approve' : '/teacher/registrations')} className="text-sm font-bold text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-200 sm:ml-auto">Xem tất cả →</button>
                </div>

                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-h-[440px] space-y-3 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' as const }}>
                  {activeTab === 'activities' ? (
                    recentActivities?.length ? recentActivities.map(a => (
                      <ActivityCard key={a.id} activity={a} onApprove={handleApproveActivity} onReject={handleRejectActivity} />
                    )) : (
                      <div className="rounded-[2rem] border border-dashed border-white/70 bg-white/45 py-12 text-center text-slate-400 backdrop-blur-xl dark:border-white/10 dark:bg-white/5"><Calendar className="mx-auto mb-3 h-12 w-12 text-slate-300 dark:text-slate-500" /><p className="text-sm font-semibold dark:text-slate-300">Chưa có hoạt động chờ duyệt</p></div>
                    )
                  ) : (
                    pendingRegistrations?.length ? pendingRegistrations.map(reg => (
                      <motion.div key={reg.id} variants={cardVariants} className="rounded-[2rem] border border-white/60 bg-white/60 p-4 shadow-sm backdrop-blur-2xl transition-all hover:-translate-y-0.5 hover:bg-white/75 hover:shadow-xl dark:border-white/10 dark:bg-slate-950/55 dark:hover:bg-white/10">
                        <div className="mb-3 flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <h4 className="mb-1 truncate text-sm font-bold text-slate-900 dark:text-white">{reg.hoat_dong?.ten_hd || 'Hoạt động'}</h4>
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-300">
                              <Users className="h-3.5 w-3.5" /><span>{reg.sinh_vien?.nguoi_dung?.ho_ten || 'N/A'}</span>
                              <span className="text-slate-300 dark:text-slate-600">•</span><span className="font-mono">{reg.sinh_vien?.mssv}</span>
                            </div>
                          </div>
                          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">Chờ duyệt</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleApproveRegistration(reg)} className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-700">
                            <CheckCircle className="h-3.5 w-3.5" /> Phê duyệt
                          </button>
                          <button onClick={() => handleRejectRegistration(reg)} className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-rose-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-rose-700">
                            <AlertCircle className="h-3.5 w-3.5" /> Từ chối
                          </button>
                        </div>
                      </motion.div>
                    )) : (
                      <div className="rounded-[2rem] border border-dashed border-white/70 bg-white/45 py-12 text-center text-slate-400 backdrop-blur-xl dark:border-white/10 dark:bg-white/5"><Users className="mx-auto mb-3 h-12 w-12 text-slate-300 dark:text-slate-500" /><p className="text-sm font-semibold dark:text-slate-300">Chưa có đăng ký chờ duyệt</p></div>
                    )
                  )}
                </motion.div>
              </div>

              {/* Student List */}
              <div className="rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-2xl bg-indigo-50/80 p-2 shadow-sm ring-1 ring-indigo-100 dark:bg-indigo-400/10 dark:ring-indigo-400/20"><Users className="h-4 w-4 text-indigo-600 dark:text-indigo-200" /></div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Sinh viên lớp</h3>
                  </div>
                  <span className="rounded-full bg-white/70 px-2 py-1 text-xs font-bold text-slate-500 shadow-sm ring-1 ring-white/70 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10">{students?.length || 0} SV</span>
                </div>
                <div className="max-h-[440px] space-y-2 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' as const }}>
                  {students?.length ? (
                    students.slice().sort((a, b) => (Number(b.diem_rl) || 0) - (Number(a.diem_rl) || 0)).map((student, idx) => (
                      <div key={student.id} className="rounded-2xl border border-transparent p-3 transition-all hover:border-white/70 hover:bg-white/55 hover:shadow-sm dark:hover:border-white/10 dark:hover:bg-white/5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs bg-gradient-to-br ${getAvatarGradient(student.ho_ten || student.mssv)} shadow-sm`}>
                            {student.ho_ten?.split(' ').pop()?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{student.ho_ten}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-[10px] text-slate-500">{student.mssv}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-[10px] text-slate-500">{student.lop}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm text-indigo-600 dark:text-indigo-400">{student.diem_rl}</p>
                            <p className="text-[10px] text-slate-400">điểm RL</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[2rem] border border-dashed border-white/70 bg-white/45 py-8 text-center text-slate-400 backdrop-blur-xl dark:border-white/10 dark:bg-white/5"><Users className="mx-auto mb-2 h-10 w-10 text-slate-300 dark:text-slate-500" /><p className="text-sm font-semibold dark:text-slate-300">Chưa có sinh viên</p></div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
