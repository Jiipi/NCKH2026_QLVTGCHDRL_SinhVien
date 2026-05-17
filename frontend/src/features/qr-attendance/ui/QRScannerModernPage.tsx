import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, CheckCircle, AlertCircle, QrCode,
  Clock, Users, ScanLine, Fingerprint, ChevronDown, ShieldCheck, Sparkles, Activity
} from 'lucide-react';
import { useLegacyQRScanner } from '../model/hooks/useLegacyQRScanner';
import { createAttendanceFallbackRequest } from '../services/attendanceFallbackApi';
import qrAttendanceApi from '../services/qrAttendanceApi';
import { studentActivitiesApi } from '../../student/services/studentActivitiesApi';
import { FaceAttendanceCard } from '../../face-recognition/ui/components';
import { getCurrentSemesterValue } from '../../../shared/lib/semester';
import { StudentPageHero } from '../../../shared/components/student';
import ScannerView from './components/ScannerView';
import ScannerControls from './components/ScannerControls';

function TabButton({ active, onClick, icon: Icon, label, description }: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  description: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex min-w-0 flex-1 items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all duration-200 sm:px-4 ${active
        ? 'border-indigo-200/80 bg-white/85 text-slate-950 shadow-sm shadow-indigo-100/70 dark:border-indigo-300/20 dark:bg-white/15 dark:text-white dark:shadow-none'
        : 'border-transparent text-slate-500 hover:bg-white/45 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white'
      }`}
    >
      <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${active ? 'bg-gradient-to-br from-indigo-100 to-teal-100 text-indigo-700 dark:from-indigo-400/20 dark:to-teal-400/20 dark:text-indigo-200' : 'bg-white/55 text-slate-400 dark:bg-white/5'}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-black">{label}</span>
        <span className="mt-0.5 block truncate text-xs font-medium opacity-70">{description}</span>
      </span>
    </button>
  );
}

function InstructionItem({ icon: Icon, text, tone = 'indigo' }: {
  icon: React.ElementType;
  text: React.ReactNode;
  tone?: 'indigo' | 'teal' | 'slate' | 'amber' | 'emerald';
}) {
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300',
    teal: 'bg-teal-50 text-teal-600 dark:bg-teal-400/10 dark:text-teal-300',
    slate: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300'
  };

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/50 bg-white/35 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="flex-1 text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">{text}</p>
    </div>
  );
}



export default function QRScannerModernPage() {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const requestedTab = tabParam === 'face' ? 'face' : (tabParam === 'van-tay' || tabParam === 'fingerprint' ? 'fingerprint' : 'qr');
  const requestedActivityId = searchParams.get('activityId') || '';
  const requestedSemester = searchParams.get('semester') || getCurrentSemesterValue(true);
  const [activeTab, setActiveTab] = useState<'qr' | 'face' | 'fingerprint'>(requestedTab);
  const [ongoingActivities, setOngoingActivities] = useState<any[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');
  const [loadingActivities, setLoadingActivities] = useState(false);

  const currentSemester = requestedSemester;
  const approvedActivityIds = useMemo(() => new Set(
    ongoingActivities.map((activity: any) => String(activity.hoat_dong?.id || activity.hd_id || activity.hoat_dong_id || activity.id || ''))
  ), [ongoingActivities]);

  useEffect(() => {
    setActiveTab(requestedTab);
  }, [requestedTab]);

  useEffect(() => {
    if (activeTab !== 'qr' && ongoingActivities.length === 0) {
      const fetchActivities = async () => {
        setLoadingActivities(true);
        try {
          const result = await studentActivitiesApi.getMyActivities(currentSemester);
          if (result.success && (result as any).data) {
            const dataArr = (result as any).data as any[];
            const approvedActivities = dataArr.filter((a: any) =>
              a.trang_thai_dk === 'da_duyet' ||
              (a.registration_status === 'da_duyet') ||
              a.status === 'Đã duyệt'
            );
            setOngoingActivities(approvedActivities);
            if (approvedActivities.length > 0) {
              const matchedActivity = requestedActivityId
                ? approvedActivities.find((activity: any) => String(activity.hoat_dong?.id || activity.hd_id || activity.hoat_dong_id || activity.id || '') === requestedActivityId)
                : null;
              const nextSelectedId = matchedActivity
                ? String(matchedActivity.hoat_dong?.id || matchedActivity.hd_id || matchedActivity.hoat_dong_id || matchedActivity.id || '')
                : String(approvedActivities[0].hoat_dong?.id || approvedActivities[0].hd_id || approvedActivities[0].hoat_dong_id || approvedActivities[0].id || '');
              setSelectedActivityId(nextSelectedId);
            }
          }
        } catch (error) {
          console.error('Lỗi tải hoạt động:', error);
        } finally {
          setLoadingActivities(false);
        }
      };
      fetchActivities();
    }
  }, [activeTab, currentSemester, ongoingActivities.length, requestedActivityId]);

  useEffect(() => {
    if (requestedActivityId && approvedActivityIds.has(requestedActivityId)) {
      setSelectedActivityId(requestedActivityId);
    }
  }, [approvedActivityIds, requestedActivityId]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <StudentPageHero
        eyebrow="Không gian lớp trưởng"
        title="Điểm danh hoạt động"
        description="Chọn phương thức điểm danh phù hợp, quét QR nhanh hoặc xác minh sinh trắc học cho hoạt động đang diễn ra."
        heroIcon={Fingerprint}
        chips={[
          { icon: QrCode, label: 'Quét QR' },
          { icon: Camera, label: 'Khuôn mặt' },
          { icon: Fingerprint, label: 'Vân tay' },
          { icon: ShieldCheck, label: 'Theo hoạt động' },
        ]}
      />

      <div className="rounded-3xl border border-white/60 bg-white/55 p-2 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/45 sm:rounded-[2rem]">
        <div className="flex flex-col gap-2 sm:flex-row">
          <TabButton active={activeTab === 'qr'} onClick={() => setActiveTab('qr')} icon={QrCode} label="Quét mã QR" description="Camera hoặc tải ảnh QR" />
          <TabButton active={activeTab === 'face'} onClick={() => setActiveTab('face')} icon={Camera} label="Nhận diện khuôn mặt" description="Xác minh theo hoạt động" />
          <TabButton active={activeTab === 'fingerprint'} onClick={() => setActiveTab('fingerprint')} icon={Fingerprint} label="Vân tay" description="Passkey hoặc Windows Hello" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'qr' ? (
          <motion.div
            key="qr"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <QRTab />
          </motion.div>
        ) : activeTab === 'face' ? (
          <motion.div
            key="face"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <FaceTab activities={ongoingActivities} loading={loadingActivities} selectedId={selectedActivityId} onSelect={setSelectedActivityId} />
          </motion.div>
        ) : (
          <motion.div
            key="fingerprint"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <FingerprintTab activities={ongoingActivities} loading={loadingActivities} selectedId={selectedActivityId} onSelect={setSelectedActivityId} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QRTab() {
  const {
    videoRef, canvasRef,
    isScanning, isStarting, scanResult, error, isProcessing,
    permissionHint, hasTorch, torchOn,
    startCamera, stopCamera, toggleTorch, requestPermission,
    handleFileUpload, resetScanner,
  } = useLegacyQRScanner();
  const [fallbackReason, setFallbackReason] = useState('');
  const [fallbackSubmitting, setFallbackSubmitting] = useState(false);
  const [fallbackMessage, setFallbackMessage] = useState('');

  const fallbackDetails = scanResult && !scanResult.success ? scanResult.details as any : null;
  const canRequestFallback = Boolean(fallbackDetails?.canRequestFallback);
  const fallbackActivityId = scanResult && !scanResult.success ? scanResult.activityId : '';

  const submitFallback = async () => {
    if (!fallbackActivityId || !fallbackReason.trim()) return;
    setFallbackSubmitting(true);
    setFallbackMessage('');
    try {
      await createAttendanceFallbackRequest(fallbackActivityId, { ly_do: fallbackReason.trim() });
      setFallbackMessage('Đã gửi yêu cầu điểm danh thủ công. Vui lòng chờ lớp trưởng/admin duyệt.');
    } catch (err: any) {
      setFallbackMessage(err?.response?.data?.message || err?.message || 'Không gửi được yêu cầu điểm danh thủ công');
    } finally {
      setFallbackSubmitting(false);
    }
  };

  const uploadFile = (file: File | undefined) => {
    if (!file) return;
    handleFileUpload({ target: { files: [file] } } as any);
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
      <aside className="lg:col-span-2">
        <div className="rounded-3xl border border-white/60 bg-white/60 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20 sm:p-5 lg:sticky lg:top-20 lg:rounded-[2rem]">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300">
              <ScanLine className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.16em] text-slate-900 dark:text-white">Quét QR</h3>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500">Điểm danh nhanh bằng camera</p>
            </div>
          </div>

          <div className="space-y-3">
            <InstructionItem icon={CheckCircle} tone="teal" text={<>Đảm bảo sinh viên đã <strong>đăng ký hoạt động</strong> trước khi điểm danh.</>} />
            <InstructionItem icon={Clock} tone="amber" text={<>Quét trong <strong>khung thời gian điểm danh</strong> do hoạt động quy định.</>} />
            <InstructionItem icon={Camera} tone="slate" text="Giữ mã QR đủ sáng, nằm gọn trong khung camera để nhận diện ổn định." />
          </div>

          <div className="mt-5 rounded-2xl border border-indigo-100/70 bg-indigo-50/50 p-4 text-sm font-medium leading-6 text-indigo-800 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-200">
            Nếu camera không khả dụng, hãy tải ảnh chứa mã QR để hệ thống xử lý thay thế.
          </div>
        </div>
      </aside>

      <section className="lg:col-span-3">
        <div className="rounded-3xl border border-white/60 bg-white/60 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20 sm:p-5 lg:rounded-[2rem]">
          {!scanResult && !isProcessing && (
            <>
              <ScannerView ref={videoRef} isScanning={isScanning} isStarting={isStarting} />
              <canvas ref={canvasRef} className="hidden" />
              <ScannerControls
                isScanning={isScanning}
                isStarting={isStarting}
                hasTorch={hasTorch}
                torchOn={torchOn}
                onStart={startCamera}
                onStop={stopCamera}
                onToggleTorch={toggleTorch}
                onFileUpload={uploadFile}
              />
            </>
          )}

          {isProcessing && (
            <div className="flex min-h-[280px] flex-col items-center justify-center text-center sm:min-h-[420px]">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="mb-5 h-14 w-14 rounded-full border-4 border-indigo-200 border-t-indigo-600" />
              <p className="text-base font-bold text-slate-800 dark:text-slate-100">Đang xử lý điểm danh...</p>
              <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">Vui lòng giữ nguyên thao tác trong giây lát.</p>
            </div>
          )}

          {scanResult && (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex min-h-[280px] flex-col items-center justify-center text-center sm:min-h-[420px]">
              <div className={`mb-5 flex h-20 w-20 items-center justify-center rounded-[1.7rem] ${scanResult.success ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300' : 'bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-300'}`}>
                {scanResult.success ? <CheckCircle className="h-10 w-10" /> : <AlertCircle className="h-10 w-10" />}
              </div>
              <h3 className={`text-2xl font-black tracking-[-0.03em] ${scanResult.success ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                {scanResult.success ? 'Điểm danh thành công' : 'Điểm danh thất bại'}
              </h3>
              <p className="mt-2 max-w-md text-sm font-medium leading-6 text-slate-500 dark:text-slate-300">{scanResult.message}</p>
              {canRequestFallback && fallbackActivityId && (
                <div className="mt-6 w-full max-w-md rounded-2xl border border-amber-200/70 bg-amber-50/80 p-4 text-left dark:border-amber-400/20 dark:bg-amber-400/10">
                  <label className="block text-sm font-bold text-amber-800 dark:text-amber-200">Lý do yêu cầu điểm danh thủ công</label>
                  <textarea
                    value={fallbackReason}
                    onChange={(e) => setFallbackReason(e.target.value)}
                    rows={3}
                    className="mobile-input mt-2 w-full rounded-xl border border-amber-200 bg-white/80 px-3 py-2 text-sm text-slate-800 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 dark:border-amber-400/20 dark:bg-white/10 dark:text-white"
                    placeholder="Ví dụ: GPS bị lỗi nhưng em đang có mặt tại hoạt động..."
                  />
                  {fallbackMessage && <p className="mt-2 text-sm font-semibold text-amber-800 dark:text-amber-200">{fallbackMessage}</p>}
                  <button
                    type="button"
                    onClick={submitFallback}
                    disabled={fallbackSubmitting || !fallbackReason.trim()}
                    className="touch-target mt-3 w-full rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60 sm:w-auto"
                  >
                    {fallbackSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu thủ công'}
                  </button>
                </div>
              )}
              <button
                onClick={resetScanner}
                className="touch-target mt-7 w-full rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 px-6 py-3 text-sm font-bold text-white shadow-sm shadow-indigo-500/20 transition-all hover:-translate-y-0.5 dark:from-white dark:via-indigo-100 dark:to-white dark:text-slate-950 sm:w-auto"
              >
                {scanResult.success ? 'Quét mã khác' : 'Thử lại'}
              </button>
            </motion.div>
          )}

          {error && !scanResult && (
            <div className="mt-4 rounded-2xl border border-rose-200/70 bg-rose-50/80 p-4 text-rose-700 shadow-sm backdrop-blur-xl dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300">
              <p className="text-sm font-bold">{error}</p>
              {permissionHint && (
                <button onClick={requestPermission} className="mt-2 text-sm font-semibold underline underline-offset-4">
                  Yêu cầu quyền camera
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function FaceTab({ activities, loading, selectedId, onSelect }: any) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
      <aside className="lg:col-span-2">
        <div className="rounded-3xl border border-white/60 bg-white/60 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20 sm:p-5 lg:sticky lg:top-20 lg:rounded-[2rem]">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-400/10 dark:text-teal-300">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.16em] text-slate-900 dark:text-white">Khuôn mặt</h3>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500">Xác minh theo hoạt động</p>
            </div>
          </div>

          <div className="space-y-3">
            <InstructionItem icon={Activity} tone="emerald" text={<>Chọn <strong>hoạt động đang diễn ra</strong> từ danh sách đã được duyệt.</>} />
            <InstructionItem icon={Camera} tone="teal" text="Nhìn thẳng vào camera và giữ khuôn mặt rõ ràng trong khung hình." />
            <InstructionItem icon={Users} tone="slate" text="Đảm bảo ánh sáng ổn định, không che mặt để xác minh chính xác." />
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
              Hoạt động đang diễn ra
            </label>
            {loading ? (
              <div className="h-12 w-full animate-pulse rounded-2xl bg-white/55 dark:bg-white/5" />
            ) : activities.length > 0 ? (
              <div className="relative">
                <select
                  value={selectedId}
                  onChange={(e) => onSelect(e.target.value)}
                  className="mobile-input block w-full appearance-none rounded-2xl border border-white/70 bg-white/55 px-4 py-3 pr-10 text-sm font-bold text-slate-900 shadow-inner shadow-white/40 backdrop-blur-xl transition-all focus:border-teal-300 focus:outline-none focus:ring-4 focus:ring-teal-100/70 dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-none"
                >
                  {activities.map((a: any) => {
                    const id = a.hoat_dong?.id || a.hd_id || a.hoat_dong_id || a.id;
                    const name = a.hoat_dong?.ten_hd || a.hoat_dong?.name || a.name || a.ten_hd || `Hoạt động #${id}`;
                    return <option key={id} value={id}>{name}</option>;
                  })}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-200/70 bg-amber-50/80 p-4 text-sm font-semibold text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300">
                Bạn không có hoạt động nào đã được duyệt đang diễn ra.
              </div>
            )}
          </div>
        </div>
      </aside>

      <section className="lg:col-span-3">
        {selectedId && !loading && activities.length > 0 ? (
          <div className="rounded-3xl border border-white/60 bg-white/60 p-3 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20 sm:p-4 lg:rounded-[2rem]">
            <FaceAttendanceCard hoatDongId={selectedId} className="border border-white/60 shadow-sm dark:border-white/10" />
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/70 bg-white/60 p-6 text-center shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 sm:p-12 lg:rounded-[2rem]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/10 dark:text-slate-500">
              <Camera className="h-8 w-8" />
            </div>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Vui lòng chọn hoạt động để bắt đầu</p>
            <p className="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500">Hệ thống sẽ yêu cầu quyền camera khi xác minh khuôn mặt.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function getFingerprintLocation(): Promise<{ latitude: number; longitude: number; accuracy: number } | null> {
  if (!navigator.geolocation) return Promise.resolve(null);
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  });
}

function FingerprintTab({ activities, loading, selectedId, onSelect }: any) {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const selectedActivity = activities.find((a: any) => String(a.hoat_dong?.id || a.hd_id || a.hoat_dong_id || a.id || '') === String(selectedId));

  const submitFingerprint = async () => {
    if (!selectedId || submitting) return;
    setSubmitting(true);
    setResult(null);
    try {
      const location = await getFingerprintLocation();
      const response = await qrAttendanceApi.scanFingerprintAttendance(selectedId, location);
      if (response.success) {
        setResult({ success: true, message: response.message || 'Điểm danh vân tay thành công!' });
        try { window.dispatchEvent(new CustomEvent('attendance:updated', { detail: { activityId: selectedId }})); } catch (_) {}
        try { window.localStorage.setItem('ATTENDANCE_UPDATED_AT', String(Date.now())); } catch (_) {}
      } else {
        setResult({ success: false, message: ('error' in response ? response.error : '') || 'Điểm danh vân tay thất bại' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
      <aside className="lg:col-span-2">
        <div className="rounded-3xl border border-white/60 bg-white/60 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20 sm:p-5 lg:sticky lg:top-20 lg:rounded-[2rem]">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300">
              <Fingerprint className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.16em] text-slate-900 dark:text-white">Vân tay</h3>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500">Xác minh bằng Passkey</p>
            </div>
          </div>

          <div className="space-y-3">
            <InstructionItem icon={ShieldCheck} tone="indigo" text={<>Thiết bị phải được <strong>đăng ký vân tay</strong> trong hồ sơ cá nhân trước khi điểm danh.</>} />
            <InstructionItem icon={Activity} tone="emerald" text={<>Chọn <strong>hoạt động đã được duyệt</strong> rồi xác nhận bằng Windows Hello, Touch ID hoặc Passkey.</>} />
            <InstructionItem icon={Clock} tone="amber" text="Hệ thống vẫn kiểm tra thời gian hoạt động và trạng thái đăng ký trước khi ghi điểm danh." />
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
              Hoạt động điểm danh
            </label>
            {loading ? (
              <div className="h-12 w-full animate-pulse rounded-2xl bg-white/55 dark:bg-white/5" />
            ) : activities.length > 0 ? (
              <div className="relative">
                <select
                  value={selectedId}
                  onChange={(e) => onSelect(e.target.value)}
                  className="mobile-input block w-full appearance-none rounded-2xl border border-white/70 bg-white/55 px-4 py-3 pr-10 text-sm font-bold text-slate-900 shadow-inner shadow-white/40 backdrop-blur-xl transition-all focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100/70 dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-none"
                >
                  {activities.map((a: any) => {
                    const id = a.hoat_dong?.id || a.hd_id || a.hoat_dong_id || a.id;
                    const name = a.hoat_dong?.ten_hd || a.hoat_dong?.name || a.name || a.ten_hd || `Hoạt động #${id}`;
                    return <option key={id} value={id}>{name}</option>;
                  })}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-200/70 bg-amber-50/80 p-4 text-sm font-semibold text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300">
                Bạn không có hoạt động nào đã được duyệt để điểm danh.
              </div>
            )}
          </div>
        </div>
      </aside>

      <section className="lg:col-span-3">
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-white/60 bg-white/60 p-6 text-center shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20 lg:rounded-[2rem]">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-gradient-to-br from-indigo-600 to-teal-500 text-white shadow-lg shadow-indigo-500/25">
            <Fingerprint className="h-10 w-10" />
          </div>
          <h3 className="text-2xl font-black tracking-[-0.03em] text-slate-950 dark:text-white">Điểm danh bằng vân tay</h3>
          <p className="mt-2 max-w-md text-sm font-medium leading-6 text-slate-500 dark:text-slate-300">
            {selectedActivity
              ? (selectedActivity.hoat_dong?.ten_hd || selectedActivity.ten_hd || 'Hoạt động đã chọn')
              : 'Chọn hoạt động để bắt đầu xác minh vân tay.'}
          </p>
          {result && (
            <div className={`mt-5 w-full max-w-md rounded-2xl border p-4 text-sm font-bold ${result.success ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300' : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300'}`}>
              {result.message}
            </div>
          )}
          <button
            type="button"
            onClick={submitFingerprint}
            disabled={!selectedId || submitting || loading || activities.length === 0}
            className="touch-target mt-7 w-full rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 px-6 py-3 text-sm font-bold text-white shadow-sm shadow-indigo-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-60 dark:from-white dark:via-indigo-100 dark:to-white dark:text-slate-950 sm:w-auto"
          >
            {submitting ? 'Đang xác minh...' : 'Xác minh vân tay'}
          </button>
        </div>
      </section>
    </div>
  );
}
