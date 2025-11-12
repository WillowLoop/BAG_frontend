/**
 * useBagFileDownload Hook
 *
 * Custom hook for handling BAG file downloads with blob conversion and browser download trigger.
 * Uses TanStack Query mutation for download state management.
 *
 * Adapted from ExcelFlow useFileDownload with key differences:
 * - Automatically calls cleanup endpoint after successful download (NEW)
 * - Uses generateBagFilename utility for BAG-specific filename
 * - Uses sessionId instead of jobId
 */

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { downloadFile as downloadFileService } from '@/api/services/bagDownload.service';
import { cleanupSession as cleanupSessionService } from '@/api/services/bagCleanup.service';
import { generateBagFilename } from '@/lib/bagUtils';
import type { AppError } from '@/api/types';

/**
 * Hook for downloading validated BAG files
 *
 * Handles the complete download workflow:
 * 1. Download file from BAG API
 * 2. Create blob URL and trigger browser download
 * 3. Cleanup blob URL to prevent memory leaks
 * 4. Automatically call cleanup endpoint (NEW - not in ExcelFlow)
 * 5. Show success/error toast notifications
 *
 * @param fileName - Original filename for generating download name
 * @returns Mutation object with download function and state
 *
 * @example
 * ```tsx
 * const { downloadFile, isDownloading, error } = useBagFileDownload('addresses.xlsx');
 *
 * const handleDownload = () => {
 *   downloadFile(sessionId);
 * };
 *
 * return (
 *   <button onClick={handleDownload} disabled={isDownloading}>
 *     {isDownloading ? 'Downloaden...' : 'Download Resultaten'}
 *   </button>
 * );
 * ```
 */
export function useBagFileDownload(fileName: string) {
  const mutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const blob = await downloadFileService(sessionId);
      return { blob, sessionId };
    },
    onSuccess: async ({ blob, sessionId }) => {
      // Create download URL from blob
      const url = URL.createObjectURL(blob);

      // Create temporary anchor element for download
      const a = document.createElement('a');
      a.href = url;
      a.download = generateBagFilename(fileName);

      // Trigger download
      document.body.appendChild(a);
      a.click();

      // Cleanup blob URL
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Success toast
      toast.success('Bestand succesvol gedownload');

      // Automatically call cleanup endpoint
      // This is a KEY DIFFERENCE from ExcelFlow
      try {
        await cleanupSessionService(sessionId);
        console.log('Session cleanup successful');
      } catch (cleanupError) {
        // Log cleanup error but don't disrupt user experience
        // Cleanup failures are silent per requirements
        console.error('Session cleanup failed:', cleanupError);
      }

      // Note: State remains 'complete' to allow re-download
    },
    onError: (error: AppError) => {
      // Error toast
      toast.error('Download mislukt. Probeer opnieuw.');
      console.error('Download error:', error);
    },
  });

  return {
    /** Download file mutation function */
    downloadFile: mutation.mutate,
    /** Whether download is in progress */
    isDownloading: mutation.isPending,
    /** Error if download failed */
    error: mutation.error,
    /** Reset mutation state */
    reset: mutation.reset,
  };
}
