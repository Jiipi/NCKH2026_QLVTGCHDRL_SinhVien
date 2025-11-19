/**
 * Script to fix Vietnamese font encoding issues and update activity dates to current time
 * Usage: node backend/scripts/fix_activities_encoding_and_dates.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper function to fix Vietnamese encoding issues
function fixVietnameseText(text) {
  if (!text || typeof text !== 'string') return text;
  
  // Common encoding issues mappings
  const replacements = {
    'Äƒ': 'ă',
    'Ă¡': 'á',
    'Ă': 'Ă',
    'Ã¡': 'á',
    'Ã ': 'à',
    'áº¡': 'ạ',
    'áº£': 'ả',
    'Ã£': 'ã',
    'Ã©': 'é',
    'Ă¨': 'è',
    'áº¹': 'ẹ',
    'áº»': 'ẻ',
    'áº½': 'ẽ',
    'Ă­': 'í',
    'Ă¬': 'ì',
    'á»‹': 'ị',
    'á»‰': 'ỉ',
    'Ă£': 'ĩ',
    'Ă³': 'ó',
    'Ă²': 'ò',
    'á»': 'ọ',
    'á»': 'ỏ',
    'Ăµ': 'õ',
    'Ăº': 'ú',
    'Ă¹': 'ù',
    'á»¥': 'ụ',
    'á»§': 'ủ',
    'Å©': 'ũ',
    'Ă½': 'ý',
    'á»³': 'ỳ',
    'á»±': 'ỵ',
    'á»·': 'ỷ',
    'á»¹': 'ỹ',
    'Ä': 'đ',
    'Ä': 'Đ',
    // Double-encoded characters
    'â€™': "'",
    'â€œ': '"',
    'â€': '"',
    'â€"': '–',
    'â€"': '—',
  };

  let fixed = text;
  for (const [bad, good] of Object.entries(replacements)) {
    fixed = fixed.replace(new RegExp(bad, 'g'), good);
  }

  return fixed;
}

// Generate random date within a range for testing
function getRandomFutureDate(daysAhead = 30) {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * daysAhead) + 1;
  const date = new Date(now);
  date.setDate(date.getDate() + randomDays);
  return date;
}

async function fixActivitiesEncodingAndDates() {
  try {
    console.log('🔄 Starting fix for Vietnamese encoding and updating activity dates...\n');

    // Get all activities
    const activities = await prisma.hoatDong.findMany({
      select: {
        id: true,
        ten_hd: true,
        mo_ta: true,
        dia_diem: true,
        yeu_cau_tham_gia: true,
        ngay_bd: true,
        ngay_kt: true,
        han_dk: true,
      },
    });

    console.log(`📊 Found ${activities.length} activities to process\n`);

    let fixedEncoding = 0;
    let updatedDates = 0;
    const now = new Date();

    for (const activity of activities) {
      const updates = {};
      let needsUpdate = false;

      // Fix Vietnamese encoding for text fields
      if (activity.ten_hd) {
        const fixedTenHd = fixVietnameseText(activity.ten_hd);
        if (fixedTenHd !== activity.ten_hd) {
          updates.ten_hd = fixedTenHd;
          needsUpdate = true;
          fixedEncoding++;
        }
      }

      if (activity.mo_ta) {
        const fixedMoTa = fixVietnameseText(activity.mo_ta);
        if (fixedMoTa !== activity.mo_ta) {
          updates.mo_ta = fixedMoTa;
          needsUpdate = true;
        }
      }

      if (activity.dia_diem) {
        const fixedDiaDiem = fixVietnameseText(activity.dia_diem);
        if (fixedDiaDiem !== activity.dia_diem) {
          updates.dia_diem = fixedDiaDiem;
          needsUpdate = true;
        }
      }

      if (activity.yeu_cau_tham_gia) {
        const fixedYeuCau = fixVietnameseText(activity.yeu_cau_tham_gia);
        if (fixedYeuCau !== activity.yeu_cau_tham_gia) {
          updates.yeu_cau_tham_gia = fixedYeuCau;
          needsUpdate = true;
        }
      }

      // Update dates to be in the future for testing
      // Registration deadline: now + 3-7 days
      const hanDk = new Date(now);
      hanDk.setDate(hanDk.getDate() + Math.floor(Math.random() * 5) + 3);
      
      // Start date: registration deadline + 1-3 days
      const ngayBd = new Date(hanDk);
      ngayBd.setDate(ngayBd.getDate() + Math.floor(Math.random() * 3) + 1);
      
      // End date: start date + 1-5 hours (for same-day events) or 1-3 days (for multi-day)
      const ngayKt = new Date(ngayBd);
      const isMultiDay = Math.random() > 0.7; // 30% multi-day events
      if (isMultiDay) {
        ngayKt.setDate(ngayKt.getDate() + Math.floor(Math.random() * 3) + 1);
      } else {
        ngayKt.setHours(ngayKt.getHours() + Math.floor(Math.random() * 5) + 1);
      }

      updates.han_dk = hanDk;
      updates.ngay_bd = ngayBd;
      updates.ngay_kt = ngayKt;
      needsUpdate = true;
      updatedDates++;

      // Update the activity if there are changes
      if (needsUpdate) {
        await prisma.hoatDong.update({
          where: { id: activity.id },
          data: updates,
        });
      }
    }

    console.log('═══════════════════════════════════════════════════');
    console.log(`✅ Fix completed successfully!`);
    console.log(`📝 Fixed Vietnamese encoding: ${fixedEncoding} activities`);
    console.log(`📅 Updated dates: ${updatedDates} activities`);
    console.log('═══════════════════════════════════════════════════');

    // Show sample of updated activities
    console.log('\n📋 Sample of updated activities (first 5):');
    const samples = await prisma.hoatDong.findMany({
      select: {
        ten_hd: true,
        han_dk: true,
        ngay_bd: true,
        ngay_kt: true,
      },
      take: 5,
      orderBy: {
        ngay_bd: 'asc',
      },
    });

    samples.forEach((activity, index) => {
      console.log(`\n${index + 1}. ${activity.ten_hd}`);
      console.log(`   Hạn đăng ký: ${activity.han_dk?.toLocaleString('vi-VN')}`);
      console.log(`   Ngày bắt đầu: ${activity.ngay_bd?.toLocaleString('vi-VN')}`);
      console.log(`   Ngày kết thúc: ${activity.ngay_kt?.toLocaleString('vi-VN')}`);
    });

    // Count activities by date range
    const upcomingCount = await prisma.hoatDong.count({
      where: {
        ngay_bd: {
          gte: now,
        },
      },
    });

    console.log('\n📊 Statistics:');
    console.log(`   - Upcoming activities: ${upcomingCount}`);
    console.log(`   - Activities with open registration: ${await prisma.hoatDong.count({
      where: {
        han_dk: {
          gte: now,
        },
      },
    })}`);

  } catch (error) {
    console.error('❌ Error during fix:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixActivitiesEncodingAndDates()
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
