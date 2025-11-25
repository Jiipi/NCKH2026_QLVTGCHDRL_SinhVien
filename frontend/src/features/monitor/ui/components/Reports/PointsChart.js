import React from 'react';
import { LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts';
import { Award, Users, Activity, TrendingUp, Target } from 'lucide-react';

/**
 * PointsChart Component - Biểu đồ điểm rèn luyện
 */
export default function PointsChart({ attendanceData = [], monthlyData = [], overview = {} }) {
  // Combine data for dual-axis chart
  const combinedData = monthlyData.map(month => {
    const attendance = attendanceData.find(a => a.month === month.month.split('/')[0]) || {};
    return {
      month: month.month,
      activities: month.activities,
      participants: month.participants,
      rate: attendance.rate || 0
    };
  });

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <Award className="h-6 w-6 text-indigo-600" />
        Điểm Rèn Luyện Trung Bình Lớp
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Xu hướng điểm rèn luyện và tỷ lệ tham gia theo thời gian
      </p>
      
      <div className="space-y-6">
        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl p-6 text-white text-center">
            <Award className="h-10 w-10 mx-auto mb-3" />
            <div className="text-4xl font-bold mb-1">{overview.avgPoints || 0}</div>
            <div className="text-sm opacity-90">Điểm TB lớp</div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl p-6 text-white text-center">
            <Users className="h-10 w-10 mx-auto mb-3" />
            <div className="text-4xl font-bold mb-1">{overview.participationRate || 0}%</div>
            <div className="text-sm opacity-90">Tỷ lệ tham gia</div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-6 text-white text-center">
            <Activity className="h-10 w-10 mx-auto mb-3" />
            <div className="text-4xl font-bold mb-1">{overview.totalActivities || 0}</div>
            <div className="text-sm opacity-90">Tổng hoạt động</div>
          </div>
          
          <div className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl p-6 text-white text-center">
            <TrendingUp className="h-10 w-10 mx-auto mb-3" />
            <div className="text-4xl font-bold mb-1">{overview.totalStudents || 0}</div>
            <div className="text-sm opacity-90">Tổng sinh viên</div>
          </div>
        </div>

        {/* Dual-Axis Chart */}
        <ResponsiveContainer width="100%" height={450}>
          <LineChart 
            data={combinedData}
            margin={{ top: 40, right: 60, left: 20, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="#6B7280"
              tick={{ fontSize: 13, fill: '#374151', fontWeight: 500 }}
              height={60}
              axisLine={{ stroke: '#D1D5DB', strokeWidth: 2 }}
            />
            <YAxis 
              yAxisId="left"
              stroke="#6B7280"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              label={{ 
                value: 'Số lượng', 
                angle: -90, 
                position: 'insideLeft', 
                style: { fontSize: 13, fill: '#374151', fontWeight: 600 } 
              }}
              axisLine={{ stroke: '#D1D5DB', strokeWidth: 2 }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#6B7280"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              label={{ 
                value: 'Tỷ lệ (%)', 
                angle: 90, 
                position: 'insideRight', 
                style: { fontSize: 13, fill: '#374151', fontWeight: 600 } 
              }}
              domain={[0, 100]}
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
              labelStyle={{ fontWeight: 600, color: '#111827', marginBottom: '8px' }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
              iconSize={20}
            />
            
            {/* Area for participation rate */}
            <defs>
              <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#6366F1" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <Area 
              yAxisId="right"
              type="monotone" 
              dataKey="rate" 
              fill="url(#rateGradient)" 
              stroke="none"
            />
            
            {/* Line for participation rate */}
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="rate" 
              stroke="#6366F1" 
              strokeWidth={4}
              dot={{ fill: '#6366F1', r: 7, strokeWidth: 3, stroke: '#fff' }}
              name="Tỷ lệ tham gia (%)"
              label={({ x, y, value }) => {
                if (!value) return null;
                return (
                  <g>
                    <rect 
                      x={x - 22} 
                      y={y - 26} 
                      width={44} 
                      height={22} 
                      fill="#6366F1" 
                      rx={6}
                      opacity={0.95}
                    />
                    <text 
                      x={x} 
                      y={y - 12} 
                      fill="white" 
                      textAnchor="middle" 
                      dominantBaseline="middle"
                      fontSize="13"
                      fontWeight="700"
                    >
                      {value}%
                    </text>
                  </g>
                );
              }}
            />
            
            {/* Bar for activities */}
            <Bar 
              yAxisId="left"
              dataKey="activities" 
              fill="#10B981"
              radius={[8, 8, 0, 0]}
              name="Số hoạt động"
              maxBarSize={60}
              label={({ x, y, width, value }) => (
                <text 
                  x={x + width / 2} 
                  y={y - 8} 
                  fill="#059669" 
                  textAnchor="middle" 
                  fontSize="13"
                  fontWeight="700"
                >
                  {value}
                </text>
              )}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Phân tích xu hướng
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Tỷ lệ tham gia trung bình: <strong>{overview.participationRate || 0}%</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Điểm rèn luyện TB: <strong>{overview.avgPoints || 0} điểm</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Số hoạt động đã tổ chức: <strong>{overview.totalActivities || 0}</strong></span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-amber-600" />
              Đánh giá chung
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Hoạt động</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  (overview.totalActivities || 0) >= 10 
                    ? 'bg-green-100 text-green-700' 
                    : (overview.totalActivities || 0) >= 5
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                }`}>
                  {(overview.totalActivities || 0) >= 10 ? 'Tốt' : (overview.totalActivities || 0) >= 5 ? 'Trung bình' : 'Cần cải thiện'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Tham gia</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  (overview.participationRate || 0) >= 70 
                    ? 'bg-green-100 text-green-700' 
                    : (overview.participationRate || 0) >= 50
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                }`}>
                  {(overview.participationRate || 0) >= 70 ? 'Tốt' : (overview.participationRate || 0) >= 50 ? 'Trung bình' : 'Cần cải thiện'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Điểm TB</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  (overview.avgPoints || 0) >= 70 
                    ? 'bg-green-100 text-green-700' 
                    : (overview.avgPoints || 0) >= 50
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                }`}>
                  {(overview.avgPoints || 0) >= 70 ? 'Tốt' : (overview.avgPoints || 0) >= 50 ? 'Trung bình' : 'Cần cải thiện'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

