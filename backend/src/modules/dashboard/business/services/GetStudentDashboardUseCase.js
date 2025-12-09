const { NotFoundError } = require('../../../../core/errors/AppError');
const { parseSemesterString } = require('../../../../core/utils/semester');
const { prisma } = require('../../../../data/infrastructure/prisma/client');
const { countClassActivities } = require('../../../../core/utils/classActivityCounter');
const { calculateActivityPoints } = require('../utils/activityPoints');

/**
 * GetStudentDashboardUseCase
 * Use case for retrieving student dashboard data
 */
class GetStudentDashboardUseCase {
  constructor(dashboardRepository) {
    this.repository = dashboardRepository;
  }



  /**
   * Lấy danh sách class creators (sinh viên trong lớp + GVCN)
   */
  async _getClassCreators(lopId, chuNhiemId) {
    if (!lopId) return [];
    
    // Lấy tất cả sinh viên trong lớp
    const classStudents = await prisma.sinhVien.findMany({
      where: { lop_id: lopId },
      select: { nguoi_dung_id: true }
    });
    
    const classCreatorUserIds = classStudents
      .map(s => s.nguoi_dung_id)
      .filter(Boolean);
    
    // Thêm GVCN vào danh sách
    if (chuNhiemId) {
      classCreatorUserIds.push(chuNhiemId);
    }
    
    return [...new Set(classCreatorUserIds)]; // Remove duplicates
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

  async execute(userId, query) {
    const studentInfo = await this.repository.getStudentInfo(userId);
    if (!studentInfo) {
      throw new NotFoundError('Không tìm thấy thông tin sinh viên');
    }
    
    // Parse semester filter
    const semesterFilter = this._parseSemesterFilter(query);
    
    // Get class creators để filter upcoming activities
    const classCreators = await this._getClassCreators(
      studentInfo.lop_id,
      studentInfo.lop?.chu_nhiem
    );
    
    // Build activity filter với semester
    const activityFilter = { ...semesterFilter };
    
    // Get registrations với filter
    const registrations = await this.repository.getStudentRegistrations(studentInfo.id, activityFilter);
    
    // Get upcoming activities với class creators và semester filter
    const upcomingActivities = await this.repository.getUpcomingActivities(
      studentInfo.id,
      classCreators,
      semesterFilter
    );
    
    const unreadCount = await this.repository.getUnreadNotificationsCount(userId);
    
    // Tính tổng điểm từ các đăng ký đã tham gia (da_tham_gia)
    const attendedRegistrations = registrations.filter(reg => 
      reg.trang_thai_dk === 'da_tham_gia' && reg.hoat_dong
    );
    
    let totalPoints = 0;
    attendedRegistrations.forEach(reg => {
      const points = calculateActivityPoints(reg.hoat_dong);
      totalPoints += points;
    });
    
    // Get class students count for ranking
    const classStudents = await this.repository.getClassStudents(studentInfo.lop_id);
    const totalStudentsInClass = classStudents.length;
    
    // Đếm tổng hoạt động của lớp theo chuẩn:
    // Tất cả hoạt động da_duyet/ket_thuc do SV/GVCN của lớp tạo
    const totalClassActivities = await countClassActivities(studentInfo.lop_id, semesterFilter);

    let myRankInClass = null;
    if (studentInfo.lop_id && totalStudentsInClass > 0) {
      // Optimized: Fetch all class registrations in one query instead of N+1
      const allClassRegistrations = await this.repository.getClassRegistrations(
        studentInfo.lop_id, 
        activityFilter
      );
      
      // Group by student and calculate points
      const studentPointsMap = {};
      allClassRegistrations.forEach(reg => {
        if (reg.hoat_dong) {
          const points = calculateActivityPoints(reg.hoat_dong);
          studentPointsMap[reg.sv_id] = (studentPointsMap[reg.sv_id] || 0) + points;
        }
      });

      const classScores = classStudents.map(classmate => ({
        sv_id: classmate.id,
        tong_diem: studentPointsMap[classmate.id] || 0
      }));

      classScores.sort((a, b) => b.tong_diem - a.tong_diem);

      let prevScore = null;
      let currentRank = 0;
      classScores.forEach((score, index) => {
        if (prevScore === null || score.tong_diem < prevScore) {
          currentRank = index + 1;
          prevScore = score.tong_diem;
        }

        if (score.sv_id === studentInfo.id && myRankInClass === null) {
          myRankInClass = currentRank;
        }
      });
    }
    
    // Map registrations to activities (full list)
    const activities = registrations.map(reg => {
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
          diem_rl: calculatedPoints,
          ngay_bd: reg.hoat_dong.ngay_bd,
          ngay_kt: reg.hoat_dong.ngay_kt,
          dia_diem: reg.hoat_dong.dia_diem,
          hoc_ky: reg.hoat_dong.hoc_ky,
          nam_hoc: reg.hoat_dong.nam_hoc
        },
        diem_rl: calculatedPoints,
        hinh_anh: reg.hoat_dong.hinh_anh || [],
        ten_hd: reg.hoat_dong.ten_hd,
        ngay_bd: reg.hoat_dong.ngay_bd,
        dia_diem: reg.hoat_dong.dia_diem,
        ngay_dang_ky: reg.ngay_dang_ky,
        trang_thai_dk: reg.trang_thai_dk,
        trang_thai: reg.trang_thai_dk,
        ngay_duyet: reg.ngay_duyet,
        ly_do_tu_choi: reg.ly_do_tu_choi,
        is_class_activity: true
      };
    });
    
    return {
      sinh_vien: studentInfo,
      activities: activities,
      hoat_dong_sap_toi: upcomingActivities,
      thong_bao_chua_doc: unreadCount,
      tong_quan: {
        tong_diem: totalPoints,
        tong_hoat_dong: totalClassActivities, // Đếm theo chuẩn: hoạt động đã duyệt của lớp
        so_hoat_dong_da_tham_gia: attendedRegistrations.length, // Số HĐ cá nhân đã tham gia
        muc_tieu: 100
      },
      so_sanh_lop: {
        my_rank_in_class: myRankInClass,
        total_students_in_class: totalStudentsInClass
      }
    };
  }
}

module.exports = GetStudentDashboardUseCase;

