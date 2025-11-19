/**
 * AdminUser Entity
 * Domain entity representing a user in the system
 * Pure business object, no framework dependencies
 */
class AdminUser {
  constructor(id, tenDn, hoTen, email, passwordHash, vaiTroId, trangThai, ngayTao, sinhVien = null) {
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

  static create(tenDn, hoTen, email, passwordHash, vaiTroId, trangThai = 'hoat_dong') {
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

  updateProfile(data) {
    if (data.hoTen) this.hoTen = data.hoTen;
    if (data.email) this.email = data.email;
    if (data.tenDn) this.tenDn = data.tenDn;
    if (data.passwordHash) this.passwordHash = data.passwordHash;
    if (data.vaiTroId) this.vaiTroId = data.vaiTroId;
    if (data.trangThai) this.trangThai = data.trangThai;
  }

  isActive() {
    return this.trangThai === 'hoat_dong';
  }

  canBeDeleted(deletingUserId) {
    return this.id !== deletingUserId;
  }
}

module.exports = AdminUser;

