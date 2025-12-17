/**
 * DeleteUserUseCase
 * Use case for deleting a user completely from system
 * Orchestrates business logic following Single Responsibility Principle
 */

import type { IAdminUserRepository, TransactionClient, LopRecord } from '../interfaces/IAdminUserRepository';
import { NotFoundError, ForbiddenError } from '../../../../core/errors/AppError';
import { logInfo } from '../../../../core/logger';

class DeleteUserUseCase {
  private adminUserRepository: IAdminUserRepository;

  constructor(adminUserRepository: IAdminUserRepository) {
    this.adminUserRepository = adminUserRepository;
  }

  async execute(userId: string, adminId: string): Promise<void> {
    const existingUser = await this.adminUserRepository.findUserById(userId, {
      vai_tro: true,
      sinh_vien: true
    });

    if (!existingUser) {
      throw new NotFoundError(`Không tìm thấy người dùng với id ${userId}`);
    }

    if (existingUser.id === String(adminId)) {
      throw new ForbiddenError('Không thể xóa tài khoản của chính mình');
    }

    await this.adminUserRepository.runInTransaction(async (tx: TransactionClient) => {
      const sinhVienId = existingUser.sinh_vien?.id;

      if (sinhVienId) {
        await this.adminUserRepository.deleteStudentRegistrations(tx, sinhVienId);
        await this.adminUserRepository.deleteStudentAttendance(tx, sinhVienId);
      }

      await this.adminUserRepository.deleteNotificationsByUser(tx, userId);

      if (sinhVienId) {
        await this.adminUserRepository.clearClassMonitorByStudent(tx, sinhVienId);
      }

      await this.handleHeadTeacherTransfer(tx, userId);
      await this.handleActivityTransfer(tx, userId);
      await this.handleAttendanceTransfer(tx, userId);

      if (sinhVienId) {
        await this.adminUserRepository.deleteStudent(tx, sinhVienId);
      }

      await this.adminUserRepository.deleteUser(tx, userId);
    });

    logInfo('User deleted completely from system', {
      adminId,
      deletedUserId: userId,
      deletedUserMaso: existingUser.ten_dn,
      deletedUserRole: existingUser.vai_tro?.ten_vt,
      hadSinhVien: !!existingUser.sinh_vien
    });
  }

  private async handleHeadTeacherTransfer(tx: TransactionClient, userId: string): Promise<void> {
    const classesAsHeadTeacher = await this.adminUserRepository.findClassesAsHeadTeacher(tx, userId);
    if (!classesAsHeadTeacher.length) return;

    const replacementTeacher = await this.adminUserRepository.findReplacementTeacher(tx, userId);

    if (!replacementTeacher) {
      throw new Error(
        `Không thể xóa user vì đang là chủ nhiệm ${classesAsHeadTeacher.length} lớp ` +
          `(${classesAsHeadTeacher.map((c: LopRecord) => c.ten_lop).join(', ')}) ` +
          'và không có giảng viên khác để thay thế. Vui lòng chuyển chủ nhiệm trước khi xóa.'
      );
    }

    await this.adminUserRepository.updateHeadTeacherForClasses(tx, userId, replacementTeacher.id);
    logInfo('Transferred class head teacher', {
      from: userId,
      to: replacementTeacher.id,
      classCount: classesAsHeadTeacher.length
    });
  }

  private async handleActivityTransfer(tx: TransactionClient, userId: string): Promise<void> {
    const createdActivities = await this.adminUserRepository.countActivitiesByCreator(tx, userId);
    if (!createdActivities) return;

    const otherAdmin = await this.adminUserRepository.findReplacementAdmin(tx, userId);

    if (otherAdmin) {
      await this.adminUserRepository.reassignActivities(tx, userId, otherAdmin.id);
    } else {
      await this.adminUserRepository.deleteActivitiesByCreator(tx, userId);
    }
  }

  private async handleAttendanceTransfer(tx: TransactionClient, userId: string): Promise<void> {
    const attendanceRecordsByUser = await this.adminUserRepository.countAttendanceByChecker(tx, userId);
    if (!attendanceRecordsByUser) return;

    const replacementChecker = await this.adminUserRepository.findReplacementChecker(tx, userId);

    if (replacementChecker) {
      await this.adminUserRepository.reassignAttendanceChecker(tx, userId, replacementChecker.id);
    } else {
      await this.adminUserRepository.deleteAttendanceByChecker(tx, userId);
      logInfo('Deleted attendance records with no replacement', {
        count: attendanceRecordsByUser
      });
    }
  }
}

export default DeleteUserUseCase;
module.exports = DeleteUserUseCase;
