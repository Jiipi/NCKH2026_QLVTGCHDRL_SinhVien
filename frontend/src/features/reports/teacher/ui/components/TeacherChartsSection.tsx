import React from 'react';
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
import { BarChart3, TrendingUp } from 'lucide-react';

interface MonthlyActivity {
  month: string;
  activities: number;
  participants: number;
}

interface PointsBucket {
  range?: string;
  name?: string;
  count?: number;
  value?: number;
  percentage?: number;
}

interface Props {
  monthlyActivities?: MonthlyActivity[];
  pointsDistribution?: PointsBucket[];
}

const PIE_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];

export default function TeacherChartsSection({ monthlyActivities = [], pointsDistribution = [] }: Props) {
  const monthly = (monthlyActivities || []).map(item => ({
    month: item.month,
    'Hoạt động': Number(item.activities) || 0,
    'Lượt tham gia': Number(item.participants) || 0,
  }));

  const points = (pointsDistribution || [])
    .map(item => ({
      name: item.range || item.name || '',
      value: Number(item.count ?? item.value ?? 0),
      percentage: Number(item.percentage ?? 0),
    }))
    .filter(p => p.value > 0);

  const hasMonthly = monthly.some(m => m['Hoạt động'] > 0 || m['Lượt tham gia'] > 0);
  const hasPoints = points.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Hoạt động theo tháng</h3>
        </div>
        {hasMonthly ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Hoạt động" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Lượt tham gia" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Chưa có hoạt động nào trong khoảng thời gian này</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Phân bố điểm rèn luyện</h3>
        </div>
        {hasPoints ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={points}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {points.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, _name, p: any) => [`${value} sinh viên (${p.payload.percentage}%)`, p.payload.name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Chưa có dữ liệu điểm rèn luyện</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
