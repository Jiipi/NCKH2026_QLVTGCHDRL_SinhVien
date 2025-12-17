/**
 * Broadcast Service
 * Handles system-wide notifications with scope-based targeting
 */

import { PrismaClient } from '@prisma/client';
import { logInfo, logError } from '../../core/logger';

const prisma = new PrismaClient();

// Types for broadcast service
interface BroadcastParams {
  title: string;
  message: string;
  scope: 'system' | 'role' | 'class' | 'department' | 'activity';
  targetRole?: string;
  targetClass?: string | number;
  targetDepartment?: string;
  activityId?: string | number;
  senderId: number;
}

interface RecipientInfo {
  vai_tro: string;
  lop: string | null;
}

interface RecipientDetail {
  id: number;
  vai_tro: string;
  lop: string | null;
  ho_ten: string;
  email: string | null;
}

interface GroupedNotification {
  id: number;
  title: string;
  message: string;
  date: Date;
  nguoi_gui_id: number;
  nguoi_gui_role: string;
  nguoi_gui_name: string;
  recipients: RecipientInfo[] | RecipientDetail[];
}

interface BroadcastStats {
  total: number;
  thisWeek: number;
  systemScope: number;
  roleScope: number;
  classScope: number;
}

interface BroadcastHistoryItem {
  id: number;
  title: string;
  message: string;
  date: Date;
  recipients: number;
  recipientsList: RecipientDetail[];
  scope: string;
  roles: string[];
  classes: string[];
  senderName: string;
  senderRole: string;
}

interface ScopeResult {
  recipientIds: string[];
  scopeLabel: string;
}

/**
 * Service for broadcasting notifications to users based on scope
 */
class BroadcastService {
  /**
   * Send a broadcast notification to targeted users
   * @param params - Broadcast parameters including scope and targeting
   * @returns Promise with count of notifications sent
   */
  async broadcastNotification(params: BroadcastParams): Promise<{ sentCount: number; recipientIds: string[] }> {
    const { title, message, scope, targetRole, targetClass, targetDepartment, activityId, senderId } = params;

    try {
      // Get recipient IDs based on scope
      const { recipientIds, scopeLabel } = await this._getRecipientsByScope({
        scope,
        targetRole,
        targetClass,
        targetDepartment,
        activityId
      });

      if (recipientIds.length === 0) {
        logInfo('Broadcast: No recipients found', { scope: scopeLabel, senderId });
        return { sentCount: 0, recipientIds: [] };
      }

      // Filter out sender from recipients (don't notify yourself)
      const filteredRecipients = recipientIds.filter((id: string) => id !== String(senderId));

      // Create notification content with scope info
      const fullMessage = `${message}\n\n[Phạm vi: ${scopeLabel}]`;

      // Get or create a broadcast notification type
      let loaiTb = await prisma.loaiThongBao.findFirst({
        where: { ten_loai_tb: 'broadcast' }
      });
      if (!loaiTb) {
        loaiTb = await prisma.loaiThongBao.create({
          data: { ten_loai_tb: 'broadcast', mo_ta: 'System broadcast notification' }
        });
      }

      // Create notifications for all recipients
      const notifications = filteredRecipients.map((recipientId: string) => ({
        nguoi_gui_id: String(senderId),
        nguoi_nhan_id: recipientId,
        loai_tb_id: loaiTb.id,
        tieu_de: title,
        noi_dung: fullMessage,
        da_doc: false,
        ngay_gui: new Date()
      }));

      // Batch insert notifications
      const result = await prisma.thongBao.createMany({
        data: notifications
      });

      logInfo('Broadcast sent successfully', {
        senderId,
        scope: scopeLabel,
        recipientCount: result.count
      });

      return { sentCount: result.count, recipientIds: filteredRecipients };
    } catch (error: any) {
      logError('Broadcast failed', { error: error.message, params });
      throw error;
    }
  }

  /**
   * Get broadcast statistics for admin dashboard
   * @param adminId - Admin user ID requesting stats
   * @returns Promise with broadcast statistics
   */
  async getBroadcastStats(adminId: number): Promise<BroadcastStats> {
    // Get all notifications grouped by unique title + sender + date
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
      take: 1000 // Limit for performance
    });

    // Group notifications by title + sender + timestamp (within 1 minute tolerance)
    const grouped: Record<string, GroupedNotification> = {};
    allNotifications.forEach((tb: any) => {
      const key = `${tb.tieu_de}_${tb.nguoi_gui_id}_${tb.ngay_gui.toISOString()}`;
      if (!grouped[key]) {
        grouped[key] = {
          id: tb.id,
          title: tb.tieu_de,
          message: tb.noi_dung,
          date: tb.ngay_gui,
          nguoi_gui_id: tb.nguoi_gui_id,
          nguoi_gui_role: tb.nguoi_gui.vai_tro.ten_vt,
          nguoi_gui_name: tb.nguoi_gui.ho_ten,
          recipients: []
        };
      }
      (grouped[key].recipients as RecipientInfo[]).push({
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

    broadcasts.forEach((broadcast: GroupedNotification) => {
      const recipientCount = broadcast.recipients.length;
      const roles = [...new Set((broadcast.recipients as RecipientInfo[]).map(r => r.vai_tro))];
      const classes = [...new Set((broadcast.recipients as RecipientInfo[]).map(r => r.lop).filter(Boolean))] as string[];

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
    const thisWeekCount = broadcasts.filter(b => new Date(b.date) >= oneWeekAgo).length;

    const stats: BroadcastStats = {
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
   * @param adminId - Admin user ID requesting history
   * @param limit - Maximum number of notifications to retrieve
   * @returns Promise with history object containing broadcasts array
   */
  async getBroadcastHistory(adminId: number, limit: number = 500): Promise<{ history: BroadcastHistoryItem[] }> {
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
    const grouped: Record<string, GroupedNotification> = {};
    allNotifications.forEach((tb: any) => {
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
      (grouped[key].recipients as RecipientDetail[]).push({
        id: tb.nguoi_nhan.id,
        vai_tro: tb.nguoi_nhan.vai_tro.ten_vt,
        lop: tb.nguoi_nhan.sinh_vien?.lop?.ten_lop || null,
        ho_ten: tb.nguoi_nhan.ho_ten,
        email: tb.nguoi_nhan.email
      });
    });

    // Filter broadcasts (sent to multiple recipients at once)
    const broadcasts: BroadcastHistoryItem[] = Object.values(grouped)
      .filter(g => g.recipients.length > 1)
      .map((broadcast: GroupedNotification) => {
        const recipientCount = broadcast.recipients.length;
        const recipients = broadcast.recipients as RecipientDetail[];
        const roles = [...new Set(recipients.map(r => r.vai_tro))];
        const classes = [...new Set(recipients.map(r => r.lop).filter(Boolean))] as string[];

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
          recipientsList: recipients.slice(0, 20), // Limit for detail view
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
  private async _getRecipientsByScope(params: {
    scope: string;
    targetRole?: string;
    targetClass?: string | number;
    targetDepartment?: string;
    activityId?: string | number;
  }): Promise<ScopeResult> {
    const { scope, targetRole, targetClass, targetDepartment, activityId } = params;
    let recipientIds: string[] = [];
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
          where: { lop_id: targetClass as string },
          select: { nguoi_dung_id: true }
        });
        recipientIds = classStudents.map(s => s.nguoi_dung_id).filter((id): id is string => id !== null);
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
        recipientIds = deptStudents.map(s => s.nguoi_dung_id).filter((id): id is string => id !== null);
        scopeLabel = `department:${targetDepartment}`;
        break;

      case 'activity':
        // All registered students for specific activity
        if (!activityId) {
          throw new Error('Thiếu ID hoạt động (activityId)');
        }
        const activityRegs = await prisma.dangKyHoatDong.findMany({
          where: {
            hd_id: String(activityId),
            trang_thai_dk: { in: ['da_duyet', 'da_tham_gia'] }
          },
          select: { sinh_vien: { select: { nguoi_dung_id: true } } }
        });
        recipientIds = Array.from(
          new Set(activityRegs.map(r => r.sinh_vien?.nguoi_dung_id).filter((id): id is string => id !== null && id !== undefined))
        );
        scopeLabel = `activity:${activityId}`;
        break;

      default:
        throw new Error(`Scope không hợp lệ: ${scope}. Chỉ chấp nhận: system, role, class, department, activity`);
    }

    return { recipientIds, scopeLabel };
  }
}

export default new BroadcastService();
