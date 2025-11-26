/**
 * Common Teacher Utilities (DRY Principle)
 * ========================================
 * Shared utilities for teacher hooks
 * 
 * @module features/teacher/model/utils/teacherUtils
 */

/**
 * Deduplicate items by ID
 * @param {Array} items - Array of items with id property
 * @returns {Array} Deduplicated array
 */
export function dedupeById(items = []) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.id || item.dk_id || item.registrationId;
    if (!key) return true;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Get current semester value based on current date
 * @returns {string} Semester string (e.g., 'hoc_ky_1-2025')
 */
export function getCurrentSemesterValue() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  if (currentMonth >= 7 && currentMonth <= 11) {
    return `hoc_ky_1-${currentYear}`;
  } else if (currentMonth === 12) {
    return `hoc_ky_2-${currentYear}`;
  } else if (currentMonth >= 1 && currentMonth <= 4) {
    return `hoc_ky_2-${currentYear - 1}`;
  }
  return `hoc_ky_1-${currentYear}`;
}

/**
 * Session storage key for semester
 */
export const SEMESTER_SESSION_KEY = 'current_semester';

/**
 * Load initial semester from session storage or calculate current
 * @returns {string} Semester value
 */
export function loadInitialSemester() {
  try {
    return sessionStorage.getItem(SEMESTER_SESSION_KEY) || getCurrentSemesterValue();
  } catch {
    return getCurrentSemesterValue();
  }
}

/**
 * Save semester to session storage
 * @param {string} semester - Semester value
 */
export function saveSemesterToSession(semester) {
  try {
    if (semester) {
      sessionStorage.setItem(SEMESTER_SESSION_KEY, semester);
    } else {
      sessionStorage.removeItem(SEMESTER_SESSION_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * Check if a date is within last N days
 * @param {string|Date} date - Date to check
 * @param {number} days - Number of days
 * @returns {boolean}
 */
export function isWithinDays(date, days = 7) {
  if (!date) return false;
  const diff = Date.now() - new Date(date).getTime();
  return diff <= days * 24 * 60 * 60 * 1000;
}

/**
 * Convert value to finite number with fallback
 * @param {any} value - Value to convert
 * @param {number} fallback - Fallback value
 * @returns {number}
 */
export function toFiniteNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

/**
 * Log in development only
 * @param {string} context - Log context
 * @param  {...any} args - Arguments to log
 */
export function devLog(context, ...args) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${context}]`, ...args);
  }
}

/**
 * Log warning in development only
 * @param {string} context - Log context
 * @param  {...any} args - Arguments to log
 */
export function devWarn(context, ...args) {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[${context}]`, ...args);
  }
}
