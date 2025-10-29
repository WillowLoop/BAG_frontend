/**
 * Upload Service
 *
 * API service methods for file upload with progress tracking.
 */

import { apiClient } from '../client';
import type { UploadResponse } from '../types';

/**
 * Upload a file to the backend API
 *
 * @param file - The Excel file to upload
 * @param onProgress - Optional callback for tracking upload progress (0-100)
 * @returns Promise resolving to upload response with jobId
 * @throws AppError if upload fails
 */
export async function uploadFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> {
  try {
    // Create FormData with file
    const formData = new FormData();
    formData.append('file', file);

    // Make POST request with multipart/form-data
    const response = await apiClient.post<UploadResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        // Calculate upload progress percentage
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });

    return response.data;
  } catch (error) {
    // Error is already transformed by axios interceptor
    throw error;
  }
}
