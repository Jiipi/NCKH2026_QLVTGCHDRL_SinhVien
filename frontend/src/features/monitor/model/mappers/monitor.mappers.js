/**
 * Monitor Data Mappers (Tầng 2: Business Logic)
 * Map API response -> UI model
 */

/**
 * Map activity data từ API sang UI format
 */
export function mapActivityToUI(activity) {
  return {
    id: activity.id || activity.hd_id,
    hd_id: activity.hd_id || activity.id,
    ten_hd: activity.ten_hd || activity.name || 'Hoạt động',
    mo_ta: activity.mo_ta || activity.description,
    loai_hd: activity.loai_hd || activity.loai,
    diem_rl: activity.diem_rl || activity.diem || 0,
    ngay_bd: activity.ngay_bd,
    ngay_kt: activity.ngay_kt,
    dia_diem: activity.dia_diem || activity.location,
    registeredStudents: activity.registeredStudents || activity._count?.dang_ky_hd || 0
  };
}

/**
 * Map registration data từ API sang UI format
 */
export function mapRegistrationToUI(registration) {
  const activityData = registration.hoat_dong || registration.activity || {};
  const studentData = registration.sinh_vien || registration.student || {};
  
  return {
    id: registration.id || registration.dk_id,
    dk_id: registration.dk_id || registration.id,
    hoat_dong_id: registration.hoat_dong_id || registration.activity_id,
    sinh_vien_id: registration.sinh_vien_id || registration.student_id,
    trang_thai_dk: registration.trang_thai_dk || registration.status,
    status: mapRegistrationStatus(registration.trang_thai_dk || registration.status),
    ngay_dang_ky: registration.ngay_dang_ky,
    ngay_duyet: registration.ngay_duyet,
    ly_do_tu_choi: registration.ly_do_tu_choi,
    hoat_dong: mapActivityToUI(activityData),
    sinh_vien: {
      id: studentData.id || studentData.sinh_vien_id,
      mssv: studentData.mssv || studentData.student_code,
      ho_ten: studentData.nguoi_dung?.ho_ten || studentData.ho_ten || studentData.name,
      ten_lop: studentData.lop?.ten_lop || studentData.ten_lop || studentData.class_name
    }
  };
}

/**
 * Map registration status từ API sang UI format
 */
export function mapRegistrationStatus(status) {
  const statusMap = {
    'cho_duyet': 'cho_duyet',
    'da_duyet': 'da_duyet',
    'da_tham_gia': 'da_tham_gia',
    'tu_choi': 'tu_choi',
    'pending': 'cho_duyet',
    'approved': 'da_duyet',
    'participated': 'da_tham_gia',
    'attended': 'da_tham_gia',
    'rejected': 'tu_choi'
  };
  
  const normalized = String(status || '').toLowerCase();
  return statusMap[normalized] || 'cho_duyet';
}

/**
 * Map dashboard data từ API sang UI format
 */
export function mapDashboardToUI(apiData) {
  return {
    summary: {
      className: apiData.summary?.className || '',
      totalStudents: apiData.summary?.totalStudents || 0,
      pendingApprovals: apiData.summary?.pendingApprovals || 0,
      totalActivities: apiData.summary?.totalActivities || 0,
      avgClassScore: apiData.summary?.avgClassScore || 0,
      participationRate: apiData.summary?.participationRate || 0
    },
    upcomingActivities: (apiData.upcomingActivities || []).map(mapActivityToUI),
    recentApprovals: (apiData.recentApprovals || []).map(mapRegistrationToUI),
    topStudents: (apiData.topStudents || []).map(student => ({
      id: student.id,
      name: student.name,
      mssv: student.mssv,
      points: student.points || student.pointsRounded || 0,
      activitiesCount: student.activitiesCount || 0,
      nguoi_dung: student.nguoi_dung ? {
        ho_ten: student.nguoi_dung.ho_ten,
        anh_dai_dien: student.nguoi_dung.anh_dai_dien
      } : null
    }))
  };
}

/**
 * Group registrations by status
 */
export function groupRegistrationsByStatus(registrations) {
  const cho_duyet = [];
  const da_duyet = [];
  const da_tham_gia = [];
  const tu_choi = [];
  const all = [];

  registrations.forEach(registration => {
    const mapped = mapRegistrationToUI(registration);
    const status = mapped.status;
    
    all.push(mapped);
    
    switch (status) {
      case 'cho_duyet':
        cho_duyet.push(mapped);
        break;
      case 'da_duyet':
        da_duyet.push(mapped);
        break;
      case 'da_tham_gia':
        da_tham_gia.push(mapped);
        break;
      case 'tu_choi':
        tu_choi.push(mapped);
        break;
      default:
        cho_duyet.push(mapped);
    }
  });

  return { cho_duyet, da_duyet, da_tham_gia, tu_choi, all };
}

