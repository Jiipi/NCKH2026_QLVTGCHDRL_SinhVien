const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // 1. Create Roles
    const roles = [
        { ten_vt: 'ADMIN', mo_ta: 'Quản trị viên hệ thống' },
        { ten_vt: 'GIANG_VIEN', mo_ta: 'Giảng viên/Cố vấn học tập' },
        { ten_vt: 'LOP_TRUONG', mo_ta: 'Lớp trưởng/Ban cán sự' },
        { ten_vt: 'SINH_VIEN', mo_ta: 'Sinh viên' },
    ];

    for (const role of roles) {
        const r = await prisma.vaiTro.upsert({
            where: { ten_vt: role.ten_vt },
            update: {},
            create: role,
        });
        console.log(`Created role: ${r.ten_vt}`);
    }

    // 2. Create Admin User
    const adminRole = await prisma.vaiTro.findUnique({
        where: { ten_vt: 'ADMIN' },
    });

    if (adminRole) {
        const hashedPassword = await bcrypt.hash('123456', 10);

        const admin = await prisma.nguoiDung.upsert({
            where: { ten_dn: 'admin' },
            update: {},
            create: {
                ten_dn: 'admin',
                mat_khau: hashedPassword,
                email: 'admin@hoatdongrenluyen.io.vn',
                ho_ten: 'Administrator',
                vai_tro_id: adminRole.id,
                trang_thai: 'hoat_dong',
            },
        });
        console.log(`Created admin user: ${admin.ten_dn}`);
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
