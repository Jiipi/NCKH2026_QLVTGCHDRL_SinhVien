import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Users, Trophy, Star, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

const PARTICIPATION_COLORS = {
  '0-49': '#EF4444',    // Red - Yếu
  '50-64': '#F59E0B',   // Amber - Trung bình
  '65-79': '#10B981',   // Green - Khá
  '80-89': '#3B82F6',   // Blue - Tốt
  '90-100': '#8B5CF6',  // Purple - Xuất sắc
};

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

/**
 * ParticipationChart Component - Biểu đồ tỷ lệ tham gia
 */
export default function ParticipationChart({ data: pointsDistribution = [] }) {
  const data = pointsDistribution || [];
  const total = data.reduce((s, i) => s + (i?.count || 0), 0);

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <Users className="h-6 w-6 text-indigo-600" />
        Tỷ Lệ Tham Gia Hoạt Động Của Sinh Viên
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Phân bố sinh viên theo mức độ tham gia hoạt động trong học kỳ
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="relative">
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                nameKey="range"
                innerRadius={80}
                outerRadius={140}
                paddingAngle={3}
                dataKey="count"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={PARTICIPATION_COLORS[entry.range] || COLORS[index % COLORS.length]}
                    stroke="#fff"
                    strokeWidth={3}
                  />
                ))}
              </Pie>
              {/* Center label */}
              <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 16, fill: '#6B7280', fontWeight: 500 }}>
                Tổng số
              </text>
              <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 36, fill: '#111827', fontWeight: 700 }}>
                {total}
              </text>
              <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 14, fill: '#6B7280', fontWeight: 500 }}>
                sinh viên
              </text>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '2px solid #E5E7EB',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  padding: '12px'
                }}
                formatter={(value, name, props) => {
                  const item = props?.payload;
                  const pct = item?.percentage ?? (total ? ((value / total) * 100).toFixed(1) : 0);
                  return [`${value} SV (${pct}%)`, item?.range || name];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Stats Cards */}
        <div className="space-y-3">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <h4 className="font-bold text-gray-900">Xuất sắc (90-100 điểm)</h4>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-purple-600">
                {data.find(d => d.range === '90-100')?.count || 0}
              </span>
              <span className="text-sm text-gray-600">sinh viên</span>
              <span className="ml-auto text-lg font-semibold text-purple-600">
                {data.find(d => d.range === '90-100')?.percentage || 0}%
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Star className="h-5 w-5 text-white" />
              </div>
              <h4 className="font-bold text-gray-900">Tốt (80-89 điểm)</h4>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-blue-600">
                {data.find(d => d.range === '80-89')?.count || 0}
              </span>
              <span className="text-sm text-gray-600">sinh viên</span>
              <span className="ml-auto text-lg font-semibold text-blue-600">
                {data.find(d => d.range === '80-89')?.percentage || 0}%
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <h4 className="font-bold text-gray-900">Khá (65-79 điểm)</h4>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-green-600">
                {data.find(d => d.range === '65-79')?.count || 0}
              </span>
              <span className="text-sm text-gray-600">sinh viên</span>
              <span className="ml-auto text-lg font-semibold text-green-600">
                {data.find(d => d.range === '65-79')?.percentage || 0}%
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-amber-500 rounded-lg">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <h4 className="font-bold text-gray-900">Trung bình (50-64 điểm)</h4>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-amber-600">
                {data.find(d => d.range === '50-64')?.count || 0}
              </span>
              <span className="text-sm text-gray-600">sinh viên</span>
              <span className="ml-auto text-lg font-semibold text-amber-600">
                {data.find(d => d.range === '50-64')?.percentage || 0}%
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border-2 border-red-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-500 rounded-lg">
                <XCircle className="h-5 w-5 text-white" />
              </div>
              <h4 className="font-bold text-gray-900">Yếu (0-49 điểm)</h4>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-red-600">
                {data.find(d => d.range === '0-49')?.count || 0}
              </span>
              <span className="text-sm text-gray-600">sinh viên</span>
              <span className="ml-auto text-lg font-semibold text-red-600">
                {data.find(d => d.range === '0-49')?.percentage || 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

