/**
 * Quick script to inspect user statistics directly via Prisma.
 * Usage:  node scripts/check-user-stats.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const normalizeRoleName = (value = '') =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toUpperCase();

const ROLE_VARIANTS = {
  ADMIN: ['ADMIN', 'QUAN_TRI_VIEN', 'QUAN_TRI', 'NEO_ADMIN'],
  GIANG_VIEN: ['GIANG_VIEN', 'GIANGVIEN', 'GV', 'GIAO_VIEN'],
  LOP_TRUONG: ['LOP_TRUONG', 'LOPTRUONG', 'LT', 'CLASS_LEADER', 'BAN_CAN_SU'],
  SINH_VIEN: ['SINH_VIEN', 'SINHVIEN', 'SV', 'STUDENT']
};

async function main() {
  const [total, active, locked, grouped] = await prisma.$transaction([
    prisma.nguoiDung.count(),
    prisma.nguoiDung.count({ where: { trang_thai: 'hoat_dong' } }),
    prisma.nguoiDung.count({ where: { trang_thai: 'khoa' } }),
    prisma.nguoiDung.groupBy({ by: ['vai_tro_id'], _count: { _all: true } })
  ]);

  const roleIds = grouped.map(g => g.vai_tro_id).filter(Boolean);
  const roles = roleIds.length
    ? await prisma.vaiTro.findMany({ where: { id: { in: roleIds } }, select: { id: true, ten_vt: true } })
    : [];
  const roleMap = Object.fromEntries(roles.map(r => [r.id, r.ten_vt || '']));

  const byRole = { ADMIN: 0, GIANG_VIEN: 0, LOP_TRUONG: 0, SINH_VIEN: 0 };
  grouped.forEach(group => {
    const normalized = normalizeRoleName(roleMap[group.vai_tro_id] || '');
    const entry = Object.entries(ROLE_VARIANTS).find(([, variants]) => variants.includes(normalized));
    if (entry) {
      const [cat] = entry;
      byRole[cat] += group._count._all;
    }
  });

  console.log('=== User Statistics (Prisma) ===');
  console.table([
    { Metric: 'Tổng tài khoản', Value: total },
    { Metric: 'Admin', Value: byRole.ADMIN },
    { Metric: 'Giảng viên', Value: byRole.GIANG_VIEN },
    { Metric: 'Lớp trưởng', Value: byRole.LOP_TRUONG },
    { Metric: 'Sinh viên', Value: byRole.SINH_VIEN },
    { Metric: 'Đang hoạt động', Value: active },
    { Metric: 'Bị khóa', Value: locked },
    { Metric: 'Không hoạt động', Value: total - active }
  ]);
}

main()
  .catch((err) => {
    console.error('❌ Error checking user stats:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

