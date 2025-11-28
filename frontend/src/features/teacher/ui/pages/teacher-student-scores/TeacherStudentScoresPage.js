import React, { useMemo, useState, useCallback } from 'react';
import { Trophy, Search, Filter, RefreshCw, ArrowUpDown } from 'lucide-react';
import { useTeacherStudentScores } from '../../../model/hooks/useTeacherStudentScores';

const RANK_COLORS = ['bg-yellow-100 text-yellow-800', 'bg-gray-100 text-gray-700', 'bg-amber-100 text-amber-700'];

export default function TeacherStudentScoresPage() {
  const { scores, loading, error, refresh } = useTeacherStudentScores();
  const [searchTerm, setSearchTerm] = useState('');
  const [classification, setClassification] = useState('all');
  const [sortBy, setSortBy] = useState('score-desc');

  const filteredScores = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return scores
      .filter((score) => {
        const matchesSearch =
          !term ||
          score.ho_ten?.toLowerCase().includes(term) ||
          score.mssv?.toLowerCase().includes(term) ||
          score.ten_lop?.toLowerCase().includes(term);
        const matchesClassification = classification === 'all' ? true : score.xep_loai?.toLowerCase() === classification;
        return matchesSearch && matchesClassification;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'score-asc':
            return (a.tong_diem || 0) - (b.tong_diem || 0);
          case 'activity-desc':
            return (b.tong_hoat_dong || 0) - (a.tong_hoat_dong || 0);
          case 'activity-asc':
            return (a.tong_hoat_dong || 0) - (b.tong_hoat_dong || 0);
          case 'name':
            return (a.ho_ten || '').localeCompare(b.ho_ten || '', 'vi');
          case 'score-desc':
          default:
            return (b.tong_diem || 0) - (a.tong_diem || 0);
        }
      });
  }, [scores, searchTerm, classification, sortBy]);

  const handleRefresh = useCallback(async () => {
    try {
      await refresh();
    } catch (err) {
      console.error(err);
    }
  }, [refresh]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Đang tải bảng điểm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <p className="text-lg font-semibold text-red-600">{error}</p>
        <button onClick={handleRefresh} className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-ref="teacher-student-scores-page">
      <ScoresHero total={scores.length} />

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, MSSV hoặc lớp..."
              className="block w-full pl-12 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Tất cả xếp loại</option>
              {['xuất sắc', 'tốt', 'khá', 'trung bình', 'yếu'].map((type) => (
                <option key={type} value={type}>{type.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-purple-500"
            >
              <option value="score-desc">Điểm giảm dần</option>
              <option value="score-asc">Điểm tăng dần</option>
              <option value="activity-desc">Số hoạt động giảm dần</option>
              <option value="activity-asc">Số hoạt động tăng dần</option>
              <option value="name">Tên A-Z</option>
            </select>
          </div>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold border border-gray-200 hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Sinh viên</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Lớp</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Điểm RL</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Hoạt động</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Xếp loại</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredScores.map((score, index) => (
              <tr key={score.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">
                  <RankBadge rank={index + 1} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">{score.ho_ten}</div>
                  <div className="text-xs font-mono text-gray-500">{score.mssv}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{score.ten_lop || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-lg font-black text-indigo-600">{Number(score.tong_diem || 0).toFixed(1)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-gray-700">{score.tong_hoat_dong || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100">
                    {score.xep_loai?.toUpperCase() || '—'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredScores.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>Không có dữ liệu phù hợp với bộ lọc hiện tại.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ScoresHero({ total }) {
  return (
    <div className="relative rounded-3xl overflow-hidden mb-2">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 2px, transparent 2px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 2px, transparent 2px)`,
          backgroundSize: '60px 60px'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

      <div className="relative z-10 px-6 sm:px-10 py-8 sm:py-12">
        <div className="backdrop-blur-md bg-white/5 border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-wrap items-center gap-6">
          <div className="flex-1">
            <p className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-2">Bảng điểm rèn luyện</p>
            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Theo dõi thành tích và xếp loại của sinh viên
            </h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/70">Tổng số sinh viên</p>
            <p className="text-4xl font-black text-white">{total}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RankBadge({ rank }) {
  if (rank > 3) {
    return <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">#{rank}</span>;
  }
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border border-transparent ${RANK_COLORS[rank - 1]}`}>
      #{rank}
    </span>
  );
}

