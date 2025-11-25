import React from 'react';

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center" data-ref="student-profile-refactored">
      <div className="relative inline-block">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 border-r-indigo-600 absolute inset-0"></div>
      </div>
    </div>
  );
}

