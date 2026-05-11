import React, { useRef, useState } from 'react';
import { Camera, CheckCircle2, Loader2, Trash2, UserCheck, X, XCircle } from 'lucide-react';
import FaceCamera, { type FaceCameraRef } from '../../../../face-recognition/ui/components/FaceCamera';
import monitorFaceAttendanceApi, { type MonitorFaceAttendanceResult } from '../../../services/monitorFaceAttendanceApi';

type ActivityLike = {
  id: string | number;
  ten_hd?: string;
  ten_hoat_dong?: string;
};

type SelectedImage = {
  id: string;
  file: File;
  previewUrl: string;
};

type MonitorBulkFaceAttendanceModalProps = {
  isOpen: boolean;
  activity: ActivityLike | null;
  onClose: () => void;
  onCompleted?: () => void;
};

const MAX_IMAGES = 10;

function dataUrlToFile(dataUrl: string, fileName: string): File {
  const [header, base64Data] = dataUrl.split(',');
  const mime = header.match(/data:(.*?);base64/)?.[1] || 'image/jpeg';
  const binary = atob(base64Data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], fileName, { type: mime });
}

function formatSimilarity(value?: number) {
  if (typeof value !== 'number') return '—';
  return `${(value * 100).toFixed(1)}%`;
}

export default function MonitorBulkFaceAttendanceModal({ isOpen, activity, onClose, onCompleted }: MonitorBulkFaceAttendanceModalProps) {
  const cameraRef = useRef<FaceCameraRef>(null);
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [result, setResult] = useState<MonitorFaceAttendanceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !activity) return null;

  const activityName = activity.ten_hd || activity.ten_hoat_dong || 'Hoạt động đã chọn';

  const addFiles = (files: File[]) => {
    setError(null);
    setResult(null);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      setError('Vui lòng chọn file ảnh hợp lệ.');
      return;
    }

    setImages(prev => {
      const availableSlots = MAX_IMAGES - prev.length;
      if (availableSlots <= 0) {
        setError(`Tối đa ${MAX_IMAGES} ảnh mỗi lần điểm danh.`);
        return prev;
      }

      if (imageFiles.length > availableSlots) {
        setError(`Chỉ thêm được ${availableSlots} ảnh nữa.`);
      }

      const nextImages = imageFiles.slice(0, availableSlots).map(file => ({
        id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        previewUrl: URL.createObjectURL(file)
      }));
      return [...prev, ...nextImages];
    });
  };

  const handleCapture = (imageData: string) => {
    const file = dataUrlToFile(imageData, `face-attendance-${Date.now()}.jpg`);
    addFiles([file]);
  };

  const removeImage = (imageId: string) => {
    setImages(prev => {
      const image = prev.find(item => item.id === imageId);
      if (image) URL.revokeObjectURL(image.previewUrl);
      return prev.filter(item => item.id !== imageId);
    });
  };

  const resetAndClose = () => {
    images.forEach(image => URL.revokeObjectURL(image.previewUrl));
    setImages([]);
    setResult(null);
    setError(null);
    onClose();
  };

  const submitAttendance = async () => {
    if (images.length === 0) {
      setError('Vui lòng chụp hoặc upload ít nhất 1 ảnh.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setResult(null);

    const response = await monitorFaceAttendanceApi.bulkFaceAttendance(String(activity.id), images.map(image => image.file));
    setIsSubmitting(false);

    if (!response.success || !response.data) {
      setError(response.error || 'Không thể xử lý điểm danh khuôn mặt.');
      return;
    }

    setResult(response.data);
    if (response.data.marked.length > 0) {
      onCompleted?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-950">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200/70 p-5 dark:border-white/10">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-500">Điểm danh khuôn mặt</p>
            <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-slate-950 dark:text-white">{activityName}</h2>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-300">Chụp trực tiếp tối đa {MAX_IMAGES} ảnh, hệ thống chỉ nhận diện sinh viên trong lớp của bạn.</p>
          </div>
          <button onClick={resetAndClose} className="rounded-2xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid max-h-[calc(92vh-96px)] gap-5 overflow-y-auto p-5 lg:grid-cols-[420px_1fr]">
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
              <FaceCamera
                ref={cameraRef}
                autoStart={false}
                showControls={true}
                overlayType="oval"
                width={380}
                height={285}
                isProcessing={isSubmitting}
                processingMessage="Đang xử lý điểm danh..."
                onCapture={handleCapture}
                onError={(faceError) => setError(faceError.message)}
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200">
                {error}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 p-4 dark:border-white/10">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-slate-700 dark:text-slate-200">
                  <Camera className="h-4 w-4 text-emerald-500" />
                  Ảnh đã chọn ({images.length}/{MAX_IMAGES})
                </h3>
                <button
                  onClick={submitAttendance}
                  disabled={isSubmitting || images.length === 0}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                  Điểm danh
                </button>
              </div>

              {images.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {images.map((image, index) => (
                    <div key={image.id} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/5">
                      <img src={image.previewUrl} alt={`Ảnh ${index + 1}`} className="h-28 w-full object-cover" />
                      <span className="absolute left-2 top-2 rounded-full bg-slate-950/80 px-2 py-0.5 text-xs font-bold text-white">#{index + 1}</span>
                      <button
                        onClick={() => removeImage(image.id)}
                        disabled={isSubmitting}
                        className="absolute right-2 top-2 rounded-full bg-rose-600 p-1.5 text-white opacity-0 transition group-hover:opacity-100 disabled:opacity-40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm font-semibold text-slate-400 dark:border-white/10">
                  Chưa có ảnh nào. Bật camera và bấm Chụp ảnh để thêm ảnh điểm danh.
                </div>
              )}
            </div>

            {result && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                    <p className="text-xs font-black uppercase text-slate-400">Tổng ảnh</p>
                    <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{result.totalImages}</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-400/20 dark:bg-emerald-400/10">
                    <p className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-300">Thành công</p>
                    <p className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-200">{result.marked.length}</p>
                  </div>
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-400/20 dark:bg-amber-400/10">
                    <p className="text-xs font-black uppercase text-amber-600 dark:text-amber-300">Bỏ qua</p>
                    <p className="mt-1 text-2xl font-black text-amber-700 dark:text-amber-200">{result.skipped.length}</p>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 p-4 dark:border-white/10">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    Đã điểm danh
                  </h3>
                  {result.marked.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="text-xs uppercase text-slate-400">
                          <tr>
                            <th className="px-3 py-2">Ảnh</th>
                            <th className="px-3 py-2">MSSV</th>
                            <th className="px-3 py-2">Họ tên</th>
                            <th className="px-3 py-2">Độ khớp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                          {result.marked.map(student => (
                            <tr key={student.attendanceId}>
                              <td className="px-3 py-2 font-bold">#{student.sourceImageIndex}</td>
                              <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">{student.mssv}</td>
                              <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{student.hoTen}</td>
                              <td className="px-3 py-2 font-bold text-emerald-600">{formatSimilarity(student.similarity)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500 dark:bg-white/5 dark:text-slate-300">Chưa điểm danh được sinh viên nào.</p>
                  )}
                </div>

                <div className="rounded-3xl border border-slate-200 p-4 dark:border-white/10">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-amber-600 dark:text-amber-300">
                    <XCircle className="h-4 w-4" />
                    Bị bỏ qua
                  </h3>
                  {result.skipped.length > 0 ? (
                    <div className="space-y-2">
                      {result.skipped.map((item, index) => (
                        <div key={`${item.sourceImageIndex}-${index}`} className="rounded-2xl bg-amber-50 p-3 text-sm dark:bg-amber-400/10">
                          <div className="flex flex-wrap items-center gap-2 font-bold text-amber-800 dark:text-amber-200">
                            <span>Ảnh #{item.sourceImageIndex}</span>
                            {item.mssv && <span>• {item.mssv}</span>}
                            {item.hoTen && <span>• {item.hoTen}</span>}
                            <span>• {formatSimilarity(item.similarity)}</span>
                          </div>
                          <p className="mt-1 font-medium text-amber-700 dark:text-amber-300">{item.reason}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500 dark:bg-white/5 dark:text-slate-300">Không có ảnh nào bị bỏ qua.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
