import React, { useState, useMemo } from 'react';

// Refactored imports (3-Tier Architecture)
import { useClassApprovals } from '../../model/hooks/useClassApprovals';
import {
  ApprovalHeader,
  ApprovalFilters,
  ApprovalCard,
  BulkActionToolbar
} from '../shared';

// Shared components
import ActivityDetailModal from '../../../../entities/activity/ui/ActivityDetailModal';
import { useSemesterData } from '../../../../shared/hooks';
import { LoadingSpinner, ErrorMessage, EmptyState, Pagination } from '../../../../shared/components/common';

export default function ClassApprovalsPage() {
    const initialSemester = useMemo(() => sessionStorage.getItem('current_semester') || '', []);
    const { isWritable } = useSemesterData(initialSemester);

    const {
        loading, processing, error, semester, setSemester, activeTab, setActiveTab,
        searchTerm, setSearchTerm, filters, setFilters, selectedIds, setSelectedIds,
        allRegistrations, filteredRegistrations,
        handleApprove, handleReject, handleBulkApprove, handleToggleSelect, handleToggleSelectAll,
        sortBy, setSortBy,
    } = useClassApprovals(initialSemester);

    const [viewMode, setViewMode] = useState('grid');
    const [activityDetailId, setActivityDetailId] = useState(null);
    const [paginationState, setPaginationState] = useState({ page: 1, limit: 12 });

    const stats = useMemo(() => ({
        total: allRegistrations.length,
        pending: allRegistrations.filter(r => r.trang_thai_dk === 'cho_duyet').length,
        approved: allRegistrations.filter(r => r.trang_thai_dk === 'da_duyet').length,
        participated: allRegistrations.filter(r => r.trang_thai_dk === 'da_tham_gia').length,
    }), [allRegistrations]);

    const paginatedItems = useMemo(() => {
        const start = (paginationState.page - 1) * paginationState.limit;
        return filteredRegistrations.slice(start, start + paginationState.limit);
    }, [filteredRegistrations, paginationState]);

    return (
        <div className="space-y-6">
            <ApprovalHeader stats={stats} />

            <ApprovalFilters 
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
                filters={filters}
                onFiltersChange={setFilters}
                activityTypes={[] /* Pass activity types if needed */}
                sortBy={sortBy}
                onSortChange={setSortBy}
            />

            {/* You would create a generic Tab component here */}
            <div className="flex justify-center gap-2 p-2 bg-gray-100 rounded-lg">
                <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 rounded-md font-semibold ${activeTab === 'pending' ? 'bg-white shadow' : ''}`}>Chờ duyệt ({stats.pending})</button>
                <button onClick={() => setActiveTab('approved')} className={`px-4 py-2 rounded-md font-semibold ${activeTab === 'approved' ? 'bg-white shadow' : ''}`}>Đã duyệt ({stats.approved})</button>
                <button onClick={() => setActiveTab('completed')} className={`px-4 py-2 rounded-md font-semibold ${activeTab === 'completed' ? 'bg-white shadow' : ''}`}>Đã tham gia ({stats.participated})</button>
            </div>

            {activeTab === 'pending' && (
                <BulkActionToolbar 
                    selectedCount={selectedIds.length}
                    totalCount={filteredRegistrations.length}
                    onSelectAll={handleToggleSelectAll}
                    onClearSelection={() => setSelectedIds([])}
                    onBulkApprove={handleBulkApprove}
                    isProcessing={processing}
                />
            )}

            <div className="min-h-[400px]">
                {loading ? <LoadingSpinner /> :
                 error ? <ErrorMessage message={error} /> :
                 paginatedItems.length === 0 ? <EmptyState title="Không có đơn đăng ký nào" /> :
                 (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {paginatedItems.map(reg => (
                                <ApprovalCard 
                                    key={reg.id}
                                    registration={reg}
                                    onApprove={handleApprove}
                                    onReject={handleReject}
                                    onSelect={handleToggleSelect}
                                    onViewActivity={setActivityDetailId}
                                    isSelected={selectedIds.includes(reg.id)}
                                    isProcessing={processing}
                                />
                            ))}
                        </div>
                        <Pagination 
                            pagination={{ page: paginationState.page, total: filteredRegistrations.length, limit: paginationState.limit, totalPages: Math.ceil(filteredRegistrations.length / paginationState.limit) }}
                            onPageChange={(page) => setPaginationState(p => ({ ...p, page }))}
                        />
                    </>
                 )
                }
            </div>

            <ActivityDetailModal 
                isOpen={!!activityDetailId}
                activityId={activityDetailId}
                onClose={() => setActivityDetailId(null)}
            />
        </div>
    );
}
