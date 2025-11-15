import React, { useState, useMemo, useEffect } from 'react';
import { Grid3X3, List } from 'lucide-react';

// Re-usable hooks and components from our new structure
import { useMyActivities } from '../hooks/useMyActivities';
import { MyActivityCard } from '../components/MyActivityCard';
import { RegistrationStatusTabs } from '../components/RegistrationStatusTabs';
import { ActivityFilters } from '../components/ActivityFilters'; // Assuming a generic filter component exists

// Shared components
import ActivityDetailModal from '../../../entities/activity/ui/ActivityDetailModal';
import ActivityQRModal from '../../qr-attendance/components/ActivityQRModal';
import useSemesterData from '../../../hooks/useSemesterData';
import sessionStorageManager from '../../../shared/services/storage/sessionStorageManager';
import { normalizeRole } from '../../../shared/lib/role';
import LoadingSpinner from '../../../shared/components/common/LoadingSpinner';
import ErrorMessage from '../../../shared/components/common/ErrorMessage';
import EmptyState from '../../../shared/components/common/EmptyState';
import Pagination from '../../../shared/components/common/Pagination';

// A generic header for activity pages
const PageHeader = ({ title, subtitle, stats }) => (
    <div className="p-8 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-2xl">
        <h1 className="text-4xl font-bold mb-2">{title}</h1>
        <p>{subtitle}</p>
        {stats && (
            <div className="mt-4 flex flex-wrap gap-4">
                {stats.map(stat => (
                    <div key={stat.label} className="p-4 bg-white/20 rounded-xl">
                        <strong>{stat.value}</strong> {stat.label}
                    </div>
                ))}
            </div>
        )}
    </div>
);

// Main Refactored Component for Monitor's Activities
export default function MonitorMyActivitiesPage() {
    // --- STATE MANAGEMENT ---
    const [viewMode, setViewMode] = useState('grid');
    const [selectedActivityId, setSelectedActivityId] = useState(null);
    const [qrModalState, setQrModalState] = useState({ isOpen: false, activityId: null, activityName: '' });
    const [pagination, setPagination] = useState({ page: 1, limit: 20 });

    const initialSemester = useMemo(() => sessionStorage.getItem('current_semester') || '', []);

    const {
        loading, error, semester, setSemester, activeTab, setActiveTab, query, setQuery, filters, setFilters,
        activityTypes, categorizedActivities, filteredItems, handleCancelRegistration
    } = useMyActivities(initialSemester);

    const { isWritable } = useSemesterData(semester);
    const canShowQR = useMemo(() => {
        const role = normalizeRole(sessionStorageManager.getRole() || '').toUpperCase();
        return ['SINH_VIEN', 'LOP_TRUONG', 'GIANG_VIEN', 'ADMIN'].includes(role);
    }, []);

    // --- EFFECTS ---
    useEffect(() => {
        if (semester) sessionStorage.setItem('current_semester', semester);
    }, [semester]);

    useEffect(() => {
        setPagination(p => ({ ...p, page: 1 }));
    }, [query, filters, activeTab]);

    // --- DATA & COMPUTATIONS ---
    const paginatedItems = useMemo(() => {
        const start = (pagination.page - 1) * pagination.limit;
        const end = start + pagination.limit;
        return filteredItems.slice(start, end);
    }, [filteredItems, pagination.page, pagination.limit]);

    const tabCounts = useMemo(() => ({
        pending: categorizedActivities.pending.length,
        approved: categorizedActivities.approved.length,
        joined: categorizedActivities.joined.length,
        rejected: categorizedActivities.rejected.length,
    }), [categorizedActivities]);

    const totalPoints = useMemo(() => 
        categorizedActivities.joined.reduce((sum, reg) => sum + (parseFloat(reg.hoat_dong?.diem_rl) || 0), 0),
    [categorizedActivities.joined]);

    // --- HANDLERS ---
    const handleViewDetail = (activityId) => setSelectedActivityId(activityId);
    const handleShowQR = (activityId, activityName) => setQrModalState({ isOpen: true, activityId, activityName });
    const handlePageChange = (newPage) => setPagination(p => ({ ...p, page: newPage }));

    // --- RENDER ---
    return (
        <div className="space-y-6">
            <PageHeader 
                title="Hoạt Động Của Tôi (Lớp trưởng)"
                subtitle="Theo dõi các hoạt động rèn luyện bạn đã đăng ký với tư cách cá nhân."
                stats={[
                    { value: filteredItems.length, label: 'Hoạt động' },
                    { value: totalPoints.toFixed(1), label: 'Tổng điểm' },
                ]}
            />

            <ActivityFilters 
                query={query}
                onQueryChange={setQuery}
                filters={filters}
                onFiltersChange={setFilters}
                semester={semester}
                onSemesterChange={setSemester}
                activityTypes={activityTypes}
                onSearch={() => {}}
            />
            
            <RegistrationStatusTabs activeTab={activeTab} onTabChange={setActiveTab} counts={tabCounts} />

            <div className="flex items-center justify-end">
                 <div className="flex items-center gap-2">
                    <button onClick={() => setViewMode('grid')} className={`p-2 border-2 rounded-xl ${viewMode === 'grid' ? 'bg-blue-100' : ''}`}><Grid3X3/></button>
                    <button onClick={() => setViewMode('list')} className={`p-2 border-2 rounded-xl ${viewMode === 'list' ? 'bg-blue-100' : ''}`}><List/></button>
                </div>
            </div>

            <div className="min-h-[400px]">
                {loading ? <LoadingSpinner /> :
                 error ? <ErrorMessage message={error} /> :
                 paginatedItems.length === 0 ? <EmptyState /> :
                 (
                    <>
                        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
                            {paginatedItems.map(reg => (
                                <MyActivityCard
                                    key={reg.id}
                                    activityRegistration={reg}
                                    status={activeTab}
                                    mode={viewMode}
                                    onViewDetail={handleViewDetail}
                                    onShowQR={handleShowQR}
                                    onCancel={handleCancelRegistration}
                                    isWritable={isWritable}
                                    canShowQR={canShowQR}
                                />
                            ))}
                        </div>
                        <Pagination page={pagination.page} total={filteredItems.length} limit={pagination.limit} onChange={handlePageChange} />
                    </>
                 )
                }
            </div>

            <ActivityDetailModal isOpen={!!selectedActivityId} activityId={selectedActivityId} onClose={() => setSelectedActivityId(null)} />
            <ActivityQRModal isOpen={qrModalState.isOpen} activityId={qrModalState.activityId} activityName={qrModalState.activityName} onClose={() => setQrModalState({isOpen: false})} />
        </div>
    );
}

