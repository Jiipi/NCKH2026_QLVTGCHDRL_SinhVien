/**
 * Approval Filter Utilities
 * DRY: Reusable filtering logic
 */

import { getStatusFromTab } from './approvalStatus';

/**
 * Filters registrations by status (tab)
 * @param {Array} registrations - Array of registrations
 * @param {string} tab - Active tab name
 * @returns {Array} Filtered registrations
 */
export const filterByTab = (registrations, tab) => {
  const status = getStatusFromTab(tab);
  return registrations.filter(reg => reg.trang_thai_dk === status);
};

/**
 * Filters registrations by search term
 * @param {Array} registrations - Array of registrations
 * @param {string} searchTerm - Search query
 * @returns {Array} Filtered registrations
 */
export const filterBySearchTerm = (registrations, searchTerm) => {
  if (!searchTerm?.trim()) return registrations;
  
  const lowerSearch = searchTerm.toLowerCase();
  return registrations.filter(reg => {
    const studentName = reg.sinh_vien?.nguoi_dung?.ho_ten || '';
    const activityName = reg.hoat_dong?.ten_hd || '';
    const mssv = reg.sinh_vien?.mssv || '';
    
    return studentName.toLowerCase().includes(lowerSearch) ||
           activityName.toLowerCase().includes(lowerSearch) ||
           mssv.toLowerCase().includes(lowerSearch);
  });
};

/**
 * Filters registrations by MSSV
 * @param {Array} registrations - Array of registrations
 * @param {string} mssv - Student ID to filter
 * @returns {Array} Filtered registrations
 */
export const filterByMssv = (registrations, mssv) => {
  if (!mssv?.trim()) return registrations;
  
  const lowerMssv = mssv.toLowerCase();
  return registrations.filter(reg => {
    const studentMssv = reg.sinh_vien?.mssv || '';
    return studentMssv.toLowerCase().includes(lowerMssv);
  });
};

/**
 * Filters registrations by activity type
 * @param {Array} registrations - Array of registrations
 * @param {string} typeId - Activity type ID
 * @returns {Array} Filtered registrations
 */
export const filterByType = (registrations, typeId) => {
  if (!typeId) return registrations;
  
  return registrations.filter(reg => {
    return reg.hoat_dong?.loai_hd_id?.toString() === typeId.toString();
  });
};

/**
 * Filters registrations by date range
 * @param {Array} registrations - Array of registrations
 * @param {string} from - Start date
 * @param {string} to - End date
 * @returns {Array} Filtered registrations
 */
export const filterByDateRange = (registrations, from, to) => {
  let result = registrations;
  
  if (from) {
    const fromDate = new Date(from);
    result = result.filter(reg => {
      const activityDate = reg.hoat_dong?.ngay_bd;
      return activityDate && new Date(activityDate) >= fromDate;
    });
  }
  
  if (to) {
    const toDate = new Date(to);
    result = result.filter(reg => {
      const activityDate = reg.hoat_dong?.ngay_bd;
      return activityDate && new Date(activityDate) <= toDate;
    });
  }
  
  return result;
};

/**
 * Applies all filters to registrations
 * @param {Array} registrations - Array of registrations
 * @param {string} tab - Active tab
 * @param {string} searchTerm - Search query
 * @param {object} filters - Filter object { type, from, to, mssv }
 * @returns {Array} Filtered registrations
 */
export const applyAllFilters = (registrations, tab, searchTerm, filters = {}) => {
  let result = filterByTab(registrations, tab);
  result = filterBySearchTerm(result, searchTerm);
  
  if (filters.mssv) {
    result = filterByMssv(result, filters.mssv);
  }
  
  if (filters.type) {
    result = filterByType(result, filters.type);
  }
  
  if (filters.from || filters.to) {
    result = filterByDateRange(result, filters.from, filters.to);
  }
  
  return result;
};
