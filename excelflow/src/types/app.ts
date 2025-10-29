/**
 * Application-level TypeScript types for ExcelFlow MVP
 *
 * This file contains types for application state management and UI state.
 */

import type { AppError } from '@/api/types';

/**
 * Upload state type
 * Represents the different stages of the upload and processing workflow
 */
export type UploadState = 'idle' | 'uploading' | 'processing' | 'complete' | 'error';

/**
 * Global application state
 * Managed via React Context
 */
export interface AppState {
  /** Current upload workflow state */
  uploadState: UploadState;
  /** Currently selected file (null when no file is selected) */
  currentFile: File | null;
  /** Job ID received from upload endpoint (null before upload) */
  jobId: string | null;
  /** Current error (null when no error) */
  error: AppError | null;
}
