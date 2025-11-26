/**
 * Admin Users Repository - Pure Data Access Layer
 * This is a temporary stub - the actual implementation should be migrated from the old admin-users.repo.js
 */

const { prisma } = require('../../../../data/infrastructure/prisma/client');

// TODO: Migrate actual implementation from old admin-users.repo.js
// For now, this is a placeholder that implements the interface
const adminUsersRepository = {
  async findUsers(where, options) {
    // Include relations needed for mapping
    const include = {
      vai_tro: {
        select: {
          id: true,
          ten_vt: true,
          quyen_han: true
        }
      },
      sinh_vien: {
        include: {
          lop: {
            select: {
              ten_lop: true,
              khoa: true,
              nien_khoa: true
            }
          }
        }
      },
      _count: {
        select: {
          lops_chu_nhiem: true,
          hoat_dong_tao: true
        }
      }
    };

    // Merge include with options if options has include
    const finalOptions = {
      ...options,
      include: options?.include ? { ...include, ...options.include } : include
    };

    return prisma.nguoiDung.findMany({ where, ...finalOptions });
  },

  async countUsers(where) {
    return prisma.nguoiDung.count({ where });
  },

  async findUserById(id, include = {}) {
    return prisma.nguoiDung.findUnique({
      where: { id },
      include
    });
  },

  async findUserByTenDn(tenDn) {
    return prisma.nguoiDung.findFirst({
      where: { ten_dn: tenDn }
    });
  },

  async findExistingUserByCredentials(maso, email) {
    // Tìm trong bảng nguoiDung theo ten_dn (maso được dùng làm ten_dn) hoặc email
    // Lưu ý: mssv chỉ có trong bảng sinh_vien, không có trong nguoiDung
    return prisma.nguoiDung.findFirst({
      where: {
        OR: [
          { ten_dn: maso },
          { email }
        ]
      }
    });
  },

  async createUser(userData, tx = null) {
    const client = tx || prisma;
    return client.nguoiDung.create({ data: userData });
  },

  async updateUser(id, updateData) {
    return prisma.nguoiDung.update({
      where: { id },
      data: updateData
    });
  },

  async deleteUser(tx, id) {
    const client = tx || prisma;
    return client.nguoiDung.delete({ where: { id } });
  },

  async findRoleByName(roleName) {
    return prisma.vaiTro.findFirst({ where: { ten_vt: roleName } });
  },

  async upsertRole(roleName) {
    return prisma.vaiTro.upsert({
      where: { ten_vt: roleName },
      update: {},
      create: { ten_vt: roleName }
    });
  },

  async findStudentByMssv(mssv) {
    return prisma.sinhVien.findFirst({
      where: { mssv }
    });
  },

  async createStudent(studentData, tx) {
    const client = tx || prisma;
    return client.sinhVien.create({ data: studentData });
  },

  async updateStudent(studentId, updateData) {
    return prisma.sinhVien.update({
      where: { id: studentId },
      data: updateData
    });
  },

  async deleteStudent(tx, studentId) {
    const client = tx || prisma;
    return client.sinhVien.delete({ where: { id: studentId } });
  },

  async runInTransaction(callback) {
    return prisma.$transaction(callback);
  },

  async updateClassMonitor(lopId, studentId, tx) {
    const client = tx || prisma;
    return client.lop.update({
      where: { id: lopId },
      data: { lop_truong: studentId }
    });
  },

  async findClassesAsHeadTeacher(tx, userId) {
    const client = tx || prisma;
    return client.lop.findMany({ where: { chu_nhiem: userId } });
  },

  async findReplacementTeacher(tx, userId) {
    const client = tx || prisma;
    // Stub - implement actual logic
    return null;
  },

  async updateHeadTeacherForClasses(tx, userId, replacementId) {
    const client = tx || prisma;
    return client.lop.updateMany({
      where: { chu_nhiem: userId },
      data: { chu_nhiem: replacementId }
    });
  },

  async countActivitiesByCreator(tx, userId) {
    const client = tx || prisma;
    return client.hoatDong.count({ where: { nguoi_tao_id: userId } });
  },

  async findReplacementAdmin(tx, userId) {
    const client = tx || prisma;
    // Stub - implement actual logic
    return null;
  },

  async reassignActivities(tx, userId, adminId) {
    const client = tx || prisma;
    return client.hoatDong.updateMany({
      where: { nguoi_tao_id: userId },
      data: { nguoi_tao_id: adminId }
    });
  },

  async deleteActivitiesByCreator(tx, userId) {
    const client = tx || prisma;
    return client.hoatDong.deleteMany({ where: { nguoi_tao_id: userId } });
  },

  async countAttendanceByChecker(tx, userId) {
    const client = tx || prisma;
    return client.diemDanh.count({ where: { nguoi_diem_danh_id: userId } });
  },

  async findReplacementChecker(tx, userId) {
    const client = tx || prisma;
    // Stub - implement actual logic
    return null;
  },

  async reassignAttendanceChecker(tx, userId, checkerId) {
    const client = tx || prisma;
    return client.diemDanh.updateMany({
      where: { nguoi_diem_danh_id: userId },
      data: { nguoi_diem_danh_id: checkerId }
    });
  },

  async deleteAttendanceByChecker(tx, userId) {
    const client = tx || prisma;
    return client.diemDanh.deleteMany({ where: { nguoi_diem_danh_id: userId } });
  },

  async deleteStudentRegistrations(tx, studentId) {
    const client = tx || prisma;
    return client.dangKyHoatDong.deleteMany({ where: { sv_id: studentId } });
  },

  async deleteStudentAttendance(tx, studentId) {
    const client = tx || prisma;
    return client.diemDanh.deleteMany({ where: { sv_id: studentId } });
  },

  async deleteNotificationsByUser(tx, userId) {
    const client = tx || prisma;
    return client.thongBao.deleteMany({
      where: {
        OR: [
          { nguoi_gui_id: userId },
          { nguoi_nhan_id: userId }
        ]
      }
    });
  },

  async clearClassMonitorByStudent(tx, studentId) {
    const client = tx || prisma;
    return client.lop.updateMany({
      where: { lop_truong: studentId },
      data: { lop_truong: null }
    });
  }
};

module.exports = adminUsersRepository;

