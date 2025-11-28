import React from 'react';
import { CheckCircle, XCircle, SquareCheckBig } from 'lucide-react';

export default function RegistrationBulkActions({
  selectedCount,
  totalCount,
  onSelectAll,
  onBulkApprove,
  onBulkReject,
  processing
}) {
  const disabled = processing || selectedCount === 0;

  return (
    <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-4 flex flex-wrap items-center gap-3">
      <button
        onClick={onSelectAll}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
      >
        <SquareCheckBig className="h-4 w-4" />
        {selectedCount === totalCount ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
      </button>

      <div className="flex items-center text-sm text-gray-600 font-medium">
        Đang chọn <span className="font-bold text-gray-900 mx-1">{selectedCount}</span> đăng ký
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={onBulkApprove}
          disabled={disabled}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold shadow hover:bg-emerald-600 disabled:opacity-50"
        >
          <CheckCircle className="h-4 w-4" />
          Duyệt đã chọn
        </button>
        {onBulkReject && (
          <button
            onClick={onBulkReject}
            disabled={disabled}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold shadow hover:bg-rose-600 disabled:opacity-50"
          >
            <XCircle className="h-4 w-4" />
            Từ chối đã chọn
          </button>
        )}
      </div>
    </div>
  );
}


