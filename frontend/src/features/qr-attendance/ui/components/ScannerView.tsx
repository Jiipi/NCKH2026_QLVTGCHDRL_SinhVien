import React from 'react';
import { Camera, Scan } from 'lucide-react';

interface ScannerViewProps {
  isScanning: boolean;
  isStarting: boolean;
}

const ScannerView = React.forwardRef<HTMLVideoElement, ScannerViewProps>(({ isScanning, isStarting }, ref) => {
  return (
    <div className="relative mb-4 h-[min(68svh,20rem)] min-h-64 w-full overflow-hidden rounded-3xl border border-white/60 bg-slate-950 shadow-inner shadow-black/20 dark:border-white/10 sm:mb-6 sm:h-80 sm:rounded-[2rem]">
      <video
        ref={ref}
        className={`h-full w-full object-cover ${isScanning ? 'block' : 'hidden'}`}
        playsInline
        autoPlay
        muted
      />

      {!isScanning && (
        <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_50%_0%,rgba(20,184,166,0.18),transparent_32%),linear-gradient(135deg,#0f172a,#020617)]">
          <div className="px-4 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl">
              {isStarting ? (
                <Scan className="h-8 w-8 animate-pulse text-teal-200" />
              ) : (
                <Camera className="h-8 w-8 text-slate-300" />
              )}
            </div>
            <p className="font-bold text-white">
              {isStarting ? 'Đang khởi động camera...' : 'Camera chưa bật'}
            </p>
            <p className="mt-1 text-sm text-slate-400">Đặt mã QR trong khung để hệ thống nhận diện.</p>
          </div>
        </div>
      )}

      {isScanning && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-4 rounded-[1.5rem] border border-white/10" />
          <div className="absolute left-5 top-5 h-12 w-12 rounded-tl-2xl border-l-4 border-t-4 border-teal-300 shadow-[0_0_18px_rgba(45,212,191,0.35)]" />
          <div className="absolute right-5 top-5 h-12 w-12 rounded-tr-2xl border-r-4 border-t-4 border-indigo-300 shadow-[0_0_18px_rgba(129,140,248,0.35)]" />
          <div className="absolute bottom-5 left-5 h-12 w-12 rounded-bl-2xl border-b-4 border-l-4 border-indigo-300 shadow-[0_0_18px_rgba(129,140,248,0.35)]" />
          <div className="absolute bottom-5 right-5 h-12 w-12 rounded-br-2xl border-b-4 border-r-4 border-teal-300 shadow-[0_0_18px_rgba(45,212,191,0.35)]" />
          <div className="absolute left-8 right-8 top-1/2 h-px bg-gradient-to-r from-transparent via-teal-200 to-transparent shadow-[0_0_18px_rgba(45,212,191,0.65)] animate-scan-line" />
        </div>
      )}

      <style>{`
        @keyframes scan-line {
          0%, 100% { transform: translateY(-96px); opacity: .45; }
          50% { transform: translateY(96px); opacity: 1; }
        }
        .animate-scan-line {
          animation: scan-line 2.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
});

export default ScannerView;
