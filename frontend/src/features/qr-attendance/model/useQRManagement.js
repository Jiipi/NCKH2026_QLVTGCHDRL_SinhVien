import { useAdminQRAttendance } from '../hooks/useAdminQRAttendance';

// FSD-aligned alias for QR management logic
export function useQRManagement() {
  return useAdminQRAttendance();
}

export default useQRManagement;
