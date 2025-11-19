/**
 * Session Tracking Service
 * Manages user session tracking and activity monitoring
 */

const { prisma } = require('../infrastructure/prisma/client');
const { logInfo, logError } = require('../core/logger');

class SessionTrackingService {
  /**
   * Create or update user session
   * @param {string} userId - User ID
   * @param {string} tabId - Tab identifier
   * @param {string} role - User role
   * @returns {Promise<Object>} Session record
   */
  static async trackSession(userId, tabId, role = null) {
    try {
      if (!userId || !tabId) {
        return null;
      }

      // Check if session exists
      const existingSession = await prisma.phienDangNhap.findUnique({
        where: { ma_tab: tabId }
      });

      if (existingSession) {
        // Update existing session (lan_hoat_dong auto-updates via @updatedAt)
        const updated = await prisma.phienDangNhap.update({
          where: { ma_tab: tabId },
          data: {
            vai_tro: role || existingSession.vai_tro
          }
        });
        
        logInfo('Session updated', { userId, tabId });
        return updated;
      }

      // Create new session
      const newSession = await prisma.phienDangNhap.create({
        data: {
          nguoi_dung_id: userId,
          ma_tab: tabId,
          vai_tro: role
        }
      });

      logInfo('Session created', { userId, tabId });
      return newSession;
    } catch (error) {
      logError('Failed to track session', error, { userId, tabId });
      return null;
    }
  }

  /**
   * Update session activity timestamp
   * @param {string} tabId - Tab identifier
   * @returns {Promise<boolean>} Success status
   */
  static async updateSessionActivity(tabId) {
    try {
      if (!tabId) return false;

      await prisma.phienDangNhap.update({
        where: { ma_tab: tabId },
        data: {
          // Just update the record to trigger @updatedAt on lan_hoat_dong
        }
      });

      return true;
    } catch (error) {
      logError('Failed to update session activity', error, { tabId });
      return false;
    }
  }

  /**
   * Get active sessions for a user
   * @param {string} userId - User ID
   * @param {number} minutesThreshold - Minutes to consider active (default: 5)
   * @returns {Promise<Array>} Active sessions
   */
  static async getActiveSessions(userId, minutesThreshold = 5) {
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
      logError('Failed to get active sessions', error, { userId });
      return [];
    }
  }

  /**
   * Get all active users
   * @param {number} minutesThreshold - Minutes to consider active (default: 5)
   * @returns {Promise<Object>} Active user IDs and codes
   */
  static async getActiveUsers(minutesThreshold = 5) {
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

      const activeUserIds = new Set();
      const activeUserCodes = new Set();

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
      logError('Failed to get active users', error);
      return { userIds: [], userCodes: [], sessionCount: 0 };
    }
  }

  /**
   * Clean up old sessions
   * @param {number} hoursThreshold - Hours to consider expired (default: 24)
   * @returns {Promise<number>} Number of deleted sessions
   */
  static async cleanupOldSessions(hoursThreshold = 24) {
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
      logError('Failed to cleanup old sessions', error);
      return 0;
    }
  }

  /**
   * Remove session by tabId
   * @param {string} tabId - Tab identifier
   * @returns {Promise<boolean>} Success status
   */
  static async removeSession(tabId) {
    try {
      if (!tabId) return false;

      await prisma.phienDangNhap.delete({
        where: { ma_tab: tabId }
      });

      logInfo('Session removed', { tabId });
      return true;
    } catch (error) {
      // If not found, consider it successful
      if (error.code === 'P2025') {
        return true;
      }
      logError('Failed to remove session', error, { tabId });
      return false;
    }
  }

  /**
   * Get user activity status
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Activity status
   */
  static async getUserActivityStatus(userId) {
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
      logError('Failed to get user activity status', error, { userId });
      return null;
    }
  }

  /**
   * Update registration dates when status changes
   * @param {string} registrationId - Registration ID
   * @param {string} newStatus - New status
   * @returns {Promise<Object>} Updated registration
   */
  static async updateRegistrationDates(registrationId, newStatus) {
    try {
      const updates = {};

      // Update approval date when approved
      if (newStatus === 'da_duyet') {
        updates.ngay_duyet = new Date();
      }

      // If no updates needed, return existing record
      if (Object.keys(updates).length === 0) {
        return await prisma.dangKyHoatDong.findUnique({
          where: { id: registrationId }
        });
      }

      // Update with new dates
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
      logError('Failed to update registration dates', error, {
        registrationId,
        newStatus
      });
      throw error;
    }
  }
}

module.exports = SessionTrackingService;
