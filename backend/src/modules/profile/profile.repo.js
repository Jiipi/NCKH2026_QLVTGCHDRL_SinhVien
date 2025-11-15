/**
 * Profile Repository - Pure Data Access Layer
 * Handles all database operations for user profiles
 */

const { prisma } = require('../../infrastructure/prisma/client');

class ProfileRepository {
  /**
   * Find user by ID with profile information
   */
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

  /**
   * Update user profile
   */
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
            lop: true // khoa is a scalar field in Lop model, not a relation
          }
        }
      }
    });
  }

  /**
   * Find user by email (for checking duplicates)
   */
  async findByEmail(email, excludeUserId = null) {
    const where = { email };
    
    if (excludeUserId) {
      where.id = { not: excludeUserId };
    }

    return await prisma.nguoiDung.findFirst({ where });
  }

  /**
   * Update password
   */
  async updatePassword(userId, hashedPassword) {
    return await prisma.nguoiDung.update({
      where: { id: userId },
      data: { mat_khau: hashedPassword }
    });
  }

  /**
   * Check if user is class monitor
   */
  async findStudentWithMonitorInfo(userId) {
    return await prisma.sinhVien.findUnique({
      where: { nguoi_dung_id: userId },
      include: {
        lop_lop_truongTosinhVien: true // khoa is a scalar field, not a relation
      }
    });
  }

  /**
   * Find class with monitor information
   */
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

module.exports = new ProfileRepository();





