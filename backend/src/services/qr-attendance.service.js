// services/qr-attendance.service.js
// QR Code Attendance Service
// Handles QR code scanning and attendance recording

const { prisma } = require('../infrastructure/prisma/client');
const { logInfo, logError } = require('../core/logger');

class QrAttendanceService {
  /**
   * Scan QR code and record attendance
   * @param {string} qrCode - QR code data (JSON string)
   * @param {object} user - User object with id, role, sub
   * @param {object} req - Express request object (for IP)
   * @returns {Promise<object>} Attendance result
   */
  async scanQrCode(qrCode, user, req) {
    console.log('QR Attendance Scan:', { hasQR: !!qrCode, user: { role: user.role, id: user.id } });

    // 1. Parse QR code payload
    let parsed;
    try {
      parsed = JSON.parse(String(qrCode));
    } catch (_) {
      try {
        parsed = JSON.parse(decodeURIComponent(String(qrCode)));
      } catch {
        parsed = null;
      }
    }

    if (!parsed?.hd) {
      console.log('❌ Invalid QR payload');
      const error = new Error('Mã QR không hợp lệ');
      error.status = 400;
      throw error;
    }

    const activityId = String(parsed.hd);

    // 2. Verify activity exists
    const activity = await prisma.hoatDong.findUnique({
      where: { id: activityId }
    });

    if (!activity) {
      console.log('❌ Activity not found:', activityId);
      const error = new Error('Không tìm thấy hoạt động');
      error.status = 404;
      throw error;
    }

    // 3. Time validation (allow điểm danh đến hết ngày kết thúc)
    const now = new Date();
    const end = new Date(activity.ngay_kt);
    const endOfDay = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999);
    
    if (now > endOfDay) {
      const error = new Error('Điểm danh đã hết hạn');
      error.status = 400;
      throw error;
    }

    // 4. Verify QR token matches (security check)
    if (activity.qr) {
      if (!parsed.token || parsed.token !== activity.qr) {
        console.log('❌ QR token mismatch');
        const error = new Error('Mã QR đã hết hạn hoặc không hợp lệ');
        error.status = 400;
        throw error;
      }
    }

    // 5. Verify user is a student or monitor
    const role = String(user.role || '').toUpperCase();
    if (role !== 'SINH_VIEN' && role !== 'LOP_TRUONG') {
      console.log('❌ Non-student attempted to scan QR:', role);
      const error = new Error('Chỉ sinh viên mới được điểm danh bằng QR');
      error.status = 403;
      throw error;
    }

    // 6. Get student info
    const sv = await prisma.sinhVien.findUnique({
      where: { nguoi_dung_id: user.sub },
      select: { id: true, mssv: true, nguoi_dung_id: true }
    });

    if (!sv) {
      console.log('❌ Student record not found');
      const error = new Error('Không tìm thấy thông tin sinh viên của bạn');
      error.status = 400;
      throw error;
    }

    // 7. Check if student has registered for this activity
    const reg = await prisma.dangKyHoatDong.findUnique({
      where: {
        sv_id_hd_id: {
          sv_id: sv.id,
          hd_id: activityId
        }
      },
      select: { id: true, trang_thai_dk: true, ngay_dang_ky: true }
    });

    if (!reg) {
      console.log('❌ Student not registered for activity');
      const error = new Error('Bạn chưa đăng ký hoạt động này. Vui lòng đăng ký trước khi điểm danh.');
      error.status = 403;
      throw error;
    }

    // 8. Check registration status
    if (reg.trang_thai_dk === 'tu_choi') {
      console.log('❌ Registration rejected');
      const error = new Error('Đăng ký của bạn đã bị từ chối. Không thể điểm danh.');
      error.status = 403;
      throw error;
    }

    // 9. Check duplicate attendance
    const existed = await prisma.diemDanh.findUnique({
      where: {
        sv_id_hd_id: {
          sv_id: sv.id,
          hd_id: activityId
        }
      },
      select: { id: true, tg_diem_danh: true }
    }).catch(() => null);

    if (existed) {
      const attendanceTime = new Date(existed.tg_diem_danh).toLocaleString('vi-VN');
      console.log('❌ Duplicate attendance attempt');
      const error = new Error(`Bạn đã điểm danh trước đó vào lúc ${attendanceTime}`);
      error.status = 400;
      throw error;
    }

    // 10. Create attendance record
    const clientIp = (req.headers['x-forwarded-for'] || '').toString().split(',')[0] || req.ip || null;
    
    const created = await prisma.diemDanh.create({
      data: {
        nguoi_diem_danh_id: user.sub,
        sv_id: sv.id,
        hd_id: activityId,
        phuong_thuc: 'qr',
        trang_thai_tham_gia: 'co_mat',
        dia_chi_ip: clientIp,
        xac_nhan_tham_gia: true
      }
    });

    // 11. Update registration status to "participated"
    if (reg.trang_thai_dk !== 'da_tham_gia') {
      await prisma.dangKyHoatDong.update({
        where: { id: reg.id },
        data: { trang_thai_dk: 'da_tham_gia' }
      });
    }

    console.log('✅ QR attendance successful:', {
      attendanceId: created.id,
      studentId: sv.id,
      mssv: sv.mssv,
      activityId,
      points: activity.diem_rl
    });

    // Format session name with date range
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : '';
    const sessionLabel = activity.ngay_bd && activity.ngay_kt
      ? `${formatDate(activity.ngay_bd)} - ${formatDate(activity.ngay_kt)}`
      : (activity.ngay_bd ? `Ngày ${formatDate(activity.ngay_bd)}` : 'Phiên duy nhất');

    return {
      id: created.id,
      points_awarded: Number(activity.diem_rl || 0),
      activity_name: activity.ten_hd,
      activityName: activity.ten_hd,
      attendance_time: created.tg_diem_danh,
      timestamp: created.tg_diem_danh,
      sessionName: sessionLabel,
      activityId,
      location: activity.dia_diem || 'Chưa xác định',
      startDate: activity.ngay_bd,
      endDate: activity.ngay_kt
    };
  }
}

module.exports = new QrAttendanceService();




