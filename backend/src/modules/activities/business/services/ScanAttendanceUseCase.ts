import type { HoatDong } from '@prisma/client';
import { NotFoundError, ValidationError, ForbiddenError } from '../../../../core/errors/AppError';
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
    user: ScanAttendanceUser,
    semesterInfo?: { hoc_ky: string; nam_hoc: string }
  ): Promise<ScanAttendanceResult> {
    if (!token) {
      throw new ValidationError('Thiếu mã QR');
    }

    // Không dùng scope filter ở đây vì cần lấy activity theo ID cụ thể
    // Scope filter sẽ được apply ở middleware nếu cần
    // Ensure activity exists and is accessible, validate semester
    const activity = await this.activityRepository.findById(activityId, {}, null, semesterInfo) as (HoatDong & { qr?: string; qr_token?: string }) | null;
    if (!activity) {
      throw new NotFoundError('Hoạt động không tồn tại');
    }

    // Validate QR token - KHÔNG tự động tạo mới ở đây vì token phải khớp với QR code đã quét
    let serverToken: string = activity.qr || activity.qr_token || '';

    // Nếu activity chưa có QR token, không thể điểm danh
    if (!serverToken) {
      throw new ValidationError('Hoạt động chưa có mã QR. Vui lòng liên hệ quản trị viên để tạo mã QR.');
    }

    // Normalize token (trim, convert to string)
    serverToken = String(serverToken || '').trim();
    const normalizedClientToken: string = String(token || '').trim();

    // Backward compatibility: Nếu token trong QR code là 64 chars (token cũ) và server token là 32 chars (token mới)
    // Chỉ so sánh 32 chars đầu của token trong QR code với token trong server
    let tokenToCompare: string = normalizedClientToken;
    if (normalizedClientToken.length === 64 && serverToken.length === 32) {
      tokenToCompare = normalizedClientToken.substring(0, 32);
    }

    if (serverToken !== tokenToCompare) {
      throw new ValidationError('Mã QR không khớp hoặc đã hết hạn. Vui lòng tạo QR code mới.');
    }

    // Validate attendance time - chính xác đến giây
    const now = new Date();
    const activityStart = new Date(activity.ngay_bd);
    const activityEnd = new Date(activity.ngay_kt);

    // Cho phép điểm danh sớm 12 tiếng để xử lý lỗi lệch múi giờ (UTC vs Local)
    const leeway = 12 * 60 * 60 * 1000;

    // Kiểm tra chưa đến giờ bắt đầu
    if (now.getTime() + leeway < activityStart.getTime()) {
      const startDateStr = activityStart.toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
      throw new ValidationError(`Hoạt động chưa bắt đầu. Thời gian bắt đầu: ${startDateStr}`);
    }

    // Kiểm tra đã quá giờ kết thúc
    if (now.getTime() - leeway > activityEnd.getTime()) {
      const endDateStr = activityEnd.toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
      throw new ValidationError(`Hoạt động đã kết thúc lúc ${endDateStr}, không thể điểm danh`);
    }

    // Get current student by user
    const student = await this.activityRepository.findStudentByUserId(user.sub);

    if (!student) {
      throw new ForbiddenError('Chỉ sinh viên mới có thể điểm danh bằng QR');
    }

    // Check approved registration exists
    const registration = await this.activityRepository.findUserRegistration(String(activityId), student.id);

    if (!registration) {
      throw new ValidationError('Bạn chưa đăng ký hoạt động này');
    }

    if (registration.trang_thai_dk !== 'da_duyet') {
      throw new ValidationError('Đăng ký chưa được duyệt, không thể điểm danh');
    }

    // Prevent duplicate attendance
    const existed = await this.activityRepository.findAttendanceByStudentAndActivity(student.id, String(activityId));

    if (existed) {
      throw new ValidationError('Bạn đã điểm danh hoạt động này trước đó', 409);
    }

    // Create attendance record
    const created = await this.activityRepository.createAttendance({
      nguoi_diem_danh_id: user.sub,
      sv_id: student.id,
      hd_id: String(activityId)
    });

    // Update registration status to 'da_tham_gia' if currently approved
    try {
      if (registration.trang_thai_dk === 'da_duyet') {
        await this.activityRepository.markRegistrationAsAttended(student.id, String(activityId));
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
