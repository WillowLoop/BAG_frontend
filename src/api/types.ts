/**
 * API Types for BAG Address Validation Application
 *
 * This file contains the core AppError interface reused from ExcelFlow.
 * BAG-specific types are in types/bag.types.ts
 */

/**
 * Application error type
 * Used for consistent error handling throughout the application
 *
 * Reused from ExcelFlow MVP with no modifications
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
