/**
 * Date/Time utility functions
 * Xử lý timezone đúng cách cho Việt Nam (UTC+7)
 */

/**
 * Format datetime cho input datetime-local
 * Sử dụng local timezone thay vì UTC để tránh lệch giờ
 * @param {string|Date} value - Giá trị datetime
 * @returns {string} Format YYYY-MM-DDTHH:mm cho datetime-local input
 */
export const formatDateTimeLocal = (value) => {
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
  } catch (e) { 
    return ''; 
  }
};

/**
 * Chuyển đổi datetime-local string sang ISO string với timezone
 * Để gửi lên backend, đảm bảo timezone được preserve
 * @param {string} dateTimeLocal - Giá trị từ input datetime-local (YYYY-MM-DDTHH:mm)
 * @returns {string|null} ISO string hoặc null nếu không hợp lệ
 */
export const toISOWithTimezone = (dateTimeLocal) => {
  if (!dateTimeLocal) return null;
  try {
    // datetime-local không có timezone info, parse theo local timezone của browser
    const dt = new Date(dateTimeLocal);
    if (isNaN(dt.getTime())) return null;
    // toISOString() trả về UTC, chính xác cho việc lưu trữ và so sánh
    return dt.toISOString();
  } catch (e) {
    return null;
  }
};

/**
 * Format datetime cho hiển thị người dùng
 * @param {string|Date} value - Giá trị datetime
 * @param {object} options - Tùy chọn format
 * @returns {string} Datetime đã format theo locale Việt Nam
 */
export const formatDisplayDateTime = (value, options = {}) => {
  if (!value) return '';
  try {
    const dt = value instanceof Date ? value : new Date(value);
    if (isNaN(dt.getTime())) return '';
    
    const defaultOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Ho_Chi_Minh',
      ...options
    };
    
    return dt.toLocaleString('vi-VN', defaultOptions);
  } catch (e) {
    return '';
  }
};

/**
 * Parse datetime-local string thành Date object
 * @param {string} value - Giá trị từ datetime-local input (YYYY-MM-DDTHH:mm)
 * @returns {Date|null} Date object hoặc null nếu không hợp lệ
 */
export const parseDateTimeLocal = (value) => {
  if (!value) return null;
  try {
    const dt = new Date(value);
    return isNaN(dt.getTime()) ? null : dt;
  } catch (e) {
    return null;
  }
};

/**
 * Kiểm tra xem thời gian hiện tại có nằm trong khoảng bắt đầu-kết thúc không
 * @param {string|Date} start - Thời gian bắt đầu
 * @param {string|Date} end - Thời gian kết thúc
 * @returns {boolean} true nếu đang trong khoảng thời gian
 */
export const isWithinTimeRange = (start, end) => {
  const now = Date.now();
  const startTime = start instanceof Date ? start.getTime() : new Date(start).getTime();
  const endTime = end instanceof Date ? end.getTime() : new Date(end).getTime();
  return now >= startTime && now <= endTime;
};
