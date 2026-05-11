import crypto from 'crypto';
import { prisma } from '../../data/infrastructure/prisma/client';
import { ForbiddenError, NotFoundError, ValidationError } from '../../core/errors/AppError';
import { AttendanceAuditContext, writeAttendanceAudit } from '../../core/logger/attendance-audit';

const DEFAULT_SESSION_TTL_MINUTES = 180;
const DEFAULT_TOKEN_TTL_SECONDS = 45;
const MIN_TOKEN_TTL_SECONDS = 15;
const MAX_TOKEN_TTL_SECONDS = 90;
const SESSION_STATUS_OPEN = 'dang_mo';
const SESSION_STATUS_CLOSED = 'da_dong';
const ATTENDANCE_TIME_LEEWAY_MS = 12 * 60 * 60 * 1000;

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function clampTokenTtl(ttlSeconds?: number): number {
  if (!ttlSeconds || Number.isNaN(ttlSeconds)) return DEFAULT_TOKEN_TTL_SECONDS;
  return Math.min(MAX_TOKEN_TTL_SECONDS, Math.max(MIN_TOKEN_TTL_SECONDS, Math.floor(ttlSeconds)));
}

function validateActivityWindow(activity: { ngay_bd: Date; ngay_kt: Date }) {
  const now = new Date();
  if (now.getTime() + ATTENDANCE_TIME_LEEWAY_MS < activity.ngay_bd.getTime()) {
    throw new ValidationError(`Hoạt động chưa bắt đầu. Thời gian bắt đầu: ${activity.ngay_bd.toLocaleString('vi-VN')}`);
  }
  if (now.getTime() - ATTENDANCE_TIME_LEEWAY_MS > activity.ngay_kt.getTime()) {
    throw new ValidationError(`Hoạt động đã kết thúc lúc ${activity.ngay_kt.toLocaleString('vi-VN')}`);
  }
}

class QrAttendanceTokenService {
  async createSession(activityId: string, actorId: string, ttlMinutes = DEFAULT_SESSION_TTL_MINUTES, auditContext?: AttendanceAuditContext) {
    const activity = await prisma.hoatDong.findUnique({
      where: { id: activityId },
      select: { id: true, ten_hd: true, ngay_bd: true, ngay_kt: true }
    });

    if (!activity) {
      throw new NotFoundError('Hoạt động không tồn tại');
    }

    validateActivityWindow(activity);

    const now = new Date();
    const sessionTtl = Math.max(15, Math.floor(ttlMinutes));
    const expiresAt = new Date(now.getTime() + sessionTtl * 60 * 1000);

    const session = await prisma.$transaction(async (tx) => {
      await tx.phienDiemDanhQr.updateMany({
        where: { hd_id: activityId, trang_thai: SESSION_STATUS_OPEN },
        data: { trang_thai: SESSION_STATUS_CLOSED }
      });

      return tx.phienDiemDanhQr.create({
        data: {
          hd_id: activityId,
          nguoi_tao_id: actorId,
          het_han_luc: expiresAt
        }
      });
    });

    await writeAttendanceAudit({
      action: 'OPEN_QR_SESSION',
      result: 'success',
      actorId,
      activityId,
      sessionId: session.id,
      ip: auditContext?.ip,
      userAgent: auditContext?.userAgent,
      metadata: { expiresAt: session.het_han_luc.toISOString() }
    });

    return {
      id: session.id,
      activityId: session.hd_id,
      status: session.trang_thai,
      expiresAt: session.het_han_luc,
      createdAt: session.ngay_tao
    };
  }

  async getCurrentSession(activityId: string) {
    const now = new Date();
    const session = await prisma.phienDiemDanhQr.findFirst({
      where: {
        hd_id: activityId,
        trang_thai: SESSION_STATUS_OPEN,
        het_han_luc: { gt: now }
      },
      orderBy: { ngay_tao: 'desc' }
    });

    if (!session) return null;

    return {
      id: session.id,
      activityId: session.hd_id,
      status: session.trang_thai,
      expiresAt: session.het_han_luc,
      createdAt: session.ngay_tao
    };
  }

  async generateToken(activityId: string, sessionId: string, ttlSeconds?: number, auditContext?: AttendanceAuditContext) {
    const session = await prisma.phienDiemDanhQr.findFirst({
      where: { id: sessionId, hd_id: activityId },
      include: { hoat_dong: { select: { id: true, ten_hd: true, ngay_bd: true, ngay_kt: true } } }
    });

    if (!session) {
      throw new NotFoundError('Phiên QR không tồn tại');
    }

    const now = new Date();
    if (session.trang_thai !== SESSION_STATUS_OPEN || session.het_han_luc <= now) {
      throw new ValidationError('Phiên QR đã đóng hoặc hết hạn');
    }

    validateActivityWindow(session.hoat_dong);

    const ttl = clampTokenTtl(ttlSeconds);
    const expiresAt = new Date(Math.min(now.getTime() + ttl * 1000, session.het_han_luc.getTime()));
    const token = crypto.randomBytes(24).toString('base64url');

    const qrToken = await prisma.maDiemDanhQr.create({
      data: {
        phien_id: sessionId,
        token_hash: hashToken(token),
        het_han_luc: expiresAt
      }
    });

    await writeAttendanceAudit({
      action: 'CREATE_QR_TOKEN',
      result: 'success',
      actorId: auditContext?.actorId || session.nguoi_tao_id,
      activityId,
      sessionId,
      qrTokenId: qrToken.id,
      ip: auditContext?.ip,
      userAgent: auditContext?.userAgent,
      metadata: { expiresAt: expiresAt.toISOString(), issuedAt: now.toISOString() }
    });

    return {
      activityId,
      activityName: session.hoat_dong.ten_hd,
      sessionId,
      token,
      expiresAt,
      issuedAt: now,
      qrJson: JSON.stringify({
        activityId,
        sessionId,
        token,
        expiresAt: expiresAt.toISOString(),
        iat: now.toISOString()
      })
    };
  }

  async verifyToken(activityId: string, sessionId: string | undefined, token: string | undefined) {
    if (!sessionId || !token) {
      throw new ValidationError('Thiếu mã QR');
    }

    const now = new Date();
    const qrToken = await prisma.maDiemDanhQr.findUnique({
      where: { token_hash: hashToken(token) },
      include: {
        phien: {
          include: {
            hoat_dong: { select: { id: true, ngay_bd: true, ngay_kt: true } }
          }
        }
      }
    });

    if (!qrToken || qrToken.phien_id !== sessionId || qrToken.phien.hd_id !== activityId) {
      throw new ValidationError('Mã QR không hợp lệ');
    }

    if (qrToken.het_han_luc <= now) {
      throw new ValidationError('Mã QR đã hết hạn, vui lòng quét mã mới');
    }

    if (qrToken.phien.trang_thai !== SESSION_STATUS_OPEN || qrToken.phien.het_han_luc <= now) {
      throw new ValidationError('Phiên QR đã đóng hoặc hết hạn');
    }

    validateActivityWindow(qrToken.phien.hoat_dong);

    return {
      sessionId: qrToken.phien_id,
      tokenId: qrToken.id,
      expiresAt: qrToken.het_han_luc
    };
  }

  async closeSession(activityId: string, sessionId: string, actorId: string) {
    const session = await prisma.phienDiemDanhQr.findFirst({
      where: { id: sessionId, hd_id: activityId }
    });

    if (!session) {
      throw new NotFoundError('Phiên QR không tồn tại');
    }

    if (session.nguoi_tao_id !== actorId) {
      const actor = await prisma.nguoiDung.findUnique({
        where: { id: actorId },
        include: { vai_tro: true }
      });
      const role = actor?.vai_tro?.ten_vt?.toUpperCase();
      if (role !== 'ADMIN' && role !== 'GIANG_VIEN') {
        throw new ForbiddenError('Bạn không có quyền đóng phiên QR này');
      }
    }

    const updated = await prisma.phienDiemDanhQr.update({
      where: { id: sessionId },
      data: { trang_thai: SESSION_STATUS_CLOSED }
    });

    return {
      id: updated.id,
      activityId: updated.hd_id,
      status: updated.trang_thai,
      expiresAt: updated.het_han_luc,
      createdAt: updated.ngay_tao
    };
  }
}

export const qrAttendanceTokenService = new QrAttendanceTokenService();
export default qrAttendanceTokenService;
