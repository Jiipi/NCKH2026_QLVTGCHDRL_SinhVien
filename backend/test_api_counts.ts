import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const teacherEmail = 'gv_vy@example.com';

    const teacher = await prisma.nguoiDung.findUnique({ where: { email: teacherEmail } });
    if (!teacher) return console.log('Teacher not found');

    const classes = await prisma.lop.findMany({ where: { chu_nhiem: teacher.id } });
    const classIds = classes.map(c => c.id);
    console.log(`Teacher ${teacher.ho_ten} manages classes:`, classes.map(c => c.ten_lop));

    // Get activities ASSIGNED to these classes
    const assignedActivities = await prisma.hoatDong.findMany({
        where: { lop_id: { in: classIds } }
    });
    console.log(`\nActivities ASSIGNED to classes (lop_id): ${assignedActivities.length}`);

    // Get activities CREATED by students in these classes
    const students = await prisma.sinhVien.findMany({
        where: { lop_id: { in: classIds } },
        select: { nguoi_dung_id: true }
    });
    const studentUserIds = students.map(s => s.nguoi_dung_id).filter(Boolean);

    const createdActivities = await prisma.hoatDong.findMany({
        where: { nguoi_tao_id: { in: studentUserIds } }
    });
    console.log(`Activities CREATED BY students (nguoi_tao_id): ${createdActivities.length}`);

    // Look at Semester 1 - 2025 specifically
    const semesterWhere = { hoc_ky: 'hoc_ky_1', nam_hoc: { contains: '2025' } };

    const assignedS1 = await prisma.hoatDong.findMany({
        where: { lop_id: { in: classIds }, ...semesterWhere }
    });
    console.log(`\nS1-2025 Assigned (lop_id): ${assignedS1.length}`);
    assignedS1.forEach(a => console.log(` - [${a.trang_thai}] ${a.ten_hd}`));

    const createdS1 = await prisma.hoatDong.findMany({
        where: { nguoi_tao_id: { in: studentUserIds }, ...semesterWhere }
    });
    console.log(`\nS1-2025 Created (nguoi_tao_id): ${createdS1.length}`);
    createdS1.forEach(a => console.log(` - [${a.trang_thai}] ${a.ten_hd}`));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
