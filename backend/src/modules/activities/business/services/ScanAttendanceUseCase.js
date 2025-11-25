const { NotFoundError, ValidationError, ForbiddenError } = require('../../../../core/errors/AppError');
const { prisma } = require('../../../../data/infrastructure/prisma/client');

/**
 * ScanAttendanceUseCase
 * Use case for scanning QR code to check in attendance
 * Follows Single Responsibility Principle (SRP)
 */
class ScanAttendanceUseCase {
  constructor(activityRepository) {
    this.activityRepository = activityRepository;
  }

  async execute(activityId, token, scope, user) {
    if (!token) {
      throw new ValidationError('Thiếu mã QR');
    }

    // Không dùng scope filter ở đây vì cần lấy activity theo ID cụ thể
    // Scope filter sẽ được apply ở middleware nếu cần
    // Ensure activity exists and is accessible
    const activity = await this.activityRepository.findById(activityId);
    if (!activity) {
      throw new NotFoundError('Hoạt động không tồn tại');
    }

    // Validate QR token - KHÔNG tự động tạo mới ở đây vì token phải khớp với QR code đã quét
    let serverToken = activity.qr || activity.qr_token;
    
    // Debug logging
    console.log('[ScanAttendance] Activity ID:', activityId);
    console.log('[ScanAttendance] Activity QR:', serverToken ? (serverToken.substring(0, 10) + '... (' + serverToken.length + ' chars)') : 'null');
    console.log('[ScanAttendance] Received Token:', token ? (token.substring(0, 10) + '... (' + token.length + ' chars)') : 'null');
    
    // Nếu activity chưa có QR token, không thể điểm danh
    if (!serverToken) {
      console.log('[ScanAttendance] Activity chưa có QR token');
      throw new ValidationError('Hoạt động chưa có mã QR. Vui lòng liên hệ quản trị viên để tạo mã QR.');
    }
    
    // Normalize token (trim, convert to string)
    serverToken = String(serverToken || '').trim();
    const normalizedClientToken = String(token || '').trim();
    
    // Backward compatibility: Nếu token trong QR code là 64 chars (token cũ) và server token là 32 chars (token mới)
    // Chỉ so sánh 32 chars đầu của token trong QR code với token trong server
    let tokenToCompare = normalizedClientToken;
    if (normalizedClientToken.length === 64 && serverToken.length === 32) {
      console.log('[ScanAttendance] Detected old 64-char token, comparing first 32 chars');
      tokenToCompare = normalizedClientToken.substring(0, 32);
    }
    
    console.log('[ScanAttendance] Tokens match:', serverToken === tokenToCompare);
    console.log('[ScanAttendance] Server token length:', serverToken.length);
    console.log('[ScanAttendance] Client token length (after normalization):', tokenToCompare.length);
    
    if (serverToken !== tokenToCompare) {
      console.log('[ScanAttendance] Token mismatch - Server:', serverToken.substring(0, 10) + '...', 'Client:', tokenToCompare.substring(0, 10) + '...');
      throw new ValidationError('Mã QR không khớp hoặc đã hết hạn. Vui lòng tạo QR code mới.');
    }

    // TODO: Tạm gỡ kiểm tra thời gian để test
    // Validate attendance time - chỉ cho phép điểm danh trong khoảng thời gian hoạt động
    // const now = new Date();
    // const activityStart = new Date(activity.ngay_bd);
    // const activityEnd = new Date(activity.ngay_kt);
    // 
    // // Cho phép điểm danh trước 30 phút và sau 1 giờ (buffer time)
    // const bufferBefore = 30 * 60 * 1000; // 30 phút
    // const bufferAfter = 60 * 60 * 1000; // 1 giờ
    // 
    // const allowedStart = new Date(activityStart.getTime() - bufferBefore);
    // const allowedEnd = new Date(activityEnd.getTime() + bufferAfter);
    // 
    // if (now < allowedStart) {
    //   throw new ValidationError('Chưa đến thời gian điểm danh. Hoạt động bắt đầu lúc ' + activityStart.toLocaleString('vi-VN'));
    // }
    // 
    // if (now > allowedEnd) {
    //   throw new ValidationError('Đã quá thời gian điểm danh. Hoạt động kết thúc lúc ' + activityEnd.toLocaleString('vi-VN'));
    // }

    // Get current student by user
    const student = await prisma.sinhVien.findUnique({
      where: { nguoi_dung_id: user.sub },
      select: { id: true, lop_id: true }
    });

    if (!student) {
      throw new ForbiddenError('Chỉ sinh viên mới có thể điểm danh bằng QR');
    }

    // Check approved registration exists
    const registration = await prisma.dangKyHoatDong.findUnique({
      where: {
        sv_id_hd_id: { sv_id: student.id, hd_id: String(activityId) }
      },
      select: { id: true, trang_thai_dk: true }
    });

    if (!registration) {
      throw new ValidationError('Bạn chưa đăng ký hoạt động này');
    }

    if (registration.trang_thai_dk !== 'da_duyet') {
      throw new ValidationError('Đăng ký chưa được duyệt, không thể điểm danh');
    }

    // Prevent duplicate attendance
    const existed = await prisma.diemDanh.findUnique({
      where: {
        sv_id_hd_id: { sv_id: student.id, hd_id: String(activityId) }
      }
    });

    if (existed) {
      throw new ValidationError('Bạn đã điểm danh hoạt động này trước đó', 409);
    }

    // Create attendance record
    const created = await prisma.diemDanh.create({
      data: {
        nguoi_diem_danh_id: user.sub,
        sv_id: student.id,
        hd_id: String(activityId),
        phuong_thuc: 'qr',
        trang_thai_tham_gia: 'co_mat',
        xac_nhan_tham_gia: true
      }
    });

    // Update registration status to 'da_tham_gia' if currently approved
    try {
      if (registration.trang_thai_dk === 'da_duyet') {
        await prisma.dangKyHoatDong.update({
          where: { sv_id_hd_id: { sv_id: student.id, hd_id: String(activityId) } },
          data: { trang_thai_dk: 'da_tham_gia' }
        });
      }
    } catch (_) {
      // Non-fatal: attendance succeeded even if status update failed
    }

    return {
      attendanceId: created.id,
      activityId: activity.id,
      activityName: activity.ten_hd,
      timestamp: created.tg_diem_danh,
      sessionName: 'Mặc định'
    };
  }
}

module.exports = ScanAttendanceUseCase;

