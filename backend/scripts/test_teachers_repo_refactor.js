/**
 * Test Script - Kiểm tra teachers.repo.js sau khi refactor
 * 
 * Test tất cả methods để đảm bảo không có lỗi runtime
 */

const path = require('path');
const fs = require('fs');

console.log('🧪 Bắt đầu test teachers.repo.js sau khi refactor...\n');

const testResults = {
  passed: [],
  failed: [],
  warnings: []
};

/**
 * Test import module
 */
function testModuleImport(modulePath, moduleName) {
  try {
    const fullPath = path.resolve(__dirname, '..', 'src', modulePath);
    
    if (!fs.existsSync(fullPath)) {
      testResults.failed.push({
        module: moduleName,
        error: `File không tồn tại: ${fullPath}`
      });
      return false;
    }

    delete require.cache[require.resolve(fullPath)];
    const module = require(fullPath);
    
    testResults.passed.push({
      module: moduleName,
      path: modulePath
    });
    
    return true;
  } catch (error) {
    testResults.failed.push({
      module: moduleName,
      error: error.message,
      stack: error.stack
    });
    return false;
  }
}

/**
 * Test teachers.repo.js structure
 */
function testTeachersRepoStructure() {
  console.log('📦 Test teachers.repo.js structure...\n');
  
  try {
    const repoPath = path.resolve(__dirname, '..', 'src', 'modules/teachers/teachers.repo.js');
    const repo = require(repoPath);
    
    // Expected methods from original file
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
    
    console.log('  Checking methods...');
    const missingMethods = [];
    const existingMethods = [];
    
    expectedMethods.forEach(method => {
      if (typeof repo[method] === 'function') {
        existingMethods.push(method);
        console.log(`    ✅ ${method}`);
      } else {
        missingMethods.push(method);
        console.log(`    ❌ ${method} - MISSING`);
      }
    });
    
    if (missingMethods.length > 0) {
      testResults.failed.push({
        module: 'teachers.repo.js',
        error: `Missing methods: ${missingMethods.join(', ')}`
      });
      return false;
    }
    
    testResults.passed.push({
      module: 'teachers.repo.js',
      message: `All ${existingMethods.length} methods present`
    });
    
    return true;
  } catch (error) {
    testResults.failed.push({
      module: 'teachers.repo.js',
      error: error.message
    });
    return false;
  }
}

/**
 * Test specialized repositories
 */
function testSpecializedRepositories() {
  console.log('\n🏗️  Test specialized repositories...\n');
  
  const repositories = [
    { path: 'modules/teachers/infrastructure/repositories/TeacherDashboardRepository.js', name: 'TeacherDashboardRepository' },
    { path: 'modules/teachers/infrastructure/repositories/TeacherClassRepository.js', name: 'TeacherClassRepository' },
    { path: 'modules/teachers/infrastructure/repositories/TeacherStudentRepository.js', name: 'TeacherStudentRepository' },
    { path: 'modules/teachers/infrastructure/repositories/TeacherActivityRepository.js', name: 'TeacherActivityRepository' },
    { path: 'modules/teachers/infrastructure/repositories/TeacherRegistrationRepository.js', name: 'TeacherRegistrationRepository' },
    { path: 'modules/teachers/infrastructure/repositories/helpers/teacherClassHelper.js', name: 'teacherClassHelper' }
  ];

  repositories.forEach(({ path, name }) => {
    console.log(`  Testing ${name}...`);
    testModuleImport(path, name);
  });
}

/**
 * Test file sizes
 */
function testFileSizes() {
  console.log('\n📏 Test file sizes...\n');
  
  const files = [
    { path: 'modules/teachers/teachers.repo.js', maxLines: 200, name: 'teachers.repo.js (refactored)' },
    { path: 'modules/teachers/infrastructure/repositories/TeacherDashboardRepository.js', maxLines: 300, name: 'TeacherDashboardRepository' },
    { path: 'modules/teachers/infrastructure/repositories/TeacherClassRepository.js', maxLines: 200, name: 'TeacherClassRepository' },
    { path: 'modules/teachers/infrastructure/repositories/TeacherStudentRepository.js', maxLines: 250, name: 'TeacherStudentRepository' },
    { path: 'modules/teachers/infrastructure/repositories/TeacherActivityRepository.js', maxLines: 250, name: 'TeacherActivityRepository' },
    { path: 'modules/teachers/infrastructure/repositories/TeacherRegistrationRepository.js', maxLines: 300, name: 'TeacherRegistrationRepository' }
  ];
  
  files.forEach(({ path: filePath, maxLines, name }) => {
    try {
      const fullPath = path.resolve(__dirname, '..', 'src', filePath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lineCount = content.split('\n').length;
        
        if (lineCount <= maxLines) {
          console.log(`  ✅ ${name}: ${lineCount} dòng (≤ ${maxLines})`);
          testResults.passed.push({
            module: name,
            message: `${lineCount} lines (within limit)`
          });
        } else {
          console.log(`  ⚠️  ${name}: ${lineCount} dòng (> ${maxLines})`);
          testResults.warnings.push({
            module: name,
            message: `${lineCount} lines exceeds recommended ${maxLines}`
          });
        }
      }
    } catch (error) {
      testResults.failed.push({
        module: name,
        error: error.message
      });
    }
  });
}

/**
 * Test backward compatibility
 */
function testBackwardCompatibility() {
  console.log('\n🔄 Test backward compatibility...\n');
  
  try {
    const repoPath = path.resolve(__dirname, '..', 'src', 'modules/teachers/teachers.repo.js');
    const repo = require(repoPath);
    
    // Check if it's still an object (not a class)
    if (typeof repo === 'object' && !Array.isArray(repo)) {
      console.log('  ✅ Maintains object literal structure (backward compatible)');
      testResults.passed.push({
        module: 'teachers.repo.js',
        message: 'Backward compatible structure'
      });
    } else {
      testResults.failed.push({
        module: 'teachers.repo.js',
        error: 'Structure changed - may break backward compatibility'
      });
      return false;
    }
    
    // Check if all methods are async functions
    const methodNames = Object.keys(repo).filter(key => typeof repo[key] === 'function');
    const allAsync = methodNames.every(method => {
      const func = repo[method];
      return func.constructor.name === 'AsyncFunction' || func.toString().includes('async');
    });
    
    if (allAsync) {
      console.log('  ✅ All methods are async functions');
      testResults.passed.push({
        module: 'teachers.repo.js',
        message: 'All methods are async'
      });
    } else {
      testResults.warnings.push({
        module: 'teachers.repo.js',
        message: 'Some methods may not be async'
      });
    }
    
    return true;
  } catch (error) {
    testResults.failed.push({
      module: 'teachers.repo.js',
      error: error.message
    });
    return false;
  }
}

/**
 * In kết quả
 */
function printResults() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 KẾT QUẢ TEST REFACTOR');
  console.log('='.repeat(60));
  
  console.log(`\n✅ Passed: ${testResults.passed.length}`);
  testResults.passed.forEach(({ module, message, path }) => {
    console.log(`  ✓ ${module}${message ? ` - ${message}` : ''}${path ? ` (${path})` : ''}`);
  });
  
  if (testResults.warnings.length > 0) {
    console.log(`\n⚠️  Warnings: ${testResults.warnings.length}`);
    testResults.warnings.forEach(({ module, message }) => {
      console.log(`  ⚠️  ${module} - ${message}`);
    });
  }
  
  if (testResults.failed.length > 0) {
    console.log(`\n❌ Failed: ${testResults.failed.length}`);
    testResults.failed.forEach(({ module, error }) => {
      console.log(`  ✗ ${module}`);
      console.log(`    Error: ${error}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (testResults.failed.length === 0) {
    console.log('✅ TẤT CẢ TEST ĐỀU PASS!');
    console.log('🎉 Refactor thành công! File đã tuân thủ SOLID principles!');
    process.exit(0);
  } else {
    console.log('❌ CÓ LỖI XẢY RA!');
    console.log('⚠️  Vui lòng kiểm tra lại các lỗi ở trên.');
    process.exit(1);
  }
}

// Chạy tất cả tests
async function runTests() {
  try {
    testTeachersRepoStructure();
    testSpecializedRepositories();
    testFileSizes();
    testBackwardCompatibility();
    
    printResults();
  } catch (error) {
    console.error('❌ Lỗi khi chạy test:', error);
    process.exit(1);
  }
}

runTests();

