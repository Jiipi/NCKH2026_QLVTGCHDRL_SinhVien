const bcrypt = require('bcryptjs');
const { prisma } = require('../infrastructure/prisma/client');
const { normalizeRoleCode } = require('../core/utils/roleHelper');

class AuthModel {
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

  static toUserDTO(user) {
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

  static timNguoiDungTheoMaso(maso) {
    const identifier = String(maso || '').trim();
    return prisma.nguoiDung.findFirst({
      where: { ten_dn: { equals: identifier, mode: 'insensitive' } },
      include: this.includeForUser()
    });
  }

  static findUserByMaso(maso) {
    return this.timNguoiDungTheoMaso(maso);
  }

  static async timNguoiDungTheoEmail(email) {
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

  static async capNhatThongTinDangNhap(userId, ip) {
    await prisma.nguoiDung.update({
      where: { id: userId },
      data: {
        lan_cuoi_dn: new Date(),
        ngay_cap_nhat: new Date(),
      }
    });
  }

  static soSanhMatKhau(plain, hashed) {
    return bcrypt.compare(plain, hashed);
  }

  static bamMatKhau(plain) {
    return bcrypt.hash(plain, 10);
  }

  static async verifyPasswordAndUpgrade(user, plain) {
    const hashed = user?.mat_khau;
    if (!hashed) return false;
    try {
      if (typeof hashed === 'string' && hashed.startsWith('$2')) {
        return await bcrypt.compare(plain, hashed);
      }
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
}

module.exports = AuthModel;


