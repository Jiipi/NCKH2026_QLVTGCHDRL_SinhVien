const { prisma } = require('../../infrastructure/prisma/client');
const { logInfo, logError } = require('../../core/logger');
const { buildSemesterFilter, parseSemesterString } = require('../../core/utils/semester');
const adminReportsRepo = require('./admin-reports.repo');

/**
 * Admin Reports Service
 * Provides comprehensive reporting and analytics for admin users
 * 
 * Methods:
 * - getUserPointsReport(userId, query): Get detailed points breakdown for a user
 * - getAttendanceReport(params): Get paginated attendance records with filters
 * - getClassesList(): Get all classes with student counts
 */
class AdminReportsService {
  /**
   * Get user points report with activity details and attendance
   * @param {string} userId - User ID to get points for
   * @param {Object} query - Query params (semester, year)
   * @returns {Promise<Object>} Points summary, activity details, attendance records
   */
  async getUserPointsReport(userId, query = {}) {
    const { semester, year } = query;

    // Fetch user with student and class info
    const user = await prisma.nguoiDung.findUnique({
      where: { id: userId },
      include: {
        sinh_vien: {
          include: {
            lop: true
          }
        }
      }
    });

    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }

    // If not a student, return empty report
    if (!user.sinh_vien) {
      return {
        summary: {
          totalPoints: 0,
          currentSemester: 'N/A',
          activities: 0,
          avgPoints: 0,
          rank: 'Không có dữ liệu'
        },
        details: [],
        attendance: []
      };
    }

    // Fetch approved/participated activity registrations
    const registrations = await prisma.dangKyHoatDong.findMany({
      where: {
        sv_id: user.sinh_vien.id,
        trang_thai_dk: { in: ['da_tham_gia', 'da_duyet'] }
      },
      include: {
        hoat_dong: {
          include: {
            loai_hd: true
          }
        }
      },
      orderBy: { ngay_dang_ky: 'desc' }
    });

    // Fetch attendance records
    const attendance = await prisma.diemDanh.findMany({
      where: {
        sv_id: user.sinh_vien.id
      },
      include: {
        hoat_dong: true
      },
      orderBy: { tg_diem_danh: 'desc' }
    });

    // Calculate total points and activity details
    let totalPoints = 0;
    const activityDetails = [];

    registrations.forEach(reg => {
      if (reg.hoat_dong && reg.hoat_dong.diem_rl) {
        const points = parseFloat(reg.hoat_dong.diem_rl);
        totalPoints += points;
        activityDetails.push({
          id: reg.id,
          name: reg.hoat_dong.ten_hd,
          type: reg.hoat_dong.loai_hd?.ten_loai_hd || 'Không xác định',
          points: points,
          date: reg.ngay_dang_ky,
          status: 'completed',
          semester: reg.hoat_dong.hoc_ky || 'hoc_ky_1'
        });
      }
    });

    // Transform attendance records
    const attendanceDetails = attendance.map(att => ({
      id: att.id,
      activity: att.hoat_dong?.ten_hd || 'Không xác định',
      date: att.tg_diem_danh,
      status: att.trang_thai_tham_gia === 'co_mat' ? 'present' : 'absent',
      points: att.trang_thai_tham_gia === 'co_mat' ? 
        (att.hoat_dong?.diem_rl ? parseFloat(att.hoat_dong.diem_rl) : 0) : 0
    }));

    // Calculate summary
    const summary = {
      totalPoints,
      currentSemester: semester || 'HK1 2024-2025',
      activities: registrations.length,
      avgPoints: registrations.length > 0 ? 
        parseFloat((totalPoints / registrations.length).toFixed(1)) : 0,
      rank: this._classifyPoints(totalPoints)
    };

    logInfo('User points report generated', { userId, totalPoints, activitiesCount: registrations.length });

    return {
      summary,
      details: activityDetails,
      attendance: attendanceDetails
    };
  }

  /**
   * Get attendance report with pagination and filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Records per page (default: 15, max: 50)
   * @param {string} params.search - Search by student name or MSSV
   * @param {string} params.activity_id - Filter by activity ID
   * @param {string} params.status - Filter by attendance status
   * @returns {Promise<Object>} Paginated attendance list
   */
  async getAttendanceReport(params = {}) {
    const { 
      page = 1, 
      limit = 15, 
      search, 
      activity_id, 
      status 
    } = params;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const maxLimit = 50;
    const actualLimit = Math.min(parseInt(limit), maxLimit);

    // Build where condition
    const whereCondition = {};

    if (activity_id) {
      whereCondition.hd_id = activity_id;
    }

    if (status) {
      whereCondition.trang_thai_tham_gia = status;
    }

    if (search) {
      whereCondition.sinh_vien = {
        OR: [
          { nguoi_dung: { ho_ten: { contains: search, mode: 'insensitive' } } },
          { mssv: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    // Fetch attendance records with related data
    const [attendanceList, total] = await Promise.all([
      prisma.diemDanh.findMany({
        where: whereCondition,
        include: {
          sinh_vien: {
            include: {
              nguoi_dung: true,
              lop: true
            }
          },
          hoat_dong: {
            include: {
              loai_hd: true
            }
          },
          nguoi_diem_danh: true
        },
        skip,
        take: actualLimit,
        orderBy: { tg_diem_danh: 'desc' }
      }),
      prisma.diemDanh.count({ where: whereCondition })
    ]);

    // Transform to frontend-friendly format
    const transformedData = attendanceList.map(record => ({
      id: record.id,
      student: {
        id: record.sinh_vien.id,
        mssv: record.sinh_vien.mssv,
        name: record.sinh_vien.nguoi_dung.ho_ten,
        class: record.sinh_vien.lop?.ten_lop || '',
        email: record.sinh_vien.nguoi_dung.email
      },
      activity: {
        id: record.hoat_dong.id,
        name: record.hoat_dong.ten_hd,
        type: record.hoat_dong.loai_hd?.ten_loai_hd || '',
        date: record.hoat_dong.ngay_bd,
        points: record.hoat_dong.diem_rl
      },
      attendance: {
        method: record.phuong_thuc,
        status: record.trang_thai_tham_gia,
        time: record.tg_diem_danh,
        confirmed: record.xac_nhan_tham_gia,
        notes: record.ghi_chu,
        ip_address: record.dia_chi_ip,
        gps_location: record.vi_tri_gps
      },
      checked_by: {
        id: record.nguoi_diem_danh.id,
        name: record.nguoi_diem_danh.ho_ten
      }
    }));

    logInfo('Attendance report generated', { total, page, limit: actualLimit });

    return {
      attendance: transformedData,
      pagination: {
        page: parseInt(page),
        limit: actualLimit,
        total,
        totalPages: Math.ceil(total / actualLimit),
        hasNextPage: parseInt(page) < Math.ceil(total / actualLimit),
        hasPrevPage: parseInt(page) > 1
      }
    };
  }

  /**
   * Get all classes with student counts (for admin targeting)
   * @returns {Promise<Array>} List of classes with metadata
   */
  async getClassesList() {
    const classes = await prisma.lop.findMany({
      select: {
        id: true,
        ten_lop: true,
        khoa: true,
        nien_khoa: true,
        _count: {
          select: { sinh_viens: true }
        }
      },
      orderBy: [
        { khoa: 'asc' },
        { ten_lop: 'asc' }
      ]
    });

    const formattedClasses = classes.map(cls => ({
      id: cls.id,
      ten_lop: cls.ten_lop,
      khoa: cls.khoa,
      nien_khoa: cls.nien_khoa,
      soLuongSinhVien: cls._count.sinh_viens
    }));

    logInfo('Classes list generated', { count: classes.length });

    return formattedClasses;
  }

  /**
   * Classify points into rank
   * @private
   * @param {number} points - Total points
   * @returns {string} Rank classification
   */
  _classifyPoints(points) {
    if (points >= 80) return 'Xuất sắc';
    if (points >= 60) return 'Khá';
    if (points >= 40) return 'Trung bình';
    return 'Yếu';
  }

  /**
   * Get overview statistics for admin dashboard
   * @param {Object} query - Query parameters
   * @param {string} query.semester - Semester filter
   * @param {string} query.hoc_ky - Học kỳ filter
   * @param {string} query.nam_hoc - Năm học filter
   * @returns {Promise<Object>} Overview statistics
   */
  async getOverview(query = {}) {
    try {
      const { semester, hoc_ky, nam_hoc } = query;
      let activityWhere = {};

      if (semester) {
        const si = parseSemesterString(semester);
        if (!si) {
          throw new Error('Tham số học kỳ không hợp lệ');
        }
        activityWhere = buildSemesterFilter(semester, true);
      } else if (hoc_ky || nam_hoc) {
        activityWhere = { hoc_ky: hoc_ky || undefined, ...(nam_hoc ? { nam_hoc } : {}) };
      }

      const [byStatus, topActivities, dailyRegs] = await Promise.all([
        adminReportsRepo.groupActivitiesByStatus(activityWhere),
        adminReportsRepo.findTopActivities(activityWhere),
        adminReportsRepo.groupRegistrationsByDate(activityWhere)
      ]);

      const top = topActivities
        .map(a => ({ id: a.id, ten_hd: a.ten_hd, count: a.dang_ky_hd.length }))
        .sort((x, y) => y.count - x.count)
        .slice(0, 10);

      logInfo('Overview statistics generated', { semester, hoc_ky, nam_hoc });

      return { byStatus, topActivities: top, dailyRegs };
    } catch (error) {
      logError('Error getting overview statistics', error);
      throw error;
    }
  }

  /**
   * Export activities to CSV
   * @param {Object} query - Query parameters
   * @param {string} query.semester - Semester filter
   * @param {string} query.hoc_ky - Học kỳ filter
   * @param {string} query.nam_hoc - Năm học filter
   * @returns {Promise<string>} CSV string
   */
  async exportActivities(query = {}) {
    try {
      const { semester, hoc_ky, nam_hoc } = query;
      let activityWhere = {};

      if (semester) {
        const si = parseSemesterString(semester);
        if (!si) {
          throw new Error('Tham số học kỳ không hợp lệ');
        }
        activityWhere = buildSemesterFilter(semester, true);
      } else if (hoc_ky || nam_hoc) {
        activityWhere = { hoc_ky: hoc_ky || undefined, ...(nam_hoc ? { nam_hoc } : {}) };
      }

      const rows = await adminReportsRepo.findActivitiesForExport(activityWhere);

      const headers = ['Ma', 'Ten', 'Loai', 'DiemRL', 'TrangThai', 'NgayBD', 'NgayKT'];
      const safeToIso = (d) => {
        if (!d) return '';
        try {
          if (typeof d === 'string') {
            const nd = new Date(d);
            return isNaN(nd.getTime()) ? '' : nd.toISOString();
          }
          if (d instanceof Date && !isNaN(d.getTime())) return d.toISOString();
          if (typeof d.toISOString === 'function') return d.toISOString();
          return '';
        } catch {
          return '';
        }
      };
      const safe = (v) => (v === null || v === undefined ? '' : v);
      const data = rows.map((r) => [
        safe(r.ma_hd),
        safe(r.ten_hd),
        safe(r.loai_hd?.ten_loai_hd),
        safe(r.diem_rl),
        safe(r.trang_thai),
        safeToIso(r.ngay_bd),
        safeToIso(r.ngay_kt),
      ]);
      const csvRows = data
        .map((r) => r.map((v) => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(','))
        .join('\n');
      const csv = [headers.join(','), csvRows].filter(Boolean).join('\n');

      logInfo('Activities exported to CSV', { count: rows.length });

      return '\uFEFF' + csv;
    } catch (error) {
      logError('Error exporting activities', error);
      throw error;
    }
  }

  /**
   * Export registrations to CSV
   * @param {Object} query - Query parameters
   * @param {string} query.semester - Semester filter
   * @param {string} query.hoc_ky - Học kỳ filter
   * @param {string} query.nam_hoc - Năm học filter
   * @returns {Promise<string>} CSV string
   */
  async exportRegistrations(query = {}) {
    try {
      const { semester, hoc_ky, nam_hoc } = query;
      let activityWhere = {};

      if (semester) {
        const si = parseSemesterString(semester);
        if (!si) {
          throw new Error('Tham số học kỳ không hợp lệ');
        }
        activityWhere = buildSemesterFilter(semester, false);
      } else if (hoc_ky || nam_hoc) {
        activityWhere = { hoc_ky: hoc_ky || undefined, ...(nam_hoc ? { nam_hoc } : {}) };
      }

      const rows = await adminReportsRepo.findRegistrationsForExport(activityWhere);

      const headers = ['SinhVien', 'Email', 'HoatDong', 'TrangThai', 'NgayDangKy'];
      const safeToIso = (d) => {
        if (!d) return '';
        try {
          if (typeof d === 'string') {
            const nd = new Date(d);
            return isNaN(nd.getTime()) ? '' : nd.toISOString();
          }
          if (d instanceof Date && !isNaN(d.getTime())) return d.toISOString();
          if (typeof d.toISOString === 'function') return d.toISOString();
          return '';
        } catch {
          return '';
        }
      };
      const safe = (v) => (v === null || v === undefined ? '' : v);
      const data = rows.map((r) => [
        safe(r.sinh_vien?.nguoi_dung?.ho_ten),
        safe(r.sinh_vien?.nguoi_dung?.email),
        safe(r.hoat_dong?.ten_hd),
        safe(r.trang_thai_dk),
        safeToIso(r.ngay_dang_ky),
      ]);
      const csvRows = data
        .map((r) => r.map((v) => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(','))
        .join('\n');
      const csv = [headers.join(','), csvRows].filter(Boolean).join('\n');

      logInfo('Registrations exported to CSV', { count: rows.length });

      return '\uFEFF' + csv;
    } catch (error) {
      logError('Error exporting registrations', error);
      throw error;
    }
  }
}

module.exports = new AdminReportsService();

