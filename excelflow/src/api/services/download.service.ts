/**
 * Download Service
 *
 * Handles file download operations from the backend API.
 * Downloads processed Excel files as binary blobs.
 */

import { apiClient } from '../client';

/**
 * Download a processed file by job ID
 *
 * @param jobId - The unique identifier for the completed job
 * @returns Promise resolving to a Blob containing the file data
 * @throws AppError if download fails (404, 400, or network error)
 */
export async function downloadFile(jobId: string): Promise<Blob> {
  const response = await apiClient.get(`/download/${jobId}`, {
    responseType: 'blob',
  });

  return response.data;
}

// Export as default for consistent service pattern
export default {
  downloadFile,
};
