import React, { useMemo, useState, useCallback } from 'react';
import { Trophy, Search, Filter, RefreshCw, ArrowUpDown, Users } from 'lucide-react';
import { useTeacherStudentScores } from '../../../model/hooks/useTeacherStudentScores';
import RolePageHero from '../../../../../shared/components/common/RolePageHero';
import AppLoadingScreen from '../../../../../shared/components/common/AppLoadingScreen';

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
    return <AppLoadingScreen />;
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 rounded-[2rem] border border-rose-200/70 bg-rose-50/70 text-center shadow-sm backdrop-blur-2xl dark:border-rose-400/20 dark:bg-rose-950/20">
        <p className="text-lg font-black text-rose-700 dark:text-rose-200">{error}</p>
        <button onClick={handleRefresh} className="rounded-2xl bg-rose-600 px-5 py-2 font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-rose-700">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-ref="teacher-student-scores-page">
      <ScoresHero total={scores.length} />

      <div className="space-y-4 rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, MSSV hoặc lớp..."
              className="block w-full rounded-2xl border border-white/70 bg-white/55 py-3 pl-12 pr-4 text-sm font-semibold text-slate-800 shadow-inner shadow-white/40 backdrop-blur-xl transition-all placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100/70 dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
              className="rounded-2xl border border-white/70 bg-white/55 px-3 py-2.5 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-xl transition-all focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
            >
              <option value="all">Tất cả xếp loại</option>
              {['xuất sắc', 'tốt', 'khá', 'trung bình', 'yếu'].map((type) => (
                <option key={type} value={type}>{type.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-2xl border border-white/70 bg-white/55 px-3 py-2.5 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-xl transition-all focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
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
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/70 bg-white/55 px-4 py-2.5 font-bold text-slate-700 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-white/75 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/60 dark:divide-white/10">
            <thead className="bg-white/45 dark:bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-300">#</th>
                <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-300">Sinh viên</th>
                <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-300">Lớp</th>
                <th className="px-6 py-3 text-center text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-300">Điểm RL</th>
                <th className="px-6 py-3 text-center text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-300">Hoạt động</th>
                <th className="px-6 py-3 text-center text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-300">Xếp loại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/50 dark:divide-white/10">
              {filteredScores.map((score, index) => (
                <tr key={score.id} className="transition hover:bg-white/55 dark:hover:bg-white/5">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    <RankBadge rank={index + 1} />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-black text-slate-900 dark:text-white">{score.ho_ten}</div>
                    <div className="font-mono text-xs text-slate-500 dark:text-slate-400">{score.mssv}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">{score.ten_lop || '—'}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-lg font-black text-indigo-600 dark:text-indigo-300">{Number(score.tong_diem || 0).toFixed(1)}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-bold text-slate-700 dark:text-slate-200">{score.tong_hoat_dong || 0}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <span className="inline-flex items-center rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-black text-purple-700 dark:border-purple-400/20 dark:bg-purple-400/10 dark:text-purple-200">
                      {score.xep_loai?.toUpperCase() || '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredScores.length === 0 && (
          <div className="m-5 rounded-[2rem] border border-dashed border-white/70 bg-white/45 py-12 text-center text-sm font-semibold text-slate-500 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            <p>Không có dữ liệu phù hợp với bộ lọc hiện tại.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ScoresHero({ total }) {
  return (
    <RolePageHero
      eyebrow="Không gian giảng viên"
      title="Theo dõi thành tích và xếp loại của sinh viên"
      description="Tra cứu điểm rèn luyện, số hoạt động tham gia và xếp loại theo từng lớp phụ trách."
      heroIcon={Trophy}
      metrics={[
        { icon: Users, label: 'Tổng số sinh viên', value: total, tone: 'text-indigo-600 dark:text-indigo-300' },
      ]}
    />
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

