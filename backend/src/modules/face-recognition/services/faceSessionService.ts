import { createHash, randomBytes, randomUUID } from 'crypto';
import { prisma } from '../../../data/infrastructure/prisma/client';

export type FaceSessionPurpose = 'registration' | 'attendance';

export type FaceSessionChallenge = {
  key: string;
  label: string;
  instruction: string;
};

export type StoredFaceSession = {
  id: string;
  userId: string;
  purpose: FaceSessionPurpose;
  contextId?: string | null;
  challenges: FaceSessionChallenge[];
  expiresAt: Date;
  usedAt?: Date | null;
  nonce: string;
};

type StartFaceSessionInput = {
  userId: string;
  purpose: FaceSessionPurpose;
  contextId?: string | null;
};

type ConsumeFaceSessionInput = {
  sessionId: string;
  userId: string;
  purpose: FaceSessionPurpose;
  contextId?: string | null;
  submittedChallenges?: string[];
};

type StoredFaceSessionRow = {
  id: string;
  user_id: string;
  purpose: FaceSessionPurpose;
  context_id: string | null;
  challenge_payload: unknown;
  expires_at: Date;
  used_at: Date | null;
};

const SESSION_TTL_MS = Number(process.env.FACE_SESSION_TTL_MS || 120000);
const MIN_CHALLENGES = Number(process.env.FACE_SESSION_MIN_CHALLENGES || 3);
const DB_STORAGE_ENABLED = process.env.FACE_SESSION_STORAGE !== 'memory';

const CHALLENGE_POOL: FaceSessionChallenge[] = [
  {
    key: 'center',
    label: 'Nhìn thẳng camera',
    instruction: 'Giữ khuôn mặt ở giữa khung hình'
  },
  {
    key: 'left',
    label: 'Quay mặt sang trái',
    instruction: 'Quay nhẹ sang trái rồi giữ yên'
  },
  {
    key: 'right',
    label: 'Quay mặt sang phải',
    instruction: 'Quay nhẹ sang phải rồi giữ yên'
  },
  {
    key: 'up',
    label: 'Nghiêng mặt nhẹ',
    instruction: 'Nghiêng mặt nhẹ để xác minh chuyển động thật'
  },
  {
    key: 'down',
    label: 'Cúi mặt nhẹ',
    instruction: 'Cúi mặt nhẹ rồi nhìn lại camera'
  }
];

class FaceSessionService {
  private readonly memorySessions = new Map<string, StoredFaceSession>();
  private ensureTablePromise: Promise<void> | null = null;
  private lastDbCleanupAt = 0;

  async start(input: StartFaceSessionInput): Promise<StoredFaceSession> {
    if (!DB_STORAGE_ENABLED) {
      return this.startInMemory(input);
    }

    try {
      await this.ensureTable();
      await this.cleanupExpiredDb();
      const session = this.buildSession(input);
      await prisma.$executeRaw`
        INSERT INTO face_verification_session
          (id, user_id, purpose, context_id, challenge_payload, expires_at, nonce_hash)
        VALUES
          (${session.id}::uuid, ${session.userId}::uuid, ${session.purpose}, ${session.contextId || null}, ${JSON.stringify(session.challenges)}::jsonb, ${session.expiresAt}, ${this.hashNonce(session.nonce)})
      `;
      return session;
    } catch (error) {
      console.warn('[FaceSessionService] DB storage unavailable; falling back to memory.', error);
      return this.startInMemory(input);
    }
  }

  async consume(input: ConsumeFaceSessionInput): Promise<StoredFaceSession> {
    if (!DB_STORAGE_ENABLED) {
      return this.consumeInMemory(input);
    }

    try {
      await this.ensureTable();
      const rows = await prisma.$queryRaw<StoredFaceSessionRow[]>`
        SELECT id, user_id, purpose, context_id, challenge_payload, expires_at, used_at
        FROM face_verification_session
        WHERE id = ${input.sessionId}::uuid
        LIMIT 1
      `;
      const session = this.normalizeDbSession(rows[0]);
      this.assertConsumable(session, input);

      const updated = await prisma.$executeRaw`
        UPDATE face_verification_session
        SET used_at = NOW(), updated_at = NOW()
        WHERE id = ${input.sessionId}::uuid
          AND used_at IS NULL
          AND expires_at > NOW()
      `;
      if (Number(updated) !== 1) {
        throw new Error('Phien xac minh khuon mat da duoc su dung hoac da het han');
      }

      session.usedAt = new Date();
      return session;
    } catch (error) {
      if (this.memorySessions.has(input.sessionId)) {
        return this.consumeInMemory(input);
      }
      throw error;
    }
  }

  private startInMemory(input: StartFaceSessionInput): StoredFaceSession {
    this.cleanupExpired();
    const session = this.buildSession(input);
    this.memorySessions.set(session.id, session);
    return session;
  }

  private consumeInMemory(input: ConsumeFaceSessionInput): StoredFaceSession {
    this.cleanupExpired();
    const session = this.memorySessions.get(input.sessionId);
    this.assertConsumable(session, input);
    session.usedAt = new Date();
    return session;
  }

  private buildSession(input: StartFaceSessionInput): StoredFaceSession {
    return {
      id: randomUUID(),
      userId: input.userId,
      purpose: input.purpose,
      contextId: input.contextId || null,
      challenges: this.pickChallenges(),
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      usedAt: null,
      nonce: randomBytes(16).toString('hex')
    };
  }

  private assertConsumable(
    session: StoredFaceSession | undefined,
    input: ConsumeFaceSessionInput
  ): asserts session is StoredFaceSession {
    if (!session) {
      throw new Error('Phien xac minh khuon mat khong ton tai hoac da het han');
    }
    if (session.usedAt) {
      throw new Error('Phien xac minh khuon mat da duoc su dung');
    }
    if (session.userId !== input.userId) {
      throw new Error('Phien xac minh khuon mat khong thuoc nguoi dung hien tai');
    }
    if (session.purpose !== input.purpose) {
      throw new Error('Phien xac minh khuon mat khong dung muc dich');
    }
    if (session.contextId && input.contextId && session.contextId !== input.contextId) {
      throw new Error('Phien xac minh khuon mat khong khop hoat dong');
    }
    if (session.expiresAt.getTime() < Date.now()) {
      this.memorySessions.delete(session.id);
      throw new Error('Phien xac minh khuon mat da het han');
    }

    const expected = session.challenges.map(item => item.key);
    const submitted = input.submittedChallenges?.filter(Boolean) || [];
    if (submitted.length > 0 && expected.join(',') !== submitted.join(',')) {
      throw new Error('Thu tu challenge xac minh khuon mat khong hop le');
    }
  }

  private pickChallenges(): FaceSessionChallenge[] {
    const center = CHALLENGE_POOL[0];
    const directional = CHALLENGE_POOL.slice(1)
      .map(item => ({ item, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(entry => entry.item);

    return [center, ...directional].slice(0, Math.max(2, Math.min(MIN_CHALLENGES, CHALLENGE_POOL.length)));
  }

  private cleanupExpired(): void {
    const now = Date.now();
    for (const [id, session] of this.memorySessions.entries()) {
      if (session.expiresAt.getTime() < now) {
        this.memorySessions.delete(id);
      }
    }
  }

  private async cleanupExpiredDb(): Promise<void> {
    const now = Date.now();
    if (now - this.lastDbCleanupAt < 60000) return;
    this.lastDbCleanupAt = now;

    await prisma.$executeRaw`
      DELETE FROM face_verification_session
      WHERE expires_at < NOW() - INTERVAL '10 minutes'
    `;
  }

  private async ensureTable(): Promise<void> {
    if (!this.ensureTablePromise) {
      this.ensureTablePromise = (async () => {
        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS face_verification_session (
            id UUID PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
            purpose VARCHAR(30) NOT NULL,
            context_id TEXT NULL,
            challenge_payload JSONB NOT NULL,
            nonce_hash CHAR(64) NOT NULL,
            expires_at TIMESTAMP(6) NOT NULL,
            used_at TIMESTAMP(6) NULL,
            created_at TIMESTAMP(6) NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP(6) NOT NULL DEFAULT NOW()
          )
        `);
        await prisma.$executeRawUnsafe(`
          CREATE INDEX IF NOT EXISTS idx_face_verification_session_user_purpose
            ON face_verification_session(user_id, purpose, expires_at)
        `);
        await prisma.$executeRawUnsafe(`
          CREATE INDEX IF NOT EXISTS idx_face_verification_session_context
            ON face_verification_session(context_id, expires_at)
        `);
        await prisma.$executeRawUnsafe(`
          CREATE INDEX IF NOT EXISTS idx_face_verification_session_expiry
            ON face_verification_session(expires_at)
        `);
      })().catch((error) => {
        this.ensureTablePromise = null;
        throw error;
      });
    }
    return this.ensureTablePromise;
  }

  private normalizeDbSession(row?: StoredFaceSessionRow): StoredFaceSession | undefined {
    if (!row) return undefined;
    const challenges = Array.isArray(row.challenge_payload)
      ? row.challenge_payload.filter(this.isChallenge)
      : [];

    return {
      id: row.id,
      userId: row.user_id,
      purpose: row.purpose,
      contextId: row.context_id,
      challenges,
      expiresAt: row.expires_at,
      usedAt: row.used_at,
      nonce: ''
    };
  }

  private isChallenge(value: unknown): value is FaceSessionChallenge {
    if (!value || typeof value !== 'object') return false;
    const challenge = value as Partial<FaceSessionChallenge>;
    return typeof challenge.key === 'string'
      && typeof challenge.label === 'string'
      && typeof challenge.instruction === 'string';
  }

  private hashNonce(nonce: string): string {
    return createHash('sha256').update(nonce).digest('hex');
  }
}

export const faceSessionService = new FaceSessionService();
export default FaceSessionService;
