type DateValue = string | Date | null | undefined;

interface DateTimeFormatOptions {
  day?: '2-digit' | 'numeric';
  month?: '2-digit' | 'numeric' | 'short' | 'long';
  year?: 'numeric' | '2-digit';
  hour?: '2-digit' | 'numeric';
  minute?: '2-digit' | 'numeric';
  hour12?: boolean;
  timeZone?: string;
}

const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';
const VIETNAM_UTC_OFFSET_HOURS = 7;
const DATETIME_LOCAL_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/;

const parseVietnamWallTime = (value: string): Date | null => {
  if (!DATETIME_LOCAL_PATTERN.test(value)) return null;
  const [datePart, timePart] = value.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute, second = 0] = timePart.split(':').map(Number);
  const dt = new Date(Date.UTC(year, month - 1, day, hour - VIETNAM_UTC_OFFSET_HOURS, minute, second));
  return isNaN(dt.getTime()) ? null : dt;
};

export const formatDateTimeLocal = (value: DateValue): string => {
  if (!value) return '';
  try {
    const dt = value instanceof Date ? value : new Date(value);
    if (isNaN(dt.getTime())) return '';
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: VIETNAM_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(dt);
    const get = (type: string) => parts.find(part => part.type === type)?.value || '';
    return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
  } catch (_e) {
    return '';
  }
};

export const toISOWithTimezone = (dateTimeLocal: string | null | undefined): string | null => {
  if (!dateTimeLocal) return null;
  try {
    const vietnamDate = parseVietnamWallTime(dateTimeLocal);
    const dt = vietnamDate || new Date(dateTimeLocal);
    if (isNaN(dt.getTime())) return null;
    return dt.toISOString();
  } catch (_e) {
    return null;
  }
};

export const formatDisplayDateTime = (value: DateValue, options: DateTimeFormatOptions = {}): string => {
  if (!value) return '';
  try {
    const dt = value instanceof Date ? value : new Date(value);
    if (isNaN(dt.getTime())) return '';

    const defaultOptions: DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: VIETNAM_TIMEZONE,
      ...options
    };

    return dt.toLocaleString('vi-VN', defaultOptions as Intl.DateTimeFormatOptions);
  } catch (_e) {
    return '';
  }
};

export const formatDisplayDate = (value: DateValue): string => {
  if (!value) return '';
  try {
    const dt = value instanceof Date ? value : new Date(value);
    if (isNaN(dt.getTime())) return '';
    return dt.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: VIETNAM_TIMEZONE,
    });
  } catch (_e) {
    return '';
  }
};

export const parseDateTimeLocal = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  try {
    const vietnamDate = parseVietnamWallTime(value);
    const dt = vietnamDate || new Date(value);
    return isNaN(dt.getTime()) ? null : dt;
  } catch (_e) {
    return null;
  }
};

/**
 * Kiểm tra xem thời gian hiện tại có nằm trong khoảng bắt đầu-kết thúc không
 */
export const isWithinTimeRange = (start: DateValue, end: DateValue): boolean => {
  if (!start || !end) return false;
  const now = Date.now();
  const startTime = start instanceof Date ? start.getTime() : new Date(start).getTime();
  const endTime = end instanceof Date ? end.getTime() : new Date(end).getTime();
  return now >= startTime && now <= endTime;
};
