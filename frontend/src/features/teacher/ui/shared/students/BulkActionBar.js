/**
 * BulkActionBar Component
 * =======================
 * Tier 1 - UI Component (SOLID: Single Responsibility)
 * 
 * Actions bar for bulk operations on selected students
 * 
 * @module features/teacher/ui/components/students/BulkActionBar
 */

import React from 'react';
import { CheckCircle, Trash2 } from 'lucide-react';

/**
 * BulkActionBar - Bulk operations toolbar
 * @param {Object} props
 * @param {number} props.selectedCount - Number of selected items
 * @param {Function} props.onBulkDelete - Bulk delete handler
 * @param {Function} props.onClearSelection - Clear selection handler
 */
export function BulkActionBar({ selectedCount = 0, onBulkDelete, onClearSelection }) {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 flex items-center justify-between shadow-lg animate-fade-in">
      <div className="flex items-center gap-3 text-white">
        <CheckCircle className="w-5 h-5" />
        <span className="font-semibold">Đã chọn {selectedCount} sinh viên</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onBulkDelete}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Xóa đã chọn
        </button>
        <button
          onClick={onClearSelection}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors"
        >
          Bỏ chọn
        </button>
      </div>
    </div>
  );
}

export default BulkActionBar;
