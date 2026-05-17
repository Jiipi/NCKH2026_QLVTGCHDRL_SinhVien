/**
 * Design System — Typography Tokens
 *
 * Quy tắc typography:
 * - Luôn dùng font-family: var(--font-sans)
 * - Heading sizes: text-2xl → text-5xl (dùng font-bold hoặc font-semibold)
 * - Body sizes: text-sm → text-base (dùng font-normal)
 * - Labels: text-xs → text-sm (dùng font-medium)
 * - Line-height: heading 1.2, body 1.6, label 1.4
 *
 * @module design-system/tokens
 */

export const fontFamily = {
  sans: "'Be Vietnam Pro', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
  display: "'Be Vietnam Pro', 'Inter', system-ui, sans-serif",
} as const;

export const fontSize = {
  xs:   { size: '0.75rem',  lineHeight: '1rem',    letterSpacing: '0.01em' },
  sm:   { size: '0.875rem', lineHeight: '1.25rem', letterSpacing: '0.01em' },
  base: { size: '1rem',     lineHeight: '1.5rem',  letterSpacing: '0' },
  lg:   { size: '1.125rem', lineHeight: '1.75rem', letterSpacing: '-0.01em' },
  xl:   { size: '1.25rem',  lineHeight: '1.75rem', letterSpacing: '-0.02em' },
  '2xl':{ size: '1.5rem',   lineHeight: '2rem',    letterSpacing: '-0.02em' },
  '3xl':{ size: '1.875rem', lineHeight: '2.25rem', letterSpacing: '-0.03em' },
  '4xl':{ size: '2.25rem',  lineHeight: '2.5rem',  letterSpacing: '-0.03em' },
  '5xl':{ size: '3rem',      lineHeight: '1.1',     letterSpacing: '-0.04em' },
  '6xl':{ size: '3.75rem',  lineHeight: '1',       letterSpacing: '-0.05em' },
} as const;

export const fontWeight = {
  light:       300,
  normal:      400,
  medium:      500,
  semibold:    600,
  bold:        700,
  extrabold:   800,
  black:       900,
} as const;

export const lineHeight = {
  none:    1,
  tight:   1.25,
  snug:    1.375,
  normal:  1.5,
  relaxed: 1.625,
  loose:   2,
} as const;

export const textColor = {
  primary:   'var(--text-primary)',
  secondary: 'var(--text-secondary)',
  muted:     'var(--text-muted)',
  disabled:  'var(--text-disabled)',
  inverse:   'var(--text-inverse)',
  link:      'var(--text-link)',
  brand:     'var(--color-brand)',
} as const;

export type FontSizeKey = keyof typeof fontSize;
export type FontWeightKey = keyof typeof fontWeight;
