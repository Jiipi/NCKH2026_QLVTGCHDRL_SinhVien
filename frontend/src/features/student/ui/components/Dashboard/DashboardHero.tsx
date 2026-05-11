import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import {
  Calendar,
  CheckCircle,
  Users,
} from 'lucide-react';
// Semester is now managed globally from sidebar
import { resolveAssetUrl } from '../../../../../shared/lib/assetUrl';

// Stagger container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
} as const;

// Fade up item
const fadeUpVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const }
  }
} as const;

// Scale in item
const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' as const }
  }
} as const;

// Animated counter component
function AnimatedCounter({ target, duration = 1.2 }: { target: number; duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => {
    if (target % 1 !== 0) return v.toFixed(1);
    return Math.round(v).toLocaleString('vi-VN');
  });

  useEffect(() => {
    const controls = animate(count, target, {
      duration,
      ease: 'easeOut' as const,
    });
    return controls.stop;
  }, [target, duration, count]);

  return <motion.span>{rounded}</motion.span>;
}

// Stat item with hover
function StatItem({ icon: Icon, label, value, unit, iconBg, iconColor, delay = 0 }: {
  icon: any; label: string; value: any; unit?: string; iconBg: string; iconColor: string; delay?: number;
}) {
  return (
    <motion.div
      className="flex items-center gap-3"
      variants={fadeUpVariants}
      whileHover={{ x: 4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <motion.div
        className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center`}
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
      </motion.div>
      <div className="flex-1">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {typeof value === 'number' ? <AnimatedCounter target={value} /> : value}
          {unit && <span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>}
        </p>
      </div>
    </motion.div>
  );
}

export default function DashboardHero({
  summary,
  userProfile,
  studentInfo,
  classification,
  semester,
  onSemesterChange,
  loading,
  formatNumber = (value) => value
}) {
  const safeSummary = summary || {};
  const safeClassification = classification || {};
  const safeStudent = studentInfo || {};
  const safeProfile = userProfile || {};

  const [avatarError, setAvatarError] = useState(false);
  const rawAvatar = safeProfile.anh_dai_dien || safeProfile.avatar;
  const avatarSrc = rawAvatar && !avatarError ? resolveAssetUrl(rawAvatar) : null;

  const initials = (safeProfile.ho_ten || safeProfile.name || 'SV')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Progress ring calculations
  const progress = safeSummary.progress || 0;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  // Animated progress ring
  const progressValue = useMotionValue(0);
  const strokeDashoffset = useTransform(
    progressValue,
    (v) => circumference * (1 - Math.min(v, 100) / 100)
  );

  useEffect(() => {
    if (!loading && progress > 0) {
      const controls = animate(progressValue, progress, {
        duration: 1.5,
        ease: 'easeOut' as const,
        delay: 0.5,
      });
      return controls.stop;
    }
  }, [progress, loading, progressValue]);

  return (
    <motion.div
      className="space-y-5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ===== THÔNG TIN SINH VIÊN ===== */}
      <motion.div
        className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20"
        variants={fadeUpVariants}
      >
        <div className="flex items-center gap-4 flex-wrap">
          {/* Avatar with entrance animation */}
          <motion.div
            className="relative flex-shrink-0"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.3 }}
          >
            <div className="w-14 h-14 rounded-full bg-blue-800 dark:bg-blue-700 flex items-center justify-center shadow-md overflow-hidden border-2 border-blue-100 dark:border-blue-900">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <span className="text-lg font-bold text-white">{initials}</span>
              )}
            </div>
            <motion.div
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: 'spring', stiffness: 500 }}
            />
          </motion.div>

          {/* Name + Info */}
          <motion.div
            className="flex-1 min-w-0"
            variants={fadeUpVariants}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {safeProfile.ho_ten || safeProfile.name || 'Sinh viên'}
              </h2>
              <span className="text-sm text-slate-400 dark:text-slate-500">—</span>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                MSSV: {safeStudent.mssv || safeProfile.mssv || safeProfile.ma_sv || 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
              <span>
                Lớp: <span className="font-medium text-slate-700 dark:text-slate-300">{safeStudent.ten_lop || safeProfile.lop || safeProfile.ten_lop || 'N/A'}</span>
              </span>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <span>
                Học kỳ: <span className="font-medium text-slate-700 dark:text-slate-300">{semester || 'Chưa chọn'}</span>
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ===== ĐIỂM RÈN LUYỆN + THỐNG KÊ CÁ NHÂN ===== */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Điểm rèn luyện — with animated ring */}
          <motion.div
            className="rounded-[2rem] border border-white/60 bg-white/60 p-6 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55"
            variants={scaleInVariants}
            whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-5">
              Điểm rèn luyện
            </h3>
            <div className="flex items-center gap-6">
              {/* Animated Progress Ring */}
              <div className="relative flex-shrink-0">
                <svg width="128" height="128" viewBox="0 0 128 128">
                  <circle
                    cx="64" cy="64" r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-slate-100 dark:text-slate-700"
                  />
                  <motion.circle
                    cx="64" cy="64" r={radius}
                    fill="none"
                    stroke="#1e40af"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    style={{ strokeDashoffset }}
                    className="dark:stroke-blue-400"
                    transform="rotate(-90 64 64)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    <AnimatedCounter target={safeSummary.totalPoints ?? 0} duration={1.5} />
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">/ 100</span>
                </div>
              </div>

              {/* Classification */}
              <motion.div variants={fadeUpVariants}>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Xếp loại</p>
                <motion.span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${
                    safeClassification.bg || 'bg-blue-50'
                  } ${safeClassification.color || 'text-blue-700'} ${
                    safeClassification.border || 'border-blue-200'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, type: 'spring', stiffness: 400, damping: 15 }}
                >
                  {safeClassification.text || 'Đang cập nhật'}
                </motion.span>
                <div className="mt-3 w-40">
                  <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mb-1">
                    <span>Tiến độ</span>
                    <span>{formatNumber(safeSummary.progress ?? 0)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-800 dark:bg-blue-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Thống kê cá nhân — staggered stats */}
          <motion.div
            className="rounded-[2rem] border border-white/60 bg-white/60 p-6 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55"
            variants={scaleInVariants}
            whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-5">
              Thống kê cá nhân
            </h3>
            <motion.div
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <StatItem
                icon={CheckCircle}
                label="Đã tham gia"
                value={safeSummary.activitiesJoined ?? 0}
                unit="HĐ"
                iconBg="bg-emerald-50 dark:bg-emerald-900/30"
                iconColor="text-emerald-600 dark:text-emerald-400"
              />
              <StatItem
                icon={Calendar}
                label="Sắp tới"
                value={safeSummary.activitiesUpcoming ?? 0}
                unit="HĐ"
                iconBg="bg-amber-50 dark:bg-amber-900/30"
                iconColor="text-amber-600 dark:text-amber-400"
              />
              <StatItem
                icon={Users}
                label="Xếp hạng"
                value={`${formatNumber(safeSummary.classRank ?? '-')}/${formatNumber(safeSummary.totalStudents ?? '-')}`}
                iconBg="bg-blue-50 dark:bg-blue-900/30"
                iconColor="text-blue-600 dark:text-blue-400"
              />
            </motion.div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
