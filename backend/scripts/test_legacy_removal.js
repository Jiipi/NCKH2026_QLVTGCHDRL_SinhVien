/**
 * Test Script - Kiểm tra các file legacy đã xóa không ảnh hưởng runtime
 * 
 * Test các module đã refactor:
 * - Activities
 * - Auth
 * - Users
 * - Semesters
 * - Classes
 */

const path = require('path');
const fs = require('fs');

console.log('🧪 Bắt đầu test các file legacy đã xóa...\n');

const testResults = {
  passed: [],
  failed: [],
  warnings: []
};

/**
 * Test import một module
 */
function testModuleImport(modulePath, moduleName) {
  try {
    const fullPath = path.resolve(__dirname, '..', 'src', modulePath);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      testResults.failed.push({
        module: moduleName,
        error: `File không tồn tại: ${fullPath}`
      });
      return false;
    }

    // Try to require
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
 * Test các module index
 */
function testModuleIndexes() {
  console.log('📦 Test import các module index...\n');
  
  const modules = [
    { path: 'modules/activities/index.js', name: 'Activities Module' },
    { path: 'modules/auth/index.js', name: 'Auth Module' },
    { path: 'modules/users/index.js', name: 'Users Module' },
    { path: 'modules/semesters/index.js', name: 'Semesters Module' },
    { path: 'modules/classes/index.js', name: 'Classes Module' }
  ];

  modules.forEach(({ path, name }) => {
    console.log(`  Testing ${name}...`);
    testModuleImport(path, name);
  });
}

/**
 * Test các routes
 */
function testRoutes() {
  console.log('\n🛣️  Test import các routes...\n');
  
  const routes = [
    { path: 'modules/activities/activities.routes.js', name: 'Activities Routes' },
    { path: 'modules/auth/auth.routes.js', name: 'Auth Routes' },
    { path: 'modules/users/users.routes.js', name: 'Users Routes' },
    { path: 'modules/semesters/semesters.routes.js', name: 'Semesters Routes' },
    { path: 'modules/classes/classes.routes.js', name: 'Classes Routes' }
  ];

  routes.forEach(({ path, name }) => {
    console.log(`  Testing ${name}...`);
    testModuleImport(path, name);
  });
}

/**
 * Test các use cases quan trọng
 */
function testUseCases() {
  console.log('\n💼 Test các use cases quan trọng...\n');
  
  const useCases = [
    { path: 'modules/activities/application/use-cases/GetActivityQRDataUseCase.js', name: 'GetActivityQRDataUseCase' },
    { path: 'modules/activities/application/use-cases/ScanAttendanceUseCase.js', name: 'ScanAttendanceUseCase' },
    { path: 'modules/auth/application/use-cases/LoginUseCase.js', name: 'LoginUseCase' },
    { path: 'modules/users/application/use-cases/ListUsersUseCase.js', name: 'ListUsersUseCase' }
  ];

  useCases.forEach(({ path, name }) => {
    console.log(`  Testing ${name}...`);
    testModuleImport(path, name);
  });
}

/**
 * Test các factory
 */
function testFactories() {
  console.log('\n🏭 Test các factory...\n');
  
  const factories = [
    { path: 'modules/activities/presentation/activities.factory.js', name: 'Activities Factory' },
    { path: 'modules/auth/presentation/auth.factory.js', name: 'Auth Factory' },
    { path: 'modules/users/presentation/users.factory.js', name: 'Users Factory' },
    { path: 'modules/semesters/presentation/semesters.factory.js', name: 'Semesters Factory' },
    { path: 'modules/classes/presentation/classes.factory.js', name: 'Classes Factory' }
  ];

  factories.forEach(({ path, name }) => {
    console.log(`  Testing ${name}...`);
    testModuleImport(path, name);
  });
}

/**
 * Test app routes
 */
function testAppRoutes() {
  console.log('\n📱 Test app routes...\n');
  
  console.log('  Testing app/routes.js...');
  testModuleImport('app/routes.js', 'App Routes');
}

/**
 * Kiểm tra các file legacy đã xóa không còn được import
 */
function checkLegacyFilesRemoved() {
  console.log('\n🔍 Kiểm tra các file legacy đã xóa...\n');
  
  const legacyFiles = [
    'modules/activities/activities.controller.js',
    'modules/auth/auth.controller.js',
    'modules/users/users.controller.js',
    'modules/semesters/semesters.controller.js',
    'modules/classes/classes.controller.js'
  ];

  legacyFiles.forEach(file => {
    const fullPath = path.resolve(__dirname, '..', 'src', file);
    if (fs.existsSync(fullPath)) {
      testResults.warnings.push({
        file: file,
        message: 'File legacy vẫn còn tồn tại!'
      });
      console.log(`  ⚠️  ${file} - Vẫn còn tồn tại`);
    } else {
      console.log(`  ✅ ${file} - Đã xóa`);
    }
  });
}

/**
 * Test GetActivityQRDataUseCase không còn dùng activities.service
 */
function testQRDataUseCase() {
  console.log('\n🔐 Test GetActivityQRDataUseCase không dùng activities.service...\n');
  
  try {
    const useCasePath = path.resolve(__dirname, '..', 'src', 'modules/activities/application/use-cases/GetActivityQRDataUseCase.js');
    const content = fs.readFileSync(useCasePath, 'utf8');
    
    if (content.includes('activities.service')) {
      testResults.failed.push({
        module: 'GetActivityQRDataUseCase',
        error: 'Vẫn còn sử dụng activities.service!'
      });
      console.log('  ❌ Vẫn còn sử dụng activities.service');
    } else if (content.includes('generateQRToken')) {
      testResults.passed.push({
        module: 'GetActivityQRDataUseCase',
        message: 'Đã refactor thành công, tự generate QR token'
      });
      console.log('  ✅ Đã refactor thành công, không còn dùng activities.service');
    }
  } catch (error) {
    testResults.failed.push({
      module: 'GetActivityQRDataUseCase',
      error: error.message
    });
  }
}

/**
 * In kết quả
 */
function printResults() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 KẾT QUẢ TEST');
  console.log('='.repeat(60));
  
  console.log(`\n✅ Passed: ${testResults.passed.length}`);
  testResults.passed.forEach(({ module, path, message }) => {
    console.log(`  ✓ ${module}${path ? ` (${path})` : ''}${message ? ` - ${message}` : ''}`);
  });
  
  if (testResults.warnings.length > 0) {
    console.log(`\n⚠️  Warnings: ${testResults.warnings.length}`);
    testResults.warnings.forEach(({ file, message }) => {
      console.log(`  ⚠️  ${file} - ${message}`);
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
    console.log('🎉 Các file legacy đã xóa không ảnh hưởng đến runtime!');
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
    testModuleIndexes();
    testRoutes();
    testUseCases();
    testFactories();
    testAppRoutes();
    checkLegacyFilesRemoved();
    testQRDataUseCase();
    
    printResults();
  } catch (error) {
    console.error('❌ Lỗi khi chạy test:', error);
    process.exit(1);
  }
}

runTests();

