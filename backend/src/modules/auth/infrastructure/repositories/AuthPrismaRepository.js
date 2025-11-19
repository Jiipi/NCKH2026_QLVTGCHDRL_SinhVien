const IAuthRepository = require('../../domain/interfaces/IAuthRepository');
const { prisma } = require('../../../../infrastructure/prisma/client');

/**
 * AuthPrismaRepository
 * Prisma implementation of IAuthRepository
 * Follows Dependency Inversion Principle (DIP)
 */
class AuthPrismaRepository extends IAuthRepository {
  async findByEmailOrMaso(emailOrMaso) {
    return prisma.nguoiDung.findFirst({
      where: {
        OR: [
          { email: emailOrMaso },
          { ten_dn: emailOrMaso }
        ]
      },
      include: {
        vai_tro: true
      }
    });
  }

  async findUserByMaso(maso) {
    return prisma.nguoiDung.findUnique({
      where: { ten_dn: maso }
    });
  }

  async findUserByEmail(email) {
    return prisma.nguoiDung.findUnique({
      where: { email }
    });
  }

  async findUserById(id) {
    return prisma.nguoiDung.findUnique({
      where: { id },
      include: { vai_tro: true }
    });
  }

  async createUser(userData) {
    return prisma.nguoiDung.create({
      data: userData,
      include: {
        vai_tro: true
      }
    });
  }

  async updateUser(id, updateData) {
    return prisma.nguoiDung.update({
      where: { id },
      data: updateData,
      include: { vai_tro: true }
    });
  }

  async findRoleByName(roleName) {
    return prisma.vaiTro.findFirst({
      where: { ten_vt: roleName }
    });
  }

  async createRole(roleData) {
    return prisma.vaiTro.create({
      data: roleData
    });
  }

  async createStudent(studentData) {
    return prisma.sinhVien.create({
      data: studentData
    });
  }

  async countUsers() {
    return prisma.nguoiDung.count();
  }
}

module.exports = AuthPrismaRepository;

