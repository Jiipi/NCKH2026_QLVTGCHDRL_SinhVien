/**
 * UpdateStudentUseCase
 * Use case for updating a student in teacher's class
 * Follows Single Responsibility Principle (SRP)
 */

import { ForbiddenError } from '../../../../core/errors/AppError';
import type { ITeacherRepository, UpdateStudentPayload, CreateStudentResult } from '../interfaces/ITeacherRepository';

interface AuthUser {
    sub?: string;
    id?: string;
    role: string;
}

class UpdateStudentUseCase {
    private teacherRepository: ITeacherRepository;

    constructor(teacherRepository: ITeacherRepository) {
        this.teacherRepository = teacherRepository;
    }

    async execute(user: AuthUser, studentId: string, payload: UpdateStudentPayload): Promise<CreateStudentResult> {
        if (user.role !== 'GIANG_VIEN' && user.role !== 'GIANG_VIÊN') {
            throw new ForbiddenError('Chỉ giảng viên mới được cập nhật sinh viên');
        }

        const userId = user.sub || user.id;
        if (!userId) {
            throw new ForbiddenError('Không xác định được người dùng');
        }

        return await this.teacherRepository.updateStudent(userId, studentId, payload);
    }
}

export default UpdateStudentUseCase;
module.exports = UpdateStudentUseCase;
