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
    <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-200" data-ref="teacher-approval-empty-state">
      <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-500 mb-2">{config.title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}


