import { ForbiddenError } from '../../../../core/errors/AppError';
import type IActivityRepository from '../interfaces/IActivityRepository';

interface AuthUser { sub: string; role?: string; }

class ListAttendanceFallbackRequestsUseCase {
  constructor(private readonly activityRepository: IActivityRepository) {}

  async listByActivity(activityId: string) {
    return this.activityRepository.listFallbackRequests(activityId);
  }

  async listMine(user: AuthUser) {
    const student = await this.activityRepository.findStudentByUserId(user.sub);
    if (!student) throw new ForbiddenError('Chỉ sinh viên mới có danh sách yêu cầu của mình');
    return this.activityRepository.listFallbackRequests(undefined, student.id);
  }
}

export default ListAttendanceFallbackRequestsUseCase;
