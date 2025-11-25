import React from 'react';

/**
 * CertificatesHeader Component - Header chứng nhận
 */
export default function CertificatesHeader({ certificates, totalPoints }) {
  return (
    <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-xl p-8 text-white">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Chứng nhận của tôi</h1>
          <p className="text-blue-100">Tổng hợp các chứng nhận hoạt động đã hoàn thành</p>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold">{certificates.length}</div>
            <div className="text-sm text-blue-100 mt-1">Chứng nhận</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{totalPoints.toFixed(1)}</div>
            <div className="text-sm text-blue-100 mt-1">Tổng điểm</div>
          </div>
        </div>
      </div>
    </div>
  );
}

