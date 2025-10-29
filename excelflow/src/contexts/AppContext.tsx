/**
 * AppContext - Global State Management for ExcelFlow MVP
 *
 * Provides centralized state management for the upload workflow using React Context.
 * Manages: upload state, current file, job ID, and error state.
 */

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { AppState, UploadState } from '@/types/app';
import type { AppError } from '@/api/types';

interface AppContextValue extends AppState {
  // Actions
  setUploadState: (state: UploadState) => void;
  setCurrentFile: (file: File | null) => void;
  setJobId: (jobId: string | null) => void;
  setError: (error: AppError | null) => void;
  reset: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

/**
 * Initial application state
 */
const initialState: AppState = {
  uploadState: 'idle',
  currentFile: null,
  jobId: null,
  error: null,
};

/**
 * AppProvider component
 * Wraps the application and provides global state access to all children
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const [uploadState, setUploadState] = useState<UploadState>(initialState.uploadState);
  const [currentFile, setCurrentFile] = useState<File | null>(initialState.currentFile);
  const [jobId, setJobId] = useState<string | null>(initialState.jobId);
  const [error, setError] = useState<AppError | null>(initialState.error);

  /**
   * Reset all state to initial values
   * Used when user wants to start a new analysis
   */
  const reset = () => {
    setUploadState(initialState.uploadState);
    setCurrentFile(initialState.currentFile);
    setJobId(initialState.jobId);
    setError(initialState.error);
  };

  const value: AppContextValue = {
    // State
    uploadState,
    currentFile,
    jobId,
    error,
    // Actions
    setUploadState,
    setCurrentFile,
    setJobId,
    setError,
    reset,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * useAppContext hook
 * Provides easy access to app context with type safety
 *
 * @throws Error if used outside of AppProvider
 */
export function useAppContext() {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }

  return context;
}
