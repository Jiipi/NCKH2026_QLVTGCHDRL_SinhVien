import React from 'react';
import { Trophy, Medal } from 'lucide-react';

export default function ScoresRankingTable({ rankings = [] }) {
  if (!Array.isArray(rankings) || rankings.length === 0) return null;

  return (
    <section className="bg-white rounded-xl border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Bảng xếp hạng lớp</h3>
        <Trophy className="h-6 w-6 text-yellow-600" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Hạng</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">MSSV</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Họ tên</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Số HĐ</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Tổng điểm</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((student, index) => (
              <tr
                key={student.mssv || index}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${student.is_current_user ? 'bg-blue-50 font-semibold' : ''}`}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    {getMedalIcon(index)}
                    <span className={student.is_current_user ? 'text-blue-700' : 'text-gray-900'}>#{index + 1}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={student.is_current_user ? 'text-blue-700' : 'text-gray-600'}>{student.mssv}</span>
                </td>
                <td className="py-3 px-4">
                  <span className={student.is_current_user ? 'text-blue-900' : 'text-gray-900'}>
                    {student.ho_ten}
                    {student.is_current_user && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Bạn</span>}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={student.is_current_user ? 'text-blue-700' : 'text-gray-600'}>{student.so_hoat_dong}</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className={`font-bold ${getScoreColor(student.tong_diem, student.is_current_user)}`}>
                    {student.tong_diem} điểm
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
        <strong>Ghi chú:</strong> Bảng xếp hạng dựa trên tổng điểm rèn luyện của học kỳ này trong lớp.
      </p>
    </section>
  );
}

function getMedalIcon(index) {
  if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500 mr-2" />;
  if (index === 1) return <Medal className="h-5 w-5 text-gray-400 mr-2" />;
  if (index === 2) return <Medal className="h-5 w-5 text-orange-400 mr-2" />;
  return null;
}

function getScoreColor(score, isCurrentUser) {
  if (isCurrentUser) return 'text-blue-700';
  if (score >= 90) return 'text-yellow-600';
  if (score >= 80) return 'text-blue-600';
  if (score >= 65) return 'text-green-600';
  return 'text-gray-600';
}

