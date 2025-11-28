/**
 * Student Data Mappers (Tầng 2: Business Logic)
 * Map API response -> UI model
 */

/**
 * Map activity registration status từ API sang UI format
 */
export function mapRegistrationStatus(status) {
  const statusMap = {
    'cho_duyet': 'pending',
    'da_duyet': 'approved',
    'da_tham_gia': 'joined',
    'tu_choi': 'rejected',
    'pending': 'pending',
    'approved': 'approved',
    'participated': 'joined',
    'attended': 'joined',
    'rejected': 'rejected'
  };
  
  const normalized = String(status || '').toLowerCase();
  return statusMap[normalized] || 'pending';
}

/**
 * Map activity data từ API sang UI format
 */
export function mapActivityToUI(activity) {
  const activityData = activity.hoat_dong || activity;
  
  // Process images - normalize to array
  const rawImages = activityData.hinh_anh || activity.hinh_anh || [];
  const hinh_anh = Array.isArray(rawImages) ? rawImages : (rawImages ? [rawImages] : []);
  
  // Process attachments - normalize to array
  const rawAttachments = activityData.tep_dinh_kem || activity.tep_dinh_kem || [];
  const tep_dinh_kem = Array.isArray(rawAttachments) ? rawAttachments : (rawAttachments ? [rawAttachments] : []);
  
  return {
    id: activity.id || activity.hd_id || activityData.id,
    hd_id: activity.hd_id || activity.id || activityData.id,
    ten_hd: activityData.ten_hd || activityData.name || activity.ten_hd || 'Hoạt động',
    mo_ta: activityData.mo_ta || activityData.description || activity.mo_ta,
    loai_hd: activityData.loai_hd || activityData.loai || activity.loai_hd,
    diem_rl: activityData.diem_rl || activity.diem_rl || activityData.diem || 0,
    ngay_bd: activityData.ngay_bd || activity.ngay_bd,
    ngay_kt: activityData.ngay_kt || activity.ngay_kt,
    dia_diem: activityData.dia_diem || activity.dia_diem || activityData.location,
    trang_thai_dk: activity.trang_thai_dk || activity.status || activityData.trang_thai_dk,
    status: mapRegistrationStatus(activity.trang_thai_dk || activity.status),
    ngay_dang_ky: activity.ngay_dang_ky,
    ngay_duyet: activity.ngay_duyet,
    ly_do_tu_choi: activity.ly_do_tu_choi,
    hinh_anh: hinh_anh,
    tep_dinh_kem: tep_dinh_kem,
    is_class_activity: activity.is_class_activity !== false, // Default true
    hoat_dong: activityData
  };
}

/**
 * Map dashboard data từ API sang UI format
 */
export function mapDashboardToUI(apiData) {
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
export function mapScoresToUI(apiData) {
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

/**
 * Group activities by status
 */
export function groupActivitiesByStatus(activities) {
  const pending = [];
  const approved = [];
  const joined = [];
  const rejected = [];
  const all = [];

  activities.forEach(activity => {
    const mapped = mapActivityToUI(activity);
    const status = mapped.status;
    
    all.push(mapped);
    
    switch (status) {
      case 'pending':
        pending.push(mapped);
        break;
      case 'approved':
        approved.push(mapped);
        break;
      case 'joined':
        joined.push(mapped);
        break;
      case 'rejected':
        rejected.push(mapped);
        break;
      default:
        pending.push(mapped);
    }
  });

  return { pending, approved, joined, rejected, all };
}

