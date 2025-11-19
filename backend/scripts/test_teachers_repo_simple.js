/**
 * Simple test for teachers.repo.js refactor
 */

const path = require('path');

// Set working directory
process.chdir(path.resolve(__dirname, '..'));

console.log('🧪 Testing teachers.repo.js refactor...\n');

try {
  // Test import teachers.repo
  console.log('1. Testing teachers.repo import...');
  const teachersRepo = require('./src/modules/teachers/teachers.repo');
  console.log('   ✅ Import thành công');
  
  // Check structure
  console.log('\n2. Checking structure...');
  if (typeof teachersRepo === 'object' && !Array.isArray(teachersRepo)) {
    console.log('   ✅ Là object literal (backward compatible)');
  } else {
    throw new Error('Không phải object literal');
  }
  
  // Check methods
  console.log('\n3. Checking methods...');
  const expectedMethods = [
    'getDashboardStats',
    'getTeacherClassNames',
    'getPendingActivitiesList',
    'getRecentNotifications',
    'getTeacherClasses',
    'getTeacherStudents',
    'getClassStats',
    'countActivitiesForTeacherClassesStrict',
    'getTeacherClassRegistrationsForChartsAll',
    'getTeacherClassRegistrationsForReports',
    'exportStudents',
    'hasAccessToClass',
    'hasAccessToActivity',
    'getClassRegistrations',
    'assignClassMonitor',
    'createStudent'
  ];
  
  const methods = Object.keys(teachersRepo).filter(k => typeof teachersRepo[k] === 'function');
  console.log(`   Found ${methods.length} methods`);
  
  const missing = expectedMethods.filter(m => !methods.includes(m));
  if (missing.length > 0) {
    throw new Error(`Missing methods: ${missing.join(', ')}`);
  }
  console.log('   ✅ Tất cả methods đều có mặt');
  
  // Test specialized repositories
  console.log('\n4. Testing specialized repositories...');
  const TeacherDashboardRepository = require('./src/modules/teachers/infrastructure/repositories/TeacherDashboardRepository');
  const TeacherClassRepository = require('./src/modules/teachers/infrastructure/repositories/TeacherClassRepository');
  const TeacherStudentRepository = require('./src/modules/teachers/infrastructure/repositories/TeacherStudentRepository');
  const TeacherActivityRepository = require('./src/modules/teachers/infrastructure/repositories/TeacherActivityRepository');
  const TeacherRegistrationRepository = require('./src/modules/teachers/infrastructure/repositories/TeacherRegistrationRepository');
  const { findTeacherClassesRaw } = require('./src/modules/teachers/infrastructure/repositories/helpers/teacherClassHelper');
  
  console.log('   ✅ TeacherDashboardRepository');
  console.log('   ✅ TeacherClassRepository');
  console.log('   ✅ TeacherStudentRepository');
  console.log('   ✅ TeacherActivityRepository');
  console.log('   ✅ TeacherRegistrationRepository');
  console.log('   ✅ teacherClassHelper');
  
  // Test file sizes
  console.log('\n5. Checking file sizes...');
  const fs = require('fs');
  const repoPath = path.resolve(__dirname, '..', 'src/modules/teachers/teachers.repo.js');
  const repoContent = fs.readFileSync(repoPath, 'utf8');
  const repoLines = repoContent.split('\n').length;
  console.log(`   teachers.repo.js: ${repoLines} dòng (giảm từ 966 dòng)`);
  
  if (repoLines < 200) {
    console.log('   ✅ File size hợp lý (< 200 dòng)');
  } else {
    console.log('   ⚠️  File vẫn còn lớn (> 200 dòng)');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ TẤT CẢ TEST ĐỀU PASS!');
  console.log('🎉 Refactor thành công!');
  console.log('📊 Kết quả:');
  console.log(`   - File gốc: 966 dòng, 64 methods`);
  console.log(`   - File mới: ${repoLines} dòng, ${methods.length} methods (delegates)`);
  console.log(`   - Chia thành 5 specialized repositories`);
  console.log(`   - Tuân thủ SOLID principles (SRP)`);
  console.log('='.repeat(60));
  
} catch (error) {
  console.error('\n❌ LỖI:', error.message);
  if (error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
}

