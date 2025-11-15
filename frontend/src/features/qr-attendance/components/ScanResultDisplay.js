import React from 'react';
import { CheckCircle, AlertCircle, Award, User, Clock } from 'lucide-react';

export default function ScanResultDisplay({ result, onReset }) {
  if (!result) return null;

  if (result.success) {
    return (
      <div className="text-center py-8">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-30"></div>
          <div className="relative bg-gradient-to-br from-green-400 to-green-600 rounded-full p-6">
            <CheckCircle className="w-16 h-16 text-white" />
          </div>
        </div>
        
        <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-3">
          Điểm Danh Thành Công! 🎉
        </h3>
        <p className="text-gray-600 mb-6">{result.message}</p>
        
        {result.data && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 text-left mb-6 space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-green-500 rounded-lg p-2"><Award className="h-5 w-5 text-white" /></div>
              <div>
                <p className="text-xs text-gray-500">Hoạt động</p>
                <p className="text-sm font-semibold text-gray-800">{result.data.activityName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-500 rounded-lg p-2"><User className="h-5 w-5 text-white" /></div>
              <div>
                <p className="text-xs text-gray-500">Phiên</p>
                <p className="text-sm font-semibold text-gray-800">{result.data.sessionName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-purple-500 rounded-lg p-2"><Clock className="h-5 w-5 text-white" /></div>
              <div>
                <p className="text-xs text-gray-500">Thời gian</p>
                <p className="text-sm font-semibold text-gray-800">{new Date(result.data.timestamp).toLocaleString('vi-VN')}</p>
              </div>
            </div>
          </div>
        )}

        <button onClick={onReset} className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition">
          Quét Mã Khác
        </button>
      </div>
    );
  }

  // Error Result
  return (
    <div className="text-center py-8">
      <div className="relative inline-block mb-6">
        <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-30"></div>
        <div className="relative bg-gradient-to-br from-red-400 to-red-600 rounded-full p-6">
          <AlertCircle className="w-16 h-16 text-white" />
        </div>
      </div>
      
      <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-3">
        Điểm Danh Thất Bại
      </h3>
      <p className="text-gray-600 mb-6">{result.message}</p>

      <button onClick={onReset} className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition">
        Thử Lại
      </button>
    </div>
  );
}

