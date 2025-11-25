import React from 'react';
import { useParams } from 'react-router-dom';
import { Download, Image as ImageIcon, File } from 'lucide-react';
import useStudentActivityDetail from '../model/hooks/useStudentActivityDetail';
import { getActivityImages } from '../../../shared/lib/activityImages';

export default function StudentActivityDetailPage() {
  const { id } = useParams();
  const { data, loading, err } = useStudentActivityDetail(id);

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (err) {
    return <div className="text-red-600">{err}</div>;
  }

  if (!data) {
    return <div>Không có dữ liệu</div>;
  }

  const start = data?.ngay_bd ? new Date(data.ngay_bd) : null;
  const end = data?.ngay_kt ? new Date(data.ngay_kt) : null;
  const now = new Date();
  const withinTime = start && end ? (start <= now && end >= now) || start > now : true;
  const canRegister = data?.trang_thai === 'da_duyet' && withinTime && !data?.is_registered;

  const activityImages = getActivityImages(data.hinh_anh, data.loai_hd?.ten_loai_hd || data.loai);
  const metadata = [
    { label: 'Loại hoạt động', value: data.loai || data.loai_hd?.ten_loai_hd || '—' },
    { label: 'Điểm rèn luyện', value: String(data.diem_rl || 0) },
    { label: 'Thời gian', value: data.ngay_bd || '—' },
    { label: 'Địa điểm', value: data.dia_diem || '—' },
    { label: 'SL tối đa', value: String(data.sl_toi_da || 0) },
  ];

  return (
    <div className="space-y-6" data-ref="student-activity-detail-refactored">
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">{data.ten_hd || data.name || 'Hoạt động'}</h1>
        <p className="mt-4 text-gray-700">{data.mo_ta || '—'}</p>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <ImageIcon size={20} className="text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Hình ảnh hoạt động</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activityImages.map((url, idx) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-xl border-2 border-gray-200 transition-all hover:border-indigo-500 hover:shadow-lg"
            >
              <img
                src={url}
                alt={`Hình ${idx + 1}`}
                className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="text-sm font-medium text-white">Xem ảnh</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {metadata.map((item) => (
            <MetaItem key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </section>

      {Array.isArray(data.tep_dinh_kem) && data.tep_dinh_kem.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <File size={20} className="text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Tệp đính kèm</h3>
          </div>
          <div className="space-y-2">
            {data.tep_dinh_kem.map((url) => {
              const filename = url.split('/').pop();
              const baseURL =
                typeof window !== 'undefined' && window.location
                  ? `${window.location.origin.replace(/\/$/, '')}/api`
                  : process.env.REACT_APP_API_URL || 'http://dacn_backend_dev:3001/api';
              const backendBase = baseURL.replace('/api', '');
              const downloadUrl = url.startsWith('http') ? url : `${backendBase}${url}`;

              return (
                <a
                  key={url}
                  href={downloadUrl}
                  download={filename}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-xl border-2 border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 transition-all hover:border-indigo-300 hover:shadow-md"
                >
                  <div className="rounded-lg bg-indigo-100 p-2 transition-colors group-hover:bg-indigo-200">
                    <Download size={20} className="text-indigo-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-gray-900">{filename}</div>
                    <div className="text-xs text-gray-500">Nhấn để tải xuống</div>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {data?.is_registered ? (
          <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
            {data.registration_status === 'da_duyet' ? 'Đã đăng ký (Đã duyệt)' : 'Đã đăng ký (Chờ duyệt)'}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
            {canRegister ? 'Chưa đăng ký' : 'Không thể đăng ký'}
          </span>
        )}
      </section>
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div className="rounded-lg border bg-gray-50 p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
