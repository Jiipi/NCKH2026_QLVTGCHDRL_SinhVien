/**
 * Broadcast Service
 * Handles system-wide notifications with scope-based targeting
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { logInfo, logError } from '../../core/logger';

const prisma = new PrismaClient();

/** Prisma result type for notification queries with full relations */
type NotificationWithRelations = Prisma.ThongBaoGetPayload<{
  include: {
    nguoi_gui: { include: { vai_tro: true } };
    nguoi_nhan: { include: { vai_tro: true; sinh_vien: { include: { lop: true } } } };
  };
}>;

// Types for broadcast service
interface BroadcastParams {
  title: string;
  message: string;
  scope: 'system' | 'role' | 'class' | 'department' | 'activity';
  targetRole?: string;
  targetClass?: string | number;
  targetDepartment?: string;
  activityId?: string | number;
  senderId: string; // UUID string
}

interface RecipientInfo {
  vai_tro: string;
  lop: string | null;
}

interface RecipientDetail {
  id: string;
  vai_tro: string;
  lop: string | null;
  ho_ten: string;
  email: string | null;
}

interface GroupedNotification {
  id: string;
  title: string;
  message: string;
  date: Date;
  nguoi_gui_id: string;
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
  id: string;
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
  async broadcastNotification(params: BroadcastParams): Promise<{
    sentCount: number;
    recipientIds: string[];
    scopeLabel?: string;
    totalRecipients?: number;
    filteredOutSelf?: boolean;
    selectedRecipients?: number;
    skippedSelf?: number;
    createdNotifications?: number;
  }> {
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
        return {
          sentCount: 0,
          recipientIds: [],
          scopeLabel,
          totalRecipients: 0,
          selectedRecipients: 0,
          skippedSelf: 0,
          createdNotifications: 0
        };
      }

      // Filter out sender from recipients (don't notify yourself)
      const filteredRecipients = recipientIds.filter((id: string) => id !== String(senderId));
      const filteredOutSelf = filteredRecipients.length !== recipientIds.length;
      const skippedSelf = recipientIds.length - filteredRecipients.length;

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
        // Lưu metadata broadcast (để thống kê/lịch sử chính xác)
        pham_vi_gui: String(scope || '').toLowerCase(),
        vai_tro_nhan: targetRole || null,
        lop_nhan_id: targetClass ? String(targetClass) : null,
        khoa_nhan: targetDepartment || null,
        hoat_dong_nhan_id: activityId ? String(activityId) : null,
        so_nguoi_duoc_chon: recipientIds.length,
        so_nguoi_da_gui: filteredRecipients.length,
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

      return {
        sentCount: result.count,
        recipientIds: filteredRecipients,
        scopeLabel,
        totalRecipients: recipientIds.length,
        filteredOutSelf,
        selectedRecipients: recipientIds.length,
        skippedSelf,
        createdNotifications: result.count
      };
    } catch (error: unknown) {
      logError('Broadcast failed', { error: (error as Error).message, params });
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
    allNotifications.forEach((tb: NotificationWithRelations) => {
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

    // Prefer persisted metadata if present on the first row in each group
    let systemCount = 0;
    let roleCount = 0;
    let classCount = 0;

    // Build a quick lookup for metadata from raw rows (keyed the same way)
    const metaByKey: Record<string, NotificationWithRelations> = {};
    allNotifications.forEach((tb: NotificationWithRelations) => {
      const key = `${tb.tieu_de}_${tb.nguoi_gui_id}_${tb.ngay_gui.toISOString()}`;
      if (!metaByKey[key]) metaByKey[key] = tb;
    });

    broadcasts.forEach((broadcast: GroupedNotification) => {
      const key = `${broadcast.title}_${broadcast.nguoi_gui_id}_${broadcast.date.toISOString()}`;
      const meta = metaByKey[key];
      const metaScope = String(meta?.pham_vi_gui || '').toLowerCase();

      if (metaScope === 'system') systemCount++;
      else if (metaScope === 'role') roleCount++;
      else if (metaScope === 'class') classCount++;
      else {
        // Legacy fallback: infer scope based on patterns
        const recipientCount = broadcast.recipients.length;
        const roles = [...new Set((broadcast.recipients as RecipientInfo[]).map(r => r.vai_tro))];
        const classes = [...new Set((broadcast.recipients as RecipientInfo[]).map(r => r.lop).filter(Boolean))] as string[];
        if (recipientCount > 50 && roles.length >= 2) systemCount++;
        else if (roles.length === 1 && (classes.length > 1 || classes.length === 0)) roleCount++;
        else if (classes.length === 1) classCount++;
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
    allNotifications.forEach((tb: NotificationWithRelations) => {
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
    // Metadata lookup per group
    const metaByKey: Record<string, NotificationWithRelations> = {};
    allNotifications.forEach((tb: NotificationWithRelations) => {
      const key = `${tb.tieu_de}_${tb.nguoi_gui_id}_${tb.ngay_gui.toISOString()}`;
      if (!metaByKey[key]) metaByKey[key] = tb;
    });

    const broadcasts: BroadcastHistoryItem[] = Object.entries(grouped)
      .filter(([, g]) => g.recipients.length > 1)
      .map(([key, broadcast]: [string, GroupedNotification]) => {
        const recipientCount = broadcast.recipients.length;
        const recipients = broadcast.recipients as RecipientDetail[];
        const roles = [...new Set(recipients.map(r => r.vai_tro))];
        const classes = [...new Set(recipients.map(r => r.lop).filter(Boolean))] as string[];

        const meta = metaByKey[key];
        const metaScope = String(meta?.pham_vi_gui || '').toLowerCase();
        const metaTargetRole = meta?.vai_tro_nhan;
        const metaTargetClass = meta?.lop_nhan_id;
        const metaTargetDept = meta?.khoa_nhan;
        const metaActivityId = meta?.hoat_dong_nhan_id;

        // Detect scope based on patterns
        let scope = metaScope || 'unknown';
        if (!metaScope) {
          if (recipientCount > 50 && roles.length >= 2) scope = 'system';
          else if (roles.length === 1 && (classes.length > 1 || classes.length === 0)) scope = 'role';
          else if (classes.length === 1) scope = 'class';
          else if (classes.length > 1 && classes.length <= 3) scope = 'department';
        }

        // Prefer metadata-based scopes in the output when available
        if (metaScope === 'role' && metaTargetRole) scope = `role:${metaTargetRole}`;
        if (metaScope === 'class' && metaTargetClass) scope = `class:${metaTargetClass}`;
        if (metaScope === 'department' && metaTargetDept) scope = `department:${metaTargetDept}`;
        if (metaScope === 'activity' && metaActivityId) scope = `activity:${metaActivityId}`;

        return {
          id: broadcast.id,
          title: broadcast.title,
          message: broadcast.message.split('[Phạm vi:')[0]?.trim() || broadcast.message,
          date: broadcast.date,
          // Ưu tiên số người đã gửi lưu trong DB (nếu có)
          recipients: Number(meta?.so_nguoi_da_gui ?? recipientCount),
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
        // All users in system (include inactive/locked accounts; they can still receive in-app notifications)
        const allUsers = await prisma.nguoiDung.findMany({
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
          // Include inactive/locked accounts too; they can still receive in-app notifications
          where: { vai_tro_id: vaiTro.id },
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
