import React from 'react';
import { Edit2, Trash2, Award } from 'lucide-react';

export default function ActivityTypeList({ items, onEdit, onRemove }) {
  return (
    <div className="space-y-4">
      {items.map(item => (
        <div key={item.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden">
          <div className="flex flex-row">
            <div
              className="w-32 h-24 flex-shrink-0"
              style={{ backgroundColor: item.mau_sac || '#EEF2FF' }}
            ></div>
            <div className="flex-1 p-4 flex items-center justify-between min-w-0">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-1">
                  {item.ten_loai_hd}
                </h3>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">{item.mo_ta || 'Phẩm chất công dân'}</p>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 rounded-lg border border-indigo-100">
                    <Award className="h-3.5 w-3.5 text-indigo-600" />
                    <span className="text-xs text-gray-600 font-medium">Mặc định:</span>
                    <span className="text-sm font-semibold text-indigo-600">{item.diem_mac_dinh || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
                    <Award className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-xs text-gray-600 font-medium">Tối đa:</span>
                    <span className="text-sm font-semibold text-emerald-600">{item.diem_toi_da || 10}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0 ml-4">
                <button
                  onClick={() => onEdit(item)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-semibold min-w-[90px]"
                >
                  <Edit2 className="h-4 w-4" />
                  Sửa
                </button>
                <button
                  onClick={() => onRemove(item.id)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition text-sm font-semibold min-w-[90px]"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
