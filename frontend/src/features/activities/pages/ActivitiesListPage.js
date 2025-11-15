import React, { useState, useMemo, useEffect } from 'react';
import { Grid3X3, List, Users, Sparkles } from 'lucide-react';

// Refactored imports - CORRECTED PATHS
import { useActivitiesList } from '../hooks/useActivitiesList';
import { ActivityCard } from '../components/ActivityCard';
import { ActivityFilters } from '../components/ActivityFilters';
import activitiesApi from '../services/activitiesApi';
import http from '../../../shared/services/api/client';

// Shared components - CORRECTED PATHS
import ActivityDetailModal from '../../../entities/activity/ui/ActivityDetailModal';
import SemesterClosureBanner from '../../../components/SemesterClosureBanner';
import useSemesterData from '../../../hooks/useSemesterData';
import LoadingSpinner from '../../../shared/components/common/LoadingSpinner';
import ErrorMessage from '../../../shared/components/common/ErrorMessage';
import EmptyState from '../../../shared/components/common/EmptyState';
import Pagination from '../../../shared/components/common/Pagination';

// Main Component Refactored
export default function ActivitiesListPage() {
    // --- STATE MANAGEMENT ---
    // UI-specific state
    const [viewMode, setViewMode] = useState('grid');
    const [selectedActivityId, setSelectedActivityId] = useState(null);
    const [role, setRole] = useState('');

    // Get initial semester from session storage
    const initialSemester = useMemo(() => sessionStorage.getItem('current_semester') || '', []);

    // Custom hook for all business logic and data fetching
    const {
        loading, error, items, activityTypes, pagination, setPagination,
        query, setQuery, filters, setFilters, semester, setSemester, handleRegister, refresh
    } = useActivitiesList(initialSemester);

    // Dependent hooks and derived state
    const { isWritable } = useSemesterData(semester);

    // --- EFFECTS ---
    // Fetch user profile to determine role
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                let res;
                try {
                    res = await http.get('/core/profile');
                } catch (err) {
                    res = await http.get('/auth/profile');
                }
                const data = res?.data?.data || res?.data || {};
                const userRole = data.role || data?.vai_tro?.ten_vt || '';
                setRole((userRole || '').toString().toLowerCase());
            } catch (e) {
                // ignore role fetch errors; page still works without role-specific UI
                setRole('');
            }
        };
        fetchProfile();
    }, []);
    
    // Persist semester choice
    useEffect(() => {
        if(semester) sessionStorage.setItem('current_semester', semester);
    }, [semester]);

    // --- HANDLERS ---
    const handleViewDetail = (activityId) => setSelectedActivityId(activityId);
    const handlePageChange = (newPage) => setPagination(prev => ({ ...prev, page: newPage }));
    const handleSearch = () => refresh();
    const clearAllFilters = () => {
        setQuery('');
        setFilters({ type: '', status: '', from: '', to: '' });
    };

    // --- RENDER ---
    return (
        <div className="space-y-6">
            <SemesterClosureBanner />
            
            <ActivityFilters 
                query={query}
                onQueryChange={setQuery}
                filters={filters}
                onFiltersChange={setFilters}
                semester={semester}
                onSemesterChange={setSemester}
                activityTypes={activityTypes}
                onSearch={handleSearch}
            />

            <div className="flex items-center justify-between">
                <span className="text-gray-700 font-semibold">
                    {loading ? 'Đang tìm...' : `Tìm thấy ${pagination.total} hoạt động`}
                </span>
                <div className="flex items-center gap-2">
                    <button onClick={() => setViewMode('grid')} className={`p-2 border-2 rounded-xl ${viewMode === 'grid' ? 'bg-blue-100' : ''}`}><Grid3X3/></button>
                    <button onClick={() => setViewMode('list')} className={`p-2 border-2 rounded-xl ${viewMode === 'list' ? 'bg-blue-100' : ''}`}><List/></button>
                </div>
            </div>

            <div className="min-h-[400px]">
                {loading ? <LoadingSpinner /> :
                 error ? <ErrorMessage message={error} /> :
                 items.length === 0 ? <EmptyState onClearFilters={clearAllFilters} /> :
                 (
                    <>
                        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
                            {items.map(activity => (
                                <ActivityCard 
                                    key={activity.id}
                                    activity={activity}
                                    mode={viewMode}
                                    onRegister={handleRegister}
                                    onViewDetail={handleViewDetail}
                                    isWritable={isWritable}
                                    role={role}
                                />
                            ))}
                        </div>
                        <Pagination page={pagination.page} total={pagination.total} limit={pagination.limit} onChange={handlePageChange} />
                    </>
                 )
                }
            </div>

            <ActivityDetailModal 
                isOpen={!!selectedActivityId} 
                activityId={selectedActivityId} 
                onClose={() => setSelectedActivityId(null)} 
            />
        </div>
    );
}
