function readThreshold(envName: string, fallback: number): number {
  const raw = process.env[envName];
  if (!raw) return fallback;

  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0 || value >= 1) {
    return fallback;
  }

  return value;
}

export const FACE_THRESHOLDS = {
  attendanceOneToOne: readThreshold('FACE_THRESHOLD_ATTENDANCE_1TO1', 0.68),
  attendanceOneToMany: readThreshold('FACE_THRESHOLD_ATTENDANCE_1N', 0.72),
  duplicateRegistration: readThreshold('FACE_THRESHOLD_DUPLICATE_REGISTRATION', 0.68),
  serviceVerify: readThreshold('FACE_THRESHOLD_VERIFY', 0.68)
} as const;

