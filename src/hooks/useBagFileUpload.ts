/**
 * useBagFileUpload Hook
 *
 * Custom hook for BAG file upload with progress tracking and automatic validation trigger.
 * Uses TanStack Query mutation for upload state management.
 *
 * Adapted from ExcelFlow useFileUpload with key differences:
 * - Automatically triggers validation on upload success (NEW)
 * - Calls setValidating with sessionId after upload
 * - Returns sessionId instead of jobId
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { uploadFile as uploadFileService } from '@/api/services/bagUpload.service';
import { useBagValidation } from '@/contexts/BagValidationContext';
import type { BagUploadResponse, AppError } from '@/api/types/bag.types';

/**
 * Hook for managing BAG file upload state and operations
 *
 * Handles the first step of the two-step validation workflow:
 * 1. Upload file with progress tracking
 * 2. Automatically trigger validation on success
 *
 * @returns Object with upload mutation, progress, loading state, error, and reset function
 *
 * @example
 * ```tsx
 * const { uploadFile, uploadProgress, isUploading, error } = useBagFileUpload();
 *
 * const handleUpload = (file: File) => {
 *   uploadFile(file);
 * };
 *
 * return (
 *   <div>
 *     <button onClick={() => handleUpload(selectedFile)} disabled={isUploading}>
 *       Upload
 *     </button>
 *     {isUploading && <ProgressBar value={uploadProgress} />}
 *   </div>
 * );
 * ```
 */
export function useBagFileUpload() {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const { setUploading, setValidating, setError } = useBagValidation();

  const mutation = useMutation<BagUploadResponse, AppError, File>({
    mutationFn: (file: File) => {
      // Reset progress when starting new upload
      setUploadProgress(0);

      // Call setUploading to update context state
      setUploading(file);

      // Call upload service with progress callback
      return uploadFileService(file, undefined, (progress) => {
        setUploadProgress(progress);
      });
    },
    onSuccess: (data) => {
      // Ensure progress is at 100% on success
      setUploadProgress(100);

      // Extract sessionId from response
      const { sessionId } = data;

      // Automatically transition to validating state
      // This is a KEY DIFFERENCE from ExcelFlow
      setValidating(sessionId);

      // Note: Validation will be triggered by useBagValidation hook
      // which is called in the component that uses this hook
    },
    onError: (error) => {
      // Reset progress on error
      setUploadProgress(0);

      // Update context error state
      setError(error);
    },
  });

  return {
    /** Upload file mutation function */
    uploadFile: mutation.mutate,
    /** Current upload progress (0-100) */
    uploadProgress,
    /** Whether upload is in progress */
    isUploading: mutation.isPending,
    /** Error if upload failed */
    error: mutation.error,
    /** Upload response data (contains sessionId) */
    data: mutation.data,
    /** Reset mutation state */
    reset: () => {
      mutation.reset();
      setUploadProgress(0);
    },
  };
}
