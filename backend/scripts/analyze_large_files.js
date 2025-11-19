/**
 * Script phân tích các file lớn (>600 dòng) và kiểm tra SOLID/Clean Code
 */

const fs = require('fs');
const path = require('path');

const LARGE_FILE_THRESHOLD = 600;
const MAX_METHODS_PER_CLASS = 10; // Clean Code recommendation
const MAX_LINES_PER_METHOD = 50; // Clean Code recommendation

const results = {
  largeFiles: [],
  violations: []
};

/**
 * Đếm số dòng trong file
 */
function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').length;
  } catch (error) {
    return 0;
  }
}

/**
 * Phân tích file để tìm violations
 */
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const lineCount = lines.length;
  
  const violations = [];
  
  // Đếm số methods/functions
  const methodMatches = content.match(/^\s*(async\s+)?(function|class|\w+\s*\([^)]*\)\s*{)/gm);
  const methodCount = methodMatches ? methodMatches.length : 0;
  
  // Đếm số classes
  const classMatches = content.match(/^class\s+\w+/gm);
  const classCount = classMatches ? classMatches.length : 0;
  
  // Tìm methods quá dài
  const longMethods = [];
  let currentMethod = null;
  let methodStartLine = 0;
  let braceCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect method start
    if (line.match(/^\s*(async\s+)?(function\s+\w+|class\s+\w+|\w+\s*\([^)]*\)\s*{)/)) {
      if (currentMethod) {
        const methodLength = i - methodStartLine;
        if (methodLength > MAX_LINES_PER_METHOD) {
          longMethods.push({
            name: currentMethod,
            lines: methodLength,
            startLine: methodStartLine + 1
          });
        }
      }
      currentMethod = line.match(/(?:function|class|\w+)\s+(\w+)/)?.[1] || 'anonymous';
      methodStartLine = i;
      braceCount = (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
    } else {
      braceCount += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
      if (braceCount <= 0 && currentMethod) {
        const methodLength = i - methodStartLine;
        if (methodLength > MAX_LINES_PER_METHOD) {
          longMethods.push({
            name: currentMethod,
            lines: methodLength,
            startLine: methodStartLine + 1
          });
        }
        currentMethod = null;
        braceCount = 0;
      }
    }
  }
  
  // Check SRP violation - quá nhiều methods trong một class/object
  if (methodCount > MAX_METHODS_PER_CLASS) {
    violations.push({
      type: 'SRP_VIOLATION',
      severity: 'HIGH',
      message: `File có ${methodCount} methods/functions (khuyến nghị tối đa ${MAX_METHODS_PER_CLASS})`,
      recommendation: 'Chia nhỏ thành nhiều classes/modules theo Single Responsibility Principle'
    });
  }
  
  // Check long methods
  if (longMethods.length > 0) {
    violations.push({
      type: 'LONG_METHODS',
      severity: 'MEDIUM',
      message: `Có ${longMethods.length} method(s) quá dài (>${MAX_LINES_PER_METHOD} dòng)`,
      details: longMethods,
      recommendation: 'Chia nhỏ methods thành các functions nhỏ hơn'
    });
  }
  
  // Check file quá dài
  if (lineCount > 1000) {
    violations.push({
      type: 'VERY_LARGE_FILE',
      severity: 'HIGH',
      message: `File có ${lineCount} dòng (quá lớn)`,
      recommendation: 'Cân nhắc refactor thành nhiều file nhỏ hơn'
    });
  }
  
  // Check duplicate code patterns
  const duplicatePatterns = findDuplicatePatterns(content);
  if (duplicatePatterns.length > 0) {
    violations.push({
      type: 'CODE_DUPLICATION',
      severity: 'MEDIUM',
      message: `Phát hiện ${duplicatePatterns.length} pattern(s) code trùng lặp`,
      details: duplicatePatterns,
      recommendation: 'Extract common code thành helper functions'
    });
  }
  
  return {
    lineCount,
    methodCount,
    classCount,
    violations,
    longMethods
  };
}

/**
 * Tìm code trùng lặp
 */
function findDuplicatePatterns(content) {
  const patterns = [];
  
  // Tìm các block code giống nhau (đơn giản - tìm các đoạn code lặp lại)
  const lines = content.split('\n');
  const codeBlocks = new Map();
  
  for (let i = 0; i < lines.length - 5; i++) {
    const block = lines.slice(i, i + 5).join('\n');
    if (block.trim().length > 50) {
      if (codeBlocks.has(block)) {
        codeBlocks.set(block, codeBlocks.get(block) + 1);
      } else {
        codeBlocks.set(block, 1);
      }
    }
  }
  
  for (const [block, count] of codeBlocks.entries()) {
    if (count > 2) {
      patterns.push({
        pattern: block.substring(0, 100) + '...',
        occurrences: count
      });
    }
  }
  
  return patterns.slice(0, 5); // Limit to 5 patterns
}

/**
 * Quét tất cả file .js trong thư mục
 */
function scanDirectory(dir, baseDir = '') {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const relativePath = path.join(baseDir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules và các thư mục không cần thiết
      if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
        scanDirectory(filePath, relativePath);
      }
    } else if (file.endsWith('.js')) {
      const lineCount = countLines(filePath);
      
      if (lineCount > LARGE_FILE_THRESHOLD) {
        const analysis = analyzeFile(filePath);
        results.largeFiles.push({
          path: relativePath,
          lineCount,
          ...analysis
        });
      }
    }
  }
}

/**
 * In kết quả
 */
function printResults() {
  console.log('='.repeat(80));
  console.log('📊 PHÂN TÍCH CÁC FILE LỚN (>600 dòng) - SOLID & CLEAN CODE');
  console.log('='.repeat(80));
  
  if (results.largeFiles.length === 0) {
    console.log('\n✅ Không có file nào vượt quá 600 dòng!');
    return;
  }
  
  console.log(`\n📁 Tìm thấy ${results.largeFiles.length} file lớn:\n`);
  
  results.largeFiles.forEach((file, index) => {
    console.log(`${index + 1}. ${file.path}`);
    console.log(`   📏 Số dòng: ${file.lineCount}`);
    console.log(`   🔧 Số methods/functions: ${file.methodCount}`);
    console.log(`   📦 Số classes: ${file.classCount}`);
    
    if (file.violations.length > 0) {
      console.log(`   ⚠️  VIOLATIONS (${file.violations.length}):`);
      file.violations.forEach((violation, vIndex) => {
        console.log(`      ${vIndex + 1}. [${violation.severity}] ${violation.type}`);
        console.log(`         ${violation.message}`);
        console.log(`         💡 ${violation.recommendation}`);
        if (violation.details && violation.details.length > 0) {
          violation.details.slice(0, 3).forEach(detail => {
            if (detail.name) {
              console.log(`            - ${detail.name}: ${detail.lines} dòng (dòng ${detail.startLine})`);
            }
          });
        }
      });
    } else {
      console.log(`   ✅ Không có violations nghiêm trọng`);
    }
    
    if (file.longMethods.length > 0) {
      console.log(`   📝 Methods quá dài:`);
      file.longMethods.slice(0, 5).forEach(method => {
        console.log(`      - ${method.name}: ${method.lines} dòng (dòng ${method.startLine})`);
      });
    }
    
    console.log('');
  });
  
  // Tổng hợp
  const totalViolations = results.largeFiles.reduce((sum, f) => sum + f.violations.length, 0);
  const highSeverity = results.largeFiles.reduce((sum, f) => 
    sum + f.violations.filter(v => v.severity === 'HIGH').length, 0);
  
  console.log('='.repeat(80));
  console.log('📈 TỔNG HỢP:');
  console.log(`   - Tổng số file lớn: ${results.largeFiles.length}`);
  console.log(`   - Tổng số violations: ${totalViolations}`);
  console.log(`   - Violations nghiêm trọng (HIGH): ${highSeverity}`);
  console.log('='.repeat(80));
  
  if (highSeverity > 0) {
    console.log('\n⚠️  CẦN REFACTOR CÁC FILE CÓ VIOLATIONS NGHIÊM TRỌNG!');
  } else {
    console.log('\n✅ Tất cả file đều ở mức chấp nhận được!');
  }
}

// Chạy scan
const srcDir = path.resolve(__dirname, '..', 'src');
if (!fs.existsSync(srcDir)) {
  console.error('❌ Không tìm thấy thư mục src:', srcDir);
  process.exit(1);
}
console.log('🔍 Đang quét thư mục:', srcDir);
scanDirectory(srcDir, 'src');
printResults();

