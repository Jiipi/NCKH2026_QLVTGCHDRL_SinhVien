/**
 * Utility functions for semester calculations
 * Xác định học kỳ dựa trên ngày tháng thực tế
 * 
 * Logic:
 * - HK1: Tháng 7-11 (July - November)
 * - HK2: Tháng 12-4 (December - April)
 * - Nghỉ: Tháng 5-6 (May - June) - defaults to HK1
 */

/**
 * Xác định học kỳ và năm học từ một ngày cụ thể
 * @param {Date} date - Ngày cần xác định học kỳ
 * @returns {Object} - { semester: 'hoc_ky_1' | 'hoc_ky_2', yearLabel: 'YYYY-YYYY', year: 'YYYY' }
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
  
  return { semester, yearLabel, year: targetYear };
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
 * @param {string} semesterStr - Format: 'hoc_ky_1-2025' hoặc 'hoc_ky_2-2024'
 * @returns {Object|null} - { semester: 'hoc_ky_1', year: '2025' } hoặc null nếu invalid
 */
function parseSemesterString(semesterStr) {
  if (!semesterStr || semesterStr === 'current') {
    return getCurrentSemester();
  }

  // Support new simplified format: 'hoc_ky_1' or 'hoc_ky_2' (semester-only)
  const semesterOnlyMatch = semesterStr.match(/^hoc_ky_(\d+)$/);
  if (semesterOnlyMatch) {
    const semesterNum = semesterOnlyMatch[1];
    return {
      semester: `hoc_ky_${semesterNum}`,
      year: null,
      yearLabel: null
    };
  }

  // Legacy / explicit format: 'hoc_ky_1-2025'
  const match = semesterStr.match(/^hoc_ky_(\d+)-(\d{4})$/);
  if (match) {
    const semesterNum = match[1];
    const year = match[2];
    return {
      semester: `hoc_ky_${semesterNum}`,
      year: year,
      yearLabel: year
    };
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

module.exports = {
  determineSemesterFromDate,
  getCurrentSemester,
  parseSemesterString,
  buildSemesterFilter,
  isActivityInSemester,
  buildRobustActivitySemesterWhere
};




