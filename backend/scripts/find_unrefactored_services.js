/**
 * Tìm các file .service.js và routes.js chưa được tách riêng thành các service nhỏ
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Đang quét tìm các file service và routes chưa refactor...\n');

const results = {
  services: [],
  routes: [],
  unrefactoredServices: [],
  unrefactoredRoutes: []
};

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').length;
    
    // Đếm methods
    const asyncMethods = (content.match(/async\s+\w+\(/g) || []).length;
    const regularMethods = (content.match(/^\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(/gm) || []).length;
    const staticMethods = (content.match(/static\s+\w+\(/g) || []).length;
    const totalMethods = asyncMethods + regularMethods + staticMethods;
    
    // Kiểm tra refactor
    const hasComposition = /require\(['"].*services\/|require\(['"].*repositories\//.test(content);
    const isFacade = /@delegates|_queryService|_crudService|_approvalService|_dashboardService|_registrationService|_statisticsService|_studentService|_activityService/.test(content);
    const hasUseCases = /require\(['"].*use-cases\//.test(content);
    const isRefactored = hasComposition || isFacade || hasUseCases;
    
    // Kiểm tra có thư mục services/ hoặc infrastructure/repositories/
    const dir = path.dirname(filePath);
    const hasServicesDir = fs.existsSync(path.join(dir, 'services'));
    const hasReposDir = fs.existsSync(path.join(dir, 'infrastructure', 'repositories'));
    const hasUseCasesDir = fs.existsSync(path.join(dir, 'application', 'use-cases'));
    
    return {
      lines,
      methods: totalMethods,
      asyncMethods,
      isRefactored,
      hasServicesDir,
      hasReposDir,
      hasUseCasesDir,
      needsRefactor: !isRefactored && (lines > 200 || totalMethods > 10)
    };
  } catch (error) {
    return null;
  }
}

function scanDirectory(dir, baseDir = dir) {
  try {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!item.startsWith('.') && item !== 'node_modules' && item !== '__pycache__' && item !== 'services' && item !== 'repositories' && item !== 'use-cases') {
          scanDirectory(fullPath, baseDir);
        }
      } else if (stat.isFile() && item.endsWith('.js')) {
        const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
        
        if (item.includes('.service.js') || (item.includes('service.js') && !item.includes('services/') && !item.includes('repositories/'))) {
          const analysis = analyzeFile(fullPath);
          if (analysis) {
            results.services.push({
              path: relativePath,
              ...analysis
            });
            
            if (analysis.needsRefactor) {
              results.unrefactoredServices.push({
                path: relativePath,
                ...analysis
              });
            }
          }
        } else if (item.includes('routes.js') || item.includes('.routes.js')) {
          const analysis = analyzeFile(fullPath);
          if (analysis) {
            results.routes.push({
              path: relativePath,
              ...analysis
            });
            
            // Routes thường không cần refactor như services, nhưng nếu quá lớn (> 300 dòng) thì cần xem xét
            if (analysis.lines > 300 || analysis.methods > 20) {
              results.unrefactoredRoutes.push({
                path: relativePath,
                ...analysis
              });
            }
          }
        }
      }
    });
  } catch (error) {
    // Ignore
  }
}

const srcDir = path.resolve(__dirname, '..', 'src');
scanDirectory(srcDir);

// Sắp xếp
results.services.sort((a, b) => b.lines - a.lines);
results.routes.sort((a, b) => b.lines - a.lines);
results.unrefactoredServices.sort((a, b) => b.lines - a.lines);
results.unrefactoredRoutes.sort((a, b) => b.lines - a.lines);

// In kết quả
console.log('='.repeat(80));
console.log('📊 BÁO CÁO CÁC FILE SERVICE VÀ ROUTES CHƯA REFACTOR');
console.log('='.repeat(80));

console.log(`\n📁 Tổng số:`);
console.log(`   - Services: ${results.services.length}`);
console.log(`   - Routes: ${results.routes.length}`);

if (results.unrefactoredServices.length > 0) {
  console.log(`\n❌ Services chưa refactor (> 200 dòng hoặc > 10 methods): ${results.unrefactoredServices.length}`);
  results.unrefactoredServices.forEach(file => {
    console.log(`\n   ❌ ${file.path}`);
    console.log(`      - ${file.lines} dòng, ${file.methods} methods`);
    console.log(`      - Refactored: ${file.isRefactored ? '✅' : '❌'}`);
    console.log(`      - Has services dir: ${file.hasServicesDir ? '✅' : '❌'}`);
    console.log(`      - Has use-cases dir: ${file.hasUseCasesDir ? '✅' : '❌'}`);
  });
} else {
  console.log(`\n✅ Tất cả services đều đã được refactor hoặc nhỏ hơn 200 dòng!`);
}

if (results.unrefactoredRoutes.length > 0) {
  console.log(`\n⚠️  Routes lớn (> 300 dòng hoặc > 20 methods): ${results.unrefactoredRoutes.length}`);
  results.unrefactoredRoutes.forEach(file => {
    console.log(`\n   ⚠️  ${file.path}`);
    console.log(`      - ${file.lines} dòng, ${file.methods} methods`);
  });
} else {
  console.log(`\n✅ Tất cả routes đều nhỏ hơn 300 dòng!`);
}

// Chi tiết tất cả services
console.log(`\n📋 Chi tiết tất cả Services:`);
results.services.forEach(file => {
  const status = file.isRefactored ? '✅' : (file.needsRefactor ? '❌' : '✓');
  console.log(`   ${status} ${file.path}: ${file.lines} dòng, ${file.methods} methods`);
});

// Chi tiết tất cả routes
console.log(`\n📋 Chi tiết tất cả Routes:`);
results.routes.forEach(file => {
  const status = file.lines > 300 ? '⚠️' : '✓';
  console.log(`   ${status} ${file.path}: ${file.lines} dòng, ${file.methods} methods`);
});

// Tổng kết
console.log('\n' + '='.repeat(80));
console.log('📊 TỔNG KẾT');
console.log('='.repeat(80));

const totalServices = results.services.length;
const refactoredServices = results.services.filter(f => f.isRefactored).length;
const unrefactoredServices = results.unrefactoredServices.length;
const smallServices = totalServices - refactoredServices - unrefactoredServices;

console.log(`\n✅ Services đã refactor: ${refactoredServices} files`);
console.log(`❌ Services cần refactor: ${unrefactoredServices} files`);
console.log(`✓  Services nhỏ (< 200 dòng, < 10 methods): ${smallServices} files`);
console.log(`📊 Tổng services: ${totalServices} files`);

if (results.unrefactoredServices.length === 0 && results.unrefactoredRoutes.length === 0) {
  console.log('\n🎉 HOÀN HẢO! Tất cả files đều đã được refactor hoặc nhỏ!');
  process.exit(0);
} else {
  console.log('\n⚠️  Còn một số files cần refactor:');
  if (results.unrefactoredServices.length > 0) {
    console.log(`   - ${results.unrefactoredServices.length} services cần refactor`);
  }
  if (results.unrefactoredRoutes.length > 0) {
    console.log(`   - ${results.unrefactoredRoutes.length} routes lớn cần xem xét`);
  }
  process.exit(1);
}

