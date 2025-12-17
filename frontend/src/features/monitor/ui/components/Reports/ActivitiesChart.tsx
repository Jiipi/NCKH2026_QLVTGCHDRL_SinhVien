import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3, Activity, Target } from 'lucide-react';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

/**
 * ActivitiesChart Component - Biểu đồ phân loại hoạt động
 */
export default function ActivitiesChart({ data: activityTypes = [], totalActivities = 0 }) {
  const data = activityTypes || [];

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-indigo-600" />
        Phân Loại Hoạt Động Theo Loại
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Thống kê số lượng và điểm trung bình của các loại hoạt động
      </p>
      
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="h-6 w-6" />
              <span className="text-sm font-medium opacity-90">Tổng hoạt động</span>
            </div>
            <div className="text-4xl font-bold">{totalActivities}</div>
            <div className="text-sm opacity-75 mt-1">hoạt động đã đăng ký và duyệt</div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Target className="h-6 w-6" />
              <span className="text-sm font-medium opacity-90">Số loại</span>
            </div>
            <div className="text-4xl font-bold">{data.length}</div>
            <div className="text-sm opacity-75 mt-1">loại hoạt động</div>
          </div>
        </div>

        {/* Bar Chart */}
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={data}
            margin={{ top: 30, right: 30, left: 80, bottom: 80 }}
            barGap={15}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12, fill: '#374151', fontWeight: 500 }}
              axisLine={{ stroke: '#D1D5DB', strokeWidth: 2 }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              label={{ 
                value: 'Số hoạt động', 
                angle: -90, 
                position: 'insideLeft', 
                style: { fontSize: 13, fill: '#374151', fontWeight: 600 } 
              }}
              axisLine={{ stroke: '#D1D5DB', strokeWidth: 2 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '2px solid #E5E7EB',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                padding: '12px'
              }}
              formatter={(value, name, props) => {
                if (name === 'count') {
                  const avgPoints = props.payload.points / props.payload.count;
                  return [
                    <>
                      <div><strong>{value}</strong> hoạt động</div>
                      <div className="text-sm text-gray-600">Điểm TB: {avgPoints.toFixed(1)}</div>
                    </>,
                    'Thống kê'
                  ];
                }
                return [value, name];
              }}
            />
            <Bar 
              dataKey="count" 
              radius={[10, 10, 0, 0]} 
              maxBarSize={100}
              label={({ x, y, width, value }) => (
                <text 
                  x={x + width / 2} 
                  y={y - 8} 
                  fill="#4B5563" 
                  textAnchor="middle" 
                  fontSize="14"
                  fontWeight="700"
                >
                  {value}
                </text>
              )}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

