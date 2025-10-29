/**
 * useFileUpload Hook
 *
 * Custom hook for file upload with progress tracking using TanStack Query.
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { uploadFile as uploadFileService } from '@/api/services/upload.service';
import type { UploadResponse, AppError } from '@/api/types';

/**
 * Hook for managing file upload state and operations
 *
 * @returns Object with upload mutation, progress, loading state, error, and reset function
 */
export function useFileUpload() {
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const mutation = useMutation<UploadResponse, AppError, File>({
    mutationFn: (file: File) => {
      // Reset progress when starting new upload
      setUploadProgress(0);

      // Call upload service with progress callback
      return uploadFileService(file, (progress) => {
        setUploadProgress(progress);
      });
    },
    onSuccess: () => {
      // Ensure progress is at 100% on success
      setUploadProgress(100);
    },
    onError: () => {
      // Reset progress on error
      setUploadProgress(0);
    },
  });

  return {
    uploadFile: mutation.mutate,
    uploadProgress,
    isUploading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    reset: () => {
      mutation.reset();
      setUploadProgress(0);
    },
  };
}
