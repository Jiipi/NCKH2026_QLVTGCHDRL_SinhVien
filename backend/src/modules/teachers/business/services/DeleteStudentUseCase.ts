/**
 * DeleteStudentUseCase
 * Use case for deleting a student in teacher's class
 * Follows Single Responsibility Principle (SRP)
 */

import { ForbiddenError } from '../../../../core/errors/AppError';
import type { ITeacherRepository } from '../interfaces/ITeacherRepository';

interface AuthUser {
    sub?: string;
    id?: string;
    role: string;
}

class DeleteStudentUseCase {
    private teacherRepository: ITeacherRepository;

    constructor(teacherRepository: ITeacherRepository) {
        this.teacherRepository = teacherRepository;
    }

    async execute(user: AuthUser, studentId: string): Promise<boolean> {
        if (user.role !== 'GIANG_VIEN' && user.role !== 'GIANG_VIÊN') {
            throw new ForbiddenError('Chỉ giảng viên mới được xóa sinh viên');
        }

        const userId = user.sub || user.id;
        if (!userId) {
            throw new ForbiddenError('Không xác định được người dùng');
        }

        return await this.teacherRepository.deleteStudent(userId, studentId);
    }
}

export default DeleteStudentUseCase;
module.exports = DeleteStudentUseCase;
