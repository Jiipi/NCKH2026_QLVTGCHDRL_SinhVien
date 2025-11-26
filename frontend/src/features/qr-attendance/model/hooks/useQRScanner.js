import { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { BrowserQRCodeReader } from '@zxing/browser';
import qrAttendanceApi from '../../services/qrAttendanceApi';

export function useQRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const zxingReaderRef = useRef(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (zxingReaderRef.current) {
      try {
        if (typeof zxingReaderRef.current.reset === 'function') {
          zxingReaderRef.current.reset();
        } else if (typeof zxingReaderRef.current.stopContinuousDecode === 'function') {
          zxingReaderRef.current.stopContinuousDecode();
        }
      } catch (e) {
        // ignore cleanup errors
      }
      zxingReaderRef.current = null;
    }
    setIsScanning(false);
    setIsStarting(false);
    setHasTorch(false);
    setTorchOn(false);
  }, []);

  const processQRCode = useCallback(async (qrData) => {
    if (isProcessing) return;
    setIsProcessing(true);
    stopCamera();

    // Parse QR payload to keep legacy validation (expects JSON with activityId, token)
    let payload = null;
    try {
      payload = JSON.parse(qrData);
    } catch (_) {
      const jsonStart = typeof qrData === 'string' ? qrData.indexOf('{') : -1;
      const jsonEnd = typeof qrData === 'string' ? qrData.lastIndexOf('}') : -1;
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        try { payload = JSON.parse(qrData.slice(jsonStart, jsonEnd + 1)); } catch (_) {}
      }
    }

    if (!payload || !payload.activityId || !payload.token) {
      const msg = 'Mã QR không hợp lệ';
      setScanResult({ success: false, message: msg });
      setError(msg);
      setIsProcessing(false);
      return;
    }

    try {
      // Validate token via backend QR data
      const qrInfo = await qrAttendanceApi.getQrData(payload.activityId);
      if (!qrInfo.success) throw new Error(qrInfo.error || 'Không thể xác thực mã QR');

      const server = qrInfo.data || {};
      const serverToken = server.qr_token || server.token;
      if (!serverToken || serverToken !== payload.token) {
        throw new Error('Mã QR không khớp hoặc đã hết hạn');
      }

      // Submit attendance with token
      const checkin = await qrAttendanceApi.scanAttendance(payload.activityId, payload.token);
      if (!checkin.success) throw new Error(checkin.error || 'Điểm danh thất bại');

      const data = checkin.data || {};
      const result = {
        success: true,
        message: checkin.message || 'Điểm danh thành công!',
        data: {
          activityId: data.activityId || payload.activityId,
          activityName: data.activityName || server.activity_name || '',
          sessionName: data.sessionName || 'Mặc định',
          timestamp: data.timestamp || new Date().toISOString(),
        },
      };
      setScanResult(result);

      // Broadcast updates like legacy
      try { window.dispatchEvent(new CustomEvent('attendance:updated', { detail: { activityId: payload.activityId }})); } catch (_) {}
      try { window.localStorage.setItem('ATTENDANCE_UPDATED_AT', String(Date.now())); } catch (_) {}
    } catch (e) {
      const msg = e?.message || 'Không thể xác thực mã QR. Vui lòng thử lại.';
      setScanResult({ success: false, message: msg });
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, stopCamera]);

  const startScanningWithZXing = useCallback(async () => {
    try {
      const reader = new BrowserQRCodeReader();
      zxingReaderRef.current = reader;
      const videoElement = videoRef.current;

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: { ideal: 'environment' } }
      });
      streamRef.current = stream;
      videoElement.srcObject = stream;
      
      const videoTrack = stream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities ? videoTrack.getCapabilities() : {};
      setHasTorch(!!capabilities.torch);

      await videoElement.play();
      setIsScanning(true);
      setIsStarting(false);

      reader.decodeFromVideoElement(videoElement, (result, err) => {
        if (result) {
          processQRCode(result.getText());
        }
        if (err && !(err instanceof DOMException)) {
          console.error("ZXing scan error:", err);
        }
      });
    } catch (err) {
        console.error("Camera start error:", err);
        setError('Không thể khởi động camera. Vui lòng cấp quyền và thử lại.');
        setIsStarting(false);
    }
  }, [processQRCode]);

  const startCamera = useCallback(() => {
    if (isStarting || isScanning) return;
    setIsStarting(true);
    setError('');
    setScanResult(null);
    startScanningWithZXing();
  }, [isStarting, isScanning, startScanningWithZXing]);

  const handleFileUpload = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          processQRCode(code.data);
        } else {
          setError('Không tìm thấy mã QR trong ảnh.');
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }, [processQRCode]);

  const toggleTorch = useCallback(async () => {
    if (!hasTorch || !streamRef.current) return;
    const videoTrack = streamRef.current.getVideoTracks()[0];
    try {
      await videoTrack.applyConstraints({ advanced: [{ torch: !torchOn }] });
      setTorchOn(!torchOn);
    } catch (err) {
      console.error('Failed to toggle torch:', err);
    }
  }, [hasTorch, torchOn]);

  const resetScanner = useCallback(() => {
    stopCamera();
    setScanResult(null);
    setError('');
    setIsProcessing(false);
  }, [stopCamera]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    isScanning,
    isStarting,
    isProcessing,
    scanResult,
    error,
    hasTorch,
    torchOn,
    startCamera,
    stopCamera,
    handleFileUpload,
    toggleTorch,
    resetScanner,
  };
}

