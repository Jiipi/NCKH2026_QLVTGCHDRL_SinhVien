import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import http from '../../../../shared/api/http';
import { useNotification } from '../../../../shared/contexts/NotificationContext';

export function useLegacyQRScanner() {
  const { showSuccess, showError } = useNotification();

  const [isScanning, setIsScanning] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [permissionHint, setPermissionHint] = useState('');
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const fileInputRef = useRef(null);
  const lastScanTimeRef = useRef(0);
  const requestAnimationFrameIdRef = useRef(null);
  const frameCountRef = useRef(0);
  const lastFrameProcessTimeRef = useRef(0);
  const barcodeDetectorRef = useRef(null);
  const zxingReaderRef = useRef(null);
  const zxingCleanupRef = useRef(null);
  const zxingControlsRef = useRef(null);
  const scanningActiveRef = useRef(false);
  const isStartingRef = useRef(false);
  const processedRef = useRef(false);
  const detectionInProgressRef = useRef(false);
  const activeTracksRef = useRef(new Set());

  const registerStreamTracks = (stream) => {
    if (!stream) return;
    stream.getTracks().forEach((track) => {
      if (!track) return;
      activeTracksRef.current.add(track);
      const cleanup = () => {
        activeTracksRef.current.delete(track);
        track.removeEventListener?.('ended', cleanup);
      };
      track.addEventListener?.('ended', cleanup, { once: true });
    });
  };

  const stopCamera = ({ preserveStarting = false } = {}) => {
    scanningActiveRef.current = false;
    detectionInProgressRef.current = false;
    lastFrameProcessTimeRef.current = 0;
    const controlsToStop = zxingControlsRef.current;
    zxingControlsRef.current = null;
    if (requestAnimationFrameIdRef.current) {
      cancelAnimationFrame(requestAnimationFrameIdRef.current);
      requestAnimationFrameIdRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (videoRef.current) {
      try { videoRef.current.pause?.(); } catch(_) {}
      try { videoRef.current.srcObject = null; } catch(_) {}
    }
    if (controlsToStop) {
      try { controlsToStop.stop?.(); } catch(e) {}
    }
    if (zxingCleanupRef.current) { 
      try { zxingCleanupRef.current(); } catch(e) {}
      zxingCleanupRef.current = null; 
    }
    zxingReaderRef.current = null;
    setTimeout(() => {
      const tracksToStop = [];
      activeTracksRef.current.forEach((track) => { if (track) tracksToStop.push(track); });
      if (streamRef.current) {
        try { streamRef.current.getTracks().forEach(track => { if (track && !tracksToStop.includes(track)) tracksToStop.push(track); }); } catch (_) {}
      }
      if (videoRef.current && videoRef.current.srcObject instanceof MediaStream) {
        try { videoRef.current.srcObject.getTracks().forEach(track => { if (track && !tracksToStop.includes(track)) tracksToStop.push(track); }); } catch (_) {}
      }
      tracksToStop.forEach((track) => {
        if (!track) return;
        try { const capabilities = track.getCapabilities?.() || {}; if (capabilities.torch) { track.applyConstraints({ advanced: [{ torch: false }] }).catch(() => {}); } } catch (_) {}
        try { track.enabled = false; } catch (_) {}
        try { track.stop(); } catch (_) {}
      });
      activeTracksRef.current.clear();
      streamRef.current = null;
      if (videoRef.current) {
        try { videoRef.current.pause?.(); } catch(_) {}
        try { videoRef.current.onloadedmetadata = null; } catch(_) {}
        try { videoRef.current.onerror = null; } catch(_) {}
        try { videoRef.current.srcObject = null; } catch(_) {}
        try { videoRef.current.removeAttribute('src'); } catch (_) {}
        try { videoRef.current.load?.(); } catch (_) {}
      }
      barcodeDetectorRef.current = null;
      setIsScanning(false);
      setTorchOn(false);
      setHasTorch(false);
      if (!preserveStarting) setIsStarting(false);
    }, 100);
  };

  const startCamera = async () => {
    if (isStartingRef.current || scanningActiveRef.current) return;
    isStartingRef.current = true;
    setIsStarting(true);
    let stream = null;
    try {
      setError('');
      setPermissionHint('');
      setScanResult(null);
      lastScanTimeRef.current = 0;
      processedRef.current = false;
      lastFrameProcessTimeRef.current = 0;
      detectionInProgressRef.current = false;
      stopCamera({ preserveStarting: true });
      setIsStarting(true);
      stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
          aspectRatio: { ideal: 16/9 },
          focusMode: 'continuous',
          zoom: { ideal: 1.0 }
        } 
      });
      streamRef.current = stream;
      registerStreamTracks(stream);
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = videoTrack.getCapabilities ? videoTrack.getCapabilities() : {};
        const constraints = {};
        if (capabilities.torch) setHasTorch(true); else setHasTorch(false);
        if (capabilities.focusMode && capabilities.focusMode.includes('continuous')) constraints.focusMode = 'continuous';
        if (capabilities.exposureMode && capabilities.exposureMode.includes('continuous')) constraints.exposureMode = 'continuous';
        if (Object.keys(constraints).length > 0) {
          try { await videoTrack.applyConstraints({ advanced: [constraints] }); } catch (_) {}
        }
      }
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        try {
          if ('BarcodeDetector' in window) {
            const formats = ['qr_code'];
            barcodeDetectorRef.current = new window.BarcodeDetector({ formats });
          } else {
            barcodeDetectorRef.current = null;
          }
        } catch (_) {
          barcodeDetectorRef.current = null;
        }
        videoRef.current.onloadedmetadata = () => {
          const v = videoRef.current; 
          if (!v || !v.srcObject) return;
          // Kiểm tra element vẫn còn trong DOM trước khi play
          if (!document.contains(v)) {
            stopCamera();
            return;
          }
          (v.play?.() || Promise.resolve())
            .then(() => {
              // Kiểm tra lại element vẫn còn trong DOM sau khi play
              if (!document.contains(v) || !v.srcObject) {
                stopCamera();
                return;
              }
              setIsScanning(true);
              scanningActiveRef.current = true;
              setTimeout(() => { setIsStarting(false); }, 500);
              setTimeout(() => { setupZXing().finally(() => { if (!zxingReaderRef.current && scanningActiveRef.current) startScanningLoop(); }); }, 300);
            })
            .catch((err) => { 
              // Bỏ qua AbortError vì đây là warning, không phải lỗi nghiêm trọng
              if (err?.name !== 'AbortError') {
                setError('Không thể phát video từ camera'); 
                stopCamera();
              }
            });
        };
        videoRef.current.onerror = () => { setError('Lỗi video từ camera'); stopCamera(); };
      } else {
        setIsStarting(false);
      }
    } catch (err) {
      if (stream) {
        try { stream.getTracks().forEach(track => { try { const caps = track.getCapabilities?.() || {}; if (caps.torch) { track.applyConstraints({ advanced: [{ torch: false }] }).catch(() => {}); } } catch (_) {} try { track.enabled = false; } catch (_) {} try { track.stop(); } catch (_) {} }); } catch (_) {}
      }
      if (err?.name === 'NotAllowedError') { setError('Truy cập camera bị từ chối. Hãy cho phép quyền camera cho trang này.'); setPermissionHint('Nhấn biểu tượng camera/ổ khóa bên cạnh thanh địa chỉ để cấp quyền, sau đó bấm Bật Camera lại.'); }
      else if (err?.name === 'NotFoundError') { setError('Không tìm thấy thiết bị camera. Vui lòng kiểm tra kết nối thiết bị.'); }
      else if (err?.name === 'NotReadableError') { setError('Camera đang được ứng dụng khác sử dụng. Hãy đóng ứng dụng đó và thử lại.'); }
      else { setError('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.'); }
      stopCamera();
      setIsStarting(false);
    } finally {
      isStartingRef.current = false;
    }
  };

  async function setupZXing() {
    if (!scanningActiveRef.current) return;
    try {
      const { BrowserQRCodeReader } = await import('@zxing/browser');
      const reader = new BrowserQRCodeReader(undefined, { delayBetweenScanAttempts: 50 });
      zxingReaderRef.current = reader;
      const deviceId = (streamRef.current?.getVideoTracks?.()[0]?.getSettings?.().deviceId) || undefined;
      const controls = await reader.decodeFromVideoDevice(deviceId, videoRef.current, (res) => {
        if (!scanningActiveRef.current || !zxingControlsRef.current) return;
        if (videoRef.current?.srcObject instanceof MediaStream && scanningActiveRef.current && zxingControlsRef.current) {
          const zxStream = videoRef.current.srcObject;
          if (zxStream !== streamRef.current) { streamRef.current = zxStream; registerStreamTracks(zxStream); }
        }
        if (res && res.getText) {
          const text = res.getText();
          if (text && scanningActiveRef.current && zxingControlsRef.current) {
            if (requestAnimationFrameIdRef.current) { cancelAnimationFrame(requestAnimationFrameIdRef.current); requestAnimationFrameIdRef.current = null; }
            stopCamera();
            processQRCode(text);
          }
        }
      });
      zxingControlsRef.current = controls;
      zxingCleanupRef.current = () => { zxingControlsRef.current = null; try { controls?.stop?.(); } catch(_) {} try { reader?.dispose?.(); } catch(_) {} };
    } catch (_) {
      zxingReaderRef.current = null;
    }
  }

  const requestPermission = async () => {
    try { setPermissionHint(''); await navigator.mediaDevices.getUserMedia({ video: true }); streamRef.current && streamRef.current.getTracks().forEach(t => t.stop()); await startCamera(); }
    catch (_) { setError('Quyền camera chưa được cấp. Hãy cho phép trong phần cài đặt trình duyệt.'); }
  };

  const startScanningLoop = () => {
    frameCountRef.current = 0;
    const scan = () => {
      if (!isScanning || isProcessing || !scanningActiveRef.current) return;
      frameCountRef.current++;
      scanQRCode();
      requestAnimationFrameIdRef.current = requestAnimationFrame(scan);
    };
    requestAnimationFrameIdRef.current = requestAnimationFrame(scan);
  };

  const toggleTorch = async () => {
    try { const track = streamRef.current?.getVideoTracks?.()[0]; const caps = track?.getCapabilities?.() || {}; if (!caps.torch) return; const newState = !torchOn; await track.applyConstraints({ advanced: [{ torch: newState }] }); setTorchOn(newState); } catch (_) {}
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;
    const video = videoRef.current; const canvas = canvasRef.current;
    const frameTimestamp = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (frameTimestamp - lastFrameProcessTimeRef.current < 120) return;
    lastFrameProcessTimeRef.current = frameTimestamp;
    if (!video.videoWidth || !video.videoHeight || video.readyState !== video.HAVE_ENOUGH_DATA) return;
    if (video.videoWidth <= 0 || video.videoHeight <= 0) return;
    try {
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) return;
      const maxDim = 1024; let width = video.videoWidth; let height = video.videoHeight;
      if (width > maxDim || height > maxDim) { const scale = maxDim / Math.max(width, height); width = Math.floor(width * scale); height = Math.floor(height * scale); }
      canvas.width = width; canvas.height = height;
      if (barcodeDetectorRef.current && !detectionInProgressRef.current) {
        detectionInProgressRef.current = true;
        barcodeDetectorRef.current.detect(video)
          .then((codes) => {
            if (codes && codes.length > 0) {
              const text = codes[0].rawValue || codes[0].raw || '';
              if (text) {
                const detectedAt = Date.now(); if (detectedAt - lastScanTimeRef.current < 300) return; lastScanTimeRef.current = detectedAt; setIsScanning(false);
                if (requestAnimationFrameIdRef.current) { cancelAnimationFrame(requestAnimationFrameIdRef.current); requestAnimationFrameIdRef.current = null; }
                stopCamera(); processQRCode(text);
              }
            }
          })
          .catch(() => {})
          .finally(() => { detectionInProgressRef.current = false; });
      }
      context.filter = 'none'; context.drawImage(video, 0, 0, width, height); let imageData = context.getImageData(0, 0, canvas.width, canvas.height); let code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
      if (!code) { context.filter = 'contrast(2.0) brightness(1.3) saturate(0) grayscale(100%)'; context.drawImage(video, 0, 0, width, height); context.filter = 'none'; imageData = context.getImageData(0, 0, canvas.width, canvas.height); code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' }); }
      if (!code && (width > 640 || height > 640)) { const tmpW = Math.floor(width * 0.75); const tmpH = Math.floor(height * 0.75); canvas.width = tmpW; canvas.height = tmpH; context.drawImage(video, 0, 0, tmpW, tmpH); imageData = context.getImageData(0, 0, tmpW, tmpH); code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' }); canvas.width = width; canvas.height = height; }
      if (!code) { const roiSize = Math.floor(Math.min(width, height) * 0.7); const sx = Math.floor((width - roiSize) / 2); const sy = Math.floor((height - roiSize) / 2); context.drawImage(video, sx, sy, roiSize, roiSize, 0, 0, width, height); imageData = context.getImageData(0, 0, width, height); code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' }); }
      if (code && code.data) {
        const now = Date.now(); if (now - lastScanTimeRef.current < 300) return; lastScanTimeRef.current = now;
        setIsScanning(false);
        if (requestAnimationFrameIdRef.current) { cancelAnimationFrame(requestAnimationFrameIdRef.current); requestAnimationFrameIdRef.current = null; }
        stopCamera();
        processQRCode(code.data);
      }
    } catch (_) {}
  };

  const processQRCode = async (qrData) => {
    if (isProcessing || processedRef.current) return;
    processedRef.current = true;
    setIsProcessing(true);
    setIsScanning(false);
    scanningActiveRef.current = false;
    setError('');
    detectionInProgressRef.current = false;
    try {
      let payload = null;
      try { payload = JSON.parse(qrData); }
      catch (_) {
        const jsonStart = typeof qrData === 'string' ? qrData.indexOf('{') : -1;
        const jsonEnd = typeof qrData === 'string' ? qrData.lastIndexOf('}') : -1;
        if (jsonStart >= 0 && jsonEnd > jsonStart) { try { payload = JSON.parse(qrData.slice(jsonStart, jsonEnd + 1)); } catch (_) {} }
      }
      if (!payload || !payload.activityId || !payload.token) throw { status: 400, message: 'Mã QR không hợp lệ' };
      
      console.log('[QR Scanner] Payload from QR:', {
        activityId: payload.activityId,
        token: payload.token ? payload.token.substring(0, 10) + '...' : 'null',
        tokenLength: payload.token?.length
      });
      
      const qrRes = await http.get(`/activities/${payload.activityId}/qr-data`);
      const serverQR = qrRes?.data?.data || qrRes?.data || {};
      const serverToken = serverQR.qr_token || serverQR.token;
      
      console.log('[QR Scanner] Server QR data:', {
        activityId: serverQR.activity_id,
        token: serverToken ? serverToken.substring(0, 10) + '...' : 'null',
        tokenLength: serverToken?.length
      });
      
      // Normalize tokens for comparison
      let normalizedPayloadToken = String(payload.token || '').trim();
      const normalizedServerToken = String(serverToken || '').trim();
      
      // Backward compatibility: Nếu token trong QR code là 64 chars (token cũ) và server token là 32 chars (token mới)
      // Chỉ so sánh 32 chars đầu của token trong QR code với token trong server
      if (normalizedPayloadToken.length === 64 && normalizedServerToken.length === 32) {
        console.log('[QR Scanner] Detected old 64-char token in QR, comparing first 32 chars');
        normalizedPayloadToken = normalizedPayloadToken.substring(0, 32);
      }
      
      console.log('[QR Scanner] Token comparison:', {
        payloadToken: normalizedPayloadToken.substring(0, 10) + '...',
        serverToken: normalizedServerToken.substring(0, 10) + '...',
        match: normalizedPayloadToken === normalizedServerToken,
        payloadLength: normalizedPayloadToken.length,
        serverLength: normalizedServerToken.length
      });
      
      if (!serverToken) {
        console.error('[QR Scanner] Server token is missing');
        throw { status: 400, message: 'Hoạt động chưa có mã QR. Vui lòng liên hệ quản trị viên.' };
      }
      
      if (normalizedServerToken !== normalizedPayloadToken) {
        console.error('[QR Scanner] Token mismatch!');
        throw { status: 400, message: 'Mã QR không khớp hoặc đã hết hạn. Vui lòng tạo QR code mới.' };
      }
      
      console.log('[QR Scanner] Tokens match, calling scan attendance...');
      const checkinRes = await http.post(`/activities/${payload.activityId}/attendance/scan`, { token: payload.token });
      const checkinData = checkinRes?.data?.data || checkinRes?.data || {};
      setScanResult({ success: true, message: 'Điểm danh thành công!', data: { activityId: checkinData.activityId || payload.activityId, activityName: checkinData.activityName || serverQR.activity_name || '', sessionName: checkinData.sessionName || 'Mặc định', timestamp: checkinData.timestamp || new Date().toISOString() } });
      try { showSuccess('Điểm danh thành công'); } catch (_) {}
      try { window.dispatchEvent(new CustomEvent('attendance:updated', { detail: { activityId: payload.activityId }})); } catch (_) {}
      try { window.localStorage.setItem('ATTENDANCE_UPDATED_AT', String(Date.now())); } catch (_) {}
    } catch (err) {
      const statusCode = err?.status || err?.response?.status;
      const backendMessage = err?.message || err?.response?.data?.message;
      const errorCode = err?.response?.data?.errors?.code;
      if (statusCode === 409 && errorCode === 'ALREADY_CHECKED_IN') {
        const userMessage = 'Bạn đã điểm danh hoạt động này rồi';
        setScanResult({ success: false, message: userMessage, details: backendMessage });
        setError(userMessage);
        stopCamera();
      } else {
        const userMessage = backendMessage || 'Không thể xác thực mã QR. Vui lòng thử lại.';
        setScanResult({ success: false, message: userMessage, details: backendMessage });
        setError(userMessage);
        try { showError(userMessage, statusCode ? `Lỗi ${statusCode}` : undefined); } catch (_) {}
        stopCamera();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event?.target ? event.target.files?.[0] : event; // allow passing File directly
    if (!file) return;
    try {
      setError(''); setIsProcessing(true); detectionInProgressRef.current = false; lastFrameProcessTimeRef.current = 0;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const img = new Image();
          img.onload = () => {
            try {
              const canvas = canvasRef.current || document.createElement('canvas');
              const context = canvas.getContext('2d', { willReadFrequently: true });
              if (!context) { setError('Không thể tạo canvas context'); setIsProcessing(false); return; }
              if (img.width <= 0 || img.height <= 0) { setError('Ảnh có kích thước không hợp lệ'); setIsProcessing(false); return; }
              const maxSize = 1280; let width = img.width; let height = img.height;
              if (width > maxSize || height > maxSize) { if (width > height) { height = (height / width) * maxSize; width = maxSize; } else { width = (width / height) * maxSize; height = maxSize; } }
              canvas.width = width; canvas.height = height; context.drawImage(img, 0, 0, width, height);
              context.filter = 'contrast(1.3) brightness(1.1)'; context.drawImage(canvas, 0, 0); context.filter = 'none';
              const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
              if (!imageData || !imageData.data || imageData.data.length === 0) { setError('Không thể đọc dữ liệu ảnh'); setIsProcessing(false); return; }
              let code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
              if (code) { processQRCode(code.data); } else { setError('Không tìm thấy mã QR trong ảnh. Hãy thử với ảnh rõ nét hơn.'); setIsProcessing(false); }
            } catch (error) { setError(error?.message || 'Lỗi khi xử lý ảnh'); setIsProcessing(false); }
          };
          img.onerror = () => { setError('Không thể tải ảnh. Vui lòng chọn file ảnh hợp lệ.'); setIsProcessing(false); };
          img.src = e.target.result;
        } catch (_) { setError('Lỗi khi đọc dữ liệu ảnh'); setIsProcessing(false); }
      };
      reader.onerror = () => { setError('Lỗi khi đọc file ảnh'); setIsProcessing(false); };
      reader.readAsDataURL(file);
    } catch (_) { setError('Lỗi khi xử lý file ảnh'); setIsProcessing(false); }
    if (event?.target) { event.target.value = ''; }
  };

  const resetScanner = () => {
    setScanResult(null);
    setError('');
    setIsProcessing(false);
    processedRef.current = false;
    lastScanTimeRef.current = 0;
    frameCountRef.current = 0;
    lastFrameProcessTimeRef.current = 0;
    detectionInProgressRef.current = false;
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    return () => {
      scanningActiveRef.current = false;
      detectionInProgressRef.current = false;
      if (requestAnimationFrameIdRef.current) { cancelAnimationFrame(requestAnimationFrameIdRef.current); requestAnimationFrameIdRef.current = null; }
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      zxingControlsRef.current = null;
      if (zxingCleanupRef.current) { try { zxingCleanupRef.current(); } catch(_) {} zxingCleanupRef.current = null; }
      zxingReaderRef.current = null;
      const allTracks = [];
      activeTracksRef.current.forEach(track => { if (track) allTracks.push(track); });
      if (streamRef.current) { try { streamRef.current.getTracks().forEach(track => { if (track && !allTracks.includes(track)) allTracks.push(track); }); } catch (_) {} }
      if (videoRef.current?.srcObject instanceof MediaStream) { try { videoRef.current.srcObject.getTracks().forEach(track => { if (track && !allTracks.includes(track)) allTracks.push(track); }); } catch (_) {} }
      allTracks.forEach(track => { try { const caps = track.getCapabilities?.() || {}; if (caps.torch) { track.applyConstraints({ advanced: [{ torch: false }] }).catch(() => {}); } } catch (_) {} try { track.enabled = false; } catch (_) {} try { track.stop(); } catch (_) {} });
      activeTracksRef.current.clear();
      streamRef.current = null;
      if (videoRef.current) { try { videoRef.current.srcObject = null; } catch (_) {} }
    };
  }, []);

  return {
    // Refs
    videoRef, canvasRef, fileInputRef,
    // State
    isScanning, isStarting, scanResult, error, isProcessing, permissionHint, hasTorch, torchOn,
    // Actions
    startCamera, stopCamera, toggleTorch, requestPermission, handleFileUpload, resetScanner,
  };
}
