import React from 'react';
import AdminRegistrationCard from './AdminRegistrationCard';
import Pagination from '../../../../../shared/components/common/Pagination';

export default function AdminRegistrationsResults({
  registrations,
  viewMode,
  selectedIds,
  onToggleSelect,
  onViewActivity,
  onApprove,
  onReject,
  page,
  total,
  limit,
  onPageChange,
  onLimitChange
}) {
  return (
    <div className="space-y-4">
      {registrations.map(registration => (
        <AdminRegistrationCard
          key={registration.id}
          registration={registration}
          viewMode={viewMode}
          isSelected={selectedIds.includes(registration.id)}
          onToggleSelect={(e) => {
            if (e.target.checked) {
              onToggleSelect([...selectedIds, registration.id]);
            } else {
              onToggleSelect(selectedIds.filter(id => id !== registration.id));
            }
          }}
          onViewActivity={onViewActivity}
          onApprove={onApprove}
          onReject={onReject}
        />
      ))}
      {total > 0 && (
        <div className="rounded-[2rem] border border-white/60 bg-white/60 p-3 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/60">
          <Pagination
            pagination={{ page, limit, total }}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange}
            itemLabel="đăng ký"
            showLimitSelector
          />
        </div>
      )}
    </div>
  );
}

