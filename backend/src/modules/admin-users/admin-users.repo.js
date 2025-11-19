const { prisma } = require('../../infrastructure/prisma/client');

const baseUserInclude = {
  vai_tro: true,
  sinh_vien: {
    include: {
      lop: true
    }
  },
  _count: {
    select: {
      lops_chu_nhiem: true,
      hoat_dong_tao: true
    }
  }
};

class AdminUsersRepository {
  constructor(db = prisma) {
    this.db = db;
  }

  async findUsers(where = {}, options = {}) {
    return this.db.nguoiDung.findMany({
      where,
      include: baseUserInclude,
      ...options
    });
  }

  async countUsers(where = {}) {
    return this.db.nguoiDung.count({ where });
  }

  async findRoleByName(roleName) {
    if (!roleName) return null;
    return this.db.vaiTro.findFirst({ where: { ten_vt: roleName } });
  }

  async createRole(roleName) {
    return this.db.vaiTro.create({
      data: {
        ten_vt: roleName,
        mo_ta: `Vai trò ${roleName}`
      }
    });
  }

  async findExistingUserByCredentials(maso, email) {
    const conditions = [];
    if (maso) conditions.push({ ten_dn: maso });
    if (email) conditions.push({ email });
    if (!conditions.length) return null;

    return this.db.nguoiDung.findFirst({
      where: { OR: conditions }
    });
  }

  async findUserByTenDn(maso) {
    if (!maso) return null;
    return this.db.nguoiDung.findFirst({ where: { ten_dn: maso } });
  }

  async findUserById(id, include = baseUserInclude) {
    return this.db.nguoiDung.findUnique({
      where: { id },
      include
    });
  }

  async createUser(data, tx = this.db) {
    return tx.nguoiDung.create({ data });
  }

  async createStudent(data, tx = this.db) {
    return tx.sinhVien.create({ data });
  }

  async updateClassMonitor(lopId, studentId, tx = this.db) {
    return tx.lop.update({
      where: { id: String(lopId) },
      data: { lop_truong: studentId }
    });
  }

  async updateUser(id, data) {
    return this.db.nguoiDung.update({
      where: { id },
      data,
      include: { vai_tro: true }
    });
  }

  async updateStudent(studentId, data) {
    return this.db.sinhVien.update({
      where: { id: studentId },
      data
    });
  }

  async upsertRole(roleName) {
    let role = await this.findRoleByName(roleName);
    if (!role) {
      role = await this.createRole(roleName);
    }
    return role;
  }

  async deleteStudentRegistrations(tx, studentId) {
    return tx.dangKyHoatDong.deleteMany({
      where: { sv_id: studentId }
    });
  }

  async deleteStudentAttendance(tx, studentId) {
    return tx.diemDanh.deleteMany({
      where: { sv_id: studentId }
    });
  }

  async deleteNotificationsByUser(tx, userId) {
    return tx.thongBao.deleteMany({
      where: {
        OR: [{ nguoi_gui_id: userId }, { nguoi_nhan_id: userId }]
      }
    });
  }

  async clearClassMonitorByStudent(tx, studentId) {
    return tx.lop.updateMany({
      where: { lop_truong: studentId },
      data: { lop_truong: null }
    });
  }

  async findClassesAsHeadTeacher(tx, userId) {
    return tx.lop.findMany({
      where: { chu_nhiem: userId },
      select: { id: true, ten_lop: true }
    });
  }

  async findReplacementTeacher(tx, excludedUserId) {
    return tx.nguoiDung.findFirst({
      where: {
        vai_tro: {
          ten_vt: { in: ['ADMIN', 'Admin', 'GIẢNG_VIÊN', 'Giảng viên'] }
        },
        id: { not: excludedUserId },
        trang_thai: 'hoat_dong'
      },
      select: { id: true, ho_ten: true }
    });
  }

  async updateHeadTeacherForClasses(tx, userId, replacementId) {
    return tx.lop.updateMany({
      where: { chu_nhiem: userId },
      data: { chu_nhiem: replacementId }
    });
  }

  async countActivitiesByCreator(tx, userId) {
    return tx.hoatDong.count({
      where: { nguoi_tao_id: userId }
    });
  }

  async findReplacementAdmin(tx, excludedUserId) {
    return tx.nguoiDung.findFirst({
      where: {
        vai_tro: { ten_vt: { in: ['ADMIN', 'Admin'] } },
        id: { not: excludedUserId },
        trang_thai: 'hoat_dong'
      },
      select: { id: true }
    });
  }

  async reassignActivities(tx, userId, replacementId) {
    return tx.hoatDong.updateMany({
      where: { nguoi_tao_id: userId },
      data: { nguoi_tao_id: replacementId }
    });
  }

  async deleteActivitiesByCreator(tx, userId) {
    return tx.hoatDong.deleteMany({
      where: { nguoi_tao_id: userId }
    });
  }

  async countAttendanceByChecker(tx, userId) {
    return tx.diemDanh.count({
      where: { nguoi_diem_danh_id: userId }
    });
  }

  async findReplacementChecker(tx, excludedUserId) {
    return tx.nguoiDung.findFirst({
      where: {
        vai_tro: {
          ten_vt: { in: ['ADMIN', 'Admin', 'GIẢNG_VIÊN', 'Giảng viên'] }
        },
        id: { not: excludedUserId },
        trang_thai: 'hoat_dong'
      },
      select: { id: true }
    });
  }

  async reassignAttendanceChecker(tx, userId, replacementId) {
    return tx.diemDanh.updateMany({
      where: { nguoi_diem_danh_id: userId },
      data: { nguoi_diem_danh_id: replacementId }
    });
  }

  async deleteAttendanceByChecker(tx, userId) {
    return tx.diemDanh.deleteMany({
      where: { nguoi_diem_danh_id: userId }
    });
  }

  async deleteStudent(tx, studentId) {
    return tx.sinhVien.delete({
      where: { id: studentId }
    });
  }

  async deleteUser(tx, userId) {
    return tx.nguoiDung.delete({
      where: { id: userId }
    });
  }

  async runInTransaction(callback) {
    return this.db.$transaction(callback);
  }
}

module.exports = new AdminUsersRepository();

