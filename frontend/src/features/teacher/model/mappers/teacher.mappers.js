/**
 * Teacher Data Mappers (Tầng 2: Business Logic)
 * Map API response -> UI model
 */

/**
 * Map activity data từ API sang UI format
 */
export function mapActivityToUI(activity) {
  const activityData = activity.hoat_dong || activity;
  
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
    trang_thai: activity.trang_thai || activityData.trang_thai || 'pending',
    status: mapActivityStatus(activity.trang_thai || activityData.trang_thai || activity.status),
    nguoi_tao: activity.nguoi_tao || activityData.nguoi_tao,
    lop_id: activity.lop_id || activityData.lop_id,
    hoat_dong: activityData
  };
}

/**
 * Map activity status từ API sang UI format
 */
export function mapActivityStatus(status) {
  const statusMap = {
    'cho_duyet': 'pending',
    'da_duyet': 'approved',
    'tu_choi': 'rejected',
    'pending': 'pending',
    'approved': 'approved',
    'rejected': 'rejected',
    'dang_dien_ra': 'ongoing',
    'da_ket_thuc': 'completed'
  };
  
  const normalized = String(status || '').toLowerCase();
  return statusMap[normalized] || 'pending';
}

/**
 * Map registration status từ API sang UI format
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
 * Map dashboard data từ API sang UI format
 */
export function mapDashboardToUI(apiData) {
  return {
    summary: {
      totalActivities: apiData.summary?.totalActivities || 0,
      pendingApprovals: apiData.summary?.pendingApprovals || 0,
      totalStudents: apiData.summary?.totalStudents || 0,
      avgClassScore: apiData.summary?.avgClassScore || 0,
      participationRate: apiData.summary?.participationRate || 0,
      approvedThisWeek: apiData.summary?.approvedThisWeek || 0
    },
    pendingActivities: (apiData.pendingActivities || []).map(mapActivityToUI),
    pendingRegistrations: (apiData.pendingRegistrations || []).map(mapRegistrationToUI),
    classes: apiData.classes || [],
    students: apiData.students || []
  };
}

/**
 * Map registration data từ API sang UI format
 */
export function mapRegistrationToUI(registration) {
  // Giữ nguyên registration nếu đã có cấu trúc đúng
  if (registration.id && registration.trang_thai_dk && registration.hoat_dong && registration.sinh_vien) {
    // Đảm bảo sinh_vien có nguoi_dung nếu chưa có
    if (registration.sinh_vien && !registration.sinh_vien.nguoi_dung && registration.sinh_vien.ho_ten) {
      registration.sinh_vien.nguoi_dung = {
        ho_ten: registration.sinh_vien.ho_ten,
        email: registration.sinh_vien.email
      };
    }
    return registration;
  }
  
  // Map từ cấu trúc cũ
  const registrationData = registration.dang_ky || registration;
  const activityData = registration.hoat_dong || registration.activity || {};
  const studentData = registration.sinh_vien || registration.student || {};
  const userData = studentData.nguoi_dung || studentData.user || {};
  
  return {
    id: registration.id || registration.dk_id || registrationData.id,
    dk_id: registration.dk_id || registration.id || registrationData.id,
    hoat_dong_id: registration.hoat_dong_id || registration.activity_id || registrationData.hoat_dong_id,
    sinh_vien_id: registration.sinh_vien_id || registration.student_id || registrationData.sinh_vien_id,
    trang_thai_dk: registration.trang_thai_dk || registration.status || registrationData.trang_thai_dk,
    status: mapRegistrationStatus(registration.trang_thai_dk || registration.status),
    ngay_dang_ky: registration.ngay_dang_ky || registrationData.ngay_dang_ky,
    ngay_duyet: registration.ngay_duyet || registrationData.ngay_duyet,
    ly_do_tu_choi: registration.ly_do_tu_choi || registrationData.ly_do_tu_choi,
    approvedByRole: registration.approvedByRole || registrationData.approvedByRole,
    rejectedByRole: registration.rejectedByRole || registrationData.rejectedByRole,
    canProcess: registration.canProcess !== false,
    hoat_dong: mapActivityToUI(activityData),
    sinh_vien: {
      id: studentData.id || studentData.sinh_vien_id,
      mssv: studentData.mssv || studentData.student_code,
      ho_ten: userData.ho_ten || userData.name || studentData.ho_ten || studentData.name,
      email: userData.email || studentData.email,
      ten_lop: studentData.lop?.ten_lop || studentData.ten_lop || studentData.class_name,
      nguoi_dung: userData.ho_ten ? userData : (studentData.ho_ten ? { ho_ten: studentData.ho_ten, email: studentData.email } : null)
    }
  };
}

/**
 * Map student score data từ API sang UI format
 */
export function mapStudentScoreToUI(score) {
  const studentData = score.sinh_vien || score.student || {};
  
  return {
    id: score.id || studentData.id,
    sinh_vien_id: score.sinh_vien_id || studentData.id,
    mssv: studentData.mssv || studentData.student_code,
    ho_ten: studentData.ho_ten || studentData.name,
    ten_lop: studentData.lop?.ten_lop || studentData.ten_lop || studentData.class_name,
    tong_diem: score.tong_diem || score.total_points || 0,
    tong_hoat_dong: score.tong_hoat_dong || score.total_activities || 0,
    xep_loai: score.xep_loai || score.classification || 'Chưa xếp loại',
    hoat_dong: (score.hoat_dong || score.activities || []).map(mapActivityToUI)
  };
}

/**
 * Map attendance data từ API sang UI format
 */
export function mapAttendanceToUI(attendance) {
  const attendanceData = attendance.diem_danh || attendance;
  const studentData = attendance.sinh_vien || attendance.student || {};
  const activityData = attendance.hoat_dong || attendance.activity || {};
  
  return {
    id: attendance.id || attendanceData.id,
    hoat_dong_id: attendance.hoat_dong_id || attendance.activity_id || attendanceData.hoat_dong_id,
    sinh_vien_id: attendance.sinh_vien_id || attendance.student_id || attendanceData.sinh_vien_id,
    trang_thai: attendance.trang_thai || attendance.status || attendanceData.trang_thai,
    status: mapAttendanceStatus(attendance.trang_thai || attendance.status),
    ngay_diem_danh: attendance.ngay_diem_danh || attendanceData.ngay_diem_danh,
    ghi_chu: attendance.ghi_chu || attendanceData.ghi_chu,
    hoat_dong: mapActivityToUI(activityData),
    sinh_vien: {
      id: studentData.id || studentData.sinh_vien_id,
      mssv: studentData.mssv || studentData.student_code,
      ho_ten: studentData.ho_ten || studentData.name,
      ten_lop: studentData.lop?.ten_lop || studentData.ten_lop || studentData.class_name
    }
  };
}

/**
 * Map attendance status từ API sang UI format
 */
export function mapAttendanceStatus(status) {
  const statusMap = {
    'co_mat': 'present',
    'vang': 'absent',
    'co_phep': 'excused',
    'present': 'present',
    'absent': 'absent',
    'excused': 'excused'
  };
  
  const normalized = String(status || '').toLowerCase();
  return statusMap[normalized] || 'absent';
}

/**
 * Group activities by status
 */
export function groupActivitiesByStatus(activities) {
  const pending = [];
  const approved = [];
  const rejected = [];
  const ongoing = [];
  const completed = [];
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
      case 'rejected':
        rejected.push(mapped);
        break;
      case 'ongoing':
        ongoing.push(mapped);
        break;
      case 'completed':
        completed.push(mapped);
        break;
      default:
        pending.push(mapped);
    }
  });

  return { pending, approved, rejected, ongoing, completed, all };
}

/**
 * Group registrations by status
 */
export function groupRegistrationsByStatus(registrations) {
  const pending = [];
  const approved = [];
  const joined = [];
  const rejected = [];
  const all = [];

  registrations.forEach(registration => {
    const mapped = mapRegistrationToUI(registration);
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

