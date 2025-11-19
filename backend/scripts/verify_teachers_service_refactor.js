/**
 * Verify teachers.service.js refactor
 */

console.log('🧪 Verifying teachers.service.js refactor...\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`  ❌ ${name}: ${error.message}`);
    failed++;
  }
}

// Test 1: Import teachers.service
test('Import teachers.service', () => {
  const service = require('../src/modules/teachers/teachers.service');
  if (typeof service !== 'object') throw new Error('Not an object');
});

// Test 2: Check all methods exist
test('Check all methods exist', () => {
  const service = require('../src/modules/teachers/teachers.service');
  const expected = [
    'getDashboard',
    'getClasses', 'getStudents', 'getPendingActivities', 'getActivityHistory',
    'approveActivity', 'rejectActivity',
    'getAllRegistrations', 'getPendingRegistrations', 'approveRegistration', 
    'rejectRegistration', 'bulkApproveRegistrations',
    'getClassStatistics', 'getReportStatistics',
    'exportStudents', 'createStudent', 'assignClassMonitor'
  ];
  
  expected.forEach(method => {
    if (typeof service[method] !== 'function') {
      throw new Error(`Missing method: ${method}`);
    }
  });
});

// Test 3: Import specialized services
test('Import TeacherDashboardService', () => {
  require('../src/modules/teachers/services/TeacherDashboardService');
});

test('Import TeacherQueryService', () => {
  require('../src/modules/teachers/services/TeacherQueryService');
});

test('Import TeacherActivityService', () => {
  require('../src/modules/teachers/services/TeacherActivityService');
});

test('Import TeacherRegistrationService', () => {
  require('../src/modules/teachers/services/TeacherRegistrationService');
});

test('Import TeacherStatisticsService', () => {
  require('../src/modules/teachers/services/TeacherStatisticsService');
});

test('Import TeacherStudentService', () => {
  require('../src/modules/teachers/services/TeacherStudentService');
});

// Test 4: Check file sizes
test('Check file sizes', () => {
  const fs = require('fs');
  const path = require('path');
  
  const repoPath = path.resolve(__dirname, '..', 'src/modules/teachers/teachers.service.js');
  const content = fs.readFileSync(repoPath, 'utf8');
  const lines = content.split('\n').length;
  
  if (lines > 200) {
    throw new Error(`File too large: ${lines} lines (should be < 200)`);
  }
  
  console.log(`    File size: ${lines} lines (reduced from 607 lines)`);
  console.log(`    Reduction: ${((607 - lines) / 607 * 100).toFixed(1)}%`);
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

if (failed === 0) {
  console.log('✅ All tests passed! Refactor successful!');
  process.exit(0);
} else {
  console.log('❌ Some tests failed!');
  process.exit(1);
}

