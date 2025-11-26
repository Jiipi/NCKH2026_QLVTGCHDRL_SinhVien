/**
 * Auth Test Helpers
 * Helpers for authentication testing
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { prisma } = require('../../src/data/infrastructure/prisma/client');

// Generate unique suffix for test data
const uniqueId = () => crypto.randomBytes(4).toString('hex');

// Use the same JWT secret as the server
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Generate JWT token for testing
 * @param {Object} user - User object
 * @param {Object} options - Token options
 */
function generateToken(user, options = {}) {
  const payload = {
    sub: user.id,
    id: user.id,
    ten_dn: user.ten_dn,
    email: user.email,
    role: user.vai_tro?.ten_vt || options.role || 'SINH_VIEN',
    sinh_vien_id: user.sinh_vien?.id,
    lop_id: user.sinh_vien?.lop_id,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: options.expiresIn || '1h'
  });
}

/**
 * Generate expired token for testing
 */
function generateExpiredToken(user) {
  return generateToken(user, { expiresIn: '-1h' });
}

/**
 * Generate invalid token
 */
function generateInvalidToken() {
  return 'invalid.jwt.token.here';
}

/**
 * Create test user with role
 * @param {Object} data - User data
 * @param {string} roleName - Role name (ADMIN, GIANG_VIEN, SINH_VIEN, LOP_TRUONG)
 */
async function createUserWithRole(data = {}, roleName = 'SINH_VIEN') {
  // Get or create role
  let role = await prisma.vaiTro.findFirst({
    where: { ten_vt: roleName }
  });

  if (!role) {
    role = await prisma.vaiTro.create({
      data: { 
        ten_vt: roleName, 
        mo_ta: `Vai trò ${roleName}` 
      }
    });
  }

  const uid = uniqueId();
  const hashedPassword = await bcrypt.hash(data.mat_khau || 'TestPassword123!', 10);

  // Always generate unique values even if data is provided (to avoid conflicts)
  const userData = {
    ten_dn: data.ten_dn ? `${data.ten_dn}_${uid}` : `test_user_${uid}`,
    ho_ten: data.ho_ten || 'Test User',
    email: data.email ? `${uid}_${data.email}` : `test_${uid}@dlu.edu.vn`,
    mat_khau: hashedPassword,
    trang_thai: data.trang_thai || 'hoat_dong',
    vai_tro_id: role.id,
  };

  const user = await prisma.nguoiDung.create({
    data: userData,
    include: {
      vai_tro: true,
    }
  });

  return user;
}

/**
 * Create student user with SinhVien record
 */
async function createStudentUser(data = {}) {
  const uid = uniqueId();
  const user = await createUserWithRole(data, 'SINH_VIEN');
  
  // Get or create test class - use a unique test class name
  const testClassName = `TestLop_${uid}`;
  let lop = await prisma.lop.findFirst({
    where: { ten_lop: { startsWith: 'TestLop_' } }
  });

  if (!lop) {
    // Find existing teacher/admin for chu_nhiem
    let teacher = await prisma.nguoiDung.findFirst({
      where: { vai_tro: { ten_vt: { in: ['GIANG_VIEN', 'ADMIN'] } } }
    });

    if (!teacher) {
      // Create a teacher without going through createUserWithRole to avoid recursion
      let teacherRole = await prisma.vaiTro.findFirst({ where: { ten_vt: 'GIANG_VIEN' } });
      if (!teacherRole) {
        teacherRole = await prisma.vaiTro.create({
          data: { ten_vt: 'GIANG_VIEN', mo_ta: 'Giảng viên' }
        });
      }
      const hashedPwd = await bcrypt.hash('TestPassword123!', 10);
      teacher = await prisma.nguoiDung.create({
        data: {
          ten_dn: `test_gv_${uid}`,
          ho_ten: 'Giảng viên Test',
          email: `test_gv_${uid}@dlu.edu.vn`,
          mat_khau: hashedPwd,
          trang_thai: 'hoat_dong',
          vai_tro_id: teacherRole.id,
        }
      });
    }

    lop = await prisma.lop.create({
      data: {
        ten_lop: testClassName,
        khoa: data.khoa || 'Công nghệ thông tin',
        nien_khoa: '2024-2025',
        nam_nhap_hoc: new Date('2024-09-01'),
        chu_nhiem: teacher.id,
      }
    });
  }

  const sinhVien = await prisma.sinhVien.create({
    data: {
      nguoi_dung_id: user.id,
      mssv: data.mssv ? `${data.mssv.slice(0, 4)}${uid.slice(0, 6)}` : `SV${uid.slice(0, 7)}`, // Max 10 chars, unique
      ngay_sinh: data.ngay_sinh || new Date('2003-01-15'),
      gt: data.gt || 'nam',
      lop_id: lop.id,
      dia_chi: data.dia_chi || null,
      sdt: data.sdt || null,
      email: user.email,
    }
  });

  return await prisma.nguoiDung.findUnique({
    where: { id: user.id },
    include: {
      vai_tro: true,
      sinh_vien: {
        include: { lop: true }
      }
    }
  });
}

/**
 * Create teacher user
 */
async function createTeacherUser(data = {}) {
  return await createUserWithRole({
    ...data,
    ten_dn: data.ten_dn || `gv_${Date.now()}`,
    ho_ten: data.ho_ten || 'Giảng viên Test',
  }, 'GIANG_VIEN');
}

/**
 * Create admin user
 */
async function createAdminUser(data = {}) {
  return await createUserWithRole({
    ...data,
    ten_dn: data.ten_dn || `admin_${Date.now()}`,
    ho_ten: data.ho_ten || 'Admin Test',
  }, 'ADMIN');
}

/**
 * Create monitor (lớp trưởng) user
 */
async function createMonitorUser(data = {}) {
  const student = await createStudentUser(data);
  
  // Set as class monitor
  await prisma.lop.update({
    where: { id: student.sinh_vien.lop_id },
    data: { lop_truong: student.sinh_vien.id }
  });

  // Update role to LOP_TRUONG
  let lopTruongRole = await prisma.vaiTro.findFirst({
    where: { ten_vt: 'LOP_TRUONG' }
  });

  if (!lopTruongRole) {
    lopTruongRole = await prisma.vaiTro.create({
      data: { ten_vt: 'LOP_TRUONG', mo_ta: 'Lớp trưởng' }
    });
  }

  await prisma.nguoiDung.update({
    where: { id: student.id },
    data: { vai_tro_id: lopTruongRole.id }
  });

  return await prisma.nguoiDung.findUnique({
    where: { id: student.id },
    include: {
      vai_tro: true,
      sinh_vien: {
        include: { lop: true }
      }
    }
  });
}

/**
 * Create locked/disabled user
 */
async function createLockedUser(data = {}) {
  return await createUserWithRole({
    ...data,
    trang_thai: 'khoa', // TrangThaiTaiKhoan enum: hoat_dong, khong_hoat_dong, khoa
  }, 'SINH_VIEN');
}

/**
 * Verify password matches hash
 */
async function verifyPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Hash password
 */
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

module.exports = {
  generateToken,
  generateExpiredToken,
  generateInvalidToken,
  createUserWithRole,
  createStudentUser,
  createTeacherUser,
  createAdminUser,
  createMonitorUser,
  createLockedUser,
  verifyPassword,
  hashPassword,
  JWT_SECRET,
};
