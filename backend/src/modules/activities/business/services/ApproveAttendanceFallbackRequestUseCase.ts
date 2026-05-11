import { NotFoundError, ValidationError } from '../../../../core/errors/AppError';
import { writeAttendanceAudit } from '../../../../core/logger/attendance-audit';
import type IActivityRepository from '../interfaces/IActivityRepository';

interface AuthUser { sub: string; id?: string; }

class ApproveAttendanceFallbackRequestUseCase {
  constructor(private readonly activityRepository: IActivityRepository) {}

  async execute(requestId: string, note: string | undefined, user: AuthUser, audit?: { ip?: string | null; userAgent?: string | null }) {
    const request = await this.activityRepository.findFallbackRequestById(requestId) as any;
    if (!request) throw new NotFoundError('Yêu cầu điểm danh thủ công không tồn tại');
    if (request.trang_thai !== 'cho_duyet') throw new ValidationError('Yêu cầu này không còn ở trạng thái chờ duyệt');

    const existedAttendance = await this.activityRepository.findAttendanceByStudentAndActivity(request.sv_id, request.hd_id);
    if (existedAttendance) throw new ValidationError('Sinh viên đã có bản ghi điểm danh cho hoạt động này');

    const approverId = user.sub || user.id;
    const updated = await this.activityRepository.approveFallbackRequest(requestId, String(approverId), note || null);

    await writeAttendanceAudit({
      action: 'FALLBACK_APPROVED',
      result: 'success',
      actorId: String(approverId),
      studentId: request.sv_id,
      activityId: request.hd_id,
      ip: audit?.ip || undefined,
      userAgent: audit?.userAgent || undefined,
      reason: 'fallback_approved',
      metadata: JSON.parse(JSON.stringify({ requestId, note }))
    });

    return updated;
  }
}

export default ApproveAttendanceFallbackRequestUseCase;
