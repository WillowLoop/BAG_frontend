/**
 * BAG API Error Code Mapping
 *
 * Maps BAG API error codes to AppError types with Dutch user-friendly messages.
 * This module provides error transformation from BAG API format to frontend AppError format.
 *
 * @see /Users/cheersrijneau/Developer/newproject/API_DOCUMENTATION.md - Error codes
 * @see /Users/cheersrijneau/Developer/newproject/agent-os/specs/2025-10-29-bag-address-validation-frontend/planning/infrastructure-verification.md - Error mapping verification
 */

import type { AppError } from './types';
import type { BagApiError, BagErrorCode } from './types/bag.types';

// ============================================================================
// ERROR CODE TO APPERROR TYPE MAPPING
// ============================================================================

/**
 * Error code mapping configuration
 * Maps BAG error codes to AppError types and Dutch messages
 */
interface ErrorCodeMapping {
  /** AppError type for this error code */
  type: AppError['type'];
  /** User-friendly Dutch message */
  message: string;
  /** Whether this error is recoverable with retry */
  recoverable: boolean;
  /** Suggested action for the user */
  suggestedAction: 'retry' | 'reset' | 'wait' | 'fix-file';
}

/**
 * Complete error code mapping table
 * All BAG API error codes mapped to frontend error handling
 */
const ERROR_CODE_MAP: Record<BagErrorCode, ErrorCodeMapping> = {
  /**
   * Invalid file type error
   * User uploaded non-.xlsx file
   */
  INVALID_FILE_TYPE: {
    type: 'validation',
    message: 'Alleen .xlsx bestanden zijn toegestaan',
    recoverable: false,
    suggestedAction: 'fix-file',
  },

  /**
   * Excel structure error
   * File missing required columns or has invalid structure
   */
  EXCEL_STRUCTURE_ERROR: {
    type: 'validation',
    message: 'Excel bestand heeft niet de juiste structuur. Controleer de vereiste kolommen.',
    recoverable: false,
    suggestedAction: 'fix-file',
  },

  /**
   * Validation configuration error
   * Invalid config parameters provided
   */
  VALIDATION_ERROR: {
    type: 'validation',
    message: 'Ongeldige configuratie. Probeer opnieuw.',
    recoverable: false,
    suggestedAction: 'reset',
  },

  /**
   * Session not found error
   * Session expired or invalid session_id
   */
  FILE_NOT_FOUND: {
    type: 'api',
    message: 'Sessie niet gevonden. Start een nieuwe validatie.',
    recoverable: false,
    suggestedAction: 'reset',
  },

  /**
   * Rate limit exceeded error
   * Too many requests from this IP
   */
  RATE_LIMIT_EXCEEDED: {
    type: 'api',
    message: 'Te veel verzoeken. Wacht een minuut en probeer opnieuw.',
    recoverable: true,
    suggestedAction: 'wait',
  },

  /**
   * Internal server error
   * Backend encountered an error
   */
  INTERNAL_SERVER_ERROR: {
    type: 'api',
    message: 'Server fout. Ons team is op de hoogte. Probeer later opnieuw.',
    recoverable: true,
    suggestedAction: 'retry',
  },
};

// ============================================================================
// ERROR TRANSFORMATION FUNCTIONS
// ============================================================================

/**
 * Transform BAG API error to frontend AppError
 *
 * Converts structured BAG error response to user-friendly AppError format
 * with Dutch messages and appropriate error types.
 *
 * @param bagError - Structured error from BAG API
 * @returns AppError with Dutch message and error type
 *
 * @example
 * ```typescript
 * const bagError: BagApiError = {
 *   code: 'INVALID_FILE_TYPE',
 *   message: 'Only .xlsx files are allowed',
 *   details: { allowed_types: ['.xlsx'] },
 *   requestId: 'req-123'
 * };
 *
 * const appError = transformBagError(bagError);
 * // {
 * //   type: 'validation',
 * //   message: 'Alleen .xlsx bestanden zijn toegestaan',
 * //   details: 'Request ID: req-123',
 * //   statusCode: 400
 * // }
 * ```
 */
export function transformBagError(bagError: BagApiError): AppError {
  // Get mapping for this error code
  const mapping = ERROR_CODE_MAP[bagError.code];

  // If error code is not recognized, return generic error
  if (!mapping) {
    return {
      type: 'unknown',
      message: 'Er is een onbekende fout opgetreden. Probeer opnieuw.',
      details: `Error code: ${bagError.code}, Request ID: ${bagError.requestId}`,
    };
  }

  // Build detailed error information for debugging
  const details = buildErrorDetails(bagError);

  // Determine HTTP status code from error code
  const statusCode = getStatusCodeForErrorCode(bagError.code);

  // Return transformed AppError
  return {
    type: mapping.type,
    message: mapping.message,
    details,
    statusCode,
  };
}

/**
 * Build detailed error string for debugging
 * Includes request ID and any additional details from API
 *
 * @param bagError - BAG API error object
 * @returns Formatted detail string
 *
 * @internal
 */
function buildErrorDetails(bagError: BagApiError): string {
  const parts: string[] = [];

  // Always include request ID for debugging
  parts.push(`Request ID: ${bagError.requestId}`);

  // Include error code
  parts.push(`Error Code: ${bagError.code}`);

  // Include original API message if different from user message
  if (bagError.message) {
    parts.push(`API Message: ${bagError.message}`);
  }

  // Include additional details if provided
  if (bagError.details) {
    try {
      parts.push(`Details: ${JSON.stringify(bagError.details)}`);
    } catch {
      parts.push(`Details: [Unable to stringify]`);
    }
  }

  return parts.join(' | ');
}

/**
 * Get HTTP status code for error code
 * Used to populate statusCode field in AppError
 *
 * @param errorCode - BAG API error code
 * @returns HTTP status code
 *
 * @internal
 */
function getStatusCodeForErrorCode(errorCode: BagErrorCode): number {
  switch (errorCode) {
    case 'INVALID_FILE_TYPE':
    case 'EXCEL_STRUCTURE_ERROR':
    case 'VALIDATION_ERROR':
      return 400; // Bad Request

    case 'FILE_NOT_FOUND':
      return 404; // Not Found

    case 'RATE_LIMIT_EXCEEDED':
      return 429; // Too Many Requests

    case 'INTERNAL_SERVER_ERROR':
      return 500; // Internal Server Error

    default:
      return 500; // Unknown errors treated as server errors
  }
}

// ============================================================================
// ERROR RECOVERY HELPERS
// ============================================================================

/**
 * Check if error is recoverable with retry
 *
 * Determines if user should see a "Retry" button for this error.
 * Validation errors and session errors are not recoverable.
 * Network and rate limit errors can be retried.
 *
 * @param errorCode - BAG API error code
 * @returns true if error is recoverable
 *
 * @example
 * ```typescript
 * if (isErrorRecoverable('RATE_LIMIT_EXCEEDED')) {
 *   // Show retry button
 * } else {
 *   // Show only reset button
 * }
 * ```
 */
export function isErrorRecoverable(errorCode: BagErrorCode): boolean {
  const mapping = ERROR_CODE_MAP[errorCode];
  return mapping?.recoverable ?? false;
}

/**
 * Get suggested action for error code
 *
 * Returns the recommended user action for handling this error.
 *
 * @param errorCode - BAG API error code
 * @returns Suggested action
 */
export function getSuggestedAction(
  errorCode: BagErrorCode
): ErrorCodeMapping['suggestedAction'] {
  const mapping = ERROR_CODE_MAP[errorCode];
  return mapping?.suggestedAction ?? 'reset';
}

/**
 * Get user-friendly Dutch message for error code
 *
 * @param errorCode - BAG API error code
 * @returns Dutch error message
 */
export function getErrorMessage(errorCode: BagErrorCode): string {
  const mapping = ERROR_CODE_MAP[errorCode];
  return mapping?.message ?? 'Er is een onbekende fout opgetreden. Probeer opnieuw.';
}

// ============================================================================
// ERROR LOGGING HELPERS
// ============================================================================

/**
 * Log error to console with formatted output
 * Useful for debugging in development mode
 *
 * @param bagError - BAG API error object
 * @param context - Additional context (e.g., 'Upload', 'Validation')
 *
 * @example
 * ```typescript
 * logBagError(bagError, 'Upload');
 * // Console output:
 * // [BAG API Error - Upload] INVALID_FILE_TYPE
 * // Message: Alleen .xlsx bestanden zijn toegestaan
 * // Request ID: req-123
 * ```
 */
export function logBagError(bagError: BagApiError, context?: string): void {
  const prefix = context ? `[BAG API Error - ${context}]` : '[BAG API Error]';

  console.error(prefix, bagError.code);
  console.error('Message:', getErrorMessage(bagError.code));
  console.error('Request ID:', bagError.requestId);

  if (bagError.details) {
    console.error('Details:', bagError.details);
  }
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Check if error code is a validation error
 * Validation errors indicate user needs to fix their input
 *
 * @param errorCode - BAG API error code
 * @returns true if error is a validation error
 */
export function isValidationError(errorCode: BagErrorCode): boolean {
  const mapping = ERROR_CODE_MAP[errorCode];
  return mapping?.type === 'validation';
}

/**
 * Check if error code is an API error
 * API errors indicate server-side or rate limiting issues
 *
 * @param errorCode - BAG API error code
 * @returns true if error is an API error
 */
export function isApiError(errorCode: BagErrorCode): boolean {
  const mapping = ERROR_CODE_MAP[errorCode];
  return mapping?.type === 'api';
}

// ============================================================================
// ERROR CODE CONSTANTS
// ============================================================================

/**
 * BAG error code constants for type-safe error checking
 * Use these instead of string literals
 *
 * @example
 * ```typescript
 * if (error.code === BAG_ERROR_CODES.INVALID_FILE_TYPE) {
 *   // Handle invalid file type
 * }
 * ```
 */
export const BAG_ERROR_CODES = {
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE' as const,
  EXCEL_STRUCTURE_ERROR: 'EXCEL_STRUCTURE_ERROR' as const,
  VALIDATION_ERROR: 'VALIDATION_ERROR' as const,
  FILE_NOT_FOUND: 'FILE_NOT_FOUND' as const,
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED' as const,
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR' as const,
} as const;

// ============================================================================
// ERROR MESSAGE CONSTANTS (FOR REFERENCE)
// ============================================================================

/**
 * All Dutch error messages in one place
 * Used by ERROR_CODE_MAP, exported for reference
 */
export const BAG_ERROR_MESSAGES = {
  INVALID_FILE_TYPE: 'Alleen .xlsx bestanden zijn toegestaan',
  EXCEL_STRUCTURE_ERROR:
    'Excel bestand heeft niet de juiste structuur. Controleer de vereiste kolommen.',
  VALIDATION_ERROR: 'Ongeldige configuratie. Probeer opnieuw.',
  FILE_NOT_FOUND: 'Sessie niet gevonden. Start een nieuwe validatie.',
  RATE_LIMIT_EXCEEDED: 'Te veel verzoeken. Wacht een minuut en probeer opnieuw.',
  INTERNAL_SERVER_ERROR:
    'Server fout. Ons team is op de hoogte. Probeer later opnieuw.',
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { BagApiError, BagErrorCode } from './types/bag.types';
