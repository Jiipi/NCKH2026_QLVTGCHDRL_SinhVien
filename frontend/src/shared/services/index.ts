/**
 * Shared Services - Barrel Export
 */
export { default as sessionManager } from './sessionManager';

// Re-export types
export type {
  SessionUser,
  SessionData,
  SessionInfo,
  ActiveSession,
  SessionEvent,
  SessionEventType,
  DetailedSessionsInfo,
  SessionEventCallback
} from './sessionManager';
