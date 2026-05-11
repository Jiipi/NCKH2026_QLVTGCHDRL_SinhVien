import React from 'react';
import { AlertTriangle, CheckCircle, RefreshCw, ShieldAlert, XCircle } from 'lucide-react';
import { useAttendanceAudit } from '../model/useAttendanceAudit';

type Scope = 'admin' | 'monitor';

const actionLabels: Record<string, string> = {
  OPEN_QR_SESSION: 'Mở phiên QR',
  CREATE_QR_TOKEN: 'Tạo mã QR',
  SCAN_SUCCESS: 'Quét thành công',
  SCAN_FAILED: 'Quét thất bại',
  FALLBACK_REQUESTED: 'Gửi yêu cầu thủ công',
  FALLBACK_APPROVED: 'Duyệt yêu cầu thủ công',
  FALLBACK_REJECTED: 'Từ chối yêu cầu thủ công',
  FALLBACK_CANCELLED: 'Hủy yêu cầu thủ công'
};

const reasonLabels: Record<string, string> = {
  missing_token: 'Thiếu mã QR',
  invalid_token: 'Mã QR không hợp lệ',
  expired_token: 'Mã QR hết hạn',
  token_mismatch: 'Mã QR không khớp',
  duplicate_attendance: 'Điểm danh trùng',
  not_registered: 'Chưa đăng ký',
  registration_not_approved: 'Đăng ký chưa duyệt',
  outside_time_window: 'Ngoài thời gian',
  student_not_found: 'Không phải sinh viên',
  missing_gps: 'Thiếu GPS',
  low_gps_accuracy: 'GPS sai số cao',
  outside_geofence: 'Ngoài vùng điểm danh',
  geofence_passed: 'GPS hợp lệ',
  fallback_requested: 'Gửi yêu cầu thủ công',
  fallback_approved: 'Duyệt yêu cầu thủ công',
  fallback_rejected: 'Từ chối yêu cầu thủ công',
  fallback_cancelled: 'Hủy yêu cầu thủ công'
};

function formatDate(value?: string) {
  if (!value) return '-';
  return new Date(value).toLocaleString('vi-VN');
}

function getStudentName(item: any) {
  const name = item?.sinh_vien?.nguoi_dung?.ho_ten;
  const mssv = item?.sinh_vien?.mssv;
  if (!name && !mssv) return '-';
  return `${name || 'Sinh viên'}${mssv ? ` (${mssv})` : ''}`;
}

function StatCard({ title, value, icon, tone }: { title: string; value: any; icon: React.ReactNode; tone: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value || 0}</p>
        </div>
        <div className={`rounded-lg p-3 ${tone}`}>{icon}</div>
      </div>
    </div>
  );
}

export default function AttendanceAuditPage({ scope = 'admin' }: { scope?: Scope }) {
  const { filters, data, loading, error, updateFilter, clearFilters, reload } = useAttendanceAudit(scope);
  const summary: any = data.summary || {};
  const pagination: any = data.pagination || {};

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Audit điểm danh</p>
          <h1 className="text-2xl font-bold text-slate-900">Lịch sử bất thường điểm danh</h1>
          <p className="text-sm text-slate-500">Theo dõi phiên QR, token QR và các lần quét thành công/thất bại.</p>
        </div>
        <button onClick={reload} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          <RefreshCw className="h-4 w-4" /> Làm mới
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <StatCard title="Tổng event" value={summary.totalEvents} icon={<ShieldAlert className="h-5 w-5 text-blue-700" />} tone="bg-blue-50" />
        <StatCard title="Quét thành công" value={summary.successfulScans} icon={<CheckCircle className="h-5 w-5 text-emerald-700" />} tone="bg-emerald-50" />
        <StatCard title="Quét thất bại" value={summary.failedScans} icon={<XCircle className="h-5 w-5 text-red-700" />} tone="bg-red-50" />
        <StatCard title="Điểm danh trùng" value={summary.duplicateAttemptCount} icon={<AlertTriangle className="h-5 w-5 text-amber-700" />} tone="bg-amber-50" />
        <StatCard title="IP đáng nghi" value={summary.suspiciousIpCount} icon={<ShieldAlert className="h-5 w-5 text-purple-700" />} tone="bg-purple-50" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-8">
          <input value={filters.q} onChange={(e) => updateFilter('q', e.target.value)} placeholder="Tìm tên, MSSV, hoạt động..." className="rounded-lg border border-slate-200 px-3 py-2 text-sm lg:col-span-2" />
          <select value={filters.action} onChange={(e) => updateFilter('action', e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">Hành động</option>
            <option value="OPEN_QR_SESSION">Mở phiên QR</option>
            <option value="CREATE_QR_TOKEN">Tạo mã QR</option>
            <option value="SCAN_SUCCESS">Quét thành công</option>
            <option value="SCAN_FAILED">Quét thất bại</option>
            <option value="FALLBACK_REQUESTED">Gửi yêu cầu thủ công</option>
            <option value="FALLBACK_APPROVED">Duyệt yêu cầu thủ công</option>
            <option value="FALLBACK_REJECTED">Từ chối yêu cầu thủ công</option>
            <option value="FALLBACK_CANCELLED">Hủy yêu cầu thủ công</option>
          </select>
          <select value={filters.result} onChange={(e) => updateFilter('result', e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">Kết quả</option>
            <option value="success">Thành công</option>
            <option value="failed">Thất bại</option>
          </select>
          <select value={filters.reason} onChange={(e) => updateFilter('reason', e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">Lý do</option>
            {Object.entries(reasonLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <input value={filters.ip} onChange={(e) => updateFilter('ip', e.target.value)} placeholder="IP" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input type="date" value={filters.from} onChange={(e) => updateFilter('from', e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <button onClick={clearFilters} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Xóa lọc</button>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3">Hành động</th>
                <th className="px-4 py-3">Kết quả</th>
                <th className="px-4 py-3">Lý do</th>
                <th className="px-4 py-3">Sinh viên</th>
                <th className="px-4 py-3">Hoạt động</th>
                <th className="px-4 py-3">Người thực hiện</th>
                <th className="px-4 py-3">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-500">Đang tải...</td></tr>
              ) : data.items.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-500">Chưa có log điểm danh</td></tr>
              ) : data.items.map((item: any) => {
                const failed = item.ket_qua === 'failed';
                return (
                  <tr key={item.id} className={failed ? 'bg-red-50/40' : 'hover:bg-slate-50'}>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">{formatDate(item.thoi_gian)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{actionLabels[item.hanh_dong] || item.hanh_dong}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${failed ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {failed ? 'Thất bại' : 'Thành công'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{reasonLabels[item.ly_do] || item.ly_do || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{getStudentName(item)}</td>
                    <td className="px-4 py-3 text-slate-700">{item?.hoat_dong?.ten_hd || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{item?.nguoi_thuc_hien?.ho_ten || item?.nguoi_thuc_hien?.ten_dn || '-'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{item.dia_chi_ip || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
          <span>Trang {pagination.page || 1}/{pagination.totalPages || 1} · {pagination.total || 0} log</span>
          <div className="flex gap-2">
            <button disabled={(pagination.page || 1) <= 1} onClick={() => updateFilter('page', (pagination.page || 1) - 1)} className="rounded-lg border px-3 py-1 disabled:opacity-50">Trước</button>
            <button disabled={(pagination.page || 1) >= (pagination.totalPages || 1)} onClick={() => updateFilter('page', (pagination.page || 1) + 1)} className="rounded-lg border px-3 py-1 disabled:opacity-50">Sau</button>
          </div>
        </div>
      </div>
    </div>
  );
}
