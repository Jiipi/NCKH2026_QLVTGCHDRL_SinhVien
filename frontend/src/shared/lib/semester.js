/**
 * Semester utility functions for frontend
 * CHUẨN HÓA FORMAT: hoc_ky_X_YYYY (underscore, không dùng dash)
 * Ví dụ: hoc_ky_1_2025, hoc_ky_2_2025
 */

/**
 * Normalize semester string to standard format: hoc_ky_X_YYYY
 * Accepts: hoc_ky_1-2025, hoc_ky_1_2025, hoc_ky_12025
 * @param {string} semesterStr - Input semester string
 * @returns {string|null} - Normalized format or null if invalid
 */
export function normalizeSemesterFormat(semesterStr) {
  if (!semesterStr || typeof semesterStr !== 'string') return null;
  
  // Already correct format
  const correctMatch = semesterStr.match(/^hoc_ky_([12])_(\d{4})$/);
  if (correctMatch) return semesterStr;
  
  // Legacy dash format: hoc_ky_1-2025 -> hoc_ky_1_2025
  const dashMatch = semesterStr.match(/^hoc_ky_([12])-(\d{4})$/);
  if (dashMatch) return `hoc_ky_${dashMatch[1]}_${dashMatch[2]}`;
  
  // Compact format without separator: hoc_ky_12025 -> hoc_ky_1_2025
  const compactMatch = semesterStr.match(/^hoc_ky_([12])(\d{4})$/);
  if (compactMatch) return `hoc_ky_${compactMatch[1]}_${compactMatch[2]}`;
  
  return null;
}

/**
 * Build semester value from components
 * @param {string} hocKy - 'hoc_ky_1' or 'hoc_ky_2' or '1' or '2'
 * @param {string|number} year - Year as YYYY
 * @returns {string} - Format: hoc_ky_X_YYYY
 */
export function buildSemesterValue(hocKy, year) {
  if (!hocKy || !year) return '';
  const hkNum = String(hocKy).replace('hoc_ky_', '');
  return `hoc_ky_${hkNum}_${year}`;
}

/**
 * Parse semester string to components
 * @param {string} semesterStr - Format: hoc_ky_X_YYYY or hoc_ky_X-YYYY (legacy)
 * @returns {Object|null} - { hocKy: 'hoc_ky_1', year: '2025', value: 'hoc_ky_1_2025' }
 */
export function parseSemesterString(semesterStr) {
  const normalized = normalizeSemesterFormat(semesterStr);
  if (!normalized) return null;
  
  const match = normalized.match(/^hoc_ky_([12])_(\d{4})$/);
  if (!match) return null;
  
  return {
    hocKy: `hoc_ky_${match[1]}`,
    hocKyNum: match[1],
    year: match[2],
    value: normalized
  };
}

/**
 * Get current semester value based on current date
 * HK1: July - November (tháng 7-11)
 * HK2: December - April (tháng 12-4)
 * @returns {string} - Format: hoc_ky_X_YYYY
 */
export function getCurrentSemesterValue() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  if (currentMonth >= 7 && currentMonth <= 11) {
    return `hoc_ky_1_${currentYear}`;
  }
  if (currentMonth === 12) {
    return `hoc_ky_2_${currentYear}`;
  }
  if (currentMonth >= 1 && currentMonth <= 4) {
    return `hoc_ky_2_${currentYear - 1}`;
  }
  // May-June: default to HK1
  return `hoc_ky_1_${currentYear}`;
}

/**
 * Get semester display label
 * @param {string} semesterValue - Format: hoc_ky_X_YYYY
 * @returns {string} - Display label like "Học kỳ 1 - 2025"
 */
export function getSemesterLabel(semesterValue) {
  const parsed = parseSemesterString(semesterValue);
  if (!parsed) return semesterValue || '';
  
  return `Học kỳ ${parsed.hocKyNum} - ${parsed.year}`;
}

/**
 * Compare two semester values
 * @param {string} a - First semester
 * @param {string} b - Second semester
 * @returns {boolean} - True if they represent the same semester
 */
export function isSameSemester(a, b) {
  const normalizedA = normalizeSemesterFormat(a);
  const normalizedB = normalizeSemesterFormat(b);
  return normalizedA === normalizedB;
}

export default {
  normalizeSemesterFormat,
  buildSemesterValue,
  parseSemesterString,
  getCurrentSemesterValue,
  getSemesterLabel,
  isSameSemester
};
