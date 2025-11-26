import React, { useCallback } from 'react';
import { ConfirmModal, Toast, Pagination } from '../../../shared/components/common';
import ActivityDetailModal from '../../../entities/activity/ui/ActivityDetailModal';
import useTeacherActivityApprovalPage from '../model/hooks/useTeacherActivityApprovalPage';
import ActivityApprovalHero from './components/activity-approval/ActivityApprovalHero';
import ActivityApprovalControls from './components/activity-approval/ActivityApprovalControls';
import ActivityApprovalStatusTabs from './components/activity-approval/ActivityApprovalStatusTabs';
import ActivityApprovalGridCard from './components/activity-approval/ActivityApprovalGridCard';
import ActivityApprovalListItem from './components/activity-approval/ActivityApprovalListItem';
import ActivityApprovalEmptyState from './components/activity-approval/ActivityApprovalEmptyState';

export default function TeacherActivityApprovalPage() {
  const {
    stats,
    activities,
    filteredActivities,
    loading,
    error,
    viewMode,
    statusViewMode,
    displayViewMode,
    searchTerm,
    semester,
    confirmModal,
    rejectReason,
    toast,
    detailModal,
    setViewMode,
    setStatusViewMode,
    setDisplayViewMode,
    setSearchTerm,
    setSemester,
    setPagination,
    sortBy,
    setSortBy,
    setConfirmModal,
    setRejectReason,
    setToast,
    handleApproveClick,
    handleRejectClick,
    handleConfirmAction,
    handleViewDetail,
    handleCloseDetail,
    reloadActivities,
    semesterOptions,
    isWritable,
    statusLabels,
    statusColors,
    formatDate,
    pagination
  } = useTeacherActivityApprovalPage();

  const handleStatusViewModeChange = useCallback(() => {
    setStatusViewMode(prev => {
      if (prev === 'pills') return 'dropdown';
      if (prev === 'dropdown') return 'compact';
      return 'pills';
    });
  }, [setStatusViewMode]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Có lỗi xảy ra</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={reloadActivities}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6" data-ref="teacher-activity-approval-page">
      <ActivityApprovalHero stats={stats} />

      <ActivityApprovalControls
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        semester={semester}
        onSemesterChange={setSemester}
        displayViewMode={displayViewMode}
        onDisplayViewModeChange={setDisplayViewMode}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <ActivityApprovalStatusTabs
        viewMode={viewMode}
        statusViewMode={statusViewMode}
        stats={stats}
        onViewModeChange={setViewMode}
        onStatusViewModeChange={handleStatusViewModeChange}
      />

      <div className={displayViewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredActivities.length === 0 ? (
          <ActivityApprovalEmptyState
            viewMode={viewMode}
            searchTerm={searchTerm}
            semester={semester}
            semesterOptions={semesterOptions}
          />
        ) : (
          activities.map(activity => (
            displayViewMode === 'list' ? (
              <ActivityApprovalListItem
                key={activity.id}
                activity={activity}
                statusLabels={statusLabels}
                statusColors={statusColors}
                viewMode={viewMode}
                isWritable={isWritable}
                onApprove={handleApproveClick}
                onReject={handleRejectClick}
                onViewDetail={handleViewDetail}
                formatDate={formatDate}
              />
            ) : (
              <ActivityApprovalGridCard
                key={activity.id}
                activity={activity}
                statusLabels={statusLabels}
                statusColors={statusColors}
                viewMode={viewMode}
                isWritable={isWritable}
                onApprove={handleApproveClick}
                onReject={handleRejectClick}
                onViewDetail={handleViewDetail}
                formatDate={formatDate}
              />
            )
          ))
        )}
      </div>

      {filteredActivities.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-6">
          <div className="text-sm text-gray-500 mb-3">
            Hiển thị {Math.min((pagination.page - 1) * pagination.limit + 1, filteredActivities.length)}-{Math.min(pagination.page * pagination.limit, filteredActivities.length)} trên {filteredActivities.length} hoạt động
          </div>
          <Pagination
            pagination={{ ...pagination, total: filteredActivities.length }}
            onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            onLimitChange={(limit) => setPagination({ page: 1, limit: Number(limit) })}
            itemLabel="hoạt động"
            showLimitSelector
          />
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => {
          setConfirmModal({ isOpen: false, type: '', activityId: null, title: '', message: '' });
          setRejectReason('');
        }}
        onConfirm={handleConfirmAction}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type === 'approve' ? 'confirm' : 'warning'}
        confirmText={confirmModal.type === 'approve' ? 'Phê duyệt' : 'Từ chối'}
        cancelText="Hủy"
        showInput={confirmModal.type === 'reject'}
        inputPlaceholder="Nhập lý do từ chối..."
        inputValue={rejectReason}
        onInputChange={setRejectReason}
      />

      {toast.isOpen && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ isOpen: false, message: '', type: 'success' })}
          duration={3000}
        />
      )}

      {detailModal.isOpen && detailModal.activity && (
        <ActivityDetailModal
          activityId={detailModal.activity.id}
          isOpen={detailModal.isOpen}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
}
