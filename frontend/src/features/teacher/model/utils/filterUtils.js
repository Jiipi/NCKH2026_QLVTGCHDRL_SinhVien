/**
 * Filter Utilities (DRY Principle)
 * ================================
 * Reusable filtering functions for teacher data
 * 
 * @module features/teacher/model/utils/filterUtils
 */

/**
 * Filter items by search term across multiple fields
 * @param {Array} items - Items to filter
 * @param {string} searchTerm - Search term
 * @param {Function[]} fieldGetters - Functions to extract searchable fields from item
 * @returns {Array} Filtered array
 */
export function filterBySearch(items, searchTerm, fieldGetters) {
  if (!searchTerm) return items;
  
  const term = searchTerm.toLowerCase();
  return items.filter(item => 
    fieldGetters.some(getter => {
      const value = getter(item);
      return value && String(value).toLowerCase().includes(term);
    })
  );
}

/**
 * Filter items by status
 * @param {Array} items - Items to filter
 * @param {string} statusField - Field name containing status
 * @param {string} targetStatus - Status to filter by
 * @returns {Array} Filtered array
 */
export function filterByStatus(items, statusField, targetStatus) {
  if (!targetStatus || targetStatus === 'all') return items;
  return items.filter(item => item[statusField] === targetStatus);
}

/**
 * Filter items by date range
 * @param {Array} items - Items to filter
 * @param {string} dateField - Field name containing date
 * @param {string} fromDate - Start date (ISO string)
 * @param {string} toDate - End date (ISO string)
 * @returns {Array} Filtered array
 */
export function filterByDateRange(items, dateField, fromDate, toDate) {
  return items.filter(item => {
    const itemDate = item[dateField];
    if (!itemDate) return true;
    
    const date = new Date(itemDate);
    
    if (fromDate && date < new Date(fromDate)) return false;
    if (toDate && date > new Date(toDate)) return false;
    
    return true;
  });
}

/**
 * Filter items by numeric range
 * @param {Array} items - Items to filter
 * @param {Function} valueGetter - Function to extract numeric value
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {Array} Filtered array
 */
export function filterByNumericRange(items, valueGetter, min, max) {
  return items.filter(item => {
    const value = valueGetter(item);
    if (min !== null && min !== undefined && value < min) return false;
    if (max !== null && max !== undefined && value > max) return false;
    return true;
  });
}

/**
 * Registration view modes and their status mappings
 */
export const REGISTRATION_VIEW_MODES = {
  pending: 'cho_duyet',
  approved: 'da_duyet',
  rejected: 'tu_choi',
  all: null
};

/**
 * Activity status mappings
 */
export const ACTIVITY_STATUS_MAP = {
  pending: 'cho_duyet',
  approved: 'da_duyet',
  rejected: 'tu_choi',
  ongoing: 'dang_dien_ra',
  completed: 'da_ket_thuc'
};

/**
 * Filter registrations by view mode
 * @param {Array} registrations - Registrations to filter
 * @param {string} viewMode - View mode (pending/approved/rejected/all)
 * @returns {Array} Filtered array
 */
export function filterRegistrationsByViewMode(registrations, viewMode) {
  const targetStatus = REGISTRATION_VIEW_MODES[viewMode];
  if (!targetStatus) return registrations;
  return filterByStatus(registrations, 'trang_thai_dk', targetStatus);
}

/**
 * Create registration search field getters
 * @returns {Function[]} Array of field getter functions
 */
export function createRegistrationSearchGetters() {
  return [
    (reg) => reg.sinh_vien?.nguoi_dung?.ho_ten || reg.sinh_vien?.ho_ten,
    (reg) => reg.sinh_vien?.nguoi_dung?.email || reg.sinh_vien?.email,
    (reg) => reg.hoat_dong?.ten_hd,
    (reg) => reg.sinh_vien?.mssv
  ];
}

/**
 * Create activity search field getters
 * @returns {Function[]} Array of field getter functions
 */
export function createActivitySearchGetters() {
  return [
    (act) => act.ten_hd,
    (act) => act.mo_ta,
    (act) => act.dia_diem
  ];
}
