import React from 'react';
import { LoaderCircle } from 'lucide-react';

interface AppLoadingScreenProps {
  title?: string;
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export default function AppLoadingScreen({
  title = 'ĐANG TẢI DỮ LIỆU',
  message = 'Vui lòng chờ trong giây lát...',
  fullScreen = false,
  className = ''
}: AppLoadingScreenProps) {
  const shellClass = fullScreen
    ? 'min-h-screen'
    : 'min-h-[360px]';

  return (
    <div
      className={`${shellClass} flex items-center justify-center bg-[#f6f0ff] px-4 py-10 dark:bg-slate-950 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative w-full max-w-[340px]">
        <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-xl bg-black" aria-hidden="true" />
        <div className="relative rounded-xl border-4 border-black bg-white px-8 py-10 text-center shadow-[0_0_80px_rgba(168,85,247,0.18)] dark:bg-slate-900">
          <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-purple-300/50 blur-2xl" aria-hidden="true" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-black bg-purple-400">
              <LoaderCircle className="h-11 w-11 animate-spin text-black" strokeWidth={3} />
            </div>
          </div>

          <h2 className="text-xl font-black uppercase tracking-wide text-black dark:text-white">
            {title}
          </h2>
          <p className="mt-3 text-sm font-bold text-slate-600 dark:text-slate-300">
            {message}
          </p>

          <div className="mt-5 flex items-center justify-center gap-2" aria-hidden="true">
            <span className="h-3 w-3 animate-bounce rounded-full border-2 border-black bg-purple-400 [animation-delay:0ms]" />
            <span className="h-3 w-3 animate-bounce rounded-full border-2 border-black bg-pink-400 [animation-delay:150ms]" />
            <span className="h-3 w-3 animate-bounce rounded-full border-2 border-black bg-indigo-400 [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    </div>
  );
}
