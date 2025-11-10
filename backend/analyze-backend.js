/**
 * Analyze Backend File Sizes
 * Kiểm tra độ dài tất cả files trong backend
 */

const fs = require('fs');
const path = require('path');

// Config
const MAX_LINES_ACCEPTABLE = 300;
const MAX_LINES_WARNING = 500;
const EXCLUDED_DIRS = ['node_modules', 'dist', 'build', 'coverage', '.git', 'uploads', 'logs', 'data', 'backups', 'prisma/migrations'];
const INCLUDED_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx'];

// Analyze directory recursively
function analyzeDirectory(dirPath, basePath = '') {
  const results = [];
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.join(basePath, entry.name);
      
      if (entry.isDirectory()) {
        // Skip excluded directories
        if (EXCLUDED_DIRS.some(excluded => relativePath.includes(excluded))) {
          continue;
        }
        
        // Recurse into subdirectories
        results.push(...analyzeDirectory(fullPath, relativePath));
      } else if (entry.isFile()) {
        // Check if file extension is included
        const ext = path.extname(entry.name);
        if (INCLUDED_EXTENSIONS.includes(ext)) {
          try {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const lines = content.split('\n').length;
            
            results.push({
              path: relativePath,
              lines,
              fullPath
            });
          } catch (err) {
            // Skip files that can't be read
          }
        }
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dirPath}:`, err.message);
  }
  
  return results;
}

// Categorize files
function categorizeFiles(files) {
  const categories = {
    excellent: [],    // < 300 lines
    acceptable: [],   // 300-500 lines
    needsWork: [],    // 500-1000 lines
    critical: []      // > 1000 lines
  };
  
  files.forEach(file => {
    if (file.lines < MAX_LINES_ACCEPTABLE) {
      categories.excellent.push(file);
    } else if (file.lines < MAX_LINES_WARNING) {
      categories.acceptable.push(file);
    } else if (file.lines < 1000) {
      categories.needsWork.push(file);
    } else {
      categories.critical.push(file);
    }
  });
  
  return categories;
}

// Group by directory
function groupByDirectory(files) {
  const groups = {};
  
  files.forEach(file => {
    const dir = path.dirname(file.path);
    if (!groups[dir]) {
      groups[dir] = [];
    }
    groups[dir].push(file);
  });
  
  return groups;
}

// Main analysis
console.log('🔍 ANALYZING BACKEND FILE SIZES\n');
console.log('━'.repeat(80));

const backendPath = path.join(__dirname, 'src');
const allFiles = analyzeDirectory(backendPath);

// Sort by lines descending
allFiles.sort((a, b) => b.lines - a.lines);

const categories = categorizeFiles(allFiles);

console.log('\n📊 SUMMARY BY CATEGORY\n');
console.log('━'.repeat(80));

console.log(`\n🔴 CRITICAL (> 1000 lines) - NEEDS MIGRATION: ${categories.critical.length} files`);
if (categories.critical.length > 0) {
  categories.critical.forEach((file, idx) => {
    console.log(`   ${idx + 1}. ${file.path.padEnd(60)} ${file.lines.toString().padStart(5)} lines`);
  });
}

console.log(`\n🟡 NEEDS WORK (500-1000 lines) - SHOULD MIGRATE: ${categories.needsWork.length} files`);
if (categories.needsWork.length > 0) {
  categories.needsWork.forEach((file, idx) => {
    console.log(`   ${idx + 1}. ${file.path.padEnd(60)} ${file.lines.toString().padStart(5)} lines`);
  });
}

console.log(`\n🟢 ACCEPTABLE (300-500 lines): ${categories.acceptable.length} files`);
if (categories.acceptable.length > 0) {
  categories.acceptable.slice(0, 10).forEach((file, idx) => {
    console.log(`   ${idx + 1}. ${file.path.padEnd(60)} ${file.lines.toString().padStart(5)} lines`);
  });
  if (categories.acceptable.length > 10) {
    console.log(`   ... and ${categories.acceptable.length - 10} more`);
  }
}

console.log(`\n✅ EXCELLENT (< 300 lines): ${categories.excellent.length} files`);
console.log(`   (Not showing details - all good!)`);

// Analysis by directory
console.log('\n\n📁 ANALYSIS BY DIRECTORY\n');
console.log('━'.repeat(80));

const grouped = groupByDirectory(allFiles);
const dirStats = Object.keys(grouped).map(dir => {
  const files = grouped[dir];
  const totalLines = files.reduce((sum, f) => sum + f.lines, 0);
  const avgLines = Math.round(totalLines / files.length);
  const maxLines = Math.max(...files.map(f => f.lines));
  
  return { dir, files: files.length, totalLines, avgLines, maxLines };
});

dirStats.sort((a, b) => b.maxLines - a.maxLines);

dirStats.forEach((stat, idx) => {
  const status = stat.maxLines > 1000 ? '🔴' : stat.maxLines > 500 ? '🟡' : stat.avgLines > 300 ? '🟢' : '✅';
  console.log(`${status} ${stat.dir}`);
  console.log(`   Files: ${stat.files} | Total: ${stat.totalLines} lines | Avg: ${stat.avgLines} | Max: ${stat.maxLines}`);
});

// V2 modules analysis
console.log('\n\n🎯 V2 MODULES STATUS\n');
console.log('━'.repeat(80));

const v2Modules = ['activities', 'registrations', 'users', 'classes'];
const v2Files = allFiles.filter(f => f.path.includes('modules/'));

if (v2Files.length > 0) {
  const v2Grouped = groupByDirectory(v2Files);
  
  v2Modules.forEach(module => {
    const moduleFiles = v2Files.filter(f => f.path.includes(`modules/${module}`));
    if (moduleFiles.length > 0) {
      const totalLines = moduleFiles.reduce((sum, f) => sum + f.lines, 0);
      console.log(`\n✅ ${module} module:`);
      moduleFiles.forEach(f => {
        console.log(`   ${path.basename(f.path).padEnd(30)} ${f.lines.toString().padStart(4)} lines`);
      });
      console.log(`   Total: ${totalLines} lines`);
    }
  });
} else {
  console.log('   No V2 modules found');
}

// Top 20 largest files
console.log('\n\n🔝 TOP 20 LARGEST FILES\n');
console.log('━'.repeat(80));

allFiles.slice(0, 20).forEach((file, idx) => {
  const status = file.lines > 1000 ? '🔴' : file.lines > 500 ? '🟡' : file.lines > 300 ? '🟢' : '✅';
  console.log(`${(idx + 1).toString().padStart(2)}. ${status} ${file.path.padEnd(65)} ${file.lines.toString().padStart(5)} lines`);
});

// Migration recommendations
console.log('\n\n💡 MIGRATION RECOMMENDATIONS\n');
console.log('━'.repeat(80));

const needsMigration = [...categories.critical, ...categories.needsWork];
if (needsMigration.length === 0) {
  console.log('✅ All files are in good shape! No migration needed.\n');
} else {
  console.log(`\n📋 Priority files to migrate (${needsMigration.length} files):\n`);
  
  needsMigration.slice(0, 15).forEach((file, idx) => {
    const priority = file.lines > 1000 ? 'HIGH' : 'MEDIUM';
    console.log(`   ${(idx + 1).toString().padStart(2)}. [${priority.padEnd(6)}] ${file.path}`);
    console.log(`       Current: ${file.lines} lines → Target: ~150-250 lines per file`);
  });
  
  if (needsMigration.length > 15) {
    console.log(`\n   ... and ${needsMigration.length - 15} more files`);
  }
}

// Final statistics
console.log('\n\n📈 OVERALL STATISTICS\n');
console.log('━'.repeat(80));

const totalLines = allFiles.reduce((sum, f) => sum + f.lines, 0);
const avgLines = Math.round(totalLines / allFiles.length);

console.log(`Total Files Analyzed: ${allFiles.length}`);
console.log(`Total Lines of Code: ${totalLines.toLocaleString()}`);
console.log(`Average Lines per File: ${avgLines}`);
console.log(`\nFile Distribution:`);
console.log(`  ✅ Excellent (< 300):     ${categories.excellent.length.toString().padStart(4)} files (${Math.round(categories.excellent.length / allFiles.length * 100)}%)`);
console.log(`  🟢 Acceptable (300-500):  ${categories.acceptable.length.toString().padStart(4)} files (${Math.round(categories.acceptable.length / allFiles.length * 100)}%)`);
console.log(`  🟡 Needs Work (500-1000): ${categories.needsWork.length.toString().padStart(4)} files (${Math.round(categories.needsWork.length / allFiles.length * 100)}%)`);
console.log(`  🔴 Critical (> 1000):     ${categories.critical.length.toString().padStart(4)} files (${Math.round(categories.critical.length / allFiles.length * 100)}%)`);

console.log('\n' + '━'.repeat(80));

// Save detailed report to file
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    totalFiles: allFiles.length,
    totalLines,
    avgLines,
    categories: {
      excellent: categories.excellent.length,
      acceptable: categories.acceptable.length,
      needsWork: categories.needsWork.length,
      critical: categories.critical.length
    }
  },
  needsMigration,
  allFiles: allFiles.slice(0, 50) // Top 50 largest
};

fs.writeFileSync(
  path.join(__dirname, 'backend-analysis-report.json'),
  JSON.stringify(report, null, 2)
);

console.log('\n✅ Detailed report saved to: backend-analysis-report.json\n');
