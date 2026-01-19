/**
 * FaceAttendanceCard - Thẻ điểm danh bằng khuôn mặt
 * Hiển thị trong trang điểm danh hoạt động
 */
import React, { useState, useRef, useCallback } from 'react';
import FaceCamera, { FaceCameraRef } from './FaceCamera';
import { useFaceRecognition } from '../../model/hooks/useFaceRecognition';

interface FaceAttendanceCardProps {
  hoatDongId: string;
  onSuccess?: (result: { diemDanhId: string; doTinCay: number }) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

export const FaceAttendanceCard: React.FC<FaceAttendanceCardProps> = ({
  hoatDongId,
  onSuccess,
  onError,
  disabled = false,
  className = ''
}) => {
  const cameraRef = useRef<FaceCameraRef>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; confidence?: number } | null>(null);
  
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
  }, [isExpanded, checkStatus]);

  // Xử lý khi chụp ảnh
  const handleCapture = useCallback(async (imageData: string) => {
    try {
      // Chuyển base64 thành Blob
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      const attendResult = await attend(hoatDongId, blob);
      
      if (attendResult.success) {
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
        setResult({
          success: false,
          message: attendResult.message || 'Điểm danh thất bại. Vui lòng thử lại.'
        });
        onError?.(attendResult.message || 'Điểm danh thất bại');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra';
      setResult({
        success: false,
        message
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

  // Nếu chưa đăng ký khuôn mặt
  const notRegistered = !isRegistered;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div 
        className={`p-4 cursor-pointer transition ${
          disabled ? 'bg-gray-100 dark:bg-gray-700' : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
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
              {/* Result message */}
              {result && (
                <div className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
                  result.success 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {result.success ? (
                    <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  <div>
                    <p className="font-medium">{result.message}</p>
                    {result.confidence && (
                      <p className="text-sm opacity-80">
                        Độ tin cậy: {(result.confidence * 100).toFixed(1)}%
                      </p>
                    )}
                  </div>
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
                  <div className="flex flex-col-reverse sm:flex-row justify-center gap-2 sm:gap-3 mt-4">
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="px-4 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm sm:text-base"
                    >
                      Đóng
                    </button>
                    <button
                      onClick={handleTakePhoto}
                      disabled={isAttending}
                      className="flex items-center justify-center gap-2 px-6 py-2.5 sm:py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 text-sm sm:text-base font-medium"
                    >
                      {isAttending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Điểm danh
                        </>
                      )}
                    </button>
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
