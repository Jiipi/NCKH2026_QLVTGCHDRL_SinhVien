const { prisma } = require('../infrastructure/prisma/client');

/**
 * Student Points Service (Extended)
 * Handles advanced student points calculations and activity listings
 * Note: This complements modules/points/ which handles basic CRUD operations
 */
class StudentPointsService {
  /**
   * Calculate student points with detailed breakdown
   * Includes current semester, current year, and activity type breakdown
   */
  static async calculateStudentPoints(userId, filters = {}) {
    const { semester, year } = filters;
    
    // Step 1: Get user with student information
    const user = await prisma.nguoiDung.findUnique({
      where: { id: userId },
      include: {
        sinh_vien: true
      }
    });

    console.log('User found:', user ? 'Yes' : 'No');
    console.log('User ID:', userId);
    console.log('User data:', user ? {
      id: user.id,
      ten_dn: user.ten_dn,
      ho_ten: user.ho_ten,
      has_sinh_vien: !!user.sinh_vien
    } : 'No user data');

    if (!user) {
      throw new Error('Không tìm thấy thông tin người dùng');
    }

    // Return zero points if not a student
    if (!user.sinh_vien) {
      console.log('User is not a student, returning zero points');
      return {
        total: 0,
        currentSemester: 0,
        currentYear: 0,
        byType: {},
        activitiesCount: 0,
        currentSemesterInfo: {
          semester: 'hoc_ky_1',
          year: '2024-2025'
        },
        breakdown: {
          totalActivities: 0,
          completedActivities: 0,
          currentSemesterActivities: 0,
          currentYearActivities: 0
        },
        studentInfo: {
          id: userId,
          name: user.ho_ten || user.ten_dn,
          mssv: null
        },
        activityDetails: []
      };
    }

    const svId = user.sinh_vien.id;
    console.log(`Tính điểm rèn luyện cho sinh viên ID: ${svId}`);

    // Step 2: Get all activity registrations for student
    const allRegistrations = await prisma.dangKyHoatDong.findMany({
      where: {
        sv_id: svId
      },
      include: {
        hoat_dong: {
          include: {
            loai_hd: true
          }
        }
      }
    });

    console.log(`Sinh viên đã đăng ký ${allRegistrations.length} hoạt động`);

    // Step 3: Filter completed activities (status: da_tham_gia)
    const completedRegistrations = allRegistrations.filter(reg => {
      const status = reg.trang_thai_dk;
      console.log(`Hoạt động ${reg.hoat_dong.ten_hd} - Trạng thái: ${status}`);
      return status === 'da_tham_gia';
    });

    console.log(`Số hoạt động đã tham gia: ${completedRegistrations.length}`);

    // Step 4: Filter by semester and year if provided
    let filteredRegistrations = completedRegistrations;
    if (semester || year) {
      filteredRegistrations = completedRegistrations.filter(reg => {
        const activity = reg.hoat_dong;
        if (semester && activity.hoc_ky !== semester) return false;
        if (year && activity.nam_hoc !== year) return false;
        return true;
      });
    }

    // Step 5: Calculate total points and breakdown by type
    let totalPoints = 0;
    const pointsByType = {};
    const activityDetails = [];

    filteredRegistrations.forEach(reg => {
      const activity = reg.hoat_dong;
      const points = Number(activity.diem_rl || 0);
      
      // Add to total
      totalPoints += points;
      
      // Breakdown by activity type
      const activityType = activity.loai_hd?.ten_loai_hd || 'Khác';
      if (!pointsByType[activityType]) {
        pointsByType[activityType] = 0;
      }
      pointsByType[activityType] += points;

      // Store activity details
      activityDetails.push({
        id: activity.id,
        name: activity.ten_hd,
        type: activityType,
        points: points,
        status: reg.trang_thai_dk,
        semester: activity.hoc_ky,
        year: activity.nam_hoc
      });
    });

    console.log(`Tổng điểm rèn luyện: ${totalPoints}`);

    // Step 6: Calculate current semester/year points
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentSemester = currentDate.getMonth() < 6 ? 'hoc_ky_2' : 'hoc_ky_1';

    // Current semester points - single year format only
    const currentSemesterRegistrations = completedRegistrations.filter(reg => {
      const activity = reg.hoat_dong;
      return activity.hoc_ky === currentSemester && activity.nam_hoc === String(currentYear);
    });

    const currentSemesterPoints = currentSemesterRegistrations.reduce((sum, reg) => {
      return sum + Number(reg.hoat_dong.diem_rl || 0);
    }, 0);

    // Current year points - single year format only
    const currentYearRegistrations = completedRegistrations.filter(reg => {
      const activity = reg.hoat_dong;
      return activity.nam_hoc === String(currentYear);
    });

    const currentYearPoints = currentYearRegistrations.reduce((sum, reg) => {
      return sum + Number(reg.hoat_dong.diem_rl || 0);
    }, 0);

    // Step 7: Return results
    const result = {
      total: totalPoints,
      currentSemester: currentSemesterPoints,
      currentYear: currentYearPoints,
      byType: pointsByType,
      activitiesCount: filteredRegistrations.length,
      currentSemesterInfo: {
        semester: currentSemester,
        year: String(currentYear)
      },
      breakdown: {
        totalActivities: allRegistrations.length,
        completedActivities: completedRegistrations.length,
        currentSemesterActivities: currentSemesterRegistrations.length,
        currentYearActivities: currentYearRegistrations.length
      },
      studentInfo: {
        id: svId,
        name: user.ho_ten,
        mssv: user.sinh_vien.mssv
      },
      activityDetails: activityDetails
    };

    console.log('Kết quả tính điểm:', JSON.stringify(result, null, 2));
    return result;
  }

  /**
   * Get student activities with optional filters
   * Returns detailed activity information with status breakdown
   */
  static async getStudentActivities(userId, filters = {}) {
    const { semester, year, status } = filters;
    
    // Step 1: Get user with student information
    const user = await prisma.nguoiDung.findUnique({
      where: { id: userId },
      include: {
        sinh_vien: true
      }
    });

    if (!user) {
      throw new Error('Không tìm thấy thông tin người dùng');
    }

    // Return empty if not a student
    if (!user.sinh_vien) {
      console.log('User is not a student, returning empty activities');
      return {
        activities: [],
        total: 0,
        byStatus: {},
        studentInfo: {
          id: userId,
          name: user.ho_ten || user.ten_dn,
          mssv: null
        }
      };
    }

    const svId = user.sinh_vien.id;
    console.log(`Lấy danh sách hoạt động cho sinh viên ID: ${svId}`);

    // Step 2: Get all activity registrations
    const allRegistrations = await prisma.dangKyHoatDong.findMany({
      where: {
        sv_id: svId
      },
      include: {
        hoat_dong: {
          include: {
            loai_hd: true
          }
        }
      },
      orderBy: {
        ngay_dang_ky: 'desc'
      }
    });

    console.log(`Sinh viên đã đăng ký ${allRegistrations.length} hoạt động`);

    // Step 3: Filter by semester, year, and status
    let filteredRegistrations = allRegistrations;
    
    if (semester || year || status) {
      filteredRegistrations = allRegistrations.filter(reg => {
        const activity = reg.hoat_dong;
        if (semester && activity.hoc_ky !== semester) return false;
        if (year && activity.nam_hoc !== year) return false;
        if (status && reg.trang_thai_dk !== status) return false;
        return true;
      });
    }

    // Step 4: Transform data
    const activities = filteredRegistrations.map(reg => {
      const activity = reg.hoat_dong;
      return {
        id: activity.id,
        name: activity.ten_hd,
        description: activity.mo_ta,
        type: activity.loai_hd?.ten_loai_hd || 'Khác',
        points: Number(activity.diem_rl || 0),
        location: activity.dia_diem,
        startDate: activity.ngay_bd,
        endDate: activity.ngay_kt,
        deadline: activity.han_dk,
        semester: activity.hoc_ky,
        year: activity.nam_hoc,
        status: reg.trang_thai_dk,
        registrationDate: reg.ngay_dang_ky,
        approvalDate: reg.ngay_duyet,
        rejectionReason: reg.ly_do_tu_choi,
        notes: reg.ghi_chu
      };
    });

    // Step 5: Status breakdown
    const byStatus = {};
    allRegistrations.forEach(reg => {
      const status = reg.trang_thai_dk;
      if (!byStatus[status]) {
        byStatus[status] = 0;
      }
      byStatus[status]++;
    });

    const result = {
      activities: activities,
      total: activities.length,
      byStatus: byStatus,
      studentInfo: {
        id: svId,
        name: user.ho_ten || user.ten_dn,
        mssv: user.sinh_vien.mssv
      }
    };

    console.log('Kết quả danh sách hoạt động:', JSON.stringify(result, null, 2));
    return result;
  }
}

module.exports = StudentPointsService;




