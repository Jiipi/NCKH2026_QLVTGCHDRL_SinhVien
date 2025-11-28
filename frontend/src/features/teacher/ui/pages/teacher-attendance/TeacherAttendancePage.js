import React, { useMemo, useState, useCallback } from 'react';
import { RefreshCw, Search, CheckCircle2, XCircle, Calendar, Award, MapPin, Users } from 'lucide-react';
import { useTeacherAttendance } from '../../../model/hooks/useTeacherAttendance';

const STATUS_CONFIG = {
  present: { label: 'Có mặt', badge: 'bg-emerald-50 text-emerald-600 border-emerald-200', button: 'bg-emerald-500 hover:bg-emerald-600' },
  absent: { label: 'Vắng', badge: 'bg-rose-50 text-rose-600 border-rose-200', button: 'bg-rose-500 hover:bg-rose-600' },
  excused: { label: 'Có phép', badge: 'bg-blue-50 text-blue-600 border-blue-200', button: 'bg-blue-500 hover:bg-blue-600' }
};
const STATUS_ORDER = ['present', 'absent', 'excused'];

export default function TeacherAttendancePage() {
  const { records, loading, error, refresh, updateAttendance } = useTeacherAttendance();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const filteredRecords = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return records
      .filter(record => {
        const matchesSearch =
          !term ||
          record.sinh_vien?.ho_ten?.toLowerCase().includes(term) ||
          record.sinh_vien?.mssv?.toLowerCase().includes(term) ||
          record.hoat_dong?.ten_hd?.toLowerCase().includes(term);
        const matchesStatus = statusFilter === 'all' ? true : record.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const dateA = new Date(a.ngay_diem_danh || a.hoat_dong?.ngay_bd || 0).getTime();
        const dateB = new Date(b.ngay_diem_danh || b.hoat_dong?.ngay_bd || 0).getTime();
        return dateB - dateA;
      });
  }, [records, searchTerm, statusFilter]);

  const handleUpdateStatus = useCallback(async (record, nextStatus) => {
    if (!record?.id || record.status === nextStatus) return;
    setUpdatingId(record.id);
    try {
      await updateAttendance(record.id, { status: nextStatus });
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  }, [updateAttendance]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Đang tải danh sách điểm danh...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <p className="text-lg font-semibold text-red-600">{error}</p>
        <button onClick={refresh} className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-ref="teacher-attendance-page">
      <AttendanceHero total={records.length} />

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên sinh viên, MSSV hoặc hoạt động..."
              className="block w-full pl-12 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {['all', ...STATUS_ORDER].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  statusFilter === status
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {status === 'all' ? 'Tất cả' : STATUS_CONFIG[status].label}
              </button>
            ))}
          </div>
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold border border-gray-200 hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </button>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
          <Users className="h-14 w-14 text-gray-300 mx-auto mb-3" />
          <p className="text-lg font-semibold text-gray-600">Không tìm thấy điểm danh nào phù hợp</p>
          <p className="text-sm text-gray-500">Thay đổi bộ lọc hoặc kiểm tra lại thời gian.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <AttendanceRecordCard
              key={record.id}
              record={record}
              updating={updatingId === record.id}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AttendanceHero({ total }) {
  return (
    <div className="relative mb-2 rounded-3xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 2px, transparent 2px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 2px, transparent 2px)`,
          backgroundSize: '50px 50px'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

      <div className="relative z-10 px-6 sm:px-10 py-8 sm:py-12">
        <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <p className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-2">Điểm danh hoạt động</p>
            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Theo dõi và cập nhật trạng thái tham gia
            </h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/70">Tổng lượt điểm danh</p>
            <p className="text-4xl font-black text-white">{total}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AttendanceRecordCard({ record, updating, onUpdateStatus }) {
  const activity = record.hoat_dong || {};
  const student = record.sinh_vien || {};
  const config = STATUS_CONFIG[record.status] || STATUS_CONFIG.present;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all" data-ref="attendance-record-card">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center">
              {student.ho_ten?.split(' ').pop()?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">{student.ho_ten || 'Không rõ tên'}</p>
              <p className="text-sm text-gray-500 font-mono">{student.mssv || 'N/A'}</p>
            </div>
          </div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${config.badge}`}>
            {config.label}
          </div>
        </div>

        <div className="flex-1 min-w-[240px] space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span>{activity.ten_hd || 'Hoạt động không xác định'}</span>
          </div>
          {activity.dia_diem && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-rose-500" />
              <span>{activity.dia_diem}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-yellow-500" />
            <span>Điểm: {activity.diem_rl || 0}</span>
          </div>
          {record.ngay_diem_danh && (
            <div className="text-xs text-gray-400">
              Điểm danh ngày {new Date(record.ngay_diem_danh).toLocaleDateString('vi-VN')}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 min-w-[220px]">
          {STATUS_ORDER.map((status) => (
            <button
              key={status}
              onClick={() => onUpdateStatus(record, status)}
              disabled={updating || record.status === status}
              className={`flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white transition ${STATUS_CONFIG[status].button} disabled:opacity-50`}
            >
              {status === 'present' ? <CheckCircle2 className="h-4 w-4" /> : status === 'absent' ? <XCircle className="h-4 w-4" /> : <Users className="h-4 w-4" />}
              {STATUS_CONFIG[status].label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

