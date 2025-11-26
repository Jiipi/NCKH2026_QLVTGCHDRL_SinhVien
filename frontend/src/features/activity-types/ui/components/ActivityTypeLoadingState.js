import React from 'react';

export default function ActivityTypeLoadingState() {
  return (
    <div className="flex justify-center items-center h-96">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200"></div>
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent absolute top-0 left-0"></div>
      </div>
    </div>
  );
}

