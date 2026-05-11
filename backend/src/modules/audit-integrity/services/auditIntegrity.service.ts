import { createHash } from 'crypto';
import type { PrismaClient } from '@prisma/client';
import { prisma } from '../../../data/infrastructure/prisma/client';

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

type PrismaLikeClient = PrismaClient | TransactionClient;

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface AuditIntegrityActor {
  actorId?: string | null;
  requestId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface AppendAuditIntegrityEventInput extends AuditIntegrityActor {
  chainScope?: string;
  entityType: string;
  entityId?: string | null;
  action: string;
  payload: unknown;
}

export interface VerifyAuditIntegrityResult {
  valid: boolean;
  checkedCount: number;
  firstBrokenEventId: string | null;
  brokenReason: string | null;
  lastHash: string | null;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function normalizeValue(value: unknown): JsonValue {
  if (value === undefined) return null;
  if (value === null) return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    return value.map(item => normalizeValue(item));
  }
  if (typeof value === 'bigint') {
    return value.toString();
  }
  if (isPlainObject(value)) {
    return Object.keys(value).sort().reduce<Record<string, JsonValue>>((acc, key) => {
      const normalized = normalizeValue(value[key]);
      if (normalized !== null || value[key] !== undefined) {
        acc[key] = normalized;
      }
      return acc;
    }, {});
  }
  if (typeof value === 'object' && value && 'toString' in value) {
    return String(value);
  }
  return null;
}

function canonicalize(value: unknown): string {
  return JSON.stringify(normalizeValue(value));
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function buildRecordHash(input: {
  chainScope: string;
  sequence: number;
  entityType: string;
  entityId: string | null;
  action: string;
  payloadHash: string;
  previousHash: string | null;
  createdAt: Date;
}): string {
  return sha256(canonicalize(input));
}

class AuditIntegrityService {
  async appendEvent(client: PrismaLikeClient, input: AppendAuditIntegrityEventInput) {
    const chainScope = input.chainScope || input.entityType;
    const lastEvent = await client.nhatKyToanVenDuLieu.findFirst({
      where: { chain_scope: chainScope },
      orderBy: { sequence: 'desc' },
      select: { sequence: true, record_hash: true }
    });

    const sequence = (lastEvent?.sequence || 0) + 1;
    const normalizedPayload = normalizeValue(input.payload);
    const payloadHash = sha256(canonicalize(normalizedPayload));
    const createdAt = new Date();
    const previousHash = lastEvent?.record_hash || null;
    const entityId = input.entityId || null;
    const recordHash = buildRecordHash({
      chainScope,
      sequence,
      entityType: input.entityType,
      entityId,
      action: input.action,
      payloadHash,
      previousHash,
      createdAt
    });

    return client.nhatKyToanVenDuLieu.create({
      data: {
        chain_scope: chainScope,
        sequence,
        entity_type: input.entityType,
        entity_id: entityId,
        action: input.action,
        actor_id: input.actorId || null,
        request_id: input.requestId || null,
        ip_address: input.ipAddress || null,
        user_agent: input.userAgent || null,
        payload: normalizedPayload,
        payload_hash: payloadHash,
        previous_hash: previousHash,
        record_hash: recordHash,
        created_at: createdAt
      }
    });
  }

  async verifyChain(chainScope?: string): Promise<VerifyAuditIntegrityResult> {
    const events = await prisma.nhatKyToanVenDuLieu.findMany({
      where: chainScope ? { chain_scope: chainScope } : undefined,
      orderBy: [{ chain_scope: 'asc' }, { sequence: 'asc' }]
    });

    let checkedCount = 0;
    let lastByScope = new Map<string, string | null>();
    let lastHash: string | null = null;

    for (const event of events) {
      const expectedPreviousHash = lastByScope.get(event.chain_scope) || null;
      if (event.previous_hash !== expectedPreviousHash) {
        return {
          valid: false,
          checkedCount,
          firstBrokenEventId: event.id,
          brokenReason: 'previous_hash_mismatch',
          lastHash
        };
      }

      const expectedPayloadHash = sha256(canonicalize(event.payload));
      if (event.payload_hash !== expectedPayloadHash) {
        return {
          valid: false,
          checkedCount,
          firstBrokenEventId: event.id,
          brokenReason: 'payload_hash_mismatch',
          lastHash
        };
      }

      const expectedRecordHash = buildRecordHash({
        chainScope: event.chain_scope,
        sequence: event.sequence,
        entityType: event.entity_type,
        entityId: event.entity_id,
        action: event.action,
        payloadHash: event.payload_hash,
        previousHash: event.previous_hash,
        createdAt: event.created_at
      });

      if (event.record_hash !== expectedRecordHash) {
        return {
          valid: false,
          checkedCount,
          firstBrokenEventId: event.id,
          brokenReason: 'record_hash_mismatch',
          lastHash
        };
      }

      checkedCount += 1;
      lastHash = event.record_hash;
      lastByScope.set(event.chain_scope, event.record_hash);
    }

    return {
      valid: true,
      checkedCount,
      firstBrokenEventId: null,
      brokenReason: null,
      lastHash
    };
  }
}

export const auditIntegrityService = new AuditIntegrityService();
export default AuditIntegrityService;
