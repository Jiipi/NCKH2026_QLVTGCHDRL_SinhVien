import React, { useMemo } from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

const VIEW_CONFIG = {
  pending: {
    icon: Clock,
    title: 'Không có hoạt động chờ duyệt',
    defaultMessage: 'Chưa có hoạt động nào cần phê duyệt'
  },
  approved: {
    icon: CheckCircle,
    title: 'Không có hoạt động đã duyệt',
    defaultMessage: 'Chưa có hoạt động nào được phê duyệt'
  },
  rejected: {
    icon: XCircle,
    title: 'Không có hoạt động bị từ chối',
    defaultMessage: 'Chưa có hoạt động nào bị từ chối'
  }
};

export default function ActivityApprovalEmptyState({
  viewMode,
  searchTerm,
  semester,
  semesterOptions
}) {
  const config = VIEW_CONFIG[viewMode] || VIEW_CONFIG.pending;
  const Icon = config.icon;

  const description = useMemo(() => {
    if (searchTerm) {
      return 'Không tìm thấy hoạt động phù hợp với từ khóa.';
    }
    if (viewMode === 'pending' && semester) {
      const label = semesterOptions?.find(opt => opt.value === semester)?.label;
      return label
        ? `Chưa có hoạt động nào cần phê duyệt trong ${label}.`
        : config.defaultMessage;
    }
    return config.defaultMessage;
  }, [config.defaultMessage, searchTerm, viewMode, semester, semesterOptions]);

  return (
    <div className="col-span-full text-center py-12 backdrop-blur-xl bg-white/80 dark:bg-slate-900/70 rounded-2xl border border-white/60 dark:border-white/10 shadow-2xl shadow-slate-200/50 dark:shadow-black/30" data-ref="teacher-approval-empty-state">
      <Icon className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-slate-500 dark:text-slate-300 mb-2">{config.title}</h3>
      <p className="text-slate-400 dark:text-slate-500 text-sm">{description}</p>
    </div>
  );
}


