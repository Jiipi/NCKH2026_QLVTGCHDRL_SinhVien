const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const activities = await prisma.hoatDong.findMany({
        where: {
            hoc_ky: 'hoc_ky_1',
            nam_hoc: { contains: '2025' }
        },
        include: {
            nguoi_tao: { select: { ho_ten: true, vai_tro: true } }
        }
    });

    console.log(`\nFound ${activities.length} total activities for hoc_ky_1 2025:`);

    activities.forEach(a => {
        console.log(`- ID: ${a.id} | Name: ${a.ten_hd} | Status: ${a.trang_thai} | lop_id: ${a.lop_id || 'NULL'} | Created by: ${a.nguoi_tao?.ho_ten} (${a.nguoi_tao?.vai_tro?.name || a.nguoi_tao_id.slice(0, 5)})`);
    });

    const students = await prisma.sinhVien.findMany({
        include: { nguoi_dung: true, lop: true }
    });
    console.log(`\nStudents map:`);
    students.slice(0, 5).forEach(s => {
        console.log(`- SV: ${s.mssv} | User ID: ${s.nguoi_dung_id} | Class: ${s.lop_id}`);
    });

    const teachers = await prisma.nguoiDung.findMany({
        where: { vai_tro: { key: 'GIANG_VIEN' } }
    });
    console.log(`\nTeachers map:`);
    teachers.forEach(t => {
        console.log(`- GV: ${t.ho_ten} | User ID: ${t.id}`);
    });

    const assignedClasses = await prisma.chiDinhLop.findMany({
        include: { lop: true, giang_vien: true }
    });
    console.log(`\nAssigned Classes:`);
    assignedClasses.forEach(ac => {
        console.log(`- Class: ${ac.lop?.ten_lop} (${ac.lop_id}) | Teacher: ${ac.giang_vien?.ho_ten} (${ac.gv_id})`);
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
