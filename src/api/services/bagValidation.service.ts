/**
 * BAG Validation Service
 *
 * API service methods for starting validation and polling validation status.
 * Handles the two-step validation workflow: start validation + status polling.
 *
 * Adapted from ExcelFlow analysis service with BAG-specific additions:
 * - Separate start validation endpoint (POST)
 * - Status polling endpoint (GET)
 * - Transforms snake_case responses to camelCase
 * - Returns sessionId instead of jobId
 */

import { bagClient } from '../bagClient';
import type {
  BagValidateResponse,
  BagValidateResponseRaw,
  BagValidationStatus,
  BagValidationStatusRaw,
  ValidationConfig,
} from '../types/bag.types';
import { transformValidateResponse, transformValidationStatus } from '../types/bag.types';

/**
 * Start validation for an uploaded session
 *
 * Triggers the validation process for a previously uploaded file.
 * This is a separate step from upload (two-step workflow).
 *
 * @param sessionId - Unique session identifier from upload
 * @param config - Optional validation configuration (overrides upload config)
 * @returns Promise resolving to validation response with status "processing"
 * @throws AppError if validation fails to start
 *
 * @example
 * ```typescript
 * const response = await startValidation(sessionId);
 * console.log('Validation started:', response.status); // "processing"
 * ```
 */
export async function startValidation(
  sessionId: string,
  config?: ValidationConfig
): Promise<BagValidateResponse> {
  try {
    const response = await bagClient.post<BagValidateResponseRaw>(
      `/api/v1/validate/${sessionId}`,
      { config }
    );

    // Transform snake_case response to camelCase
    return transformValidateResponse(response.data);
  } catch (error) {
    // Error is already transformed by bagClient interceptor
    throw error;
  }
}

/**
 * Get the current validation status for a session
 *
 * Polls the status endpoint to get progress updates during validation.
 * This endpoint should be called every 2.5 seconds until status is 'complete' or 'failed'.
 *
 * @param sessionId - Unique session identifier
 * @returns Promise resolving to validation status with progress information
 * @throws AppError if session not found or other errors occur
 *
 * @example
 * ```typescript
 * const status = await getValidationStatus(sessionId);
 * console.log(`Progress: ${status.progress}%`);
 * console.log(`Phase: ${status.phase}`);
 * console.log(`Processed: ${status.processedCount} / ${status.totalCount}`);
 *
 * if (status.status === 'complete') {
 *   console.log('Validation complete!');
 * } else if (status.status === 'failed') {
 *   console.error('Validation failed:', status.error);
 * }
 * ```
 */
export async function getValidationStatus(
  sessionId: string
): Promise<BagValidationStatus> {
  try {
    const response = await bagClient.get<BagValidationStatusRaw>(
      `/api/v1/status/${sessionId}`
    );

    // Transform snake_case response to camelCase
    return transformValidationStatus(response.data);
  } catch (error) {
    // Error is already transformed by bagClient interceptor
    throw error;
  }
}

/**
 * Validation service exports
 */
export const bagValidationService = {
  startValidation,
  getValidationStatus,
};

export default bagValidationService;
