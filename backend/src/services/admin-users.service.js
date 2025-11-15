const { prisma } = require('../infrastructure/prisma/client');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const { logInfo, logError } = require('../core/logger');
const { validatePaginationParams, createQueryOptions, createPaginationResponse } = require('../core/utils/pagination');

/**
 * Admin Users Service
 * Admin-specific user management operations
 */

// Validation Schemas
const createUserSchema = z.object({
  maso: z.string().min(1, 'Mã số không được để trống'),
  hoten: z.string().min(1, 'Họ tên không được để trống'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  role: z.string(),
  // Student-specific fields
  mssv: z.string().optional(),
  lop_id: z.string().optional(),
  ngay_sinh: z.string().optional(),
  gt: z.enum(['nam', 'nu', 'khac']).optional(),
  dia_chi: z.string().optional(),
  sdt: z.string().optional(),
  set_lop_truong: z.boolean().optional()
});

const updateUserSchema = z.object({
  hoten: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.string().optional()
});

class AdminUsersService {
  /**
   * Get paginated users list with filters (Admin)
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=20] - Items per page
   * @param {string} [params.search] - Search term
   * @param {string} [params.role] - Filter by role
   * @returns {Promise<Object>} Paginated users list
   */
  async getUsersAdmin(params) {
    const paginationParams = validatePaginationParams(params, {
      defaultPage: 1,
      defaultLimit: 20,
      maxLimit: 100
    });

    const { search, role } = params;
    const whereCondition = {};

    // Search by name, email, or username
    if (search) {
      whereCondition.OR = [
        { ho_ten: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { ten_dn: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Filter by role
    if (role) {
      const vaiTro = await prisma.vaiTro.findFirst({
        where: { ten_vt: role }
      });
      if (vaiTro) {
        whereCondition.vai_tro_id = vaiTro.id;
      }
    }

    const queryOptions = createQueryOptions(paginationParams, { ngay_tao: 'desc' });

    const [users, total] = await Promise.all([
      prisma.nguoiDung.findMany({
        where: whereCondition,
        include: {
          vai_tro: true,
          sinh_vien: {
            include: {
              lop: true
            }
          },
          _count: { select: { lops_chu_nhiem: true, hoat_dong_tao: true } }
        },
        ...queryOptions
      }),
      prisma.nguoiDung.count({ where: whereCondition })
    ]);

    // Transform data to match frontend expectations
    const transformedUsers = users.map(user => ({
      id: user.id,
      maso: user.ten_dn,
      hoten: user.ho_ten,
      email: user.email,
      ten_dn: user.ten_dn,
      ho_ten: user.ho_ten,
      anh_dai_dien: user.anh_dai_dien,
      vai_tro_id: user.vai_tro_id,
      vai_tro: user.vai_tro ? { id: user.vai_tro.id, ten_vt: user.vai_tro.ten_vt } : null,
      role: user.vai_tro?.ten_vt || 'Sinh viên',
      lop: user.sinh_vien?.lop?.ten_lop || '',
      khoa: user.sinh_vien?.lop?.khoa || '',
      sdt: user.sinh_vien?.sdt || '',
      so_lop_cn: user._count?.lops_chu_nhiem || 0,
      so_hd_tao: user._count?.hoat_dong_tao || 0,
      quyen_count: Array.isArray(user.vai_tro?.quyen_han) ? user.vai_tro.quyen_han.length : 0,
      trang_thai: user.trang_thai,
      ngay_tao: user.ngay_tao,
      sinh_vien: user.sinh_vien ? {
        mssv: user.sinh_vien.mssv,
        ngay_sinh: user.sinh_vien.ngay_sinh,
        gt: user.sinh_vien.gt,
        dia_chi: user.sinh_vien.dia_chi,
        sdt: user.sinh_vien.sdt,
        email: user.sinh_vien.email,
        nguoi_dung: {
          ho_ten: user.ho_ten,
          email: user.email,
          anh_dai_dien: user.anh_dai_dien
        },
        lop: user.sinh_vien.lop ? {
          ten_lop: user.sinh_vien.lop.ten_lop,
          khoa: user.sinh_vien.lop.khoa,
          nien_khoa: user.sinh_vien.lop.nien_khoa
        } : null
      } : null
    }));

    return {
      users: transformedUsers,
      pagination: createPaginationResponse({
        page: paginationParams.page,
        limit: paginationParams.limit,
        total,
        maxLimit: 100
      })
    };
  }

  /**
   * Create new user (Admin)
   * @param {Object} data - User data
   * @param {number} adminId - Admin ID creating the user
   * @returns {Promise<Object>} Created user
   */
  async createUserAdmin(data, adminId) {
    const validatedData = createUserSchema.parse(data);

    const roleAliases = {
      'Admin': 'ADMIN', 'ADMIN': 'ADMIN',
      'Giảng viên': 'GIẢNG_VIÊN', 'GIẢNG_VIÊN': 'GIẢNG_VIÊN',
      'Lớp trưởng': 'LỚP_TRƯỞNG', 'LỚP_TRƯỞNG': 'LỚP_TRƯỞNG',
      'Sinh viên': 'SINH_VIÊN', 'SINH_VIÊN': 'SINH_VIÊN'
    };
    const normalizedRole = roleAliases[validatedData.role] || validatedData.role;

    // Check if user already exists
    const existingUser = await prisma.nguoiDung.findFirst({
      where: {
        OR: [
          { ten_dn: validatedData.maso },
          { email: validatedData.email }
        ]
      }
    });

    if (existingUser) {
      throw new Error('Mã số hoặc email đã tồn tại');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Get or create role
    let vaiTro = await prisma.vaiTro.findFirst({
      where: { ten_vt: normalizedRole }
    });

    if (!vaiTro) {
      vaiTro = await prisma.vaiTro.create({
        data: {
          ten_vt: normalizedRole,
          mo_ta: `Vai trò ${normalizedRole}`
        }
      });
    }

    // Create user (and possibly student) in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.nguoiDung.create({
        data: {
          ten_dn: validatedData.maso,
          mat_khau: hashedPassword,
          email: validatedData.email,
          ho_ten: validatedData.hoten,
          vai_tro_id: vaiTro.id,
          trang_thai: 'hoat_dong'
        }
      });

      let newStudent = null;
      if (normalizedRole === 'SINH_VIÊN' || normalizedRole === 'LỚP_TRƯỞNG') {
        if (!validatedData.mssv || !validatedData.lop_id) {
          throw new Error('Thiếu mssv hoặc lop_id cho vai trò sinh viên');
        }

        const ngaySinh = validatedData.ngay_sinh ? new Date(validatedData.ngay_sinh) : new Date();
        newStudent = await tx.sinhVien.create({
          data: {
            nguoi_dung_id: newUser.id,
            mssv: String(validatedData.mssv),
            ngay_sinh: ngaySinh,
            gt: validatedData.gt || 'nam',
            lop_id: String(validatedData.lop_id),
            dia_chi: validatedData.dia_chi || null,
            sdt: validatedData.sdt || null,
            email: validatedData.email
          }
        });

        if (normalizedRole === 'LỚP_TRƯỞNG' || validatedData.set_lop_truong) {
          await tx.lop.update({
            where: { id: String(validatedData.lop_id) },
            data: { lop_truong: newStudent.id }
          });
        }
      }

      return { newUser, newStudent };
    });

    logInfo('User created successfully', {
      adminId,
      newUserId: result.newUser.id,
      userMaso: validatedData.maso,
      role: normalizedRole,
      studentId: result.newStudent?.id || null
    });

    // Re-fetch with role for response
    const userWithRole = await prisma.nguoiDung.findUnique({
      where: { id: result.newUser.id },
      include: { vai_tro: true, sinh_vien: true }
    });

    return {
      id: userWithRole.id,
      maso: userWithRole.ten_dn,
      hoten: userWithRole.ho_ten,
      email: userWithRole.email,
      role: userWithRole.vai_tro.ten_vt,
      sinh_vien: userWithRole.sinh_vien || null
    };
  }

  /**
   * Update user (Admin)
   * @param {string} id - User ID
   * @param {Object} data - Update data
   * @param {number} adminId - Admin ID updating the user
   * @returns {Promise<Object>} Updated user
   */
  async updateUserAdmin(id, data, adminId) {
    const validatedData = updateUserSchema.parse(data);

    const existingUser = await prisma.nguoiDung.findUnique({
      where: { id },
      include: { vai_tro: true }
    });

    if (!existingUser) {
      throw new Error('Không tìm thấy người dùng');
    }

    const updateData = {};

    if (validatedData.hoten) updateData.ho_ten = validatedData.hoten;
    if (validatedData.email) updateData.email = validatedData.email;

    if (validatedData.password) {
      updateData.mat_khau = await bcrypt.hash(validatedData.password, 10);
    }

    if (validatedData.role && validatedData.role !== existingUser.vai_tro.ten_vt) {
      let vaiTro = await prisma.vaiTro.findFirst({
        where: { ten_vt: validatedData.role }
      });

      if (!vaiTro) {
        vaiTro = await prisma.vaiTro.create({
          data: {
            ten_vt: validatedData.role,
            mo_ta: `Vai trò ${validatedData.role}`
          }
        });
      }
      updateData.vai_tro_id = vaiTro.id;
    }

    const updatedUser = await prisma.nguoiDung.update({
      where: { id },
      data: updateData,
      include: { vai_tro: true }
    });

    logInfo('User updated successfully', {
      adminId,
      updatedUserId: id,
      changes: Object.keys(updateData)
    });

    return {
      id: updatedUser.id,
      maso: updatedUser.ten_dn,
      hoten: updatedUser.ho_ten,
      email: updatedUser.email,
      role: updatedUser.vai_tro.ten_vt
    };
  }

  /**
   * Delete user completely from system (Admin)
   * @param {string} id - User ID
   * @param {number} adminId - Admin ID deleting the user
   * @returns {Promise<void>}
   */
  async deleteUserAdmin(id, adminId) {
    const existingUser = await prisma.nguoiDung.findUnique({
      where: { id },
      include: {
        vai_tro: true,
        sinh_vien: true
      }
    });

    if (!existingUser) {
      throw new Error('Không tìm thấy người dùng');
    }

    // Don't allow deleting own account
    if (existingUser.id === String(adminId)) {
      throw new Error('Không thể xóa tài khoản của chính mình');
    }

    // Delete all related data in transaction
    await prisma.$transaction(async (tx) => {
      const sinhVienId = existingUser.sinh_vien?.id;

      // 1. Delete student registrations
      if (sinhVienId) {
        await tx.dangKyHoatDong.deleteMany({
          where: { sv_id: sinhVienId }
        });

        // 2. Delete attendance records
        await tx.diemDanh.deleteMany({
          where: { sv_id: sinhVienId }
        });
      }

      // 3. Delete notifications
      await tx.thongBao.deleteMany({
        where: {
          OR: [
            { nguoi_gui_id: id },
            { nguoi_nhan_id: id }
          ]
        }
      });

      // 4. Update class monitor
      if (sinhVienId) {
        await tx.lop.updateMany({
          where: { lop_truong: sinhVienId },
          data: { lop_truong: null }
        });
      }

      // 5. Handle head teacher classes
      const classesAsHeadTeacher = await tx.lop.findMany({
        where: { chu_nhiem: id },
        select: { id: true, ten_lop: true }
      });

      if (classesAsHeadTeacher.length > 0) {
        const replacementTeacher = await tx.nguoiDung.findFirst({
          where: {
            vai_tro: {
              ten_vt: { in: ['ADMIN', 'Admin', 'GIẢNG_VIÊN', 'Giảng viên'] }
            },
            id: { not: id },
            trang_thai: 'hoat_dong'
          },
          select: { id: true, ho_ten: true }
        });

        if (replacementTeacher) {
          await tx.lop.updateMany({
            where: { chu_nhiem: id },
            data: { chu_nhiem: replacementTeacher.id }
          });
          logInfo('Transferred class head teacher', {
            from: id,
            to: replacementTeacher.id,
            classCount: classesAsHeadTeacher.length
          });
        } else {
          throw new Error(
            `Không thể xóa user vì đang là chủ nhiệm ${classesAsHeadTeacher.length} lớp ` +
            `(${classesAsHeadTeacher.map(c => c.ten_lop).join(', ')}) ` +
            `và không có giảng viên khác để thay thế. Vui lòng chuyển chủ nhiệm trước khi xóa.`
          );
        }
      }

      // 6. Handle created activities
      const createdActivities = await tx.hoatDong.count({
        where: { nguoi_tao_id: id }
      });

      if (createdActivities > 0) {
        const otherAdmin = await tx.nguoiDung.findFirst({
          where: {
            vai_tro: {
              ten_vt: { in: ['ADMIN', 'Admin'] }
            },
            id: { not: id },
            trang_thai: 'hoat_dong'
          },
          select: { id: true }
        });

        if (otherAdmin) {
          await tx.hoatDong.updateMany({
            where: { nguoi_tao_id: id },
            data: { nguoi_tao_id: otherAdmin.id }
          });
        } else {
          await tx.hoatDong.deleteMany({
            where: { nguoi_tao_id: id }
          });
        }
      }

      // 7. Handle attendance checker records
      const attendanceRecordsByUser = await tx.diemDanh.count({
        where: { nguoi_diem_danh_id: id }
      });

      if (attendanceRecordsByUser > 0) {
        const replacementChecker = await tx.nguoiDung.findFirst({
          where: {
            vai_tro: {
              ten_vt: { in: ['ADMIN', 'Admin', 'GIẢNG_VIÊN', 'Giảng viên'] }
            },
            id: { not: id },
            trang_thai: 'hoat_dong'
          },
          select: { id: true }
        });

        if (replacementChecker) {
          await tx.diemDanh.updateMany({
            where: { nguoi_diem_danh_id: id },
            data: { nguoi_diem_danh_id: replacementChecker.id }
          });
        } else {
          await tx.diemDanh.deleteMany({
            where: { nguoi_diem_danh_id: id }
          });
          logInfo('Deleted attendance records with no replacement', {
            count: attendanceRecordsByUser
          });
        }
      }

      // 8. Delete student record
      if (sinhVienId) {
        await tx.sinhVien.delete({
          where: { id: sinhVienId }
        });
      }

      // 9. Finally, delete user
      await tx.nguoiDung.delete({
        where: { id }
      });
    });

    logInfo('User deleted completely from system', {
      adminId,
      deletedUserId: id,
      deletedUserMaso: existingUser.ten_dn,
      deletedUserRole: existingUser.vai_tro?.ten_vt,
      hadSinhVien: !!existingUser.sinh_vien
    });
  }

  /**
   * Get user by ID (Admin)
   * @param {string} id - User ID
   * @returns {Promise<Object>} User details
   */
  async getUserByIdAdmin(id) {
    const user = await prisma.nguoiDung.findUnique({
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

    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }

    return {
      id: user.id,
      ho_ten: user.ho_ten,
      email: user.email,
      ten_dn: user.ten_dn,
      vai_tro: user.vai_tro?.ten_vt || 'ADMIN',
      trang_thai: user.trang_thai,
      ngay_tao: user.ngay_tao,
      sinh_vien: user.sinh_vien ? {
        mssv: user.sinh_vien.mssv,
        ngay_sinh: user.sinh_vien.ngay_sinh,
        gt: user.sinh_vien.gt,
        dia_chi: user.sinh_vien.dia_chi,
        sdt: user.sinh_vien.sdt,
        email: user.sinh_vien.email,
        lop: user.sinh_vien.lop ? {
          ten_lop: user.sinh_vien.lop.ten_lop,
          khoa: user.sinh_vien.lop.khoa,
          nien_khoa: user.sinh_vien.lop.nien_khoa
        } : null
      } : null
    };
  }

  /**
   * Export users to CSV (Admin)
   * @param {Object} filters - Filter parameters
   * @returns {Promise<string>} CSV content
   */
  async exportUsersCSV(filters) {
    const { search, role, status } = filters;
    const whereCondition = {};

    if (search) {
      whereCondition.OR = [
        { ho_ten: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { ten_dn: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (role) {
      const vaiTro = await prisma.vaiTro.findFirst({ where: { ten_vt: role } });
      if (vaiTro) whereCondition.vai_tro_id = vaiTro.id;
    }

    if (status) whereCondition.trang_thai = status;

    const users = await prisma.nguoiDung.findMany({
      where: whereCondition,
      include: { vai_tro: true, sinh_vien: { include: { lop: true } } },
      orderBy: { ngay_tao: 'desc' }
    });

    const headers = ['Maso', 'HoTen', 'Email', 'VaiTro', 'TrangThai', 'Lop', 'Khoa', 'NgayTao'];
    const rows = users.map(u => [
      u.ten_dn,
      u.ho_ten || '',
      u.email,
      u.vai_tro?.ten_vt || '',
      u.trang_thai,
      u.sinh_vien?.lop?.ten_lop || '',
      u.sinh_vien?.lop?.khoa || '',
      (u.ngay_tao || '').toISOString?.() || ''
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(','))
    ].join('\n');

    return '\uFEFF' + csv; // UTF-8 BOM
  }
}

module.exports = new AdminUsersService();




