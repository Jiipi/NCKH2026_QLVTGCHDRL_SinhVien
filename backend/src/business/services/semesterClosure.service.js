const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getSemesterDataDir, getMetadataPath } = require('../../core/utils/paths');
const { prisma } = require('../../data/infrastructure/prisma/client');
const { determineSemesterFromDate, parseSemesterString, normalizeSemesterFormat } = require('../../core/utils/semester');

// Use configurable dir (env) or OS temp as safe writable default
const DATA_DIR = getSemesterDataDir();

function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

function semesterKeyFromInfo({ semester, year }) {
  const hk = semester === 'hoc_ky_1' ? 'HK1' : 'HK2';
  return `${hk}_${year}`; // Changed to underscore for consistency
}

function getCurrentSemesterInfo() {
  // Ưu tiên đọc từ metadata (học kỳ đã được admin kích hoạt)
  const active = readActiveSemesterFromMetadata();
  // Support both formats: hoc_ky_1_2025 (new) and hoc_ky_1-2025 (legacy)
  if (active && /^hoc_ky_[12][_-]\d{4}$/.test(active)) {
    // Normalize to underscore format
    const normalized = normalizeSemesterFormat(active);
    if (normalized) {
      const match = normalized.match(/^hoc_ky_([12])_(\d{4})$/);
      if (match) {
        return { semester: `hoc_ky_${match[1]}`, year: match[2], value: normalized };
      }
    }
  }
  // Fallback: tính từ ngày hiện tại nếu không có metadata
  const info = determineSemesterFromDate(new Date());
  return { semester: info.semester, year: info.year, value: info.value };
}

function stateFilePath(classId, semInfo) {
  const semKey = semesterKeyFromInfo(semInfo);
  const dir = path.join(DATA_DIR, classId, semKey);
  ensureDir(dir);
  return path.join(dir, 'state.json');
}

function snapshotFilePath(classId, semInfo) {
  const semKey = semesterKeyFromInfo(semInfo);
  const dir = path.join(DATA_DIR, classId, semKey);
  ensureDir(dir);
  return path.join(dir, 'snapshot.json');
}

function readActiveSemesterFromMetadata() {
  try {
    const metadataPath = getMetadataPath();
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      return metadata.active_semester || null; // format: hoc_ky_1-YYYY (YYYY depends on HK)
    }
  } catch {}
  return null;
}

function readState(classId, semInfo) {
  const fp = stateFilePath(classId, semInfo);
  // Try modern path first (HK1-YYYY)
  if (!fs.existsSync(fp)) {
    // Fallback: legacy path (hoc_ky_1_YYYY)
    const legacyDir = path.join(DATA_DIR, classId, `${semInfo.semester}_${semInfo.year}`);
    const legacyFp = path.join(legacyDir, 'state.json');
    if (fs.existsSync(legacyFp)) {
      try {
        return JSON.parse(fs.readFileSync(legacyFp, 'utf8'));
      } catch {
        // ignore and fall through to default state
      }
    }
    // If there's no state file, infer default by global active semester
    const active = readActiveSemesterFromMetadata();
    const currentSemesterValue = `${semInfo.semester}-${semInfo.year}`;
    
    // Nếu không có metadata, tính học kỳ từ ngày hiện tại
    const currentFromDate = determineSemesterFromDate(new Date());
    const calculatedValue = `${currentFromDate.semester}-${currentFromDate.year}`;
    
    // Học kỳ được coi là ACTIVE nếu:
    // 1. Khớp với active_semester trong metadata, hoặc
    // 2. Không có metadata và khớp với học kỳ tính từ ngày hiện tại
    const isActive = (active && active === currentSemesterValue) || 
                     (!active && currentSemesterValue === calculatedValue);
    
    return {
      classId,
      semester: semInfo.semester,
      year: semInfo.year,
      state: isActive ? 'ACTIVE' : 'LOCKED_HARD',
      lock_level: null,
      proposed_by: null,
      approved_by: null,
      closed_by: null,
      closed_at: null,
      grace_until: null,
      version: 1,
      snapshot_checksum: null
    };
  }
  try {
    return JSON.parse(fs.readFileSync(fp, 'utf8'));
  } catch {
    return null;
  }
}

function writeState(classId, semInfo, data) {
  const fp = stateFilePath(classId, semInfo);
  fs.writeFileSync(fp, JSON.stringify(data, null, 2), 'utf8');
  return data;
}

async function computeSnapshot(classId, semInfo) {
  // Collect raw data for safety: registrations and attendance for students of class within semester
  // 1) list students (SinhVien) of class
  const students = await prisma.sinhVien.findMany({ where: { lop_id: classId }, select: { id: true, nguoi_dung_id: true, mssv: true } });
  const studentIds = students.map(s => s.id);
  // 2) list activities in semester
  const hoc_ky = semInfo.semester;
  // Data đã chuẩn hóa sang năm đơn, dùng exact match
  const nam_hoc = semInfo.year;
  const activities = await prisma.hoatDong.findMany({
    where: { hoc_ky, nam_hoc },
    select: { id: true, ten_hd: true, ngay_bd: true, ngay_kt: true, hoc_ky: true, nam_hoc: true, loai_hd_id: true, diem_rl: true }
  });
  const activityIds = activities.map(a => a.id);
  // 3) registrations for students in these activities
  const registrations = await prisma.dangKyHoatDong.findMany({
    where: { sv_id: { in: studentIds }, hd_id: { in: activityIds } }
  });
  // 4) attendance for students in these activities
  const attendance = await prisma.diemDanh.findMany({
    where: { sv_id: { in: studentIds }, hd_id: { in: activityIds } }
  });
  const payload = { classId, semester: semInfo.semester, year: semInfo.year, activities, registrations, attendance, generatedAt: new Date().toISOString() };
  const json = JSON.stringify(payload);
  const checksum = crypto.createHash('sha256').update(json).digest('hex');
  fs.writeFileSync(snapshotFilePath(classId, semInfo), json, 'utf8');
  return { checksum };
}

function nowPlusHours(hours) {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  return d.toISOString();
}

async function getUserClassId(userId) {
  const sv = await prisma.sinhVien.findFirst({ where: { nguoi_dung_id: userId }, select: { lop_id: true } });
  return sv?.lop_id || null;
}

// Derive the target year from hoc_ky and nam_hoc robustly.
// - Normal: nam_hoc like 'YYYY-YYYY+1' -> HK1 => year1, HK2 => year2
// - Corrupt/misaligned: if difference != 1, try to use active semester year when it appears inside nam_hoc
function deriveYear(hoc_ky, nam_hoc) {
  const match = (nam_hoc || '').match(/(\d{4})-(\d{4})/);
  if (!match) return null;
  const y1 = parseInt(match[1], 10);
  const y2 = parseInt(match[2], 10);
  if (y2 - y1 === 1) {
    return hoc_ky === 'hoc_ky_1' ? String(y1) : String(y2);
  }
  // Fallback: look at active semester metadata and prefer that year if present in the string
  const active = readActiveSemesterFromMetadata();
  // Support both formats: hoc_ky_1_2025 (new) and hoc_ky_1-2025 (legacy)
  const activeMatch = active ? active.match(/^hoc_ky_[12][_-](\d{4})$/) : null;
  if (activeMatch && active.includes(hoc_ky)) {
    const activeYear = activeMatch[1];
    if ((nam_hoc || '').includes(activeYear)) return activeYear;
  }
  // Final fallback: pick closer side consistent with hoc_ky
  return hoc_ky === 'hoc_ky_1' ? String(y1) : String(y2);
}

const SemesterClosureService = {
  semesterKeyFromInfo,
  getCurrentSemesterInfo,
  getStatus(classId, semesterStr) {
    let semInfo;
    if (semesterStr) {
      semInfo = parseSemesterString(semesterStr) || getCurrentSemesterInfo();
    } else {
      const active = readActiveSemesterFromMetadata();
      // Support both formats: hoc_ky_1_2025 (new) and hoc_ky_1-2025 (legacy)
      const activeMatch = active ? active.match(/^hoc_ky_([12])[_-](\d{4})$/) : null;
      if (activeMatch) {
        semInfo = { semester: `hoc_ky_${activeMatch[1]}`, year: activeMatch[2] };
      } else {
        semInfo = getCurrentSemesterInfo();
      }
    }
    const state = readState(classId, semInfo) || { error: 'state_corrupted' };
    return { semInfo, state };
  },
  checkWritableForClassSemesterOrThrow({ classId, hoc_ky, nam_hoc, userRole = null }) {
    // Determine semester/year key strictly from provided fields
    const pair = (nam_hoc || '').match(/(\d{4})-(\d{4})/);
    if (!classId || !hoc_ky || !pair) return; // cannot evaluate, allow
    const year = deriveYear(hoc_ky, nam_hoc);
    const semInfo = { semester: hoc_ky, year };
    const debug = process.env.DEBUG_SEMESTER === '1';
    if (debug) {
      console.log('[SemesterLock][ClassCheck] input:', { classId, hoc_ky, nam_hoc, userRole });
      console.log('[SemesterLock][ClassCheck] computed semInfo:', semInfo);
    }
    
    // Check if this semester is globally active (metadata uses value `${hoc_ky}-${year}`)
    const activeSemester = readActiveSemesterFromMetadata();
    const currentValue = `${hoc_ky}-${year}`;
    const isGloballyActive = activeSemester === currentValue;
    if (debug) {
      console.log('[SemesterLock][ClassCheck] metadata.active_semester:', activeSemester, 'currentValue:', currentValue, 'isGloballyActive:', isGloballyActive);
    }
    
    // If globally active, allow all operations
    if (isGloballyActive) {
      if (debug) console.log('[SemesterLock][ClassCheck] allow: globally active');
      return; // Allow operations on globally active semester
    }
    
    // ADMIN always bypasses lock checks for non-active semesters
    if (userRole && (userRole === 'ADMIN' || userRole === 'admin')) {
      if (debug) console.log('[SemesterLock][ClassCheck] allow: admin bypass');
      return; // Admin can work on any semester
    }
    
    // Otherwise, check class-level lock state
    const state = readState(classId, semInfo);
    // Do NOT block when state is CLOSING — approvals/updates are still allowed until admin confirms
    if (state && (state.state === 'LOCKED_SOFT' || state.state === 'LOCKED_HARD')) {
      const hard = state.state === 'LOCKED_HARD';
      const softExpired = state.state === 'LOCKED_SOFT' && state.grace_until && new Date(state.grace_until) < new Date();
      if (debug) console.log('[SemesterLock][ClassCheck] state:', state, 'hard:', hard, 'softExpired:', softExpired);
      if (hard || softExpired) {
        const label = semesterKeyFromInfo(semInfo);
        const err = new Error(`SEMESTER_CLOSED_${state.state}`);
        err.status = 423; // Locked
        err.details = { classId, semester: label, state: state.state };
        if (debug) console.log('[SemesterLock][ClassCheck] block -> throw 423', err.details);
        throw err;
      }
    }
    if (debug) console.log('[SemesterLock][ClassCheck] allow: not locked');
  },
  async proposeClose({ classId, actorId, semesterStr }) {
    const semInfo = semesterStr ? (parseSemesterString(semesterStr) || getCurrentSemesterInfo()) : getCurrentSemesterInfo();
    const state = readState(classId, semInfo);
    if (!state) throw new Error('STATE_READ_FAILED');
    if (['LOCKED_HARD', 'ARCHIVED'].includes(state.state)) throw new Error('ALREADY_LOCKED');
    if (state.state !== 'ACTIVE') {
      // idempotent if already closing
      if (state.state === 'CLOSING') return writeState(classId, semInfo, state);
      // allow from LOCKED_SOFT to remain
    }
    state.state = 'CLOSING';
    state.proposed_by = actorId;
    state.version = (state.version || 1) + 1;
    return writeState(classId, semInfo, state);
  },
  async softLock({ classId, actorId, semesterStr, graceHours = 72 }) {
    const semInfo = semesterStr ? (parseSemesterString(semesterStr) || getCurrentSemesterInfo()) : getCurrentSemesterInfo();
    const state = readState(classId, semInfo);
    if (!state) throw new Error('STATE_READ_FAILED');
    if (['LOCKED_HARD', 'ARCHIVED'].includes(state.state)) throw new Error('ALREADY_LOCKED');
    // checklist: ensure no pending registrations for class students within semester
    const students = await prisma.sinhVien.findMany({ where: { lop_id: classId }, select: { id: true } });
    // Data đã chuẩn hóa sang năm đơn
    const activityIds = (await prisma.hoatDong.findMany({ where: { hoc_ky: semInfo.semester, nam_hoc: semInfo.year }, select: { id: true } })).map(a => a.id);
    const pending = await prisma.dangKyHoatDong.count({ where: { sv_id: { in: students.map(s => s.id) }, hd_id: { in: activityIds }, trang_thai_dk: { in: ['cho_duyet', 'tu_choi'] } } });
    if (pending > 0) throw new Error('CHECKLIST_PENDING_REGISTRATIONS');
    // snapshot
    const snap = await computeSnapshot(classId, semInfo);
    state.state = 'LOCKED_SOFT';
    state.lock_level = 'SOFT';
    state.grace_until = nowPlusHours(graceHours);
    state.closed_by = actorId;
    state.closed_at = new Date().toISOString();
    state.snapshot_checksum = snap.checksum;
    state.version = (state.version || 1) + 1;
    return writeState(classId, semInfo, state);
  },
  async rollback({ classId, actorId, semesterStr }) {
    const semInfo = semesterStr ? (parseSemesterString(semesterStr) || getCurrentSemesterInfo()) : getCurrentSemesterInfo();
    const state = readState(classId, semInfo);
    if (!state) throw new Error('STATE_READ_FAILED');
    // Allow rollback from CLOSING (dev/admin convenience) and from LOCKED_SOFT within grace
    if (state.state === 'LOCKED_SOFT') {
      if (state.grace_until && new Date(state.grace_until) < new Date()) throw new Error('GRACE_EXPIRED');
    } else if (state.state !== 'CLOSING') {
      throw new Error('NOT_SOFT_LOCKED');
    }
    state.state = 'ACTIVE';
    state.lock_level = null;
    state.grace_until = null;
    state.approved_by = null;
    state.closed_by = null;
    state.closed_at = null;
    state.version = (state.version || 1) + 1;
    return writeState(classId, semInfo, state);
  },
  async hardLock({ classId, actorId, semesterStr }) {
    const semInfo = semesterStr ? (parseSemesterString(semesterStr) || getCurrentSemesterInfo()) : getCurrentSemesterInfo();
    const state = readState(classId, semInfo);
    if (!state) throw new Error('STATE_READ_FAILED');
    state.state = 'LOCKED_HARD';
    state.lock_level = 'HARD';
    state.grace_until = null;
    state.closed_by = actorId;
    state.closed_at = new Date().toISOString();
    state.version = (state.version || 1) + 1;
    return writeState(classId, semInfo, state);
  },
  async enforceWritableForUserSemesterOrThrow({ userId, hoc_ky, nam_hoc, userRole = null }) {
    const classId = await getUserClassId(userId);
    if (!classId) return; // non-student actions
    // Determine semester/year key strictly from provided fields
    const pair = (nam_hoc || '').match(/(\d{4})-(\d{4})/);
    if (!hoc_ky || !pair) return; // cannot evaluate, allow
    const year = deriveYear(hoc_ky, nam_hoc);
    const semInfo = { semester: hoc_ky, year };
    const debug = process.env.DEBUG_SEMESTER === '1';
    if (debug) {
      console.log('[SemesterLock][UserCheck] input:', { userId, classId, hoc_ky, nam_hoc, userRole });
      console.log('[SemesterLock][UserCheck] computed semInfo:', semInfo);
    }
    
    // Globally active allows writes regardless of class lock state
    const activeSemester = readActiveSemesterFromMetadata();
    if (debug) console.log('[SemesterLock][UserCheck] metadata.active_semester:', activeSemester, 'currentValue:', `${hoc_ky}-${year}`);
    if (activeSemester && activeSemester === `${hoc_ky}-${year}`) {
      if (debug) console.log('[SemesterLock][UserCheck] allow: globally active');
      return;
    }
    
    // ADMIN always bypasses lock checks
    if (userRole && (userRole === 'ADMIN' || userRole === 'admin')) {
      if (debug) console.log('[SemesterLock][UserCheck] allow: admin bypass');
      return; // Admin can work on any semester
    }
    
    const state = readState(classId, semInfo);
    // Allow writes during CLOSING; only block when soft/hard locked
    if (state && (state.state === 'LOCKED_SOFT' || state.state === 'LOCKED_HARD')) {
      const hard = state.state === 'LOCKED_HARD';
      const softExpired = state.state === 'LOCKED_SOFT' && state.grace_until && new Date(state.grace_until) < new Date();
      if (debug) console.log('[SemesterLock][UserCheck] state:', state, 'hard:', hard, 'softExpired:', softExpired);
      if (hard || softExpired) {
        const label = semesterKeyFromInfo(semInfo);
        const err = new Error(`SEMESTER_CLOSED_${state.state}`);
        err.status = 423; // Locked
        err.details = { classId, semester: label, state: state.state };
        if (debug) console.log('[SemesterLock][UserCheck] block -> throw 423', err.details);
        throw err;
      }
    }
    if (debug) console.log('[SemesterLock][UserCheck] allow: not locked');
  }
};

module.exports = SemesterClosureService;




