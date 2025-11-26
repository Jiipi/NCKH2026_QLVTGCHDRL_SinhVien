import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ReportsErrorState({ error, onRetry }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-2xl mx-auto mt-20">
        <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-red-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-100 rounded-2xl">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Không thể tải báo cáo</h2>
              <p className="text-gray-600 mt-1">{error}</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <h3 className="font-semibold text-amber-900 mb-2">💡 Giải pháp:</h3>
            <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
              <li>Kiểm tra bạn đã được gán vào lớp nào chưa</li>
              <li>Liên hệ admin để được gán làm lớp trưởng</li>
              <li>Đảm bảo tài khoản có role LOP_TRUONG</li>
            </ul>
          </div>
          <button
            onClick={onRetry}
            className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-5 w-5" />
            Thử lại
          </button>
        </div>
      </div>
    </div>
  );
}

