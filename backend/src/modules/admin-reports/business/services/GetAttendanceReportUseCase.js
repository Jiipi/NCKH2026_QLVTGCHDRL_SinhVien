const { logInfo } = require('../../../../core/logger');

class GetAttendanceReportUseCase {
  constructor(adminReportsRepository) {
    this.repository = adminReportsRepository;
  }

  async execute(params = {}) {
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
    const { attendanceList, total } = await this.repository.findAttendanceWithFilters(
      whereCondition,
      skip,
      actualLimit
    );

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

    // Get overall stats
    const stats = await this.repository.getAttendanceStats();

    return {
      attendance: transformedData,
      stats,
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
}

module.exports = GetAttendanceReportUseCase;

