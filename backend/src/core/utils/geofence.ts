export interface AttendanceLocationInput {
  latitude?: number | string | null;
  longitude?: number | string | null;
  accuracy?: number | string | null;
}

export interface GeofenceConfig {
  latitude?: number | string | null;
  longitude?: number | string | null;
  radiusMeters?: number | string | null;
  required?: boolean | null;
}

export interface GeofenceEvaluation {
  allowed: boolean;
  result: 'trong_vung' | 'ngoai_vung' | 'khong_co_gps' | 'khong_yeu_cau';
  reason?: 'missing_gps' | 'low_gps_accuracy' | 'outside_geofence';
  distanceMeters?: number;
  accuracyMeters?: number;
  radiusMeters?: number;
}

const MAX_ALLOWED_ACCURACY_METERS = 150;

function toNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toRadians(value: number): number {
  return value * Math.PI / 180;
}

export function normalizeAttendanceLocation(location?: AttendanceLocationInput | null) {
  if (!location) return null;
  const latitude = toNumber(location.latitude);
  const longitude = toNumber(location.longitude);
  const accuracy = toNumber(location.accuracy);
  if (latitude === null || longitude === null) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
  return { latitude, longitude, accuracy: accuracy ?? undefined };
}

export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const earthRadiusMeters = 6371000;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMeters * c;
}

export function evaluateGeofence(config: GeofenceConfig, location?: AttendanceLocationInput | null): GeofenceEvaluation {
  if (!config.required) {
    const normalized = normalizeAttendanceLocation(location);
    return {
      allowed: true,
      result: 'khong_yeu_cau',
      accuracyMeters: normalized?.accuracy
    };
  }

  const activityLatitude = toNumber(config.latitude);
  const activityLongitude = toNumber(config.longitude);
  const radiusMeters = toNumber(config.radiusMeters) ?? 100;
  const normalized = normalizeAttendanceLocation(location);

  if (activityLatitude === null || activityLongitude === null || !normalized) {
    return { allowed: false, result: 'khong_co_gps', reason: 'missing_gps', radiusMeters };
  }

  if (normalized.accuracy !== undefined && normalized.accuracy > MAX_ALLOWED_ACCURACY_METERS) {
    return {
      allowed: false,
      result: 'khong_co_gps',
      reason: 'low_gps_accuracy',
      accuracyMeters: normalized.accuracy,
      radiusMeters
    };
  }

  const distanceMeters = calculateDistanceMeters(activityLatitude, activityLongitude, normalized.latitude, normalized.longitude);
  const tolerance = normalized.accuracy ? Math.min(normalized.accuracy, 50) : 0;
  const allowed = distanceMeters <= radiusMeters + tolerance;

  return {
    allowed,
    result: allowed ? 'trong_vung' : 'ngoai_vung',
    reason: allowed ? undefined : 'outside_geofence',
    distanceMeters,
    accuracyMeters: normalized.accuracy,
    radiusMeters
  };
}
