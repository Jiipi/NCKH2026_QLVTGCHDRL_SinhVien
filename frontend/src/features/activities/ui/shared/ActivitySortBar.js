import React from 'react';
import { Filter } from 'lucide-react';

/**
 * ActivitySortBar - Thanh sắp xếp dùng chung
 *
 * Props:
 * - sortBy: 'newest' | 'oldest' | 'name-az' | 'name-za'
 * - onSortChange: (value) => void
 * - className?: string
 */
export default function ActivitySortBar({ sortBy, onSortChange, className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Filter className="h-4 w-4 text-gray-400" />
      <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Sắp xếp:</span>
      <select
        value={sortBy}
        onChange={(e) => onSortChange?.(e.target.value)}
        className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
      >
        <option value="newest">Mới nhất</option>
        <option value="oldest">Cũ nhất</option>
        <option value="name-az">Tên A-Z</option>
        <option value="name-za">Tên Z-A</option>
      </select>
    </div>
  );
}


