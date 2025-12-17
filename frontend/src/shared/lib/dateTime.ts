/**
 * Date/Time utility functions
 * Xử lý timezone đúng cách cho Việt Nam (UTC+7)
 */

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

/**
 * Format datetime cho input datetime-local
 * Sử dụng local timezone thay vì UTC để tránh lệch giờ
 */
export const formatDateTimeLocal = (value: DateValue): string => {
  if (!value) return '';
  try {
    const dt = value instanceof Date ? value : new Date(value);
    if (isNaN(dt.getTime())) return '';
    // Lấy các thành phần theo local timezone (không dùng toISOString vì nó trả về UTC)
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    const hours = String(dt.getHours()).padStart(2, '0');
    const minutes = String(dt.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (_e) { 
    return ''; 
  }
};

/**
 * Chuyển đổi datetime-local string sang ISO string với timezone
 * Để gửi lên backend, đảm bảo timezone được preserve
 */
export const toISOWithTimezone = (dateTimeLocal: string | null | undefined): string | null => {
  if (!dateTimeLocal) return null;
  try {
    // datetime-local không có timezone info, parse theo local timezone của browser
    const dt = new Date(dateTimeLocal);
    if (isNaN(dt.getTime())) return null;
    // toISOString() trả về UTC, chính xác cho việc lưu trữ và so sánh
    return dt.toISOString();
  } catch (_e) {
    return null;
  }
};

/**
 * Format datetime cho hiển thị người dùng
 */
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
      timeZone: 'Asia/Ho_Chi_Minh',
      ...options
    };
    
    return dt.toLocaleString('vi-VN', defaultOptions as Intl.DateTimeFormatOptions);
  } catch (_e) {
    return '';
  }
};

/**
 * Parse datetime-local string thành Date object
 */
export const parseDateTimeLocal = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  try {
    const dt = new Date(value);
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
