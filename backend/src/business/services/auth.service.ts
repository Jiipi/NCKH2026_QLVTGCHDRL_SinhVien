/**
 * Auth Service
 * Handles user authentication, password management, and user lookups
 * @module business/services/auth
 */

import bcrypt from 'bcryptjs';
import { prisma } from '../../data/infrastructure/prisma/client';
import { normalizeRoleCode } from '../../core/utils/roleHelper';
import { NguoiDung, SinhVien, VaiTro, Lop, Prisma, GioiTinh, TrangThaiTaiKhoan } from '@prisma/client';

// Types - user with related entities matching includeForUser() select shape
type UserWithRelations = NguoiDung & {
  vai_tro: VaiTro | null;
  sinh_vien: (SinhVien & { lop?: Lop | null }) | null;
  dang_ky_duyet?: unknown[];
};

interface UserDTO {
  id: string;
  name: string;
  ho_ten: string;
  maso: string;
  ten_dn: string;
  email: string | null;
  role: string;
  roleCode: string;
  roleLabel: string;
  mssv: string | null;
  lop: string | null;
  khoa: string | null;
  nienkhoa: string | null;
  ngaysinh: Date | null;
  gt: string | null;
  dia_chi: string | null;
  sdt: string | null;
  anh_dai_dien: string | null;
  trangthai: string;
  trang_thai: string;
  lan_cuoi_dn: Date | null;
  createdAt: Date;
  updatedAt: Date;
  ngay_tao: Date;
  ngay_cap_nhat: Date;
  vai_tro: VaiTro | null;
}

interface CreateStudentParams {
  name: string;
  maso: string;
  email: string;
  hashedPassword: string;
  lopId: string;
  ngaySinh?: string | null;
  gioiTinh?: string | null;
  diaChi?: string | null;
  sdt?: string | null;
}

interface UpdateProfileParams {
  maso?: string;
  name?: string;
  trangthai?: string;
  ngaysinh?: string | null;
  gt?: string | null;
  sdt?: string | null;
}

class AuthService {
  /**
   * Include configuration for user queries
   */
  static includeForUser(): Prisma.NguoiDungInclude {
    return {
      vai_tro: true,
      sinh_vien: { 
        select: { 
          id: true,
          nguoi_dung_id: true,
          mssv: true,
          ngay_sinh: true,
          gt: true,
          lop_id: true,
          dia_chi: true,
          sdt: true,
          email: true,
          lop: true
        }
      }
    };
  }

  /**
   * Convert user database object to DTO format
   */
  static async toUserDTO(user: UserWithRelations | null): Promise<UserDTO | null> {
    if (!user) return null;
    const rawRoleLabel = user.vai_tro?.ten_vt || 'sinh viên';
    const roleCode = normalizeRoleCode(rawRoleLabel);
    
    return {
      id: user.id,
      name: user.ho_ten,
      ho_ten: user.ho_ten,
      maso: user.ten_dn,
      ten_dn: user.ten_dn,
      email: user.email,
      role: roleCode,
      roleCode,
      roleLabel: rawRoleLabel,
      
      mssv: user.sinh_vien?.mssv || user.ten_dn || null,
      lop: user.sinh_vien?.lop?.ten_lop || null,
      khoa: user.sinh_vien?.lop?.khoa || null,
      nienkhoa: user.sinh_vien?.lop?.nien_khoa || null,
      ngaysinh: user.sinh_vien?.ngay_sinh || null,
      gt: user.sinh_vien?.gt || null,
      dia_chi: user.sinh_vien?.dia_chi || null,
      sdt: user.sinh_vien?.sdt || null,
      
      anh_dai_dien: user.anh_dai_dien || null,
      trangthai: user.trang_thai,
      trang_thai: user.trang_thai,
      lan_cuoi_dn: user.lan_cuoi_dn || null,
      createdAt: user.ngay_tao,
      updatedAt: user.ngay_cap_nhat,
      ngay_tao: user.ngay_tao,
      ngay_cap_nhat: user.ngay_cap_nhat,
      
      vai_tro: user.vai_tro
    };
  }

  /**
   * Find user by maso (username)
   */
  static async findUserByMaso(maso: string): Promise<UserWithRelations | null> {
    const identifier = String(maso || '').trim();
    return prisma.nguoiDung.findFirst({
      where: { ten_dn: { equals: identifier, mode: 'insensitive' } },
      include: this.includeForUser()
    });
  }

  /**
   * Find user by email
   */
  static async findUserByEmail(email: string): Promise<UserWithRelations | null> {
    const e = String(email || '').trim().toLowerCase();
    return prisma.nguoiDung.findFirst({
      where: {
        OR: [
          { email: { equals: e, mode: 'insensitive' } },
          { sinh_vien: { email: { equals: e, mode: 'insensitive' } } }
        ]
      },
      include: this.includeForUser()
    });
  }

  /**
   * Find user by email or maso (flexible login)
   */
  static async findByEmailOrMaso(identifier: string): Promise<UserWithRelations | null> {
    const raw = String(identifier || '').trim();
    const normalized = raw.toLowerCase();
    return prisma.nguoiDung.findFirst({
      where: {
        OR: [
          { ten_dn: { equals: normalized, mode: 'insensitive' } },
          { email: { equals: raw, mode: 'insensitive' } }
        ]
      },
      include: this.includeForUser()
    });
  }

  /**
   * Update user login information
   */
  static async updateLoginInfo(userId: string, ip?: string): Promise<void> {
    await prisma.nguoiDung.update({
      where: { id: userId },
      data: {
        lan_cuoi_dn: new Date(),
        ngay_cap_nhat: new Date(),
      }
    });
  }

  /**
   * Compare plain password with hashed password
   */
  static async comparePassword(plain: string, hashed: string): Promise<boolean> {
    if (!plain || !hashed) return false;
    
    try {
      if (typeof hashed === 'string' && hashed.startsWith('$2')) {
        return await bcrypt.compare(plain, hashed);
      }
      
      console.error('[Security] Attempted login with non-bcrypt password - migration required');
      return false;
    } catch (error) {
      console.error('[Security] Password comparison failed:', (error as Error).message);
      return false;
    }
  }

  /**
   * Hash password with bcrypt
   */
  static async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
  }

  /**
   * Update user password by ID
   */
  static async updatePasswordById(userId: string, hashedPassword: string): Promise<boolean> {
    await prisma.nguoiDung.update({
      where: { id: userId },
      data: { mat_khau: hashedPassword, ngay_cap_nhat: new Date() }
    });
    return true;
  }

  /**
   * Find or create default class for student registration
   */
  static async findDefaultClass(): Promise<Lop | null> {
    const existing = await prisma.lop.findFirst({ 
      where: { ten_lop: 'Lớp mặc định' } 
    });
    if (existing) return existing;

    const gv = await prisma.nguoiDung.findUnique({ 
      where: { ten_dn: 'gv001' }, 
      select: { id: true } 
    }).catch(() => null);
    
    const ad = gv ? null : await prisma.nguoiDung.findUnique({ 
      where: { ten_dn: 'admin' }, 
      select: { id: true } 
    }).catch(() => null);
    
    const anyUser = gv || ad || await prisma.nguoiDung.findFirst({ 
      select: { id: true } 
    });
    
    if (!anyUser) return null;

    return prisma.lop.create({
      data: {
        ten_lop: 'Lớp mặc định',
        khoa: 'Công nghệ thông tin',
        nien_khoa: '2021-2025',
        nam_nhap_hoc: new Date(),
        chu_nhiem: anyUser.id,
      }
    });
  }

  /**
   * Find or create default class for specific faculty
   */
  static async findOrCreateClassForFaculty(khoa: string): Promise<Lop | null> {
    const khoaShort = khoa.substring(0, 15);
    const tenLop = `MD-${khoaShort}`;
    
    const existing = await prisma.lop.findFirst({ 
      where: { 
        khoa: khoa,
        ten_lop: tenLop
      } 
    });
    if (existing) return existing;

    const gv = await prisma.nguoiDung.findUnique({ 
      where: { ten_dn: 'gv001' }, 
      select: { id: true } 
    }).catch(() => null);
    
    const ad = gv ? null : await prisma.nguoiDung.findUnique({ 
      where: { ten_dn: 'admin' }, 
      select: { id: true } 
    }).catch(() => null);
    
    const anyUser = gv || ad || await prisma.nguoiDung.findFirst({ 
      select: { id: true } 
    });
    
    if (!anyUser) return null;

    return prisma.lop.create({
      data: {
        ten_lop: tenLop,
        khoa: khoa,
        nien_khoa: '2021-2025',
        nam_nhap_hoc: new Date(),
        chu_nhiem: anyUser.id,
      }
    });
  }

  /**
   * Create new student user with account and profile
   */
  static async createStudent({ 
    name, 
    maso, 
    email, 
    hashedPassword, 
    lopId, 
    ngaySinh, 
    gioiTinh, 
    diaChi, 
    sdt 
  }: CreateStudentParams): Promise<UserWithRelations | null> {
    let role = await prisma.vaiTro.findFirst({ 
      where: { ten_vt: 'SINH_VIEN' } 
    });
    
    if (!role) {
      role = await prisma.vaiTro.findFirst({ 
        where: { ten_vt: 'SINH_VIÊN' } 
      });
      
      if (!role) {
        role = await prisma.vaiTro.create({ 
          data: { ten_vt: 'SINH_VIEN', mo_ta: 'Sinh vien' } 
        });
      }
    }

    const user = await prisma.nguoiDung.create({
      data: {
        ten_dn: maso,
        ho_ten: name,
        mat_khau: hashedPassword,
        email,
        trang_thai: 'hoat_dong',
        vai_tro_id: role?.id || undefined,
      },
      include: this.includeForUser()
    });
    
    await prisma.sinhVien.create({
      data: {
        nguoi_dung_id: user.id,
        mssv: maso,
        ngay_sinh: ngaySinh ? new Date(ngaySinh) : new Date('2000-01-01'), 
        gt: (gioiTinh || null) as GioiTinh | null,
        dia_chi: diaChi || null,
        sdt: sdt || null,
        lop_id: lopId,
      }
    });
    
    return prisma.nguoiDung.findUnique({ 
      where: { id: user.id }, 
      include: this.includeForUser() 
    });
  }

  /**
   * Update user email
   */
  static async createEmailContact(userId: string, email: string): Promise<boolean> {
    await prisma.nguoiDung.update({ 
      where: { id: userId }, 
      data: { email } 
    });
    return true;
  }

  /**
   * Legacy contact helpers (no-op)
   */
  static async deleteNonEmailContacts(userId: string): Promise<void> {
    return Promise.resolve();
  }

  static async createNonEmailContacts(userId: string, contacts: Record<string, unknown>[]): Promise<void> {
    return Promise.resolve();
  }

  // Legacy aliases for backward compatibility
  static timNguoiDungTheoMaso(maso: string) {
    return this.findUserByMaso(maso);
  }

  static timNguoiDungTheoEmail(email: string) {
    return this.findUserByEmail(email);
  }

  static capNhatThongTinDangNhap(userId: string, ip?: string) {
    return this.updateLoginInfo(userId, ip);
  }

  static soSanhMatKhau(plain: string, hashed: string) {
    return this.comparePassword(plain, hashed);
  }

  static bamMatKhau(plain: string) {
    return this.hashPassword(plain);
  }

  /**
   * Update user profile (basic info)
   */
  static async updateProfile(id: string, { maso, name, trangthai, ngaysinh, gt, sdt }: UpdateProfileParams): Promise<UserDTO | null> {
    const dataUser: Prisma.NguoiDungUpdateInput = { ngay_cap_nhat: new Date() };
    if (typeof maso !== 'undefined') dataUser.ten_dn = maso;
    if (typeof name !== 'undefined') dataUser.ho_ten = name;
    if (typeof trangthai !== 'undefined') dataUser.trang_thai = trangthai as TrangThaiTaiKhoan;

    const ops: Prisma.PrismaPromise<unknown>[] = [];
    ops.push(prisma.nguoiDung.update({ where: { id }, data: dataUser }));

    const updateSV = (typeof ngaysinh !== 'undefined') || (typeof gt !== 'undefined') || (typeof sdt !== 'undefined');
    if (updateSV) {
      const dataSv: Prisma.SinhVienUpdateManyMutationInput = {};
      if (typeof ngaysinh !== 'undefined') dataSv.ngay_sinh = ngaysinh ? new Date(ngaysinh) : null;
      if (typeof gt !== 'undefined') dataSv.gt = (gt || null) as GioiTinh | null;
      if (typeof sdt !== 'undefined') dataSv.sdt = sdt || null;
      ops.push(prisma.sinhVien.updateMany({ where: { nguoi_dung_id: id }, data: dataSv }));
    }

    await prisma.$transaction(ops);
    const user = await prisma.nguoiDung.findUnique({ 
      where: { id }, 
      include: this.includeForUser() 
    });
    return this.toUserDTO(user);
  }
}

export default AuthService;
