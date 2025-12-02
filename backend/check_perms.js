// Script to check SINH_VIEN role permissions
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const role = await prisma.vaiTro.findFirst({
      where: { ten_vt: 'SINH_VIEN' }
    });
    
    if (!role) {
      console.log('Role SINH_VIEN not found');
      return;
    }
    
    console.log('Role:', role.ten_vt, '(ID:', role.id, ')');
    
    const perms = Array.isArray(role.quyen_han) ? role.quyen_han : [];
    console.log('\nAll permissions (' + perms.length + '):');
    perms.forEach(p => console.log(' -', p));
    
    // Check for scores/points related permissions
    console.log('\n--- Scores/Points check ---');
    const scoresPerms = ['scores.read', 'points.view_own', 'points.view_all'];
    scoresPerms.forEach(p => {
      const has = perms.includes(p);
      console.log(has ? '✓' : '✗', p, has ? '(có)' : '(không có)');
    });
    
    // Can access scores page?
    const canAccessScores = scoresPerms.some(p => perms.includes(p));
    console.log('\n==> Có thể truy cập trang Scores:', canAccessScores ? 'CÓ' : 'KHÔNG');
    
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
