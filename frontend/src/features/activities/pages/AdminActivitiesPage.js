import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity as ActivityIcon, Plus } from 'lucide-react';

// Custom Hook and Components
import { useAdminActivities } from '../hooks/useAdminActivities';
import { AdminActivityFilters } from '../components/AdminActivityFilters';
import { AdminActivityCard } from '../components/AdminActivityCard';

// Shared Components
import { LoadingSpinner, EmptyState, Pagination } from '../../../shared/components/common';

export default function AdminActivitiesPage() {
  const navigate = useNavigate();
  const {
    activities, activityTypes,
    loading, processing,
    filters, pagination,
    handleFilterChange, handlePaginationChange,
    handleDelete, handleApprove, handleReject,
  } = useAdminActivities();

  const handleCreate = () => navigate('/admin/activities/create');

  const renderContent = () => {
    if (loading && !activities.length) {
    return (
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner text="Đang tải hoạt động..." />
      </div>
    );
    }

    if (activities.length === 0) {
    return (
        <div className="bg-white rounded-2xl p-12 border border-gray-200 shadow flex flex-col items-center justify-center text-gray-500">
          <ActivityIcon className="h-10 w-10 mb-3" />
          Không có hoạt động nào phù hợp
      </div>
    );
  }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {activities.map(act => (
          <AdminActivityCard 
            key={act.id} 
            activity={act} 
            onApprove={handleApprove} 
            onReject={handleReject} 
            onDelete={handleDelete} 
            isProcessing={processing} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <ActivityIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">Quản Lý Hoạt Động</h1>
                  <p className="text-indigo-100 mt-1">Quản trị toàn bộ hoạt động trong hệ thống</p>
                </div>
              </div>
              <button onClick={handleCreate} className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-2xl hover:bg-indigo-50 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 font-semibold">
              <Plus className="h-5 w-5" /> Tạo mới
              </button>
          </div>
        </div>

        {/* Filters */}
        <AdminActivityFilters 
          filters={filters}
          onFilterChange={handleFilterChange}
          activityTypes={activityTypes}
        />

        {/* Content */}
        {renderContent()}

        {/* Pagination */}
        {activities.length > 0 && (
          <Pagination 
            pagination={pagination} 
            onPageChange={(page) => handlePaginationChange('page', page)} 
          />
        )}
      </div>
    </div>
  );
}
