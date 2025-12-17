/**
 * Activity Filter Utilities
 * DRY: Reusable filtering logic for activities
 */

import { parseDateSafe } from './activityUtils';

// Type definitions
export interface Activity {
  id: string;
  ten_hd?: string;
  mo_ta?: string;
  trang_thai?: string;
  ngay_bd?: string | Date;
  ngay_kt?: string | Date;
  loai_hd_id?: string | number;
  loai_hd?: {
    id?: string;
    ten_loai_hd?: string;
  };
  trang_thai_dk?: string;
  hoat_dong?: Activity;
}

export interface ActivityFilters {
  query?: string;
  type?: string;
  typeId?: string | number;
  status?: string;
  from?: string;
  to?: string;
}

export interface CategorizedActivities {
  pending: Activity[];
  approved: Activity[];
  joined: Activity[];
  rejected: Activity[];
}

/**
 * Filters activities by search query
 * @param activities - Array of activities
 * @param query - Search query
 * @returns Filtered activities
 */
export const filterBySearch = (activities: Activity[], query: string): Activity[] => {
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
 * @param activities - Array of activities
 * @param type - Activity type name
 * @returns Filtered activities
 */
export const filterByType = (activities: Activity[], type: string): Activity[] => {
  if (!type) return activities;
  
  return activities.filter(activity => {
    const data = activity.hoat_dong || activity;
    const typeName = data.loai_hd?.ten_loai_hd || '';
    return typeName === type;
  });
};

/**
 * Filters activities by type ID
 * @param activities - Array of activities
 * @param typeId - Activity type ID
 * @returns Filtered activities
 */
export const filterByTypeId = (activities: Activity[], typeId: string | number): Activity[] => {
  if (!typeId) return activities;
  
  return activities.filter(activity => {
    const data = activity.hoat_dong || activity;
    return data.loai_hd_id?.toString() === typeId.toString();
  });
};

/**
 * Filters activities by status
 * @param activities - Array of activities
 * @param status - Activity status
 * @returns Filtered activities
 */
export const filterByStatus = (activities: Activity[], status: string): Activity[] => {
  if (!status || status === 'all') return activities;
  
  return activities.filter(activity => {
    const data = activity.hoat_dong || activity;
    return data.trang_thai === status;
  });
};

/**
 * Filters activities by date range
 * @param activities - Array of activities
 * @param from - Start date
 * @param to - End date
 * @returns Filtered activities
 */
export const filterByDateRange = (activities: Activity[], from?: string, to?: string): Activity[] => {
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
 * @param activities - Array of activities
 * @param filters - Filter object { query, type, status, from, to }
 * @returns Filtered activities
 */
export const applyAllFilters = (activities: Activity[], filters: ActivityFilters = {}): Activity[] => {
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
 * @param activities - Array of activities
 * @returns Categorized activities { pending, approved, joined, rejected }
 */
export const categorizeByRegistrationStatus = (activities: Activity[]): CategorizedActivities => {
  const pending: Activity[] = [];
  const approved: Activity[] = [];
  const joined: Activity[] = [];
  const rejected: Activity[] = [];

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
