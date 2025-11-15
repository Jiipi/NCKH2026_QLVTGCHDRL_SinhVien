/**
 * Test script to verify class reports calculation
 * Run: node backend/scripts/test_reports.js
 */

const MonitorService = require('../src/modules/monitor/monitor.service');

async function testReports() {
  try {
    console.log('🧪 Testing Class Reports for ATTT01-2021, HK1 2025-2026\n');
    
    // Find class ATTT01-2021
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const lop = await prisma.lop.findFirst({
      where: { ten_lop: 'ATTT01-2021' }
    });
    
    if (!lop) {
      console.error('❌ Class ATTT01-2021 not found');
      await prisma.$disconnect();
      return;
    }
    
    console.log(`✅ Found class: ${lop.ten_lop} (ID: ${lop.id})\n`);
    
    // Get reports
    const reports = await MonitorService.getClassReports(lop.id, {
      semester: 'hoc_ky_1-2025'
    });
    
    console.log('📊 OVERVIEW:');
    console.log('  Total Students:', reports.overview.totalStudents);
    console.log('  Total Activities:', reports.overview.totalActivities);
    console.log('  Avg Points:', reports.overview.avgPoints);
    console.log('  Participation Rate:', reports.overview.participationRate + '%');
    
    console.log('\n📊 ACTIVITY TYPES:');
    reports.activityTypes.forEach(type => {
      const avgPoints = type.count > 0 ? (type.points / type.count).toFixed(1) : 0;
      console.log(`  ${type.name}: ${type.count} activities, ${type.points.toFixed(1)} points, avg ${avgPoints}`);
    });
    
    console.log('\n📊 TOP STUDENTS:');
    reports.topStudents.forEach((s, i) => {
      console.log(`  ${i+1}. ${s.name} (${s.mssv}): ${s.points} points, ${s.activities} activities`);
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

testReports();
