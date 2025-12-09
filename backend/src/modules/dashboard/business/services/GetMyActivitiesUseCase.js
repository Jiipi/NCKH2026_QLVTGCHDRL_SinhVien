const { NotFoundError } = require('../../../../core/errors/AppError');
const { parseSemesterString } = require('../../../../core/utils/semester');
const { calculateActivityPoints } = require('../utils/activityPoints');

/**
 * GetMyActivitiesUseCase
 * Use case for retrieving student's registered activities
 */
class GetMyActivitiesUseCase {
  constructor(dashboardRepository) {
    this.repository = dashboardRepository;
  }



  /**
   * Parse semester filter từ query
   */
  _parseSemesterFilter(query) {
    const { semester, semesterValue, hoc_ky, nam_hoc } = query;
    const semesterParam = semesterValue || semester;
    
    if (semesterParam) {
      const parsed = parseSemesterString(semesterParam);
      if (parsed && parsed.year) {
        return {
          hoc_ky: parsed.semester,
          nam_hoc: parsed.year
        };
      }
    } else if (hoc_ky && nam_hoc) {
      return { hoc_ky, nam_hoc };
    }
    
    return {};
  }

  async execute(userId, query = {}) {
    const studentInfo = await this.repository.getStudentInfo(userId);
    if (!studentInfo) {
      throw new NotFoundError('Không tìm thấy thông tin sinh viên');
    }

    const activityFilter = this._parseSemesterFilter(query);

    const registrations = await this.repository.getStudentRegistrations(studentInfo.id, activityFilter);
    
    // Map registrations với điểm đã được tính đúng và flatten structure để frontend dễ dùng
    // Frontend expect: activity.diem_rl hoặc activity.hoat_dong.diem_rl
    return registrations.map(reg => {
      if (!reg.hoat_dong) {
        return {
          ...reg,
          is_class_activity: false,
          diem_rl: 0
        };
      }
      
      const calculatedPoints = calculateActivityPoints(reg.hoat_dong);
      
      return {
        id: reg.id,
        hoat_dong: {
          id: reg.hoat_dong.id,
          ten_hd: reg.hoat_dong.ten_hd,
          mo_ta: reg.hoat_dong.mo_ta,
          hinh_anh: reg.hoat_dong.hinh_anh || [],
          loai_hd: reg.hoat_dong.loai_hd ? {
            ten_loai_hd: reg.hoat_dong.loai_hd.ten_loai_hd || 'Khác',
            diem_mac_dinh: reg.hoat_dong.loai_hd.diem_mac_dinh,
            diem_toi_da: reg.hoat_dong.loai_hd.diem_toi_da
          } : { ten_loai_hd: 'Khác' },
          diem_rl: calculatedPoints, // Tính điểm đúng với fallback
          ngay_bd: reg.hoat_dong.ngay_bd,
          ngay_kt: reg.hoat_dong.ngay_kt,
          dia_diem: reg.hoat_dong.dia_diem,
          hoc_ky: reg.hoat_dong.hoc_ky,
          nam_hoc: reg.hoat_dong.nam_hoc
        },
        // Flatten để frontend có thể lấy trực tiếp
        diem_rl: calculatedPoints, // Frontend lấy activity.diem_rl
        hinh_anh: reg.hoat_dong.hinh_anh || [], // Alias for direct access
        ten_hd: reg.hoat_dong.ten_hd, // Alias
        ngay_bd: reg.hoat_dong.ngay_bd, // Alias
        dia_diem: reg.hoat_dong.dia_diem, // Alias
        ngay_dang_ky: reg.ngay_dang_ky,
        trang_thai_dk: reg.trang_thai_dk,
        trang_thai: reg.trang_thai_dk, // Alias cho frontend
        ngay_duyet: reg.ngay_duyet,
        ly_do_tu_choi: reg.ly_do_tu_choi,
        is_class_activity: true // Frontend filter theo field này
      };
    });
  }
}

module.exports = GetMyActivitiesUseCase;

