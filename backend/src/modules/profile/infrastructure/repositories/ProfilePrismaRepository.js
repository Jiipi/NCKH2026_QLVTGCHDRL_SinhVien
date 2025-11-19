const { prisma } = require('../../../../infrastructure/prisma/client');
const IProfileRepository = require('../../domain/interfaces/IProfileRepository');

/**
 * ProfilePrismaRepository
 * Prisma implementation of IProfileRepository
 * Follows Dependency Inversion Principle (DIP)
 */
class ProfilePrismaRepository extends IProfileRepository {
  async findUserById(userId) {
    return await prisma.nguoiDung.findUnique({
      where: { id: userId },
      include: {
        vai_tro: {
          select: {
            id: true,
            ten_vt: true,
            mo_ta: true,
            quyen_han: true
          }
        },
        sinh_vien: {
          include: {
            lop: true
          }
        }
      }
    });
  }

  async updateUser(userId, data) {
    return await prisma.nguoiDung.update({
      where: { id: userId },
      data,
      include: {
        vai_tro: {
          select: {
            id: true,
            ten_vt: true,
            mo_ta: true
          }
        },
        sinh_vien: {
          include: {
            lop: true
          }
        }
      }
    });
  }

  async findByEmail(email, excludeUserId = null) {
    const where = { email };
    if (excludeUserId) {
      where.id = { not: excludeUserId };
    }
    return await prisma.nguoiDung.findFirst({ where });
  }

  async updatePassword(userId, hashedPassword) {
    return await prisma.nguoiDung.update({
      where: { id: userId },
      data: { mat_khau: hashedPassword }
    });
  }

  async findStudentWithMonitorInfo(userId) {
    return await prisma.sinhVien.findUnique({
      where: { nguoi_dung_id: userId },
      include: {
        lop_lop_truongTosinhVien: true
      }
    });
  }

  async findClassWithMonitor(lopId) {
    return await prisma.lop.findUnique({
      where: { id: lopId },
      include: {
        sinh_viens: {
          where: {
            id: {
              equals: prisma.lop.fields.lop_truong
            }
          },
          include: {
            nguoi_dung: {
              select: {
                ho_ten: true
              }
            }
          },
          take: 1
        }
      }
    });
  }
}

module.exports = ProfilePrismaRepository;

