import { useLegacyQRScanner } from '../hooks/useLegacyQRScanner';

// FSD-aligned alias for QR scanner logic
export function useQRScanner() {
  return useLegacyQRScanner();
}

export default useQRScanner;
