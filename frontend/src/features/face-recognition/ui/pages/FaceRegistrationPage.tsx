/**
 * FaceRegistrationPage - Trang đăng ký khuôn mặt cho sinh viên
 * Route: /student/face-registration
 */
import React, { useState, useEffect } from 'react';
import {
  FaceRegistrationModal,
  FaceRegistrationPageSkeleton,
  FaceRecognitionErrorBoundary,
  ErrorDisplay
} from '../../ui/components';
import { useFaceRecognition } from '../../model/hooks/useFaceRecognition';
import { checkConsent, acceptConsent, type ConsentStatusResponse } from '../../services/faceApi';

type FaceRegistrationPageContentProps = {
  embedded?: boolean;
};

// Inner component wrapped by error boundary
const isDisplayableFaceImage = (value?: string | null) => {
  if (!value) return false;
  return value.startsWith('data:image/') || value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/');
};

export const FaceRegistrationPageContent: React.FC<FaceRegistrationPageContentProps> = ({ embedded = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);
  const {
    faceStatus,
    isRegistered,
    checkStatus,
    deleteRegistration,
    isLoading,
    isDeleting,
    error,
    clearError
  } = useFaceRecognition();

  // Consent state
  const [consentStatus, setConsentStatus] = useState<ConsentStatusResponse | null>(null);
  const [consentLoading, setConsentLoading] = useState(false);
  const [consentAccepting, setConsentAccepting] = useState(false);
  const previewImages = (faceStatus?.anhKhuonMatDs?.filter(isDisplayableFaceImage) || []);
  if (isDisplayableFaceImage(faceStatus?.anhKhuonMat) && !previewImages.includes(faceStatus.anhKhuonMat)) {
    previewImages.unshift(faceStatus.anhKhuonMat);
  }
  const hasPreviewImage = previewImages.length > 0;
  const selectedPreviewImage = previewImages[selectedPreviewIndex] || previewImages[0];

  // Kiểm tra trạng thái đăng ký và consent khi load trang
  useEffect(() => {
    checkStatus();
    setConsentLoading(true);
    checkConsent().then(result => {
      setConsentStatus(result);
      setConsentLoading(false);
    });
  }, [checkStatus]);

  // Xử lý đồng ý consent
  const handleAcceptConsent = async () => {
    setConsentAccepting(true);
    const result = await acceptConsent();
    if (result.success) {
      const newStatus = await checkConsent();
      setConsentStatus(newStatus);
    }
    setConsentAccepting(false);
  };

  // Xử lý xóa dữ liệu khuôn mặt
  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa dữ liệu khuôn mặt? Thao tác này sẽ xóa dữ liệu nhận diện và ảnh xem trước, bạn sẽ cần đăng ký lại để điểm danh bằng khuôn mặt.')) {
      const result = await deleteRegistration();
      if (result.success) {
        checkStatus();
      }
    }
  };

  // Xử lý khi đăng ký thành công
  const handleRegistrationSuccess = () => {
    checkStatus();
  };

  // Show skeleton during initial load
  if (isLoading && !faceStatus) {
    return <FaceRegistrationPageSkeleton />;
  }

  return (
    <div className={embedded ? 'py-0' : 'min-h-screen bg-gray-50 dark:bg-gray-900 py-8'}>
      <div className={embedded ? 'w-full' : 'max-w-3xl mx-auto px-4 sm:px-6 lg:px-8'}>
        {/* Header */}
        {!embedded && (
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Đăng ký khuôn mặt
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Quản lý thông tin nhận dạng khuôn mặt để điểm danh nhanh chóng
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6">
            <ErrorDisplay
              message={error}
              onRetry={() => { clearError?.(); checkStatus(); }}
              onDismiss={clearError}
            />
          </div>
        )}

        {/* Loading overlay */}
        {isLoading && faceStatus && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-600 border-t-transparent" />
              <p className="text-gray-700 dark:text-gray-300">Đang xử lý...</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="space-y-6">
          {/* Consent Card - hiển khi chưa consent và chưa đăng ký */}
          {consentStatus?.needsConsent && !isRegistered && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border-2 border-amber-200 dark:border-amber-700">
              <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-100 dark:bg-amber-800/50 rounded-full flex-shrink-0">
                    <svg className="w-7 h-7 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {consentStatus.policy.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Phiên bản {consentStatus.policy.version} — Bạn cần đọc và đồng ý trước khi đăng ký khuôn mặt.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {consentStatus.policy.sections.map((section, idx) => (
                  <div key={idx} className="border-l-4 border-amber-300 dark:border-amber-600 pl-4">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{section.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{section.content}</p>
                  </div>
                ))}

                <div className="pt-4 border-t dark:border-gray-700">
                  <button
                    onClick={handleAcceptConsent}
                    disabled={consentAccepting}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition disabled:opacity-50"
                  >
                    {consentAccepting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    Tôi đã đọc và đồng ý chính sách sinh trắc học
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Status Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {/* Status Header */}
            <div className={`p-6 ${isRegistered ? 'bg-emerald-500' : 'bg-gray-400'}`}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-full">
                  {isRegistered ? (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {isRegistered ? 'Đã đăng ký' : 'Chưa đăng ký'}
                  </h2>
                  <p className="text-white/80">
                    {isRegistered && faceStatus?.ngayDangKy
                      ? `Đăng ký lần đầu: ${new Date(faceStatus.ngayDangKy).toLocaleDateString('vi-VN')}`
                      : 'Bạn chưa đăng ký khuôn mặt để điểm danh'}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Body */}
            <div className="p-6">
              {isRegistered ? (
                <div className="space-y-4">
                  {/* Ảnh khuôn mặt đã đăng ký */}
                  <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 dark:border-emerald-800/50 dark:from-emerald-900/20 dark:to-gray-800">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-gray-100 shadow-md dark:border-gray-700 dark:bg-gray-900">
                        {hasPreviewImage ? (
                          <button
                            type="button"
                            onClick={() => { setSelectedPreviewIndex(0); setIsPreviewOpen(true); }}
                            className="group relative h-full w-full focus:outline-none focus:ring-4 focus:ring-emerald-300"
                            aria-label="Xem ảnh khuôn mặt chi tiết"
                          >
                            <img
                              src={previewImages[0] || ''}
                              alt="Ảnh khuôn mặt đã đăng ký"
                              className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                            />
                            <span className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
                              Xem chi tiết
                            </span>
                          </button>
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center px-3 text-center text-gray-400">
                            <svg className="mb-2 h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A7 7 0 0112 15a7 7 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-xs font-medium">Chưa có ảnh xem trước</span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                          Ảnh nhận diện hiện tại
                        </p>
                        <h3 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                          {hasPreviewImage ? 'Bạn có thể xem lại ảnh khuôn mặt đã đăng ký' : 'Đã có dữ liệu nhận diện, chưa có ảnh preview'}
                        </h3>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          {hasPreviewImage
                            ? 'Ảnh này là ảnh khuôn mặt đã được căn chỉnh, chỉ dùng để bạn kiểm tra dữ liệu nhận diện của chính mình.'
                            : 'Tài khoản đã có vector nhận diện. Hãy cập nhật khuôn mặt bằng một ảnh mới để tạo ảnh xem trước.'}
                        </p>
                        {faceStatus?.ngayCapNhat && (
                          <p className="mt-3 text-xs text-gray-500 dark:text-gray-500">
                            Cập nhật gần nhất: {new Date(faceStatus.ngayCapNhat).toLocaleString('vi-VN')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Thông tin đăng ký */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Số ảnh đã đăng ký</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {faceStatus?.soAnhDangKy || 1}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Trạng thái xác minh</p>
                      <div className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {faceStatus?.daXacMinh ? (
                          <>
                            <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Đã xác minh</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span>Chờ xác minh</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t dark:border-gray-700">
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Cập nhật khuôn mặt
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex items-center justify-center gap-2 px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {isDeleting ? 'Đang xóa...' : 'Xóa dữ liệu khuôn mặt'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Đăng ký khuôn mặt để điểm danh nhanh chóng và xem lại ảnh nhận diện ngay trong hồ sơ.
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 p-3 rounded-lg text-sm mb-6 text-left">
                    <p className="font-semibold mb-1">💡 Để điểm danh:</p>
                    <p>Sau khi đăng ký thành công, hãy vào trang <a href="/student/qr-scanner" className="font-bold underline">Điểm danh</a> chọn "Nhận diện khuôn mặt" để thực hiện điểm danh.</p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Đăng ký khuôn mặt
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Thông tin về nhận dạng khuôn mặt
            </h3>

            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Bảo mật cao</p>
                  <p className="text-sm">Dữ liệu nhận diện được lưu trong hệ thống và chỉ dùng cho xác thực điểm danh của bạn.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Nhanh chóng</p>
                  <p className="text-sm">Điểm danh chỉ mất vài giây, không cần quét mã QR.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Chính xác</p>
                  <p className="text-sm">Sử dụng công nghệ AI tiên tiến với độ chính xác cao.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Modal */}
        <FaceRegistrationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleRegistrationSuccess}
          isRegistered={isRegistered}
        />

        {hasPreviewImage && isPreviewOpen && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4"
            onClick={() => setIsPreviewOpen(false)}
          >
            <div
              className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b px-5 py-4 dark:border-gray-700">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ảnh khuôn mặt đã đăng ký</h3>
                  {faceStatus?.ngayCapNhat && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Cập nhật gần nhất: {new Date(faceStatus.ngayCapNhat).toLocaleString('vi-VN')}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                  aria-label="Đóng ảnh chi tiết"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="bg-gray-100 p-4 dark:bg-gray-950">
                <img
                  src={selectedPreviewImage || ''}
                  alt={`Ảnh khuôn mặt đã đăng ký ${selectedPreviewIndex + 1}`}
                  className="mx-auto max-h-[58vh] w-auto max-w-full rounded-xl object-contain shadow-lg"
                />
                {previewImages.length > 1 && (
                  <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                    {previewImages.map((image, index) => (
                      <button
                        key={`${image.slice(0, 48)}-${index}`}
                        type="button"
                        onClick={() => setSelectedPreviewIndex(index)}
                        className={`overflow-hidden rounded-xl border-2 bg-white p-1 transition ${selectedPreviewIndex === index ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-transparent hover:border-emerald-300'}`}
                        aria-label={`Xem ảnh khuôn mặt số ${index + 1}`}
                      >
                        <img
                          src={image}
                          alt={`Ảnh khuôn mặt số ${index + 1}`}
                          className="h-20 w-full rounded-lg object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
                <p className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                  Ảnh {selectedPreviewIndex + 1}/{previewImages.length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main component wrapped with Error Boundary
export const FaceRegistrationPage: React.FC = () => (
  <FaceRecognitionErrorBoundary>
    <FaceRegistrationPageContent />
  </FaceRecognitionErrorBoundary>
);

export default FaceRegistrationPage;
