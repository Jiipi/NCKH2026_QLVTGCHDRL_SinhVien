/**
 * Utility functions for semester calculations
 * Xác định học kỳ dựa trên ngày tháng thực tế
 * 
 * CHUẨN HÓA FORMAT: hoc_ky_X_YYYY (underscore, không dùng dash)
 * Ví dụ: hoc_ky_1_2025, hoc_ky_2_2025
 * 
 * Logic:
 * - HK1: Tháng 7-11 (July - November)
 * - HK2: Tháng 12-4 (December - April)
 * - Nghỉ: Tháng 5-6 (May - June) - defaults to HK1
 */

/**
 * Normalize semester string to standard format: hoc_ky_X_YYYY
 * Accepts: hoc_ky_1-2025, hoc_ky_1_2025, hoc_ky_12025
 * @param {string} semesterStr - Input semester string
 * @returns {string|null} - Normalized format or null if invalid
 */
function normalizeSemesterFormat(semesterStr) {
  if (!semesterStr) return null;
  
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
 * @param {string} hocKy - 'hoc_ky_1' or 'hoc_ky_2'
 * @param {string|number} year - Year as YYYY
 * @returns {string} - Format: hoc_ky_X_YYYY
 */
function buildSemesterValue(hocKy, year) {
  const hkNum = hocKy.replace('hoc_ky_', '');
  return `hoc_ky_${hkNum}_${year}`;
}

/**
 * Xác định học kỳ và năm học từ một ngày cụ thể
 * @param {Date} date - Ngày cần xác định học kỳ
 * @returns {Object} - { semester: 'hoc_ky_1' | 'hoc_ky_2', yearLabel: 'YYYY-YYYY', year: 'YYYY', value: 'hoc_ky_X_YYYY' }
 */
function determineSemesterFromDate(date) {
  const month = date.getMonth() + 1; // 1-12
  const year = date.getFullYear();
  
  let semester, yearLabel, targetYear;
  
  if (month >= 7 && month <= 11) {
    // Tháng 7-11 = HK1 của năm học bắt đầu từ năm hiện tại
    semester = 'hoc_ky_1';
    yearLabel = `${year}-${year + 1}`;
    targetYear = year.toString();
  } else if (month === 12) {
    // Tháng 12 = HK2 của năm học bắt đầu từ năm hiện tại
    semester = 'hoc_ky_2';
    yearLabel = `${year}-${year + 1}`;
    targetYear = year.toString();
  } else if (month >= 1 && month <= 4) {
    // Tháng 1-4 = HK2 của năm học bắt đầu từ năm trước
    semester = 'hoc_ky_2';
    yearLabel = `${year - 1}-${year}`;
    targetYear = (year - 1).toString();
  } else {
    // Tháng 5-6 = Nghỉ hè, mặc định HK1
    semester = 'hoc_ky_1';
    yearLabel = `${year}-${year + 1}`;
    targetYear = year.toString();
  }
  
  return { 
    semester, 
    yearLabel, 
    year: targetYear,
    value: buildSemesterValue(semester, targetYear)
  };
}

/**
 * Lấy học kỳ hiện tại
 * @returns {Object} - { semester: 'hoc_ky_1' | 'hoc_ky_2', yearLabel: 'YYYY-YYYY', year: 'YYYY' }
 */
function getCurrentSemester() {
  return determineSemesterFromDate(new Date());
}

/**
 * Parse semester string từ query parameter
 * Hỗ trợ nhiều format: hoc_ky_1_2025, hoc_ky_1-2025, hoc_ky_12025
 * @param {string} semesterStr - Format: 'hoc_ky_1_2025' (chuẩn) hoặc 'hoc_ky_1-2025' (legacy)
 * @returns {Object|null} - { semester: 'hoc_ky_1', year: '2025', value: 'hoc_ky_1_2025' } hoặc null nếu invalid
 */
function parseSemesterString(semesterStr) {
  if (!semesterStr || semesterStr === 'current') {
    return getCurrentSemester();
  }

  // Normalize first
  const normalized = normalizeSemesterFormat(semesterStr);
  
  // Support new simplified format: 'hoc_ky_1' or 'hoc_ky_2' (semester-only)
  const semesterOnlyMatch = semesterStr.match(/^hoc_ky_(\d+)$/);
  if (semesterOnlyMatch) {
    const semesterNum = semesterOnlyMatch[1];
    return {
      semester: `hoc_ky_${semesterNum}`,
      year: null,
      yearLabel: null,
      value: null
    };
  }

  // Parse normalized format: hoc_ky_1_2025
  if (normalized) {
    const match = normalized.match(/^hoc_ky_(\d+)_(\d{4})$/);
    if (match) {
      const semesterNum = match[1];
      const year = match[2];
      return {
        semester: `hoc_ky_${semesterNum}`,
        year: year,
        yearLabel: year,
        value: normalized
      };
    }
  }

  return null;
}

/**
 * Build Prisma where clause cho filter hoạt động theo học kỳ
 * Hỗ trợ 2 chế độ:
 * 1. Strict mode: Dựa vào trường hoc_ky và nam_hoc trong DB (mặc định)
 * 2. Dynamic mode: Tự động xác định học kỳ từ ngay_bd của hoạt động
 * 
 * @param {string} semesterStr - Semester query string hoặc 'current'
 * @param {boolean} useDynamicFilter - Nếu true, filter theo ngay_bd thay vì hoc_ky
 * @returns {Object} - Prisma where clause
 */
function buildSemesterFilter(semesterStr, useDynamicFilter = false) {
  const semesterInfo = parseSemesterString(semesterStr);
  if (!semesterInfo) {
    return {}; // No filter if invalid
  }

  const { semester, year } = semesterInfo;

  if (useDynamicFilter) {
    // Dynamic filter: derive time window from year; if year missing, fallback to current year's window
    const effectiveYear = year ? parseInt(year, 10) : new Date().getFullYear();
    let startDate, endDate;
    if (semester === 'hoc_ky_1') {
      startDate = new Date(effectiveYear, 6, 1); // July 1
      endDate = new Date(effectiveYear, 10, 30, 23, 59, 59); // Nov 30
    } else {
      startDate = new Date(effectiveYear, 11, 1); // Dec 1
      endDate = new Date(effectiveYear + 1, 3, 30, 23, 59, 59); // Apr 30 of next year
    }
    return { ngay_bd: { gte: startDate, lte: endDate } };
  }

  // Strict filter:
  // After normalization nam_hoc is single-year 'YYYY'. If year absent => only filter by hoc_ky.
  if (!year) {
    return { hoc_ky: semester };
  }

  return { hoc_ky: semester, nam_hoc: year };
}

/**
 * Kiểm tra xem một hoạt động có thuộc học kỳ được chỉ định không
 * @param {Object} activity - Hoạt động với ngay_bd
 * @param {string} targetSemester - 'hoc_ky_1' hoặc 'hoc_ky_2'
 * @param {string} targetYear - Năm (YYYY)
 * @returns {boolean}
 */
function isActivityInSemester(activity, targetSemester, targetYear) {
  if (!activity.ngay_bd) return false;
  
  const activityDate = new Date(activity.ngay_bd);
  const { semester, year } = determineSemesterFromDate(activityDate);
  
  return semester === targetSemester && year === targetYear;
}

/**
 * Build activity where clause for semester filtering.
 * Chỉ dùng single year format (YYYY) - không hỗ trợ double year (YYYY-YYYY).
 * 
 * @param {string} semesterStr - Format: 'hoc_ky_1-2025'
 * @returns {Object} Prisma where clause
 */
function buildRobustActivitySemesterWhere(semesterStr) {
  const si = parseSemesterString(semesterStr);
  if (!si) return {};

  // If only semester provided (no year) - filter by hoc_ky only
  if (!si.year) {
    return { hoc_ky: si.semester };
  }

  // Single year format only: hoc_ky_1 + '2025'
  return {
    hoc_ky: si.semester,
    nam_hoc: si.year
  };
}

/**
 * Check if two semester strings represent the same semester
 * (format-agnostic comparison - handles both dash and underscore separators)
 * @param {string} sem1 - First semester string
 * @param {string} sem2 - Second semester string
 * @returns {boolean} - True if they represent the same semester
 */
function isSameSemester(sem1, sem2) {
  if (!sem1 || !sem2) return false;
  
  const normalized1 = normalizeSemesterFormat(sem1);
  const normalized2 = normalizeSemesterFormat(sem2);
  
  if (!normalized1 || !normalized2) return false;
  
  return normalized1 === normalized2;
}

module.exports = {
  normalizeSemesterFormat,
  buildSemesterValue,
  determineSemesterFromDate,
  getCurrentSemester,
  parseSemesterString,
  buildSemesterFilter,
  isActivityInSemester,
  buildRobustActivitySemesterWhere,
  isSameSemester
};




