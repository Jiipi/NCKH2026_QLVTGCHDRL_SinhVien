import React from 'react';
import { Tag, Plus } from 'lucide-react';

export default function ActivityTypeEmptyState({ search, onCreateClick }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-black transform translate-x-2 translate-y-2 rounded-2xl"></div>
      <div className="relative bg-white rounded-2xl border-4 border-black p-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="relative mb-6">
            <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto border-4 border-black">
              <Tag className="h-16 w-16 text-indigo-600" />
            </div>
            <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-4 border-black">
              <Plus className="h-6 w-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-3">
            {search ? 'Không tìm thấy kết quả' : 'Chưa có loại hoạt động nào'}
          </h3>
          <p className="text-gray-600 text-lg mb-8 font-medium">
            {search
              ? `Không tìm thấy loại hoạt động nào khớp với "${search}"`
              : 'Hãy tạo loại hoạt động đầu tiên để bắt đầu phân loại các hoạt động rèn luyện'}
          </p>
          {!search && (
            <button
              onClick={onCreateClick}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all border-4 border-black shadow-[8px_8px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] hover:translate-x-1 hover:translate-y-1 font-black text-lg"
            >
              <Plus className="h-6 w-6" />
              Tạo loại hoạt động mới
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
