/**
 * Teacher Data Mappers (Tầng 2: Business Logic)
 * Map API response -> UI model
 * 
 * NOTE: Core mapping functions have been moved to shared/lib/mappers
 * This file now re-exports and extends them for teacher-specific use cases
 */

import {
  mapActivityToUI as sharedMapActivityToUI,
  mapActivityStatus,
  mapAttendanceStatus,
  mapRegistrationStatusStudent,
  groupActivitiesByStatusTeacher,
  mapRegistrationToUITeacher,
  groupRegistrationsByStatusTeacher,
  type MappedActivity
} from '../../../../shared/lib/mappers';

// Re-export core functions
export { 
  mapActivityStatus,
  mapAttendanceStatus,
  mapRegistrationStatusStudent as mapRegistrationStatus,
  groupActivitiesByStatusTeacher as groupActivitiesByStatus,
  mapRegistrationToUITeacher as mapRegistrationToUI,
  groupRegistrationsByStatusTeacher as groupRegistrationsByStatus
};

/**
 * Map activity data từ API sang UI format (teacher view)
 */
export function mapActivityToUI(activity: any): MappedActivity & { status: string } {
  const mapped = sharedMapActivityToUI(activity);
  return {
    ...mapped,
    status: mapActivityStatus(mapped.trang_thai)
  };
}

/**
 * Map dashboard data từ API sang UI format
 */
export function mapDashboardToUI(apiData: any) {
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
    pendingRegistrations: (apiData.pendingRegistrations || []).map(mapRegistrationToUITeacher),
    classes: apiData.classes || [],
    students: apiData.students || []
  };
}

/**
 * Map student score data từ API sang UI format
 */
export function mapStudentScoreToUI(score: any) {
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
export function mapAttendanceToUI(attendance: any) {
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
