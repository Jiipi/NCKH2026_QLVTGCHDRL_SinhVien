/**
 * Admin Registrations Page (3-Tier Architecture)
 * 
 * Tier 1: Services - adminRegistrationsApi
 * Tier 2: Model - useAdminRegistrations hook
 * Tier 3: UI - Shared components from shared/Registrations
 */

import React from 'react';
import ActivityDetailModal from '../../../../../entities/activity/ui/ActivityDetailModal';
import ConfirmModal from '../../../../../shared/components/common/ConfirmModal';
import { useAdminRegistrations } from '../../../model';
import AdminRegistrationsHero from '../../shared/Registrations/AdminRegistrationsHero';
import AdminRegistrationsStats from '../../shared/Registrations/AdminRegistrationsStats';
import AdminRegistrationsFilters from '../../shared/Registrations/AdminRegistrationsFilters';
import AdminRegistrationsLoading from '../../shared/Registrations/AdminRegistrationsLoading';
import AdminRegistrationsEmpty from '../../shared/Registrations/AdminRegistrationsEmpty';
import AdminRegistrationsResults from '../../shared/Registrations/AdminRegistrationsResults';

interface Activity {
  id: string;
  hoat_dong_id?: string;
  hd_id?: string;
  [key: string]: unknown;
}

interface ConfirmState {
  isOpen: boolean;
  registrationId: string | null;
}

const AdminRegistrationsPage: React.FC = () => {
  const {
    registrations,
    total, page, setPage, limit, setLimit,
    activities, classes,
    loading,
    searchTerm, setSearchTerm,
    activityFilter, setActivityFilter,
    viewMode, setViewMode,
    selectedIds, setSelectedIds,
    selectedActivity, setSelectedActivity,
    showActivityModal, setShowActivityModal,
    classId, setClassId,
    exporting,
    semester, setSemester,
    semesterOptions,
    filteredRegistrations,
    stats,
    fetchRegistrations,
    exportExcel,
    approve,
    reject,
    bulkApprove,
  } = useAdminRegistrations();

  const [confirmApprove, setConfirmApprove] = React.useState<ConfirmState>({ isOpen: false, registrationId: null });
  const [confirmReject, setConfirmReject] = React.useState<ConfirmState>({ isOpen: false, registrationId: null });
  const [rejectReason, setRejectReason] = React.useState<string>('');
  const [confirmBulkApproveOpen, setConfirmBulkApproveOpen] = React.useState<boolean>(false);

  const handleViewActivity = (activity: Activity): void => {
    if (activity) {
      setSelectedActivity(activity);
      setShowActivityModal(true);
    }
  };

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number): void => {
    setPage(1);
    setLimit(newLimit);
  };

  const handleViewModeChange = (newViewMode: string): void => {
    setPage(1);
    setViewMode(newViewMode);
  };

  const confirmBulkApproveAction = async (): Promise<void> => {
    try {
      await bulkApprove(selectedIds);
      setSelectedIds([]);
      setConfirmBulkApproveOpen(false);
      await fetchRegistrations();
    } catch (error) {
      console.error('Lỗi khi phê duyệt hàng loạt:', error);
      alert('Có lỗi xảy ra khi phê duyệt');
    }
  };

  const confirmApproveAction = async (): Promise<void> => {
    try {
      await approve(confirmApprove.registrationId!);
      setConfirmApprove({ isOpen: false, registrationId: null });
      await fetchRegistrations();
    } catch (error) {
      console.error('Lỗi khi phê duyệt đăng ký:', error);
      alert('Có lỗi xảy ra khi phê duyệt');
    }
  };

  const confirmRejectAction = async (): Promise<void> => {
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }
    try {
      await reject(confirmReject.registrationId!, rejectReason);
      setConfirmReject({ isOpen: false, registrationId: null });
      setRejectReason('');
      await fetchRegistrations();
    } catch (error) {
      console.error('Lỗi khi từ chối đăng ký:', error);
      alert('Có lỗi xảy ra khi từ chối');
    }
  };

  const handleApprove = (registrationId: string): void => {
    setConfirmApprove({ isOpen: true, registrationId });
  };

  const handleReject = (registrationId: string): void => {
    setRejectReason('');
    setConfirmReject({ isOpen: true, registrationId });
  };

  if (loading && filteredRegistrations.length === 0) {
    return <AdminRegistrationsLoading />;
  }

  return (
    <div className="space-y-6">
      <AdminRegistrationsHero
        onExport={exportExcel}
        exporting={exporting}
        canExport={filteredRegistrations.length > 0}
      />

      <AdminRegistrationsStats stats={stats} viewMode={viewMode} />

      <AdminRegistrationsFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activityFilter={activityFilter}
        onActivityFilterChange={setActivityFilter}
        activities={activities}
        classId={classId}
        onClassIdChange={setClassId}
        classes={classes}
        semester={semester}
        onSemesterChange={setSemester}
        semesterOptions={semesterOptions}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        stats={stats}
      />

      {viewMode === 'pending' && selectedIds.length > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-[1.5rem] border border-amber-200/70 bg-amber-50/70 p-4 shadow-sm backdrop-blur-2xl dark:border-amber-400/20 dark:bg-amber-400/10">
          <span className="text-sm font-bold text-amber-800 dark:text-amber-300">
            Đã chọn {selectedIds.length} đăng ký
          </span>
          <button
            onClick={() => setConfirmBulkApproveOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 hover:shadow-md"
          >
            Phê duyệt hàng loạt ({selectedIds.length})
          </button>
        </div>
      )}

      {filteredRegistrations.length === 0 ? (
        <AdminRegistrationsEmpty />
      ) : (
        <AdminRegistrationsResults
          registrations={filteredRegistrations}
          viewMode={viewMode}
          selectedIds={selectedIds}
          onToggleSelect={setSelectedIds}
          onViewActivity={handleViewActivity}
          onApprove={handleApprove}
          onReject={handleReject}
          page={page}
          total={total}
          limit={limit}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      )}

      <ActivityDetailModal
        isOpen={!!showActivityModal && !!selectedActivity}
        activityId={(selectedActivity as Activity)?.id || (selectedActivity as Activity)?.hoat_dong_id || (selectedActivity as Activity)?.hd_id}
        onClose={() => {
          setShowActivityModal(false);
          setSelectedActivity(null);
        }}
      />

      <ConfirmModal
        isOpen={confirmApprove.isOpen}
        onClose={() => setConfirmApprove({ isOpen: false, registrationId: null })}
        onConfirm={confirmApproveAction}
        title="Xác nhận phê duyệt"
        message="Bạn có chắc chắn muốn phê duyệt đăng ký này không? Sinh viên sẽ được tham gia hoạt động sau khi được phê duyệt."
        type="success"
        confirmText="Phê duyệt"
        cancelText="Hủy bỏ"
      />

      <ConfirmModal
        isOpen={confirmReject.isOpen}
        onClose={() => {
          setConfirmReject({ isOpen: false, registrationId: null });
          setRejectReason('');
        }}
        onConfirm={confirmRejectAction}
        title="Xác nhận từ chối"
        message="Vui lòng nhập lý do từ chối đăng ký. Sinh viên sẽ nhận được thông báo về quyết định này."
        type="error"
        confirmText="Từ chối"
        cancelText="Hủy bỏ"
        showInput={true}
        inputPlaceholder="Nhập lý do từ chối (bắt buộc)..."
        inputValue={rejectReason}
        onInputChange={setRejectReason}
      />

      <ConfirmModal
        isOpen={confirmBulkApproveOpen}
        onClose={() => setConfirmBulkApproveOpen(false)}
        onConfirm={confirmBulkApproveAction}
        title="Phê duyệt hàng loạt"
        message={`Bạn đang thực hiện phê duyệt ${selectedIds.length} đăng ký cùng lúc. Tất cả các sinh viên được chọn sẽ được phê duyệt tham gia hoạt động. Bạn có chắc chắn muốn tiếp tục?`}
        type="warning"
        confirmText={`Phê duyệt ${selectedIds.length} đăng ký`}
        cancelText="Hủy bỏ"
      />
    </div>
  );
};

export default AdminRegistrationsPage;
