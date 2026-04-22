/**
 * FaceCamera - Component camera để điểm danh/đăng ký khuôn mặt
 * Sử dụng WebRTC để truy cập camera và capture ảnh
 */
import React, { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import { 
  FACE_CONFIG, 
  FaceErrorCode, 
  createFaceError, 
  parseError,
  type FaceError 
} from '../../lib/utils';

export interface FaceCameraRef {
  capture: () => string | null;
  startStream: () => Promise<void>;
  stopStream: () => void;
  isStreaming: boolean;
}

interface FaceCameraProps {
  onCapture?: (imageData: string) => void;
  onError?: (error: FaceError) => void;
  autoStart?: boolean;
  showControls?: boolean;
  width?: number;
  height?: number;
  className?: string;
  facingMode?: 'user' | 'environment';
  overlayType?: 'none' | 'oval' | 'rectangle';
  /** Show processing overlay when true */
  isProcessing?: boolean;
  /** Processing message */
  processingMessage?: string;
}

const FaceCamera = forwardRef<FaceCameraRef, FaceCameraProps>(({
  onCapture,
  onError,
  autoStart = true,
  showControls = true,
  width = FACE_CONFIG.camera.width,
  height = FACE_CONFIG.camera.height,
  className = '',
  facingMode = 'user',
  overlayType = 'oval',
  isProcessing = false,
  processingMessage = 'Đang xử lý...'
}, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<FaceError | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Helper to handle camera errors with proper error codes
  const handleCameraError = useCallback((err: unknown) => {
    const originalError = err as Error;
    let faceError: FaceError;
    
    if (originalError.name === 'NotAllowedError') {
      faceError = createFaceError(
        FaceErrorCode.CAMERA_PERMISSION_DENIED,
        'Vui lòng cấp quyền truy cập camera để sử dụng tính năng này'
      );
    } else if (originalError.name === 'NotFoundError') {
      faceError = createFaceError(
        FaceErrorCode.CAMERA_NOT_FOUND,
        'Không tìm thấy camera. Vui lòng kiểm tra kết nối camera.'
      );
    } else if (originalError.name === 'NotReadableError' || originalError.name === 'AbortError') {
      faceError = createFaceError(
        FaceErrorCode.CAMERA_IN_USE,
        'Camera đang được sử dụng bởi ứng dụng khác. Vui lòng đóng ứng dụng đó và thử lại.'
      );
    } else if (originalError.name === 'OverconstrainedError') {
      faceError = createFaceError(
        FaceErrorCode.CAMERA_NOT_FOUND,
        'Camera không hỗ trợ độ phân giải yêu cầu'
      );
    } else {
      faceError = parseError(err);
    }
    
    return faceError;
  }, []);

  // Bắt đầu stream camera
  const startStream = useCallback(async () => {
    if (streamRef.current) {
      return; // Đã có stream
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: width },
          height: { ideal: height },
          facingMode: facingMode
        },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      const faceError = handleCameraError(err);
      setError(faceError);
      onError?.(faceError);
    } finally {
      setIsLoading(false);
    }
  }, [width, height, facingMode, onError, handleCameraError]);

  // Dừng stream camera
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  // Chụp ảnh từ video
  const capture = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) {
      return null;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;
    
    // Đặt kích thước canvas theo video thực tế
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Vẽ frame gốc (KHÔNG mirror) lên canvas để gửi backend
    // Video element đã có CSS scaleX(-1) cho preview UX
    // Ảnh gửi backend phải ở hướng gốc để face recognition chính xác
    ctx.drawImage(video, 0, 0);
    
    // Chuyển sang base64
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    return imageData;
  }, [isStreaming, facingMode]);

  // Chụp với countdown
  const captureWithCountdown = useCallback(async () => {
    setCountdown(3);
    
    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setCountdown(null);
    const imageData = capture();
    if (imageData) {
      onCapture?.(imageData);
    }
  }, [capture, onCapture]);

  // Expose methods qua ref
  useImperativeHandle(ref, () => ({
    capture,
    startStream,
    stopStream,
    isStreaming
  }), [capture, startStream, stopStream, isStreaming]);

  // Auto-start stream nếu được bật
  useEffect(() => {
    if (autoStart) {
      startStream();
    }
    
    return () => {
      stopStream();
    };
  }, [autoStart, startStream, stopStream]);

  return (
    <div className={`face-camera-container relative ${className}`}>
      {/* Video element */}
      <div className="relative overflow-hidden rounded-lg bg-gray-900">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-auto"
          style={{
            transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
            maxWidth: `${width}px`,
            maxHeight: `${height}px`
          }}
        />
        
        {/* Overlay hướng dẫn đặt khuôn mặt */}
        {overlayType !== 'none' && isStreaming && (
          <div className="absolute inset-0 pointer-events-none">
            {overlayType === 'oval' && (
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <mask id="faceMask">
                    <rect x="0" y="0" width="100" height="100" fill="white" />
                    <ellipse cx="50" cy="45" rx="25" ry="35" fill="black" />
                  </mask>
                </defs>
                <rect 
                  x="0" y="0" width="100" height="100" 
                  fill="rgba(0,0,0,0.4)" 
                  mask="url(#faceMask)" 
                />
                <ellipse 
                  cx="50" cy="45" rx="25" ry="35" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="0.5"
                  strokeDasharray="2,2"
                />
              </svg>
            )}
            {overlayType === 'rectangle' && (
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <mask id="rectMask">
                    <rect x="0" y="0" width="100" height="100" fill="white" />
                    <rect x="25" y="15" width="50" height="70" fill="black" rx="5" />
                  </mask>
                </defs>
                <rect 
                  x="0" y="0" width="100" height="100" 
                  fill="rgba(0,0,0,0.4)" 
                  mask="url(#rectMask)" 
                />
                <rect 
                  x="25" y="15" width="50" height="70" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="0.5"
                  strokeDasharray="2,2"
                  rx="5"
                />
              </svg>
            )}
          </div>
        )}
        
        {/* Countdown overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="text-8xl font-bold text-white animate-pulse">
              {countdown}
            </span>
          </div>
        )}
        
        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
              <p className="text-white mt-4">Đang khởi động camera...</p>
            </div>
          </div>
        )}
        
        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center p-4">
              <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-white mt-4">{error.message}</p>
              {error.details && (
                <p className="text-gray-400 text-sm mt-2">{error.details}</p>
              )}
              {error.retryable && (
                <button
                  onClick={startStream}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                >
                  Thử lại
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Processing overlay */}
        {isProcessing && isStreaming && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
              <p className="text-white mt-4 font-medium">{processingMessage}</p>
            </div>
          </div>
        )}
        
        {/* Not streaming placeholder */}
        {!isStreaming && !isLoading && !error && (
          <div 
            className="flex items-center justify-center bg-gray-900"
            style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%' }}
          >
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-400 mt-4">Camera chưa được bật</p>
              <button
                onClick={startStream}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                Bật Camera
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Controls */}
      {showControls && isStreaming && (
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={captureWithCountdown}
            disabled={countdown !== null}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Chụp ảnh
          </button>
          
          <button
            onClick={stopStream}
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            Tắt Camera
          </button>
        </div>
      )}
      
      {/* Hướng dẫn */}
      {isStreaming && (
        <p className="text-center text-sm text-gray-500 mt-2">
          Đặt khuôn mặt trong vùng khung và giữ yên
        </p>
      )}
    </div>
  );
});

FaceCamera.displayName = 'FaceCamera';

export default FaceCamera;
