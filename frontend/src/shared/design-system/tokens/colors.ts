/**
 * Design System — Color Tokens
 *
 * Hệ thống màu chuẩn cho ứng dụng, theo nguyên tắc:
 * - Semantic tokens (surface, border, text) → dùng trong component
 * - Role tokens (primary, success, danger, warning, info) → dùng cho trạng thái
 * - Base tokens (slate, academic) → dùng cho tùy chỉnh nâng cao
 *
 * @module design-system/tokens
 */

/* ============================================================
   CSS CUSTOM PROPERTIES (Light + Dark)
   ============================================================ */

export const colorCssVariables = `
/* Light Mode */
:root {
  /* --- Surface (nền) --- */
  --surface-page: #f8fafc;
  --surface-card: #ffffff;
  --surface-card-hover: #f1f5f9;
  --surface-muted: #f1f5f9;
  --surface-elevated: #ffffff;
  --surface-overlay: rgba(15, 23, 42, 0.5);
  --surface-backdrop: rgba(15, 23, 42, 0.03);

  /* --- Border --- */
  --border-default: #e2e8f0;
  --border-hover: #cbd5e1;
  --border-strong: #94a3b8;
  --border-focus: #3b82f6;

  /* --- Text --- */
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  --text-disabled: #cbd5e1;
  --text-inverse: #ffffff;
  --text-link: #3b82f6;

  /* --- Brand / Primary (Academic Blue) --- */
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-200: #bfdbfe;
  --primary-300: #93c5fd;
  --primary-400: #60a5fa;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  --primary-800: #1e40af;
  --primary-900: #1e3a8a;
  --primary-950: #172554;

  --primary: var(--primary-600);
  --primary-hover: var(--primary-700);
  --primary-light: var(--primary-50);

  /* --- Success (Emerald) --- */
  --success-50: #ecfdf5;
  --success-100: #d1fae5;
  --success-200: #a7f3d0;
  --success-300: #6ee7b7;
  --success-400: #34d399;
  --success-500: #22c55e;
  --success-600: #16a34a;
  --success-700: #15803d;
  --success-800: #166534;
  --success-900: #14532d;

  --success: var(--success-600);
  --success-hover: var(--success-700);
  --success-light: var(--success-50);

  /* --- Danger / Error (Red) --- */
  --danger-50: #fef2f2;
  --danger-100: #fee2e2;
  --danger-200: #fecaca;
  --danger-300: #fca5a5;
  --danger-400: #f87171;
  --danger-500: #ef4444;
  --danger-600: #dc2626;
  --danger-700: #b91c1c;
  --danger-800: #991b1b;
  --danger-900: #7f1d1d;

  --danger: var(--danger-500);
  --danger-hover: var(--danger-600);
  --danger-light: var(--danger-50);

  /* --- Warning (Amber) --- */
  --warning-50: #fffbeb;
  --warning-100: #fef3c7;
  --warning-200: #fde68a;
  --warning-300: #fcd34d;
  --warning-400: #fbbf24;
  --warning-500: #f59e0b;
  --warning-600: #d97706;
  --warning-700: #b45309;
  --warning-800: #92400e;
  --warning-900: #78350f;

  --warning: var(--warning-500);
  --warning-hover: var(--warning-600);
  --warning-light: var(--warning-50);

  /* --- Info (Sky) --- */
  --info-50: #f0f9ff;
  --info-100: #e0f2fe;
  --info-200: #bae6fd;
  --info-300: #7dd3fc;
  --info-400: #38bdf8;
  --info-500: #0ea5e9;
  --info-600: #0284c7;
  --info-700: #0369a1;
  --info-800: #075985;
  --info-900: #0c4a6e;

  --info: var(--info-500);
  --info-hover: var(--info-600);
  --info-light: var(--info-50);

  /* --- Neutral / Slate --- */
  --slate-50: #f8fafc;
  --slate-100: #f1f5f9;
  --slate-200: #e2e8f0;
  --slate-300: #cbd5e1;
  --slate-400: #94a3b8;
  --slate-500: #64748b;
  --slate-600: #475569;
  --slate-700: #334155;
  --slate-800: #1e293b;
  --slate-900: #0f172a;
  --slate-950: #020617;

  /* --- Semantic aliases --- */
  --color-bg-page: var(--surface-page);
  --color-bg-card: var(--surface-card);
  --color-bg-muted: var(--surface-muted);
  --color-border: var(--border-default);
  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-text-muted: var(--text-muted);
  --color-brand: var(--primary-800);
  --color-brand-light: var(--primary-50);
  --color-brand-hover: var(--primary-700);

  /* --- Scrollbar --- */
  --scrollbar-thumb: #cbd5e1;
  --scrollbar-track: #f1f5f9;

  /* --- Shadows --- */
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
  --shadow-focus: 0 0 0 3px rgb(59 130 246 / 0.3);
  --shadow-focus-success: 0 0 0 3px rgb(34 197 94 / 0.3);
  --shadow-focus-danger: 0 0 0 3px rgb(239 68 68 / 0.3);

  /* --- Border Radius --- */
  --radius-none: 0;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-2xl: 16px;
  --radius-3xl: 24px;
  --radius-full: 9999px;

  /* --- Spacing --- */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* --- Layout --- */
  --sidebar-width: 280px;
  --sidebar-width-collapsed: 72px;
  --header-height: 72px;
  --page-max-width: 1440px;
  --content-padding: 24px;

  /* --- Z-index scale --- */
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-fixed: 30;
  --z-modal-backdrop: 40;
  --z-modal: 50;
  --z-popover: 60;
  --z-tooltip: 70;
  --z-toast: 80;

  /* --- Transitions --- */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
  --transition-spring: 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Dark Mode */
.dark {
  --surface-page: #0f172a;
  --surface-card: #1e293b;
  --surface-card-hover: #334155;
  --surface-muted: #1e293b;
  --surface-elevated: #334155;
  --surface-overlay: rgba(0, 0, 0, 0.7);
  --surface-backdrop: rgba(255, 255, 255, 0.02);

  --border-default: #334155;
  --border-hover: #475569;
  --border-strong: #64748b;
  --border-focus: #60a5fa;

  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --text-disabled: #475569;
  --text-inverse: #0f172a;
  --text-link: #60a5fa;

  --primary-500: #60a5fa;
  --primary-600: #3b82f6;
  --primary-700: #2563eb;

  --color-brand: #60a5fa;
  --color-brand-light: #1e3a5f;
  --color-brand-hover: #3b82f6;

  --scrollbar-thumb: #475569;
  --scrollbar-track: #1e293b;

  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4);
  --shadow-focus: 0 0 0 3px rgb(96 165 250 / 0.4);
  --shadow-focus-success: 0 0 0 3px rgb(52 211 153 / 0.4);
  --shadow-focus-danger: 0 0 0 3px rgb(248 113 113 / 0.4);
}
`;

/* ============================================================
   TypeScript Token Exports
   ============================================================ */

export const colors = {
  primary: {
    50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
    400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
    800: '#1e40af', 900: '#1e3a8a', 950: '#172554',
  },
  success: {
    50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7',
    400: '#34d399', 500: '#22c55e', 600: '#16a34a', 700: '#15803d',
    800: '#166534', 900: '#14532d',
  },
  danger: {
    50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5',
    400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c',
    800: '#991b1b', 900: '#7f1d1d',
  },
  warning: {
    50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
    400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
    800: '#92400e', 900: '#78350f',
  },
  info: {
    50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc',
    400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1',
    800: '#075985', 900: '#0c4a6e',
  },
  slate: {
    50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
    400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
    800: '#1e293b', 900: '#0f172a', 950: '#020617',
  },
} as const;

export const semanticColors = {
  primary: '#2563eb',
  primaryHover: '#1d4ed8',
  primaryLight: '#eff6ff',
  success: '#16a34a',
  successHover: '#15803d',
  successLight: '#ecfdf5',
  danger: '#ef4444',
  dangerHover: '#dc2626',
  dangerLight: '#fef2f2',
  warning: '#f59e0b',
  warningHover: '#d97706',
  warningLight: '#fffbeb',
  info: '#0ea5e9',
  infoHover: '#0284c7',
  infoLight: '#f0f9ff',
} as const;

export const semanticColorMap = {
  default: 'slate',
  primary: 'primary',
  success: 'success',
  danger: 'danger',
  warning: 'warning',
  info: 'info',
} as const;

export type SemanticColor = keyof typeof semanticColors;
export type ColorScale = keyof typeof colors.primary;
