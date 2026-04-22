const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const id = '513a07ac-68ad-474f-bf57-133bb221de2f';
    const newEndDate = new Date('2026-12-31T23:59:59Z');

    const updated = await prisma.hoatDong.update({
        where: { id },
        data: { ngay_kt: newEndDate }
    });

    console.log('Updated activity target end date to', updated.ngay_kt);
}

main().catch(console.error).finally(() => prisma.$disconnect());
