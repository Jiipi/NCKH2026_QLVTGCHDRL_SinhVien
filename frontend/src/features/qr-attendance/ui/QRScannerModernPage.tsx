import React, { useState, useEffect } from 'react';
import {
  Camera, Upload, X, CheckCircle, AlertCircle,
  Scan, Sparkles, Zap, Info, QrCode, Image as ImageIcon,
  Clock, MapPin, User, Award, Users
} from 'lucide-react';
import { useLegacyQRScanner } from '../model/hooks/useLegacyQRScanner';
import { studentActivitiesApi } from '../../student/services/studentActivitiesApi';
import { FaceAttendanceCard } from '../../face-recognition/ui/components';
import useSemesterData from '../../../shared/hooks/useSemesterData';

export default function QRScannerModernPage() {
  const [activeTab, setActiveTab] = useState<'qr' | 'face'>('qr');

  // States for Face Attendance tab
  const [ongoingActivities, setOngoingActivities] = useState<any[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Get semester to fetch current activities
  const currentSemester = sessionStorage.getItem('current_semester') || '';

  useEffect(() => {
    // Only fetch activities if Face tab is clicked and we haven't fetched yet
    if (activeTab === 'face' && ongoingActivities.length === 0) {
      const fetchActivities = async () => {
        setLoadingActivities(true);
        try {
          const result = await studentActivitiesApi.getMyActivities(currentSemester);
          if (result.success && (result as any).data) {
            // Filter only approved registrations
            const dataArr = (result as any).data as any[];
            const approvedActivities = dataArr.filter((a: any) =>
              a.trang_thai_dk === 'da_duyet' ||
              (a.registration_status === 'da_duyet') ||
              a.status === 'Đã duyệt'
            );

            setOngoingActivities(approvedActivities);
            if (approvedActivities.length > 0) {
              setSelectedActivityId(approvedActivities[0].hoat_dong?.id || approvedActivities[0].hd_id || approvedActivities[0].hoat_dong_id || approvedActivities[0].id || '');
            }
          }
        } catch (error) {
          console.error('Lỗi tải hoạt động:', error);
        } finally {
          setLoadingActivities(false);
        }
      };

      fetchActivities();
    }
  }, [activeTab, currentSemester, ongoingActivities.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Hero */}
        <div className="relative min-h-[220px]">
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600"></div>
            <div className="absolute inset-0" style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
              animation: 'grid-move 20s linear infinite'
            }}></div>
          </div>
          <div className="relative z-10 p-8 flex flex-col justify-center h-full">
            <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white/20 p-3 rounded-xl border border-white/30">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
                    ĐIỂM DANH HOẠT ĐỘNG
                  </h1>
                  <p className="text-white/80 font-medium mt-1">
                    Chọn phương thức điểm danh bên dưới
                  </p>
                </div>
              </div>
            </div>
          </div>
          <style>{`
            @keyframes grid-move { 0% { transform: translateY(0); } 100% { transform: translateY(50px); } }
          `}</style>
        </div>

        {/* Tab Navigation */}
        <div className="flex p-1 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-sm">
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'qr'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-500 hover:bg-gray-50'
              }`}
          >
            <QrCode className="w-5 h-5" />
            Quét QR
          </button>
          <button
            onClick={() => setActiveTab('face')}
            className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'face'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-gray-500 hover:bg-gray-50'
              }`}
          >
            <Users className="w-5 h-5" />
            Khuôn mặt
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'qr' ? <QRTab /> : <FaceTab
          activities={ongoingActivities}
          loading={loadingActivities}
          selectedId={selectedActivityId}
          onSelect={setSelectedActivityId}
        />}

      </div>
    </div>
  );
}

// ==========================================
// QR Tab Content 
// ==========================================
function QRTab() {
  const {
    videoRef,
    canvasRef,
    fileInputRef,
    isScanning,
    isStarting,
    scanResult,
    error,
    isProcessing,
    permissionHint,
    hasTorch,
    torchOn,
    startCamera,
    stopCamera,
    toggleTorch,
    requestPermission,
    handleFileUpload,
    resetScanner,
  } = useLegacyQRScanner();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-300">
      <div className="lg:col-span-1">
        <div className="group sticky top-6">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
          <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-500 rounded-xl p-2">
                <Info className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-blue-900 text-lg">Hướng Dẫn QR</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-white/50 backdrop-blur-sm rounded-xl p-3">
                <div className="bg-blue-100 rounded-lg p-2 mt-0.5">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-blue-800 text-sm flex-1">Đảm bảo bạn đã <span className="font-semibold">đăng ký tham gia hoạt động</span> trước khi điểm danh</p>
              </div>
              <div className="flex items-start gap-3 bg-white/50 backdrop-blur-sm rounded-xl p-3">
                <div className="bg-purple-100 rounded-lg p-2 mt-0.5">
                  <Clock className="h-4 w-4 text-purple-600" />
                </div>
                <p className="text-blue-800 text-sm flex-1">Quét QR trong <span className="font-semibold">thời gian điểm danh</span> được quy định</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-2">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
          <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="p-6">
              {!scanResult && !isProcessing && (
                <>
                  <div className="relative mb-6">
                    <video
                      ref={videoRef}
                      className={`w-full h-80 rounded-2xl object-cover ${isScanning ? 'block' : 'hidden'}`}
                      playsInline
                      autoPlay
                      muted
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    {!isScanning && (
                      <div className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
                        <div className="text-center">
                          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full p-6 mx-auto mb-4 inline-block">
                            <Camera className="w-12 h-12 text-white" />
                          </div>
                          <p className="text-gray-600 font-medium text-lg">Camera chưa khởi động</p>
                          <p className="text-gray-400 text-sm mt-2">Nhấn nút bên dưới để bắt đầu quét</p>
                        </div>
                      </div>
                    )}
                    {isScanning && (
                      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                        <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-blue-500 rounded-tl-xl"></div>
                        <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-blue-500 rounded-tr-xl"></div>
                        <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-blue-500 rounded-bl-xl"></div>
                        <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-blue-500 rounded-br-xl"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-4/5 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse"></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    {!isScanning ? (
                      <button onClick={startCamera} disabled={isStarting} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:shadow-lg disabled:transform-none">
                        <Camera className="w-6 h-6" />
                        <span className="font-semibold text-lg">{isStarting ? 'Đang khởi động camera...' : 'Bật Camera Quét QR'}</span>
                        {!isStarting && <Sparkles className="w-5 h-5" />}
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <button onClick={() => stopCamera()} disabled={isStarting} className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-6 rounded-xl flex items-center justify-center gap-3 hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                          <X className="w-6 h-6" />
                          <span className="font-semibold text-lg">{isStarting ? 'Đang khởi động...' : 'Dừng Quét'}</span>
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                      <span className="text-gray-500 text-sm font-medium px-4 py-1 bg-gray-100 rounded-full">hoặc</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="w-full bg-gradient-to-r from-gray-700 to-gray-800 text-white py-4 px-6 rounded-xl flex items-center justify-center gap-3 hover:from-gray-800 hover:to-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5" disabled={isProcessing}>
                      <ImageIcon className="w-6 h-6" />
                      <span className="font-semibold text-lg">Tải Ảnh QR</span>
                      <Upload className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
              {isProcessing && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 mx-auto mb-4 border-t-transparent"></div>
                  <p className="text-gray-700 font-semibold text-lg">Đang xử lý điểm danh...</p>
                </div>
              )}
              {scanResult && scanResult.success && (
                <div className="text-center py-8">
                  <div className="bg-green-100 text-green-600 rounded-full p-6 inline-block mb-4">
                    <CheckCircle className="w-16 h-16" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-700 mb-2">Điểm Danh Thành Công!</h3>
                  <p className="text-gray-600 mb-6">{scanResult.message}</p>
                  <button onClick={resetScanner} className="bg-blue-600 text-white py-3 px-8 rounded-xl hover:bg-blue-700 font-semibold shadow-lg">Quét Mã Khác</button>
                </div>
              )}
              {scanResult && !scanResult.success && (
                <div className="text-center py-8">
                  <div className="bg-red-100 text-red-600 rounded-full p-6 inline-block mb-4">
                    <AlertCircle className="w-16 h-16" />
                  </div>
                  <h3 className="text-2xl font-bold text-red-700 mb-2">Điểm Danh Thất Bại</h3>
                  <p className="text-gray-600 mb-6">{scanResult.message}</p>
                  <button onClick={resetScanner} className="bg-blue-600 text-white py-3 px-8 rounded-xl hover:bg-blue-700 font-semibold shadow-lg">Thử Lại</button>
                </div>
              )}
              {error && !scanResult && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mt-4">
                  <p className="font-semibold">{error}</p>
                  {permissionHint && <button onClick={requestPermission} className="mt-2 underline text-sm">Yêu cầu quyền</button>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Face Tab Content 
// ==========================================
function FaceTab({ activities, loading, selectedId, onSelect }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-300">
      <div className="lg:col-span-1">
        <div className="group sticky top-6">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
          <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-3xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-500 rounded-xl p-2">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-emerald-900 text-lg">Điểm Danh Khuôn Mặt</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-white/50 backdrop-blur-sm rounded-xl p-3">
                <div className="bg-emerald-100 rounded-lg p-2 mt-0.5">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-emerald-800 text-sm flex-1">Chọn <span className="font-semibold">hoạt động đang diễn ra</span> từ danh sách</p>
              </div>
              <div className="flex items-start gap-3 bg-white/50 backdrop-blur-sm rounded-xl p-3">
                <div className="bg-teal-100 rounded-lg p-2 mt-0.5">
                  <Camera className="h-4 w-4 text-teal-600" />
                </div>
                <p className="text-emerald-800 text-sm flex-1">Nhìn thẳng vào camera để xác minh nhanh chóng</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Chọn hoạt động cần điểm danh:
          </label>
          {loading ? (
            <div className="animate-pulse flex h-10 w-full bg-gray-200 rounded-lg"></div>
          ) : activities.length > 0 ? (
            <select
              value={selectedId}
              onChange={(e) => onSelect(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5"
            >
              {activities.map((a: any) => {
                const id = a.hoat_dong?.id || a.hd_id || a.hoat_dong_id || a.id;
                const name = a.hoat_dong?.ten_hd || a.hoat_dong?.name || a.name || a.ten_hd || `Hoạt động #${id}`;
                return (
                  <option key={id} value={id}>
                    {name}
                  </option>
                );
              })}
            </select>
          ) : (
            <div className="p-3 bg-yellow-50 text-yellow-700 rounded-lg text-sm border border-yellow-200">
              Bạn không có hoạt động nào (đã được duyệt) đang diễn ra.
            </div>
          )}
        </div>

        {selectedId && !loading && activities.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <FaceAttendanceCard
              hoatDongId={selectedId}
              className="border-2 border-emerald-100 shadow-xl"
            />
          </div>
        )}
      </div>
    </div>
  );
}
