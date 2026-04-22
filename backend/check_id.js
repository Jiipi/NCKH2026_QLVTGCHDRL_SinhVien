const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const id = '21aff1b9-127c-4eaa-9a55-14eb4ac6f9c3';
    const hd = await prisma.hoatDong.findUnique({ where: { id } });
    console.log('HoatDong:', hd?.id ? 'Found' : 'Not Found');

    const dk = await prisma.dangKyHoatDong.findUnique({ where: { id } });
    console.log('DangKyHoatDong:', dk?.id ? 'Found, hoat_dong_id=' + dk.hoat_dong_id : 'Not Found');
}

main().catch(console.error).finally(() => prisma.$disconnect());
