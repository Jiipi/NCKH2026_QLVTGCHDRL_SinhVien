import crypto from 'crypto';
import JwtTokenService from '../../modules/auth/business/services/JwtTokenService';
import { prisma } from '../../data/infrastructure/prisma/client';
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError, ValidationError } from '../../core/errors/AppError';
import { AttendanceAuditContext, writeAttendanceAudit } from '../../core/logger/attendance-audit';

type Purpose = 'dang_ky' | 'dang_nhap' | 'diem_danh';
type JsonMap = Record<string, unknown>;

interface SerializedCredential {
  id?: string;
  rawId?: string;
  type?: string;
  response?: {
    clientDataJSON?: string;
    attestationObject?: string;
    authenticatorData?: string;
    signature?: string;
    userHandle?: string | null;
  };
}

interface AuthContext extends AttendanceAuditContext {
  userId?: string | null;
}

const CHALLENGE_TTL_MS = 5 * 60 * 1000;
const ATTENDANCE_TIME_LEEWAY_MS = 12 * 60 * 60 * 1000;
const rpName = process.env.WEBAUTHN_RP_NAME || 'DLU Ren Luyen';

function base64url(input: Buffer | string): string {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64url(value?: string | null): Buffer {
  if (!value) return Buffer.alloc(0);
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 ? '='.repeat(4 - (normalized.length % 4)) : '';
  return Buffer.from(normalized + padding, 'base64');
}

function sha256(input: Buffer | string): Buffer {
  return crypto.createHash('sha256').update(input).digest();
}

function getRpId(): string {
  if (process.env.WEBAUTHN_RP_ID) return process.env.WEBAUTHN_RP_ID;
  const origin = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || '';
  try {
    return new URL(origin).hostname || 'localhost';
  } catch {
    return 'localhost';
  }
}

function getAllowedOrigins(): Set<string> {
  const configured = [
    process.env.WEBAUTHN_ORIGIN,
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGIN
  ]
    .flatMap(value => String(value || '').split(','))
    .map(value => value.trim())
    .filter(Boolean);

  return new Set([
    ...configured,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    `https://${getRpId()}`
  ]);
}

function cleanIp(ip?: string | null): string | null {
  if (!ip) return null;
  const first = ip.split(',')[0]?.trim();
  return first ? first.replace(/^::ffff:/, '') : null;
}

function readLength(buffer: Buffer, offset: number, additional: number): { length: number; offset: number } {
  if (additional < 24) return { length: additional, offset };
  if (additional === 24) return { length: buffer.readUInt8(offset), offset: offset + 1 };
  if (additional === 25) return { length: buffer.readUInt16BE(offset), offset: offset + 2 };
  if (additional === 26) return { length: buffer.readUInt32BE(offset), offset: offset + 4 };
  throw new BadRequestError('Dữ liệu WebAuthn không được hỗ trợ');
}

function decodeCbor(buffer: Buffer, start = 0): { value: unknown; offset: number } {
  const initial = buffer.readUInt8(start);
  const major = initial >> 5;
  const additional = initial & 0x1f;
  let offset = start + 1;
  const len = readLength(buffer, offset, additional);
  const length = len.length;
  offset = len.offset;

  if (major === 0) return { value: length, offset };
  if (major === 1) return { value: -1 - length, offset };
  if (major === 2) return { value: buffer.subarray(offset, offset + length), offset: offset + length };
  if (major === 3) return { value: buffer.subarray(offset, offset + length).toString('utf8'), offset: offset + length };
  if (major === 4) {
    const arr: unknown[] = [];
    for (let i = 0; i < length; i += 1) {
      const decoded = decodeCbor(buffer, offset);
      arr.push(decoded.value);
      offset = decoded.offset;
    }
    return { value: arr, offset };
  }
  if (major === 5) {
    const map = new Map<unknown, unknown>();
    for (let i = 0; i < length; i += 1) {
      const key = decodeCbor(buffer, offset);
      offset = key.offset;
      const value = decodeCbor(buffer, offset);
      offset = value.offset;
      map.set(key.value, value.value);
    }
    return { value: map, offset };
  }
  if (major === 7) {
    if (additional === 20) return { value: false, offset };
    if (additional === 21) return { value: true, offset };
    if (additional === 22 || additional === 23) return { value: null, offset };
  }
  throw new BadRequestError('Dữ liệu WebAuthn không hợp lệ');
}

function parseAuthenticatorData(authData: Buffer) {
  if (authData.length < 37) throw new BadRequestError('Authenticator data không hợp lệ');
  const rpIdHash = authData.subarray(0, 32);
  const flags = authData.readUInt8(32);
  const counter = authData.readUInt32BE(33);
  return { rpIdHash, flags, counter };
}

function requireUserPresence(flags: number) {
  if ((flags & 0x01) === 0) throw new UnauthorizedError('Thiết bị chưa xác nhận người dùng');
}

function parseAttestation(attestationObject: Buffer) {
  const attestation = decodeCbor(attestationObject).value as Map<unknown, unknown>;
  const authData = attestation.get('authData') as Buffer;
  if (!Buffer.isBuffer(authData)) throw new BadRequestError('Thiếu authData');

  const parsed = parseAuthenticatorData(authData);
  if ((parsed.flags & 0x40) === 0) throw new BadRequestError('Thiếu credential trong phản hồi đăng ký');

  let offset = 37 + 16;
  const credentialLength = authData.readUInt16BE(offset);
  offset += 2;
  const credentialId = authData.subarray(offset, offset + credentialLength);
  offset += credentialLength;

  const coseKey = decodeCbor(authData, offset).value as Map<unknown, unknown>;
  const x = coseKey.get(-2) as Buffer;
  const y = coseKey.get(-3) as Buffer;
  const alg = coseKey.get(3);
  const crv = coseKey.get(-1);
  if (alg !== -7 || crv !== 1 || !Buffer.isBuffer(x) || !Buffer.isBuffer(y)) {
    throw new BadRequestError('Chỉ hỗ trợ khóa vân tay ES256/P-256');
  }

  return {
    credentialId: base64url(credentialId),
    counter: parsed.counter,
    rpIdHash: parsed.rpIdHash,
    flags: parsed.flags,
    publicKeyJwk: {
      kty: 'EC',
      crv: 'P-256',
      x: base64url(x),
      y: base64url(y),
      ext: true
    }
  };
}

function parseClientData(credential: SerializedCredential, expectedType: 'webauthn.create' | 'webauthn.get') {
  const clientDataBuffer = fromBase64url(credential.response?.clientDataJSON);
  const clientData = JSON.parse(clientDataBuffer.toString('utf8'));
  if (clientData.type !== expectedType) throw new UnauthorizedError('Loại xác thực WebAuthn không hợp lệ');
  if (!getAllowedOrigins().has(clientData.origin)) throw new UnauthorizedError('Origin WebAuthn không hợp lệ');
  return { clientData, clientDataBuffer };
}

async function findValidChallenge(challenge: string, purpose: Purpose, userId?: string | null, activityId?: string | null) {
  const record = await (prisma as any).thuThachVanTay.findUnique({ where: { challenge } });
  if (!record || record.muc_dich !== purpose) throw new UnauthorizedError('Phiên xác thực vân tay không hợp lệ');
  if (record.da_su_dung_luc || record.het_han_luc <= new Date()) throw new UnauthorizedError('Phiên xác thực vân tay đã hết hạn');
  if (userId && record.nguoi_dung_id !== userId) throw new UnauthorizedError('Phiên xác thực vân tay không thuộc tài khoản này');
  if (activityId && record.hoat_dong_id !== activityId) throw new UnauthorizedError('Phiên điểm danh vân tay không thuộc hoạt động này');
  return record;
}

function validateRpIdHash(rpIdHash: Buffer) {
  if (!crypto.timingSafeEqual(rpIdHash, sha256(getRpId()))) {
    throw new UnauthorizedError('RP ID của thiết bị không khớp hệ thống');
  }
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

function verifyAssertionSignature(credential: SerializedCredential, publicKey: JsonMap) {
  const authenticatorData = fromBase64url(credential.response?.authenticatorData);
  const signature = fromBase64url(credential.response?.signature);
  const clientDataBuffer = fromBase64url(credential.response?.clientDataJSON);
  const signedData = Buffer.concat([authenticatorData, sha256(clientDataBuffer)]);
  const key = crypto.createPublicKey({ key: publicKey, format: 'jwk' } as any);
  const verifier = crypto.createVerify('SHA256');
  verifier.update(signedData);
  verifier.end();
  if (!verifier.verify(key, signature)) throw new UnauthorizedError('Chữ ký vân tay không hợp lệ');
  return parseAuthenticatorData(authenticatorData);
}

function mapUser(user: any) {
  return {
    id: user.id,
    maso: user.ten_dn,
    email: user.email,
    ho_ten: user.ho_ten,
    role: (user.vai_tro?.ten_vt || 'SINH_VIEN').toUpperCase(),
    roleCode: (user.vai_tro?.ten_vt || 'SINH_VIEN').toUpperCase(),
    roleName: user.vai_tro?.mo_ta || user.vai_tro?.ten_vt,
    avatar: user.anh_dai_dien || null,
    status: user.trang_thai
  };
}

class VanTayWebAuthnService {
  private tokenService = new JwtTokenService();

  private async createChallenge(purpose: Purpose, context: AuthContext, activityId?: string | null) {
    const challenge = base64url(crypto.randomBytes(32));
    await (prisma as any).thuThachVanTay.create({
      data: {
        nguoi_dung_id: context.userId || null,
        challenge,
        muc_dich: purpose,
        hoat_dong_id: activityId || null,
        het_han_luc: new Date(Date.now() + CHALLENGE_TTL_MS),
        dia_chi_ip: cleanIp(context.ip),
        user_agent: context.userAgent || null
      }
    });
    return challenge;
  }

  async getRegisteredDevices(userId: string) {
    const devices = await (prisma as any).khoaVanTay.findMany({
      where: { nguoi_dung_id: userId, da_kich_hoat: true },
      orderBy: { ngay_tao: 'desc' },
      select: { id: true, credential_id: true, ten_thiet_bi: true, transports: true, ngay_tao: true, lan_su_dung_cuoi: true }
    });
    return devices.map((device: any) => ({
      id: device.id,
      credentialId: device.credential_id,
      deviceName: device.ten_thiet_bi || 'Thiết bị vân tay',
      transports: device.transports || [],
      createdAt: device.ngay_tao,
      lastUsedAt: device.lan_su_dung_cuoi
    }));
  }

  async beginRegistration(userId: string, context: AuthContext) {
    const user = await prisma.nguoiDung.findUnique({
      where: { id: userId },
      include: { vai_tro: true }
    });
    if (!user) throw new NotFoundError('Không tìm thấy tài khoản');

    const existing = await (prisma as any).khoaVanTay.findMany({
      where: { nguoi_dung_id: userId, da_kich_hoat: true },
      select: { credential_id: true, transports: true }
    });
    const challenge = await this.createChallenge('dang_ky', { ...context, userId });

    return {
      rp: { name: rpName, id: getRpId() },
      user: {
        id: base64url(Buffer.from(user.id)),
        name: user.ten_dn,
        displayName: user.ho_ten || user.email || user.ten_dn
      },
      challenge,
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
      timeout: 60000,
      attestation: 'none',
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        residentKey: 'preferred',
        requireResidentKey: false,
        userVerification: 'required'
      },
      excludeCredentials: existing.map((device: any) => ({
        id: device.credential_id,
        type: 'public-key',
        transports: device.transports || []
      }))
    };
  }

  async finishRegistration(userId: string, credential: SerializedCredential, deviceName: string | undefined, context: AuthContext) {
    const { clientData } = parseClientData(credential, 'webauthn.create');
    await findValidChallenge(clientData.challenge, 'dang_ky', userId);
    const attestation = parseAttestation(fromBase64url(credential.response?.attestationObject));
    validateRpIdHash(attestation.rpIdHash);
    requireUserPresence(attestation.flags);

    const credentialId = credential.rawId || attestation.credentialId;
    const existing = await (prisma as any).khoaVanTay.findUnique({ where: { credential_id: credentialId } });
    if (existing) throw new ConflictError('Thiết bị vân tay này đã được đăng ký');

    const device = await (prisma as any).khoaVanTay.create({
      data: {
        nguoi_dung_id: userId,
        credential_id: credentialId,
        public_key: attestation.publicKeyJwk,
        counter: attestation.counter,
        transports: Array.isArray((credential as any).transports) ? (credential as any).transports : [],
        ten_thiet_bi: deviceName || 'Thiết bị vân tay'
      }
    });
    await (prisma as any).thuThachVanTay.update({
      where: { challenge: clientData.challenge },
      data: { da_su_dung_luc: new Date() }
    });

    return {
      registered: true,
      device: {
        id: device.id,
        credentialId: device.credential_id,
        deviceName: device.ten_thiet_bi
      }
    };
  }

  async beginLogin(identifier: string, context: AuthContext) {
    const value = String(identifier || '').trim();
    if (!value) throw new ValidationError('Vui lòng nhập MSSV, email hoặc tên đăng nhập');
    const user = await prisma.nguoiDung.findFirst({
      where: {
        OR: [
          { ten_dn: value },
          { email: value },
          { sinh_vien: { is: { mssv: value } } }
        ]
      },
      include: { vai_tro: true }
    });
    if (!user) throw new NotFoundError('Không tìm thấy tài khoản');
    const devices = await (prisma as any).khoaVanTay.findMany({
      where: { nguoi_dung_id: user.id, da_kich_hoat: true }
    });
    if (devices.length === 0) throw new ValidationError('Tài khoản chưa đăng ký vân tay');
    const challenge = await this.createChallenge('dang_nhap', { ...context, userId: user.id });

    return {
      challenge,
      rpId: getRpId(),
      timeout: 60000,
      userVerification: 'required',
      allowCredentials: devices.map((device: any) => ({
        id: device.credential_id,
        type: 'public-key',
        transports: device.transports || []
      }))
    };
  }

  async finishLogin(credential: SerializedCredential, remember = false, context: AuthContext) {
    const { clientData } = parseClientData(credential, 'webauthn.get');
    const challenge = await findValidChallenge(clientData.challenge, 'dang_nhap');
    const device = await (prisma as any).khoaVanTay.findUnique({
      where: { credential_id: credential.rawId || credential.id },
      include: { nguoi_dung: { include: { vai_tro: true } } }
    });
    if (!device || !device.da_kich_hoat || device.nguoi_dung_id !== challenge.nguoi_dung_id) {
      throw new UnauthorizedError('Thiết bị vân tay không hợp lệ');
    }

    const parsed = verifyAssertionSignature(credential, device.public_key as JsonMap);
    validateRpIdHash(parsed.rpIdHash);
    requireUserPresence(parsed.flags);

    await prisma.$transaction(async (tx) => {
      await (tx as any).khoaVanTay.update({
        where: { id: device.id },
        data: { counter: Math.max(device.counter || 0, parsed.counter), lan_su_dung_cuoi: new Date() }
      });
      await (tx as any).thuThachVanTay.update({
        where: { challenge: clientData.challenge },
        data: { da_su_dung_luc: new Date() }
      });
      await tx.nguoiDung.update({
        where: { id: device.nguoi_dung_id },
        data: { lan_cuoi_dn: new Date() }
      });
    });

    const token = await this.tokenService.generateToken(device.nguoi_dung, remember);
    return { token, user: mapUser(device.nguoi_dung) };
  }

  async beginAttendance(activityId: string, userId: string, context: AuthContext) {
    const devices = await (prisma as any).khoaVanTay.findMany({
      where: { nguoi_dung_id: userId, da_kich_hoat: true }
    });
    if (devices.length === 0) throw new ValidationError('Bạn chưa đăng ký vân tay trên thiết bị này');
    const activity = await prisma.hoatDong.findUnique({
      where: { id: activityId },
      select: { id: true, ngay_bd: true, ngay_kt: true }
    });
    if (!activity) throw new NotFoundError('Hoạt động không tồn tại');
    validateActivityWindow(activity);
    const challenge = await this.createChallenge('diem_danh', { ...context, userId }, activityId);
    return {
      challenge,
      rpId: getRpId(),
      timeout: 60000,
      userVerification: 'required',
      allowCredentials: devices.map((device: any) => ({
        id: device.credential_id,
        type: 'public-key',
        transports: device.transports || []
      }))
    };
  }

  async finishAttendance(activityId: string, userId: string, credential: SerializedCredential, location: any, context: AuthContext) {
    const { clientData } = parseClientData(credential, 'webauthn.get');
    await findValidChallenge(clientData.challenge, 'diem_danh', userId, activityId);
    const device = await (prisma as any).khoaVanTay.findUnique({ where: { credential_id: credential.rawId || credential.id } });
    if (!device || !device.da_kich_hoat || device.nguoi_dung_id !== userId) {
      throw new UnauthorizedError('Thiết bị vân tay không hợp lệ');
    }

    const parsed = verifyAssertionSignature(credential, device.public_key as JsonMap);
    validateRpIdHash(parsed.rpIdHash);
    requireUserPresence(parsed.flags);

    const student = await prisma.sinhVien.findUnique({ where: { nguoi_dung_id: userId } });
    if (!student) throw new NotFoundError('Tài khoản chưa có hồ sơ sinh viên');
    const activity = await prisma.hoatDong.findUnique({
      where: { id: activityId },
      select: { id: true, ten_hd: true, ngay_bd: true, ngay_kt: true }
    });
    if (!activity) throw new NotFoundError('Hoạt động không tồn tại');
    validateActivityWindow(activity);

    const registration = await prisma.dangKyHoatDong.findUnique({
      where: { sv_id_hd_id: { sv_id: student.id, hd_id: activityId } }
    });
    if (!registration) throw new ValidationError('Bạn chưa đăng ký hoạt động này');
    if (registration.trang_thai_dk !== 'da_duyet' && registration.trang_thai_dk !== 'da_tham_gia') {
      throw new ValidationError('Đăng ký hoạt động chưa được duyệt');
    }

    const existed = await prisma.diemDanh.findUnique({
      where: { sv_id_hd_id: { sv_id: student.id, hd_id: activityId } }
    });
    if (existed) throw new ConflictError('Bạn đã điểm danh hoạt động này');

    const attendance = await prisma.$transaction(async (tx) => {
      const created = await tx.diemDanh.create({
        data: {
          nguoi_diem_danh_id: userId,
          sv_id: student.id,
          hd_id: activityId,
          phuong_thuc: 'van_tay' as any,
          khoa_van_tay_id: device.id,
          dia_chi_ip: cleanIp(context.ip) as any,
          gps_latitude: location?.latitude ?? null,
          gps_longitude: location?.longitude ?? null,
          gps_accuracy_m: location?.accuracy ?? null,
          ket_qua_geofence: 'khong_yeu_cau' as any,
          ghi_chu: 'Điểm danh bằng vân tay/Passkey'
        } as any
      });
      await tx.dangKyHoatDong.update({
        where: { sv_id_hd_id: { sv_id: student.id, hd_id: activityId } },
        data: { trang_thai_dk: 'da_tham_gia' }
      });
      await (tx as any).khoaVanTay.update({
        where: { id: device.id },
        data: { counter: Math.max(device.counter || 0, parsed.counter), lan_su_dung_cuoi: new Date() }
      });
      await (tx as any).thuThachVanTay.update({
        where: { challenge: clientData.challenge },
        data: { da_su_dung_luc: new Date() }
      });
      return created;
    });

    await writeAttendanceAudit({
      action: 'SCAN_SUCCESS' as any,
      result: 'success',
      actorId: userId,
      studentId: student.id,
      activityId,
      attendanceId: attendance.id,
      ip: context.ip,
      userAgent: context.userAgent,
      metadata: { method: 'van_tay', credentialId: device.credential_id }
    });

    return {
      success: true,
      activityId,
      activityName: activity.ten_hd,
      attendanceId: attendance.id,
      timestamp: attendance.tg_diem_danh,
      method: 'van_tay'
    };
  }
}

export const vanTayWebAuthnService = new VanTayWebAuthnService();
export default vanTayWebAuthnService;
