import { ForbiddenError, NotFoundError, ValidationError } from '../../../../core/errors/AppError';
import { writeAttendanceAudit } from '../../../../core/logger/attendance-audit';
import type IActivityRepository from '../interfaces/IActivityRepository';

interface AuthUser { sub: string; }

class CancelAttendanceFallbackRequestUseCase {
  constructor(private readonly activityRepository: IActivityRepository) {}

  async execute(requestId: string, user: AuthUser, audit?: { ip?: string | null; userAgent?: string | null }) {
    const student = await this.activityRepository.findStudentByUserId(user.sub);
    if (!student) throw new ForbiddenError('Chỉ sinh viên mới có thể hủy yêu cầu của mình');

    const request = await this.activityRepository.findFallbackRequestById(requestId) as any;
    if (!request) throw new NotFoundError('Yêu cầu điểm danh thủ công không tồn tại');
    if (request.sv_id !== student.id) throw new ForbiddenError('Bạn không có quyền hủy yêu cầu này');
    if (request.trang_thai !== 'cho_duyet') throw new ValidationError('Chỉ có thể hủy yêu cầu đang chờ duyệt');

    const updated = await this.activityRepository.cancelFallbackRequest(requestId, student.id);

    await writeAttendanceAudit({
      action: 'FALLBACK_CANCELLED',
      result: 'success',
      actorId: user.sub,
      studentId: student.id,
      activityId: request.hd_id,
      ip: audit?.ip || undefined,
      userAgent: audit?.userAgent || undefined,
      reason: 'fallback_cancelled',
      metadata: JSON.parse(JSON.stringify({ requestId }))
    });

    return updated;
  }
}

export default CancelAttendanceFallbackRequestUseCase;
