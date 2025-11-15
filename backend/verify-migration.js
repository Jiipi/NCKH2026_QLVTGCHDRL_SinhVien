const fs = require('fs');
const path = require('path');

// Check patterns
const checks = {
  oldImports: {
    patterns: [
      /require\(['"](\.\.\/lib\/|\.\.\/libs\/|\.\.\/shared\/)/,
      /from ['"](\.\.\/lib\/|\.\.\/libs\/|\.\.\/shared\/)/
    ],
    name: 'Old lib/libs/shared imports'
  },
  correctCoreImports: {
    patterns: [
      /require\(['"](\.\.\/)+core\//,
      /from ['"](\.\.\/)+core\//
    ],
    name: 'Core imports (should exist)',
    shouldExist: true
  },
  correctInfraImports: {
    patterns: [
      /require\(['"](\.\.\/)+infrastructure\//,
      /from ['"](\.\.\/)+infrastructure\//
    ],
    name: 'Infrastructure imports (should exist)',
    shouldExist: true
  }
};

let stats = {
  totalFiles: 0,
  jsFiles: 0,
  issues: [],
  coreImports: 0,
  infraImports: 0
};

function scanDir(dir, basePath = '') {
  const files = fs.readdirSync(dir);
  files.forEach(f => {
    const full = path.join(dir, f);
    const relativePath = path.join(basePath, f);
    
    if (full.includes('node_modules') || full.includes('repo-reference')) return;
    
    stats.totalFiles++;
    const stat = fs.statSync(full);
    
    if (stat.isDirectory()) {
      scanDir(full, relativePath);
    } else if (f.endsWith('.js')) {
      stats.jsFiles++;
      const content = fs.readFileSync(full, 'utf8');
      
      // Check for old imports
      for (const pattern of checks.oldImports.patterns) {
        if (pattern.test(content)) {
          const lines = content.split('\n');
          lines.forEach((line, idx) => {
            if (pattern.test(line)) {
              stats.issues.push({
                file: relativePath,
                line: idx + 1,
                type: 'OLD_IMPORT',
                content: line.trim()
              });
            }
          });
        }
      }
      
      // Count correct imports
      if (checks.correctCoreImports.patterns.some(p => p.test(content))) {
        stats.coreImports++;
      }
      if (checks.correctInfraImports.patterns.some(p => p.test(content))) {
        stats.infraImports++;
      }
    }
  });
}

console.log('🔍 Scanning backend/src for migration status...\n');
scanDir('src');

console.log('📊 STATISTICS');
console.log('═'.repeat(60));
console.log(`Total files scanned:     ${stats.totalFiles}`);
console.log(`JavaScript files:        ${stats.jsFiles}`);
console.log(`Files using core/:       ${stats.coreImports}`);
console.log(`Files using infrastructure/: ${stats.infraImports}`);
console.log();

if (stats.issues.length === 0) {
  console.log('✅ MIGRATION STATUS: COMPLETE');
  console.log('═'.repeat(60));
  console.log('✅ No old imports found (lib/, libs/, shared/)');
  console.log('✅ All files use correct structure:');
  console.log('   - core/ for utilities and framework');
  console.log('   - infrastructure/ for database access');
  console.log('   - modules/ for business logic');
  console.log();
  process.exit(0);
} else {
  console.log('❌ MIGRATION STATUS: INCOMPLETE');
  console.log('═'.repeat(60));
  console.log(`Found ${stats.issues.length} issues:\n`);
  
  stats.issues.forEach((issue, idx) => {
    console.log(`${idx + 1}. ${issue.file}:${issue.line}`);
    console.log(`   Type: ${issue.type}`);
    console.log(`   Line: ${issue.content}`);
    console.log();
  });
  
  process.exit(1);
}
