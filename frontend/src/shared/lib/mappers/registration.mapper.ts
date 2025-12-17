/**
 * Shared Registration Mappers
 * Consolidated mapper functions for registration data transformation
 */

import { 
  extractApproverRole, 
  normalizeArrayField, 
  mapActivityToUI, 
  mapRegistrationStatusStudent,
  mapRegistrationStatusMonitor,
  MappedActivity 
} from './activity.mapper';

export interface MappedStudent {
  id: any;
  mssv: any;
  ho_ten: any;
  email?: any;
  ten_lop: any;
  lop?: any;
  nguoi_dung?: {
    ho_ten: any;
    email?: any;
    anh_dai_dien?: any;
  } | null;
}

export interface MappedRegistration {
  id: any;
  dk_id: any;
  hoat_dong_id: any;
  sinh_vien_id: any;
  trang_thai_dk: any;
  status: string;
  ngay_dang_ky: any;
  ngay_duyet: any;
  ly_do_tu_choi: any;
  approvedByRole: string | null;
  rejectedByRole: string | null;
  approvedByName: string | null;
  canProcess?: boolean;
  hoat_dong: MappedActivity;
  sinh_vien: MappedStudent;
  // Additional date fields for sorting
  updated_at?: any;
  updatedAt?: any;
  createdAt?: any;
  tg_diem_danh?: any;
}

/**
 * Map registration data từ API sang UI format (teacher view)
 */
export function mapRegistrationToUITeacher(registration: any): MappedRegistration {
  // Extract approver role từ nguoi_duyet object nếu có
  const approverRole = extractApproverRole(registration.nguoi_duyet);
  
  // Giữ nguyên registration nếu đã có cấu trúc đúng
  if (registration.id && registration.trang_thai_dk && registration.hoat_dong && registration.sinh_vien) {
    // Đảm bảo sinh_vien có nguoi_dung nếu chưa có
    if (registration.sinh_vien && !registration.sinh_vien.nguoi_dung && registration.sinh_vien.ho_ten) {
      registration.sinh_vien.nguoi_dung = {
        ho_ten: registration.sinh_vien.ho_ten,
        email: registration.sinh_vien.email
      };
    }
    // Thêm approvedByRole/rejectedByRole nếu chưa có
    if (!registration.approvedByRole && approverRole && registration.trang_thai_dk === 'da_duyet') {
      registration.approvedByRole = approverRole;
    }
    if (!registration.rejectedByRole && approverRole && registration.trang_thai_dk === 'tu_choi') {
      registration.rejectedByRole = approverRole;
    }
    // Thêm tên người duyệt
    if (registration.nguoi_duyet?.ho_ten) {
      registration.approvedByName = registration.nguoi_duyet.ho_ten;
    }
    return registration;
  }
  
  // Map từ cấu trúc cũ
  const registrationData = registration.dang_ky || registration;
  const activityData = registration.hoat_dong || registration.activity || {};
  const studentData = registration.sinh_vien || registration.student || {};
  const userData = studentData.nguoi_dung || studentData.user || {};
  
  // Determine approvedByRole/rejectedByRole based on status
  const status = registration.trang_thai_dk || registration.status || registrationData.trang_thai_dk;
  let finalApprovedByRole = registration.approvedByRole || registrationData.approvedByRole;
  let finalRejectedByRole = registration.rejectedByRole || registrationData.rejectedByRole;
  
  if (!finalApprovedByRole && approverRole && status === 'da_duyet') {
    finalApprovedByRole = approverRole;
  }
  if (!finalRejectedByRole && approverRole && status === 'tu_choi') {
    finalRejectedByRole = approverRole;
  }
  
  return {
    id: registration.id || registration.dk_id || registrationData.id,
    dk_id: registration.dk_id || registration.id || registrationData.id,
    hoat_dong_id: registration.hoat_dong_id || registration.activity_id || registrationData.hoat_dong_id,
    sinh_vien_id: registration.sinh_vien_id || registration.student_id || registrationData.sinh_vien_id,
    trang_thai_dk: status,
    status: mapRegistrationStatusStudent(status),
    ngay_dang_ky: registration.ngay_dang_ky || registrationData.ngay_dang_ky,
    ngay_duyet: registration.ngay_duyet || registrationData.ngay_duyet,
    ly_do_tu_choi: registration.ly_do_tu_choi || registrationData.ly_do_tu_choi,
    approvedByRole: finalApprovedByRole,
    rejectedByRole: finalRejectedByRole,
    approvedByName: registration.nguoi_duyet?.ho_ten || null,
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
 * Map registration data từ API sang UI format (monitor view)
 */
export function mapRegistrationToUIMonitor(registration: any): MappedRegistration {
  const activityData = registration.hoat_dong || registration.activity || {};
  const studentData = registration.sinh_vien || registration.student || {};
  
  // Extract approver role từ nguoi_duyet object nếu có
  const approverRole = extractApproverRole(registration.nguoi_duyet);
  const status = registration.trang_thai_dk || registration.status;
  
  // Determine approvedByRole/rejectedByRole based on status
  let approvedByRole = registration.approvedByRole;
  let rejectedByRole = registration.rejectedByRole;
  
  if (!approvedByRole && approverRole && status === 'da_duyet') {
    approvedByRole = approverRole;
  }
  if (!rejectedByRole && approverRole && status === 'tu_choi') {
    rejectedByRole = approverRole;
  }
  
  return {
    id: registration.id || registration.dk_id,
    dk_id: registration.dk_id || registration.id,
    hoat_dong_id: registration.hoat_dong_id || registration.activity_id,
    sinh_vien_id: registration.sinh_vien_id || registration.student_id,
    trang_thai_dk: status,
    status: mapRegistrationStatusMonitor(status),
    ngay_dang_ky: registration.ngay_dang_ky,
    ngay_duyet: registration.ngay_duyet,
    ly_do_tu_choi: registration.ly_do_tu_choi,
    approvedByRole: approvedByRole,
    rejectedByRole: rejectedByRole,
    approvedByName: registration.nguoi_duyet?.ho_ten || null,
    hoat_dong: mapActivityToUI(activityData),
    sinh_vien: {
      id: studentData.id || studentData.sinh_vien_id,
      mssv: studentData.mssv || studentData.student_code,
      ho_ten: studentData.nguoi_dung?.ho_ten || studentData.ho_ten || studentData.name,
      ten_lop: studentData.lop?.ten_lop || studentData.ten_lop || studentData.class_name,
      lop: studentData.lop,
      // Keep nguoi_dung for components that expect nested structure
      nguoi_dung: {
        ho_ten: studentData.nguoi_dung?.ho_ten || studentData.ho_ten || studentData.name,
        email: studentData.nguoi_dung?.email || studentData.email,
        anh_dai_dien: studentData.nguoi_dung?.anh_dai_dien || studentData.anh_dai_dien
      }
    }
  };
}

export interface GroupedRegistrations {
  pending?: MappedRegistration[];
  approved?: MappedRegistration[];
  joined?: MappedRegistration[];
  rejected?: MappedRegistration[];
  cho_duyet?: MappedRegistration[];
  da_duyet?: MappedRegistration[];
  da_tham_gia?: MappedRegistration[];
  tu_choi?: MappedRegistration[];
  all: MappedRegistration[];
}

/**
 * Group registrations by status (teacher view - English status)
 */
export function groupRegistrationsByStatusTeacher(registrations: any[]): GroupedRegistrations {
  const pending: MappedRegistration[] = [];
  const approved: MappedRegistration[] = [];
  const joined: MappedRegistration[] = [];
  const rejected: MappedRegistration[] = [];
  const all: MappedRegistration[] = [];

  registrations.forEach(registration => {
    const mapped = mapRegistrationToUITeacher(registration);
    
    all.push(mapped);
    
    switch (mapped.status) {
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

/**
 * Group registrations by status (monitor view - Vietnamese status)
 */
export function groupRegistrationsByStatusMonitor(registrations: any[]): GroupedRegistrations {
  const cho_duyet: MappedRegistration[] = [];
  const da_duyet: MappedRegistration[] = [];
  const da_tham_gia: MappedRegistration[] = [];
  const tu_choi: MappedRegistration[] = [];
  const all: MappedRegistration[] = [];

  registrations.forEach(registration => {
    const mapped = mapRegistrationToUIMonitor(registration);
    
    all.push(mapped);
    
    switch (mapped.status) {
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
