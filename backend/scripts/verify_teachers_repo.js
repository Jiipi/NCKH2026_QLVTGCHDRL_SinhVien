/**
 * Verify teachers.repo.js refactor
 */

console.log('🧪 Verifying teachers.repo.js refactor...\n');

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

// Test 1: Import teachers.repo
test('Import teachers.repo', () => {
  const repo = require('../src/modules/teachers/teachers.repo');
  if (typeof repo !== 'object') throw new Error('Not an object');
});

// Test 2: Check all methods exist
test('Check all methods exist', () => {
  const repo = require('../src/modules/teachers/teachers.repo');
  const expected = [
    'getDashboardStats', 'getTeacherClassNames', 'getPendingActivitiesList',
    'getRecentNotifications', 'getTeacherClasses', 'getTeacherStudents',
    'getClassStats', 'countActivitiesForTeacherClassesStrict',
    'getTeacherClassRegistrationsForChartsAll', 'getTeacherClassRegistrationsForReports',
    'exportStudents', 'hasAccessToClass', 'hasAccessToActivity',
    'getClassRegistrations', 'assignClassMonitor', 'createStudent'
  ];
  expected.forEach(method => {
    if (typeof repo[method] !== 'function') {
      throw new Error(`Missing method: ${method}`);
    }
  });
});

// Test 3: Import specialized repositories
test('Import TeacherDashboardRepository', () => {
  require('../src/modules/teachers/infrastructure/repositories/TeacherDashboardRepository');
});

test('Import TeacherClassRepository', () => {
  require('../src/modules/teachers/infrastructure/repositories/TeacherClassRepository');
});

test('Import TeacherStudentRepository', () => {
  require('../src/modules/teachers/infrastructure/repositories/TeacherStudentRepository');
});

test('Import TeacherActivityRepository', () => {
  require('../src/modules/teachers/infrastructure/repositories/TeacherActivityRepository');
});

test('Import TeacherRegistrationRepository', () => {
  require('../src/modules/teachers/infrastructure/repositories/TeacherRegistrationRepository');
});

test('Import teacherClassHelper', () => {
  require('../src/modules/teachers/infrastructure/repositories/helpers/teacherClassHelper');
});

// Test 4: Check file sizes
test('Check file sizes', () => {
  const fs = require('fs');
  const path = require('path');
  
  const repoPath = path.resolve(__dirname, '..', 'src/modules/teachers/teachers.repo.js');
  const content = fs.readFileSync(repoPath, 'utf8');
  const lines = content.split('\n').length;
  
  if (lines > 200) {
    throw new Error(`File too large: ${lines} lines (should be < 200)`);
  }
  
  console.log(`    File size: ${lines} lines (reduced from 966 lines)`);
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

if (failed === 0) {
  console.log('✅ All tests passed! Refactor successful!');
  process.exit(0);
} else {
  console.log('❌ Some tests failed!');
  process.exit(1);
}

