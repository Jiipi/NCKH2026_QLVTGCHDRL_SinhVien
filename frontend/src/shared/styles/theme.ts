/**
 * Theme Design Tokens
 * Centralized theme configuration for consistent styling across the app.
 * Use these tokens instead of hardcoding colors in components.
 */

// =====================================================
// Role-based color themes (Tailwind CSS classes)
// =====================================================
export const roleTheme = {
  admin: {
    primary: 'text-purple-600',
    primaryBg: 'bg-purple-600',
    primaryHover: 'hover:bg-purple-700',
    light: 'bg-purple-50',
    lightBorder: 'border-purple-200',
    gradient: 'from-purple-600 to-indigo-600',
    gradientBg: 'bg-gradient-to-r from-purple-600 to-indigo-600',
    badge: 'bg-purple-100 text-purple-700',
    sidebar: 'from-gray-900 via-gray-800 to-gray-900',
  },
  teacher: {
    primary: 'text-teal-600',
    primaryBg: 'bg-teal-600',
    primaryHover: 'hover:bg-teal-700',
    light: 'bg-teal-50',
    lightBorder: 'border-teal-200',
    gradient: 'from-teal-600 to-cyan-600',
    gradientBg: 'bg-gradient-to-r from-teal-600 to-cyan-600',
    badge: 'bg-teal-100 text-teal-700',
    sidebar: 'from-gray-900 via-gray-800 to-gray-900',
  },
  student: {
    primary: 'text-blue-600',
    primaryBg: 'bg-blue-600',
    primaryHover: 'hover:bg-blue-700',
    light: 'bg-blue-50',
    lightBorder: 'border-blue-200',
    gradient: 'from-blue-600 to-indigo-600',
    gradientBg: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    badge: 'bg-blue-100 text-blue-700',
    sidebar: 'from-gray-900 via-gray-800 to-gray-900',
  },
  monitor: {
    primary: 'text-indigo-600',
    primaryBg: 'bg-indigo-600',
    primaryHover: 'hover:bg-indigo-700',
    light: 'bg-indigo-50',
    lightBorder: 'border-indigo-200',
    gradient: 'from-indigo-600 to-purple-600',
    gradientBg: 'bg-gradient-to-r from-indigo-600 to-purple-600',
    badge: 'bg-indigo-100 text-indigo-700',
    sidebar: 'from-gray-900 via-gray-800 to-gray-900',
  },
} as const;

export type RoleName = keyof typeof roleTheme;

// =====================================================
// Semantic color tokens (for consistent status colors)
// =====================================================
export const statusColors = {
  success: {
    text: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-700',
    icon: 'text-green-500',
  },
  warning: {
    text: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-700',
    icon: 'text-yellow-500',
  },
  error: {
    text: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
    icon: 'text-red-500',
  },
  info: {
    text: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    icon: 'text-blue-500',
  },
} as const;

// =====================================================
// Classification colors (điểm rèn luyện)
// =====================================================
export const classificationColors = {
  xuat_sac: { text: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', label: 'Xuất sắc' },
  tot: { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Tốt' },
  kha: { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: 'Khá' },
  trung_binh: { text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', label: 'Trung bình' },
  yeu: { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Yếu' },
} as const;

/** Get classification from points */
export function getClassification(points: number) {
  if (points >= 90) return classificationColors.xuat_sac;
  if (points >= 80) return classificationColors.tot;
  if (points >= 65) return classificationColors.kha;
  if (points >= 50) return classificationColors.trung_binh;
  return classificationColors.yeu;
}

// =====================================================
// CSS custom property names (for use with style={{}})
// =====================================================
export const cssVars = {
  sidebarWidth: '--sidebar-w',
  headerHeight: '--header-h',
  primaryColor: '--color-primary',
  primaryHover: '--color-primary-hover',
} as const;

// =====================================================
// Common spacing & layout tokens
// =====================================================
export const layout = {
  sidebarExpandedWidth: 280,
  sidebarCollapsedWidth: 64,
  headerHeight: 64,
  contentMaxWidth: 1280,
  cardBorderRadius: 'rounded-xl',
  modalBorderRadius: 'rounded-2xl',
} as const;

/** Helper to get role theme by role string */
export function getRoleTheme(role: string): (typeof roleTheme)[RoleName] {
  const normalizedRole = role.toLowerCase().replace(/\s+/g, '_');
  const roleMap: Record<string, RoleName> = {
    admin: 'admin',
    giang_vien: 'teacher',
    teacher: 'teacher',
    sinh_vien: 'student',
    student: 'student',
    lop_truong: 'monitor',
    monitor: 'monitor',
  };
  return roleTheme[roleMap[normalizedRole] || 'student'];
}
