/**
 * Activity Filter Utilities
 * DRY: Reusable filtering logic for activities
 */

import { parseDateSafe } from './activityUtils';

/**
 * Filters activities by search query
 * @param {Array} activities - Array of activities
 * @param {string} query - Search query
 * @returns {Array} Filtered activities
 */
export const filterBySearch = (activities, query) => {
  if (!query?.trim()) return activities;
  
  const lowerQuery = query.toLowerCase();
  return activities.filter(activity => {
    const data = activity.hoat_dong || activity;
    const name = (data.ten_hd || '').toLowerCase();
    const desc = (data.mo_ta || '').toLowerCase();
    return name.includes(lowerQuery) || desc.includes(lowerQuery);
  });
};

/**
 * Filters activities by type
 * @param {Array} activities - Array of activities
 * @param {string} type - Activity type name
 * @returns {Array} Filtered activities
 */
export const filterByType = (activities, type) => {
  if (!type) return activities;
  
  return activities.filter(activity => {
    const data = activity.hoat_dong || activity;
    const typeName = data.loai_hd?.ten_loai_hd || '';
    return typeName === type;
  });
};

/**
 * Filters activities by type ID
 * @param {Array} activities - Array of activities
 * @param {string|number} typeId - Activity type ID
 * @returns {Array} Filtered activities
 */
export const filterByTypeId = (activities, typeId) => {
  if (!typeId) return activities;
  
  return activities.filter(activity => {
    const data = activity.hoat_dong || activity;
    return data.loai_hd_id?.toString() === typeId.toString();
  });
};

/**
 * Filters activities by status
 * @param {Array} activities - Array of activities
 * @param {string} status - Activity status
 * @returns {Array} Filtered activities
 */
export const filterByStatus = (activities, status) => {
  if (!status || status === 'all') return activities;
  
  return activities.filter(activity => {
    const data = activity.hoat_dong || activity;
    return data.trang_thai === status;
  });
};

/**
 * Filters activities by date range
 * @param {Array} activities - Array of activities
 * @param {string} from - Start date
 * @param {string} to - End date
 * @returns {Array} Filtered activities
 */
export const filterByDateRange = (activities, from, to) => {
  let result = activities;
  
  if (from) {
    const fromDate = new Date(from);
    result = result.filter(activity => {
      const data = activity.hoat_dong || activity;
      const startDate = parseDateSafe(data.ngay_bd);
      return startDate && startDate >= fromDate;
    });
  }
  
  if (to) {
    const toDate = new Date(to);
    result = result.filter(activity => {
      const data = activity.hoat_dong || activity;
      const startDate = parseDateSafe(data.ngay_bd);
      return startDate && startDate <= toDate;
    });
  }
  
  return result;
};

/**
 * Applies all filters to activities
 * @param {Array} activities - Array of activities
 * @param {object} filters - Filter object { query, type, status, from, to }
 * @returns {Array} Filtered activities
 */
export const applyAllFilters = (activities, filters = {}) => {
  let result = activities;
  
  if (filters.query) {
    result = filterBySearch(result, filters.query);
  }
  
  if (filters.type) {
    result = filterByType(result, filters.type);
  }
  
  if (filters.typeId) {
    result = filterByTypeId(result, filters.typeId);
  }
  
  if (filters.status) {
    result = filterByStatus(result, filters.status);
  }
  
  if (filters.from || filters.to) {
    result = filterByDateRange(result, filters.from, filters.to);
  }
  
  return result;
};

/**
 * Categorizes activities by registration status
 * @param {Array} activities - Array of activities
 * @returns {object} Categorized activities { pending, approved, joined, rejected }
 */
export const categorizeByRegistrationStatus = (activities) => {
  const pending = [];
  const approved = [];
  const joined = [];
  const rejected = [];

  for (const activity of activities) {
    const status = (activity.trang_thai_dk || '').toLowerCase();
    
    switch (status) {
      case 'cho_duyet':
        pending.push(activity);
        break;
      case 'da_duyet':
        approved.push(activity);
        break;
      case 'da_tham_gia':
        joined.push(activity);
        break;
      case 'tu_choi':
        rejected.push(activity);
        break;
      default:
        break;
    }
  }

  return { pending, approved, joined, rejected };
};
