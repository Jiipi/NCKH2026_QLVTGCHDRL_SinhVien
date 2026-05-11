/**
 * FaceAttendanceCard - Thẻ điểm danh bằng khuôn mặt
 * Hiển thị trong trang điểm danh hoạt động
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
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
const ERROR_CONFIGS: Record<string, { icon: string; title: string; hint: string; canFallback: boolean }> = {
  NO_FACE: {
    icon: '👤',
    title: 'Không thấy khuôn mặt',
    hint: 'Vui lòng đưa mặt vào khung hình và đảm bảo đủ ánh sáng.',
    canFallback: false
  },
  MULTI_FACE: {
    icon: '👥',
    title: 'Phát hiện nhiều khuôn mặt',
    hint: 'Chỉ cho phép 1 khuôn mặt trong khung hình. Vui lòng đứng riêng.',
    canFallback: false
  },
  LIVENESS_FAIL: {
    icon: '📷',
    title: 'Ảnh không đạt kiểm tra',
    hint: 'Vui lòng chụp trực tiếp từ camera, không dùng ảnh in hoặc màn hình.',
    canFallback: true
  },
  MISMATCH: {
    icon: '❌',
    title: 'Khuôn mặt không khớp',
    hint: 'Khuôn mặt không khớp với dữ liệu đã đăng ký.',
    canFallback: true
  },
  NOT_VERIFIED: {
    icon: '⏳',
    title: 'Chưa được xác minh',
    hint: 'Dữ liệu khuôn mặt chưa được duyệt. Vui lòng chờ quản trị viên hoặc giảng viên xác minh.',
    canFallback: true
  },
  NO_REGISTRATION: {
    icon: '⚠️',
    title: 'Chưa đăng ký khuôn mặt',
    hint: 'Bạn cần đăng ký khuôn mặt trước khi sử dụng tính năng này.',
    canFallback: false
  },
  GEOFENCE_FAIL: {
    icon: '📍',
    title: 'Ngoài khu vực cho phép',
    hint: 'Bạn đang ở ngoài khu vực điểm danh. Vui lòng di chuyển đến đúng vị trí.',
    canFallback: true
  },
  UNKNOWN: {
    icon: '⚠️',
    title: 'Điểm danh thất bại',
    hint: 'Vui lòng thử lại sau.',
    canFallback: true
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
  const consecutiveFailsRef = useRef(0);

  const {
    attend,
    faceStatus,
    checkStatus,
    isRegistered,
    isLoading,
    isAttending,
    error
  } = useFaceRecognition();

  // Mở/đóng camera
  const toggleCamera = useCallback(async () => {
    if (!isExpanded) {
      // Kiểm tra trạng thái đăng ký khuôn mặt trước
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
      // Chuyển base64 thành Blob
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

        // Tắt camera sau khi thành công
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
      onError?.(message);
    }
  }, [hoatDongId, attend, onSuccess, onError]);

  // Chụp ảnh từ camera
  const handleTakePhoto = useCallback(() => {
    const imageData = cameraRef.current?.capture();
    if (imageData) {
      handleCapture(imageData);
    }
  }, [handleCapture]);

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

  // Tự động quét khuôn mặt với exponential backoff
  const isAttendingRef = useRef(isAttending);
  useEffect(() => {
    isAttendingRef.current = isAttending;
  }, [isAttending]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isExpanded && isRegistered && !result?.success) {
      // Exponential backoff: 2.5s → 5s → 10s → cap at 10s
      const getDelay = () => {
        const base = 2500;
        const fails = consecutiveFailsRef.current;
        return Math.min(base * Math.pow(2, fails), 10000);
      };

      // Đợi 1.5s để camera khởi động xong trước khi bắt đầu vòng lặp quét
      const timeoutId = setTimeout(() => {
        const scheduleNext = () => {
          intervalId = setTimeout(() => {
            if (!isAttendingRef.current && cameraRef.current?.isStreaming) {
              handleTakePhoto();
            }
            scheduleNext();
          }, getDelay());
        };
        scheduleNext();
      }, 1500);

      return () => {
        clearTimeout(timeoutId);
        if (intervalId) clearTimeout(intervalId);
      };
    }

    return () => {
      if (intervalId) clearTimeout(intervalId);
    };
  }, [isExpanded, isRegistered, result?.success, handleTakePhoto]);

  // Get error config for display
  const errorConfig = result?.errorCode ? (ERROR_CONFIGS[result.errorCode] || ERROR_CONFIGS.UNKNOWN) : null;

  // Nếu chưa đăng ký khuôn mặt
  const notRegistered = !isRegistered;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div
        className={`p-4 cursor-pointer transition ${disabled ? 'bg-gray-100 dark:bg-gray-700' : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
          }`}
        onClick={!disabled ? toggleCamera : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${disabled ? 'bg-gray-300 dark:bg-gray-600' : 'bg-white/20'}`}>
              <svg
                className={`w-6 h-6 ${disabled ? 'text-gray-500' : 'text-white'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className={`font-semibold ${disabled ? 'text-gray-500' : 'text-white'}`}>
                Điểm danh bằng khuôn mặt
              </h3>
              <p className={`text-sm ${disabled ? 'text-gray-400' : 'text-white/80'}`}>
                {disabled ? 'Không khả dụng' : 'Nhấn để mở camera'}
              </p>
            </div>
          </div>

          {!disabled && (
            <svg
              className={`w-5 h-5 text-white transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>

      {/* Expandable content */}
      {isExpanded && (
        <div className="p-4 border-t dark:border-gray-700">
          {/* Chưa đăng ký khuôn mặt */}
          {notRegistered && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Chưa đăng ký khuôn mặt
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Bạn cần đăng ký khuôn mặt trước khi sử dụng tính năng này.
              </p>
              <a
                href="/student/face-registration"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Đăng ký ngay
              </a>
            </div>
          )}

          {/* Đã đăng ký - hiển thị camera */}
          {!notRegistered && (
            <>
              {/* Result message - classified */}
              {result && (
                <div className={`mb-4 p-4 rounded-lg ${result.success
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                  }`}>
                  {result.success ? (
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-medium">{result.message}</p>
                        {result.confidence && (
                          <p className="text-sm opacity-80">
                            Độ tin cậy: {(result.confidence * 100).toFixed(1)}%
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* Classified error display */}
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{errorConfig?.icon || '⚠️'}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-base">{errorConfig?.title || 'Điểm danh thất bại'}</p>
                          <p className="text-sm mt-1 opacity-80">{errorConfig?.hint || result.message}</p>
                          {result.confidence !== undefined && result.confidence > 0 && (
                            <p className="text-xs mt-1 opacity-60">
                              Độ tương đồng: {(result.confidence * 100).toFixed(1)}%
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Fallback button */}
                      {errorConfig?.canFallback && !fallbackSent && (
                        <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-700">
                          <button
                            onClick={handleFallback}
                            disabled={fallbackLoading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition font-medium text-sm disabled:opacity-50"
                          >
                            {fallbackLoading ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            )}
                            Gửi yêu cầu xác minh thủ công
                          </button>
                          <p className="text-xs text-center mt-1 opacity-60">Giảng viên hoặc lớp trưởng sẽ xem xét yêu cầu của bạn</p>
                        </div>
                      )}

                      {/* Fallback sent confirmation */}
                      {fallbackSent && (
                        <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-700">
                          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm font-medium">Đã gửi yêu cầu xác minh thành công!</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Camera - responsive sizing */}
              {!result?.success && (
                <>
                  <div className="w-full max-w-sm mx-auto">
                    <FaceCamera
                      ref={cameraRef}
                      showControls={false}
                      autoStart={true}
                      overlayType="oval"
                      width={400}
                      height={300}
                      className="w-full"
                      isProcessing={isAttending}
                      processingMessage="Đang nhận dạng..."
                    />
                  </div>

                  {/* Action buttons - responsive */}
                  <div className="flex flex-col-reverse sm:flex-row justify-center items-center gap-4 mt-6">
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
                    >
                      Đóng Camera
                    </button>

                    <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-5 py-2.5 rounded-lg border border-emerald-100 dark:border-emerald-800">
                      {isAttending ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-600 border-t-transparent" />
                          <span className="font-medium text-sm sm:text-base">Đang xử lý ảnh...</span>
                        </>
                      ) : (
                        <>
                          <div className="w-5 h-5 relative flex items-center justify-center">
                            <div className="absolute w-full h-full border-2 border-emerald-600 rounded-full animate-ping opacity-75"></div>
                            <div className="relative w-2.5 h-2.5 bg-emerald-600 rounded-full"></div>
                          </div>
                          <span className="font-medium text-sm sm:text-base">Đang tự động quét khuôn mặt...</span>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* Loading check face status */}
          {isLoading && !isRegistered && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-600 border-t-transparent mx-auto" />
              <p className="text-gray-500 mt-2">Đang kiểm tra...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FaceAttendanceCard;
