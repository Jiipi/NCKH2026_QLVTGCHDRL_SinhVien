import React from 'react';
import { useLocation } from 'react-router-dom';
import { useManageActivity } from '../hooks/useManageActivity';
import { ActivityForm } from '../components/ActivityForm';
import { Header } from '../../../shared/components/layout/Header';
import ClassManagementLayout from '../../../shared/components/layout/ClassManagementLayout';
import { LoadingSpinner } from '../../../shared/components/common';

export default function ManageActivityPage() {
  const location = useLocation();
  const { 
    isEditMode, form, activityTypes, status, 
    fieldErrors, handleFormChange, handleSubmit 
  } = useManageActivity();

  const isAdminRoute = location.pathname.startsWith('/admin');

  const formCard = (
    <div className="max-w-3xl mx-auto bg-white border rounded-xl p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Chỉnh sửa hoạt động' : 'Tạo hoạt động mới'}</h2>
        <p className="text-gray-600 mt-1">{isEditMode ? 'Cập nhật thông tin chi tiết cho hoạt động.' : 'Điền thông tin để tạo một hoạt động rèn luyện mới.'}</p>
      </div>
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
        />
      )}
    </div>
  );

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-5xl mx-auto p-6">
          {formCard}
        </main>
      </div>
    );
  }

  // Default to Monitor layout
  return (
    <ClassManagementLayout>
      {formCard}
    </ClassManagementLayout>
  );
}