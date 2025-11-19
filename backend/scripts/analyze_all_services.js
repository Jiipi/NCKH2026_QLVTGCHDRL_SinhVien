/**
 * Phân tích toàn bộ services và repos trong backend/src
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Phân tích toàn bộ services và repos...\n');

const results = {
  services: [],
  repos: [],
  largeFiles: [],
  needsRefactor: []
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
    const isFacade = /@delegates|_queryService|_crudService|_approvalService|_dashboardService|_registrationService|_statisticsService|_studentService/.test(content);
    const isRefactored = hasComposition || isFacade;
    
    // Kiểm tra có thư mục services/ hoặc infrastructure/repositories/
    const dir = path.dirname(filePath);
    const hasServicesDir = fs.existsSync(path.join(dir, 'services'));
    const hasReposDir = fs.existsSync(path.join(dir, 'infrastructure', 'repositories'));
    
    return {
      lines,
      methods: totalMethods,
      asyncMethods,
      isRefactored,
      hasServicesDir,
      hasReposDir,
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
        if (!item.startsWith('.') && item !== 'node_modules' && item !== '__pycache__') {
          scanDirectory(fullPath, baseDir);
        }
      } else if (stat.isFile() && item.endsWith('.js')) {
        const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
        
        if (item.includes('.service.js') || (item.includes('service.js') && !item.includes('services/'))) {
          const analysis = analyzeFile(fullPath);
          if (analysis) {
            results.services.push({
              path: relativePath,
              ...analysis
            });
            
            if (analysis.lines > 600) {
              results.largeFiles.push({
                path: relativePath,
                type: 'service',
                ...analysis
              });
            }
            
            if (analysis.needsRefactor) {
              results.needsRefactor.push({
                path: relativePath,
                type: 'service',
                ...analysis
              });
            }
          }
        } else if (item.includes('.repo.js') || (item.includes('repo.js') && !item.includes('repositories/'))) {
          const analysis = analyzeFile(fullPath);
          if (analysis) {
            results.repos.push({
              path: relativePath,
              ...analysis
            });
            
            if (analysis.lines > 600) {
              results.largeFiles.push({
                path: relativePath,
                type: 'repo',
                ...analysis
              });
            }
            
            if (analysis.needsRefactor) {
              results.needsRefactor.push({
                path: relativePath,
                type: 'repo',
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
results.repos.sort((a, b) => b.lines - a.lines);
results.largeFiles.sort((a, b) => b.lines - a.lines);
results.needsRefactor.sort((a, b) => b.lines - a.lines);

// In kết quả
console.log('='.repeat(80));
console.log('📊 BÁO CÁO PHÂN TÍCH TOÀN BỘ SERVICES VÀ REPOS');
console.log('='.repeat(80));

console.log(`\n📁 Tổng số:`);
console.log(`   - Services: ${results.services.length}`);
console.log(`   - Repos: ${results.repos.length}`);
console.log(`   - Tổng: ${results.services.length + results.repos.length}`);

if (results.largeFiles.length > 0) {
  console.log(`\n⚠️  Files lớn (> 600 dòng): ${results.largeFiles.length}`);
  results.largeFiles.forEach(file => {
    console.log(`   ⚠️  ${file.path}`);
    console.log(`      - ${file.lines} dòng, ${file.methods} methods`);
    console.log(`      - Refactored: ${file.isRefactored ? '✅' : '❌'}`);
  });
}

if (results.needsRefactor.length > 0) {
  console.log(`\n❌ Files cần refactor (> 200 dòng hoặc > 10 methods): ${results.needsRefactor.length}`);
  results.needsRefactor.forEach(file => {
    console.log(`   ❌ ${file.path}`);
    console.log(`      - ${file.lines} dòng, ${file.methods} methods`);
    console.log(`      - Refactored: ${file.isRefactored ? '✅' : '❌'}`);
    console.log(`      - Has services dir: ${file.hasServicesDir ? '✅' : '❌'}`);
  });
} else {
  console.log(`\n✅ Tất cả files đều đã được refactor hoặc nhỏ hơn 200 dòng!`);
}

// Chi tiết tất cả
console.log(`\n📋 Chi tiết tất cả Services:`);
results.services.forEach(file => {
  const status = file.isRefactored ? '✅' : (file.needsRefactor ? '❌' : '✓');
  console.log(`   ${status} ${file.path}: ${file.lines} dòng, ${file.methods} methods`);
});

console.log(`\n📋 Chi tiết tất cả Repos:`);
results.repos.forEach(file => {
  const status = file.isRefactored ? '✅' : (file.needsRefactor ? '❌' : '✓');
  console.log(`   ${status} ${file.path}: ${file.lines} dòng, ${file.methods} methods`);
});

// Tổng kết
console.log('\n' + '='.repeat(80));
console.log('📊 TỔNG KẾT');
console.log('='.repeat(80));

const totalFiles = results.services.length + results.repos.length;
const refactoredCount = results.services.filter(f => f.isRefactored).length + results.repos.filter(f => f.isRefactored).length;
const needsRefactorCount = results.needsRefactor.length;
const smallFiles = totalFiles - refactoredCount - needsRefactorCount;

console.log(`\n✅ Đã refactor: ${refactoredCount} files`);
console.log(`❌ Cần refactor: ${needsRefactorCount} files`);
console.log(`✓  Files nhỏ (< 200 dòng, < 10 methods): ${smallFiles} files`);
console.log(`📊 Tổng: ${totalFiles} files`);

if (results.largeFiles.length === 0 && results.needsRefactor.length === 0) {
  console.log('\n🎉 HOÀN HẢO! Tất cả files đều tuân thủ SOLID principles!');
  console.log('✅ 100% refactor thành công!');
  process.exit(0);
} else {
  console.log('\n⚠️  Còn một số files cần refactor:');
  if (results.largeFiles.length > 0) {
    console.log(`   - ${results.largeFiles.length} files lớn (> 600 dòng)`);
  }
  if (results.needsRefactor.length > 0) {
    console.log(`   - ${results.needsRefactor.length} files cần refactor (> 200 dòng hoặc > 10 methods)`);
  }
  process.exit(1);
}

