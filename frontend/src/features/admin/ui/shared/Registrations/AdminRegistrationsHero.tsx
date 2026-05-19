import React from 'react';
import { Download, Shield } from 'lucide-react';
import { AdminPageHero } from '../../../../../shared/components/admin';

interface AdminRegistrationsHeroProps {
  onExport?: () => void;
  exporting?: boolean;
  canExport?: boolean;
}

export default function AdminRegistrationsHero({ onExport, exporting, canExport }: AdminRegistrationsHeroProps) {
  return (
    <AdminPageHero
      eyebrow="Không gian quản trị"
      title="Quản lý đăng ký"
      description="Phê duyệt, từ chối và theo dõi đăng ký hoạt động trong không gian quản trị tập trung."
      heroIcon={Shield}
      actions={(
        <button
          onClick={onExport}
          disabled={exporting || !canExport}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/70 bg-white/55 px-4 py-2 text-sm font-bold text-amber-700 shadow-sm backdrop-blur-xl transition-all duration-200 hover:bg-white/75 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-amber-300 dark:hover:bg-white/10"
        >
          <Download className={`h-4 w-4 ${exporting ? 'animate-bounce' : ''}`} />
          {exporting ? 'Đang xuất...' : 'Xuất Excel'}
        </button>
      )}
    />
  );
}
