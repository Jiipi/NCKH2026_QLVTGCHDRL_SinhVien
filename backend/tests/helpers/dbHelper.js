/**
 * Database Test Helpers
 * Helpers for database operations in tests
 */

const { prisma } = require('../../src/data/infrastructure/prisma/client');

/**
 * Cleanup all test data
 * Xóa dữ liệu test theo thứ tự tránh foreign key constraints
 */
async function cleanupTestData() {
  try {
    // Delete in reverse dependency order
    await prisma.diemDanh.deleteMany({
      where: {
        OR: [
          { sinh_vien: { nguoi_dung: { ten_dn: { startsWith: 'test_' } } } },
          { hoat_dong: { ten_hd: { startsWith: 'Test ' } } }
        ]
      }
    });

    await prisma.dangKyHoatDong.deleteMany({
      where: {
        OR: [
          { sinh_vien: { nguoi_dung: { ten_dn: { startsWith: 'test_' } } } },
          { hoat_dong: { ten_hd: { startsWith: 'Test ' } } }
        ]
      }
    });

    await prisma.thongBao.deleteMany({
      where: {
        OR: [
          { nguoi_gui: { ten_dn: { startsWith: 'test_' } } },
          { nguoi_nhan: { ten_dn: { startsWith: 'test_' } } }
        ]
      }
    });

    // Delete activities created by test users
    await prisma.hoatDong.deleteMany({
      where: {
        OR: [
          { ten_hd: { startsWith: 'Test ' } },
          { nguoi_tao: { ten_dn: { startsWith: 'test_' } } }
        ]
      }
    });

    // Delete sinh vien records FIRST (before classes update)
    await prisma.sinhVien.deleteMany({
      where: {
        OR: [
          { nguoi_dung: { ten_dn: { startsWith: 'test_' } } },
          { mssv: { startsWith: 'SV' } }
        ]
      }
    });

    // Reset lop_truong to null before deleting users - now includes TestLop_ classes
    await prisma.lop.updateMany({
      where: { 
        OR: [
          { ten_lop: { startsWith: 'Test ' } },
          { ten_lop: { startsWith: 'TestLop_' } }
        ]
      },
      data: { lop_truong: null, chu_nhiem: null }
    });

    // Delete test users
    await prisma.nguoiDung.deleteMany({
      where: {
        OR: [
          { ten_dn: { startsWith: 'test_' } },
          { ten_dn: { startsWith: 'admin_' } },
          { ten_dn: { startsWith: 'gv_' } },
          { email: { contains: '@dlu.edu.vn' } }
        ]
      }
    });

    // Delete test classes - now includes TestLop_ classes
    await prisma.lop.deleteMany({
      where: { 
        OR: [
          { ten_lop: { startsWith: 'Test ' } },
          { ten_lop: { startsWith: 'TestLop_' } }
        ]
      }
    });

    // Delete test activity types
    await prisma.loaiHoatDong.deleteMany({
      where: { ten_loai_hd: { startsWith: 'Test ' } }
    });

  } catch (error) {
    // Ignore errors during cleanup (tables may be empty)
    console.warn('Cleanup warning:', error.message);
  }
}

/**
 * Create test activity
 */
async function createTestActivity(data = {}, creatorId = null) {
  // Get or create activity type
  let loaiHD = await prisma.loaiHoatDong.findFirst({
    where: { ten_loai_hd: 'Test Activity Type' }
  });

  if (!loaiHD) {
    loaiHD = await prisma.loaiHoatDong.create({
      data: {
        ten_loai_hd: 'Test Activity Type',
        mo_ta: 'Test activity type description',
        diem_toi_da: 10,
      }
    });
  }

  // Get creator ID
  let nguoi_tao_id = creatorId;
  if (!nguoi_tao_id) {
    const admin = await prisma.nguoiDung.findFirst({
      where: { vai_tro: { ten_vt: 'ADMIN' } }
    });
    if (admin) {
      nguoi_tao_id = admin.id;
    }
  }

  const timestamp = Date.now();
  const defaultData = {
    ten_hd: `Test Activity ${timestamp}`,
    mo_ta: 'Test activity description',
    dia_diem: 'Test Location',
    ngay_bd: new Date(Date.now() + 86400000), // +1 day
    ngay_kt: new Date(Date.now() + 172800000), // +2 days
    han_dk: new Date(Date.now() + 43200000), // +12 hours
    diem_rl: 5,
    sl_toi_da: 100,
    loai_hd_id: loaiHD.id,
    nguoi_tao_id: nguoi_tao_id,
    hoc_ky: 'hoc_ky_1',
    nam_hoc: '2024-2025',
    trang_thai: 'da_duyet',
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
 * Create test registration
 */
async function createTestRegistration(studentId, activityId, data = {}) {
  return await prisma.dangKyHoatDong.create({
    data: {
      sv_id: studentId,
      hd_id: activityId,
      trang_thai_dk: data.trang_thai_dk || 'cho_duyet',
      ly_do_dk: data.ly_do_dk || 'Test registration',
      ngay_dang_ky: new Date(),
      ...data,
    },
    include: {
      sinh_vien: {
        include: { nguoi_dung: true }
      },
      hoat_dong: true,
    }
  });
}

/**
 * Create test attendance record
 */
async function createTestAttendance(studentId, activityId, data = {}) {
  return await prisma.diemDanh.create({
    data: {
      sv_id: studentId,
      hd_id: activityId,
      trang_thai: data.trang_thai || 'co_mat',
      thoi_gian_dd: data.thoi_gian_dd || new Date(),
      ...data,
    }
  });
}

/**
 * Create test notification
 */
async function createTestNotification(senderId, receiverId, data = {}) {
  return await prisma.thongBao.create({
    data: {
      nguoi_gui_id: senderId,
      nguoi_nhan_id: receiverId,
      tieu_de: data.tieu_de || 'Test notification',
      noi_dung: data.noi_dung || 'Test notification content',
      loai_tb: data.loai_tb || 'thong_bao',
      trang_thai: data.trang_thai || 'chua_doc',
      ...data,
    }
  });
}

/**
 * Get test user by username
 */
async function getTestUser(tenDn) {
  return await prisma.nguoiDung.findUnique({
    where: { ten_dn: tenDn },
    include: {
      vai_tro: true,
      sinh_vien: {
        include: { lop: true }
      }
    }
  });
}

/**
 * Update test user
 */
async function updateTestUser(userId, data) {
  return await prisma.nguoiDung.update({
    where: { id: userId },
    data,
    include: {
      vai_tro: true,
      sinh_vien: true,
    }
  });
}

/**
 * Count records in table
 */
async function countRecords(tableName, where = {}) {
  return await prisma[tableName].count({ where });
}

/**
 * Seed basic test data
 */
async function seedTestData() {
  // Create roles if not exist
  const roles = ['ADMIN', 'GIANG_VIEN', 'SINH_VIEN', 'LOP_TRUONG'];
  for (const roleName of roles) {
    await prisma.vaiTro.upsert({
      where: { ten_vt: roleName },
      update: {},
      create: { ten_vt: roleName, mo_ta: `Vai trò ${roleName}` }
    });
  }

  // Create activity type if not exist
  await prisma.loaiHoatDong.upsert({
    where: { ten_loai_hd: 'Test Activity Type' },
    update: {},
    create: {
      ten_loai_hd: 'Test Activity Type',
      mo_ta: 'Test activity type',
      diem_toi_da: 10,
    }
  });
}

/**
 * Disconnect prisma
 */
async function disconnectPrisma() {
  await prisma.$disconnect();
}

module.exports = {
  cleanupTestData,
  createTestActivity,
  createTestRegistration,
  createTestAttendance,
  createTestNotification,
  getTestUser,
  updateTestUser,
  countRecords,
  seedTestData,
  disconnectPrisma,
  prisma,
};
