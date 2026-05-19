import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BarChart3, PieChart as PieIcon } from 'lucide-react';

interface ByStatusItem {
  trang_thai: string;
  _count?: { _all?: number };
}

interface DailyRegItem {
  ngay_dang_ky: string;
  _count?: { _all?: number };
}

interface Props {
  byStatus?: ByStatusItem[];
  dailyRegs?: DailyRegItem[];
}

const STATUS_LABEL: Record<string, string> = {
  cho_duyet: 'Chờ duyệt',
  da_duyet: 'Đã duyệt',
  tu_choi: 'Từ chối',
  da_tham_gia: 'Đã tham gia'
};
const STATUS_COLOR: Record<string, string> = {
  cho_duyet: '#f59e0b',
  da_duyet: '#10b981',
  tu_choi: '#ef4444',
  da_tham_gia: '#3b82f6'
};

export default function AdminReportsCharts({ byStatus = [], dailyRegs = [] }: Props) {
  const pieData = useMemo(() => {
    return (byStatus || [])
      .map((item) => ({
        name: STATUS_LABEL[item.trang_thai] || item.trang_thai,
        value: item._count?._all || 0,
        color: STATUS_COLOR[item.trang_thai] || '#94a3b8'
      }))
      .filter((d) => d.value > 0);
  }, [byStatus]);

  const dailyData = useMemo(() => {
    if (!dailyRegs?.length) return [];
    const grouped = new Map<string, number>();
    dailyRegs.forEach((item) => {
      const d = new Date(item.ngay_dang_ky);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      grouped.set(key, (grouped.get(key) || 0) + (item._count?._all || 0));
    });
    return Array.from(grouped.entries())
      .map(([date, count]) => ({
        date,
        label: date.slice(5),
        'Đăng ký': count
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30);
  }, [dailyRegs]);

  const hasPie = pieData.length > 0;
  const hasDaily = dailyData.length > 0;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
      <div className="rounded-2xl border border-white/60 bg-white/60 p-6 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/60">
        <div className="mb-4 flex items-center gap-2">
          <PieIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Phân bố trạng thái đăng ký</h3>
        </div>
        {hasPie ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {pieData.map((d, idx) => (
                    <Cell key={idx} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-slate-400">Chưa có dữ liệu trạng thái</p>
        )}
      </div>

      <div className="rounded-2xl border border-white/60 bg-white/60 p-6 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/60">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Lượt đăng ký 30 ngày gần nhất</h3>
        </div>
        {hasDaily ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="Đăng ký" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-slate-400">Chưa có dữ liệu đăng ký</p>
        )}
      </div>
    </div>
  );
}
