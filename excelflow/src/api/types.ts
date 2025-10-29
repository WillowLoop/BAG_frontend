/**
 * API Types for ExcelFlow MVP
 *
 * This file contains all TypeScript interfaces for API requests and responses.
 * These types are based on the API specification in section 5.1 of spec.md.
 */

/**
 * Response from the file upload endpoint
 * Returned after successfully uploading an Excel file to the backend
 */
export interface UploadResponse {
  /** Unique identifier for the processing job */
  jobId: string;
  /** Current status of the job */
  status: 'queued' | 'processing';
  /** Optional message from the server */
  message?: string;
}

/**
 * Status information for an analysis job
 * Returned when polling the status endpoint
 */
export interface AnalysisStatus {
  /** Unique identifier for the processing job */
  jobId: string;
  /** Current status of the analysis job */
  status: 'queued' | 'processing' | 'analyzing' | 'complete' | 'failed';
  /** Progress percentage (0-100) */
  progress: number;
  /** Optional human-readable status message */
  message?: string;
  /** Error message if status is 'failed' */
  error?: string;
}

/**
 * Application error type
 * Used for consistent error handling throughout the application
 */
export interface AppError {
  /** Type of error that occurred */
  type: 'validation' | 'network' | 'api' | 'unknown';
  /** User-friendly error message in Dutch */
  message: string;
  /** Optional technical details for debugging */
  details?: string;
  /** HTTP status code if applicable */
  statusCode?: number;
}
