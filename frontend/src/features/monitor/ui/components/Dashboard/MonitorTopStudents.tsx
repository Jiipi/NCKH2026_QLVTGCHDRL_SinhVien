import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star } from 'lucide-react';
import { getStudentAvatar, getAvatarGradient } from '../../../../../shared/lib/avatar';

interface MonitorTopStudentsProps {
  topStudents: any[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const }
  }
} as const;

export default function MonitorTopStudents({ topStudents }: MonitorTopStudentsProps) {
  const getScoreGrade = (points: number) => {
    if (points >= 90) return { label: 'Xuất sắc', color: 'from-yellow-500 to-amber-600', bg: 'bg-yellow-50', text: 'text-yellow-700' };
    if (points >= 80) return { label: 'Tốt', color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', text: 'text-blue-700' };
    if (points >= 65) return { label: 'Khá', color: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50', text: 'text-emerald-700' };
    if (points >= 50) return { label: 'Trung bình', color: 'from-orange-500 to-amber-600', bg: 'bg-orange-50', text: 'text-orange-700' };
    return { label: 'Yếu', color: 'from-rose-500 to-red-600', bg: 'bg-rose-50', text: 'text-rose-700' };
  };

  return (
    <div className="relative flex max-h-[420px] flex-col overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(251,191,36,0.14),transparent_30%),radial-gradient(circle_at_100%_0%,rgba(129,140,248,0.12),transparent_26%)]" />
      <div className="relative z-10 flex min-h-0 flex-col">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-50 p-2 dark:bg-amber-400/10">
              <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-300" />
            </div>
            <h3 className="font-bold text-slate-950 dark:text-white">Top Lớp Học</h3>
          </div>
          <span className="rounded-full border border-white/60 bg-white/55 px-2.5 py-1 text-xs font-semibold text-slate-500 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            {topStudents?.length || 0} SV
          </span>
        </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-h-[320px] space-y-3 overflow-y-auto pr-2"
        style={{ scrollbarWidth: 'thin' }}
      >
        {topStudents && topStudents.length > 0 ? (
          topStudents.map((student, index) => {
            const grade = getScoreGrade(student.points);
            const avatar = getStudentAvatar(student);
            
            return (
              <motion.div 
                key={student.id || index}
                variants={itemVariants}
                className="flex items-center gap-3 rounded-2xl border border-white/50 bg-white/45 p-3 shadow-sm backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/70 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
              >
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm text-white bg-gradient-to-br ${
                    index === 0 ? 'from-amber-400 to-orange-500' : 
                    index === 1 ? 'from-slate-300 to-slate-500' : 
                    index === 2 ? 'from-orange-300 to-amber-600' : 
                    getAvatarGradient(student.name || student.mssv)
                  }`}>
                    {avatar.hasValidAvatar ? (
                      <img
                        src={avatar.src}
                        alt={avatar.alt}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const fallback = document.createElement('span');
                            fallback.textContent = String(avatar.fallback || index + 1);
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    ) : (
                      avatar.fallback || index + 1
                    )}
                  </div>
                  {index < 3 && (
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border border-white dark:border-slate-800 shadow-sm ${
                      index === 0 ? 'bg-amber-500' : 
                      index === 1 ? 'bg-slate-400' : 
                      'bg-orange-500'
                    }`}>
                      <Star className="w-2.5 h-2.5 text-white" fill="currentColor" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white truncate">{student.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{student.mssv}</p>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${grade.bg} ${grade.text}`}>
                      {grade.label}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`font-bold text-base bg-gradient-to-r ${grade.color} bg-clip-text text-transparent`}>
                    {student.points}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">điểm RL</p>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-8 text-slate-400">
            <Trophy className="w-12 h-12 mb-3 text-slate-200 dark:text-slate-700" />
            <p className="text-sm font-medium">Chưa có dữ liệu sinh viên</p>
          </div>
        )}
      </motion.div>
      </div>
    </div>
  );
}
