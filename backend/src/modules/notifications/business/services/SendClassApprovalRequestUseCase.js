const { prisma } = require('../../../../data/infrastructure/prisma/client');
const { logInfo, logError } = require('../../../../core/logger');

/**
 * SendClassApprovalRequestUseCase
 * Use case for sending class approval request notifications
 * Follows Single Responsibility Principle (SRP)
 */
class SendClassApprovalRequestUseCase {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute({ studentId, studentName, studentMSSV, classId, className }) {
    try {
      let notificationType = await prisma.loaiThongBao.findFirst({
        where: { ten_loai_tb: 'Yêu cầu phê duyệt lớp' }
      });

      if (!notificationType) {
        notificationType = await prisma.loaiThongBao.create({
          data: {
            ten_loai_tb: 'Yêu cầu phê duyệt lớp',
            mo_ta: 'Thông báo khi sinh viên đăng ký vào lớp cần được phê duyệt'
          }
        });
      }

      const classInfo = await prisma.lop.findUnique({
        where: { id: classId },
        include: {
          lop_truong_rel: {
            include: {
              nguoi_dung: true
            }
          }
        }
      });

      const adminRole = await prisma.vaiTro.findFirst({
        where: { ten_vt: 'ADMIN' }
      });

      const admins = adminRole ? await prisma.nguoiDung.findMany({
        where: { vai_tro_id: adminRole.id },
        select: { id: true, ho_ten: true }
      }) : [];

      logInfo('Sending class approval request', {
        className,
        hasMonitor: !!classInfo?.lop_truong,
        adminCount: admins.length
      });

      const title = `Yêu cầu phê duyệt: ${studentName} vào lớp ${className}`;
      const content = `Sinh viên ${studentName} (MSSV: ${studentMSSV}) đã đăng ký tài khoản và yêu cầu tham gia lớp ${className}. Vui lòng xem xét và phê duyệt.`;

      const notifications = [];

      if (classInfo?.lop_truong && classInfo?.lop_truong_rel?.nguoi_dung_id) {
        notifications.push({
          tieu_de: title,
          noi_dung: content,
          loai_tb_id: notificationType.id,
          nguoi_gui_id: studentId,
          nguoi_nhan_id: classInfo.lop_truong_rel.nguoi_dung_id,
          muc_do_uu_tien: 'cao',
          phuong_thuc_gui: 'trong_he_thong'
        });
        logInfo('Sending to class monitor', {
          monitorName: classInfo.lop_truong_rel.nguoi_dung.ho_ten
        });
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
        await prisma.thongBao.createMany({
          data: notifications
        });

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

module.exports = SendClassApprovalRequestUseCase;

