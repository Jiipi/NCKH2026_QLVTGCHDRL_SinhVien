import type { DangKyHoatDong, HoatDong, SinhVien, DiemDanh } from '@prisma/client';
import { NotFoundError, ValidationError, ForbiddenError } from '../../../../core/errors/AppError';
import { prisma } from '../../../../data/infrastructure/prisma/client';
import type IActivityRepository from '../interfaces/IActivityRepository';

interface ScanAttendanceUser {
  sub: string;
}

interface ScanAttendanceResult {
  attendanceId: string;
  activityId: string;
  activityName: string;
  timestamp: Date;
  sessionName: string;
}

/**
 * ScanAttendanceUseCase
 * Use case for scanning QR code to check in attendance
 * Follows Single Responsibility Principle (SRP)
 */
class ScanAttendanceUseCase {
  private activityRepository: IActivityRepository;

  constructor(activityRepository: IActivityRepository) {
    this.activityRepository = activityRepository;
  }

  async execute(
    activityId: string,
    token: string | null | undefined,
    scope: unknown,
    user: ScanAttendanceUser
  ): Promise<ScanAttendanceResult> {
    if (!token) {
      throw new ValidationError('Thiếu mã QR');
    }

    // Không dùng scope filter ở đây vì cần lấy activity theo ID cụ thể
    // Scope filter sẽ được apply ở middleware nếu cần
    // Ensure activity exists and is accessible
    const activity = await this.activityRepository.findById(activityId) as (HoatDong & { qr?: string; qr_token?: string }) | null;
    if (!activity) {
      throw new NotFoundError('Hoạt động không tồn tại');
    }

    // Validate QR token - KHÔNG tự động tạo mới ở đây vì token phải khớp với QR code đã quét
    let serverToken: string = activity.qr || activity.qr_token || '';
    
    // Debug logging
    console.log('[ScanAttendance] Activity ID:', activityId);
    console.log('[ScanAttendance] Verifying attendance token');
    // Security: Don't log token values
    
    // Nếu activity chưa có QR token, không thể điểm danh
    if (!serverToken) {
      console.log('[ScanAttendance] Activity chưa có QR token');
      throw new ValidationError('Hoạt động chưa có mã QR. Vui lòng liên hệ quản trị viên để tạo mã QR.');
    }
    
    // Normalize token (trim, convert to string)
    serverToken = String(serverToken || '').trim();
    const normalizedClientToken: string = String(token || '').trim();
    
    // Backward compatibility: Nếu token trong QR code là 64 chars (token cũ) và server token là 32 chars (token mới)
    // Chỉ so sánh 32 chars đầu của token trong QR code với token trong server
    let tokenToCompare: string = normalizedClientToken;
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

    // Validate attendance time - chính xác đến giây
    const now = new Date();
    const activityStart = new Date(activity.ngay_bd);
    const activityEnd = new Date(activity.ngay_kt);
    
    // Debug log để kiểm tra múi giờ
    console.log('🕐 [ScanAttendance] Time validation:', {
      now: now.toISOString(),
      nowLocal: now.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
      start: activityStart.toISOString(),
      startLocal: activityStart.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
      end: activityEnd.toISOString(),
      endLocal: activityEnd.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
      nowTime: now.getTime(),
      startTime: activityStart.getTime(),
      endTime: activityEnd.getTime(),
      diffToStart: ((activityStart.getTime() - now.getTime()) / 1000).toFixed(0) + ' seconds'
    });
    
    // Kiểm tra chưa đến giờ bắt đầu
    if (now.getTime() < activityStart.getTime()) {
      const startDateStr = activityStart.toLocaleString('vi-VN', { 
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
      console.log('❌ [ScanAttendance] Activity not started yet');
      throw new ValidationError(`Hoạt động chưa bắt đầu. Thời gian bắt đầu: ${startDateStr}`);
    }
    
    // Kiểm tra đã quá giờ kết thúc
    if (now.getTime() > activityEnd.getTime()) {
      const endDateStr = activityEnd.toLocaleString('vi-VN', { 
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
      console.log('❌ [ScanAttendance] Activity already ended');
      throw new ValidationError(`Hoạt động đã kết thúc lúc ${endDateStr}, không thể điểm danh`);
    }

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

export default ScanAttendanceUseCase;
