/**
 * FaceRegistrationModal - Modal đăng ký khuôn mặt cho sinh viên
 * Hỗ trợ chụp nhiều ảnh để tăng độ chính xác
 */
import React, { useState, useRef, useCallback } from 'react';
import FaceCamera, { FaceCameraRef } from './FaceCamera';
import { useFaceRecognition } from '../../model/hooks/useFaceRecognition';

interface FaceRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  minImages?: number;
  maxImages?: number;
}

export const FaceRegistrationModal: React.FC<FaceRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  minImages = 3,
  maxImages = 5
}) => {
  const cameraRef = useRef<FaceCameraRef>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [step, setStep] = useState<'intro' | 'capture' | 'confirm' | 'success'>('intro');
  
  const {
    register,
    isRegistered,
    isRegistering,
    error,
    clearError
  } = useFaceRecognition({ autoCheckStatus: false, autoCheckHealth: false });

  // Xử lý khi capture được ảnh
  const handleCapture = useCallback((imageData: string) => {
    setCapturedImages(prev => {
      if (prev.length >= maxImages) return prev;
      return [...prev, imageData];
    });
  }, [maxImages]);

  // Xóa một ảnh đã chụp
  const removeImage = useCallback((index: number) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Reset modal
  const handleReset = useCallback(() => {
    setCapturedImages([]);
    setStep('intro');
    clearError();
  }, [clearError]);

  // Đóng modal
  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  // Bắt đầu chụp
  const handleStartCapture = useCallback(() => {
    setStep('capture');
  }, []);

  // Chuyển sang confirm
  const handleProceedToConfirm = useCallback(() => {
    if (capturedImages.length >= minImages) {
      cameraRef.current?.stopStream();
      setStep('confirm');
    }
  }, [capturedImages.length, minImages]);

  // Đăng ký khuôn mặt
  const handleRegister = useCallback(async () => {
    if (capturedImages.length < minImages) return;
    
    try {
      // Chuyển base64 thành Blob
      // Sử dụng ảnh đầu tiên để đăng ký (backend sẽ xử lý embedding)
      const firstImage = capturedImages[0];
      const response = await fetch(firstImage);
      const blob = await response.blob();
      
      // Gọi register với update = false (đăng ký mới) hoặc true (cập nhật)
      const result = await register(blob, isRegistered);
      
      if (result.success) {
        setStep('success');
        onSuccess?.();
      }
    } catch (err) {
      console.error('Đăng ký khuôn mặt thất bại:', err);
    }
  }, [capturedImages, minImages, register, isRegistered, onSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal content - responsive width */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-2xl mx-auto max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Đăng ký khuôn mặt
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Body - responsive padding and scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-100px)] sm:max-h-[calc(90vh-130px)]">
          {/* Error message */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium">Đăng ký thất bại</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}
          
          {/* Step: Intro */}
          {step === 'intro' && (
            <div className="text-center py-4 sm:py-8">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg className="w-8 h-8 sm:w-12 sm:h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Đăng ký nhận dạng khuôn mặt
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 max-w-md mx-auto px-2">
                Đăng ký khuôn mặt để điểm danh nhanh chóng và chính xác. 
                Bạn cần chụp {minImages}-{maxImages} ảnh từ các góc độ khác nhau.
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 text-left max-w-md mx-auto">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 text-sm sm:text-base">Lưu ý:</h4>
                <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Đảm bảo đủ ánh sáng, tránh ngược sáng
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Không đeo kính râm, khẩu trang
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Đặt khuôn mặt chính giữa khung hình
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Chụp từ nhiều góc độ (nhìn thẳng, nghiêng trái, nghiêng phải)
                  </li>
                </ul>
              </div>
              
              <button
                onClick={handleStartCapture}
                className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Bắt đầu chụp ảnh
              </button>
            </div>
          )}
          
          {/* Step: Capture */}
          {step === 'capture' && (
            <div>
              {/* Camera with responsive aspect ratio */}
              <div className="w-full max-w-md mx-auto">
                <FaceCamera
                  ref={cameraRef}
                  onCapture={handleCapture}
                  showControls={true}
                  autoStart={true}
                  overlayType="oval"
                  width={480}
                  height={360}
                  className="w-full"
                />
              </div>
              
              {/* Progress indicator */}
              <div className="mt-3 sm:mt-4 mb-2">
                <div className="flex justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>Ảnh đã chụp</span>
                  <span>{capturedImages.length}/{maxImages}</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${(capturedImages.length / maxImages) * 100}%` }}
                  />
                </div>
              </div>
              
              {/* Captured images preview - scrollable on mobile */}
              {capturedImages.length > 0 && (
                <div className="mt-3 sm:mt-4">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">Ảnh đã chụp:</p>
                  <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                    {capturedImages.map((img, index) => (
                      <div key={index} className="relative group flex-shrink-0">
                        <img 
                          src={img} 
                          alt={`Captured ${index + 1}`}
                          className="w-14 h-14 sm:w-20 sm:h-20 object-cover rounded-lg border-2 border-emerald-500"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <span className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                          {index + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Actions - responsive layout */}
              <div className="flex flex-col sm:flex-row justify-between gap-3 mt-4 sm:mt-6">
                <button
                  onClick={handleReset}
                  className="order-2 sm:order-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition text-sm sm:text-base"
                >
                  Chụp lại
                </button>
                <button
                  onClick={handleProceedToConfirm}
                  disabled={capturedImages.length < minImages}
                  className="order-1 sm:order-2 px-4 sm:px-6 py-2.5 sm:py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
                >
                  Tiếp tục ({capturedImages.length}/{minImages} ảnh tối thiểu)
                </button>
              </div>
            </div>
          )}
          
          {/* Step: Confirm */}
          {step === 'confirm' && (
            <div className="text-center">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Xác nhận đăng ký
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                Kiểm tra lại các ảnh đã chụp trước khi đăng ký
              </p>
              
              {/* Image grid - responsive */}
              <div className="flex justify-center gap-2 sm:gap-3 flex-wrap mb-4 sm:mb-6">
                {capturedImages.map((img, index) => (
                  <img 
                    key={index}
                    src={img} 
                    alt={`Captured ${index + 1}`}
                    className="w-20 h-20 sm:w-28 sm:h-28 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                  />
                ))}
              </div>
              
              {/* Buttons - stack on mobile */}
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <button
                  onClick={() => setStep('capture')}
                  disabled={isRegistering}
                  className="order-2 sm:order-1 px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50 text-sm sm:text-base"
                >
                  Quay lại chụp
                </button>
                <button
                  onClick={handleRegister}
                  disabled={isRegistering}
                  className="order-1 sm:order-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
                >
                  {isRegistering ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Xác nhận đăng ký
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
          
          {/* Step: Success */}
          {step === 'success' && (
            <div className="text-center py-6 sm:py-8">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg className="w-8 h-8 sm:w-12 sm:h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Đăng ký thành công!
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 px-2">
                Khuôn mặt của bạn đã được đăng ký thành công. 
                Bây giờ bạn có thể sử dụng tính năng điểm danh bằng khuôn mặt.
              </p>
              <button
                onClick={handleClose}
                className="w-full sm:w-auto px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
              >
                Hoàn tất
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaceRegistrationModal;
