import type { HoatDong } from '@prisma/client';
import { NotFoundError, ValidationError, ForbiddenError } from '../../../../core/errors/AppError';
import qrAttendanceTokenService from '../../../../business/services/qr-attendance-token.service';
import { writeAttendanceAudit } from '../../../../core/logger/attendance-audit';
import { evaluateGeofence, normalizeAttendanceLocation } from '../../../../core/utils/geofence';
import type IActivityRepository from '../interfaces/IActivityRepository';

interface ScanAttendanceUser {
  sub: string;
}

interface ScanAttendanceAuditContext {
  actorId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}

interface ScanAttendanceLocationInput {
  latitude?: number | string | null;
  longitude?: number | string | null;
  accuracy?: number | string | null;
}

type ScanAttendanceTokenInput = string | {
  token?: string;
  sessionId?: string;
  location?: ScanAttendanceLocationInput | null;
};

interface ScanAttendanceResult {
  attendanceId: string;
  activityId: string;
  activityName: string;
  timestamp: Date;
  sessionName: string;
}

type ScanAttendanceActivity = HoatDong & {
  qr?: string | null;
  qr_token?: string | null;
  geo_latitude?: { toString(): string } | string | number | null;
  geo_longitude?: { toString(): string } | string | number | null;
  geo_radius_meters?: number | null;
  yeu_cau_gps?: boolean | null;
  cho_phep_fallback?: boolean | null;
};

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
    tokenInput: ScanAttendanceTokenInput | null | undefined,
    _scope: unknown,
    user: ScanAttendanceUser,
    semesterInfo?: { hoc_ky: string; nam_hoc: string },
    auditContext?: ScanAttendanceAuditContext
  ): Promise<ScanAttendanceResult> {
    const token = typeof tokenInput === 'string' ? tokenInput : tokenInput?.token;
    const sessionId = typeof tokenInput === 'object' && tokenInput ? tokenInput.sessionId : undefined;
    const baseAudit = {
      actorId: auditContext?.actorId || user?.sub || null,
      activityId,
      sessionId: sessionId || null,
      ip: auditContext?.ip,
      userAgent: auditContext?.userAgent
    };
    let studentId: string | null = null;
    let qrTokenId: string | null = null;

    const auditFailure = async (reason: string, metadata?: Record<string, unknown>) => {
      await writeAttendanceAudit({
        action: 'SCAN_FAILED',
        result: 'failed',
        ...baseAudit,
        studentId,
        qrTokenId,
        reason,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined
      });
    };

    if (!token) {
      await auditFailure('missing_token');
      throw new ValidationError('Thiếu mã QR');
    }

    const activityWithSemester = await this.activityRepository.findById(activityId, {}, null, semesterInfo) as ScanAttendanceActivity | null;
    const activity = activityWithSemester || await this.activityRepository.findById(activityId, {}, null) as ScanAttendanceActivity | null;
    if (!activity) {
      await auditFailure('activity_not_found');
      throw new NotFoundError('Hoạt động không tồn tại');
    }

    if (sessionId) {
      try {
        const verifiedToken = await qrAttendanceTokenService.verifyToken(activityId, sessionId, token);
        qrTokenId = verifiedToken.tokenId;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Mã QR không hợp lệ';
        const reason = message.includes('hết hạn') ? 'expired_token' : message.includes('Thiếu') ? 'missing_token' : 'invalid_token';
        await auditFailure(reason, { message });
        throw error;
      }
    } else {
      let serverToken: string = activity.qr || activity.qr_token || '';

      if (!serverToken) {
        await auditFailure('missing_server_token');
        throw new ValidationError('Hoạt động chưa có mã QR. Vui lòng liên hệ quản trị viên để tạo mã QR.');
      }

      serverToken = String(serverToken || '').trim();
      const normalizedClientToken: string = String(token || '').trim();

      let tokenToCompare: string = normalizedClientToken;
      if (normalizedClientToken.length === 64 && serverToken.length === 32) {
        tokenToCompare = normalizedClientToken.substring(0, 32);
      }

      if (serverToken !== tokenToCompare) {
        await auditFailure('token_mismatch');
        throw new ValidationError('Mã QR không khớp hoặc đã hết hạn. Vui lòng tạo QR code mới.');
      }
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
      await auditFailure('outside_time_window', { boundary: 'before_start', startsAt: activityStart.toISOString() });
      throw new ValidationError(`Hoạt động chưa bắt đầu. Thời gian bắt đầu: ${startDateStr}`);
    }

    // Kiểm tra đã quá giờ kết thúc
    if (now.getTime() - leeway > activityEnd.getTime()) {
      const endDateStr = activityEnd.toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
      await auditFailure('outside_time_window', { boundary: 'after_end', endsAt: activityEnd.toISOString() });
      throw new ValidationError(`Hoạt động đã kết thúc lúc ${endDateStr}, không thể điểm danh`);
    }

    // Get current student by user
    const student = await this.activityRepository.findStudentByUserId(user.sub);

    if (!student) {
      await auditFailure('student_not_found');
      throw new ForbiddenError('Chỉ sinh viên mới có thể điểm danh bằng QR');
    }

    studentId = student.id;

    // Check approved registration exists
    const registration = await this.activityRepository.findUserRegistration(String(activityId), student.id);

    if (!registration) {
      await auditFailure('not_registered');
      throw new ValidationError('Bạn chưa đăng ký hoạt động này');
    }

    if (registration.trang_thai_dk !== 'da_duyet') {
      await auditFailure('registration_not_approved', { registrationStatus: registration.trang_thai_dk });
      throw new ValidationError('Đăng ký chưa được duyệt, không thể điểm danh');
    }

    // Prevent duplicate attendance
    const existed = await this.activityRepository.findAttendanceByStudentAndActivity(student.id, String(activityId));

    if (existed) {
      await auditFailure('duplicate_attendance', { attendanceId: existed.id });
      throw new ValidationError('Bạn đã điểm danh hoạt động này trước đó', 409);
    }

    const locationInput = typeof tokenInput === 'object' && tokenInput ? tokenInput.location : undefined;
    const normalizedLocation = normalizeAttendanceLocation(locationInput);
    const geofence = evaluateGeofence({
      latitude: activity.geo_latitude?.toString(),
      longitude: activity.geo_longitude?.toString(),
      radiusMeters: activity.geo_radius_meters,
      required: activity.yeu_cau_gps,
      cho_phep_fallback: activity.cho_phep_fallback
    }, locationInput);

    if (!geofence.allowed) {
      const canRequestFallback = Boolean(activity.cho_phep_fallback);
      const metadata = {
        geofence,
        canRequestFallback,
        location: normalizedLocation
      };
      await auditFailure(geofence.reason || geofence.result, metadata);

      const message = geofence.reason === 'low_gps_accuracy'
        ? 'GPS có sai số quá lớn, vui lòng thử lại hoặc gửi yêu cầu điểm danh thủ công'
        : geofence.reason === 'outside_geofence'
          ? 'Bạn đang ở ngoài khu vực điểm danh cho phép'
          : 'Thiếu vị trí GPS để điểm danh hoạt động này';

      throw new ValidationError(message, {
        reason: geofence.reason || geofence.result,
        canRequestFallback,
        geofence
      });
    }

    const gpsText = normalizedLocation ? `${normalizedLocation.latitude},${normalizedLocation.longitude}` : null;

    // Create attendance record
    const created = await this.activityRepository.createAttendance({
      nguoi_diem_danh_id: user.sub,
      sv_id: student.id,
      hd_id: String(activityId),
      dia_chi_ip: auditContext?.ip || null,
      vi_tri_gps: gpsText,
      gps_latitude: normalizedLocation?.latitude ?? null,
      gps_longitude: normalizedLocation?.longitude ?? null,
      gps_accuracy_m: geofence.accuracyMeters ?? normalizedLocation?.accuracy ?? null,
      khoang_cach_m: geofence.distanceMeters ?? null,
      ket_qua_geofence: geofence.result
    });

    await writeAttendanceAudit({
      action: 'SCAN_SUCCESS',
      result: 'success',
      ...baseAudit,
      studentId: student.id,
      qrTokenId,
      attendanceId: created.id,
      reason: activity.yeu_cau_gps ? 'geofence_passed' : undefined,
      metadata: JSON.parse(JSON.stringify({
        geofence,
        location: normalizedLocation
      }))
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
