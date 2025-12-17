import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3, Activity, Award, Target } from 'lucide-react';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function ActivitiesChart({ data }) {
  const totalActivities = data.reduce((s, d) => s + d.count, 0);
  const totalPoints = data.reduce((s, d) => s + d.points, 0);
  console.log('📊 [Chart-Activities] Rendering with data:', data);

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="h-6 w-6" />
              <span className="text-sm font-medium opacity-90">Tổng hoạt động</span>
            </div>
            <div className="text-4xl font-bold">{totalActivities}</div>
            <div className="text-sm opacity-75 mt-1">hoạt động đã tổ chức</div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Award className="h-6 w-6" />
              <span className="text-sm font-medium opacity-90">Tổng điểm</span>
            </div>
            <div className="text-4xl font-bold">{totalPoints.toFixed(1)}</div>
            <div className="text-sm opacity-75 mt-1">điểm rèn luyện</div>
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

        {/* Stats Table */}
        <ActivitiesTable data={data} totalActivities={totalActivities} totalPoints={totalPoints} />
      </div>
    </div>
  );
}

function ActivitiesTable({ data, totalActivities, totalPoints }) {
  return (
    <div className="overflow-hidden rounded-xl border-2 border-gray-200">
      <table className="w-full">
        <thead>
          <tr className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
            <th className="px-6 py-4 text-left font-semibold">Loại hoạt động</th>
            <th className="px-6 py-4 text-center font-semibold">Số lượng</th>
            <th className="px-6 py-4 text-center font-semibold">Tỷ lệ</th>
            <th className="px-6 py-4 text-center font-semibold">Tổng điểm</th>
            <th className="px-6 py-4 text-center font-semibold">Điểm TB</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            const percentage = totalActivities > 0 ? ((item.count / totalActivities) * 100).toFixed(1) : 0;
            const avgPoints = item.count > 0 ? (item.points / item.count).toFixed(1) : 0;
            return (
              <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium text-gray-900">{item.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full font-bold">
                    {item.count}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-semibold text-gray-900">{percentage}%</span>
                    <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="font-bold text-emerald-600">{item.points.toFixed(1)}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-700">
                    {avgPoints}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-gray-100 font-bold">
            <td className="px-6 py-4 text-gray-900">TỔNG CỘNG</td>
            <td className="px-6 py-4 text-center text-indigo-600">{totalActivities}</td>
            <td className="px-6 py-4 text-center text-gray-900">100%</td>
            <td className="px-6 py-4 text-center text-emerald-600">{totalPoints.toFixed(1)}</td>
            <td className="px-6 py-4 text-center text-amber-600">
              {totalActivities > 0 ? (totalPoints / totalActivities).toFixed(1) : '0.0'}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

