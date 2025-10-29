/**
 * Analysis Service
 *
 * API service methods for fetching analysis job status.
 */

import { apiClient } from '../client';
import type { AnalysisStatus } from '../types';

/**
 * Get the current status of an analysis job
 * @param jobId - Unique identifier for the analysis job
 * @returns Promise resolving to AnalysisStatus
 * @throws AppError if job not found or other errors occur
 */
export async function getStatus(jobId: string): Promise<AnalysisStatus> {
  try {
    const response = await apiClient.get<AnalysisStatus>(`/status/${jobId}`);
    return response.data;
  } catch (error) {
    // Error is already transformed by axios interceptor
    throw error;
  }
}

/**
 * Analysis service exports
 */
export const analysisService = {
  getStatus,
};
