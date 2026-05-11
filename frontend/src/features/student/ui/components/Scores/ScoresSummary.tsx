import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Trophy, TrendingUp, Users, Zap } from 'lucide-react';

/* ─── Animated SVG Donut Ring ──────────────────────────────── */
function ScoreRing({ score, maxScore = 100, size = 180, strokeWidth = 14 }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((animatedScore / maxScore) * 100, 100);
  const dash = (percentage * circumference) / 100;

  useEffect(() => {
    let raf: number;
    const duration = 1200;
    const start = performance.now();
    const from = 0;
    const to = score;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setAnimatedScore(Math.round(from + (to - from) * eased * 10) / 10);
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  // Color gradient based on score
  const getGradientId = () => {
    if (score >= 90) return 'ringGradientExcellent';
    if (score >= 80) return 'ringGradientGood';
    if (score >= 65) return 'ringGradientFair';
    if (score >= 50) return 'ringGradientAverage';
    return 'ringGradientWeak';
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90 drop-shadow-lg">
        <defs>
          <linearGradient id="ringGradientExcellent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <linearGradient id="ringGradientGood" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="ringGradientFair" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="ringGradientAverage" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <linearGradient id="ringGradientWeak" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-700"
          fill="transparent"
        />
        {/* Value arc */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          strokeWidth={strokeWidth}
          stroke={`url(#${getGradientId()})`}
          fill="transparent"
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${dash} ${circumference}` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">
          {animatedScore}
        </span>
        <span className="text-sm font-medium text-slate-400 dark:text-slate-500">/{maxScore}</span>
      </div>
    </div>
  );
}

/* ─── Classification Badge ─────────────────────────────────── */
function ClassificationBadge({ rank }: { rank: string }) {
  const config = getClassConfig(rank);
  return (
    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold ${config.bg} ${config.text} shadow-sm`}>
      <config.icon className="w-4 h-4" />
      Xếp loại: {rank}
    </span>
  );
}

function getClassConfig(rank: string) {
  switch (rank) {
    case 'Xuất sắc': return { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-800 dark:text-amber-300', icon: Trophy };
    case 'Tốt': return { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-800 dark:text-blue-300', icon: Zap };
    case 'Khá': return { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-800 dark:text-emerald-300', icon: TrendingUp };
    case 'Trung bình': return { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-800 dark:text-orange-300', icon: Target };
    default: return { bg: 'bg-rose-100 dark:bg-rose-900/40', text: 'text-rose-800 dark:text-rose-300', icon: Target };
  }
}

/* ─── Comparison Bar ───────────────────────────────────────── */
function ComparisonBar({ label, value, maxValue, color }: { label: string; value: number; maxValue: number; color: string }) {
  const pct = Math.min((value / Math.max(maxValue, 1)) * 100, 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-600 dark:text-slate-400">{label}</span>
        <span className="font-bold text-slate-900 dark:text-white tabular-nums">{value}</span>
      </div>
      <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

/* ─── Target Progress ──────────────────────────────────────── */
function TargetProgress({ current, target }: { current: number; target: number }) {
  const pct = Math.min((current / target) * 100, 100);
  const remaining = Math.max(target - current, 0);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-600 dark:text-slate-400">Mục tiêu cá nhân</span>
        <span className="font-bold text-slate-900 dark:text-white">{Math.round(pct)}%</span>
      </div>
      <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      {remaining > 0 && (
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Cần thêm <span className="font-semibold text-slate-600 dark:text-slate-300">{remaining}</span> điểm để đạt mục tiêu {target} điểm
        </p>
      )}
    </div>
  );
}

/* ─── Main ScoresSummary ───────────────────────────────────── */
const panelVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } }
};

export default function ScoresSummary({ currentScore, targetScore, progressPercentage, stats, data }) {
  const rankInClass = data?.class_rankings?.my_rank_in_class || 0;
  const totalStudents = data?.class_rankings?.total_students_in_class || 0;
  const topPercentage = totalStudents > 0 ? Math.round((rankInClass / totalStudents) * 100) : 0;
  const classification = data?.summary?.xep_loai || 'Chưa xếp loại';
  
  // Estimate class average (fallback if not available from API)
  const classAverage = data?.class_rankings?.class_average || Math.round(currentScore * 1.5) || 0;

  return (
    <motion.div
      className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
    >
      {/* LEFT — Score Ring + Classification */}
      <motion.section
        variants={panelVariants}
        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Tổng điểm học kỳ</h3>
        </div>

        <div className="flex flex-col items-center gap-5">
          <ScoreRing score={currentScore} maxScore={targetScore} />
          
          <ClassificationBadge rank={classification} />

          <div className="w-full mt-2">
            <TargetProgress current={currentScore} target={targetScore} />
          </div>
        </div>
      </motion.section>

      {/* RIGHT — Ranking & Quick Stats + Comparison */}
      <motion.section
        variants={panelVariants}
        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex flex-col"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Thống kê nhanh</h3>
        </div>

        {/* Quick stats rows */}
        <div className="space-y-3 mb-6">
          <QuickStat icon="📋" label="Hoạt động tham gia" value={stats.totalActivities} />
          <QuickStat icon="⭐" label="Điểm trung bình/HĐ" value={stats.averagePoints?.toFixed(1) ?? '-'} />
          {rankInClass > 0 && (
            <QuickStat icon="🏆" label="Xếp hạng lớp" value={`#${rankInClass}/${totalStudents}`} highlight />
          )}
        </div>

        {/* Cumulative progress bar */}
        <div className="space-y-1.5 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-600 dark:text-slate-400">Điểm tích lũy:</span>
            <span className="font-bold text-slate-900 dark:text-white">{currentScore} / {targetScore}</span>
          </div>
          <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: currentScore >= 80
                  ? 'linear-gradient(90deg, #10b981, #06b6d4)'
                  : currentScore >= 50
                    ? 'linear-gradient(90deg, #f59e0b, #f97316)'
                    : 'linear-gradient(90deg, #ef4444, #f97316)'
              }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((currentScore / targetScore) * 100, 100)}%` }}
              transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        {/* Ranking position */}
        {rankInClass > 0 && (
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 mt-auto space-y-4">
            <div className="text-center">
              <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                {rankInClass}<span className="text-lg font-medium text-slate-400 dark:text-slate-500">/{totalStudents}</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Vị trí của bạn trong lớp</p>
              {topPercentage > 0 && (
                <div className="mt-2">
                  <div className="h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden w-3/4 mx-auto">
                    <motion.div
                      className="h-full rounded-full bg-indigo-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${topPercentage}%` }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 inline-block">Top {topPercentage}% của lớp</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                So sánh với trung bình lớp
              </p>
              <ComparisonBar label="Bạn" value={currentScore} maxValue={targetScore} color="bg-gradient-to-r from-emerald-400 to-emerald-500" />
              <ComparisonBar label="TB Lớp" value={classAverage} maxValue={targetScore} color="bg-gradient-to-r from-blue-400 to-indigo-500" />
            </div>
          </div>
        )}
      </motion.section>
    </motion.div>
  );
}

/* ─── Quick Stat Row ───────────────────────────────────────── */
function QuickStat({ icon, label, value, highlight = false }: { icon: string; label: string; value: any; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
      </div>
      <span className={`text-sm font-bold tabular-nums ${
        highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'
      }`}>
        {value ?? '-'}
      </span>
    </div>
  );
}
