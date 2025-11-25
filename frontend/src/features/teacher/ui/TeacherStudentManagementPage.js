/**
 * TeacherStudentManagementPage
 * ============================
 * Tier 1 - Page Component (SOLID: Single Responsibility)
 * 
 * Clean composition of hook + UI components
 * Follows 3-tier architecture pattern from Monitor pages
 * 
 * @module features/teacher/ui/TeacherStudentManagementPage
 */

import React from 'react';
import { useTeacherStudentManagement } from '../model/hooks/useTeacherStudentManagement';
import {
  StudentHeader,
  ClassSidebar,
  MonitorAssignment,
  StudentActionBar,
  BulkActionBar,
  StudentList,
  StudentViewModal,
  StudentFormModal
} from './components/students';

/**
 * Loading State Component
 */
function LoadingState() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    </div>
  );
}

/**
 * Error State Component
 */
function ErrorState({ error, onRetry }) {
  return (
    <div className="p-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Có lỗi xảy ra</h3>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={onRetry}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}

/**
 * TeacherStudentManagementPage - Main page component
 * Composes hook data with UI components following SOLID principles
 */
export function TeacherStudentManagementPage() {
  // Use custom hook for all state and business logic (Tier 2)
  const {
    // Data
    students,
    classes,
    paginatedStudents,
    
    // Loading & Error
    loading,
    error,
    
    // Filters
    searchTerm,
    setSearchTerm,
    selectedClass,
    setSelectedClass,
    
    // View
    viewMode,
    setViewMode,
    
    // Selection
    selectedStudents,
    toggleStudentSelection,
    toggleSelectAll,
    clearSelection,
    
    // Pagination
    pagination,
    displayFrom,
    displayTo,
    handlePageChange,
    handleLimitChange,
    
    // Monitor
    selectedMonitorId,
    setSelectedMonitorId,
    assigningMonitor,
    handleAssignMonitor,
    
    // Modals
    modals,
    selectedStudent,
    activeTab,
    setActiveTab,
    openViewModal,
    openEditModal,
    openAddModal,
    closeModal,
    
    // Form
    formData,
    setFormData,
    
    // Actions
    loadData,
    handleAddStudent,
    handleUpdateStudent,
    handleDeleteStudent,
    handleBulkDelete,
    handleExport,
    goToImport,
  } = useTeacherStudentManagement();

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <StudentHeader 
        totalStudents={students.length} 
        totalClasses={classes.length} 
      />

      {/* Bulk Action Bar (conditionally rendered) */}
      <BulkActionBar
        selectedCount={selectedStudents.length}
        onBulkDelete={handleBulkDelete}
        onClearSelection={clearSelection}
      />

      {/* Main Layout: Sidebar + Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Class Sidebar */}
        <div className="col-span-12 lg:col-span-4">
          <ClassSidebar
            classes={classes}
            selectedClass={selectedClass}
            onSelectClass={setSelectedClass}
          />
        </div>

        {/* Main Content */}
        <div className="col-span-12 lg:col-span-8">
          {/* Monitor Assignment (only when class selected) */}
          {selectedClass && (
            <MonitorAssignment
              students={students}
              selectedMonitorId={selectedMonitorId}
              onMonitorChange={setSelectedMonitorId}
              onAssign={handleAssignMonitor}
              isAssigning={assigningMonitor}
            />
          )}

          {/* Action Bar (search, filters, buttons) */}
          <StudentActionBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            classes={classes}
            selectedClass={selectedClass}
            onClassChange={setSelectedClass}
            onAddStudent={openAddModal}
            onImport={goToImport}
            onExport={handleExport}
          />

          {/* Student List (grid or list view) */}
          <StudentList
            students={paginatedStudents}
            selectedStudents={selectedStudents}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onSelectStudent={toggleStudentSelection}
            onSelectAll={toggleSelectAll}
            onViewStudent={openViewModal}
            onEditStudent={openEditModal}
            onDeleteStudent={handleDeleteStudent}
            onAddStudent={openAddModal}
            pagination={pagination}
            displayFrom={displayFrom}
            displayTo={displayTo}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            searchTerm={searchTerm}
          />
        </div>
      </div>

      {/* Modals */}
      <StudentViewModal
        isOpen={modals.view}
        student={selectedStudent}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onClose={() => closeModal('view')}
      />

      <StudentFormModal
        isOpen={modals.edit}
        mode="edit"
        formData={formData}
        onFormChange={setFormData}
        classes={classes}
        onSubmit={handleUpdateStudent}
        onClose={() => closeModal('edit')}
      />

      <StudentFormModal
        isOpen={modals.add}
        mode="add"
        formData={formData}
        onFormChange={setFormData}
        classes={classes}
        onSubmit={handleAddStudent}
        onClose={() => closeModal('add')}
      />
    </div>
  );
}

export default TeacherStudentManagementPage;
