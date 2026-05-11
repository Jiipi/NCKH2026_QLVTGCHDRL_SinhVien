import type { FC, ReactNode } from 'react';
import { Tag, Plus, Sparkles } from 'lucide-react';

interface ActivityTypeHeaderProps {
  onCreateClick: () => void;
  loading: boolean;
  totalCount?: number;
}

const ActivityTypeHeader: FC<ActivityTypeHeaderProps> = ({
  onCreateClick,
  loading,
  totalCount = 0
}) => {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20 sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(129,140,248,0.16),transparent_30%),radial-gradient(circle_at_100%_0%,rgba(236,72,153,0.12),transparent_28%)]" />
      <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-indigo-300">
            <Sparkles className="h-4 w-4" />
            {totalCount} loại
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/70 bg-white/55 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <Tag className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-3xl">Quản lý loại hoạt động</h1>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500 dark:text-slate-300">Tạo và quản lý danh mục hoạt động rèn luyện, phân loại, cấu hình điểm số và màu sắc.</p>
            </div>
          </div>
        </div>
        <button
          onClick={onCreateClick}
          disabled={loading}
          className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-5 w-5" />
          Tạo mới
        </button>
      </div>
    </section>
  );
};

export default ActivityTypeHeader;
