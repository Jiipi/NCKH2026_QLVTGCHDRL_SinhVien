/**
 * Approval Filter Utilities
 * DRY: Reusable filtering logic
 */

import { getStatusFromTab } from './approvalStatus';

/** Filter options for approval registrations */
export interface ApprovalFilterParams {
  mssv?: string;
  type?: string;
  from?: string;
  to?: string;
}

/** Registration item structure (partial, used for filtering) */
interface Registration {
  trang_thai_dk?: string;
  sinh_vien?: {
    mssv?: string;
    nguoi_dung?: {
      ho_ten?: string;
    };
  };
  hoat_dong?: {
    ten_hd?: string;
    loai_hd_id?: string | number;
    ngay_bd?: string | Date;
  };
}

/**
 * Filters registrations by status (tab)
 * @param registrations - Array of registrations
 * @param tab - Active tab name
 * @returns Filtered registrations
 */
export const filterByTab = (registrations: Registration[], tab: string): Registration[] => {
  const status = getStatusFromTab(tab);
  return registrations.filter(reg => reg.trang_thai_dk === status);
};

/**
 * Filters registrations by search term
 * @param registrations - Array of registrations
 * @param searchTerm - Search query
 * @returns Filtered registrations
 */
export const filterBySearchTerm = (registrations: Registration[], searchTerm: string): Registration[] => {
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
 * @param registrations - Array of registrations
 * @param mssv - Student ID to filter
 * @returns Filtered registrations
 */
export const filterByMssv = (registrations: Registration[], mssv: string): Registration[] => {
  if (!mssv?.trim()) return registrations;
  
  const lowerMssv = mssv.toLowerCase();
  return registrations.filter(reg => {
    const studentMssv = reg.sinh_vien?.mssv || '';
    return studentMssv.toLowerCase().includes(lowerMssv);
  });
};

/**
 * Filters registrations by activity type
 * @param registrations - Array of registrations
 * @param typeId - Activity type ID
 * @returns Filtered registrations
 */
export const filterByType = (registrations: Registration[], typeId: string): Registration[] => {
  if (!typeId) return registrations;
  
  return registrations.filter(reg => {
    return reg.hoat_dong?.loai_hd_id?.toString() === typeId.toString();
  });
};

/**
 * Filters registrations by date range
 * @param registrations - Array of registrations
 * @param from - Start date
 * @param to - End date
 * @returns Filtered registrations
 */
export const filterByDateRange = (registrations: Registration[], from?: string, to?: string): Registration[] => {
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
 * @param registrations - Array of registrations
 * @param tab - Active tab
 * @param searchTerm - Search query
 * @param filters - Filter object { type, from, to, mssv }
 * @returns Filtered registrations
 */
export const applyAllFilters = (
  registrations: Registration[],
  tab: string,
  searchTerm: string,
  filters: ApprovalFilterParams = {}
): Registration[] => {
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
