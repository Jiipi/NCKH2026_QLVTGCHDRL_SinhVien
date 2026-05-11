import React, { useRef } from 'react';
import { Camera, X, Upload, Zap } from 'lucide-react';

interface ScannerControlsProps {
  isScanning: boolean;
  isStarting: boolean;
  hasTorch?: boolean;
  torchOn?: boolean;
  onStart: () => void;
  onStop: () => void;
  onFileUpload: (file: File | undefined) => void;
  onToggleTorch?: () => void;
}

export default function ScannerControls({
  isScanning,
  isStarting,
  hasTorch,
  torchOn,
  onStart,
  onStop,
  onFileUpload,
  onToggleTorch
}: ScannerControlsProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {!isScanning ? (
        <button
          onClick={onStart}
          disabled={isStarting}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 px-5 py-4 text-white shadow-sm shadow-indigo-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70 dark:from-white dark:via-indigo-100 dark:to-white dark:text-slate-950"
        >
          <Camera className="h-5 w-5" />
          <span className="text-base font-bold">
            {isStarting ? 'Đang khởi động...' : 'Bật camera quét QR'}
          </span>
        </button>
      ) : (
        <button
          onClick={onStop}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-rose-200/70 bg-rose-50/80 px-5 py-4 text-rose-700 shadow-sm backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-100 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300"
        >
          <X className="h-5 w-5" />
          <span className="text-base font-bold">Dừng quét</span>
        </button>
      )}

      {isScanning && hasTorch && onToggleTorch && (
        <button
          onClick={onToggleTorch}
          className={`flex w-full items-center justify-center gap-3 rounded-2xl border px-5 py-3 text-sm font-bold shadow-sm backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 ${torchOn
            ? 'border-amber-200/70 bg-amber-50/80 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300'
            : 'border-white/60 bg-white/55 text-slate-700 hover:bg-white/75 dark:border-white/10 dark:bg-white/5 dark:text-slate-200'
          }`}
        >
          <Zap className="h-4 w-4" />
          {torchOn ? 'Tắt đèn hỗ trợ' : 'Bật đèn hỗ trợ'}
        </button>
      )}

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-white/70 dark:bg-white/10" />
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">hoặc</span>
        <div className="h-px flex-1 bg-white/70 dark:bg-white/10" />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => onFileUpload(e.target.files?.[0])}
        className="hidden"
      />
      <button
        onClick={handleFileClick}
        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/60 bg-white/55 px-5 py-4 text-slate-700 shadow-sm backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/75 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
      >
        <Upload className="h-5 w-5" />
        <span className="text-base font-bold">Tải ảnh QR lên</span>
      </button>
    </div>
  );
}
