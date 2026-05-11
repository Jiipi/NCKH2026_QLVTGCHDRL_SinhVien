import { ValidationError, ForbiddenError, NotFoundError } from '../../../../core/errors/AppError';
import { writeAttendanceAudit } from '../../../../core/logger/attendance-audit';
import { normalizeAttendanceLocation } from '../../../../core/utils/geofence';
import type IActivityRepository from '../interfaces/IActivityRepository';

interface AuthUser { sub: string; }

interface CreateFallbackInput {
  ly_do?: string;
  minh_chung?: string[];
  location?: { latitude?: number | string | null; longitude?: number | string | null; accuracy?: number | string | null } | null;
  ip?: string | null;
  userAgent?: string | null;
}

class CreateAttendanceFallbackRequestUseCase {
  constructor(private readonly activityRepository: IActivityRepository) {}

  async execute(activityId: string, input: CreateFallbackInput, user: AuthUser) {
    const activity = await this.activityRepository.findById(activityId, {}, null) as any;
    if (!activity) throw new NotFoundError('Hoạt động không tồn tại');
    if (!activity.cho_phep_fallback) throw new ValidationError('Hoạt động này không cho phép yêu cầu điểm danh thủ công');

    const student = await this.activityRepository.findStudentByUserId(user.sub);
    if (!student) throw new ForbiddenError('Chỉ sinh viên mới có thể gửi yêu cầu điểm danh thủ công');

    const registration = await this.activityRepository.findUserRegistration(activityId, student.id);
    if (!registration) throw new ValidationError('Bạn chưa đăng ký hoạt động này');
    if (registration.trang_thai_dk !== 'da_duyet') throw new ValidationError('Đăng ký chưa được duyệt, không thể gửi yêu cầu điểm danh');

    const existedAttendance = await this.activityRepository.findAttendanceByStudentAndActivity(student.id, activityId);
    if (existedAttendance) throw new ValidationError('Bạn đã điểm danh hoạt động này trước đó');

    const existedRequest = await this.activityRepository.findFallbackRequestByStudentAndActivity(student.id, activityId) as any;
    if (existedRequest && ['cho_duyet', 'da_duyet'].includes(existedRequest.trang_thai)) {
      throw new ValidationError('Bạn đã có yêu cầu điểm danh thủ công cho hoạt động này');
    }

    const reason = String(input.ly_do || '').trim();
    if (!reason) throw new ValidationError('Vui lòng nhập lý do yêu cầu điểm danh thủ công');

    const location = normalizeAttendanceLocation(input.location);
    const request = await this.activityRepository.createFallbackRequest({
      sv_id: student.id,
      hd_id: activityId,
      ly_do: reason,
      minh_chung: Array.isArray(input.minh_chung) ? input.minh_chung : [],
      gps_latitude: location?.latitude ?? null,
      gps_longitude: location?.longitude ?? null,
      gps_accuracy_m: location?.accuracy ?? null,
      dia_chi_ip: input.ip || null,
      user_agent: input.userAgent || null
    });

    await writeAttendanceAudit({
      action: 'FALLBACK_REQUESTED',
      result: 'success',
      actorId: user.sub,
      studentId: student.id,
      activityId,
      ip: input.ip || undefined,
      userAgent: input.userAgent || undefined,
      reason: 'fallback_requested',
      metadata: JSON.parse(JSON.stringify({ request, location }))
    });

    return request;
  }
}

export default CreateAttendanceFallbackRequestUseCase;
