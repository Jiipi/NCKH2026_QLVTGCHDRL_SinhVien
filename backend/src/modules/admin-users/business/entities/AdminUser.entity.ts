/**
 * AdminUser Entity
 * Domain entity representing a user in the system
 * Pure business object, no framework dependencies
 */

export type TrangThaiTaiKhoan = 'hoat_dong' | 'khong_hoat_dong' | 'khoa';

export interface SinhVienData {
  id: string;
  mssv: string;
  ngay_sinh?: Date;
  gt?: string;
  dia_chi?: string | null;
  sdt?: string | null;
  email?: string | null;
  lop_id?: string;
}

export interface AdminUserUpdateData {
  hoTen?: string;
  email?: string;
  tenDn?: string;
  passwordHash?: string;
  vaiTroId?: string;
  trangThai?: TrangThaiTaiKhoan;
}

class AdminUser {
  id: string | null;
  tenDn: string;
  hoTen: string;
  email: string;
  passwordHash: string;
  vaiTroId: string;
  trangThai: TrangThaiTaiKhoan;
  ngayTao: Date;
  sinhVien: SinhVienData | null;

  constructor(
    id: string | null,
    tenDn: string,
    hoTen: string,
    email: string,
    passwordHash: string,
    vaiTroId: string,
    trangThai: TrangThaiTaiKhoan,
    ngayTao: Date,
    sinhVien: SinhVienData | null = null
  ) {
    this.id = id;
    this.tenDn = tenDn;
    this.hoTen = hoTen;
    this.email = email;
    this.passwordHash = passwordHash;
    this.vaiTroId = vaiTroId;
    this.trangThai = trangThai;
    this.ngayTao = ngayTao;
    this.sinhVien = sinhVien;
  }

  static create(
    tenDn: string,
    hoTen: string,
    email: string,
    passwordHash: string,
    vaiTroId: string,
    trangThai: TrangThaiTaiKhoan = 'hoat_dong'
  ): AdminUser {
    return new AdminUser(
      null, // id will be set by repository
      tenDn,
      hoTen,
      email,
      passwordHash,
      vaiTroId,
      trangThai,
      new Date()
    );
  }

  updateProfile(data: AdminUserUpdateData): void {
    if (data.hoTen) this.hoTen = data.hoTen;
    if (data.email) this.email = data.email;
    if (data.tenDn) this.tenDn = data.tenDn;
    if (data.passwordHash) this.passwordHash = data.passwordHash;
    if (data.vaiTroId) this.vaiTroId = data.vaiTroId;
    if (data.trangThai) this.trangThai = data.trangThai;
  }

  isActive(): boolean {
    return this.trangThai === 'hoat_dong';
  }

  canBeDeleted(deletingUserId: string): boolean {
    return this.id !== deletingUserId;
  }
}

export default AdminUser;
module.exports = AdminUser;
