/**
 * Points Service
 * Business logic for student points calculation and reporting
 */

const repo = require('./points.repo');
const { logError } = require('../../core/logger');

class PointsService {
  /**
   * Calculate points by activity type
   */
  _calculatePointsByType(registrations) {
    const pointsByType = {};
    let totalPoints = 0;
    let totalActivities = 0;

    registrations.forEach(reg => {
      const activity = reg.hoat_dong;
      const activityType = activity.loai_hd?.ten_loai_hd || 'Khác';
      const points = parseFloat(activity.diem_rl || 0);

      if (!pointsByType[activityType]) {
        pointsByType[activityType] = {
          ten_loai: activityType,
          so_hoat_dong: 0,
          tong_diem: 0,
          hoat_dong: []
        };
      }

      pointsByType[activityType].so_hoat_dong++;
      pointsByType[activityType].tong_diem += points;
      pointsByType[activityType].hoat_dong.push({
        id: activity.id,
        ten_hd: activity.ten_hd,
        diem_rl: points,
        ngay_tham_gia: reg.ngay_duyet,
        trang_thai: reg.trang_thai_dk
      });

      totalPoints += points;
      totalActivities++;
    });

    return {
      pointsByType: Object.values(pointsByType),
      totalPoints,
      totalActivities
    };
  }

  /**
   * Format status summary
   */
  _formatStatusSummary(statusCounts) {
    const statusSummary = {
      cho_duyet: 0,
      da_duyet: 0,
      tu_choi: 0,
      da_tham_gia: 0
    };

    statusCounts.forEach(item => {
      statusSummary[item.trang_thai_dk] = item._count.id;
    });

    return statusSummary;
  }

  /**
   * Get points summary for student
   */
  async getPointsSummary(userId, filters = {}) {
    // Find student
    const sinhVien = await repo.findStudentByUserId(userId);
    if (!sinhVien) {
      return null;
    }

    // Get attended registrations
    const registrations = await repo.findAttendedRegistrations(sinhVien.id, filters);

    // Calculate points by type
    const { pointsByType, totalPoints, totalActivities } = this._calculatePointsByType(registrations);

    // Get recent activities
    const recentActivities = await repo.findAllRegistrations(sinhVien.id);

    // Get status counts
    const statusCounts = await repo.getRegistrationStatusCounts(sinhVien.id);
    const statusSummary = this._formatStatusSummary(statusCounts);

    return {
      sinh_vien: {
        mssv: sinhVien.mssv,
        ho_ten: sinhVien.nguoi_dung.ho_ten,
        email: sinhVien.nguoi_dung.email,
        lop: sinhVien.lop
      },
      thong_ke: {
        tong_diem: totalPoints,
        tong_diem_lam_tron: Math.round(totalPoints),
        tong_hoat_dong: totalActivities,
        diem_theo_loai: pointsByType,
        trang_thai_dang_ky: statusSummary
      },
      hoat_dong_gan_day: recentActivities.map(reg => ({
        id: reg.hoat_dong.id,
        ten_hd: reg.hoat_dong.ten_hd,
        loai_hd: reg.hoat_dong.loai_hd?.ten_loai_hd || 'Khác',
        diem_rl: parseFloat(reg.hoat_dong.diem_rl || 0),
        ngay_dang_ky: reg.ngay_dang_ky,
        trang_thai: reg.trang_thai_dk,
        ly_do_tu_choi: reg.ly_do_tu_choi
      }))
    };
  }

  /**
   * Get points detail with pagination
   */
  async getPointsDetail(userId, filters, pagination) {
    // Find student
    const sinhVien = await repo.findStudentByUserId(userId);
    if (!sinhVien) {
      return null;
    }

    // Get registrations with pagination
    const { registrations, total } = await repo.findRegistrationsWithPagination(
      sinhVien.id,
      filters,
      pagination
    );

    // Filter out registrations without activity data
    const validRegistrations = registrations.filter(reg => reg.hoat_dong);

    const detailData = validRegistrations.map(reg => ({
      id: reg.id,
      hoat_dong: {
        id: reg.hoat_dong.id,
        ten_hd: reg.hoat_dong.ten_hd,
        mo_ta: reg.hoat_dong.mo_ta,
        loai_hd: reg.hoat_dong.loai_hd?.ten_loai_hd || 'Khác',
        diem_rl: parseFloat(reg.hoat_dong.diem_rl || 0),
        ngay_bd: reg.hoat_dong.ngay_bd,
        ngay_kt: reg.hoat_dong.ngay_kt,
        dia_diem: reg.hoat_dong.dia_diem,
        hoc_ky: reg.hoat_dong.hoc_ky,
        nam_hoc: reg.hoat_dong.nam_hoc
      },
      dang_ky: {
        ngay_dang_ky: reg.ngay_dang_ky,
        trang_thai: reg.trang_thai_dk,
        ngay_duyet: reg.ngay_duyet,
        ly_do_tu_choi: reg.ly_do_tu_choi,
        ghi_chu: reg.ghi_chu
      }
    }));

    return {
      data: detailData,
      pagination: {
        current_page: parseInt(pagination.page || 1),
        per_page: parseInt(pagination.limit || 10),
        total,
        total_pages: Math.ceil(total / parseInt(pagination.limit || 10))
      }
    };
  }

  /**
   * Get attendance history
   */
  async getAttendanceHistory(userId, pagination) {
    // Find student
    const sinhVien = await repo.findStudentByUserId(userId);
    if (!sinhVien) {
      return null;
    }

    // Get attendance records
    const { attendances, total } = await repo.findAttendanceRecords(sinhVien.id, pagination);

    const attendanceData = attendances.map(att => ({
      id: att.id,
      hoat_dong: {
        id: att.hoat_dong.id,
        ten_hd: att.hoat_dong.ten_hd,
        loai_hd: att.hoat_dong.loai_hd?.ten_loai_hd || 'Khác',
        diem_rl: parseFloat(att.hoat_dong.diem_rl || 0)
      },
      diem_danh: {
        thoi_gian: att.tg_diem_danh,
        phuong_thuc: att.phuong_thuc,
        trang_thai_tham_gia: att.trang_thai_tham_gia,
        ghi_chu: att.ghi_chu,
        nguoi_diem_danh: att.nguoi_diem_danh.ho_ten
      }
    }));

    return {
      data: attendanceData,
      pagination: {
        current_page: parseInt(pagination.page || 1),
        per_page: parseInt(pagination.limit || 10),
        total,
        total_pages: Math.ceil(total / parseInt(pagination.limit || 10))
      }
    };
  }

  /**
   * Get filter options (semesters and academic years)
   */
  async getFilterOptions(userId) {
    // Find student
    const sinhVien = await repo.findStudentByUserId(userId);
    if (!sinhVien) {
      return null;
    }

    // Get unique semesters and academic years
    const [semesters, academicYears] = await Promise.all([
      repo.getUniqueSemesters(sinhVien.id),
      repo.getUniqueAcademicYears(sinhVien.id)
    ]);

    // Format semester options
    const hocKyOptions = semesters.map(hocKy => ({
      value: hocKy,
      label: hocKy === 'hoc_ky_1' ? 'Học kỳ I' : 'Học kỳ II'
    }));

    // Format academic year options
    const namHocOptions = academicYears.map(namHoc => ({
      value: namHoc,
      label: namHoc
    }));

    return {
      hoc_ky: hocKyOptions,
      nam_hoc: namHocOptions
    };
  }

  /**
   * Generate points report for academic year
   */
  async getPointsReport(userId, namHoc = null) {
    // Find student
    const sinhVien = await repo.findStudentByUserId(userId);
    if (!sinhVien) {
      return null;
    }

    const reportData = {};

    // Get data for both semesters
    for (const hoc_ky of ['hoc_ky_1', 'hoc_ky_2']) {
      const registrations = await repo.findCompletedRegistrationsForSemester(
        sinhVien.id,
        hoc_ky,
        namHoc
      );

      // Calculate points by type
      const pointsByType = {};
      let totalPoints = 0;

      registrations.forEach(reg => {
        const activity = reg.hoat_dong;
        const activityType = activity.loai_hd?.ten_loai_hd || 'Khác';
        const points = parseFloat(activity.diem_rl || 0);

        if (!pointsByType[activityType]) {
          pointsByType[activityType] = {
            ten_loai: activityType,
            so_hoat_dong: 0,
            tong_diem: 0
          };
        }

        pointsByType[activityType].so_hoat_dong++;
        pointsByType[activityType].tong_diem += points;
        totalPoints += points;
      });

      reportData[hoc_ky] = {
        hoc_ky: hoc_ky === 'hoc_ky_1' ? 'Học kỳ 1' : 'Học kỳ 2',
        tong_diem: totalPoints,
        tong_hoat_dong: registrations.length,
        diem_theo_loai: Object.values(pointsByType)
      };
    }

    return {
      sinh_vien: {
        mssv: sinhVien.mssv,
        ho_ten: sinhVien.nguoi_dung.ho_ten,
        email: sinhVien.nguoi_dung.email,
        lop: sinhVien.lop
      },
      nam_hoc: namHoc || new Date().getFullYear().toString(),
      bao_cao: reportData
    };
  }
}

module.exports = new PointsService();





