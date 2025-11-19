/**
 * Script to convert nam_hoc from double year format (2024-2025) to single year format (2024)
 * Usage: node backend/scripts/convert_nam_hoc_to_single_year.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function convertNamHocToSingleYear() {
  try {
    console.log('🔄 Starting conversion of nam_hoc from double year to single year format...\n');

    // Get all distinct nam_hoc values
    const activities = await prisma.hoatDong.findMany({
      select: {
        id: true,
        nam_hoc: true,
      },
      where: {
        nam_hoc: {
          contains: '-',
        },
      },
    });

    console.log(`📊 Found ${activities.length} activities with double year format\n`);

    if (activities.length === 0) {
      console.log('✅ No activities need conversion. All nam_hoc values are already in single year format.');
      return;
    }

    // Group by unique nam_hoc values
    const uniqueNamHoc = [...new Set(activities.map(a => a.nam_hoc))];
    console.log('🔍 Unique nam_hoc values to convert:', uniqueNamHoc);
    console.log();

    let totalUpdated = 0;

    // Convert each unique format
    for (const oldNamHoc of uniqueNamHoc) {
      if (!oldNamHoc || !oldNamHoc.includes('-')) continue;

      // Extract first year from format "2024-2025" -> "2024"
      const newNamHoc = oldNamHoc.split('-')[0];

      console.log(`🔧 Converting: "${oldNamHoc}" -> "${newNamHoc}"`);

      // Update all activities with this nam_hoc
      const result = await prisma.hoatDong.updateMany({
        where: {
          nam_hoc: oldNamHoc,
        },
        data: {
          nam_hoc: newNamHoc,
        },
      });

      console.log(`   ✓ Updated ${result.count} records`);
      totalUpdated += result.count;
    }

    console.log();
    console.log('═══════════════════════════════════════════════════');
    console.log(`✅ Conversion completed successfully!`);
    console.log(`📈 Total activities updated: ${totalUpdated}`);
    console.log('═══════════════════════════════════════════════════');

    // Verify conversion
    console.log();
    console.log('🔍 Verifying conversion...');
    const remainingDoubleYear = await prisma.hoatDong.count({
      where: {
        nam_hoc: {
          contains: '-',
        },
      },
    });

    if (remainingDoubleYear === 0) {
      console.log('✅ Verification passed: No double year formats remaining');
    } else {
      console.warn(`⚠️  Warning: ${remainingDoubleYear} activities still have double year format`);
    }

    // Show current distinct nam_hoc values
    const currentNamHoc = await prisma.$queryRaw`
      SELECT DISTINCT nam_hoc FROM hoat_dong ORDER BY nam_hoc
    `;
    console.log();
    console.log('📋 Current nam_hoc values in database:');
    currentNamHoc.forEach(item => {
      console.log(`   - ${item.nam_hoc}`);
    });

  } catch (error) {
    console.error('❌ Error during conversion:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
convertNamHocToSingleYear()
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
