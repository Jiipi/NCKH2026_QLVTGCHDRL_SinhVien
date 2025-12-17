/**
 * Session Tracking Service
 * Manages user session tracking and activity monitoring
 * @module business/services/session-tracking
 */

import { prisma } from '../../data/infrastructure/prisma/client';
import { logInfo, logError } from '../../core/logger';
import { PhienDangNhap, DangKyHoatDong, Prisma } from '@prisma/client';

// Types
interface ActiveUsersResult {
  userIds: string[];
  userCodes: string[];
  sessionCount: number;
}

interface UserActivityStatus {
  userId: string;
  username: string;
  accountStatus: string;
  lastLogin: Date | null;
  lastActivity: Date | null;
  isActive: boolean;
  sessionCount: number;
}

interface PrismaError extends Error {
  code?: string;
}

class SessionTrackingService {
  /**
   * Create or update user session
   */
  static async trackSession(
    userId: string,
    tabId: string,
    role: string | null = null
  ): Promise<PhienDangNhap | null> {
    try {
      if (!userId || !tabId) {
        return null;
      }

      const session = await prisma.phienDangNhap.upsert({
        where: { ma_tab: tabId },
        update: {
          nguoi_dung_id: userId,
          vai_tro: role || undefined
        },
        create: {
          nguoi_dung_id: userId,
          ma_tab: tabId,
          vai_tro: role
        }
      });

      logInfo('Session tracked', { userId, tabId });
      return session;
    } catch (error) {
      const err = error as PrismaError;
      if (err.code === 'P2002') {
        const existingSession = await prisma.phienDangNhap.findUnique({
          where: { ma_tab: tabId }
        });
        if (existingSession) {
          logInfo('Session already exists, returning existing', { userId, tabId });
          return existingSession;
        }
      }
      logError('Failed to track session', error as Error, { userId, tabId });
      return null;
    }
  }

  /**
   * Update session activity timestamp
   */
  static async updateSessionActivity(tabId: string): Promise<boolean> {
    try {
      if (!tabId) return false;

      const existingSession = await prisma.phienDangNhap.findUnique({
        where: { ma_tab: tabId }
      });

      if (!existingSession) {
        logInfo('Session not found for heartbeat', { tabId });
        return false;
      }

      await prisma.phienDangNhap.update({
        where: { ma_tab: tabId },
        data: {}
      });

      return true;
    } catch (error) {
      const err = error as PrismaError;
      if (err.code === 'P2025') {
        logInfo('Session not found for heartbeat (from error)', { tabId });
        return false;
      }
      logError('Failed to update session activity', error as Error, { tabId });
      return false;
    }
  }

  /**
   * Get active sessions for a user
   */
  static async getActiveSessions(
    userId: string,
    minutesThreshold: number = 5
  ): Promise<PhienDangNhap[]> {
    try {
      const thresholdTime = new Date(Date.now() - minutesThreshold * 60 * 1000);

      const sessions = await prisma.phienDangNhap.findMany({
        where: {
          nguoi_dung_id: userId,
          lan_hoat_dong: {
            gte: thresholdTime
          }
        },
        orderBy: {
          lan_hoat_dong: 'desc'
        }
      });

      return sessions;
    } catch (error) {
      logError('Failed to get active sessions', error as Error, { userId });
      return [];
    }
  }

  /**
   * Get all active users
   */
  static async getActiveUsers(minutesThreshold: number = 5): Promise<ActiveUsersResult> {
    try {
      const thresholdTime = new Date(Date.now() - minutesThreshold * 60 * 1000);

      const activeSessions = await prisma.phienDangNhap.findMany({
        where: {
          lan_hoat_dong: {
            gte: thresholdTime
          }
        },
        include: {
          nguoi_dung: {
            select: {
              id: true,
              ten_dn: true,
              sinh_vien: {
                select: {
                  mssv: true
                }
              }
            }
          }
        }
      });

      const activeUserIds = new Set<string>();
      const activeUserCodes = new Set<string>();

      activeSessions.forEach(session => {
        if (session.nguoi_dung) {
          activeUserIds.add(session.nguoi_dung.id);
          if (session.nguoi_dung.ten_dn) {
            activeUserCodes.add(session.nguoi_dung.ten_dn);
          }
          if (session.nguoi_dung.sinh_vien?.mssv) {
            activeUserCodes.add(session.nguoi_dung.sinh_vien.mssv);
          }
        }
      });

      return {
        userIds: Array.from(activeUserIds),
        userCodes: Array.from(activeUserCodes),
        sessionCount: activeSessions.length
      };
    } catch (error) {
      logError('Failed to get active users', error as Error);
      return { userIds: [], userCodes: [], sessionCount: 0 };
    }
  }

  /**
   * Clean up old sessions
   */
  static async cleanupOldSessions(hoursThreshold: number = 24): Promise<number> {
    try {
      const thresholdTime = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);

      const result = await prisma.phienDangNhap.deleteMany({
        where: {
          lan_hoat_dong: {
            lt: thresholdTime
          }
        }
      });

      logInfo('Cleaned up old sessions', { deletedCount: result.count });
      return result.count;
    } catch (error) {
      logError('Failed to cleanup old sessions', error as Error);
      return 0;
    }
  }

  /**
   * Remove session by tabId
   */
  static async removeSession(tabId: string): Promise<boolean> {
    try {
      if (!tabId) return false;

      await prisma.phienDangNhap.deleteMany({
        where: { ma_tab: tabId }
      });

      logInfo('Session removed', { tabId });
      return true;
    } catch (error) {
      const err = error as PrismaError;
      if (err.code === 'P2025') {
        return true;
      }
      logError('Failed to remove session', error as Error, { tabId });
      return false;
    }
  }

  /**
   * Get user activity status
   */
  static async getUserActivityStatus(userId: string): Promise<UserActivityStatus | null> {
    try {
      const user = await prisma.nguoiDung.findUnique({
        where: { id: userId },
        select: {
          id: true,
          ten_dn: true,
          trang_thai: true,
          lan_cuoi_dn: true,
          phien_dang_nhap: {
            orderBy: {
              lan_hoat_dong: 'desc'
            },
            take: 1
          }
        }
      });

      if (!user) {
        return null;
      }

      const hasActiveSession = user.phien_dang_nhap.length > 0 &&
        (Date.now() - new Date(user.phien_dang_nhap[0].lan_hoat_dong).getTime()) < 5 * 60 * 1000;

      return {
        userId: user.id,
        username: user.ten_dn,
        accountStatus: user.trang_thai,
        lastLogin: user.lan_cuoi_dn,
        lastActivity: user.phien_dang_nhap[0]?.lan_hoat_dong || null,
        isActive: hasActiveSession && user.trang_thai === 'hoat_dong',
        sessionCount: user.phien_dang_nhap.length
      };
    } catch (error) {
      logError('Failed to get user activity status', error as Error, { userId });
      return null;
    }
  }

  /**
   * Update registration dates when status changes
   */
  static async updateRegistrationDates(
    registrationId: string,
    newStatus: string
  ): Promise<DangKyHoatDong> {
    try {
      const updates: Prisma.DangKyHoatDongUpdateInput = {};

      if (newStatus === 'da_duyet') {
        updates.ngay_duyet = new Date();
      }

      if (Object.keys(updates).length === 0) {
        const existing = await prisma.dangKyHoatDong.findUnique({
          where: { id: registrationId }
        });
        if (!existing) throw new Error('Registration not found');
        return existing;
      }

      const updated = await prisma.dangKyHoatDong.update({
        where: { id: registrationId },
        data: updates,
        include: {
          hoat_dong: {
            select: {
              id: true,
              ten_hd: true,
              ngay_bd: true
            }
          },
          sinh_vien: {
            select: {
              id: true,
              mssv: true
            }
          }
        }
      });

      logInfo('Registration dates updated', {
        registrationId,
        newStatus,
        updates
      });

      return updated;
    } catch (error) {
      logError('Failed to update registration dates', error as Error, {
        registrationId,
        newStatus
      });
      throw error;
    }
  }
}

export default SessionTrackingService;
