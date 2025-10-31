const path = require('path');
const os = require('os');
const fs = require('fs');

function getSemesterDataDir() {
  const base = process.env.SEMESTER_DATA_DIR || process.env.DATA_DIR;
  const dir = base && base.trim().length > 0
    ? base
    : path.join(os.tmpdir(), 'semesters-data');
  // Ensure base exists lazily; callers may also ensure nested dirs
  if (!fs.existsSync(dir)) {
    try { fs.mkdirSync(dir, { recursive: true }); } catch {
      // ignore; callers may attempt again for nested paths
    }
  }
  return dir;
}

function getMetadataPath() {
  return path.join(getSemesterDataDir(), 'metadata.json');
}

module.exports = {
  getSemesterDataDir,
  getMetadataPath
};


