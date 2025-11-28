const { NotFoundError } = require('../../../../core/errors/AppError');
const { parseSemesterString } = require('../../../../core/utils/semester');
const { prisma } = require('../../../../data/infrastructure/prisma/client');
const { countClassActivities } = require('../../../../core/utils/classActivityCounter');

/**
 * GetStudentDashboardUseCase
 * Use case for retrieving student dashboard data
 */
class GetStudentDashboardUseCase {
  constructor(dashboardRepository) {
    this.repository = dashboardRepository;
  }

  /**
   * Tính điểm cho hoạt động
   * Ưu tiên diem_rl của hoạt động, nếu null/undefined hoặc = 0 thì dùng diem_mac_dinh của loại hoạt động
   */
  _calculateActivityPoints(activity) {
    if (!activity) return 0;
    
    // Xử lý diem_rl (có thể là Decimal, Number, hoặc String)
    let diemRl = null;
    if (activity.diem_rl != null && activity.diem_rl !== undefined) {
      // Xử lý Decimal type từ Prisma
      if (typeof activity.diem_rl === 'object' && activity.diem_rl.toNumber) {
        diemRl = activity.diem_rl.toNumber();
      } else {
        diemRl = parseFloat(activity.diem_rl);
      }
      
      // Nếu parseFloat trả về NaN hoặc không phải số hợp lệ, coi như null
      if (isNaN(diemRl) || !isFinite(diemRl)) {
        diemRl = null;
      }
    }
    
    // Nếu hoạt động có điểm được set và > 0, dùng điểm đó
    if (diemRl != null && diemRl > 0) {
      return diemRl;
    }
    
    // Nếu không có điểm hoặc = 0, dùng điểm mặc định của loại hoạt động
    if (activity.loai_hd && activity.loai_hd.diem_mac_dinh != null) {
      let diemMacDinh = 0;
      
      // Xử lý Decimal type từ Prisma
      if (typeof activity.loai_hd.diem_mac_dinh === 'object' && activity.loai_hd.diem_mac_dinh.toNumber) {
        diemMacDinh = activity.loai_hd.diem_mac_dinh.toNumber();
      } else {
        diemMacDinh = parseFloat(activity.loai_hd.diem_mac_dinh) || 0;
      }
      
      // Nếu parseFloat trả về NaN, trả về 0
      return isNaN(diemMacDinh) || !isFinite(diemMacDinh) ? 0 : diemMacDinh;
    }
    
    return 0;
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
      const points = this._calculateActivityPoints(reg.hoat_dong);
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
      const classScores = await Promise.all(
        classStudents.map(async (classmate) => {
          const classmateRegistrations = await this.repository.getStudentRegistrations(
            classmate.id,
            activityFilter
          );

          const classmateAttended = classmateRegistrations.filter(reg =>
            reg.trang_thai_dk === 'da_tham_gia' && reg.hoat_dong
          );

          const totalClassmatePoints = classmateAttended.reduce((sum, reg) => {
            return sum + this._calculateActivityPoints(reg.hoat_dong);
          }, 0);

          return {
            sv_id: classmate.id,
            tong_diem: totalClassmatePoints
          };
        })
      );

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
    
    // Map recent activities với điểm đã được tính đúng
    const hoatDongGanDay = registrations.slice(0, 5).map(reg => ({
      id: reg.id,
      hoat_dong: reg.hoat_dong ? {
        id: reg.hoat_dong.id,
        ten_hd: reg.hoat_dong.ten_hd,
        mo_ta: reg.hoat_dong.mo_ta,
        loai_hd: reg.hoat_dong.loai_hd?.ten_loai_hd || 'Khác',
        diem_rl: this._calculateActivityPoints(reg.hoat_dong), // Tính điểm đúng với fallback
        ngay_bd: reg.hoat_dong.ngay_bd,
        ngay_kt: reg.hoat_dong.ngay_kt,
        dia_diem: reg.hoat_dong.dia_diem,
        hoc_ky: reg.hoat_dong.hoc_ky,
        nam_hoc: reg.hoat_dong.nam_hoc
      } : null,
      ngay_dang_ky: reg.ngay_dang_ky,
      trang_thai_dk: reg.trang_thai_dk,
      ngay_duyet: reg.ngay_duyet,
      ly_do_tu_choi: reg.ly_do_tu_choi
    }));
    
    return {
      sinh_vien: studentInfo,
      hoat_dong_gan_day: hoatDongGanDay,
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

