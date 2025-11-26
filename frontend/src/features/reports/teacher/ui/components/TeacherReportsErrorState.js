import React from 'react';

export default function TeacherReportsErrorState({ error, onRetry }) {
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

