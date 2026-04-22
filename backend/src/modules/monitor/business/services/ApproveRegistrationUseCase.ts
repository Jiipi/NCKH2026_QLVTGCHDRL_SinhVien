import type { DangKyHoatDong, SinhVien, HoatDong, Lop, TrangThaiDangKy } from '@prisma/client';
import type IMonitorRepository from '../interfaces/IMonitorRepository';

import SemesterClosure from '../../../../business/services/semesterClosure.service';
import { NotFoundError } from '../../../../core/errors/AppError';
import { logInfo, logError } from '../../../../core/logger';

/**
 * ApproveRegistrationUseCase
 * Use case for approving a registration
 * Follows Single Responsibility Principle (SRP)
 */
class ApproveRegistrationUseCase {
  private monitorRepository: IMonitorRepository;

  constructor(monitorRepository: IMonitorRepository) {
    this.monitorRepository = monitorRepository;
  }

  async execute(registrationId: string, userId: string, userRole: string): Promise<boolean> {
    try {
      logInfo('Approving registration', { registrationId, userId });

      const registration = await this.monitorRepository.findRegistrationById(registrationId);

      if (!registration) {
        throw new NotFoundError('Không tìm thấy đăng ký');
      }

      SemesterClosure.checkWritableForClassSemesterOrThrow({
        classId: registration.sinh_vien?.lop?.id,
        hoc_ky: registration.hoat_dong?.hoc_ky,
        nam_hoc: registration.hoat_dong?.nam_hoc,
        userRole
      });

      await this.monitorRepository.updateRegistrationStatus(registrationId, 'da_duyet', {
        ghi_chu: `APPROVED_BY:${userRole}|USER:${userId}`,
        nguoi_duyet_id: userId
      });

      try {
        const loai = await this.monitorRepository.findNotificationTypeByName('Hoạt động');
        const firstLoai = await this.monitorRepository.findFirstNotificationType();
        const loaiId = loai?.id || firstLoai?.id;
        const recipientId = registration?.sinh_vien?.nguoi_dung_id;

        if (loaiId && recipientId) {
          await this.monitorRepository.createNotification({
            tieu_de: 'Đăng ký đã được phê duyệt',
            noi_dung: `Bạn đã được phê duyệt tham gia hoạt động "${registration?.hoat_dong?.ten_hd || ''}"`,
            loai_tb_id: loaiId,
            nguoi_gui_id: userId,
            nguoi_nhan_id: recipientId,
            muc_do_uu_tien: 'trung_binh',
            phuong_thuc_gui: 'trong_he_thong'
          });
        }
      } catch (e) {
        logError('Error sending approval notification', e);
      }

      return true;
    } catch (error) {
      logError('Error approving registration', error);
      throw error;
    }
  }
}

export default ApproveRegistrationUseCase;
module.exports = ApproveRegistrationUseCase;
