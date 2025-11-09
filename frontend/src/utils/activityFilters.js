/**
 * ================================================================
 * SHARED ACTIVITY FILTERS - SINGLE SOURCE OF TRUTH
 * ================================================================
 * Tất cả các role (student, monitor, teacher, admin) PHẢI dùng 
 * các function này để đảm bảo tính toán đồng nhất
 * ================================================================
 */

/**
 * Chuẩn hóa dữ liệu hoạt động từ backend
 * Đảm bảo tất cả fields có tên nhất quán
 */
export const normalizeActivity = (activity) => {
  if (!activity) return null;
  
  return {
    // ID fields
    id: activity.id || activity.activity_id,
    
    // Basic info
    ten_hd: activity.ten_hd || activity.name || activity.title || '',
    mo_ta: activity.mo_ta || activity.description || '',
    
    // Dates
    ngay_bd: activity.ngay_bd || activity.start_date || activity.startDate,
    ngay_kt: activity.ngay_kt || activity.end_date || activity.endDate,
    han_dang_ky: activity.han_dang_ky || activity.registration_deadline || activity.deadline,
    
    // Location & Type
    dia_diem: activity.dia_diem || activity.location || '',
    loai_hd_id: activity.loai_hd_id || activity.loai_hd?.id || activity.type_id,
    
    // Status
    trang_thai: (activity.trang_thai || activity.status || '').toLowerCase(),
    
    // Scope & Capacity
    is_class_activity: activity.is_class_activity === true || activity.pham_vi === 'lop' || activity.lop_id != null,
    pham_vi: activity.pham_vi || activity.scope,
    lop_id: activity.lop_id || activity.class_id,
    
    so_luong_toi_da: activity.so_luong_toi_da || activity.sl_toi_da || activity.max_capacity || null,
    so_dang_ky: activity.so_dang_ky || activity.registrationCount || activity._count?.dang_ky_hd || 0,
    
    // Points
    diem_rl: activity.diem_rl || activity.points || 0,
    
    // Registration status (for personal activities)
    trang_thai_dk: activity.trang_thai_dk || activity.registration_status,
    is_registered: activity.is_registered || false,
    
    // Semester
    hoc_ky: activity.hoc_ky || activity.semester || activity.sem,
    
    // Keep original for reference
    _original: activity
  };
};

/**
 * Parse date an toàn, trả về Date object hoặc null
 */
export const parseDateSafe = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * ================================================================
 * CORE FILTERS - DÙNG CHO TẤT CẢ ROLE
 * ================================================================
 */

/**
 * Kiểm tra hoạt động có thuộc lớp không
 * @param {Object} activity - Activity object (normalized)
 * @returns {boolean}
 */
export const isClassActivity = (activity) => {
  const normalized = normalizeActivity(activity);
  return normalized.is_class_activity === true;
};

/**
 * Kiểm tra hoạt động có thuộc học kỳ không
 * @param {Object} activity - Activity object (normalized)
 * @param {string} semester - Semester ID (e.g., "hoc_ky_1-2024")
 * @returns {boolean}
 */
export const isInSemester = (activity, semester) => {
  if (!semester) return true; // Nếu không có filter thì pass all
  const normalized = normalizeActivity(activity);
  return normalized.hoc_ky === semester;
};

/**
 * Kiểm tra hoạt động đã được duyệt
 * @param {Object} activity - Activity object (normalized)
 * @returns {boolean}
 */
export const isApproved = (activity) => {
  const normalized = normalizeActivity(activity);
  return normalized.trang_thai === 'da_duyet' || normalized.trang_thai === 'approved';
};

/**
 * Kiểm tra hoạt động đã kết thúc
 * @param {Object} activity - Activity object (normalized)
 * @returns {boolean}
 */
export const isEnded = (activity) => {
  const normalized = normalizeActivity(activity);
  const now = new Date();
  const endDate = parseDateSafe(normalized.ngay_kt);
  return endDate && endDate < now;
};

/**
 * Kiểm tra hoạt động đã đầy (hết chỗ)
 * @param {Object} activity - Activity object (normalized)
 * @returns {boolean}
 */
export const isFull = (activity) => {
  const normalized = normalizeActivity(activity);
  const capacity = normalized.so_luong_toi_da;
  const registered = normalized.so_dang_ky;
  
  if (capacity === null || capacity === undefined) return false; // Không giới hạn
  return Number(registered) >= Number(capacity);
};

/**
 * Kiểm tra còn thời hạn đăng ký
 * @param {Object} activity - Activity object (normalized)
 * @returns {boolean}
 */
export const isWithinRegistrationDeadline = (activity) => {
  const normalized = normalizeActivity(activity);
  const now = new Date();
  
  // Nếu có hạn đăng ký riêng
  const deadline = parseDateSafe(normalized.han_dang_ky);
  if (deadline) {
    return deadline >= now;
  }
  
  // Nếu không có hạn đăng ký, check ngày bắt đầu
  const startDate = parseDateSafe(normalized.ngay_bd);
  if (startDate) {
    return startDate >= now;
  }
  
  // Nếu không có cả hai, check ngày kết thúc
  const endDate = parseDateSafe(normalized.ngay_kt);
  if (endDate) {
    return endDate >= now;
  }
  
  return true; // Default: pass if no dates
};

/**
 * ================================================================
 * COMPOSITE FILTERS - DÙNG CHO CÁC TAB CỤ THỂ
 * ================================================================
 */

/**
 * Filter: Hoạt động "Có sẵn" (cho sinh viên & lớp trưởng đăng ký)
 * Điều kiện: Lớp + Đã duyệt + Chưa kết thúc + Còn chỗ + Chưa đăng ký hoặc bị từ chối
 * @param {Object} activity - Activity object
 * @param {string} semester - Current semester
 * @param {Array} userRegistrations - Danh sách đăng ký của user
 * @returns {boolean}
 */
export const isAvailableForRegistration = (activity, semester, userRegistrations = []) => {
  const normalized = normalizeActivity(activity);
  
  // 1. Phải là hoạt động lớp
  if (!isClassActivity(normalized)) return false;
  
  // 2. Phải thuộc học kỳ hiện tại
  if (!isInSemester(normalized, semester)) return false;
  
  // 3. Phải đã được duyệt
  if (!isApproved(normalized)) return false;
  
  // 4. Chưa kết thúc
  if (isEnded(normalized)) return false;
  
  // 5. Còn chỗ trống
  if (isFull(normalized)) return false;
  
  // 6. Kiểm tra user chưa đăng ký hoặc đã bị từ chối (có thể đăng ký lại)
  const userReg = userRegistrations.find(r => 
    (r.activity_id || r.hoat_dong_id) === normalized.id
  );
  
  if (userReg) {
    const regStatus = (userReg.trang_thai_dk || userReg.status || '').toLowerCase();
    // Chỉ cho phép đăng ký lại nếu bị từ chối
    return regStatus === 'tu_choi' || regStatus === 'rejected';
  }
  
  return true; // Chưa đăng ký
};

/**
 * Filter: Hoạt động "Sắp diễn ra" trên dashboard
 * Điều kiện: Lớp + Đã duyệt (đơn giản, giống tab "Có sẵn")
 * @param {Object} activity - Activity object
 * @param {string} semester - Current semester
 * @returns {boolean}
 */
export const isUpcoming = (activity, semester) => {
  const normalized = normalizeActivity(activity);
  
  return isClassActivity(normalized) 
    && isInSemester(normalized, semester)
    && isApproved(normalized);
};

/**
 * ================================================================
 * ARRAY PROCESSORS - XỬ LÝ DANH SÁCH HOẠT ĐỘNG
 * ================================================================
 */

/**
 * Lọc danh sách hoạt động "Có sẵn"
 * @param {Array} activities - Danh sách hoạt động
 * @param {string} semester - Học kỳ hiện tại
 * @param {Array} userRegistrations - Đăng ký của user
 * @returns {Array}
 */
export const filterAvailableActivities = (activities, semester, userRegistrations = []) => {
  return activities
    .map(normalizeActivity)
    .filter(a => isAvailableForRegistration(a, semester, userRegistrations));
};

/**
 * Lọc danh sách hoạt động "Sắp diễn ra"
 * @param {Array} activities - Danh sách hoạt động
 * @param {string} semester - Học kỳ hiện tại
 * @returns {Array}
 */
export const filterUpcomingActivities = (activities, semester) => {
  return activities
    .map(normalizeActivity)
    .filter(a => isUpcoming(a, semester))
    .sort((a, b) => {
      const aStart = parseDateSafe(a.ngay_bd) || parseDateSafe(a.ngay_kt) || new Date(8640000000000000);
      const bStart = parseDateSafe(b.ngay_bd) || parseDateSafe(b.ngay_kt) || new Date(8640000000000000);
      return aStart - bStart;
    });
};

/**
 * Lọc danh sách hoạt động theo trạng thái
 * @param {Array} activities - Danh sách hoạt động
 * @param {string} status - Trạng thái cần lọc
 * @param {string} semester - Học kỳ hiện tại
 * @returns {Array}
 */
export const filterActivitiesByStatus = (activities, status, semester) => {
  return activities
    .map(normalizeActivity)
    .filter(a => {
      if (semester && !isInSemester(a, semester)) return false;
      if (status === 'all') return true;
      return a.trang_thai === status;
    });
};

/**
 * ================================================================
 * COUNTING HELPERS - TÍNH TOÁN SỐ LƯỢNG
 * ================================================================
 */

/**
 * Đếm hoạt động theo trạng thái
 * @param {Array} activities - Danh sách hoạt động
 * @param {string} semester - Học kỳ hiện tại
 * @returns {Object}
 */
export const countActivitiesByStatus = (activities, semester) => {
  const normalized = activities.map(normalizeActivity);
  const inSemester = semester 
    ? normalized.filter(a => isInSemester(a, semester))
    : normalized;
  
  return {
    total: inSemester.length,
    cho_duyet: inSemester.filter(a => a.trang_thai === 'cho_duyet').length,
    da_duyet: inSemester.filter(a => a.trang_thai === 'da_duyet').length,
    tu_choi: inSemester.filter(a => a.trang_thai === 'tu_choi').length,
    da_huy: inSemester.filter(a => a.trang_thai === 'da_huy').length,
    ket_thuc: inSemester.filter(a => a.trang_thai === 'ket_thuc').length,
  };
};

/**
 * Đếm hoạt động lớp
 * @param {Array} activities - Danh sách hoạt động
 * @param {string} semester - Học kỳ hiện tại
 * @returns {number}
 */
export const countClassActivities = (activities, semester) => {
  const normalized = activities.map(normalizeActivity);
  return normalized.filter(a => 
    isClassActivity(a) && isInSemester(a, semester)
  ).length;
};

/**
 * ================================================================
 * REGISTRATION HELPERS - XỬ LÝ ĐĂNG KÝ
 * ================================================================
 */

/**
 * Chuẩn hóa registration object
 */
export const normalizeRegistration = (registration) => {
  if (!registration) return null;
  
  // Lấy activity data từ nested object
  const activityData = registration.activity 
    || registration.hoat_dong 
    || registration;
  
  return {
    // Registration info
    id: registration.id || registration.registration_id,
    activity_id: registration.activity_id || registration.hoat_dong_id || activityData.id,
    
    // Status
    trang_thai_dk: (registration.trang_thai_dk || registration.status || '').toLowerCase(),
    
    // Dates
    ngay_dang_ky: registration.ngay_dang_ky || registration.registered_at,
    ngay_tham_gia: registration.ngay_tham_gia || registration.participated_at,
    ngay_cap_nhat: registration.ngay_cap_nhat || registration.updated_at,
    
    // Activity details (normalized)
    activity: normalizeActivity(activityData),
    
    // Keep original
    _original: registration
  };
};

/**
 * Filter registrations by status
 */
export const filterRegistrationsByStatus = (registrations, status) => {
  const normalized = registrations.map(normalizeRegistration);
  
  if (status === 'all') return normalized;
  
  return normalized.filter(r => r.trang_thai_dk === status);
};

/**
 * ================================================================
 * EXPORT ALL
 * ================================================================
 */
export default {
  // Normalization
  normalizeActivity,
  normalizeRegistration,
  parseDateSafe,
  
  // Core filters
  isClassActivity,
  isInSemester,
  isApproved,
  isEnded,
  isFull,
  isWithinRegistrationDeadline,
  
  // Composite filters
  isAvailableForRegistration,
  isUpcoming,
  
  // Array processors
  filterAvailableActivities,
  filterUpcomingActivities,
  filterActivitiesByStatus,
  
  // Counting
  countActivitiesByStatus,
  countClassActivities,
  
  // Registrations
  filterRegistrationsByStatus
};
