/**
 * useAnalysisStatus Hook
 *
 * Custom hook for polling analysis job status with automatic stop on completion.
 * Uses TanStack Query with refetchInterval for real-time updates.
 */

import { useQuery } from '@tanstack/react-query';
import { analysisService } from '@/api/services/analysis.service';
import type { AnalysisStatus, AppError } from '@/api/types';

interface UseAnalysisStatusResult {
  /** Current analysis status data */
  status: AnalysisStatus | undefined;
  /** Progress percentage (0-100) */
  progress: number;
  /** Status message */
  message: string | undefined;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: AppError | null;
}

/**
 * Hook for polling analysis status with automatic completion detection
 * @param jobId - Unique identifier for the analysis job
 * @returns Analysis status with loading and error states
 */
export function useAnalysisStatus(jobId: string | null): UseAnalysisStatusResult {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analysisStatus', jobId],
    queryFn: () => analysisService.getStatus(jobId!),
    // Poll every 2.5 seconds (2500ms)
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Stop polling when job is complete or failed
      if (status === 'complete' || status === 'failed') {
        return false;
      }
      return 2500;
    },
    // Only run query when jobId is available
    enabled: !!jobId,
    // Retry 3 times on network errors (configured in queryClient)
    retry: 3,
  });

  return {
    status: data,
    progress: data?.progress ?? 0,
    message: data?.message,
    isLoading,
    error: error as AppError | null,
  };
}
