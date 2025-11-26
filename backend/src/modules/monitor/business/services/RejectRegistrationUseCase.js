const SemesterClosure = require('../../../../business/services/semesterClosure.service');
const { NotFoundError } = require('../../../../core/errors/AppError');
const { logInfo, logError } = require('../../../../core/logger');

/**
 * RejectRegistrationUseCase
 * Use case for rejecting a registration
 * Follows Single Responsibility Principle (SRP)
 */
class RejectRegistrationUseCase {
  constructor(monitorRepository) {
    this.monitorRepository = monitorRepository;
  }

  async execute(registrationId, userId, userRole, reason = null) {
    try {
      logInfo('Rejecting registration', { registrationId, userId, reason });

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

      await this.monitorRepository.updateRegistrationStatus(registrationId, 'tu_choi', {
        ly_do_tu_choi: reason || 'Bị từ chối',
        ghi_chu: `REJECTED_BY:${userRole}|USER:${userId}`,
        nguoi_duyet_id: userId
      });

      try {
        const loai = await this.monitorRepository.findNotificationTypeByName('Hoạt động');
        const loaiId = loai?.id || (await this.monitorRepository.findFirstNotificationType())?.id;
        const recipientId = registration?.sinh_vien?.nguoi_dung_id;
        
        if (loaiId && recipientId) {
          await this.monitorRepository.createNotification({
            tieu_de: 'Đăng ký bị từ chối',
            noi_dung: `Đăng ký tham gia hoạt động "${registration?.hoat_dong?.ten_hd || ''}" đã bị từ chối. Lý do: ${reason || 'Không đủ điều kiện tham gia'}`,
            loai_tb_id: loaiId,
            nguoi_gui_id: userId,
            nguoi_nhan_id: recipientId,
            muc_do_uu_tien: 'trung_binh',
            phuong_thuc_gui: 'trong_he_thong'
          });
        }
      } catch (e) {
        logError('Error sending rejection notification', e);
      }

      return true;
    } catch (error) {
      logError('Error rejecting registration', error);
      throw error;
    }
  }
}

module.exports = RejectRegistrationUseCase;

