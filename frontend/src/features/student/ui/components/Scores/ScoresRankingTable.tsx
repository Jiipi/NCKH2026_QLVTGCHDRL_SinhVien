import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, ChevronDown, Users } from 'lucide-react';

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' as const } }
};

export default function ScoresRankingTable({ rankings = [] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!Array.isArray(rankings) || rankings.length === 0) return null;

  const INITIAL_SHOW = 10;
  const displayRankings = isExpanded ? rankings : rankings.slice(0, INITIAL_SHOW);
  const hasMore = rankings.length > INITIAL_SHOW;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4 dark:border-slate-700/50 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
            <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Bảng xếp hạng lớp</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{rankings.length} sinh viên</p>
          </div>
        </div>
        <div className="hidden items-center gap-1.5 sm:flex">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{rankings.length} SV</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-[640px] w-full">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-700/50">
              <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hạng</th>
              <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">MSSV</th>
              <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Họ tên</th>
              <th className="text-center py-3 px-5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Số HĐ</th>
              <th className="text-right py-3 px-5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tổng điểm</th>
            </tr>
          </thead>
          <motion.tbody
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
          >
            {displayRankings.map((student, index) => {
              const isCurrentUser = student.is_current_user;
              return (
                <motion.tr
                  key={student.mssv || index}
                  variants={rowVariants}
                  className={`border-b border-slate-100 dark:border-slate-700/50 transition-colors ${
                    isCurrentUser
                      ? 'bg-blue-50/70 dark:bg-blue-900/20 border-l-4 !border-l-blue-500'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                  }`}
                >
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2">
                      {getMedalIcon(index)}
                      <span className={`text-sm font-semibold ${isCurrentUser ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>
                        #{index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`text-sm font-mono ${isCurrentUser ? 'text-blue-700 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'}`}>
                      {student.mssv}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${isCurrentUser ? 'text-blue-900 dark:text-blue-200' : 'text-slate-900 dark:text-white'}`}>
                        {student.ho_ten}
                      </span>
                      {isCurrentUser && (
                        <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-800/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                          Bạn
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <span className={`text-sm ${isCurrentUser ? 'text-blue-700 dark:text-blue-300 font-semibold' : 'text-slate-600 dark:text-slate-400'}`}>
                      {student.so_hoat_dong}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-bold ${getScoreBadge(student.tong_diem, isCurrentUser)}`}>
                      {student.tong_diem}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
      </div>

      {/* Show more / Note */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-700/50 space-y-3">
        {hasMore && (
          <div className="text-center">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer"
            >
              <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-4 h-4" />
              </motion.span>
              {isExpanded ? 'Thu gọn' : `Xem thêm (${rankings.length - INITIAL_SHOW} SV)`}
            </button>
          </div>
        )}
        <p className="text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700/30 rounded-lg px-3 py-2">
          <strong>Ghi chú:</strong> Bảng xếp hạng dựa trên tổng điểm rèn luyện của học kỳ này trong lớp.
        </p>
      </div>
    </motion.section>
  );
}

function getMedalIcon(index: number) {
  if (index === 0) return (
    <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
      <Crown className="h-3.5 w-3.5 text-amber-500" />
    </div>
  );
  if (index === 1) return (
    <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
      <Medal className="h-3.5 w-3.5 text-slate-500 dark:text-slate-300" />
    </div>
  );
  if (index === 2) return (
    <div className="w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
      <Medal className="h-3.5 w-3.5 text-orange-500 dark:text-orange-400" />
    </div>
  );
  return <div className="w-7 h-7" />;
}

function getScoreBadge(score: number, isCurrentUser: boolean) {
  if (isCurrentUser) return 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300';
  if (score >= 90) return 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300';
  if (score >= 80) return 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
  if (score >= 65) return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
  if (score >= 50) return 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
  return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
}
