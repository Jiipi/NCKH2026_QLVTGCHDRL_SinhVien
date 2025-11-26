import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Trophy, Star, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
const PARTICIPATION_COLORS = {
  '0-49': '#EF4444',
  '50-64': '#F59E0B',
  '65-79': '#10B981',
  '80-89': '#3B82F6',
  '90-100': '#8B5CF6',
};

export default function ParticipationChart({ data }) {
  const total = data.reduce((s, i) => s + (i?.count || 0), 0);
  console.log('📊 [Chart-Participation] Rendering with data:', data);

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
          <StatCard 
            icon={Trophy} 
            title="Xuất sắc (90-100 điểm)" 
            count={data.find(d => d.range === '90-100')?.count || 0}
            percentage={data.find(d => d.range === '90-100')?.percentage || 0}
            colorClass="purple"
          />
          <StatCard 
            icon={Star} 
            title="Tốt (80-89 điểm)" 
            count={data.find(d => d.range === '80-89')?.count || 0}
            percentage={data.find(d => d.range === '80-89')?.percentage || 0}
            colorClass="blue"
          />
          <StatCard 
            icon={CheckCircle2} 
            title="Khá (65-79 điểm)" 
            count={data.find(d => d.range === '65-79')?.count || 0}
            percentage={data.find(d => d.range === '65-79')?.percentage || 0}
            colorClass="green"
          />
          <StatCard 
            icon={AlertCircle} 
            title="Trung bình (50-64 điểm)" 
            count={data.find(d => d.range === '50-64')?.count || 0}
            percentage={data.find(d => d.range === '50-64')?.percentage || 0}
            colorClass="amber"
          />
          <StatCard 
            icon={XCircle} 
            title="Yếu (0-49 điểm)" 
            count={data.find(d => d.range === '0-49')?.count || 0}
            percentage={data.find(d => d.range === '0-49')?.percentage || 0}
            colorClass="red"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, count, percentage, colorClass }) {
  const colorStyles = {
    purple: { bg: 'from-purple-50 to-indigo-50', border: 'border-purple-200', iconBg: 'bg-purple-500', text: 'text-purple-600' },
    blue: { bg: 'from-blue-50 to-cyan-50', border: 'border-blue-200', iconBg: 'bg-blue-500', text: 'text-blue-600' },
    green: { bg: 'from-green-50 to-emerald-50', border: 'border-green-200', iconBg: 'bg-green-500', text: 'text-green-600' },
    amber: { bg: 'from-amber-50 to-orange-50', border: 'border-amber-200', iconBg: 'bg-amber-500', text: 'text-amber-600' },
    red: { bg: 'from-red-50 to-rose-50', border: 'border-red-200', iconBg: 'bg-red-500', text: 'text-red-600' },
  };
  const style = colorStyles[colorClass];

  return (
    <div className={`bg-gradient-to-br ${style.bg} rounded-xl p-4 border-2 ${style.border}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 ${style.iconBg} rounded-lg`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <h4 className="font-bold text-gray-900">{title}</h4>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-bold ${style.text}`}>{count}</span>
        <span className="text-sm text-gray-600">sinh viên</span>
        <span className={`ml-auto text-lg font-semibold ${style.text}`}>{percentage}%</span>
      </div>
    </div>
  );
}

