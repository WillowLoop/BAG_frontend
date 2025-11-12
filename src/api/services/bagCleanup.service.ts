/**
 * BAG Cleanup Service
 *
 * Handles session cleanup operations.
 * Deletes uploaded files and validation results from the server.
 *
 * This service is called automatically after successful download.
 * Cleanup is silent - errors are logged but don't disrupt user experience.
 */

import { bagClient } from '../bagClient';
import type { BagCleanupResponse, BagCleanupResponseRaw } from '../types/bag.types';
import { transformCleanupResponse } from '../types/bag.types';

/**
 * Cleanup a validation session
 *
 * Deletes all files associated with a session (upload + output).
 * This operation is automatic after download and should be silent.
 *
 * @param sessionId - The unique identifier for the session to cleanup
 * @returns Promise resolving to cleanup confirmation
 * @throws AppError if cleanup fails (logged but not shown to user)
 *
 * @example
 * ```typescript
 * try {
 *   await cleanupSession(sessionId);
 *   console.log('Cleanup successful');
 * } catch (error) {
 *   // Log error but don't show to user
 *   console.error('Cleanup failed:', error);
 * }
 * ```
 */
export async function cleanupSession(sessionId: string): Promise<BagCleanupResponse> {
  try {
    const response = await bagClient.delete<BagCleanupResponseRaw>(
      `/api/v1/cleanup/${sessionId}`
    );

    // Transform snake_case response to camelCase
    return transformCleanupResponse(response.data);
  } catch (error) {
    // Error is already transformed by bagClient interceptor
    // Caller should handle silently (log only)
    throw error;
  }
}

/**
 * Cleanup service exports
 */
export const bagCleanupService = {
  cleanupSession,
};

export default bagCleanupService;
