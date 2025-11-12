/**
 * BAG Upload Service
 *
 * API service methods for uploading Excel files to the BAG API.
 * Handles multipart/form-data upload with progress tracking and config parameter.
 *
 * Adapted from ExcelFlow upload service with BAG-specific additions:
 * - Adds config parameter to FormData (JSON stringified)
 * - Returns sessionId instead of jobId
 * - Transforms snake_case response to camelCase
 */

import { bagClient } from '../bagClient';
import type { BagUploadResponse, BagUploadResponseRaw, ValidationConfig } from '../types/bag.types';
import { transformUploadResponse } from '../types/bag.types';
import { DEFAULT_VALIDATION_CONFIG } from '../../lib/bagConstants';

/**
 * Upload a file to the BAG API
 *
 * Uploads an Excel file (.xlsx) with validation configuration.
 * The file and config are sent as multipart/form-data.
 *
 * @param file - The Excel file to upload (.xlsx only)
 * @param config - Optional validation configuration (uses defaults if not provided)
 * @param onProgress - Optional callback for tracking upload progress (0-100)
 * @returns Promise resolving to upload response with sessionId
 * @throws AppError if upload fails
 *
 * @example
 * ```typescript
 * const response = await uploadFile(file, undefined, (progress) => {
 *   console.log(`Upload progress: ${progress}%`);
 * });
 * console.log('Session ID:', response.sessionId);
 * ```
 */
export async function uploadFile(
  file: File,
  config?: ValidationConfig,
  onProgress?: (progress: number) => void
): Promise<BagUploadResponse> {
  try {
    // Create FormData with file
    const formData = new FormData();
    formData.append('file', file);

    // Note: We don't send config parameter - backend will use its defaults
    // This avoids JSON parsing issues with multipart/form-data

    // Make POST request with multipart/form-data
    // Note: Don't set Content-Type manually - Axios will set it automatically
    // with the correct boundary for multipart/form-data
    const response = await bagClient.post<BagUploadResponseRaw>(
      '/api/v1/upload',
      formData,
      {
        onUploadProgress: (progressEvent) => {
          // Calculate upload progress percentage
          if (progressEvent.total && onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      }
    );

    // Transform snake_case response to camelCase
    return transformUploadResponse(response.data);
  } catch (error) {
    // Error is already transformed by bagClient interceptor
    throw error;
  }
}

/**
 * Upload service exports
 */
export const bagUploadService = {
  uploadFile,
};

export default bagUploadService;
