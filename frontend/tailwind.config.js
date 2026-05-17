/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './public/index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Be Vietnam Pro', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ["'JetBrains Mono'", "'Fira Code'", "'Cascadia Code'", 'Consolas', 'monospace'],
      },

      /* ---- Color Tokens ---- */
      colors: {
        /* Primary (Academic Blue) */
        primary: {
          50:  '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
          400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
          800: '#1e40af', 900: '#1e3a8a', 950: '#172554',
        },
        /* Success (Emerald) */
        success: {
          50:  '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7',
          400: '#34d399', 500: '#22c55e', 600: '#16a34a', 700: '#15803d',
          800: '#166534', 900: '#14532d',
        },
        /* Danger (Red) */
        danger: {
          50:  '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5',
          400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c',
          800: '#991b1b', 900: '#7f1d1d',
        },
        /* Warning (Amber) */
        warning: {
          50:  '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
          400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
          800: '#92400e', 900: '#78350f',
        },
        /* Info (Sky) */
        info: {
          50:  '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc',
          400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1',
          800: '#075985', 900: '#0c4a6e',
        },
        /* Surface (Semantic backgrounds) */
        surface: {
          page:       'var(--surface-page)',
          card:       'var(--surface-card)',
          'card-hover': 'var(--surface-card-hover)',
          muted:      'var(--surface-muted)',
          elevated:   'var(--surface-elevated)',
          overlay:    'var(--surface-overlay)',
          backdrop:   'var(--surface-backdrop)',
        },
        /* Border (Semantic) */
        border: {
          DEFAULT: 'var(--border-default)',
          hover:   'var(--border-hover)',
          strong:  'var(--border-strong)',
          focus:   'var(--border-focus)',
        },
        /* Text (Semantic) */
        text: {
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted:    'var(--text-muted)',
          disabled: 'var(--text-disabled)',
          inverse:  'var(--text-inverse)',
          link:     'var(--text-link)',
        },
        /* Ring colors */
        ring: {
          primary:   'rgb(37 99 235 / 0.3)',
          success:   'rgb(34 197 94 / 0.3)',
          danger:    'rgb(239 68 68 / 0.3)',
          warning:   'rgb(245 158 11 / 0.3)',
          info:      'rgb(14 165 233 / 0.3)',
        },
      },

      /* ---- Shadow Tokens ---- */
      boxShadow: {
        xs:      '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        sm:      '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md:      '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg:      '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl:      '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl':   '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        inner:   'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        focus:   '0 0 0 3px rgb(59 130 246 / 0.3)',
        'focus-success': '0 0 0 3px rgb(34 197 94 / 0.3)',
        'focus-danger':  '0 0 0 3px rgb(239 68 68 / 0.3)',
        'focus-warning': '0 0 0 3px rgb(245 158 11 / 0.3)',
        'focus-info':    '0 0 0 3px rgb(14 165 233 / 0.3)',
        dropdown: '0 10px 40px rgba(15, 23, 42, 0.12)',
        modal:    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },

      /* ---- Animation Keyframes ---- */
      animation: {
        'fade-in':    'fadeIn 200ms ease-out',
        'fade-out':   'fadeOut 200ms ease-in',
        'slide-up':   'slideUp 300ms ease-out',
        'slide-down': 'slideDown 300ms ease-out',
        'slide-left': 'slideLeft 300ms ease-out',
        'slide-right':'slideRight 300ms ease-out',
        'scale-in':   'scaleIn 200ms ease-out',
        'scale-out':  'scaleOut 200ms ease-in',
        'float':      'float 3s ease-in-out infinite',
        'shimmer':    'shimmer 1.5s linear infinite',
        'spin-once':  'spinOnce 1s ease-out',
        /* Legacy */
        'in':              'in 200ms ease-out',
        'pulse':           'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in-left':   'slideInLeft 300ms ease-out',
        'slide-in-right':  'slideInRight 300ms ease-out',
        'slide-in-bottom': 'slideInBottom 300ms ease-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        fadeOut: {
          from: { opacity: '1' },
          to:   { opacity: '0' },
        },
        slideUp: {
          from: { transform: 'translateY(12px)', opacity: '0' },
          to:   { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          from: { transform: 'translateY(-12px)', opacity: '0' },
          to:   { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          from: { transform: 'translateX(12px)', opacity: '0' },
          to:   { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          from: { transform: 'translateX(-12px)', opacity: '0' },
          to:   { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to:   { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          from: { transform: 'scale(1)', opacity: '1' },
          to:   { transform: 'scale(0.95)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':       { transform: 'translateY(-8px)' },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to:   { backgroundPosition: '-200% 0' },
        },
        spinOnce: {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        /* Legacy */
        in: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInBottom: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },

      /* ---- Spacing ---- */
      spacing: {
        'safe-top':    'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left':   'env(safe-area-inset-left)',
        'safe-right':  'env(safe-area-inset-right)',
      },

      /* ---- Border Radius ---- */
      borderRadius: {
        DEFAULT: '6px',
        sm:      '4px',
        md:      '6px',
        lg:      '8px',
        xl:      '12px',
        '2xl':   '16px',
        '3xl':   '24px',
      },

      /* ---- Screens ---- */
      screens: {
        xs: '475px',
      },

      /* ---- Transition ---- */
      transitionDuration: {
        instant: '50ms',
        fast:    '100ms',
        base:    '150ms',
        slow:    '200ms',
        slower:  '300ms',
        slowest: '500ms',
      },
    },
  },
  plugins: [],
};
