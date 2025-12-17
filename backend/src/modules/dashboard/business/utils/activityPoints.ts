/**
 * Activity Points Utility
 * Utility functions for calculating activity points
 */

import type { Decimal } from '@prisma/client/runtime/library';

export interface ActivityWithPoints {
  diem_rl?: Decimal | number | string | null;
  loai_hd?: {
    diem_mac_dinh?: Decimal | number | string | null;
  } | null;
}

/**
 * Xử lý giá trị có thể là Decimal, Number, hoặc String thành số
 */
function parseDecimalValue(value: unknown): number | null {
  if (value == null || value === undefined) {
    return null;
  }
  
  // Xử lý Decimal type từ Prisma
  if (typeof value === 'object' && value !== null && 'toNumber' in value) {
    return (value as { toNumber: () => number }).toNumber();
  }
  
  const parsed = parseFloat(String(value));
  
  // Nếu parseFloat trả về NaN hoặc không phải số hợp lệ, coi như null
  if (isNaN(parsed) || !isFinite(parsed)) {
    return null;
  }
  
  return parsed;
}

/**
 * Tính điểm cho hoạt động
 * Ưu tiên diem_rl của hoạt động, nếu null/undefined hoặc = 0 thì dùng diem_mac_dinh của loại hoạt động
 * @param activity - Đối tượng hoạt động
 * @returns Điểm rèn luyện
 */
export function calculateActivityPoints(activity: ActivityWithPoints | null | undefined): number {
  if (!activity) return 0;
  
  // Xử lý diem_rl
  const diemRl = parseDecimalValue(activity.diem_rl);
  
  // Nếu hoạt động có điểm được set và > 0, dùng điểm đó
  if (diemRl != null && diemRl > 0) {
    return diemRl;
  }
  
  // Nếu không có điểm hoặc = 0, dùng điểm mặc định của loại hoạt động
  if (activity.loai_hd && activity.loai_hd.diem_mac_dinh != null) {
    const diemMacDinh = parseDecimalValue(activity.loai_hd.diem_mac_dinh);
    return diemMacDinh ?? 0;
  }
  
  return 0;
}

export default { calculateActivityPoints };
