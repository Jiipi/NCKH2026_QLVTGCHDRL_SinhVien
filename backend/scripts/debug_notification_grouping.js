const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking notification grouping behavior...\n');

    // Find a Class Monitor user
    const monitorRole = await prisma.vaiTro.findUnique({ where: { ten_vt: 'LOP_TRUONG' } });
    const monitorUser = await prisma.nguoiDung.findFirst({
        where: { vai_tro_id: monitorRole.id },
        select: { id: true, ho_ten: true, ten_dn: true }
    });

    if (!monitorUser) {
        console.log('No Class Monitor user found!');
        return;
    }

    console.log(`Class Monitor: ${monitorUser.ho_ten} (${monitorUser.ten_dn})`);
    console.log(`User ID: ${monitorUser.id}\n`);

    // Get all notifications sent by this user
    const allNotifications = await prisma.thongBao.findMany({
        where: { nguoi_gui_id: monitorUser.id },
        orderBy: { ngay_gui: 'desc' }
    });

    console.log(`Total notifications sent (DB records): ${allNotifications.length}\n`);

    // Group by title and date (simulating backend logic)
    const grouped = {};
    for (const notif of allNotifications) {
        const key = `${notif.tieu_de}_${notif.ngay_gui.toDateString()}`;
        if (!grouped[key]) {
            grouped[key] = {
                title: notif.tieu_de,
                date: notif.ngay_gui,
                count: 0,
                scope: null
            };
            const scopeMatch = notif.noi_dung.match(/phạm vi:\s*(class|activity|single)/i);
            if (scopeMatch) {
                grouped[key].scope = scopeMatch[1].toLowerCase();
            }
        }
        grouped[key].count++;
    }

    console.log(`Grouped notifications (history items): ${Object.keys(grouped).length}\n`);

    console.log('Grouped breakdown:');
    Object.entries(grouped).forEach(([key, data], index) => {
        console.log(`${index + 1}. "${data.title}" (${data.date.toLocaleDateString()})`);
        console.log(`   Recipients: ${data.count}, Scope: ${data.scope || 'unknown'}`);
    });

    // Calculate stats
    const classCount = Object.values(grouped).filter(g => g.scope === 'class').length;
    const activityCount = Object.values(grouped).filter(g => g.scope === 'activity').length;

    console.log('\nStats:');
    console.log(`Total: ${Object.keys(grouped).length}`);
    console.log(`Class scope: ${classCount}`);
    console.log(`Activity scope: ${activityCount}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
