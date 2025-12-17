/**
 * Student Data Mappers (Tầng 2: Business Logic)
 * Map API response -> UI model
 * 
 * NOTE: Core mapping functions have been moved to shared/lib/mappers
 * This file now re-exports and extends them for student-specific use cases
 */

import {
  mapActivityToUI as sharedMapActivityToUI,
  mapRegistrationStatusStudent,
  groupActivitiesByStatusStudent,
  type MappedActivity
} from '../../../../shared/lib/mappers';

// Re-export core functions
export { 
  mapRegistrationStatusStudent as mapRegistrationStatus,
  groupActivitiesByStatusStudent as groupActivitiesByStatus 
};

/**
 * Map activity data từ API sang UI format (student view)
 */
export function mapActivityToUI(activity: any): MappedActivity & { status: string } {
  const mapped = sharedMapActivityToUI(activity);
  return {
    ...mapped,
    status: mapRegistrationStatusStudent(mapped.trang_thai_dk)
  };
}

/**
 * Map dashboard data từ API sang UI format
 */
export function mapDashboardToUI(apiData: any) {
  return {
    sinh_vien: apiData.sinh_vien || {},
    hoat_dong_gan_day: (apiData.hoat_dong_gan_day || []).map(mapActivityToUI),
    hoat_dong_sap_toi: (apiData.hoat_dong_sap_toi || []).map(mapActivityToUI),
    tong_quan: {
      tong_diem: apiData.tong_quan?.tong_diem || 0,
      tong_hoat_dong: apiData.tong_quan?.tong_hoat_dong || 0,
      muc_tieu: apiData.tong_quan?.muc_tieu || 100
    },
    so_sanh_lop: {
      my_rank_in_class: apiData.so_sanh_lop?.my_rank_in_class || 1,
      total_students_in_class: apiData.so_sanh_lop?.total_students_in_class || 0
    },
    thong_bao_chua_doc: apiData.thong_bao_chua_doc || 0
  };
}

/**
 * Map scores data từ API sang UI format
 */
export function mapScoresToUI(apiData: any) {
  return {
    student_info: apiData.student_info || {},
    activities: (apiData.activities || []).map(mapActivityToUI),
    summary: {
      tong_diem: apiData.summary?.tong_diem || 0,
      tong_hoat_dong: apiData.summary?.tong_hoat_dong || 0,
      xep_loai: apiData.summary?.xep_loai || 'Chưa xếp loại'
    },
    class_rankings: {
      my_rank_in_class: apiData.class_rankings?.my_rank_in_class || 1,
      total_students_in_class: apiData.class_rankings?.total_students_in_class || 0
    }
  };
}
