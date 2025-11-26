/**
 * Manage Activity Page
 * Page cho tạo/sửa hoạt động - dùng trực tiếp hook và shared components
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import { useManageActivity } from '../../../model/hooks/useManageActivity';
import { ActivityForm } from '../../shared/ActivityForm';
import Header from '../../../../../shared/components/layout/Header';
import ClassManagementLayout from '../../../../../shared/components/layout/ClassManagementLayout';
import { LoadingSpinner } from '../../../../../shared/components/common';

export default function ManageActivityPage() {
  const location = useLocation();
  const { 
    isEditMode,
    form,
    activityTypes,
    status,
    fieldErrors,
    handleFormChange,
    handleSubmit,
    semesterOptions,
    currentSemesterValue,
    handleSemesterChange,
  } = useManageActivity();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isMonitorRoute = location.pathname.startsWith('/monitor') || location.pathname.startsWith('/class');

  const heroHeader = (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-500 rounded-2xl border border-white/30 shadow-xl p-6 text-white">
      <p className="text-sm font-semibold uppercase tracking-wide opacity-80">
        {isEditMode ? 'Cập nhật hoạt động' : 'Tạo hoạt động mới'}
      </p>
      <h1 className="text-3xl font-bold mt-1">
        {isEditMode ? 'Chỉnh sửa hoạt động rèn luyện' : 'Tạo hoạt động rèn luyện cho lớp'}
      </h1>
      <p className="text-white/80 text-sm mt-2 max-w-3xl">
        {isEditMode
          ? 'Cập nhật thời gian, nội dung và điểm rèn luyện để hoạt động phản ánh chính xác thực tế.'
          : 'Điền thông tin chi tiết về học kỳ, năm học, điểm rèn luyện và nội dung hoạt động. Dữ liệu chính xác giúp quá trình duyệt và điểm danh diễn ra thuận lợi.'}
      </p>
      </div>
  );

  const formSection = (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      {status.loading ? (
        <LoadingSpinner text="Đang tải dữ liệu..." />
      ) : (
        <ActivityForm 
          form={form}
          activityTypes={activityTypes}
          onFormChange={handleFormChange}
          onSubmit={handleSubmit}
          fieldErrors={fieldErrors}
          status={status}
          isEditMode={isEditMode}
          semesterOptions={semesterOptions}
          currentSemesterValue={currentSemesterValue}
          onSemesterChange={handleSemesterChange}
        />
      )}
    </div>
  );

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-5xl mx-auto p-6 space-y-6">
          {heroHeader}
          {formSection}
        </main>
      </div>
    );
  }

  if (isMonitorRoute) {
    // Đã nằm trong MonitorLayout, không cần thêm header phụ để tránh chồng chéo
    return (
      <div className="space-y-6">
        {heroHeader}
        {formSection}
      </div>
    );
  }

  return (
    <ClassManagementLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {heroHeader}
        {formSection}
      </div>
    </ClassManagementLayout>
  );
}
