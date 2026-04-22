const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const id = '21aff1b9-127c-4eaa-9a55-14eb4ac6f9c3';
    const hd = await prisma.hoatDong.findUnique({ where: { id } });
    console.log('HoatDong:', hd);

    const dk = await prisma.dangKyHoatDong.findUnique({ where: { id }, include: { hoat_dong: true } });
    console.log('DangKyHoatDong:', dk);
}

main().catch(console.error).finally(() => prisma.$disconnect());
