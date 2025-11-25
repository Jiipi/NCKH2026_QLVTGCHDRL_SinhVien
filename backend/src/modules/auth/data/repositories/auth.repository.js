/**
 * Auth Repository - Pure Data Access Layer
 * Chỉ chứa Prisma queries, không có business logic
 */

const { prisma } = require('../../../../data/infrastructure/prisma/client');

class AuthRepository {
  async findByEmailOrMaso(emailOrMaso) {
    return prisma.nguoiDung.findFirst({
      where: {
        OR: [
          { email: emailOrMaso },
          { ten_dn: emailOrMaso }
        ]
      },
      include: {
        vai_tro: true,
        sinh_vien: {
          include: {
            lop: true
          }
        }
      }
    });
  }

  async findUserByEmail(email) {
    return prisma.nguoiDung.findUnique({
      where: { email },
      include: {
        vai_tro: true,
        sinh_vien: {
          include: {
            lop: true
          }
        }
      }
    });
  }

  async findUserByMaso(maso) {
    return prisma.nguoiDung.findUnique({
      where: { ten_dn: maso },
      include: {
        vai_tro: true,
        sinh_vien: {
          include: {
            lop: true
          }
        }
      }
    });
  }

  async findStudentByMssv(mssv) {
    return prisma.sinhVien.findUnique({
      where: { mssv },
      include: {
        nguoi_dung: {
          include: {
            vai_tro: true
          }
        },
        lop: true
      }
    });
  }

  async findUserById(id) {
    return prisma.nguoiDung.findUnique({
      where: { id },
      include: {
        vai_tro: true,
        sinh_vien: {
          include: {
            lop: true
          }
        }
      }
    });
  }

  async createUser(userData) {
    return prisma.nguoiDung.create({
      data: userData,
      include: {
        vai_tro: true,
        sinh_vien: {
          include: {
            lop: true
          }
        }
      }
    });
  }

  async updateUser(userId, updateData) {
    return prisma.nguoiDung.update({
      where: { id: userId },
      data: updateData,
      include: {
        vai_tro: true,
        sinh_vien: {
          include: {
            lop: true
          }
        }
      }
    });
  }

  async createStudent(studentData) {
    return prisma.sinhVien.create({
      data: studentData,
      include: {
        nguoi_dung: {
          include: {
            vai_tro: true
          }
        },
        lop: true
      }
    });
  }

  async findRoleByName(roleName) {
    return prisma.vaiTro.findFirst({
      where: {
        ten_vt: {
          equals: roleName,
          mode: 'insensitive'
        }
      }
    });
  }

  async createRole(roleData) {
    return prisma.vaiTro.create({
      data: roleData
    });
  }

  async countUsers() {
    return prisma.nguoiDung.count();
  }
}

module.exports = new AuthRepository();

