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

export interface ParsedSemester {
  hocKy: string;
  namHoc: string;
}

/**
 * Safely parses a date string
 * @param dateValue - Date to parse
 * @returns Parsed date or null
 */
export const parseDateSafe = (dateValue: string | Date | null | undefined): Date | null => {
  try {
    return dateValue ? new Date(dateValue) : null;
  } catch (_) {
    return null;
  }
};

/**
 * Gets the default semester based on current date
 * @returns Semester string (hoc_ky_1 or hoc_ky_2)
 */
export const getDefaultSemester = (): string => {
  const month = new Date().getMonth() + 1;
  if (month >= 7 && month <= 11) return 'hoc_ky_1';
  return 'hoc_ky_2';
};

/**
 * Gets the default year based on current date (năm đơn)
 * @returns Year string (e.g., "2025")
 */
export const getDefaultYearRange = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  // Trả về năm đơn theo chuẩn mới
  return String(year);
};

/**
 * Computes the current semester value for dropdown
 * @param hocKy - Semester (hoc_ky_1 or hoc_ky_2)
 * @param namHoc - Academic year (e.g., "2025" - năm đơn)
 * @returns Combined semester value (e.g., "hoc_ky_1_2025")
 */
export const computeSemesterValue = (hocKy: string, namHoc: string): string => {
  if (!hocKy || !namHoc) return '';
  const hk = hocKy.replace('hoc_ky_', '');
  return buildSemesterValue(hk, namHoc);
};

/**
 * Parses semester dropdown value to hoc_ky and nam_hoc (năm đơn)
 * @param selected - Selected value (e.g., "hoc_ky_1_2025" or "hoc_ky_1-2025")
 * @returns Object with hocKy and namHoc, or null if invalid
 */
export const parseSemesterValue = (selected: string): ParsedSemester | null => {
  const parsed = parseSemesterString(selected);
  if (!parsed) return null;
  return { hocKy: parsed.hocKy, namHoc: parsed.year };
};

/**
 * Gets the current semester value based on current date
 * @returns Current semester value (e.g., "hoc_ky_1_2025")
 */
export const getCurrentSemesterValue = (): string => {
  return getSharedSemesterValue();
};

/**
 * Formats a date to datetime-local input format
 * Sử dụng local timezone thay vì UTC để tránh lệch giờ
 * @param dateValue - Date to format
 * @returns Formatted date string (YYYY-MM-DDTHH:mm)
 */
export const formatToDatetimeLocal = (dateValue: string | Date | null | undefined): string => {
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
 * @param date - Date to check
 * @returns True if date is in the past
 */
export const isDatePast = (date: Date | string | null | undefined): boolean => {
  const d = parseDateSafe(date);
  return d ? d < new Date() : false;
};

/**
 * Checks if deadline has passed
 * @param deadline - Deadline date
 * @returns True if deadline has passed
 */
export const isDeadlinePast = (deadline: Date | string | null | undefined): boolean => {
  const d = parseDateSafe(deadline);
  return d ? d.getTime() < Date.now() : false;
};

/**
 * Checks if current time is after activity start
 * @param startDate - Activity start date
 * @returns True if after start
 */
export const isAfterStart = (startDate: Date | string | null | undefined): boolean => {
  const d = parseDateSafe(startDate);
  return d ? Date.now() >= d.getTime() : false;
};
