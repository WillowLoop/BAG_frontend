/**
 * BAG Validation Service
 *
 * API service methods for starting validation.
 * Handles the validation workflow: start validation -> WebSocket progress updates.
 *
 * Adapted from ExcelFlow analysis service with BAG-specific additions:
 * - Separate start validation endpoint (POST)
 * - Transforms snake_case responses to camelCase
 * - Returns sessionId instead of jobId
 *
 * Note: Status polling is NOT implemented. Use WebSocket for real-time progress.
 */

import { bagClient } from '../bagClient';
import type {
  BagValidateResponse,
  BagValidateResponseRaw,
  ValidationConfig,
} from '../types/bag.types';
import { transformValidateResponse } from '../types/bag.types';
import { DEFAULT_VALIDATION_CONFIG } from '@/lib/bagConstants';

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
    // Use provided config or default config
    const validationConfig = config || DEFAULT_VALIDATION_CONFIG;

    const response = await bagClient.post<BagValidateResponseRaw>(
      `/api/v1/validate/${sessionId}`,
      { config: validationConfig }
    );

    // Transform snake_case response to camelCase
    return transformValidateResponse(response.data);
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
};

export default bagValidationService;
