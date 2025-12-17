/**
 * Semester Closure Service
 * Manages semester lifecycle states (ACTIVE, CLOSING, LOCKED_SOFT, LOCKED_HARD)
 * with file-based state persistence per class/semester
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PrismaClient, HocKy } from '@prisma/client';
import { logInfo, logError } from '../../core/logger';

const prisma = new PrismaClient();
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../../../data');

// Types for semester closure service
interface SemesterInfo {
  semester: string;
  year: string;
}

interface SemesterState {
  state: 'ACTIVE' | 'CLOSING' | 'LOCKED_SOFT' | 'LOCKED_HARD' | 'ARCHIVED';
  lock_level?: 'SOFT' | 'HARD' | null;
  grace_until?: string | null;
  proposed_by?: number | null;
  closed_by?: number | null;
  closed_at?: string | null;
  approved_by?: number | null;
  snapshot_checksum?: string | null;
  version: number;
  error?: string;
}

interface SemesterSnapshot {
  checksum: string;
  data: any;
}

interface StatusResult {
  semInfo: SemesterInfo;
  state: SemesterState | { error: string };
}

/**
 * Read the active semester from metadata.json
 */
function readActiveSemesterFromMetadata(): string | null {
  try {
    const metaPath = path.join(DATA_DIR, 'metadata.json');
    if (fs.existsSync(metaPath)) {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      return meta.active_semester || null;
    }
  } catch (err) {
    logError('Failed to read metadata.json', { error: (err as Error).message });
  }
  return null;
}

/**
 * Parse semester string like "hoc_ky_1_2025" to SemesterInfo
 */
function parseSemesterString(semesterStr: string): SemesterInfo | null {
  // Support both formats: hoc_ky_1_2025 (new) and hoc_ky_1-2025 (legacy)
  const match = semesterStr.match(/^(hoc_ky_[12])[_-](\d{4})$/);
  if (match) {
    return { semester: match[1], year: match[2] };
  }
  return null;
}

/**
 * Get current semester info based on date
 */
function getCurrentSemesterInfo(): SemesterInfo {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();
  
  // Academic year logic:
  // - Semester 1 (hoc_ky_1): September - January (year of Sep)
  // - Semester 2 (hoc_ky_2): February - August (year of Feb)
  let semester: string;
  let academicYear: string;
  
  if (month >= 9) {
    // Sep-Dec: Semester 1 of current year
    semester = 'hoc_ky_1';
    academicYear = String(year);
  } else if (month >= 2) {
    // Feb-Aug: Semester 2 of previous year
    semester = 'hoc_ky_2';
    academicYear = String(year);
  } else {
    // Jan: Semester 1 of previous year (still in HK1)
    semester = 'hoc_ky_1';
    academicYear = String(year - 1);
  }
  
  return { semester, year: academicYear };
}

/**
 * Generate semester key from semester info
 */
function semesterKeyFromInfo(semInfo: SemesterInfo): string {
  return `${semInfo.semester}_${semInfo.year}`;
}

/**
 * Get state file path for a class/semester
 */
function getStateFilePath(classId: string, semInfo: SemesterInfo): string {
  const semKey = semesterKeyFromInfo(semInfo);
  const semDir = path.join(DATA_DIR, 'semesters', semKey);
  if (!fs.existsSync(semDir)) {
    fs.mkdirSync(semDir, { recursive: true });
  }
  return path.join(semDir, `class_${classId}.json`);
}

/**
 * Read state for a class/semester
 */
function readState(classId: string, semInfo: SemesterInfo): SemesterState | null {
  try {
    const statePath = getStateFilePath(classId, semInfo);
    if (fs.existsSync(statePath)) {
      return JSON.parse(fs.readFileSync(statePath, 'utf8'));
    }
    // Return default active state if no file exists
    return {
      state: 'ACTIVE',
      lock_level: null,
      grace_until: null,
      version: 1
    };
  } catch (err) {
    logError('Failed to read semester state', { classId, semInfo, error: (err as Error).message });
    return null;
  }
}

/**
 * Write state for a class/semester
 */
function writeState(classId: string, semInfo: SemesterInfo, state: SemesterState): SemesterState {
  try {
    const statePath = getStateFilePath(classId, semInfo);
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf8');
    logInfo('Semester state written', { classId, semInfo, state: state.state });
    return state;
  } catch (err) {
    logError('Failed to write semester state', { classId, semInfo, error: (err as Error).message });
    throw err;
  }
}

/**
 * Compute snapshot for a class/semester (for data integrity)
 */
async function computeSnapshot(classId: string, semInfo: SemesterInfo): Promise<SemesterSnapshot> {
  // Get all students in class
  const students = await prisma.sinhVien.findMany({
    where: { lop_id: classId },
    select: { id: true, nguoi_dung_id: true }
  });
  const studentIds = students.map(s => s.id);
  
  // Get all activities for this semester
  const activities = await prisma.hoatDong.findMany({
    where: { hoc_ky: semInfo.semester as HocKy, nam_hoc: semInfo.year },
    select: { id: true }
  });
  const activityIds = activities.map(a => a.id);
  
  // Get all registrations for these students and activities
  const registrations = await prisma.dangKyHoatDong.findMany({
    where: {
      sv_id: { in: studentIds },
      hd_id: { in: activityIds }
    },
    select: {
      id: true,
      sv_id: true,
      hd_id: true,
      trang_thai_dk: true
    }
  });
  
  // Create snapshot data
  const snapshotData = {
    classId,
    semester: semesterKeyFromInfo(semInfo),
    timestamp: new Date().toISOString(),
    studentCount: students.length,
    activityCount: activities.length,
    registrations: registrations.map(r => ({
      id: r.id,
      sv_id: r.sv_id,
      hd_id: r.hd_id,
      status: r.trang_thai_dk
    }))
  };
  
  // Compute checksum
  const checksum = crypto.createHash('sha256')
    .update(JSON.stringify(snapshotData))
    .digest('hex');
  
  // Write snapshot file
  const semKey = semesterKeyFromInfo(semInfo);
  const snapshotDir = path.join(DATA_DIR, 'semesters', semKey, 'snapshots');
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }
  const snapshotPath = path.join(snapshotDir, `class_${classId}_${Date.now()}.json`);
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshotData, null, 2), 'utf8');
  
  logInfo('Snapshot computed', { classId, semInfo, checksum });
  return { checksum, data: snapshotData };
}

/**
 * Format date as ISO string
 */
function formatDate(d: Date): string {
  return d.toISOString();
}

/**
 * Get date plus hours
 */
function nowPlusHours(hours: number): string {
  const d = new Date();
  d.setTime(d.getTime() + hours * 60 * 60 * 1000);
  return d.toISOString();
}

/**
 * Get user's class ID
 */
async function getUserClassId(userId: string): Promise<string | null> {
  const sv = await prisma.sinhVien.findFirst({
    where: { nguoi_dung_id: userId },
    select: { lop_id: true }
  });
  return sv?.lop_id || null;
}

/**
 * Derive the target year from hoc_ky and nam_hoc robustly.
 */
function deriveYear(hoc_ky: string, nam_hoc: string): string | null {
  const match = (nam_hoc || '').match(/(\d{4})-(\d{4})/);
  if (!match) return null;
  const y1 = parseInt(match[1], 10);
  const y2 = parseInt(match[2], 10);
  if (y2 - y1 === 1) {
    return hoc_ky === 'hoc_ky_1' ? String(y1) : String(y2);
  }
  // Fallback: look at active semester metadata
  const active = readActiveSemesterFromMetadata();
  const activeMatch = active ? active.match(/^hoc_ky_[12][_-](\d{4})$/) : null;
  if (activeMatch && active!.includes(hoc_ky)) {
    const activeYear = activeMatch[1];
    if ((nam_hoc || '').includes(activeYear)) return activeYear;
  }
  // Final fallback
  return hoc_ky === 'hoc_ky_1' ? String(y1) : String(y2);
}

/**
 * Semester Closure Service object
 */
const SemesterClosureService = {
  semesterKeyFromInfo,
  getCurrentSemesterInfo,
  
  /**
   * Get status for a class/semester
   */
  getStatus(classId: string, semesterStr?: string): StatusResult {
    let semInfo: SemesterInfo;
    if (semesterStr) {
      semInfo = parseSemesterString(semesterStr) || getCurrentSemesterInfo();
    } else {
      const active = readActiveSemesterFromMetadata();
      const activeMatch = active ? active.match(/^hoc_ky_([12])[_-](\d{4})$/) : null;
      if (activeMatch) {
        semInfo = { semester: `hoc_ky_${activeMatch[1]}`, year: activeMatch[2] };
      } else {
        semInfo = getCurrentSemesterInfo();
      }
    }
    const state = readState(classId, semInfo) || { error: 'state_corrupted' };
    return { semInfo, state: state as SemesterState | { error: string } };
  },
  
  /**
   * Check if write operations are allowed for class/semester
   */
  checkWritableForClassSemesterOrThrow(params: {
    classId: string;
    hoc_ky: string;
    nam_hoc: string;
    userRole?: string | null;
  }): void {
    const { classId, hoc_ky, nam_hoc, userRole = null } = params;
    const pair = (nam_hoc || '').match(/(\d{4})-(\d{4})/);
    if (!classId || !hoc_ky || !pair) return;
    
    const year = deriveYear(hoc_ky, nam_hoc);
    if (!year) return;
    
    const semInfo = { semester: hoc_ky, year };
    const debug = process.env.DEBUG_SEMESTER === '1';
    
    if (debug) {
      console.log('[SemesterLock][ClassCheck] input:', { classId, hoc_ky, nam_hoc, userRole });
      console.log('[SemesterLock][ClassCheck] computed semInfo:', semInfo);
    }
    
    // Check if globally active
    const activeSemester = readActiveSemesterFromMetadata();
    const currentValue = `${hoc_ky}-${year}`;
    const isGloballyActive = activeSemester === currentValue;
    
    if (debug) {
      console.log('[SemesterLock][ClassCheck] metadata.active_semester:', activeSemester, 'currentValue:', currentValue, 'isGloballyActive:', isGloballyActive);
    }
    
    if (isGloballyActive) {
      if (debug) console.log('[SemesterLock][ClassCheck] allow: globally active');
      return;
    }
    
    // Admin bypass
    if (userRole && (userRole === 'ADMIN' || userRole === 'admin')) {
      if (debug) console.log('[SemesterLock][ClassCheck] allow: admin bypass');
      return;
    }
    
    // Check class-level lock state
    const state = readState(classId, semInfo);
    if (state && (state.state === 'LOCKED_SOFT' || state.state === 'LOCKED_HARD')) {
      const hard = state.state === 'LOCKED_HARD';
      const softExpired = state.state === 'LOCKED_SOFT' && state.grace_until && new Date(state.grace_until) < new Date();
      
      if (debug) console.log('[SemesterLock][ClassCheck] state:', state, 'hard:', hard, 'softExpired:', softExpired);
      
      if (hard || softExpired) {
        const label = semesterKeyFromInfo(semInfo);
        const err: any = new Error(`SEMESTER_CLOSED_${state.state}`);
        err.status = 423; // Locked
        err.details = { classId, semester: label, state: state.state };
        if (debug) console.log('[SemesterLock][ClassCheck] block -> throw 423', err.details);
        throw err;
      }
    }
    if (debug) console.log('[SemesterLock][ClassCheck] allow: not locked');
  },
  
  /**
   * Propose closing a semester for a class
   */
  async proposeClose(params: {
    classId: string;
    actorId: number;
    semesterStr?: string;
  }): Promise<SemesterState> {
    const { classId, actorId, semesterStr } = params;
    const semInfo = semesterStr ? (parseSemesterString(semesterStr) || getCurrentSemesterInfo()) : getCurrentSemesterInfo();
    const state = readState(classId, semInfo);
    if (!state) throw new Error('STATE_READ_FAILED');
    if (['LOCKED_HARD', 'ARCHIVED'].includes(state.state)) throw new Error('ALREADY_LOCKED');
    if (state.state !== 'ACTIVE') {
      if (state.state === 'CLOSING') return writeState(classId, semInfo, state);
    }
    state.state = 'CLOSING';
    state.proposed_by = actorId;
    state.version = (state.version || 1) + 1;
    return writeState(classId, semInfo, state);
  },
  
  /**
   * Apply soft lock to a class/semester
   */
  async softLock(params: {
    classId: string;
    actorId: number;
    semesterStr?: string;
    graceHours?: number;
  }): Promise<SemesterState> {
    const { classId, actorId, semesterStr, graceHours = 72 } = params;
    const semInfo = semesterStr ? (parseSemesterString(semesterStr) || getCurrentSemesterInfo()) : getCurrentSemesterInfo();
    const state = readState(classId, semInfo);
    if (!state) throw new Error('STATE_READ_FAILED');
    if (['LOCKED_HARD', 'ARCHIVED'].includes(state.state)) throw new Error('ALREADY_LOCKED');
    
    // Checklist: ensure no pending registrations
    const students = await prisma.sinhVien.findMany({
      where: { lop_id: classId },
      select: { id: true }
    });
    const activityIds = (await prisma.hoatDong.findMany({
      where: { hoc_ky: semInfo.semester as HocKy, nam_hoc: semInfo.year },
      select: { id: true }
    })).map(a => a.id);
    
    const pending = await prisma.dangKyHoatDong.count({
      where: {
        sv_id: { in: students.map(s => s.id) },
        hd_id: { in: activityIds },
        trang_thai_dk: { in: ['cho_duyet', 'tu_choi'] }
      }
    });
    if (pending > 0) throw new Error('CHECKLIST_PENDING_REGISTRATIONS');
    
    // Compute snapshot
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
  
  /**
   * Rollback from soft lock to active
   */
  async rollback(params: {
    classId: string;
    actorId: number;
    semesterStr?: string;
  }): Promise<SemesterState> {
    const { classId, actorId, semesterStr } = params;
    const semInfo = semesterStr ? (parseSemesterString(semesterStr) || getCurrentSemesterInfo()) : getCurrentSemesterInfo();
    const state = readState(classId, semInfo);
    if (!state) throw new Error('STATE_READ_FAILED');
    
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
  
  /**
   * Apply hard lock to a class/semester
   */
  async hardLock(params: {
    classId: string;
    actorId: number;
    semesterStr?: string;
  }): Promise<SemesterState> {
    const { classId, actorId, semesterStr } = params;
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
  
  /**
   * Enforce writable for user's semester operations
   */
  async enforceWritableForUserSemesterOrThrow(params: {
    userId: string;
    hoc_ky: string;
    nam_hoc: string;
    userRole?: string | null;
  }): Promise<void> {
    const { userId, hoc_ky, nam_hoc, userRole = null } = params;
    const classId = await getUserClassId(userId);
    if (!classId) return; // non-student actions
    
    const pair = (nam_hoc || '').match(/(\d{4})-(\d{4})/);
    if (!hoc_ky || !pair) return;
    
    const year = deriveYear(hoc_ky, nam_hoc);
    if (!year) return;
    
    const semInfo = { semester: hoc_ky, year };
    const debug = process.env.DEBUG_SEMESTER === '1';
    
    if (debug) {
      console.log('[SemesterLock][UserCheck] input:', { userId, classId, hoc_ky, nam_hoc, userRole });
      console.log('[SemesterLock][UserCheck] computed semInfo:', semInfo);
    }
    
    // Globally active allows writes
    const activeSemester = readActiveSemesterFromMetadata();
    if (debug) console.log('[SemesterLock][UserCheck] metadata.active_semester:', activeSemester, 'currentValue:', `${hoc_ky}-${year}`);
    
    if (activeSemester && activeSemester === `${hoc_ky}-${year}`) {
      if (debug) console.log('[SemesterLock][UserCheck] allow: globally active');
      return;
    }
    
    // Admin bypass
    if (userRole && (userRole === 'ADMIN' || userRole === 'admin')) {
      if (debug) console.log('[SemesterLock][UserCheck] allow: admin bypass');
      return;
    }
    
    const state = readState(classId, semInfo);
    if (state && (state.state === 'LOCKED_SOFT' || state.state === 'LOCKED_HARD')) {
      const hard = state.state === 'LOCKED_HARD';
      const softExpired = state.state === 'LOCKED_SOFT' && state.grace_until && new Date(state.grace_until) < new Date();
      
      if (debug) console.log('[SemesterLock][UserCheck] state:', state, 'hard:', hard, 'softExpired:', softExpired);
      
      if (hard || softExpired) {
        const label = semesterKeyFromInfo(semInfo);
        const err: any = new Error(`SEMESTER_CLOSED_${state.state}`);
        err.status = 423; // Locked
        err.details = { classId, semester: label, state: state.state };
        if (debug) console.log('[SemesterLock][UserCheck] block -> throw 423', err.details);
        throw err;
      }
    }
    if (debug) console.log('[SemesterLock][UserCheck] allow: not locked');
  }
};

export default SemesterClosureService;
export { SemesterClosureService, SemesterInfo, SemesterState, StatusResult };
