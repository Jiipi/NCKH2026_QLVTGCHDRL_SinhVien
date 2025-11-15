/**
 * Test Helpers
 * Common utilities for testing
 */

const { prisma } = require('../../src/config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Create test user
 */
async function createTestUser(data = {}) {
  const defaultData = {
    ten_dn: `test_${Date.now()}`,
    ho_ten: 'Test User',
    email: `test_${Date.now()}@test.com`,
    mat_khau: await bcrypt.hash('password123', 10),
    trang_thai: 'hoat_dong',
  };

  // Get or create SINH_VIEN role
  let role = await prisma.vaiTro.findFirst({
    where: { ten_vt: 'SINH_VIEN' }
  });

  if (!role) {
    role = await prisma.vaiTro.create({
      data: { ten_vt: 'SINH_VIEN', mo_ta: 'Sinh viên' }
    });
  }

  const userData = {
    ...defaultData,
    ...data,
    vai_tro_id: data.vai_tro_id || role.id,
  };

  return await prisma.nguoiDung.create({
    data: userData,
    include: {
      vai_tro: true,
      sinh_vien: true,
    }
  });
}

/**
 * Create test admin user
 */
async function createTestAdmin(data = {}) {
  // Get or create ADMIN role
  let role = await prisma.vaiTro.findFirst({
    where: { ten_vt: 'ADMIN' }
  });

  if (!role) {
    role = await prisma.vaiTro.create({
      data: { ten_vt: 'ADMIN', mo_ta: 'Quản trị viên' }
    });
  }

  return await createTestUser({
    ...data,
    vai_tro_id: role.id,
  });
}

/**
 * Create test student with sinh_vien record
 */
async function createTestStudent(data = {}) {
  const user = await createTestUser(data);

  // Get or create default class
  let lop = await prisma.lop.findFirst({
    where: { ten_lop: 'Test Class' }
  });

  if (!lop) {
    const admin = await createTestAdmin();
    lop = await prisma.lop.create({
      data: {
        ten_lop: 'Test Class',
        khoa: 'Công nghệ thông tin',
        nien_khoa: '2024-2025',
        nam_nhap_hoc: new Date(),
        chu_nhiem: admin.id,
      }
    });
  }

  const sinhVien = await prisma.sinhVien.create({
    data: {
      nguoi_dung_id: user.id,
      mssv: data.mssv || user.ten_dn,
      ngay_sinh: data.ngay_sinh || new Date('2000-01-01'),
      gt: data.gt || 'nam',
      lop_id: data.lop_id || lop.id,
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
        include: {
          lop: true
        }
      }
    }
  });
}

/**
 * Generate JWT token for testing
 */
function generateTestToken(user) {
  const payload = {
    id: user.id,
    ten_dn: user.ten_dn,
    email: user.email,
    role: user.vai_tro?.ten_vt || 'SINH_VIEN',
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'test-secret', {
    expiresIn: '1h'
  });
}

/**
 * Clean up test data
 */
async function cleanupTestData() {
  // Delete in correct order to avoid foreign key constraints
  await prisma.diemDanh.deleteMany({
    where: {
      sinh_vien: {
        nguoi_dung: {
          ten_dn: {
            startsWith: 'test_'
          }
        }
      }
    }
  });

  await prisma.dangKyHoatDong.deleteMany({
    where: {
      sv: {
        nguoi_dung: {
          ten_dn: {
            startsWith: 'test_'
          }
        }
      }
    }
  });

  await prisma.thongBao.deleteMany({
    where: {
      OR: [
        {
          nguoi_gui: {
            ten_dn: {
              startsWith: 'test_'
            }
          }
        },
        {
          nguoi_nhan: {
            ten_dn: {
              startsWith: 'test_'
            }
          }
        }
      ]
    }
  });

  await prisma.sinhVien.deleteMany({
    where: {
      nguoi_dung: {
        ten_dn: {
          startsWith: 'test_'
        }
      }
    }
  });

  await prisma.nguoiDung.deleteMany({
    where: {
      ten_dn: {
        startsWith: 'test_'
      }
    }
  });

  await prisma.hoatDong.deleteMany({
    where: {
      ten_hd: {
        startsWith: 'Test '
      }
    }
  });

  await prisma.lop.deleteMany({
    where: {
      ten_lop: {
        startsWith: 'Test '
      }
    }
  });
}

/**
 * Create test activity
 */
async function createTestActivity(data = {}) {
  const admin = await createTestAdmin();
  
  let loaiHD = await prisma.loaiHoatDong.findFirst();
  if (!loaiHD) {
    loaiHD = await prisma.loaiHoatDong.create({
      data: {
        ten_loai_hd: 'Test Activity Type',
        mo_ta: 'Test description',
        diem_rl_toi_da: 10,
      }
    });
  }

  const defaultData = {
    ten_hd: `Test Activity ${Date.now()}`,
    mo_ta: 'Test activity description',
    dia_diem: 'Test Location',
    ngay_bd: new Date(),
    ngay_kt: new Date(Date.now() + 86400000), // +1 day
    han_dk: new Date(Date.now() + 43200000), // +12 hours
    diem_rl: 5,
    so_luong_toi_da: 100,
    loai_hd_id: loaiHD.id,
    nguoi_tao_id: admin.id,
    hoc_ky: 'hoc_ky_1',
    nam_hoc: '2024-2025',
    trang_thai: 'dang_mo',
  };

  return await prisma.hoatDong.create({
    data: {
      ...defaultData,
      ...data,
    },
    include: {
      loai_hd: true,
      nguoi_tao: true,
    }
  });
}

/**
 * Wait for async operations
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  createTestUser,
  createTestAdmin,
  createTestStudent,
  generateTestToken,
  cleanupTestData,
  createTestActivity,
  wait,
};

