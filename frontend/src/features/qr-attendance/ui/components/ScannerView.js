import React from 'react';
import { Camera, Scan } from 'lucide-react';

const ScannerView = React.forwardRef(({ isScanning, isStarting }, ref) => {
  return (
    <div className="relative mb-6 w-full h-80 bg-black rounded-2xl overflow-hidden">
      <video
        ref={ref}
        className={`w-full h-full object-cover ${isScanning ? 'block' : 'hidden'}`}
        playsInline
        autoPlay
        muted
      />

      {!isScanning && (
        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <Camera className="w-16 h-16 mx-auto mb-4" />
            <p className="font-semibold">
              {isStarting ? 'Đang khởi động camera...' : 'Camera chưa bật'}
            </p>
          </div>
        </div>
      )}

      {isScanning && (
        <div className="absolute inset-0">
          {/* Scanning corners */}
          <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-xl"></div>
          <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-blue-500 rounded-tr-xl"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-blue-500 rounded-bl-xl"></div>
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-xl"></div>
          
          {/* Scanning line animation */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 shadow-[0_0_15px_5px_rgba(59,130,246,0.5)] animate-scan-line"></div>
        </div>
      )}

      <style>{`
        @keyframes scan-line {
          0% { transform: translateY(0); }
          100% { transform: translateY(100vh); }
        }
        .animate-scan-line {
          animation: scan-line 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
});

export default ScannerView;

