const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking notifications in database...');

    const notifications = await prisma.thongBao.findMany({
        take: 20,
        orderBy: { ngay_gui: 'desc' },
        include: {
            nguoi_gui: {
                select: { ten_dn: true, ho_ten: true }
            }
        }
    });

    console.log(`Found ${notifications.length} notifications.`);

    for (const notif of notifications) {
        console.log('--------------------------------------------------');
        console.log(`ID: ${notif.id}`);
        console.log(`Title: ${notif.tieu_de}`);
        console.log(`Sender: ${notif.nguoi_gui?.ho_ten} (${notif.nguoi_gui?.ten_dn})`);
        console.log(`Content Preview: ${notif.noi_dung.substring(0, 100)}...`);

        const scopeMatch = notif.noi_dung.match(/phạm vi:\s*(class|activity|single)/i);
        console.log(`Regex Scope Match: ${scopeMatch ? scopeMatch[1] : 'NONE'}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
