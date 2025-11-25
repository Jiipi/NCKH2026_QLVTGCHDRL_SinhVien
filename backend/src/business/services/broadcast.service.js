const { prisma } = require('../../data/infrastructure/prisma/client');
const { logInfo, logError } = require('../../core/logger');

/**
 * Broadcast Notifications Service
 * Handles system-wide, role-based, class-based, and activity-based notifications
 */
class BroadcastService {
  /**
   * Send notification to multiple recipients based on scope
   * @param {Object} params - Broadcast parameters
   * @param {string} params.tieu_de - Notification title (required)
   * @param {string} params.noi_dung - Notification content (required)
   * @param {number} params.nguoi_gui_id - Sender user ID (required)
   * @param {number} [params.loai_tb_id] - Notification type ID
   * @param {string} [params.muc_do_uu_tien='trung_binh'] - Priority level
   * @param {string} [params.phuong_thuc_gui='trong_he_thong'] - Delivery method
   * @param {string} params.scope - Target scope: 'system', 'role', 'class', 'department', 'activity'
   * @param {string} [params.targetRole] - Role name (required for scope='role')
   * @param {number} [params.targetClass] - Class ID (required for scope='class')
   * @param {string} [params.targetDepartment] - Department/Faculty name (required for scope='department')
   * @param {number} [params.activityId] - Activity ID (required for scope='activity')
   * @returns {Promise<Object>} Result with count and scope label
   */
  async broadcastNotification(params) {
    const {
      tieu_de,
      noi_dung,
      nguoi_gui_id,
      loai_tb_id,
      muc_do_uu_tien = 'trung_binh',
      phuong_thuc_gui = 'trong_he_thong',
      scope,
      targetRole,
      targetClass,
      targetDepartment,
      activityId
    } = params;

    // Validate required fields
    if (!tieu_de || !noi_dung || !nguoi_gui_id) {
      throw new Error('Thiếu thông tin bắt buộc (tieu_de, noi_dung, nguoi_gui_id)');
    }

    // Get or create default notification type
    let loaiThongBao;
    if (loai_tb_id) {
      loaiThongBao = await prisma.loaiThongBao.findUnique({ where: { id: loai_tb_id } });
      if (!loaiThongBao) {
        throw new Error('Không tìm thấy loại thông báo');
      }
    } else {
      loaiThongBao = await prisma.loaiThongBao.findFirst({
        where: { ten_loai_tb: 'Thông báo hệ thống' }
      });
      if (!loaiThongBao) {
        loaiThongBao = await prisma.loaiThongBao.create({
          data: {
            ten_loai_tb: 'Thông báo hệ thống',
            mo_ta: 'Thông báo chung từ quản trị viên'
          }
        });
      }
    }

    // Determine recipients based on scope
    const { recipientIds, scopeLabel } = await this._getRecipientsByScope({
      scope,
      targetRole,
      targetClass,
      targetDepartment,
      activityId
    });

    if (recipientIds.length === 0) {
      return { count: 0, scope: scopeLabel, message: 'Không có người nhận phù hợp' };
    }

    // Add scope metadata to message
    const enhancedMessage = `${noi_dung}\n\n[Phạm vi: ${scopeLabel}]`;

    // Create notifications for all recipients
    const dataRows = recipientIds.map(rid => ({
      tieu_de,
      noi_dung: enhancedMessage,
      loai_tb_id: loaiThongBao.id,
      nguoi_gui_id,
      nguoi_nhan_id: rid,
      muc_do_uu_tien,
      phuong_thuc_gui
    }));

    const result = await prisma.thongBao.createMany({ data: dataRows });

    logInfo('Admin broadcast notification', {
      userId: nguoi_gui_id,
      scope: scopeLabel,
      recipients: result.count,
      title: tieu_de
    });

    return {
      count: result.count,
      scope: scopeLabel,
      message: `Đã gửi thông báo tới ${result.count} người`
    };
  }

  /**
   * Get broadcast statistics
   * @param {number} adminId - Admin user ID requesting stats
   * @returns {Promise<Object>} Statistics object
   */
  async getBroadcastStats(adminId) {
    // Get all notifications sent by admin users
    const allNotifications = await prisma.thongBao.findMany({
      include: {
        nguoi_gui: {
          include: {
            vai_tro: true
          }
        },
        nguoi_nhan: {
          include: {
            vai_tro: true,
            sinh_vien: {
              include: {
                lop: true
              }
            }
          }
        }
      },
      orderBy: {
        ngay_gui: 'desc'
      }
    });

    // Group notifications by title + sender + timestamp to detect broadcasts
    const grouped = {};
    allNotifications.forEach(tb => {
      const key = `${tb.tieu_de}_${tb.nguoi_gui_id}_${tb.ngay_gui.toISOString()}`;
      if (!grouped[key]) {
        grouped[key] = {
          tieu_de: tb.tieu_de,
          noi_dung: tb.noi_dung,
          ngay_gui: tb.ngay_gui,
          nguoi_gui_id: tb.nguoi_gui_id,
          nguoi_gui_role: tb.nguoi_gui.vai_tro.ten_vt,
          recipients: []
        };
      }
      grouped[key].recipients.push({
        vai_tro: tb.nguoi_nhan.vai_tro.ten_vt,
        lop: tb.nguoi_nhan.sinh_vien?.lop?.ten_lop || null
      });
    });

    // Filter broadcasts (sent to multiple recipients at once)
    const broadcasts = Object.values(grouped).filter(g => g.recipients.length > 1);

    // Count by scope
    let systemCount = 0;
    let roleCount = 0;
    let classCount = 0;

    broadcasts.forEach(broadcast => {
      const recipientCount = broadcast.recipients.length;
      const roles = [...new Set(broadcast.recipients.map(r => r.vai_tro))];
      const classes = [...new Set(broadcast.recipients.map(r => r.lop).filter(Boolean))];

      // Detect scope based on patterns
      if (recipientCount > 50 && roles.length >= 2) {
        systemCount++;
      } else if (roles.length === 1 && (classes.length > 1 || classes.length === 0)) {
        roleCount++;
      } else if (classes.length === 1) {
        classCount++;
      }
    });

    // Count broadcasts this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeekCount = broadcasts.filter(b => new Date(b.ngay_gui) >= oneWeekAgo).length;

    const stats = {
      total: broadcasts.length,
      thisWeek: thisWeekCount,
      systemScope: systemCount,
      roleScope: roleCount,
      classScope: classCount
    };

    logInfo('Broadcast stats fetched', { userId: adminId, stats });
    return stats;
  }

  /**
   * Get broadcast notification history
   * @param {number} adminId - Admin user ID requesting history
   * @param {number} [limit=500] - Maximum number of notifications to retrieve
   * @returns {Promise<Object>} History object with broadcasts array
   */
  async getBroadcastHistory(adminId, limit = 500) {
    // Get all notifications sent by admin users
    const allNotifications = await prisma.thongBao.findMany({
      include: {
        nguoi_gui: {
          include: {
            vai_tro: true
          }
        },
        nguoi_nhan: {
          include: {
            vai_tro: true,
            sinh_vien: {
              include: {
                lop: true
              }
            }
          }
        }
      },
      orderBy: {
        ngay_gui: 'desc'
      },
      take: limit
    });

    // Group notifications by title + sender + timestamp to detect broadcasts
    const grouped = {};
    allNotifications.forEach(tb => {
      const key = `${tb.tieu_de}_${tb.nguoi_gui_id}_${tb.ngay_gui.toISOString()}`;
      if (!grouped[key]) {
        grouped[key] = {
          id: tb.id, // Use first notification id as broadcast id
          title: tb.tieu_de,
          message: tb.noi_dung,
          date: tb.ngay_gui,
          nguoi_gui_id: tb.nguoi_gui_id,
          nguoi_gui_role: tb.nguoi_gui.vai_tro.ten_vt,
          nguoi_gui_name: tb.nguoi_gui.ho_ten,
          recipients: []
        };
      }
      grouped[key].recipients.push({
        id: tb.nguoi_nhan.id,
        vai_tro: tb.nguoi_nhan.vai_tro.ten_vt,
        lop: tb.nguoi_nhan.sinh_vien?.lop?.ten_lop || null,
        ho_ten: tb.nguoi_nhan.ho_ten,
        email: tb.nguoi_nhan.email
      });
    });

    // Filter broadcasts (sent to multiple recipients at once)
    const broadcasts = Object.values(grouped)
      .filter(g => g.recipients.length > 1)
      .map(broadcast => {
        const recipientCount = broadcast.recipients.length;
        const roles = [...new Set(broadcast.recipients.map(r => r.vai_tro))];
        const classes = [...new Set(broadcast.recipients.map(r => r.lop).filter(Boolean))];

        // Detect scope based on patterns
        let scope = 'unknown';
        if (recipientCount > 50 && roles.length >= 2) {
          scope = 'system';
        } else if (roles.length === 1 && (classes.length > 1 || classes.length === 0)) {
          scope = 'role';
        } else if (classes.length === 1) {
          scope = 'class';
        } else if (classes.length > 1 && classes.length <= 3) {
          scope = 'department'; // Approximation
        }

        return {
          id: broadcast.id,
          title: broadcast.title,
          message: broadcast.message.split('[Phạm vi:')[0]?.trim() || broadcast.message,
          date: broadcast.date,
          recipients: recipientCount,
          recipientsList: broadcast.recipients.slice(0, 20), // Limit for detail view
          scope: scope,
          roles: roles,
          classes: classes,
          senderName: broadcast.nguoi_gui_name,
          senderRole: broadcast.nguoi_gui_role
        };
      });

    logInfo('Broadcast history fetched', { userId: adminId, count: broadcasts.length });
    return { history: broadcasts };
  }

  /**
   * Internal: Get recipient IDs based on scope
   * @private
   */
  async _getRecipientsByScope({ scope, targetRole, targetClass, targetDepartment, activityId }) {
    let recipientIds = [];
    let scopeLabel = '';

    switch (String(scope || '').toLowerCase()) {
      case 'system':
        // All active users in system
        const allUsers = await prisma.nguoiDung.findMany({
          where: { trang_thai: 'hoat_dong' },
          select: { id: true }
        });
        recipientIds = allUsers.map(u => u.id);
        scopeLabel = 'system';
        break;

      case 'role':
        // All users with specific role
        if (!targetRole) {
          throw new Error('Thiếu thông tin vai trò (targetRole)');
        }
        const vaiTro = await prisma.vaiTro.findFirst({
          where: { ten_vt: targetRole }
        });
        if (!vaiTro) {
          throw new Error('Không tìm thấy vai trò');
        }
        const roleUsers = await prisma.nguoiDung.findMany({
          where: { vai_tro_id: vaiTro.id, trang_thai: 'hoat_dong' },
          select: { id: true }
        });
        recipientIds = roleUsers.map(u => u.id);
        scopeLabel = `role:${targetRole}`;
        break;

      case 'class':
        // All students in specific class
        if (!targetClass) {
          throw new Error('Thiếu thông tin lớp (targetClass)');
        }
        const classStudents = await prisma.sinhVien.findMany({
          where: { lop_id: targetClass },
          select: { nguoi_dung_id: true }
        });
        recipientIds = classStudents.map(s => s.nguoi_dung_id).filter(Boolean);
        scopeLabel = `class:${targetClass}`;
        break;

      case 'department':
        // All students in specific department
        if (!targetDepartment) {
          throw new Error('Thiếu thông tin khoa (targetDepartment)');
        }
        const deptClasses = await prisma.lop.findMany({
          where: { khoa: targetDepartment },
          select: { id: true }
        });
        const classIds = deptClasses.map(c => c.id);
        const deptStudents = await prisma.sinhVien.findMany({
          where: { lop_id: { in: classIds } },
          select: { nguoi_dung_id: true }
        });
        recipientIds = deptStudents.map(s => s.nguoi_dung_id).filter(Boolean);
        scopeLabel = `department:${targetDepartment}`;
        break;

      case 'activity':
        // All registered students for specific activity
        if (!activityId) {
          throw new Error('Thiếu ID hoạt động (activityId)');
        }
        const activityRegs = await prisma.dangKyHoatDong.findMany({
          where: {
            hd_id: activityId,
            trang_thai_dk: { in: ['da_duyet', 'da_tham_gia'] }
          },
          select: { sinh_vien: { select: { nguoi_dung_id: true } } }
        });
        recipientIds = Array.from(
          new Set(activityRegs.map(r => r.sinh_vien?.nguoi_dung_id).filter(Boolean))
        );
        scopeLabel = `activity:${activityId}`;
        break;

      default:
        throw new Error(`Scope không hợp lệ: ${scope}. Chỉ chấp nhận: system, role, class, department, activity`);
    }

    return { recipientIds, scopeLabel };
  }
}

module.exports = new BroadcastService();




