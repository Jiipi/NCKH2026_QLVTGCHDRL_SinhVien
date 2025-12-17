/**
 * Admin Activity Types - Shared type definitions for admin activity components
 */

export interface ActivityType {
  id?: string;
  ten_loai_hd?: string;
}

export interface Activity {
  id: string;
  ten_hd?: string;
  hinh_anh?: string[];
  loai_hd?: ActivityType;
  loai?: string;
  diem_rl?: number;
  trang_thai?: string;
  ngay_bd?: string | Date;
  ngay_kt?: string | Date;
  han_dk?: string | Date;
  dia_diem?: string;
  [key: string]: unknown;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
}

export type ViewMode = 'grid' | 'list';
export type ScopeTab = 'all' | 'class';
