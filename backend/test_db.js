const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const teacher = await prisma.nguoiDung.findUnique({ where: { ma_so: 'gv_vy' } });
    if (!teacher) return console.log('Teacher not found');

    const classes = await prisma.lop.findMany({ where: { chu_nhiem: teacher.id } });
    const classIds = classes.map(c => c.id);

    const students = await prisma.sinhVien.findMany({ where: { lop_id: { in: classIds } } });
    const studentUserIds = students.map(s => s.nguoi_dung_id).filter(Boolean);

    const allAssigned = await prisma.hoatDong.findMany({ where: { lop_id: { in: classIds } } });
    const allCreated = await prisma.hoatDong.findMany({ where: { nguoi_tao_id: { in: [...studentUserIds, teacher.id] } } });

    console.log('--- ALL TIME ---');
    console.log('Assigned (lop_id):', allAssigned.length);
    console.log('Created (nguoi_tao_id):', allCreated.length);

    const assignedS2025 = allAssigned.filter(a => String(a.nam_hoc).includes('2025'));
    const createdS2025 = allCreated.filter(a => String(a.nam_hoc).includes('2025'));

    console.log('--- S2025 ONLY ---');
    console.log('Assigned S2025:', assignedS2025.length);
    console.log('Created S2025:', createdS2025.length);

    console.log('\n--- SCOPE BUILDER TEST ---');
    // Wait, the API `/activities` calls `scopeBuilder` with `activities` scope.
    // scopeBuilder.ts was changed to `return { lop_id: { in: classIds } };`
    const scopeAssignedS2025 = await prisma.hoatDong.findMany({
        where: { lop_id: { in: classIds }, hoc_ky: 'hoc_ky_1', nam_hoc: '2025' }
    });
    console.log('Scope Builder count:', scopeAssignedS2025.length);
}
run().finally(() => setTimeout(() => process.exit(0), 100));
