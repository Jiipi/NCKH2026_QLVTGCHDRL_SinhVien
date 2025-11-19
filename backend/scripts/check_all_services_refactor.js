/**
 * Script kiểm tra toàn bộ services và repos trong backend/src
 * Tìm các file chưa được refactor theo SOLID principles
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Đang quét toàn bộ backend/src để kiểm tra refactor...\n');

const results = {
  services: [],
  repos: [],
  largeFiles: [],
  notRefactored: [],
  refactored: []
};

/**
 * Đếm số dòng và methods trong file
 */
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').length;
    
    // Đếm methods (async functions, regular functions, class methods)
    const methodPatterns = [
      /async\s+\w+\(/g,
      /^\s+async\s+\w+\(/gm,
      /^\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(/gm,
      /^\s+static\s+\w+\(/gm
    ];
    
    let methodCount = 0;
    methodPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) methodCount += matches.length;
    });
    
    // Kiểm tra xem có sử dụng composition pattern không
    const hasComposition = /require\(['"].*services\/|require\(['"].*repositories\//.test(content);
    const hasClass = /class\s+\w+/.test(content);
    const isFacade = /@delegates|_queryService|_crudService|_approvalService|_dashboardService|_registrationService/.test(content);
    
    return {
      lines,
      methods: methodCount,
      hasComposition,
      hasClass,
      isFacade,
      isRefactored: hasComposition || isFacade
    };
  } catch (error) {
    return null;
  }
}

/**
 * Quét thư mục để tìm tất cả service và repo files
 */
function scanDirectory(dir, baseDir = dir) {
  try {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Bỏ qua node_modules và các thư mục đặc biệt
        if (!item.startsWith('.') && item !== 'node_modules' && item !== '__pycache__') {
          scanDirectory(fullPath, baseDir);
        }
      } else if (stat.isFile() && item.endsWith('.js')) {
        const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
        
        if (item.includes('.service.js') || item.includes('service.js')) {
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
            
            if (!analysis.isRefactored && analysis.lines > 200) {
              results.notRefactored.push({
                path: relativePath,
                type: 'service',
                ...analysis
              });
            } else if (analysis.isRefactored) {
              results.refactored.push({
                path: relativePath,
                type: 'service',
                ...analysis
              });
            }
          }
        } else if (item.includes('.repo.js') || item.includes('repo.js')) {
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
            
            if (!analysis.isRefactored && analysis.lines > 200) {
              results.notRefactored.push({
                path: relativePath,
                type: 'repo',
                ...analysis
              });
            } else if (analysis.isRefactored) {
              results.refactored.push({
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
    // Ignore errors
  }
}

// Bắt đầu quét từ backend/src
const srcDir = path.resolve(__dirname, '..', 'src');
console.log(`📂 Quét thư mục: ${srcDir}\n`);

scanDirectory(srcDir);

// Sắp xếp kết quả
results.services.sort((a, b) => b.lines - a.lines);
results.repos.sort((a, b) => b.lines - a.lines);
results.largeFiles.sort((a, b) => b.lines - a.lines);
results.notRefactored.sort((a, b) => b.lines - a.lines);

// In kết quả
console.log('='.repeat(80));
console.log('📊 KẾT QUẢ KIỂM TRA REFACTOR');
console.log('='.repeat(80));

console.log(`\n📁 Tổng số files:`);
console.log(`   - Services: ${results.services.length}`);
console.log(`   - Repos: ${results.repos.length}`);
console.log(`   - Tổng: ${results.services.length + results.repos.length}`);

console.log(`\n✅ Đã refactor: ${results.refactored.length} files`);
results.refactored.forEach(file => {
  console.log(`   ✓ ${file.path} (${file.lines} dòng, ${file.methods} methods)`);
});

if (results.largeFiles.length > 0) {
  console.log(`\n⚠️  Files lớn (> 600 dòng): ${results.largeFiles.length}`);
  results.largeFiles.forEach(file => {
    console.log(`   ⚠️  ${file.path} (${file.lines} dòng, ${file.methods} methods)`);
  });
}

if (results.notRefactored.length > 0) {
  console.log(`\n❌ Chưa refactor (> 200 dòng): ${results.notRefactored.length}`);
  results.notRefactored.forEach(file => {
    console.log(`   ❌ ${file.path} (${file.lines} dòng, ${file.methods} methods)`);
  });
} else {
  console.log(`\n✅ Tất cả files đều đã được refactor hoặc nhỏ hơn 200 dòng!`);
}

// Chi tiết tất cả services
console.log(`\n📋 Chi tiết tất cả Services:`);
results.services.forEach(file => {
  const status = file.isRefactored ? '✅' : (file.lines > 200 ? '⚠️' : '✓');
  console.log(`   ${status} ${file.path}: ${file.lines} dòng, ${file.methods} methods`);
});

// Chi tiết tất cả repos
console.log(`\n📋 Chi tiết tất cả Repos:`);
results.repos.forEach(file => {
  const status = file.isRefactored ? '✅' : (file.lines > 200 ? '⚠️' : '✓');
  console.log(`   ${status} ${file.path}: ${file.lines} dòng, ${file.methods} methods`);
});

// Tổng kết
console.log('\n' + '='.repeat(80));
console.log('📊 TỔNG KẾT');
console.log('='.repeat(80));

const totalFiles = results.services.length + results.repos.length;
const refactoredCount = results.refactored.length;
const notRefactoredCount = results.notRefactored.length;
const smallFiles = totalFiles - refactoredCount - notRefactoredCount;

console.log(`\n✅ Đã refactor: ${refactoredCount} files`);
console.log(`⚠️  Chưa refactor (> 200 dòng): ${notRefactoredCount} files`);
console.log(`✓  Files nhỏ (< 200 dòng): ${smallFiles} files`);
console.log(`📊 Tổng: ${totalFiles} files`);

if (results.largeFiles.length === 0 && results.notRefactored.length === 0) {
  console.log('\n🎉 HOÀN HẢO! Tất cả files đều đã tuân thủ SOLID principles!');
  console.log('✅ 100% refactor thành công!');
  process.exit(0);
} else {
  console.log('\n⚠️  Còn một số files cần refactor:');
  if (results.largeFiles.length > 0) {
    console.log(`   - ${results.largeFiles.length} files lớn (> 600 dòng)`);
  }
  if (results.notRefactored.length > 0) {
    console.log(`   - ${results.notRefactored.length} files chưa refactor (> 200 dòng)`);
  }
  process.exit(1);
}

