import React, { useState } from 'react';
import { Eye, LayoutGrid, List } from 'lucide-react';

// Custom Hook for logic
import { useTeacherActivities } from '../hooks/useTeacherActivities';

// Shared & Reusable Components
import useSemesterData from '../../../hooks/useSemesterData';
import SemesterFilter from '../../../shared/components/common/SemesterFilter';
import { LoadingSpinner, ErrorMessage, EmptyState, Pagination } from '../../../shared/components/common';
import ActivityDetailModal from '../../../entities/activity/ui/ActivityDetailModal';
import { TeacherActivityFilters } from '../components/TeacherActivityFilters';
import { TeacherActivityList } from '../components/TeacherActivityList';
import { TeacherActivityGrid } from '../components/TeacherActivityGrid';

const TeacherActivitiesPage = () => {
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [selectedActivity, setSelectedActivity] = useState(null);

  const { 
    activities, loading, processing, error, pagination,
    semester, setSemester, searchTerm, setSearchTerm,
    statusFilter, setStatusFilter, typeFilter, setTypeFilter,
    handleApprove, handleReject, handlePageChange
  } = useTeacherActivities(sessionStorage.getItem('current_semester') || '');

  const { isWritable } = useSemesterData(semester);

  const handleViewDetails = (activity) => {
        setSelectedActivity(activity);
  };

  if (loading && !activities.length) {
    return <LoadingSpinner text="Đang tải danh sách hoạt động..." />;
    }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Quản lý Hoạt động</h1>
            <p className="text-blue-100 mt-1">Xem, duyệt và quản lý các hoạt động rèn luyện.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white text-blue-700' : 'bg-white/20 text-white hover:bg-white/30'}`}
              title="Dạng danh sách"
            >
              <List className="h-4 w-4" />
              <span>Danh sách</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'grid' ? 'bg-white text-blue-700' : 'bg-white/20 text-white hover:bg-white/30'}`}
              title="Dạng lưới"
            >
              <LayoutGrid className="h-4 w-4" />
              <span>Lưới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <TeacherActivityFilters 
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        semester={semester}
        onSemesterChange={setSemester}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        pagination={pagination}
        onPaginationChange={(key, value) => handlePageChange({ ...pagination, [key]: value, page: 1 })}
      />

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow p-4 md:p-6 min-h-[500px]">
        {loading && <div className='text-center text-gray-500'>Đang làm mới dữ liệu...</div>}
        {!loading && activities.length === 0 ? (
          <EmptyState title="Không có hoạt động nào" message="Không tìm thấy hoạt động nào phù hợp với bộ lọc hiện tại." />
          ) : viewMode === 'grid' ? (
          <TeacherActivityGrid 
            activities={activities} 
            onViewDetails={handleViewDetails} 
            onApprove={handleApprove} 
            onReject={handleReject} 
            isProcessing={processing}
            isWritable={isWritable}
          />
          ) : (
          <TeacherActivityList 
            activities={activities} 
            onViewDetails={handleViewDetails} 
            onApprove={handleApprove} 
            onReject={handleReject} 
            isProcessing={processing}
            isWritable={isWritable}
          />
                        )}
                      </div>
                      
      {/* Pagination */}
      {activities.length > 0 && (
        <Pagination 
          pagination={pagination}
          onPageChange={(newPage) => handlePageChange(newPage)}
        />
      )}

      {/* Detail Modal */}
      {selectedActivity && (
        <ActivityDetailModal 
          isOpen={!!selectedActivity}
          activityId={selectedActivity.id}
          onClose={() => setSelectedActivity(null)}
        />
      )}
    </div>
  );
};

export default TeacherActivitiesPage;
