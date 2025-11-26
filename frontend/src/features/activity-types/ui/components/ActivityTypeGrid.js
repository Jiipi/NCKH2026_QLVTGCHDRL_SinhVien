import React from 'react';
import { Edit2, Trash2, Award } from 'lucide-react';

export default function ActivityTypeGrid({ items, onEdit, onRemove }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map(item => (
        <div key={item.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden">
          <div className="relative w-full h-32 overflow-hidden" style={{ backgroundColor: item.mau_sac || '#EEF2FF' }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-black/5 to-transparent" />
          </div>
          <div className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
              {item.ten_loai_hd}
            </h3>
            <p className="text-xs text-gray-600 line-clamp-2">{item.mo_ta || 'Phẩm chất công dân'}</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-indigo-50 rounded-lg p-2 border border-indigo-100">
                <div className="flex items-center gap-1 mb-0.5">
                  <Award className="h-3 w-3 text-indigo-600" />
                  <span className="text-xs text-gray-600 font-medium">Mặc định</span>
                </div>
                <p className="text-lg font-bold text-indigo-600">{item.diem_mac_dinh || 0}</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-2 border border-emerald-100">
                <div className="flex items-center gap-1 mb-0.5">
                  <Award className="h-3 w-3 text-emerald-600" />
                  <span className="text-xs text-gray-600 font-medium">Tối đa</span>
                </div>
                <p className="text-lg font-bold text-emerald-600">{item.diem_toi_da || 10}</p>
              </div>
            </div>
          </div>
          <div className="p-3 pt-0 flex gap-2 border-t border-gray-100">
            <button
              onClick={() => onEdit(item)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-xs font-semibold"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Sửa
            </button>
            <button
              onClick={() => onRemove(item.id)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition text-xs font-semibold"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Xóa
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
