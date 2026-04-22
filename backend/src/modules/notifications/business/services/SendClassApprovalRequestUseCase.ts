import type INotificationRepository from '../interfaces/INotificationRepository';
import { logInfo, logError } from '../../../../core/logger';

interface SendClassApprovalRequestParams {
  studentId: string;
  studentName: string;
  studentMSSV: string;
  classId: string;
  className: string;
}

interface SendClassApprovalRequestResult {
  success: boolean;
  message: string;
  recipients: number;
}

interface NotificationData {
  tieu_de: string;
  noi_dung: string;
  loai_tb_id: string;
  nguoi_gui_id: string;
  nguoi_nhan_id: string;
  muc_do_uu_tien: 'thap' | 'trung_binh' | 'cao' | 'khan_cap';
  phuong_thuc_gui: 'trong_he_thong' | 'email' | 'sdt';
}

/**
 * SendClassApprovalRequestUseCase
 * Use case for sending class approval request notifications
 * Follows Single Responsibility Principle (SRP)
 */
class SendClassApprovalRequestUseCase {
  private notificationRepository: INotificationRepository;

  constructor(notificationRepository: INotificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute({ studentId, studentName, studentMSSV, classId, className }: SendClassApprovalRequestParams): Promise<SendClassApprovalRequestResult> {
    try {
      const notificationType = await this.notificationRepository.getOrCreateNotificationType(
        undefined,
        'Yêu cầu phê duyệt lớp'
      );

      const monitorUserId = await this.notificationRepository.getClassMonitorUserId(classId);
      const admins = await this.notificationRepository.getAdminUsers();

      logInfo('Sending class approval request', {
        className,
        hasMonitor: !!monitorUserId,
        adminCount: admins.length
      });

      const title = `Yêu cầu phê duyệt: ${studentName} vào lớp ${className}`;
      const content = `Sinh viên ${studentName} (MSSV: ${studentMSSV}) đã đăng ký tài khoản và yêu cầu tham gia lớp ${className}. Vui lòng xem xét và phê duyệt.`;

      const notifications: NotificationData[] = [];

      if (monitorUserId) {
        notifications.push({
          tieu_de: title,
          noi_dung: content,
          loai_tb_id: notificationType.id,
          nguoi_gui_id: studentId,
          nguoi_nhan_id: monitorUserId,
          muc_do_uu_tien: 'cao',
          phuong_thuc_gui: 'trong_he_thong'
        });
        logInfo('Sending to class monitor', { classId });
      } else {
        logInfo('Class has no monitor', { className });
      }

      for (const admin of admins) {
        notifications.push({
          tieu_de: title,
          noi_dung: content,
          loai_tb_id: notificationType.id,
          nguoi_gui_id: studentId,
          nguoi_nhan_id: admin.id,
          muc_do_uu_tien: 'cao',
          phuong_thuc_gui: 'trong_he_thong'
        });
      }

      if (notifications.length > 0) {
        await this.notificationRepository.createMany(notifications);

        logInfo('Class approval notifications sent', {
          studentMSSV,
          notificationCount: notifications.length
        });
      }

      return {
        success: true,
        message: `Đã gửi ${notifications.length} thông báo`,
        recipients: notifications.length
      };
    } catch (error) {
      logError('Error sending class approval request', error);
      throw error;
    }
  }
}

export default SendClassApprovalRequestUseCase;
module.exports = SendClassApprovalRequestUseCase;
