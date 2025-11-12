/**
 * BAG Download Service
 *
 * Handles file download operations from the BAG API.
 * Downloads validated Excel files as binary blobs.
 *
 * Reused from ExcelFlow download service with BAG-specific endpoint path.
 * No response transformation needed (blob responses not wrapped).
 */

import { bagClient } from '../bagClient';

/**
 * Download a validated file by session ID
 *
 * Downloads the validated Excel file for a completed validation session.
 * The file is returned as a Blob for browser download.
 *
 * @param sessionId - The unique identifier for the completed session
 * @returns Promise resolving to a Blob containing the file data
 * @throws AppError if download fails (404, 400, or network error)
 *
 * @example
 * ```typescript
 * const blob = await downloadFile(sessionId);
 * const url = URL.createObjectURL(blob);
 * const a = document.createElement('a');
 * a.href = url;
 * a.download = 'bag_validated_addresses.xlsx';
 * a.click();
 * URL.revokeObjectURL(url);
 * ```
 */
export async function downloadFile(sessionId: string): Promise<Blob> {
  try {
    const response = await bagClient.get(`/api/v1/download/${sessionId}`, {
      responseType: 'blob',
    });

    return response.data;
  } catch (error) {
    // Error is already transformed by bagClient interceptor
    throw error;
  }
}

/**
 * Download service exports
 */
export const bagDownloadService = {
  downloadFile,
};

export default bagDownloadService;
