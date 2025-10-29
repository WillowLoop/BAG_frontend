/**
 * useFileDownload Hook
 *
 * Custom hook for handling file downloads with blob conversion and browser download trigger.
 * Uses TanStack Query mutation for download state management.
 */

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import downloadService from '@/api/services/download.service';
import { generateDownloadFilename } from '@/lib/utils';

/**
 * Hook for downloading processed files
 *
 * @param fileName - Original filename for generating download name
 * @returns Mutation object with download function and state
 */
export function useFileDownload(fileName: string) {
  const mutation = useMutation({
    mutationFn: async (jobId: string) => {
      const blob = await downloadService.downloadFile(jobId);
      return blob;
    },
    onSuccess: (blob) => {
      // Create download URL from blob
      const url = URL.createObjectURL(blob);

      // Create temporary anchor element for download
      const a = document.createElement('a');
      a.href = url;
      a.download = generateDownloadFilename(fileName);

      // Trigger download
      document.body.appendChild(a);
      a.click();

      // Cleanup
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Success toast
      toast.success('Bestand succesvol gedownload');
    },
    onError: (error) => {
      // Error toast
      toast.error('Download mislukt. Probeer opnieuw.');
      console.error('Download error:', error);
    },
  });

  return {
    downloadFile: mutation.mutate,
    isDownloading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}
