const bcrypt = require('bcryptjs');
const { prisma } = require('../config/database');

/**
 * Auth Service
 * Handles user authentication, password management, and user lookups
 */
class AuthService {
  /**
   * Include configuration for user queries
   * Returns related data for user objects
   */
  static includeForUser() {
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
   * Normalizes role codes and includes student information
   */
  static toUserDTO(user) {
    if (!user) return null;
    const rawRoleLabel = user.vai_tro?.ten_vt || 'sinh viên';
    const roleCode = this.normalizeRoleCode(rawRoleLabel);
    
    return {
      id: user.id,
      name: user.ho_ten,
      ho_ten: user.ho_ten,
      maso: user.ten_dn,
      ten_dn: user.ten_dn,
      email: user.email,
      role: roleCode, // backward compatibility (uppercase code)
      roleCode,       // explicit code
      roleLabel: rawRoleLabel, // original Vietnamese label
      
      // Student information from sinh_vien table
      mssv: user.sinh_vien?.mssv || user.ten_dn || null,
      lop: user.sinh_vien?.lop?.ten_lop || null,
      khoa: user.sinh_vien?.lop?.khoa || null,
      nienkhoa: user.sinh_vien?.lop?.nien_khoa || null,
      ngaysinh: user.sinh_vien?.ngay_sinh || null,
      gt: user.sinh_vien?.gt || null,
      dia_chi: user.sinh_vien?.dia_chi || null,
      sdt: user.sinh_vien?.sdt || null,
      
      // Account information
      anh_dai_dien: user.anh_dai_dien || null,
      trangthai: user.trang_thai,
      trang_thai: user.trang_thai,
      lan_cuoi_dn: user.lan_cuoi_dn || null,
      createdAt: user.ngay_tao,
      updatedAt: user.ngay_cap_nhat,
      ngay_tao: user.ngay_tao,
      ngay_cap_nhat: user.ngay_cap_nhat,
      
      // Role information
      vai_tro: user.vai_tro
    };
  }

  /**
   * Normalize Vietnamese role labels to canonical role codes
   * Used for frontend routing and permission checks
   */
  static normalizeRoleCode(label) {
    const r = (label || '').toString().trim().toLowerCase();
    if (r.includes('quản trị')) return 'ADMIN';
    if (r.includes('giảng viên')) return 'GIANG_VIEN';
    if (r.includes('lớp trưởng')) return 'LOP_TRUONG';
    if (r.includes('hỗ trợ')) return 'HO_TRO';
    if (r.includes('sinh viên')) return 'SINH_VIEN';
    return label?.toString().toUpperCase() || 'SINH_VIEN';
  }

  /**
   * Find user by maso (username)
   * Case-insensitive search
   */
  static async findUserByMaso(maso) {
    const identifier = String(maso || '').trim();
    return prisma.nguoiDung.findFirst({
      where: { ten_dn: { equals: identifier, mode: 'insensitive' } },
      include: this.includeForUser()
    });
  }

  /**
   * Find user by email
   * Searches both nguoi_dung.email and sinh_vien.email
   */
  static async findUserByEmail(email) {
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
   * Case-insensitive search
   */
  static async findByEmailOrMaso(identifier) {
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
   * Records last login time
   */
  static async updateLoginInfo(userId, ip) {
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
  static async comparePassword(plain, hashed) {
    return bcrypt.compare(plain, hashed);
  }

  /**
   * Hash password with bcrypt
   */
  static async hashPassword(plain) {
    return bcrypt.hash(plain, 10);
  }

  /**
   * Verify password and auto-upgrade if stored as plain text
   * Handles legacy plain text passwords from Prisma Studio edits
   */
  static async verifyPasswordAndUpgrade(user, plain) {
    const hashed = user?.mat_khau;
    if (!hashed) return false;
    
    try {
      // Check if password is bcrypt hashed
      if (typeof hashed === 'string' && hashed.startsWith('$2')) {
        return await bcrypt.compare(plain, hashed);
      }
      
      // Handle legacy plain text password
      if (plain === hashed) {
        const newHash = await bcrypt.hash(plain, 10);
        await prisma.nguoiDung.update({
          where: { id: user.id },
          data: { mat_khau: newHash, ngay_cap_nhat: new Date() }
        });
        return true;
      }
      
      return false;
    } catch (_) {
      return false;
    }
  }

  /**
   * Update user password by ID
   * Expects pre-hashed password
   */
  static async updatePasswordById(userId, hashedPassword) {
    await prisma.nguoiDung.update({
      where: { id: userId },
      data: { mat_khau: hashedPassword, ngay_cap_nhat: new Date() }
    });
    return true;
  }

  /**
   * Find or create default class for student registration
   * Priority: gv001 as chu_nhiem -> admin -> first available user
   */
  static async findDefaultClass() {
    const existing = await prisma.lop.findFirst({ 
      where: { ten_lop: 'Lớp mặc định' } 
    });
    if (existing) return existing;

    // Find suitable chu_nhiem (class advisor)
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
   * Creates "MD-{faculty}" class if not exists
   */
  static async findOrCreateClassForFaculty(khoa) {
    // Shorten faculty name for class name (max 15 chars)
    const khoaShort = khoa.substring(0, 15);
    const tenLop = `MD-${khoaShort}`; // "MD" = Mặc định, total ≤ 18 chars
    
    // Find existing default class for this faculty
    const existing = await prisma.lop.findFirst({ 
      where: { 
        khoa: khoa,
        ten_lop: tenLop
      } 
    });
    if (existing) return existing;

    // Find suitable chu_nhiem (class advisor)
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

    // Create default class for faculty
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
   * Handles role lookup with fallback for accented/non-accented variants
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
  }) {
    // Get or create SINH_VIEN role (prefer non-accented per system standard)
    let role = await prisma.vaiTro.findFirst({ 
      where: { ten_vt: 'SINH_VIEN' } 
    });
    
    if (!role) {
      // Fallback: find accented version if DB uses accented roles
      role = await prisma.vaiTro.findFirst({ 
        where: { ten_vt: 'SINH_VIÊN' } 
      });
      
      if (!role) {
        // Create new non-accented role (standard)
        role = await prisma.vaiTro.create({ 
          data: { ten_vt: 'SINH_VIEN', mo_ta: 'Sinh vien' } 
        });
      }
    }

    // Create user account
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
    
    // Create student profile with full information
    await prisma.sinhVien.create({
      data: {
        nguoi_dung_id: user.id,
        mssv: maso,
        ngay_sinh: ngaySinh ? new Date(ngaySinh) : new Date('2000-01-01'), 
        gt: gioiTinh || null,
        dia_chi: diaChi || null,
        sdt: sdt || null,
        lop_id: lopId,
      }
    });
    
    // Return complete user with includes
    return prisma.nguoiDung.findUnique({ 
      where: { id: user.id }, 
      include: this.includeForUser() 
    });
  }

  /**
   * Update user email (no separate contact table)
   */
  static async createEmailContact(userId, email) {
    await prisma.nguoiDung.update({ 
      where: { id: userId }, 
      data: { email } 
    });
    return true;
  }

  /**
   * Legacy contact helpers (no-op, no separate contact table)
   */
  static async deleteNonEmailContacts(userId) {
    return Promise.resolve();
  }

  static async createNonEmailContacts(userId, contacts) {
    return Promise.resolve();
  }

  // Legacy aliases for backward compatibility
  static timNguoiDungTheoMaso(maso) {
    return this.findUserByMaso(maso);
  }

  static timNguoiDungTheoEmail(email) {
    return this.findUserByEmail(email);
  }

  static capNhatThongTinDangNhap(userId, ip) {
    return this.updateLoginInfo(userId, ip);
  }

  static soSanhMatKhau(plain, hashed) {
    return this.comparePassword(plain, hashed);
  }

  static bamMatKhau(plain) {
    return this.hashPassword(plain);
  }
}

module.exports = AuthService;
