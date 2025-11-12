/**
 * BagValidationContext - Global State Management for BAG Address Validation
 *
 * Provides centralized state management for the two-step validation workflow using React Context.
 * Manages: validation state, current file, session ID, and error state.
 *
 * Adapted from ExcelFlow AppContext with key differences:
 * - Added 'validating' state (not in ExcelFlow)
 * - Uses sessionId instead of jobId
 * - Supports two-step workflow (upload → validate)
 */

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { AppError } from '@/api/types';
import { APP_STATES, type AppState } from '@/lib/bagConstants';

/**
 * State interface for BAG validation workflow
 */
export interface BagValidationState {
  /** Current state in the validation workflow */
  state: AppState;
  /** Unique session identifier from upload response */
  sessionId: string | null;
  /** Currently selected/uploaded file */
  currentFile: File | null;
  /** Error information if state is 'error' */
  error: AppError | null;
}

/**
 * Context value including state and actions
 */
interface BagValidationContextValue extends BagValidationState {
  // State setters
  setUploading: (file: File) => void;
  setValidating: (sessionId: string) => void;
  setComplete: () => void;
  setError: (error: AppError) => void;
  reset: () => void;
}

const BagValidationContext = createContext<BagValidationContextValue | undefined>(undefined);

/**
 * Initial state for BAG validation
 */
const initialState: BagValidationState = {
  state: APP_STATES.IDLE,
  sessionId: null,
  currentFile: null,
  error: null,
};

/**
 * BagValidationProvider component
 * Wraps the application and provides global validation state access to all children
 */
export function BagValidationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState.state);
  const [sessionId, setSessionId] = useState<string | null>(initialState.sessionId);
  const [currentFile, setCurrentFile] = useState<File | null>(initialState.currentFile);
  const [error, setErrorState] = useState<AppError | null>(initialState.error);

  /**
   * Transition to uploading state
   * Called when user starts file upload
   */
  const setUploading = (file: File) => {
    setState(APP_STATES.UPLOADING);
    setCurrentFile(file);
    setErrorState(null);
  };

  /**
   * Transition to validating state
   * Called after upload succeeds and validation is triggered
   */
  const setValidating = (id: string) => {
    setState(APP_STATES.VALIDATING);
    setSessionId(id);
    setErrorState(null);
  };

  /**
   * Transition to complete state
   * Called when validation finishes successfully
   */
  const setComplete = () => {
    setState(APP_STATES.COMPLETE);
    setErrorState(null);
  };

  /**
   * Transition to error state
   * Called when any operation fails
   */
  const setError = (err: AppError) => {
    setState(APP_STATES.ERROR);
    setErrorState(err);
  };

  /**
   * Reset all state to initial values
   * Used when user wants to start a new validation
   */
  const reset = () => {
    setState(initialState.state);
    setSessionId(initialState.sessionId);
    setCurrentFile(initialState.currentFile);
    setErrorState(initialState.error);
  };

  const value: BagValidationContextValue = {
    // State
    state,
    sessionId,
    currentFile,
    error,
    // Actions
    setUploading,
    setValidating,
    setComplete,
    setError,
    reset,
  };

  return <BagValidationContext.Provider value={value}>{children}</BagValidationContext.Provider>;
}

/**
 * useBagValidation hook
 * Provides easy access to BAG validation context with type safety
 *
 * @throws Error if used outside of BagValidationProvider
 *
 * @example
 * ```tsx
 * const { state, sessionId, setUploading, reset } = useBagValidation();
 *
 * if (state === 'idle') {
 *   return <UploadSection />;
 * } else if (state === 'validating') {
 *   return <ProcessingView sessionId={sessionId} />;
 * }
 * ```
 */
export function useBagValidation() {
  const context = useContext(BagValidationContext);

  if (context === undefined) {
    throw new Error('useBagValidation must be used within a BagValidationProvider');
  }

  return context;
}
