/**
 * AdminFaceManagementPage
 * =========================
 * Trang quản lý dữ liệu khuôn mặt cho Admin/Giảng viên
 * Tích hợp vào admin routes: /admin/face-management
 */
import React, { useState, useEffect, useCallback } from 'react';
import { getAdminFaceRegistrations, verifyFaceData, rejectFaceData } from '../../services/faceApi';

interface FaceRegistrationItem {
  id: string;
  sinhVienId: string;
  mssv: string;
  hoTen: string;
  lopTen: string;
  daXacMinh: boolean;
  soAnhDangKy: number;
  anhKhuonMat: string | null;
  modelName: string | null;
  modelVersion: string | null;
  ngayDangKy: string;
  ngayCapNhat: string;
}

interface AdminFaceListResult {
  items: FaceRegistrationItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'verified', label: 'Đã duyệt' }
];

export const AdminFaceManagementPage: React.FC = () => {
  const [data, setData] = useState<AdminFaceListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const result = await getAdminFaceRegistrations({ status: statusFilter, page, limit: 15 });
    setData(result);
    setLoading(false);
  }, [statusFilter, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleVerify = async (faceDataId: string) => {
    if (!window.confirm('Xác minh dữ liệu khuôn mặt này?')) return;
    setActionLoading(faceDataId);
    const result = await verifyFaceData(faceDataId);
    if (result.success) {
      fetchData();
    } else {
      alert(result.message);
    }
    setActionLoading(null);
  };

  const handleReject = async (faceDataId: string) => {
    const reason = window.prompt('Lý do từ chối (tùy chọn):');
    if (reason === null) return; // User cancelled
    setActionLoading(faceDataId);
    const result = await rejectFaceData(faceDataId, reason || undefined);
    if (result.success) {
      fetchData();
    } else {
      alert(result.message);
    }
    setActionLoading(null);
  };

  const handleVerifyAll = async () => {
    if (!data?.items?.length) return;
    const pending = data.items.filter(item => !item.daXacMinh);
    if (!pending.length) return;
    if (!window.confirm(`Xác minh tất cả ${pending.length} dữ liệu khuôn mặt đang chờ?`)) return;
    setLoading(true);
    for (const item of pending) {
      await verifyFaceData(item.id);
    }
    fetchData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-800/50 rounded-xl">
              <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            Quản lý khuôn mặt
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Duyệt và quản lý dữ liệu khuôn mặt đăng ký của sinh viên
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Verify all button */}
          {statusFilter === 'pending' && data && data.items.filter(i => !i.daXacMinh).length > 0 && (
            <button
              onClick={handleVerifyAll}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Duyệt tất cả
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      {data && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>Tổng: <strong className="text-gray-900 dark:text-white">{data.total}</strong></span>
            <span>Trang {data.page}/{data.totalPages}</span>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-600 border-t-transparent" />
        </div>
      )}

      {/* Empty */}
      {!loading && data && data.items.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            {statusFilter === 'pending' ? 'Không có dữ liệu khuôn mặt chờ duyệt' : 'Không có dữ liệu khuôn mặt'}
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && data && data.items.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">Sinh viên</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">Lớp</th>
                  <th className="text-center px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">Ảnh</th>
                  <th className="text-center px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">Trạng thái</th>
                  <th className="text-center px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">Ngày ĐK</th>
                  <th className="text-center px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {data.items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.hoTen}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.mssv}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-700 dark:text-gray-300">{item.lopTen || '—'}</td>
                    <td className="px-5 py-4 text-center">
                      {item.anhKhuonMat ? (
                        <button
                          onClick={() => setPreviewImage(item.anhKhuonMat)}
                          className="inline-block w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600 hover:border-emerald-500 transition"
                        >
                          <img src={item.anhKhuonMat} alt="Face" className="w-full h-full object-cover" />
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">Không có ảnh</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {item.daXacMinh ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-semibold">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Đã duyệt
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-semibold">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          Chờ duyệt
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center text-gray-500 dark:text-gray-400 text-xs">
                      {new Date(item.ngayDangKy).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {!item.daXacMinh && (
                          <>
                            <button
                              onClick={() => handleVerify(item.id)}
                              disabled={actionLoading === item.id}
                              className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 font-medium"
                              title="Duyệt"
                            >
                              {actionLoading === item.id ? '...' : 'Duyệt'}
                            </button>
                            <button
                              onClick={() => handleReject(item.id)}
                              disabled={actionLoading === item.id}
                              className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition disabled:opacity-50 font-medium"
                              title="Từ chối"
                            >
                              Từ chối
                            </button>
                          </>
                        )}
                        {item.daXacMinh && (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 transition"
              >
                ← Trước
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Trang {data.page} / {data.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page >= data.totalPages}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 transition"
              >
                Tiếp →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Image preview modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <img
              src={previewImage}
              alt="Ảnh khuôn mặt"
              className="w-full rounded-2xl shadow-2xl"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="mt-4 w-full px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition text-sm"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFaceManagementPage;
