/**
 * Audit Logger
 * Centralized audit logging for write operations across all modules.
 * Every create/update/delete/approve/reject action should be audited.
 *
 * Usage:
 *   import { logAudit } from '../../core/logger/audit';
 *   logAudit('create_activity', req, { entityId: id, module: 'activities' });
 */

import { logInfo } from './index';

/**
 * Standard audit event metadata
 */
export interface AuditMeta {
  /** The domain module originating the event (e.g. 'activities', 'auth') */
  module: string;
  /** Optional entity ID affected by the action */
  entityId?: string | null;
  /** Optional entity type (e.g. 'HoatDong', 'DangKy') */
  entityType?: string;
  /** Any extra context for the audit trail */
  [key: string]: unknown;
}

/**
 * Internal shape of the authenticated request (loose coupling — works with
 * any controller-local AuthenticatedRequest or AuthRequest).
 */
interface AuditableRequest {
  requestId?: string;
  user?: unknown;
  ip?: string;
}

/**
 * Log an auditable write operation.
 *
 * @param action  - Verb describing the action (e.g. 'create_activity', 'login')
 * @param req     - Express request (used to extract requestId and actorId)
 * @param meta    - Additional structured metadata
 */
export function logAudit(
  action: string,
  req: AuditableRequest,
  meta: AuditMeta,
): void {
  const user = req.user as Record<string, unknown> | undefined;
  const actorId = (user?.sub || user?.id || null) as string | null;
  logInfo('audit', {
    action,
    requestId: req.requestId ?? null,
    actorId,
    ip: req.ip ?? null,
    ...meta,
  });
}

// CommonJS compatibility
module.exports = { logAudit };
