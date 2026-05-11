export type ProfileRoleKey = 'admin' | 'teacher' | 'monitor' | 'student';

export interface ProfileTheme {
  key: ProfileRoleKey;
  label: string;
  pageGradient: string;
  heroGradient: string;
  textGradient: string;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  ring: string;
  primaryButton: string;
  subtleButton: string;
  tabActive: string;
  statCards: string[];
}

export const profileThemes: Record<ProfileRoleKey, ProfileTheme> = {
  admin: {
    key: 'admin',
    label: 'Quản trị viên',
    pageGradient: 'from-slate-50 via-indigo-50 to-violet-50',
    heroGradient: 'from-indigo-600 via-violet-600 to-purple-600',
    textGradient: 'from-indigo-700 via-violet-700 to-purple-700',
    accentText: 'text-indigo-700',
    accentBg: 'bg-indigo-50',
    accentBorder: 'border-indigo-200',
    ring: 'ring-indigo-200',
    primaryButton: 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:ring-indigo-200 shadow-indigo-500/30',
    subtleButton: 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200',
    tabActive: 'border-transparent bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30',
    statCards: ['bg-indigo-400', 'bg-violet-400', 'bg-purple-400']
  },
  teacher: {
    key: 'teacher',
    label: 'Giảng viên',
    pageGradient: 'from-slate-50 via-teal-50 to-cyan-50',
    heroGradient: 'from-teal-600 via-cyan-600 to-sky-500',
    textGradient: 'from-teal-700 via-cyan-700 to-sky-700',
    accentText: 'text-teal-700',
    accentBg: 'bg-teal-50',
    accentBorder: 'border-teal-200',
    ring: 'ring-teal-200',
    primaryButton: 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 focus:ring-teal-200 shadow-teal-500/30',
    subtleButton: 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200',
    tabActive: 'border-transparent bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/30',
    statCards: ['bg-teal-400', 'bg-cyan-400', 'bg-sky-400']
  },
  monitor: {
    key: 'monitor',
    label: 'Lớp trưởng',
    pageGradient: 'from-slate-50 via-indigo-50 to-purple-50',
    heroGradient: 'from-indigo-600 via-violet-600 to-purple-600',
    textGradient: 'from-indigo-700 via-violet-700 to-purple-700',
    accentText: 'text-indigo-700',
    accentBg: 'bg-indigo-50',
    accentBorder: 'border-indigo-200',
    ring: 'ring-indigo-200',
    primaryButton: 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:ring-indigo-200 shadow-indigo-500/30',
    subtleButton: 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200',
    tabActive: 'border-transparent bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30',
    statCards: ['bg-indigo-400', 'bg-violet-400', 'bg-purple-400']
  },
  student: {
    key: 'student',
    label: 'Sinh viên',
    pageGradient: 'from-slate-50 via-blue-50 to-indigo-50',
    heroGradient: 'from-blue-600 via-indigo-600 to-violet-600',
    textGradient: 'from-blue-700 via-indigo-700 to-violet-700',
    accentText: 'text-blue-700',
    accentBg: 'bg-blue-50',
    accentBorder: 'border-blue-200',
    ring: 'ring-blue-200',
    primaryButton: 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:ring-blue-200 shadow-blue-500/30',
    subtleButton: 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200',
    tabActive: 'border-transparent bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30',
    statCards: ['bg-blue-400', 'bg-indigo-400', 'bg-violet-400']
  }
};
