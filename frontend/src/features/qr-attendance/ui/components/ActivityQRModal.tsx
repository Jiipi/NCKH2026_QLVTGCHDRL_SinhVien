import React, { useState, useEffect, useRef } from 'react';
import { X, Download, QrCode as QrCodeIcon, Loader, RefreshCw } from 'lucide-react';
import QRCode from 'qrcode';
import qrApi from '../../services/qrApi';

const REFRESH_BEFORE_EXPIRY_SECONDS = 5;

function secondsUntil(dateString) {
  if (!dateString) return 0;
  return Math.max(0, Math.ceil((new Date(dateString).getTime() - Date.now()) / 1000));
}

export default function ActivityQRModal({ activityId, activityName, isOpen, onClose }) {
  const [session, setSession] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isOpen && activityId) {
      loadQRData();
    } else {
      setSession(null);
      setQrData(null);
      setError('');
    }
  }, [isOpen, activityId]);

  useEffect(() => {
    if (qrData?.qrJson && canvasRef.current) {
      generateQRCode();
    }
  }, [qrData]);

  useEffect(() => {
    if (!isOpen || !qrData?.expiresAt) return;

    const tick = () => setRemainingSeconds(secondsUntil(qrData.expiresAt));
    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [isOpen, qrData?.expiresAt]);

  useEffect(() => {
    if (!isOpen || !session?.id || !qrData?.expiresAt) return;

    const delay = Math.max(1000, (secondsUntil(qrData.expiresAt) - REFRESH_BEFORE_EXPIRY_SECONDS) * 1000);
    const timeoutId = window.setTimeout(() => refreshToken(session.id, true), delay);
    return () => window.clearTimeout(timeoutId);
  }, [isOpen, session?.id, qrData?.expiresAt]);

  async function loadQRData() {
    try {
      setLoading(true);
      setError('');
      let activeSession = await qrApi.getCurrentAttendanceSession(activityId);
      if (!activeSession?.id) {
        activeSession = await qrApi.createAttendanceSession(activityId);
      }
      setSession(activeSession);
      await refreshToken(activeSession.id, false);
    } catch (err) {
      console.error('Load QR data error:', err);
      setError(err.response?.data?.message || 'Không thể tải mã QR');
    } finally {
      setLoading(false);
    }
  }

  async function refreshToken(sessionId, silent = false) {
    try {
      if (!silent) setRefreshing(true);
      const tokenData = await qrApi.fetchDynamicQrToken(activityId, sessionId);
      setQrData(tokenData);
      setRemainingSeconds(secondsUntil(tokenData.expiresAt));
      setError('');
    } catch (err) {
      console.error('Refresh QR token error:', err);
      setError(err.response?.data?.message || 'Không thể làm mới mã QR');
    } finally {
      setRefreshing(false);
    }
  }

  async function generateQRCode() {
    try {
      if (!qrData?.qrJson || !canvasRef.current) return;

      await QRCode.toCanvas(canvasRef.current, qrData.qrJson, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      });
    } catch (err) {
      console.error('Generate QR error:', err);
      setError('Không thể tạo mã QR');
    }
  }

  function downloadQR() {
    if (!qrData || !canvasRef.current) return;

    const url = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `QR-${activityName || 'Activity'}.png`;
    link.href = url;
    link.click();
  }

  async function handleClose() {
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <QrCodeIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Mã QR Điểm Danh</h2>
              <p className="text-sm text-gray-500">Mã tự đổi theo thời gian</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="h-12 w-12 text-blue-600 animate-spin mb-4" />
              <p className="text-sm text-gray-500">Đang tải mã QR...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-700">{error}</p>
              <button onClick={loadQRData} className="mt-2 text-sm font-medium text-red-600 hover:text-red-700">
                Thử lại
              </button>
            </div>
          )}

          {qrData && !loading && !error && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-1">Hoạt động:</p>
                <p className="text-base font-semibold text-blue-700">{qrData.activityName || activityName}</p>
              </div>

              <div className="flex justify-center bg-white border-2 border-gray-200 rounded-lg p-6">
                <canvas ref={canvasRef} className="max-w-full" />
              </div>

              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center">
                <p className="text-sm font-semibold text-emerald-800">Mã QR sẽ tự làm mới sau</p>
                <p className="mt-1 text-3xl font-black text-emerald-700">{remainingSeconds}s</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Hướng dẫn:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Mở trang "Điểm danh QR" trên thiết bị khác</li>
                  <li>• Quét mã QR đang hiển thị để điểm danh</li>
                  <li>• Mã cũ sẽ bị từ chối khi hết thời gian</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {qrData && !loading && (
          <div className="flex gap-3 p-6 border-t bg-gray-50">
            <button
              onClick={() => session?.id && refreshToken(session.id, false)}
              disabled={refreshing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
            >
              {refreshing ? <Loader className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Làm mới
            </button>
            <button
              onClick={downloadQR}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Download className="h-4 w-4" />
              Tải xuống
            </button>
            <button onClick={handleClose} className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
