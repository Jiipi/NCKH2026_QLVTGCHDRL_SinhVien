import React, { useEffect, useMemo, useState } from 'react';
import ActivityDetailModal from '../../../entities/activity/ui/ActivityDetailModal';
import { Pagination } from '../../../shared/components/common';
import { useNotification } from '../../../shared/contexts/NotificationContext';
import useTeacherRegistrations from '../model/hooks/useTeacherRegistrations';
import {
  RegistrationApprovalsHeroInline,
  RegistrationAdvancedFilters,
  RegistrationStatusTabs,
  RegistrationToolbar,
  RegistrationBulkActions,
  RegistrationCardInline,
  RegistrationEmptyState
} from './components/registration-approvals';

const STATUS_MAP = {
  pending: 'cho_duyet',
  approved: 'da_duyet',
  joined: 'da_tham_gia',
  rejected: 'tu_choi'
};

export default function TeacherRegistrationApprovalsPage() {
  const {
    registrations,
    loading,
    error,
    stats,
    searchTerm,
    setSearchTerm,
    viewMode,
    setViewMode,
    statusViewMode,
    setStatusViewMode,
    displayViewMode,
    setDisplayViewMode,
    semester,
    setSemester,
    semesterOptions,
    isWritable,
    selectedIds,
    processing,
    showFilters,
    setShowFilters,
    filters,
    setFilters,
    activityTypes,
    sortBy,
    setSortBy,
    activityDetailId,
    setActivityDetailId,
    isDetailModalOpen,
    setIsDetailModalOpen,
    handleToggleSelect,
    handleToggleSelectAll,
    handleApprove,
    handleReject,
    handleBulkApprove,
    getActiveFilterCount,
    clearAllFilters
  } = useTeacherRegistrations();

  const { showSuccess, showError, showWarning, confirm } = useNotification();
  const [pagination, setPagination] = useState({ page: 1, limit: 12 });

  const totalItems = registrations.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pagination.limit) || 1);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [searchTerm, viewMode, filters, sortBy, semester]);

  useEffect(() => {
    if (pagination.page > totalPages) {
      setPagination((prev) => ({ ...prev, page: totalPages }));
    }
  }, [pagination.page, totalPages]);

  const paginatedRegistrations = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;
    return registrations.slice(start, start + pagination.limit);
  }, [registrations, pagination]);

  const activeFilterCount = getActiveFilterCount();
  const startItem = totalItems ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const endItem = Math.min(pagination.page * pagination.limit, totalItems);
  const selectableCount = registrations.filter(
    (reg) => reg.trang_thai_dk === 'cho_duyet'
  ).length;

  const handleViewDetail = (activity) => {
    if (!activity?.id) return;
    setActivityDetailId(activity.id);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setActivityDetailId(null);
  };

  const handleApproveWithConfirm = async (registration) => {
    if (!registration) return;
    const studentName =
      registration.sinh_vien?.nguoi_dung?.ho_ten || 'sinh viên';
    const confirmed = await confirm({
      title: 'Xác nhận phê duyệt',
      message: `Phê duyệt đăng ký của ${studentName}?`,
      confirmText: 'Phê duyệt',
      cancelText: 'Hủy'
    });
    if (!confirmed) return;

    const result = await handleApprove(registration);
    if (result?.success) {
      showSuccess(
        `Đã phê duyệt đăng ký cho ${studentName}`,
        'Phê duyệt thành công'
      );
    } else {
      showError(result?.error || 'Không thể phê duyệt đăng ký', 'Lỗi phê duyệt');
    }
  };

  const handleRejectWithConfirm = async (registration) => {
    if (!registration) return;
    let reason =
      window.prompt('Lý do từ chối (bắt buộc):', 'Không đáp ứng yêu cầu') || '';
    reason = reason.trim();
    if (!reason) {
      showWarning('Vui lòng nhập lý do từ chối hợp lệ', 'Thiếu lý do');
      return;
    }

    const studentName =
      registration.sinh_vien?.nguoi_dung?.ho_ten || 'sinh viên';
    const confirmed = await confirm({
      title: 'Xác nhận từ chối',
      message: `Từ chối đăng ký của ${studentName}?\n\nLý do: ${reason}`,
      confirmText: 'Từ chối',
      cancelText: 'Hủy'
    });
    if (!confirmed) return;

    const result = await handleReject(registration, reason);
    if (result?.success) {
      showSuccess(
        `Đã từ chối đăng ký của ${studentName}`,
        'Từ chối thành công'
      );
    } else {
      showError(result?.error || 'Không thể từ chối đăng ký', 'Lỗi từ chối');
    }
  };

  const handleBulkApproveWithConfirm = async () => {
    if (!selectedIds.length) {
      showWarning('Vui lòng chọn ít nhất một đăng ký', 'Chưa chọn đăng ký');
      return;
    }

    const confirmed = await confirm({
      title: 'Phê duyệt hàng loạt',
      message: `Phê duyệt ${selectedIds.length} đăng ký đã chọn?`,
      confirmText: 'Phê duyệt tất cả',
      cancelText: 'Hủy'
    });
    if (!confirmed) return;

    const result = await handleBulkApprove();
    if (result?.success) {
      const approvedCount = result.data?.approved || selectedIds.length;
      showSuccess(
        `Đã phê duyệt ${approvedCount} đăng ký`,
        'Phê duyệt hàng loạt thành công'
      );
    } else {
      showError(
        result?.error || 'Không thể phê duyệt hàng loạt',
        'Lỗi phê duyệt'
      );
    }
  };

    return (
    <div className="space-y-6" data-ref="teacher-registration-approvals">
      <RegistrationApprovalsHeroInline stats={stats} />

      <RegistrationToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        semester={semester}
        semesterOptions={semesterOptions}
        onSemesterChange={setSemester}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((prev) => !prev)}
        activeFilterCount={activeFilterCount}
        onClearFilters={clearAllFilters}
        displayViewMode={displayViewMode}
        onDisplayViewModeChange={setDisplayViewMode}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <RegistrationAdvancedFilters
        visible={showFilters}
        filters={filters}
        activityTypes={activityTypes}
        activeCount={activeFilterCount}
        onFilterChange={(field, value) =>
          setFilters((prev) => ({ ...prev, [field]: value }))
        }
        onClear={clearAllFilters}
      />

      <RegistrationStatusTabs
        currentStatus={viewMode}
        onStatusChange={(value) => {
          setViewMode(value);
          setPagination((prev) => ({ ...prev, page: 1 }));
        }}
        statusViewMode={statusViewMode}
        onStatusViewModeChange={setStatusViewMode}
        stats={stats}
      />

      {isWritable && stats.pending > 0 && (
        <RegistrationBulkActions
          selectedCount={selectedIds.length}
          totalCount={selectableCount}
          onSelectAll={handleToggleSelectAll}
          onBulkApprove={handleBulkApproveWithConfirm}
          processing={processing}
        />
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-2">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div
          className={
            displayViewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
              : 'space-y-3'
          }
        >
          {paginatedRegistrations.length === 0 ? (
            <RegistrationEmptyState status={STATUS_MAP[viewMode]} />
          ) : (
            paginatedRegistrations.map((registration) => (
              <RegistrationCardInline
                key={registration.id}
                registration={registration}
                isSelected={selectedIds.includes(registration.id)}
                onToggleSelect={handleToggleSelect}
                processing={processing}
                onApprove={handleApproveWithConfirm}
                onReject={handleRejectWithConfirm}
                onViewDetail={handleViewDetail}
                displayViewMode={displayViewMode}
              />
            ))
          )}
        </div>
      )}

      {!loading && paginatedRegistrations.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-6">
          <div className="text-sm text-gray-500 mb-3">
            Hiển thị {startItem}-{endItem} trên {totalItems} đăng ký
          </div>
          <Pagination
            pagination={{
              page: pagination.page,
              limit: pagination.limit,
              total: totalItems
            }}
            onPageChange={(page) =>
              setPagination((prev) => ({ ...prev, page }))
            }
            onLimitChange={(limit) =>
              setPagination({ page: 1, limit: Number(limit) })
            }
            itemLabel="đăng ký"
            showLimitSelector
          />
        </div>
      )}

      {isDetailModalOpen && activityDetailId && (
      <ActivityDetailModal
        activityId={activityDetailId}
        isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
      />
      )}
    </div>
  );
}
