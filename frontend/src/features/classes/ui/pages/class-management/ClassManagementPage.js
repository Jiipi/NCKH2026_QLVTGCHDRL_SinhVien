/**
 * ClassManagementPage (3-Tier Architecture)
 * 
 * Tier 1: Services - classesApi
 * Tier 2: Model - useClassManagement hook
 * Tier 3: UI - Shared components from shared/
 */

import React from 'react';
import { GraduationCap } from 'lucide-react';
import { useClassManagement } from '../../../model/hooks/useClassManagement';
import {
  LoadingState,
  EmptyState,
  ClassesSidebar,
  ClassInfoCard,
  StatisticsCards,
  AssignMonitorSection,
  StudentsList
} from '../../shared';

// Main Component
export default function ClassManagementPage() {
  const {
    classes,
    selectedClass,
    students,
    statistics,
    loading,
    assigningMonitor,
    selectedMonitorId,
    setSelectedMonitorId,
    selectClass,
    handleAssignMonitor
  } = useClassManagement();

  if (loading) return <LoadingState />;
  if (classes.length === 0) return (
    <EmptyState 
      icon={GraduationCap}
      title="Không có lớp phụ trách"
      message="Bạn chưa được gán làm chủ nhiệm lớp nào"
    />
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý lớp</h1>
        <p className="text-gray-600">Xem và quản lý các lớp phụ trách</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Classes Sidebar */}
        <div className="col-span-12 lg:col-span-4">
          <ClassesSidebar
            classes={classes}
            selectedClass={selectedClass}
            onSelectClass={selectClass}
          />
        </div>

        {/* Class Details */}
        <div className="col-span-12 lg:col-span-8">
          {selectedClass && (
            <div className="space-y-6">
              <ClassInfoCard selectedClass={selectedClass} />
              <StatisticsCards statistics={statistics} />
              <AssignMonitorSection
                students={students}
                selectedMonitorId={selectedMonitorId}
                onMonitorChange={setSelectedMonitorId}
                onAssign={handleAssignMonitor}
                assigning={assigningMonitor}
              />
              <StudentsList
                students={students}
                selectedMonitorId={selectedMonitorId}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
