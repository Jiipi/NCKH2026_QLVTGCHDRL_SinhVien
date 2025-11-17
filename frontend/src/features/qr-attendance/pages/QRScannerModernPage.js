import React from 'react';
import { 
  Camera, Upload, X, CheckCircle, AlertCircle, 
  Scan, Sparkles, Zap, Info, QrCode, Image as ImageIcon,
  Clock, MapPin, User, Award
} from 'lucide-react';
import { useLegacyQRScanner } from '../hooks/useLegacyQRScanner';

export default function QRScannerModernPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="relative min-h-[280px]">
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600"></div>
            <div className="absolute inset-0" style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
              animation: 'grid-move 20s linear infinite'
            }}></div>
          </div>
          <div className="absolute top-10 right-20 w-20 h-20 border-4 border-white/30 rotate-45 animate-bounce-slow"></div>
          <div className="absolute bottom-10 left-16 w-16 h-16 bg-yellow-400/20 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 left-1/3 w-12 h-12 border-4 border-cyan-300/40 rounded-full animate-spin-slow"></div>
          <div className="relative z-10 p-8">
            <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-2xl p-8 shadow-2xl">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-50 animate-pulse"></div>
                    <div className="relative bg-black text-cyan-400 px-4 py-2 font-black text-sm tracking-wider transform -rotate-2 shadow-lg border-2 border-cyan-400">
                      📱 QR SCANNER
                    </div>
                  </div>
                  <div className="h-8 w-1 bg-white/40"></div>
                  <div className="text-white/90 font-bold text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      ĐIỂM DANH
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-8">
                <h1 className="text-6xl lg:text-7xl font-black text-white mb-4 leading-none tracking-tight">
                  <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Q</span>
                  <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">U</span>
                  <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">É</span>
                  <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">T</span>
                  <span className="inline-block mx-2">•</span>
                  <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">M</span>
                  <span className="inline-block transform hover:scale-110 transition-transform duration-300 cursor-default">Ã</span>
                  <br />
                  <span className="relative inline-block mt-2">
                    <span className="relative z-10 text-cyan-400 drop-shadow-[0_0_30px_rgba(34,211,238,0.5)]">QR CODE</span>
                    <div className="absolute -bottom-2 left-0 right-0 h-4 bg-cyan-400/30 blur-sm"></div>
                  </span>
                </h1>
                <p className="text-white/80 text-xl font-medium max-w-2xl leading-relaxed">
                  Quét mã QR hoặc tải ảnh lên để điểm danh nhanh chóng và chính xác
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="group relative">
                  <div className="absolute inset-0 bg-black transform translate-x-1 translate-y-1 rounded-lg"></div>
                  <div className="relative bg-yellow-400 border-2 border-black px-4 py-2 rounded-lg transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-black" />
                    <span className="text-xs font-black text-black uppercase tracking-wider">Nhanh</span>
                  </div>
                </div>
                <div className="group relative">
                  <div className="absolute inset-0 bg-black transform translate-x-1 translate-y-1 rounded-lg"></div>
                  <div className="relative bg-green-400 border-2 border-black px-4 py-2 rounded-lg transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 flex items-center gap-2">
                    <Scan className="h-4 w-4 text-black" />
                    <span className="text-xs font-black text-black uppercase tracking-wider">Chính xác</span>
                  </div>
                </div>
                <div className="group relative">
                  <div className="absolute inset-0 bg-black transform translate-x-1 translate-y-1 rounded-lg"></div>
                  <div className="relative bg-cyan-400 border-2 border-black px-4 py-2 rounded-lg transform transition-all duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-black" />
                    <span className="text-xs font-black text-black uppercase tracking-wider">An toàn</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <style>{`
            @keyframes grid-move { 0% { transform: translateY(0); } 100% { transform: translateY(50px); } }
            @keyframes bounce-slow { 0%, 100% { transform: translateY(0) rotate(45deg); } 50% { transform: translateY(-20px) rotate(45deg); } }
            @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
            .animate-spin-slow { animation: spin-slow 8s linear infinite; }
          `}</style>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="group sticky top-6">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-500 rounded-xl p-2">
                    <Info className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold text-blue-900 text-lg">Hướng Dẫn</h3>
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
                  <div className="flex items-start gap-3 bg-white/50 backdrop-blur-sm rounded-xl p-3">
                    <div className="bg-green-100 rounded-lg p-2 mt-0.5">
                      <MapPin className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-blue-800 text-sm flex-1">Ở gần <span className="font-semibold">địa điểm tổ chức</span> nếu có yêu cầu vị trí</p>
                  </div>
                  <div className="flex items-start gap-3 bg-white/50 backdrop-blur-sm rounded-xl p-3">
                    <div className="bg-orange-100 rounded-lg p-2 mt-0.5">
                      <User className="h-4 w-4 text-orange-600" />
                    </div>
                    <p className="text-blue-800 text-sm flex-1">Mỗi người <span className="font-semibold">chỉ được điểm danh một lần</span> cho mỗi phiên</p>
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
                          <div className="absolute inset-0 rounded-2xl overflow-hidden">
                            <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-blue-500 rounded-tl-xl"></div>
                            <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-blue-500 rounded-tr-xl"></div>
                            <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-blue-500 rounded-bl-xl"></div>
                            <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-blue-500 rounded-br-xl"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-4/5 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse"></div>
                            </div>
                            <div className="absolute bottom-8 left-0 right-0 text-center">
                              <div className="inline-block bg-blue-500/90 backdrop-blur-sm text-white px-6 py-2 rounded-full">
                                <div className="flex items-center gap-2">
                                  <Scan className="h-4 w-4 animate-pulse" />
                                  <span className="text-sm font-medium">Đang quét mã QR...</span>
                                </div>
                              </div>
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
                            <button onClick={stopCamera} disabled={isStarting} className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-6 rounded-xl flex items-center justify-center gap-3 hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                              <X className="w-6 h-6" />
                              <span className="font-semibold text-lg">{isStarting ? 'Đang khởi động...' : 'Dừng Quét'}</span>
                            </button>
                            {isStarting && (
                              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3">
                                <div className="flex items-center gap-2 text-yellow-700 text-sm">
                                  <Clock className="w-4 h-4 animate-spin" />
                                  <span className="font-medium">Vui lòng đợi camera khởi động hoàn tất...</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {isScanning && hasTorch && (
                          <button onClick={toggleTorch} className={`${torchOn ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-800 hover:bg-gray-900'} w-full text-white py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-200`}>
                            <span className="font-semibold">{torchOn ? 'Tắt đèn flash' : 'Bật đèn flash'}</span>
                          </button>
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
                      <div className="relative inline-block mb-6">
                        <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200"></div>
                        <div className="animate-spin rounded-full h-20 w-20 border-4 border-t-blue-600 border-r-indigo-600 absolute inset-0"></div>
                        <Scan className="absolute inset-0 m-auto h-8 w-8 text-blue-600 animate-pulse" />
                      </div>
                      <p className="text-gray-700 font-semibold text-lg mb-2">Đang xử lý điểm danh...</p>
                      <p className="text-gray-500 text-sm">Vui lòng đợi trong giây lát</p>
                    </div>
                  )}
                  {scanResult && scanResult.success && (
                    <div className="text-center py-8">
                      <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-30"></div>
                        <div className="relative bg-gradient-to-br from-green-400 to-green-600 rounded-full p-6">
                          <CheckCircle className="w-16 h-16 text-white" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-3">Điểm Danh Thành Công! 🎉</h3>
                      <p className="text-gray-600 mb-6">{scanResult.message}</p>
                      {scanResult.data && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 text-left mb-6 space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="bg-green-500 rounded-lg p-2">
                              <Award className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 mb-1">Hoạt động</p>
                              <p className="text-sm font-semibold text-gray-800">{scanResult.data.activityName}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="bg-blue-500 rounded-lg p-2">
                              <User className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 mb-1">Phiên</p>
                              <p className="text-sm font-semibold text-gray-800">{scanResult.data.sessionName}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="bg-purple-500 rounded-lg p-2">
                              <Clock className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 mb-1">Thời gian</p>
                              <p className="text-sm font-semibold text-gray-800">{new Date(scanResult.data.timestamp).toLocaleString('vi-VN')}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      <button onClick={resetScanner} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold">Quét Mã Khác</button>
                    </div>
                  )}
                  {scanResult && !scanResult.success && (
                    <div className="text-center py-8">
                      <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-30"></div>
                        <div className="relative bg-gradient-to-br from-red-400 to-red-600 rounded-full p-6">
                          <AlertCircle className="w-16 h-16 text-white" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-3">Điểm Danh Thất Bại</h3>
                      <p className="text-gray-600 mb-6">{scanResult.message}</p>
                      <button onClick={resetScanner} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold">Thử Lại</button>
                    </div>
                  )}
                  {error && !scanResult && (
                    <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-4 mt-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-red-500 rounded-lg p-2"><AlertCircle className="w-5 h-5 text-white" /></div>
                        <div className="flex-1">
                          <p className="text-red-700 font-medium">{error}</p>
                          {permissionHint && (<p className="text-red-600 text-sm mt-1">{permissionHint}</p>)}
                        </div>
                      </div>
                      <div className="mt-3">
                        <button onClick={requestPermission} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700">Yêu cầu quyền camera</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
