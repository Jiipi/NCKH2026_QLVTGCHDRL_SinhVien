/**
 * Semester utilities - Unit tests
 * FE-TEST-001: Semester sync / parsing logic
 */

import {
  normalizeSemesterFormat,
  buildSemesterValue,
  parseSemesterString,
  getSemesterLabel,
  isSameSemester,
  getCurrentSemesterValue,
} from '../semester';

// ── normalizeSemesterFormat ────────────────────────────────────────

describe('normalizeSemesterFormat', () => {
  it('returns correct format unchanged', () => {
    expect(normalizeSemesterFormat('hoc_ky_1_2024')).toBe('hoc_ky_1_2024');
    expect(normalizeSemesterFormat('hoc_ky_2_2025')).toBe('hoc_ky_2_2025');
  });

  it('normalizes dash format', () => {
    expect(normalizeSemesterFormat('hoc_ky_1-2024')).toBe('hoc_ky_1_2024');
    expect(normalizeSemesterFormat('hoc_ky_2-2025')).toBe('hoc_ky_2_2025');
  });

  it('normalizes compact format (no separator)', () => {
    expect(normalizeSemesterFormat('hoc_ky_12024')).toBe('hoc_ky_1_2024');
    expect(normalizeSemesterFormat('hoc_ky_22025')).toBe('hoc_ky_2_2025');
  });

  it('returns null for invalid/empty inputs', () => {
    expect(normalizeSemesterFormat(null)).toBeNull();
    expect(normalizeSemesterFormat(undefined)).toBeNull();
    expect(normalizeSemesterFormat('')).toBeNull();
    expect(normalizeSemesterFormat('random')).toBeNull();
    expect(normalizeSemesterFormat('hoc_ky_3_2024')).toBeNull();
  });
});

// ── buildSemesterValue ─────────────────────────────────────────────

describe('buildSemesterValue', () => {
  it('builds from hoc_ky and year', () => {
    expect(buildSemesterValue('hoc_ky_1', '2024')).toBe('hoc_ky_1_2024');
    expect(buildSemesterValue('hoc_ky_2', 2025)).toBe('hoc_ky_2_2025');
  });

  it('strips hoc_ky_ prefix if needed', () => {
    expect(buildSemesterValue('hoc_ky_1', '2024')).toBe('hoc_ky_1_2024');
  });

  it('returns empty string if hocKy or year is empty/null', () => {
    expect(buildSemesterValue(null, '2024')).toBe('');
    expect(buildSemesterValue('hoc_ky_1', null)).toBe('');
    expect(buildSemesterValue('', '2024')).toBe('');
  });
});

// ── parseSemesterString ────────────────────────────────────────────

describe('parseSemesterString', () => {
  it('parses a correctly formatted semester string', () => {
    const result = parseSemesterString('hoc_ky_1_2024');
    expect(result).toEqual({
      hocKy: 'hoc_ky_1',
      hocKyNum: '1',
      year: '2024',
      value: 'hoc_ky_1_2024',
    });
  });

  it('parses HK2', () => {
    const result = parseSemesterString('hoc_ky_2_2025');
    expect(result).toEqual(
      expect.objectContaining({ hocKy: 'hoc_ky_2', hocKyNum: '2', year: '2025' }),
    );
  });

  it('normalizes before parsing', () => {
    expect(parseSemesterString('hoc_ky_1-2024')).toEqual(
      expect.objectContaining({ value: 'hoc_ky_1_2024' }),
    );
  });

  it('returns null for garbage input', () => {
    expect(parseSemesterString(null)).toBeNull();
    expect(parseSemesterString(undefined)).toBeNull();
    expect(parseSemesterString('xyz')).toBeNull();
  });
});

// ── getSemesterLabel ───────────────────────────────────────────────

describe('getSemesterLabel', () => {
  it('returns human-readable label', () => {
    expect(getSemesterLabel('hoc_ky_1_2024')).toBe('Học kỳ 1 - 2024');
    expect(getSemesterLabel('hoc_ky_2_2025')).toBe('Học kỳ 2 - 2025');
  });

  it('returns input as-is if unparseable', () => {
    expect(getSemesterLabel('invalid')).toBe('invalid');
    expect(getSemesterLabel(null)).toBe('');
  });
});

// ── isSameSemester ─────────────────────────────────────────────────

describe('isSameSemester', () => {
  it('matches identical semesters', () => {
    expect(isSameSemester('hoc_ky_1_2024', 'hoc_ky_1_2024')).toBe(true);
  });

  it('matches after normalization', () => {
    expect(isSameSemester('hoc_ky_1_2024', 'hoc_ky_1-2024')).toBe(true);
    expect(isSameSemester('hoc_ky_12024', 'hoc_ky_1_2024')).toBe(true);
  });

  it('returns false for different semesters', () => {
    expect(isSameSemester('hoc_ky_1_2024', 'hoc_ky_2_2024')).toBe(false);
    expect(isSameSemester('hoc_ky_1_2024', 'hoc_ky_1_2025')).toBe(false);
  });

  it('handles null/undefined', () => {
    expect(isSameSemester(null, null)).toBe(true);  // both normalize to null
    expect(isSameSemester('hoc_ky_1_2024', null)).toBe(false);
  });
});

// ── getCurrentSemesterValue ────────────────────────────────────────

describe('getCurrentSemesterValue', () => {
  it('returns semester string based on current date', () => {
    const result = getCurrentSemesterValue(false);
    expect(result).toMatch(/^hoc_ky_[12]_\d{4}$/);
  });

  it('falls back to date-based logic when no session', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    const result = getCurrentSemesterValue(true);
    expect(result).toMatch(/^hoc_ky_[12]_\d{4}$/);
    jest.restoreAllMocks();
  });
});
