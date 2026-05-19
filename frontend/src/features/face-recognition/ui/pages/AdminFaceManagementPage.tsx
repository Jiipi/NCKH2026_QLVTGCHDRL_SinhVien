/**
 * AdminFaceManagementPage
 * =========================
 * Trang quản lý dữ liệu khuôn mặt cho Admin/Giảng viên
 * Tích hợp vào admin routes: /admin/face-management
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle2, Clock, ScanFace, Users, XCircle } from 'lucide-react';
import RolePageHero from '../../../../shared/components/common/RolePageHero';
import AppLoadingScreen from '../../../../shared/components/common/AppLoadingScreen';
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
  const location = useLocation();
  const [data, setData] = useState<AdminFaceListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const isTeacherRoute = location.pathname.startsWith('/teacher');

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
      <RolePageHero
        eyebrow={isTeacherRoute ? 'Không gian giảng viên' : 'Không gian quản trị'}
        title={isTeacherRoute ? 'Duyệt khuôn mặt sinh viên' : 'Quản lý khuôn mặt'}
        description="Duyệt và quản lý dữ liệu khuôn mặt đăng ký của sinh viên phục vụ điểm danh nhanh."
        heroIcon={ScanFace}
        metrics={[
          { icon: Users, label: 'Tổng hồ sơ', value: data?.total || 0, tone: 'text-indigo-600 dark:text-indigo-300' },
          { icon: Clock, label: 'Trang hiện tại', value: data ? `${data.page}/${data.totalPages}` : '0/0', tone: 'text-amber-600 dark:text-amber-300' },
          { icon: CheckCircle2, label: 'Đang hiển thị', value: data?.items?.length || 0, tone: 'text-emerald-600 dark:text-emerald-300' },
        ]}
        actions={(
          <>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-2xl border border-white/70 bg-white/60 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {statusFilter === 'pending' && data && data.items.filter(i => !i.daXacMinh).length > 0 && (
            <button
              onClick={handleVerifyAll}
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              <CheckCircle2 className="h-4 w-4" />
              Duyệt tất cả
            </button>
          )}
          </>
        )}
      />

      {/* Loading */}
      {loading && <AppLoadingScreen />}

      {/* Empty */}
      {!loading && data && data.items.length === 0 && (
        <div className="bg-white/80 rounded-[1.5rem] border border-white/60 p-12 text-center shadow-sm backdrop-blur-xl">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ScanFace className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-slate-500 font-semibold">
            {statusFilter === 'pending' ? 'Không có dữ liệu khuôn mặt chờ duyệt' : 'Không có dữ liệu khuôn mặt'}
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && data && data.items.length > 0 && (
        <div className="bg-white/90 rounded-[1.5rem] border border-white/60 shadow-sm overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 font-black uppercase tracking-[0.12em] text-xs text-slate-500">Sinh viên</th>
                  <th className="text-left px-5 py-3 font-black uppercase tracking-[0.12em] text-xs text-slate-500">Lớp</th>
                  <th className="text-center px-5 py-3 font-black uppercase tracking-[0.12em] text-xs text-slate-500">Ảnh</th>
                  <th className="text-center px-5 py-3 font-black uppercase tracking-[0.12em] text-xs text-slate-500">Trạng thái</th>
                  <th className="text-center px-5 py-3 font-black uppercase tracking-[0.12em] text-xs text-slate-500">Ngày ĐK</th>
                  <th className="text-center px-5 py-3 font-black uppercase tracking-[0.12em] text-xs text-slate-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-bold text-slate-950">{item.hoTen}</p>
                        <p className="text-xs text-slate-500">{item.mssv}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{item.lopTen || '—'}</td>
                    <td className="px-5 py-4 text-center">
                      {item.anhKhuonMat ? (
                        <button
                          onClick={() => setPreviewImage(item.anhKhuonMat)}
                          className="inline-block w-12 h-12 rounded-2xl overflow-hidden border border-slate-200 hover:border-emerald-500 transition"
                        >
                          <img src={item.anhKhuonMat} alt="Face" className="w-full h-full object-cover" />
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">Không có ảnh</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {item.daXacMinh ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Đã duyệt
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                          <Clock className="h-3.5 w-3.5" />
                          Chờ duyệt
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center text-slate-500 text-xs">
                      {new Date(item.ngayDangKy).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {!item.daXacMinh && (
                          <>
                            <button
                              onClick={() => handleVerify(item.id)}
                              disabled={actionLoading === item.id}
                              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-xs rounded-2xl hover:bg-emerald-700 transition disabled:opacity-50 font-bold"
                              title="Duyệt"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {actionLoading === item.id ? '...' : 'Duyệt'}
                            </button>
                            <button
                              onClick={() => handleReject(item.id)}
                              disabled={actionLoading === item.id}
                              className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-600 text-white text-xs rounded-2xl hover:bg-rose-700 transition disabled:opacity-50 font-bold"
                              title="Từ chối"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Từ chối
                            </button>
                          </>
                        )}
                        {item.daXacMinh && (
                          <span className="text-xs text-slate-400">—</span>
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
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 border border-slate-200 rounded-2xl text-sm font-semibold hover:bg-white disabled:opacity-50 transition"
              >
                ← Trước
              </button>
              <span className="text-sm text-slate-600 font-semibold">
                Trang {data.page} / {data.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page >= data.totalPages}
                className="px-3 py-1.5 border border-slate-200 rounded-2xl text-sm font-semibold hover:bg-white disabled:opacity-50 transition"
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
