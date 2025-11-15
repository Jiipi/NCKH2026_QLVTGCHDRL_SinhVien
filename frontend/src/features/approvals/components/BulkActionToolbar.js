import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function BulkActionToolbar({ 
    selectedCount,
    totalCount,
    onSelectAll,
    onClearSelection,
    onBulkApprove,
    isProcessing
}) {
    if (totalCount === 0) return null;

    const allSelected = selectedCount > 0 && selectedCount === totalCount;

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-white/50 rounded-lg px-3 py-2 transition-all">
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={onSelectAll}
                            className="w-5 h-5 rounded border-2 cursor-pointer accent-blue-600"
                        />
                        <span className="font-semibold text-gray-700">Chọn tất cả ({totalCount})</span>
                    </label>
                    {selectedCount > 0 && (
                        <span className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-bold shadow-md animate-pulse">
                            ✓ Đã chọn: {selectedCount}
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    {selectedCount > 0 ? (
                        <>
                            <button
                                onClick={onClearSelection}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            >
                                Bỏ chọn
                            </button>
                            <button
                                onClick={onBulkApprove}
                                disabled={isProcessing}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold shadow-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                            >
                                <CheckCircle size={18} />
                                {isProcessing ? 'Đang xử lý...' : `Phê duyệt (${selectedCount})`}
                            </button>
                        </>
                    ) : (
                        <div className="text-sm text-gray-500 italic">
                            ← Chọn các đăng ký để phê duyệt hàng loạt
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
