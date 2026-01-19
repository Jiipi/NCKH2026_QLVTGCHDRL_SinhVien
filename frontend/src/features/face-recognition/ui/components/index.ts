// Camera
export { default as FaceCamera } from './FaceCamera';
export type { FaceCameraRef } from './FaceCamera';

// Modals
export { default as FaceRegistrationModal, FaceRegistrationModal as FaceRegistrationModalComponent } from './FaceRegistrationModal';

// Cards
export { default as FaceAttendanceCard, FaceAttendanceCard as FaceAttendanceCardComponent } from './FaceAttendanceCard';

// Skeletons & Loading
export {
  Skeleton,
  CameraSkeleton,
  FaceRegistrationPageSkeleton,
  FaceAttendanceCardSkeleton,
  LoadingSpinner,
  FullPageLoader,
  CameraProcessingOverlay
} from './Skeletons';

// Error Components
export {
  FaceRecognitionErrorBoundary,
  ErrorDisplay,
  FaceErrorDisplay,
  CameraPermissionError,
  BrowserNotSupportedError,
  ServiceUnavailableError
} from './ErrorComponents';
