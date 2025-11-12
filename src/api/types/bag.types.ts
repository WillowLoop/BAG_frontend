/**
 * BAG API Type Definitions
 *
 * TypeScript types for BAG Address Validation API integration.
 * All types use camelCase for frontend consistency.
 * API uses snake_case - transformation happens in service layer.
 *
 * @see /Users/cheersrijneau/Developer/newproject/API_DOCUMENTATION.md
 */

// ============================================================================
// BASE RESPONSE WRAPPERS
// ============================================================================

/**
 * Standard success response wrapper from BAG API
 * All successful API responses follow this structure
 */
export interface BagSuccessResponse<T> {
  success: true;
  data: T;
  metadata: BagResponseMetadata;
}

/**
 * Standard error response wrapper from BAG API
 * All error responses follow this structure
 */
export interface BagErrorResponse {
  error: BagApiError;
}

/**
 * Response metadata included in all BAG API responses
 */
export interface BagResponseMetadata {
  /** UUID v4 for request tracking */
  requestId: string;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** API version (e.g., "1.0.0") */
  version: string;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Structured error object from BAG API
 * Contains machine-readable code and human-readable message
 */
export interface BagApiError {
  /** Machine-readable error code */
  code: BagErrorCode;
  /** Human-readable error message */
  message: string;
  /** Optional additional error details */
  details?: Record<string, any>;
  /** Request ID for debugging */
  requestId: string;
}

/**
 * Possible error codes from BAG API
 * Used for error type detection and user message mapping
 */
export type BagErrorCode =
  | 'INVALID_FILE_TYPE'
  | 'EXCEL_STRUCTURE_ERROR'
  | 'VALIDATION_ERROR'
  | 'FILE_NOT_FOUND'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_SERVER_ERROR';

// ============================================================================
// VALIDATION CONFIGURATION
// ============================================================================

/**
 * Configuration options for BAG address validation
 * All fields are optional with sensible defaults
 */
export interface ValidationConfig {
  /** Enable strict validation mode (default: false) */
  strict_mode?: boolean;
  /** Maximum number of similar results to return (1-10, default: 5) */
  max_similar_results?: number;
  /** Case-sensitive place name matching (default: false) */
  case_sensitive_places?: boolean;
  /** Allow abbreviated street names (default: true) */
  allow_abbreviations?: boolean;
}

/**
 * Default validation configuration
 * Used when user doesn't provide custom config
 */
export const DEFAULT_VALIDATION_CONFIG: ValidationConfig = {
  strict_mode: false,
  max_similar_results: 5,
  case_sensitive_places: false,
  allow_abbreviations: true,
} as const;

// ============================================================================
// UPLOAD ENDPOINT TYPES
// ============================================================================

/**
 * Response from BAG file upload endpoint
 * Received after successfully uploading an Excel file
 *
 * API Endpoint: POST /api/v1/upload
 *
 * @example
 * ```typescript
 * const response: BagUploadResponse = {
 *   sessionId: "a7f3c2e1-4b5d-6789-0abc-def123456789",
 *   message: "File uploaded successfully",
 *   filename: "addresses.xlsx"
 * };
 * ```
 */
export interface BagUploadResponse {
  /** Unique session identifier (UUID v4) */
  sessionId: string;
  /** Success message from server */
  message: string;
  /** Original filename */
  filename: string;
}

/**
 * Raw upload response from BAG API (snake_case)
 * Transformed to BagUploadResponse (camelCase) in service layer
 *
 * @internal
 */
export interface BagUploadResponseRaw {
  session_id: string;
  message: string;
  filename: string;
}

// ============================================================================
// VALIDATION ENDPOINT TYPES
// ============================================================================

/**
 * Response from starting validation endpoint
 * Received after successfully triggering validation
 *
 * API Endpoint: POST /api/v1/validate/{session_id}
 */
export interface BagValidateResponse {
  /** Session identifier */
  sessionId: string;
  /** Status message */
  message: string;
  /** Initial status (always "processing") */
  status: 'processing';
}

/**
 * Raw validate response from BAG API (snake_case)
 * Transformed to BagValidateResponse (camelCase) in service layer
 *
 * @internal
 */
export interface BagValidateResponseRaw {
  session_id: string;
  message: string;
  status: 'processing';
}

// ============================================================================
// STATUS ENDPOINT TYPES (POLLING)
// ============================================================================

/**
 * Validation status values
 * Represents current state of validation process
 */
export type BagValidationStatusValue = 'queued' | 'processing' | 'complete' | 'failed';

/**
 * Validation status information from polling endpoint
 * Received when polling for progress updates
 *
 * API Endpoint: GET /api/v1/status/{session_id}
 * Polling Interval: 2500ms (2.5 seconds)
 *
 * @example
 * ```typescript
 * const status: BagValidationStatus = {
 *   sessionId: "a7f3c2e1-4b5d-6789-0abc-def123456789",
 *   status: "processing",
 *   progress: 45,
 *   phase: "Validating addresses",
 *   processedCount: 45,
 *   totalCount: 100,
 *   message: "Validation in progress",
 * };
 * ```
 */
export interface BagValidationStatus {
  /** Session identifier */
  sessionId: string;
  /** Current validation status */
  status: BagValidationStatusValue;
  /** Progress percentage (0-100) */
  progress: number;
  /** Current validation phase (user-friendly) */
  phase: string;
  /** Number of addresses processed */
  processedCount: number;
  /** Total number of addresses to process */
  totalCount: number;
  /** Optional status message */
  message?: string;
  /** Error message if status is 'failed' */
  error?: string;
}

/**
 * Raw validation status from BAG API (snake_case)
 * Transformed to BagValidationStatus (camelCase) in service layer
 *
 * @internal
 */
export interface BagValidationStatusRaw {
  session_id: string;
  status: BagValidationStatusValue;
  progress: number;
  phase: string;
  processed_count: number;
  total_count: number;
  message?: string;
  error?: string;
}

// ============================================================================
// CLEANUP ENDPOINT TYPES
// ============================================================================

/**
 * Response from cleanup endpoint
 * Received after successfully cleaning up session
 *
 * API Endpoint: DELETE /api/v1/cleanup/{session_id}
 */
export interface BagCleanupResponse {
  /** Session identifier */
  sessionId: string;
  /** Cleanup confirmation message */
  message: string;
}

/**
 * Raw cleanup response from BAG API (snake_case)
 * Transformed to BagCleanupResponse (camelCase) in service layer
 *
 * @internal
 */
export interface BagCleanupResponseRaw {
  session_id: string;
  message: string;
}

// ============================================================================
// HEALTH CHECK TYPES
// ============================================================================

/**
 * Health check response
 * Used to verify API and database connectivity
 *
 * API Endpoint: GET /api/v1/health
 */
export interface BagHealthCheck {
  /** Overall API status */
  status: 'healthy' | 'unhealthy';
  /** Database connection status */
  database: 'connected' | 'disconnected';
  /** API uptime in seconds */
  uptimeSeconds: number;
  /** API version */
  version: string;
}

/**
 * Raw health check response from BAG API (snake_case)
 *
 * @internal
 */
export interface BagHealthCheckRaw {
  status: 'healthy' | 'unhealthy';
  database: 'connected' | 'disconnected';
  uptime_seconds: number;
  version: string;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if response is a BAG success response
 *
 * @param response - API response to check
 * @returns true if response is a success response
 */
export function isBagSuccessResponse<T>(
  response: unknown
): response is BagSuccessResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    response.success === true &&
    'data' in response &&
    'metadata' in response
  );
}

/**
 * Type guard to check if response is a BAG error response
 *
 * @param response - API response to check
 * @returns true if response is an error response
 */
export function isBagErrorResponse(response: unknown): response is BagErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    typeof (response as BagErrorResponse).error === 'object'
  );
}

// ============================================================================
// TRANSFORMATION HELPERS
// ============================================================================

/**
 * Transform raw API response keys from snake_case to camelCase
 * Used in service layer for consistent frontend types
 *
 * @param raw - Raw API response with snake_case keys
 * @returns Transformed object with camelCase keys
 *
 * @internal
 */
export function transformUploadResponse(raw: BagUploadResponseRaw): BagUploadResponse {
  return {
    sessionId: raw.session_id,
    message: raw.message,
    filename: raw.filename,
  };
}

/**
 * Transform raw validation status from snake_case to camelCase
 *
 * @param raw - Raw API response with snake_case keys
 * @returns Transformed object with camelCase keys
 *
 * @internal
 */
export function transformValidationStatus(
  raw: BagValidationStatusRaw
): BagValidationStatus {
  return {
    sessionId: raw.session_id,
    status: raw.status,
    progress: raw.progress,
    phase: raw.phase,
    processedCount: raw.processed_count,
    totalCount: raw.total_count,
    message: raw.message,
    error: raw.error,
  };
}

/**
 * Transform raw validate response from snake_case to camelCase
 *
 * @param raw - Raw API response with snake_case keys
 * @returns Transformed object with camelCase keys
 *
 * @internal
 */
export function transformValidateResponse(
  raw: BagValidateResponseRaw
): BagValidateResponse {
  return {
    sessionId: raw.session_id,
    message: raw.message,
    status: raw.status,
  };
}

/**
 * Transform raw cleanup response from snake_case to camelCase
 *
 * @param raw - Raw API response with snake_case keys
 * @returns Transformed object with camelCase keys
 *
 * @internal
 */
export function transformCleanupResponse(
  raw: BagCleanupResponseRaw
): BagCleanupResponse {
  return {
    sessionId: raw.session_id,
    message: raw.message,
  };
}

/**
 * Transform raw health check response from snake_case to camelCase
 *
 * @param raw - Raw API response with snake_case keys
 * @returns Transformed object with camelCase keys
 *
 * @internal
 */
export function transformHealthCheck(raw: BagHealthCheckRaw): BagHealthCheck {
  return {
    status: raw.status,
    database: raw.database,
    uptimeSeconds: raw.uptime_seconds,
    version: raw.version,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Re-export AppError from ExcelFlow for consistency
 * Used for internal error handling
 */
export type { AppError } from '../types';
