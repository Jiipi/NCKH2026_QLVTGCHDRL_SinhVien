/**
 * Design System — Motion & Shadow Tokens
 *
 * @module design-system/tokens
 */

export const shadow = {
  none:    'none',
  xs:      '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm:      '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  DEFAULT: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
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
  card:    '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
  dropdown:'0 10px 40px rgba(15, 23, 42, 0.12)',
  modal:   '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
} as const;

export const duration = {
  instant:  '50ms',
  fast:     '100ms',
  base:     '150ms',
  slow:     '200ms',
  slower:   '300ms',
  slowest:  '500ms',
} as const;

export const easing = {
  linear:   'linear',
  in:       'cubic-bezier(0.4, 0, 1, 1)',
  out:      'cubic-bezier(0, 0, 0.2, 1)',
  inOut:    'cubic-bezier(0.4, 0, 0.2, 1)',
  spring:   'cubic-bezier(0.34, 1.56, 0.64, 1)',
  bounce:   'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

export const transition = {
  property: {
    none:          'none',
    all:           'all',
    colors:        'color, background-color, border-color, text-decoration-color, fill, stroke',
    opacity:       'opacity',
    transform:     'transform',
    shadow:        'box-shadow',
    width:         'width',
    height:        'height',
  },
  duration,
  easing,
} as const;

export type ShadowKey = keyof typeof shadow;
export type DurationKey = keyof typeof duration;
export type EasingKey = keyof typeof easing;

/* Animation keyframes (for Tailwind config) */
export const keyframes = {
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
  spinOnce: {
    from: { transform: 'rotate(0deg)' },
    to:   { transform: 'rotate(360deg)' },
  },
  shimmer: {
    from: { backgroundPosition: '200% 0' },
    to:   { backgroundPosition: '-200% 0' },
  },
  float: {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%':       { transform: 'translateY(-8px)' },
  },
  pulse: {
    '0%, 100%': { opacity: '1' },
    '50%':       { opacity: '0.5' },
  },
} as const;

export const animation = {
  fadeIn:     'fadeIn 200ms ease-out',
  fadeOut:    'fadeOut 200ms ease-in',
  slideUp:    'slideUp 300ms ease-out',
  slideDown:  'slideDown 300ms ease-out',
  slideLeft:  'slideLeft 300ms ease-out',
  slideRight: 'slideRight 300ms ease-out',
  scaleIn:    'scaleIn 200ms ease-out',
  scaleOut:   'scaleOut 200ms ease-in',
  float:      'float 3s ease-in-out infinite',
  shimmer:    'shimmer 1.5s linear infinite',
  spinOnce:   'spinOnce 1s ease-out',
} as const;
