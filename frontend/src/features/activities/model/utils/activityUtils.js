/**
 * Activity Utility Functions
 * DRY: Reusable utility functions for activity data processing
 */

import { 
  getCurrentSemesterValue as getSharedSemesterValue,
  buildSemesterValue,
  parseSemesterString,
  normalizeSemesterFormat
} from '../../../../shared/lib/semester';

/**
 * Safely parses a date string
 * @param {string|Date} dateValue - Date to parse
 * @returns {Date|null} Parsed date or null
 */
export const parseDateSafe = (dateValue) => {
  try {
    return dateValue ? new Date(dateValue) : null;
  } catch (_) {
    return null;
  }
};

/**
 * Gets the default semester based on current date
 * @returns {string} Semester string (hoc_ky_1 or hoc_ky_2)
 */
export const getDefaultSemester = () => {
  const month = new Date().getMonth() + 1;
  if (month >= 7 && month <= 11) return 'hoc_ky_1';
  return 'hoc_ky_2';
};

/**
 * Gets the default year based on current date (năm đơn)
 * @returns {string} Year string (e.g., "2025")
 */
export const getDefaultYearRange = () => {
  const today = new Date();
  const year = today.getFullYear();
  // Trả về năm đơn theo chuẩn mới
  return String(year);
};

/**
 * Computes the current semester value for dropdown
 * @param {string} hocKy - Semester (hoc_ky_1 or hoc_ky_2)
 * @param {string} namHoc - Academic year (e.g., "2025" - năm đơn)
 * @returns {string} Combined semester value (e.g., "hoc_ky_1_2025")
 */
export const computeSemesterValue = (hocKy, namHoc) => {
  if (!hocKy || !namHoc) return '';
  const hk = hocKy.replace('hoc_ky_', '');
  return buildSemesterValue(hk, namHoc);
};

/**
 * Parses semester dropdown value to hoc_ky and nam_hoc (năm đơn)
 * @param {string} selected - Selected value (e.g., "hoc_ky_1_2025" or "hoc_ky_1-2025")
 * @returns {object|null} Object with hocKy and namHoc, or null if invalid
 */
export const parseSemesterValue = (selected) => {
  const parsed = parseSemesterString(selected);
  if (!parsed) return null;
  return { hocKy: parsed.hocKy, namHoc: parsed.year };
};

/**
 * Gets the current semester value based on current date
 * @returns {string} Current semester value (e.g., "hoc_ky_1_2025")
 */
export const getCurrentSemesterValue = () => {
  return getSharedSemesterValue();
};

/**
 * Formats a date to datetime-local input format
 * Sử dụng local timezone thay vì UTC để tránh lệch giờ
 * @param {string|Date} dateValue - Date to format
 * @returns {string} Formatted date string (YYYY-MM-DDTHH:mm)
 */
export const formatToDatetimeLocal = (dateValue) => {
  if (!dateValue) return '';
  try {
    const dt = new Date(dateValue);
    if (isNaN(dt.getTime())) return '';
    // Lấy các thành phần theo local timezone (không dùng toISOString vì nó trả về UTC)
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    const hours = String(dt.getHours()).padStart(2, '0');
    const minutes = String(dt.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (_) {
    return '';
  }
};

/**
 * Checks if a date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the past
 */
export const isDatePast = (date) => {
  const d = parseDateSafe(date);
  return d ? d < new Date() : false;
};

/**
 * Checks if deadline has passed
 * @param {Date|string} deadline - Deadline date
 * @returns {boolean} True if deadline has passed
 */
export const isDeadlinePast = (deadline) => {
  const d = parseDateSafe(deadline);
  return d ? d.getTime() < Date.now() : false;
};

/**
 * Checks if current time is after activity start
 * @param {Date|string} startDate - Activity start date
 * @returns {boolean} True if after start
 */
export const isAfterStart = (startDate) => {
  const d = parseDateSafe(startDate);
  return d ? Date.now() >= d.getTime() : false;
};
