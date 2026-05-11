import type { Prisma } from '@prisma/client';
import { prisma } from '../../data/infrastructure/prisma/client';
import { logError } from './index';

export type AttendanceAuditAction = 'OPEN_QR_SESSION' | 'CREATE_QR_TOKEN' | 'SCAN_SUCCESS' | 'SCAN_FAILED' | 'FALLBACK_REQUESTED' | 'FALLBACK_APPROVED' | 'FALLBACK_REJECTED' | 'FALLBACK_CANCELLED';
export type AttendanceAuditResult = 'success' | 'failed';

export interface AttendanceAuditContext {
  actorId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}

export interface AttendanceAuditEvent extends AttendanceAuditContext {
  action: AttendanceAuditAction;
  result: AttendanceAuditResult;
  studentId?: string | null;
  activityId?: string | null;
  sessionId?: string | null;
  qrTokenId?: string | null;
  attendanceId?: string | null;
  reason?: string | null;
  metadata?: Prisma.InputJsonValue | null;
}

function normalizeIp(ip?: string | null): string | null {
  if (!ip) return null;
  const first = ip.split(',')[0]?.trim();
  if (!first) return null;
  return first.replace(/^::ffff:/, '');
}

export async function writeAttendanceAudit(event: AttendanceAuditEvent): Promise<void> {
  try {
    await prisma.nhatKyDiemDanh.create({
      data: {
        hanh_dong: event.action,
        ket_qua: event.result,
        nguoi_thuc_hien_id: event.actorId || null,
        sinh_vien_id: event.studentId || null,
        hoat_dong_id: event.activityId || null,
        phien_qr_id: event.sessionId || null,
        ma_qr_id: event.qrTokenId || null,
        diem_danh_id: event.attendanceId || null,
        ly_do: event.reason || null,
        dia_chi_ip: normalizeIp(event.ip),
        user_agent: event.userAgent || null,
        metadata: event.metadata || undefined
      }
    });
  } catch (error) {
    logError('Attendance audit write failed', error as Error);
  }
}
