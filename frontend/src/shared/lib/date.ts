// Centralized date formatting helper for student-related dates

/**
 * Format a date value to Vietnamese locale date string
 * @param value - Date value to format (Date object or string)
 * @returns Formatted date string in Vietnamese locale or '—' if invalid
 */
export function formatDateVN(value: Date | string | null | undefined): string {
  if (!value) return '—';
  try {
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('vi-VN');
  } catch {
    return '—';
  }
}

/**
 * Format a date value to Vietnamese locale time string
 * @param value - Date value to format
 * @returns Formatted time string in Vietnamese locale or '—' if invalid
 */
export function formatTimeVN(value: Date | string | null | undefined): string {
  if (!value) return '—';
  try {
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}

/**
 * Format a date value to full Vietnamese datetime string
 * @param value - Date value to format
 * @returns Formatted datetime string in Vietnamese locale or '—' if invalid
 */
export function formatDateTimeVN(value: Date | string | null | undefined): string {
  if (!value) return '—';
  try {
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('vi-VN');
  } catch {
    return '—';
  }
}
