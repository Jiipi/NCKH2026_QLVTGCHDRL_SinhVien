import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Image as ImageIcon, File, CheckCircle, UserCheck, Calendar, MapPin, Award } from 'lucide-react';
import useStudentActivityDetail from '../model/hooks/useStudentActivityDetail';
import { getActivityImages } from '../../../shared/lib/activityImages';
import { FaceAttendanceCard } from '../../face-recognition/ui/components';
import { StudentPageHero } from '../../../shared/components/student';
import AppLoadingScreen from '../../../shared/components/common/AppLoadingScreen';

export default function StudentActivityDetailPage() {
  const { id } = useParams();
  const { data, loading, error, refetch } = useStudentActivityDetail(id);
  const [attendanceSuccess, setAttendanceSuccess] = useState(false);
  const [attendanceMessage, setAttendanceMessage] = useState<string | null>(null);

  if (loading) {
    return <AppLoadingScreen />;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (!data) {
    return <div>Không có dữ liệu</div>;
  }

  const start = data?.ngay_bd ? new Date(data.ngay_bd) : null;
  const end = data?.ngay_kt ? new Date(data.ngay_kt) : null;
  const now = new Date();
  const withinTime = start && end ? (start <= now && end >= now) || start > now : true;
  const canRegister = data?.trang_thai === 'da_duyet' && withinTime && !data?.is_registered;

  // Điều kiện điểm danh:
  // 1. Đã đăng ký và được duyệt
  // 2. Hoạt động đang diễn ra (ngay_bd <= now <= ngay_kt)
  // 3. Chưa điểm danh
  const isActivityOngoing = start && end ? (start <= now && end >= now) : false;
  const canAttendWithFace =
    data?.is_registered &&
    data?.registration_status === 'da_duyet' &&
    isActivityOngoing &&
    !data?.is_attended &&
    !attendanceSuccess;

  // Handler khi điểm danh thành công
  const handleAttendanceSuccess = (result: { diemDanhId: string; doTinCay: number }) => {
    setAttendanceSuccess(true);
    setAttendanceMessage(`Điểm danh thành công! Độ tin cậy: ${(result.doTinCay * 100).toFixed(1)}%`);
    // Refresh data sau 2 giây
    setTimeout(() => {
      refetch?.();
    }, 2000);
  };

  // Handler khi điểm danh thất bại
  const handleAttendanceError = (errorMsg: string) => {
    setAttendanceMessage(`Lỗi: ${errorMsg}`);
  };

  const activityImages = getActivityImages(data.hinh_anh, data.loai_hd?.ten_loai_hd || data.loai);
  const metadata = [
    { label: 'Loại hoạt động', value: data.loai || data.loai_hd?.ten_loai_hd || '—' },
    { label: 'Điểm rèn luyện', value: String(data.diem_rl || 0) },
    { label: 'Thời gian', value: data.ngay_bd || '—' },
    { label: 'Địa điểm', value: data.dia_diem || '—' },
    { label: 'SL tối đa', value: String(data.sl_toi_da || 0) },
  ];

  return (
    <div className="flex flex-col flex-1 space-y-6" data-ref="student-activity-detail-refactored">
      <StudentPageHero
        eyebrow="Không gian sinh viên"
        title={data.ten_hd || data.name || 'Hoạt động'}
        description={data.mo_ta || 'Xem chi tiết thông tin hoạt động, hình ảnh và trạng thái điểm danh.'}
        chips={[
          { icon: Award, label: `${data.diem_rl || 0} điểm RL` },
          { icon: Calendar, label: data.ngay_bd ? new Date(data.ngay_bd).toLocaleDateString('vi-VN') : '—' },
          { icon: MapPin, label: data.dia_diem || '—' },
        ]}
      />

      <section className="rounded-[2rem] border border-white/60 bg-white/60 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20">
        <div className="mb-3 flex items-center gap-2">
          <ImageIcon size={20} className="text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Hình ảnh hoạt động</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activityImages.map((url, idx) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-xl border-2 border-gray-200 transition-all hover:border-indigo-500 hover:shadow-lg"
            >
              <img
                src={url}
                alt={`Hình ${idx + 1}`}
                className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="text-sm font-medium text-white">Xem ảnh</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/60 bg-white/60 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {metadata.map((item) => (
            <MetaItem key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </section>

      {Array.isArray(data.tep_dinh_kem) && data.tep_dinh_kem.length > 0 && (
        <section className="rounded-[2rem] border border-white/60 bg-white/60 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20">
          <div className="mb-3 flex items-center gap-2">
            <File size={20} className="text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Tệp đính kèm</h3>
          </div>
          <div className="space-y-2">
            {data.tep_dinh_kem.map((url) => {
              const filename = url.split('/').pop();
              const baseURL =
                typeof window !== 'undefined' && window.location
                  ? `${window.location.origin.replace(/\/$/, '')}/api`
                  : process.env.REACT_APP_API_URL || 'http://dacn_backend_dev:3001/api';
              const backendBase = baseURL.replace('/api', '');
              const downloadUrl = url.startsWith('http') ? url : `${backendBase}${url}`;

              return (
                <a
                  key={url}
                  href={downloadUrl}
                  download={filename}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-2xl border border-white/60 bg-white/45 p-4 shadow-sm backdrop-blur-xl transition-all hover:border-indigo-200 hover:bg-white/70 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <div className="rounded-lg bg-indigo-100 p-2 transition-colors group-hover:bg-indigo-200">
                    <Download size={20} className="text-indigo-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-gray-900">{filename}</div>
                    <div className="text-xs text-gray-500">Nhấn để tải xuống</div>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* Trạng thái đăng ký và điểm danh */}
      <section className="rounded-[2rem] border border-white/60 bg-white/60 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20">
        <div className="flex flex-wrap items-center gap-3">
          {/* Trạng thái đăng ký */}
          {data?.is_registered ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
              <CheckCircle size={14} />
              {data.registration_status === 'da_duyet' ? 'Đã đăng ký (Đã duyệt)' : 'Đã đăng ký (Chờ duyệt)'}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full border border-white/60 bg-white/45 px-3 py-1 text-xs font-semibold text-slate-600 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              {canRegister ? 'Chưa đăng ký' : 'Không thể đăng ký'}
            </span>
          )}

          {/* Trạng thái điểm danh */}
          {data?.is_attended && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              <UserCheck size={14} />
              Đã điểm danh
            </span>
          )}

          {/* Thông báo điểm danh */}
          {attendanceMessage && (
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${attendanceSuccess
                ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border border-red-200 bg-red-50 text-red-700'
              }`}>
              {attendanceMessage}
            </span>
          )}
        </div>
      </section>

      {/* Điểm danh bằng khuôn mặt */}
      {canAttendWithFace && id && (
        <FaceAttendanceCard
          hoatDongId={id}
          onSuccess={handleAttendanceSuccess}
          onError={handleAttendanceError}
          className="shadow-lg"
        />
      )}

      {/* Thông báo khi đã điểm danh thành công */}
      {attendanceSuccess && (
        <section className="rounded-[2rem] border border-emerald-200/70 bg-emerald-50/70 p-6 shadow-sm backdrop-blur-2xl dark:border-emerald-400/20 dark:bg-emerald-400/10">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-emerald-100 p-2">
              <CheckCircle size={24} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-800">Điểm danh thành công!</h3>
              <p className="text-sm text-emerald-600">Bạn đã điểm danh hoạt động này bằng nhận diện khuôn mặt.</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/45 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
      <div className="text-xs font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">{label}</div>
      <div className="mt-1 font-bold text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}

