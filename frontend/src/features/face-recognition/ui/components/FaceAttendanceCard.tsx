/**
 * FaceAttendanceCard - Thẻ điểm danh bằng khuôn mặt
 * Glassmorphism design, đồng bộ font hệ thống
 */
import React, { useState, useRef, useCallback } from 'react';
import { Camera, ChevronDown, CheckCircle, AlertTriangle, ShieldAlert, Send, UserPlus } from 'lucide-react';
import FaceCamera, { FaceCameraRef } from './FaceCamera';
import { useFaceRecognition } from '../../model/hooks/useFaceRecognition';
import { createFaceFallback } from '../../services/faceApi';

interface FaceAttendanceCardProps {
  hoatDongId: string;
  onSuccess?: (result: { diemDanhId: string; doTinCay: number }) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

// Error message classification
const ERROR_CONFIGS: Record<string, { icon: React.ElementType; title: string; hint: string; canFallback: boolean; tone: string }> = {
  NO_FACE: {
    icon: AlertTriangle,
    title: 'Không thấy khuôn mặt',
    hint: 'Vui lòng đưa mặt vào khung hình và đảm bảo đủ ánh sáng.',
    canFallback: false,
    tone: 'border-amber-200/70 bg-amber-50/80 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200'
  },
  MULTI_FACE: {
    icon: AlertTriangle,
    title: 'Phát hiện nhiều khuôn mặt',
    hint: 'Chỉ cho phép 1 khuôn mặt trong khung hình.',
    canFallback: false,
    tone: 'border-amber-200/70 bg-amber-50/80 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200'
  },
  LIVENESS_FAIL: {
    icon: ShieldAlert,
    title: 'Ảnh không đạt kiểm tra',
    hint: 'Vui lòng chụp trực tiếp từ camera, không dùng ảnh in.',
    canFallback: true,
    tone: 'border-rose-200/70 bg-rose-50/80 text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200'
  },
  MISMATCH: {
    icon: ShieldAlert,
    title: 'Khuôn mặt không khớp',
    hint: 'Khuôn mặt không khớp với dữ liệu đã đăng ký.',
    canFallback: true,
    tone: 'border-rose-200/70 bg-rose-50/80 text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200'
  },
  NOT_VERIFIED: {
    icon: AlertTriangle,
    title: 'Chưa được xác minh',
    hint: 'Dữ liệu khuôn mặt chưa được duyệt. Vui lòng chờ quản trị viên xác minh.',
    canFallback: true,
    tone: 'border-amber-200/70 bg-amber-50/80 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200'
  },
  NO_REGISTRATION: {
    icon: AlertTriangle,
    title: 'Chưa đăng ký khuôn mặt',
    hint: 'Bạn cần đăng ký khuôn mặt trước khi sử dụng tính năng này.',
    canFallback: false,
    tone: 'border-amber-200/70 bg-amber-50/80 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200'
  },
  GEOFENCE_FAIL: {
    icon: ShieldAlert,
    title: 'Ngoài khu vực cho phép',
    hint: 'Bạn đang ở ngoài khu vực điểm danh.',
    canFallback: true,
    tone: 'border-rose-200/70 bg-rose-50/80 text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200'
  },
  UNKNOWN: {
    icon: AlertTriangle,
    title: 'Điểm danh thất bại',
    hint: 'Vui lòng thử lại sau.',
    canFallback: true,
    tone: 'border-rose-200/70 bg-rose-50/80 text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200'
  }
};

export const FaceAttendanceCard: React.FC<FaceAttendanceCardProps> = ({
  hoatDongId,
  onSuccess,
  onError,
  disabled = false,
  className = ''
}) => {
  const cameraRef = useRef<FaceCameraRef>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; confidence?: number; errorCode?: string } | null>(null);
  const [fallbackSent, setFallbackSent] = useState(false);
  const [fallbackLoading, setFallbackLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const consecutiveFailsRef = useRef(0);

  const {
    attend,
    checkStatus,
    isRegistered,
    isLoading,
    isAttending,
  } = useFaceRecognition();

  // Mở/đóng camera
  const toggleCamera = useCallback(async () => {
    if (!isExpanded) {
      await checkStatus();
    }
    setIsExpanded(!isExpanded);
    setResult(null);
    setFallbackSent(false);
    consecutiveFailsRef.current = 0;
  }, [isExpanded, checkStatus]);

  // Xử lý khi chụp ảnh
  const handleCapture = useCallback(async (imageData: string) => {
    try {
      const response = await fetch(imageData);
      const blob = await response.blob();
      const attendResult = await attend(hoatDongId, blob);

      if (attendResult.success) {
        consecutiveFailsRef.current = 0;
        setResult({
          success: true,
          message: 'Điểm danh thành công!',
          confidence: attendResult.similarity
        });
        onSuccess?.({
          diemDanhId: attendResult.attendanceId || '',
          doTinCay: attendResult.similarity || 0
        });
        setTimeout(() => {
          cameraRef.current?.stopStream();
        }, 2000);
      } else {
        consecutiveFailsRef.current++;
        const errorCode = attendResult.errorCode || 'UNKNOWN';
        setResult({
          success: false,
          message: attendResult.message || 'Điểm danh thất bại. Vui lòng thử lại.',
          errorCode
        });
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), 2000);
        onError?.(attendResult.message || 'Điểm danh thất bại');
      }
    } catch (err) {
      consecutiveFailsRef.current++;
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra';
      setResult({
        success: false,
        message,
        errorCode: 'UNKNOWN'
      });
      setIsPaused(true);
      setTimeout(() => setIsPaused(false), 2000);
      onError?.(message);
    }
  }, [hoatDongId, attend, onSuccess, onError]);

  // Gửi yêu cầu fallback
  const handleFallback = useCallback(async () => {
    setFallbackLoading(true);
    try {
      const fbResult = await createFaceFallback(
        hoatDongId,
        result?.message || 'Điểm danh khuôn mặt thất bại',
        result?.errorCode,
        result?.confidence
      );
      if (fbResult.success) {
        setFallbackSent(true);
      } else {
        alert(fbResult.message);
      }
    } catch {
      alert('Không thể gửi yêu cầu. Vui lòng thử lại.');
    } finally {
      setFallbackLoading(false);
    }
  }, [hoatDongId, result]);

  const errorConfig = result?.errorCode ? (ERROR_CONFIGS[result.errorCode] || ERROR_CONFIGS.UNKNOWN) : null;
  const notRegistered = !isRegistered;

  return (
    <div className={`overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20 ${className}`}>
      {/* Header */}
      <div
        className={`cursor-pointer p-5 transition-colors ${disabled
          ? 'bg-slate-100 dark:bg-slate-800'
          : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800'
        }`}
        onClick={!disabled ? toggleCamera : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${disabled ? 'bg-slate-300 dark:bg-slate-600' : 'bg-white/20 backdrop-blur-sm'}`}>
              <Camera className={`h-5 w-5 ${disabled ? 'text-slate-500' : 'text-white'}`} />
            </div>
            <div>
              <h3 className={`text-base font-black tracking-tight ${disabled ? 'text-slate-500' : 'text-white'}`}>
                Nhận diện khuôn mặt
              </h3>
              <p className={`text-xs font-medium ${disabled ? 'text-slate-400' : 'text-white/70'}`}>
                {disabled ? 'Không khả dụng' : (isExpanded ? 'Nhấn để đóng' : 'Nhấn để mở camera')}
              </p>
            </div>
          </div>

          {!disabled && (
            <ChevronDown className={`h-5 w-5 text-white transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          )}
        </div>
      </div>

      {/* Expandable content */}
      {isExpanded && (
        <div className="p-5">
          {/* Chưa đăng ký khuôn mặt */}
          {notRegistered && (
            <div className="rounded-2xl border border-amber-200/70 bg-amber-50/80 p-6 text-center dark:border-amber-400/20 dark:bg-amber-400/10">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-400/20">
                <AlertTriangle className="h-7 w-7 text-amber-600 dark:text-amber-300" />
              </div>
              <h4 className="text-base font-black tracking-tight text-amber-800 dark:text-amber-200">
                Chưa đăng ký khuôn mặt
              </h4>
              <p className="mt-1 text-sm font-medium text-amber-700/80 dark:text-amber-300/80">
                Bạn cần đăng ký khuôn mặt trước khi sử dụng tính năng này.
              </p>
              <a
                href="/student/face-registration"
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-amber-700"
              >
                <UserPlus className="h-4 w-4" />
                Đăng ký ngay
              </a>
            </div>
          )}

          {/* Đã đăng ký - hiển thị camera */}
          {!notRegistered && (
            <>
              {/* Result message */}
              {result && (
                <div className={`mb-5 rounded-2xl border p-4 ${result.success
                  ? 'border-emerald-200/70 bg-emerald-50/80 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200'
                  : errorConfig?.tone || 'border-rose-200/70 bg-rose-50/80 text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200'
                }`}>
                  {result.success ? (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-black tracking-tight">{result.message}</p>
                        {result.confidence && (
                          <p className="mt-0.5 text-xs font-medium opacity-70">
                            Độ tin cậy: {(result.confidence * 100).toFixed(1)}%
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start gap-3">
                        {errorConfig && <errorConfig.icon className="mt-0.5 h-5 w-5 flex-shrink-0" />}
                        <div className="flex-1">
                          <p className="text-sm font-black tracking-tight">{errorConfig?.title || 'Điểm danh thất bại'}</p>
                          <p className="mt-0.5 text-xs font-medium opacity-70">{errorConfig?.hint || result.message}</p>
                          {result.confidence !== undefined && result.confidence > 0 && (
                            <p className="mt-1 text-[11px] font-medium opacity-50">
                              Độ tương đồng: {(result.confidence * 100).toFixed(1)}%
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Fallback button */}
                      {errorConfig?.canFallback && !fallbackSent && (
                        <div className="mt-3 border-t border-current/10 pt-3">
                          <button
                            onClick={handleFallback}
                            disabled={fallbackLoading}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-amber-600 disabled:opacity-50"
                          >
                            {fallbackLoading ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                            Gửi yêu cầu xác minh thủ công
                          </button>
                          <p className="mt-1 text-center text-[11px] font-medium opacity-50">Giảng viên hoặc lớp trưởng sẽ xem xét</p>
                        </div>
                      )}

                      {fallbackSent && (
                        <div className="mt-3 flex items-center gap-2 border-t border-emerald-200/50 pt-3 text-emerald-700 dark:text-emerald-300">
                          <CheckCircle className="h-4 w-4" />
                          <p className="text-xs font-bold">Đã gửi yêu cầu xác minh thành công!</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Camera */}
              {!result?.success && (
                <>
                  <div className="w-full max-w-sm mx-auto">
                    <FaceCamera
                      ref={cameraRef}
                      showControls={false}
                      autoStart={true}
                      autoCapture={!isPaused && !isAttending && !result?.success}
                      onAutoCapture={handleCapture}
                      overlayType="oval"
                      width={400}
                      height={300}
                      className="w-full"
                      isProcessing={isAttending || isPaused}
                      processingMessage={isPaused ? "Đang xử lý kết quả..." : "Đang nhận dạng khuôn mặt..."}
                    />
                  </div>

                  {/* Status bar */}
                  <div className="mt-5 flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-center">
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="rounded-2xl border border-white/60 bg-white/45 px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-xl transition hover:bg-white/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                    >
                      Đóng Camera
                    </button>

                    <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200/70 bg-emerald-50/80 px-5 py-2.5 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
                      {isAttending ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                          <span className="text-sm font-bold tracking-tight">Đang xử lý ảnh...</span>
                        </>
                      ) : (
                        <>
                          <div className="relative flex h-4 w-4 items-center justify-center">
                            <div className="absolute h-full w-full animate-ping rounded-full border-2 border-emerald-600 opacity-60" />
                            <div className="h-2 w-2 rounded-full bg-emerald-600" />
                          </div>
                          <span className="text-sm font-bold tracking-tight">Tự động quét khuôn mặt</span>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* Loading */}
          {isLoading && !isRegistered && (
            <div className="py-8 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
              <p className="mt-2 text-sm font-bold tracking-tight text-slate-500 dark:text-slate-400">Đang kiểm tra...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FaceAttendanceCard;
