/**
 * Test script to verify activity count alignment between:
 * - /core/monitor/dashboard (used by ClassActivities page)
 * - /core/monitor/reports (used by ClassReports page)
 * 
 * Both should now return 22 activities for ATTT01-2021 in HK1 2025-2026
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const MonitorService = require('./src/modules/monitor/monitor.service');

const prisma = new PrismaClient();

async function testActivityCountAlignment() {
  try {
    const CLASS_NAME = 'ATTT01-2021';
    const SEMESTER = 'hoc_ky_1-2024'; // Current semester based on getCurrentSemesterValue()
    
    console.log('🔍 Testing activity count alignment');
    console.log('📚 Class:', CLASS_NAME);
    console.log('📅 Semester:', SEMESTER);
    console.log('');
    
    // Find class ID
    const lop = await prisma.lop.findFirst({
      where: { ten_lop: CLASS_NAME },
      select: { id: true }
    });
    
    if (!lop) {
      console.error('❌ Class not found:', CLASS_NAME);
      return;
    }
    
    const classId = lop.id;
    console.log('✅ Found class ID:', classId);
    console.log('');
    
    // Test 1: Get data from dashboard endpoint (ClassActivities page uses this)
    console.log('📊 Test 1: Dashboard endpoint (ClassActivities page)');
    const dashboardData = await MonitorService.getMonitorDashboard(classId, CLASS_NAME, SEMESTER);
    const dashboardCount = dashboardData?.summary?.totalActivities || 0;
    console.log('   Total Activities:', dashboardCount);
    console.log('   Full summary:', JSON.stringify(dashboardData.summary, null, 2));
    console.log('');
    
    // Test 2: Get data from reports endpoint (ClassReports page uses this)
    console.log('📊 Test 2: Reports endpoint (ClassReports page)');
    const reportsData = await MonitorService.getClassReports(classId, { semester: SEMESTER });
    const reportsCount = reportsData?.overview?.totalActivities || 0;
    console.log('   Total Activities:', reportsCount);
    console.log('   Full overview:', JSON.stringify(reportsData.overview, null, 2));
    console.log('');
    
    // Compare results
    console.log('🔍 Comparison:');
    console.log('   Dashboard (ClassActivities):', dashboardCount);
    console.log('   Reports (ClassReports):', reportsCount);
    
    if (dashboardCount === reportsCount) {
      console.log('   ✅ COUNTS MATCH! Both pages will show', dashboardCount, 'activities');
    } else {
      console.log('   ❌ COUNTS DO NOT MATCH!');
      console.log('   Difference:', Math.abs(dashboardCount - reportsCount));
    }
    
    // Additional details
    console.log('');
    console.log('📋 Additional Details:');
    console.log('   Dashboard Status Filter: da_duyet (approved registrations)');
    console.log('   Reports Status Filter: da_duyet (approved registrations)');
    console.log('   Both use buildRobustActivitySemesterWhere for semester filtering');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testActivityCountAlignment();
