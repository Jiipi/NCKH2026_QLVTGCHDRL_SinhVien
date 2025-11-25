const { NotFoundError } = require('../../../../core/errors/AppError');
const { parseSemesterString } = require('../../../../core/utils/semester');

/**
 * GetDetailedScoresUseCase
 * Use case for retrieving detailed score breakdown
 */
class GetDetailedScoresUseCase {
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
   * Parse semester filter từ query
   */
  _parseSemesterFilter(query) {
    const { semester, semesterValue, hoc_ky, nam_hoc, year } = query;
    const semesterParam = semesterValue || semester;
    
    if (semesterParam) {
      const parsed = parseSemesterString(semesterParam);
      if (parsed && parsed.year) {
        return {
          hoc_ky: parsed.semester,
          nam_hoc: parsed.year
        };
      }
    } else if (hoc_ky && (nam_hoc || year)) {
      return { hoc_ky, nam_hoc: nam_hoc || year };
    }
    
    return {};
  }

  async execute(userId, query) {
    const studentInfo = await this.repository.getStudentInfo(userId);
    if (!studentInfo) {
      throw new NotFoundError('Không tìm thấy thông tin sinh viên');
    }

    const activityFilter = this._parseSemesterFilter(query);

    const registrations = await this.repository.getStudentRegistrations(studentInfo.id, activityFilter);
    
    // CHỈ lấy các đăng ký đã tham gia (da_tham_gia) để tính điểm
    const attendedRegistrations = registrations.filter(reg => 
      reg.trang_thai_dk === 'da_tham_gia' && reg.hoat_dong
    );
    
    // Tính tổng điểm từ các hoạt động đã tham gia
    let totalPoints = 0;
    attendedRegistrations.forEach(reg => {
      const points = this._calculateActivityPoints(reg.hoat_dong);
      totalPoints += points;
    });
    
    // Map activities với điểm đã được tính đúng - CHỈ lấy da_tham_gia
    const activities = attendedRegistrations.map(reg => {
      const calculatedPoints = this._calculateActivityPoints(reg.hoat_dong);
      
      return {
        id: reg.hoat_dong.id,
        ten_hd: reg.hoat_dong.ten_hd,
        mo_ta: reg.hoat_dong.mo_ta,
        loai_hd: reg.hoat_dong.loai_hd?.ten_loai_hd || 'Khác',
        diem_rl: calculatedPoints, // Tính điểm đúng với fallback - flatten để frontend lấy trực tiếp
        ngay_bd: reg.hoat_dong.ngay_bd,
        ngay_kt: reg.hoat_dong.ngay_kt,
        dia_diem: reg.hoat_dong.dia_diem,
        hoc_ky: reg.hoat_dong.hoc_ky,
        nam_hoc: reg.hoat_dong.nam_hoc,
        ngay_dang_ky: reg.ngay_dang_ky,
        trang_thai_dk: reg.trang_thai_dk,
        trang_thai: reg.trang_thai_dk, // Alias cho frontend
        ngay_duyet: reg.ngay_duyet,
        ly_do_tu_choi: reg.ly_do_tu_choi
      };
    });
    
    // Xác định xếp loại
    const getClassification = (points) => {
      if (points >= 90) return 'Xuất sắc';
      if (points >= 80) return 'Tốt';
      if (points >= 65) return 'Khá';
      if (points >= 50) return 'Trung bình';
      return 'Yếu';
    };
    
    // Tính xếp hạng trong lớp
    let classRank = null;
    let totalStudentsInClass = 0;
    
    if (studentInfo.lop_id) {
      const classStudents = await this.repository.getClassStudents(studentInfo.lop_id);
      totalStudentsInClass = classStudents.length;
      
      if (totalStudentsInClass > 0) {
        // Tính điểm cho từng sinh viên trong lớp
        const classScores = await Promise.all(
          classStudents.map(async (classmate) => {
            const classmateRegistrations = await this.repository.getStudentRegistrations(
              classmate.id,
              activityFilter
            );
            
            const classmateAttended = classmateRegistrations.filter(reg =>
              reg.trang_thai_dk === 'da_tham_gia' && reg.hoat_dong
            );
            
            let classmatePoints = 0;
            classmateAttended.forEach(reg => {
              const points = this._calculateActivityPoints(reg.hoat_dong);
              classmatePoints += points;
            });
            
            return {
              sv_id: classmate.id,
              tong_diem: classmatePoints
            };
          })
        );
        
        // Sắp xếp theo điểm giảm dần
        classScores.sort((a, b) => b.tong_diem - a.tong_diem);
        
        // Tìm vị trí của sinh viên hiện tại
        const currentStudentIndex = classScores.findIndex(
          score => score.sv_id === studentInfo.id
        );
        
        if (currentStudentIndex !== -1) {
          classRank = currentStudentIndex + 1; // Xếp hạng bắt đầu từ 1
        }
      }
    }
    
    return {
      student_info: studentInfo,
      activities: activities,
      summary: {
        tong_diem: totalPoints,
        tong_hoat_dong: attendedRegistrations.length,
        xep_loai: getClassification(totalPoints)
      },
      class_rankings: {
        my_rank_in_class: classRank,
        total_students_in_class: totalStudentsInClass
      }
    };
  }
}

module.exports = GetDetailedScoresUseCase;

