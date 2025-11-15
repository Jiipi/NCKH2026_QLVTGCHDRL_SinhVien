import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, SlidersHorizontal, Grid3X3, List, Calendar, RefreshCw, Filter,
  Clock, CheckCircle, XCircle, Trophy, Sparkles
} from 'lucide-react';

// Refactored imports
import { useMyActivities } from '../hooks/useMyActivities';
import { MyActivityCard } from '../components/MyActivityCard';
import { RegistrationStatusTabs } from '../components/RegistrationStatusTabs';

// Shared components and services
import ActivityDetailModal from '../../../entities/activity/ui/ActivityDetailModal';
import ActivityQRModal from '../../qr-attendance/components/ActivityQRModal';
import useSemesterData from '../../../hooks/useSemesterData';
import sessionStorageManager from '../../../shared/services/storage/sessionStorageManager';
import { normalizeRole } from '../../../shared/lib/role';

// Placeholder for shared components that should be created
const LoadingSpinner = () => <div className="text-center p-8">Đang tải...</div>;
const ErrorMessage = ({ message }) => <div className="text-center p-8 text-red-500">{message}</div>;
const EmptyState = () => <div className="text-center p-8">Không có hoạt động nào.</div>;
const Pagination = ({ page, total, limit, onChange }) => {
    const totalPages = Math.ceil(total / limit);
    if (totalPages <= 1) return null;
    return (
        <div className="flex justify-center items-center gap-2 mt-8">
            <button onClick={() => onChange(page - 1)} disabled={page <= 1}>Trước</button>
            <span>Trang {page} / {totalPages}</span>
            <button onClick={() => onChange(page + 1)} disabled={page >= totalPages}>Sau</button>
        </div>
    );
};

// Main Component Refactored
export default function MyActivitiesModern() {
  // --- STATE MANAGEMENT ---
  // UI-specific state
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [qrModalState, setQrModalState] = useState({ isOpen: false, activityId: null, activityName: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 20 });

  // Get initial semester from session storage
  const initialSemester = useMemo(() => sessionStorage.getItem('current_semester') || '', []);

  // Custom hook for all business logic and data fetching
  const {
    loading, error, semester, setSemester, activeTab, setActiveTab, query, setQuery, filters, setFilters,
    activityTypes, categorizedActivities, filteredItems, handleCancelRegistration, refresh
  } = useMyActivities(initialSemester);

  // Dependent hooks and derived state
  const { options: semesterOptions, currentSemester } = useSemesterData(semester);
  const canShowQR = useMemo(() => {
    const raw = sessionStorageManager.getRole() || '';
    const normalized = normalizeRole(raw) || '';
    const role = normalized.toString().toUpperCase();
    return ['SINH_VIEN', 'LOP_TRUONG', 'GIANG_VIEN', 'ADMIN'].includes(role);
  }, []);

  // --- EFFECTS ---
  // Sync semester with global current semester from useSemesterData
  useEffect(() => {
    if (currentSemester && currentSemester !== semester) {
      setSemester(currentSemester);
    }
  }, [currentSemester, semester, setSemester]);

  // Persist semester choice to session storage
  useEffect(() => {
    if (semester) {
      sessionStorage.setItem('current_semester', semester);
    }
  }, [semester]);

  // Reset pagination when filters change
  useEffect(() => {
    setPagination(p => ({ ...p, page: 1 }));
  }, [query, filters, activeTab]);

  // --- DATA & COMPUTATIONS ---
  const paginatedItems = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    return filteredItems.slice(start, end);
  }, [filteredItems, pagination.page, pagination.limit]);

  const activeFilterCount = useMemo(() => {
    return (filters.type ? 1 : 0) + (filters.from ? 1 : 0) + (filters.to ? 1 : 0);
  }, [filters]);

  const tabCounts = useMemo(() => ({
    pending: categorizedActivities.pending.length,
    approved: categorizedActivities.approved.length,
    joined: categorizedActivities.joined.length,
    rejected: categorizedActivities.rejected.length,
  }), [categorizedActivities]);

  // --- HANDLERS ---
  const handleViewDetail = (activityId) => setSelectedActivityId(activityId);
  const handleShowQR = (activityId, activityName) => setQrModalState({ isOpen: true, activityId, activityName });
  const handlePageChange = (newPage) => setPagination(p => ({ ...p, page: newPage }));
  const clearAllFilters = () => {
    setQuery('');
    setFilters({ type: '', from: '', to: '' });
  };

  // --- RENDER ---
  return (
    <div className="space-y-6">
      {/* Header Section (can be a separate component later) */}
      <MyActivitiesHeader counts={tabCounts} />

      {/* Filter and Search Section */}
      <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm p-6 space-y-6">
        <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Tìm kiếm trong các hoạt động đã đăng ký..."
            />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
                <select value={semester} onChange={(e) => setSemester(e.target.value)} className="p-2 border-2 rounded-xl">
                    {semesterOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <button onClick={() => setShowFilters(!showFilters)} className="p-2 border-2 rounded-xl flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" /> Lọc nâng cao {activeFilterCount > 0 && `(${activeFilterCount})`}
                </button>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => setViewMode('grid')} className={`p-2 border-2 rounded-xl ${viewMode === 'grid' ? 'bg-blue-100' : ''}`}><Grid3X3/></button>
                <button onClick={() => setViewMode('list')} className={`p-2 border-2 rounded-xl ${viewMode === 'list' ? 'bg-blue-100' : ''}`}><List/></button>
            </div>
        </div>
        {showFilters && (
            <AdvancedFilters filters={filters} setFilters={setFilters} activityTypes={activityTypes} clearAllFilters={clearAllFilters} />
        )}
      </div>

      {/* Status Tabs */}
      <RegistrationStatusTabs activeTab={activeTab} onTabChange={setActiveTab} counts={tabCounts} />

      {/* Content Area */}
      <div className="min-h-[300px]">
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
                            isWritable={true} // Replace with actual logic from useSemesterData
                            canShowQR={canShowQR}
                        />
                    ))}
                </div>
                <Pagination page={pagination.page} total={filteredItems.length} limit={pagination.limit} onChange={handlePageChange} />
            </>
         )
        }
      </div>

      {/* Modals */}
      <ActivityDetailModal isOpen={!!selectedActivityId} activityId={selectedActivityId} onClose={() => setSelectedActivityId(null)} />
      <ActivityQRModal isOpen={qrModalState.isOpen} activityId={qrModalState.activityId} activityName={qrModalState.activityName} onClose={() => setQrModalState({isOpen: false})} />
    </div>
  );
}

// --- SUB-COMPONENTS (to be moved to separate files later) ---

const MyActivitiesHeader = ({ counts }) => {
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    return (
        <div className="p-8 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-2xl">
            <h1 className="text-4xl font-bold mb-2">Hoạt động của tôi</h1>
            <p>Theo dõi, quản lý và chinh phục các hoạt động rèn luyện bạn đã đăng ký.</p>
            <div className="mt-4 flex gap-4">
                <div className="p-4 bg-white/20 rounded-xl"><strong>{total}</strong> Tổng hoạt động</div>
                <div className="p-4 bg-white/20 rounded-xl"><strong>{counts.joined}</strong> Đã tham gia</div>
                <div className="p-4 bg-white/20 rounded-xl"><strong>{counts.approved}</strong> Đã được duyệt</div>
            </div>
        </div>
    );
};

const AdvancedFilters = ({ filters, setFilters, activityTypes, clearAllFilters }) => (
    <div className="mt-4 p-4 bg-gray-50 rounded-xl border-2 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select value={filters.type} onChange={e => setFilters(f => ({...f, type: e.target.value}))} className="p-2 border-2 rounded-xl w-full">
                <option value="">Tất cả loại</option>
                {activityTypes.map(type => <option key={type.id} value={type.ten_loai_hd}>{type.ten_loai_hd}</option>)}
            </select>
            <input type="date" value={filters.from} onChange={e => setFilters(f => ({...f, from: e.target.value}))} className="p-2 border-2 rounded-xl w-full" />
            <input type="date" value={filters.to} onChange={e => setFilters(f => ({...f, to: e.target.value}))} className="p-2 border-2 rounded-xl w-full" />
        </div>
        <button onClick={clearAllFilters} className="text-red-500">Xóa bộ lọc</button>
    </div>
);
