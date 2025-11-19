const { NotFoundError } = require('../../../../core/errors/AppError');
const { logError } = require('../../../../core/logger');

/**
 * GetNotificationByIdUseCase
 * Use case for getting notification detail by ID
 * Follows Single Responsibility Principle (SRP)
 */
class GetNotificationByIdUseCase {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute(notificationId, userId) {
    const notification = await this.notificationRepository.findByIdForUser(notificationId, userId, 'received');

    if (!notification) {
      throw new NotFoundError('Không tìm thấy thông báo');
    }

    let activity = null;
    try {
      const hdIdMatch = (notification.noi_dung || '').match(/hd_id\s*:\s*([0-9a-fA-F-]{36})/);
      const maHdMatch = (notification.noi_dung || '').match(/ma_hd\s*:\s*([A-Za-z0-9_-]{4,})/);

      if (hdIdMatch) {
        activity = await this.notificationRepository.findActivity({ id: hdIdMatch[1] });
      } else if (maHdMatch) {
        activity = await this.notificationRepository.findActivity({ ma_hd: maHdMatch[1] });
      }
    } catch (error) {
      logError('Error extracting activity from notification:', error);
    }

    return {
      id: notification.id,
      title: notification.tieu_de,
      message: notification.noi_dung,
      type: notification.loai_tb.ten_loai_tb.toLowerCase(),
      priority: notification.muc_do_uu_tien,
      unread: !notification.da_doc,
      time: notification.ngay_gui,
      sender: notification.nguoi_gui.ho_ten || notification.nguoi_gui.email,
      activity
    };
  }
}

module.exports = GetNotificationByIdUseCase;

