/**
 * Face Recognition Error Components
 * ==================================
 * Error display và recovery components
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { FaceError, FaceErrorCode, createFaceError, checkBrowserSupport } from '../../lib/utils';

// =============================================================================
// ERROR BOUNDARY
// =============================================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class FaceRecognitionErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[FaceRecognition] Error caught:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorDisplay
          title="Đã xảy ra lỗi"
          message={this.state.error?.message || 'Lỗi không xác định trong module nhận dạng khuôn mặt.'}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

// =============================================================================
// ERROR DISPLAY COMPONENTS
// =============================================================================

interface ErrorDisplayProps {
  title?: string;
  message: string;
  details?: string;
  retryable?: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Generic error display component
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = 'Đã xảy ra lỗi',
  message,
  details,
  retryable = true,
  onRetry,
  onDismiss,
  className = ''
}) => (
  <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 ${className}`}>
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-800/50 rounded-full flex items-center justify-center">
        <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
          {title}
        </h3>
        <p className="mt-1 text-red-700 dark:text-red-300">
          {message}
        </p>
        {details && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-mono bg-red-100 dark:bg-red-900/30 rounded p-2">
            {details}
          </p>
        )}
        
        <div className="mt-4 flex gap-3">
          {retryable && onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Thử lại
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition text-sm"
            >
              Đóng
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

/**
 * Error display for specific FaceError
 */
export const FaceErrorDisplay: React.FC<{
  error: FaceError;
  onRetry?: () => void;
  onDismiss?: () => void;
}> = ({ error, onRetry, onDismiss }) => {
  // Get icon based on error type
  const getIcon = () => {
    switch (error.code) {
      case FaceErrorCode.CAMERA_NOT_FOUND:
      case FaceErrorCode.CAMERA_PERMISSION_DENIED:
      case FaceErrorCode.CAMERA_IN_USE:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      
      case FaceErrorCode.NETWORK_ERROR:
      case FaceErrorCode.TIMEOUT:
      case FaceErrorCode.SERVICE_UNAVAILABLE:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
        );
      
      case FaceErrorCode.NO_FACE_DETECTED:
      case FaceErrorCode.MULTIPLE_FACES:
      case FaceErrorCode.FACE_MISMATCH:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-800/50 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-red-700 dark:text-red-300 font-medium">
            {error.message}
          </p>
          {error.details && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {error.details}
            </p>
          )}
          
          {(error.retryable && onRetry) && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Thử lại
            </button>
          )}
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-red-400 hover:text-red-600 dark:hover:text-red-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Camera permission denied error with instructions
 */
export const CameraPermissionError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <div className="text-center p-8">
    <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg className="w-10 h-10 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    </div>
    
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      Cần quyền truy cập Camera
    </h3>
    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
      Để sử dụng tính năng nhận dạng khuôn mặt, vui lòng cấp quyền truy cập camera cho trình duyệt.
    </p>
    
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-left max-w-md mx-auto mb-6">
      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Hướng dẫn:</h4>
      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
        <li>Nhấn vào biểu tượng khóa/camera trên thanh địa chỉ</li>
        <li>Chọn "Cho phép" cho quyền Camera</li>
        <li>Tải lại trang hoặc nhấn "Thử lại"</li>
      </ol>
    </div>
    
    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Thử lại
      </button>
    )}
  </div>
);

/**
 * Browser not supported error
 */
export const BrowserNotSupportedError: React.FC = () => {
  const { missing } = checkBrowserSupport();
  
  return (
    <div className="text-center p-8">
      <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Trình duyệt không hỗ trợ
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Trình duyệt của bạn thiếu các tính năng cần thiết cho nhận dạng khuôn mặt:
      </p>
      
      <ul className="text-sm text-red-600 dark:text-red-400 mb-6">
        {missing.map((item, i) => (
          <li key={i}>• {item}</li>
        ))}
      </ul>
      
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Vui lòng sử dụng Chrome, Firefox, Edge hoặc Safari phiên bản mới nhất.
      </p>
    </div>
  );
};

/**
 * Service unavailable error
 */
export const ServiceUnavailableError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <div className="text-center p-8">
    <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg className="w-10 h-10 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    </div>
    
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      Dịch vụ đang bảo trì
    </h3>
    <p className="text-gray-600 dark:text-gray-400 mb-6">
      Dịch vụ nhận dạng khuôn mặt đang được bảo trì. Vui lòng thử lại sau.
    </p>
    
    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Thử lại
      </button>
    )}
  </div>
);

export default {
  FaceRecognitionErrorBoundary,
  ErrorDisplay,
  FaceErrorDisplay,
  CameraPermissionError,
  BrowserNotSupportedError,
  ServiceUnavailableError
};
