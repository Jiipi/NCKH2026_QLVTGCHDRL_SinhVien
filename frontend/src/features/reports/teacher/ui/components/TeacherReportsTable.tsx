import React from 'react';
import { Calendar, Award } from 'lucide-react';

interface ActivityType {
  name?: string;
  count?: number;
  points?: number;
}

interface TopStudent {
  rank?: number;
  id?: string;
  name?: string;
  mssv?: string;
  points?: number;
  activities?: number;
}

interface Props {
  activityTypes?: ActivityType[];
  topStudents?: TopStudent[];
}

export default function TeacherReportsTable({ activityTypes = [], topStudents = [] }: Props) {
  const types = (activityTypes || []).filter(t => (t.count || 0) > 0);
  const students = (topStudents || []).slice(0, 10);

  const hasAny = types.length > 0 || students.length > 0;

  if (!hasAny) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Báo cáo chi tiết</h3>
        </div>
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-500 mb-2">Chưa có dữ liệu báo cáo</h4>
          <p className="text-gray-400">Dữ liệu báo cáo sẽ được hiển thị khi có hoạt động</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          Hoạt động theo loại
        </h3>
        {types.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center">Chưa có hoạt động nào</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-3 py-2">Loại hoạt động</th>
                  <th className="px-3 py-2 text-right">Số lượng</th>
                  <th className="px-3 py-2 text-right">Tổng điểm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {types.map((t, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium text-gray-800">{t.name}</td>
                    <td className="px-3 py-2 text-right text-gray-700">{t.count || 0}</td>
                    <td className="px-3 py-2 text-right text-indigo-600 font-semibold">{t.points || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          Sinh viên nổi bật
        </h3>
        {students.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center">Chưa có sinh viên nào tham gia</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">MSSV</th>
                  <th className="px-3 py-2">Họ tên</th>
                  <th className="px-3 py-2 text-right">Hoạt động</th>
                  <th className="px-3 py-2 text-right">Điểm RL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((s) => (
                  <tr key={s.id || s.mssv} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-bold text-gray-500">{s.rank}</td>
                    <td className="px-3 py-2 text-gray-700">{s.mssv}</td>
                    <td className="px-3 py-2 font-medium text-gray-800">{s.name}</td>
                    <td className="px-3 py-2 text-right text-gray-700">{s.activities || 0}</td>
                    <td className="px-3 py-2 text-right text-emerald-600 font-semibold">{s.points || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
