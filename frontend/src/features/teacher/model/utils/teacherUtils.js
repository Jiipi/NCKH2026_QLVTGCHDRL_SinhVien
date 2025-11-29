/**
 * Common Teacher Utilities (DRY Principle)
 * ========================================
 * Shared utilities for teacher hooks
 * 
 * @module features/teacher/model/utils/teacherUtils
 */

import { getCurrentSemesterValue as getSharedSemesterValue } from '../../../../shared/lib/semester';
import { setGlobalSemester, getGlobalSemester } from '../../../../shared/hooks/useSemesterData';

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
 * @returns {string} Semester string (e.g., 'hoc_ky_1_2025')
 */
export function getCurrentSemesterValue() {
  return getSharedSemesterValue();
}

/**
 * Session storage key for semester (legacy - kept for backward compatibility)
 */
export const SEMESTER_SESSION_KEY = 'current_semester';
export const GLOBAL_SEMESTER_KEY = 'selected_semester';
const BACKEND_CURRENT_SEMESTER_KEY = 'backend_current_semester';

/**
 * Load initial semester from session storage or calculate current
 * Priority: global selection > backend current semester > legacy key > calculated
 * @returns {string} Semester value
 */
export function loadInitialSemester() {
  try {
    // First check global selection (user's explicit choice)
    const globalSemester = getGlobalSemester();
    if (globalSemester) return globalSemester;
    
    // Check backend current semester (actual active semester from API)
    const backendCurrent = sessionStorage.getItem(BACKEND_CURRENT_SEMESTER_KEY);
    if (backendCurrent) return backendCurrent;
    
    // Legacy fallback
    const legacySemester = sessionStorage.getItem(SEMESTER_SESSION_KEY);
    if (legacySemester) return legacySemester;
    
    return getCurrentSemesterValue();
  } catch {
    return getCurrentSemesterValue();
  }
}

/**
 * Save semester to session storage AND broadcast globally
 * @param {string} semester - Semester value
 */
export function saveSemesterToSession(semester) {
  try {
    // Save to both keys for compatibility
    if (semester) {
      sessionStorage.setItem(SEMESTER_SESSION_KEY, semester);
    } else {
      sessionStorage.removeItem(SEMESTER_SESSION_KEY);
    }
    
    // Broadcast globally so other forms sync
    setGlobalSemester(semester);
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
