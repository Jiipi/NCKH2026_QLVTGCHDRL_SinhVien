/**
 * FaceCamera - iPhone-style Face Detection Camera
 * Sử dụng WebRTC + HSV skin detection + countdown auto-capture
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
  autoCapture?: boolean;
  showControls?: boolean;
  onAutoCapture?: (imageData: string) => void;
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

// ─── Detection states ───
type DetectionPhase = 'WAITING' | 'POSITIONING' | 'ANALYZING' | 'COUNTDOWN' | 'CAPTURING';

const PHASE_CONFIG: Record<DetectionPhase, { label: string; color: string; ringColor: string }> = {
  WAITING:     { label: 'Đưa khuôn mặt vào khung', color: 'text-slate-200', ringColor: 'stroke-white/40' },
  POSITIONING: { label: 'Phát hiện khuôn mặt...', color: 'text-amber-300', ringColor: 'stroke-amber-400' },
  ANALYZING:   { label: 'Đang kiểm tra chất lượng...', color: 'text-sky-300', ringColor: 'stroke-sky-400' },
  COUNTDOWN:   { label: 'Giữ yên...', color: 'text-emerald-300', ringColor: 'stroke-emerald-400' },
  CAPTURING:   { label: 'Đang chụp ảnh...', color: 'text-emerald-300', ringColor: 'stroke-emerald-400' },
};

// ─── Quality thresholds (stricter) ───
const QUALITY = {
  brightnessMin: 50,
  brightnessMax: 220,
  edgeMin: 6,              // edge strength on a 120x90 sample, computed correctly per row
  skinRatioMin: 0.18,      // ≥18% of oval pixels must look like skin — avoids tile/wall false positives
  stabilityRequired: 4,    // must pass 4 consecutive checks (~1.2s at 300ms interval)
  countdownSeconds: 3,
  cooldownMs: 3000,        // 3s cooldown between auto-captures
};

// ─── HSV skin detection ───
function isSkinPixel(r: number, g: number, b: number): boolean {
  // RGB rule: empirical skin color range that works across skin tones
  const rgbSkin = r > 80 && g > 40 && b > 20
    && r > g && r > b
    && (r - g) > 15
    && Math.abs(r - g) < 130;

  // YCbCr rule: better for diverse skin tones
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  const ycbcrSkin = y > 60 && cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173;

  return rgbSkin || ycbcrSkin;
}

const FaceCamera = forwardRef<FaceCameraRef, FaceCameraProps>(({
  onCapture,
  onAutoCapture,
  onError,
  autoStart = true,
  autoCapture = false,
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
  const [phase, setPhase] = useState<DetectionPhase>('WAITING');
  const [countdown, setCountdown] = useState(QUALITY.countdownSeconds);
  const [qualityDetail, setQualityDetail] = useState('');

  const stabilityCountRef = useRef(0);
  const lastAutoCaptureRef = useRef(0);
  const countdownTimerRef = useRef<number | null>(null);
  const isCountingRef = useRef(false);

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
    if (streamRef.current) return;
    
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
        setPhase('WAITING');
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
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    isCountingRef.current = false;
    setIsStreaming(false);
    setPhase('WAITING');
    stabilityCountRef.current = 0;
  }, []);

  // ─── Core quality evaluation with skin detection ───
  const evaluateFrameQuality = useCallback(() => {
    const video = videoRef.current;
    if (!video || !isStreaming || video.videoWidth === 0 || video.videoHeight === 0) {
      stabilityCountRef.current = 0;
      if (!isCountingRef.current) setPhase('WAITING');
      return;
    }

    const canvas = document.createElement('canvas');
    const sampleW = 120;
    const sampleH = 90;
    canvas.width = sampleW;
    canvas.height = sampleH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, sampleW, sampleH);
    const pixels = ctx.getImageData(0, 0, sampleW, sampleH).data;

    // ─── Brightness analysis (whole frame) ───
    let totalBrightness = 0;
    const pixelCount = pixels.length / 4;
    for (let i = 0; i < pixels.length; i += 4) {
      totalBrightness += pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;
    }
    const avgBrightness = totalBrightness / pixelCount;
    const isBright = avgBrightness >= QUALITY.brightnessMin && avgBrightness <= QUALITY.brightnessMax;

    // ─── Skin detection in oval region (computes edges on the same pass) ───
    const cx = sampleW / 2;
    const cy = sampleH * 0.45; // oval center slightly above middle
    const rx = sampleW * 0.25;
    const ry = sampleH * 0.35;
    let skinCount = 0;
    let ovalCount = 0;
    let ovalEdgeSum = 0;
    let ovalEdgeSamples = 0;

    for (let y = 0; y < sampleH; y++) {
      for (let x = 0; x < sampleW; x++) {
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        if (dx * dx + dy * dy <= 1) {
          ovalCount++;
          const idx = (y * sampleW + x) * 4;
          const r = pixels[idx], g = pixels[idx + 1], b = pixels[idx + 2];
          if (isSkinPixel(r, g, b)) {
            skinCount++;
          }
          // Edge strength: only compare to left neighbour within the same row
          if (x > 0) {
            const prevIdx = (y * sampleW + (x - 1)) * 4;
            const prevBri = pixels[prevIdx] * 0.299 + pixels[prevIdx + 1] * 0.587 + pixels[prevIdx + 2] * 0.114;
            const curBri = r * 0.299 + g * 0.587 + b * 0.114;
            ovalEdgeSum += Math.abs(curBri - prevBri);
            ovalEdgeSamples++;
          }
        }
      }
    }

    const skinRatio = ovalCount > 0 ? skinCount / ovalCount : 0;
    const hasFace = skinRatio >= QUALITY.skinRatioMin;
    const avgEdge = ovalEdgeSamples > 0 ? ovalEdgeSum / ovalEdgeSamples : 0;
    const isSharp = avgEdge >= QUALITY.edgeMin;

    // ─── Determine phase ───
    if (!isBright) {
      stabilityCountRef.current = 0;
      setQualityDetail(avgBrightness < QUALITY.brightnessMin ? 'Quá tối — cần thêm ánh sáng' : 'Quá sáng — giảm ánh sáng');
      if (!isCountingRef.current) setPhase('WAITING');
      return;
    }

    if (!hasFace) {
      stabilityCountRef.current = 0;
      setQualityDetail('Đưa khuôn mặt vào trong khung');
      if (!isCountingRef.current) setPhase('WAITING');
      return;
    }

    if (!isSharp) {
      stabilityCountRef.current = 0;
      setQualityDetail('Ảnh mờ — giữ yên camera');
      if (!isCountingRef.current) setPhase('POSITIONING');
      return;
    }

    // Face detected, good quality
    if (!isCountingRef.current) {
      stabilityCountRef.current++;
      setQualityDetail(`Phân tích: ${Math.min(stabilityCountRef.current, QUALITY.stabilityRequired)}/${QUALITY.stabilityRequired}`);

      if (stabilityCountRef.current < QUALITY.stabilityRequired) {
        setPhase('ANALYZING');
      }
      // Stability reached → start countdown
      if (stabilityCountRef.current >= QUALITY.stabilityRequired) {
        setPhase('COUNTDOWN');
      }
    }
  }, [isStreaming]);

  // ─── Quality check loop ───
  useEffect(() => {
    if (!isStreaming || isProcessing) return;
    const id = window.setInterval(evaluateFrameQuality, 300);
    return () => window.clearInterval(id);
  }, [evaluateFrameQuality, isStreaming, isProcessing]);

  // ─── Countdown logic ───
  useEffect(() => {
    if (phase !== 'COUNTDOWN' || isProcessing || !autoCapture || isCountingRef.current) return;

    const now = Date.now();
    if (now - lastAutoCaptureRef.current < QUALITY.cooldownMs) {
      // Cooldown still active, reset
      stabilityCountRef.current = 0;
      setPhase('ANALYZING');
      return;
    }

    isCountingRef.current = true;
    let remaining = QUALITY.countdownSeconds;
    setCountdown(remaining);

    countdownTimerRef.current = window.setInterval(() => {
      remaining--;
      setCountdown(remaining);

      if (remaining <= 0) {
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
        isCountingRef.current = false;
        setPhase('CAPTURING');
      }
    }, 1000);

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    };
  }, [phase, isProcessing, autoCapture]);

  // ─── Auto-capture when CAPTURING phase ───
  useEffect(() => {
    if (phase !== 'CAPTURING' || !autoCapture || !onAutoCapture || isProcessing) return;

    const imageData = capture();
    if (imageData) {
      lastAutoCaptureRef.current = Date.now();
      stabilityCountRef.current = 0;
      onAutoCapture(imageData);
    }
    // Reset phase after capture
    setPhase('WAITING');
  }, [phase, autoCapture, onAutoCapture, isProcessing]);

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
    ctx.drawImage(video, 0, 0);
    
    // Chuyển sang base64
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    return imageData;
  }, [isStreaming]);

  const captureWhenReady = useCallback(() => {
    if (phase !== 'COUNTDOWN' && phase !== 'CAPTURING') return;

    const imageData = capture();
    if (imageData) {
      onCapture?.(imageData);
    }
  }, [capture, phase, onCapture]);

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

  // Reset when processing changes
  useEffect(() => {
    if (!isProcessing) {
      stabilityCountRef.current = 0;
      isCountingRef.current = false;
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      setPhase('WAITING');
    }
  }, [isProcessing]);

  const phaseConfig = PHASE_CONFIG[phase];

  return (
    <div className={`face-camera-container relative ${className}`}>
      {/* Video element */}
      <div className="relative overflow-hidden rounded-[1.6rem] bg-slate-950">
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
        
        {/* ─── iPhone-style oval overlay ─── */}
        {overlayType !== 'none' && isStreaming && (
          <div className="absolute inset-0 pointer-events-none">
            {overlayType === 'oval' && (
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <mask id="faceMaskNew">
                    <rect x="0" y="0" width="100" height="100" fill="white" />
                    <ellipse cx="50" cy="45" rx="25" ry="35" fill="black" />
                  </mask>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={phase === 'COUNTDOWN' || phase === 'CAPTURING' ? '#10b981' : phase === 'ANALYZING' ? '#38bdf8' : phase === 'POSITIONING' ? '#fbbf24' : '#94a3b8'} />
                    <stop offset="100%" stopColor={phase === 'COUNTDOWN' || phase === 'CAPTURING' ? '#34d399' : phase === 'ANALYZING' ? '#7dd3fc' : phase === 'POSITIONING' ? '#fcd34d' : '#cbd5e1'} />
                  </linearGradient>
                </defs>
                <rect 
                  x="0" y="0" width="100" height="100" 
                  fill="rgba(0,0,0,0.5)" 
                  mask="url(#faceMaskNew)" 
                />
                <ellipse 
                  cx="50" cy="45" rx="25" ry="35" 
                  fill="none" 
                  stroke="url(#ringGrad)"
                  strokeWidth={phase === 'COUNTDOWN' || phase === 'CAPTURING' ? '1.2' : '0.7'}
                  strokeDasharray={phase === 'WAITING' ? '3,3' : phase === 'POSITIONING' ? '2,2' : '0'}
                  className={phase === 'ANALYZING' ? 'animate-pulse' : ''}
                />
              </svg>
            )}
            {overlayType === 'rectangle' && (
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <mask id="rectMaskNew">
                    <rect x="0" y="0" width="100" height="100" fill="white" />
                    <rect x="25" y="15" width="50" height="70" fill="black" rx="5" />
                  </mask>
                </defs>
                <rect 
                  x="0" y="0" width="100" height="100" 
                  fill="rgba(0,0,0,0.5)" 
                  mask="url(#rectMaskNew)" 
                />
                <rect 
                  x="25" y="15" width="50" height="70" 
                  fill="none" 
                  stroke={phase === 'COUNTDOWN' || phase === 'CAPTURING' ? '#10b981' : '#94a3b8'}
                  strokeWidth="0.8"
                  strokeDasharray={phase === 'WAITING' ? '3,3' : '0'}
                  rx="5"
                />
              </svg>
            )}
          </div>
        )}

        {/* ─── iPhone-style status display ─── */}
        {isStreaming && !isProcessing && (
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-5">
            {/* Countdown number */}
            {phase === 'COUNTDOWN' && (
              <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm">
                <span className="text-3xl font-black text-emerald-400">{countdown}</span>
              </div>
            )}

            {/* Status pill */}
            <div className={`rounded-2xl bg-black/60 px-5 py-2.5 backdrop-blur-sm`}>
              <p className={`text-center text-sm font-bold tracking-tight ${phaseConfig.color}`}>
                {phase === 'COUNTDOWN' ? `${phaseConfig.label} ${countdown}` : phaseConfig.label}
              </p>
              {phase !== 'COUNTDOWN' && phase !== 'CAPTURING' && qualityDetail && (
                <p className="mt-0.5 text-center text-[11px] font-medium text-white/60">{qualityDetail}</p>
              )}
            </div>
          </div>
        )}
        
        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin" />
              <p className="mt-4 text-sm font-bold tracking-tight text-white">Đang khởi động camera...</p>
            </div>
          </div>
        )}
        
        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
            <div className="text-center p-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/20">
                <svg className="h-8 w-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-sm font-bold tracking-tight text-white">{error.message}</p>
              {error.details && (
                <p className="mt-1 text-xs font-medium text-slate-400">{error.details}</p>
              )}
              {error.retryable && (
                <button
                  onClick={startStream}
                  className="mt-4 rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
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
              <div className="mx-auto h-14 w-14 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin" />
              <p className="mt-4 text-sm font-bold tracking-tight text-white">{processingMessage}</p>
            </div>
          </div>
        )}
        
        {/* Not streaming placeholder */}
        {!isStreaming && !isLoading && !error && (
          <div 
            className="flex items-center justify-center bg-slate-950 rounded-[1.6rem]"
            style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%' }}
          >
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
                <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm font-bold tracking-tight text-slate-300">Camera chưa được bật</p>
              <button
                onClick={startStream}
                className="mt-4 rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
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
        <div className="flex justify-center gap-3 mt-4">
          <button
            onClick={captureWhenReady}
            disabled={phase !== 'COUNTDOWN' && phase !== 'CAPTURING' && phase !== 'ANALYZING'}
            className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Chụp ảnh
          </button>
          
          <button
            onClick={stopStream}
            className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/20"
          >
            Tắt Camera
          </button>
        </div>
      )}
      
      {/* Hướng dẫn */}
      {isStreaming && (
        <p className="mt-2 text-center text-xs font-medium text-slate-400">
          Đặt khuôn mặt trong vùng khung và giữ yên
        </p>
      )}
    </div>
  );
});

FaceCamera.displayName = 'FaceCamera';

export default FaceCamera;
