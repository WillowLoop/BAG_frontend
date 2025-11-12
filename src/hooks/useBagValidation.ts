/**
 * useBagValidation Hook
 *
 * Custom hook for starting BAG validation after file upload.
 * Uses TanStack Query mutation for validation request.
 *
 * This is the second step of the two-step validation workflow:
 * 1. Upload file (useBagFileUpload)
 * 2. Start validation (this hook) ← YOU ARE HERE
 * 3. Poll status (useBagValidationStatus)
 *
 * This hook is called automatically by the component after upload succeeds.
 */

import { useMutation } from '@tanstack/react-query';
import { startValidation as startValidationService } from '@/api/services/bagValidation.service';
import { useBagValidation as useBagValidationContext } from '@/contexts/BagValidationContext';
import type { BagValidateResponse, AppError } from '@/api/types/bag.types';

/**
 * Hook for starting BAG validation
 *
 * Triggers the validation process for an uploaded session.
 * Called automatically after upload succeeds (in useBagFileUpload onSuccess).
 *
 * @returns Mutation object with validation start function and state
 *
 * @example
 * ```tsx
 * const { startValidation, isStarting, error } = useBagValidationMutation();
 *
 * // Automatically triggered after upload:
 * useEffect(() => {
 *   if (sessionId && state === 'validating') {
 *     startValidation(sessionId);
 *   }
 * }, [sessionId, state]);
 * ```
 */
export function useBagValidationMutation() {
  const { setError } = useBagValidationContext();

  const mutation = useMutation<BagValidateResponse, AppError, string>({
    mutationFn: (sessionId: string) => {
      // Start validation for the given session
      return startValidationService(sessionId);
    },
    onSuccess: () => {
      // Validation started successfully
      // Polling will begin via useBagValidationStatus hook
      // No state change needed here - already in 'validating' state
    },
    onError: (error) => {
      // Update context error state
      setError(error);
    },
  });

  return {
    /** Start validation mutation function */
    startValidation: mutation.mutate,
    /** Whether validation is starting */
    isStarting: mutation.isPending,
    /** Error if validation start failed */
    error: mutation.error,
    /** Validation start response data */
    data: mutation.data,
    /** Reset mutation state */
    reset: mutation.reset,
  };
}
