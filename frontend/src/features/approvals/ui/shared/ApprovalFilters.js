import React, { useState } from 'react';
import { Search, SlidersHorizontal, Filter, RefreshCw, X } from 'lucide-react';

export default function ApprovalFilters({ 
    searchTerm, onSearchTermChange,
    filters, onFiltersChange,
    activityTypes,
    sortBy,
    onSortChange,
}) {
    const [showAdvanced, setShowAdvanced] = useState(false);

    const activeFilterCount = Object.values(filters).filter(v => v).length;

    const clearAllFilters = () => {
        onSearchTermChange('');
        onFiltersChange({ type: '', from: '', to: '', minPoints: '', maxPoints: '', mssv: '' });
    };

    return (
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm p-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Tìm sinh viên, MSSV, hoạt động..."
                    value={searchTerm}
                    onChange={(e) => onSearchTermChange(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                />
            </div>

            {/* Filter Toggle and Actions */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                    <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium border-2 border-gray-200 transition">
                        <SlidersHorizontal size={16} />
                        <span>Lọc nâng cao</span>
                        {activeFilterCount > 0 && <span className="px-2 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-full">{activeFilterCount}</span>}
                    </button>
                    {activeFilterCount > 0 && (
                        <button onClick={clearAllFilters} className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium border-2 border-red-200 transition">
                            <RefreshCw size={16} />
                            <span>Xóa lọc</span>
                        </button>
                    )}
                </div>
                
                {/* Sort Dropdown */}
                {sortBy !== undefined && onSortChange && (
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Sắp xếp:</span>
                        <select
                            value={sortBy || 'newest'}
                            onChange={(e) => onSortChange?.(e.target.value)}
                            className="px-3 py-2 text-sm border-2 border-gray-200 rounded-xl bg-white hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer font-medium text-gray-700"
                        >
                            <option value="newest">Mới nhất</option>
                            <option value="oldest">Cũ nhất</option>
                            <option value="name-az">Tên A → Z</option>
                            <option value="name-za">Tên Z → A</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Advanced Filters Panel */}
            {showAdvanced && (
                <div className="p-4 bg-gray-50 rounded-lg border-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select value={filters.type} onChange={e => onFiltersChange({...filters, type: e.target.value})} className="w-full p-2 border rounded-md">
                            <option value="">Tất cả loại hoạt động</option>
                            {activityTypes.map(type => <option key={type.id} value={type.id}>{type.ten_loai_hd}</option>)}
                        </select>
                        <input type="text" value={filters.mssv} onChange={e => onFiltersChange({...filters, mssv: e.target.value})} placeholder="Lọc theo MSSV" className="w-full p-2 border rounded-md" />
                        <input type="date" value={filters.from} onChange={e => onFiltersChange({...filters, from: e.target.value})} className="w-full p-2 border rounded-md" />
                    </div>
                </div>
            )}
        </div>
    );
}

