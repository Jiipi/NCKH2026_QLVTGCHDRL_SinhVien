const fs = require('fs');
const path = require('path');

const oldPatterns = [
  /require\(['"](\.\.\/lib\/|\.\.\/libs\/|\.\.\/shared\/)/,
  /require\(['"]\.\.\/utils\//,
  /from ['"](\.\.\/lib\/|\.\.\/libs\/|\.\.\/shared\/)/
];

let found = [];

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(f => {
    const full = path.join(dir, f);
    if (full.includes('node_modules') || full.includes('repo-reference')) return;
    
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      scanDir(full);
    } else if (f.endsWith('.js')) {
      const content = fs.readFileSync(full, 'utf8');
      for (const pattern of oldPatterns) {
        if (pattern.test(content)) {
          const lines = content.split('\n');
          lines.forEach((line, idx) => {
            if (pattern.test(line)) {
              found.push({
                file: full.replace(process.cwd(), '.'),
                line: idx + 1,
                content: line.trim()
              });
            }
          });
        }
      }
    }
  });
}

scanDir('src');

if (found.length === 0) {
  console.log('✅ Tất cả imports đã được migration đúng cấu trúc!');
  console.log(`📊 Đã quét ${scanDir.filesScanned || 0} files`);
} else {
  console.log('❌ Tìm thấy', found.length, 'import cũ cần sửa:');
  found.forEach(f => {
    console.log(`\n${f.file}:${f.line}`);
    console.log(`  ${f.content}`);
  });
}

process.exit(found.length > 0 ? 1 : 0);
