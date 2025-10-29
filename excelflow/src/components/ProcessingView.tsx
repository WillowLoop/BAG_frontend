/**
 * ProcessingView Component
 *
 * Displays real-time progress of file analysis with status updates.
 * Uses polling to fetch status from API and shows progress bar with messages.
 */

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FileText } from 'lucide-react';
import { useAnalysisStatus } from '@/hooks/useAnalysisStatus';
import type { AppError } from '@/api/types';

interface ProcessingViewProps {
  /** Job ID for the analysis being processed */
  jobId: string;
  /** Name of the file being processed */
  fileName: string;
  /** Callback when processing completes successfully */
  onComplete: () => void;
  /** Callback when an error occurs */
  onError: (error: AppError) => void;
}

/**
 * Status message mapping for user-friendly Dutch messages
 */
const STATUS_MESSAGES: Record<string, string> = {
  queued: 'Je bestand staat in de wachtrij...',
  processing: 'Bestand wordt verwerkt...',
  analyzing: 'Data wordt geanalyseerd...',
  complete: 'Analyse compleet!',
};

/**
 * Get user-friendly status message
 */
function getStatusMessage(status: string | undefined, customMessage?: string): string {
  if (customMessage) {
    return customMessage;
  }
  return STATUS_MESSAGES[status || ''] || 'Bezig met verwerken...';
}

/**
 * ProcessingView Component
 */
export function ProcessingView({ jobId, fileName, onComplete, onError }: ProcessingViewProps) {
  const { status, progress, message, error } = useAnalysisStatus(jobId);
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Handle completion
  useEffect(() => {
    if (status?.status === 'complete') {
      onComplete();
    }
  }, [status?.status, onComplete]);

  // Handle failure
  useEffect(() => {
    if (status?.status === 'failed') {
      onError({
        type: 'api',
        message: status.error || 'Verwerking mislukt. Probeer opnieuw.',
      });
    }
  }, [status?.status, status?.error, onError]);

  // Handle polling errors
  useEffect(() => {
    if (error && !timeoutReached) {
      onError(error);
    }
  }, [error, timeoutReached, onError]);

  // Timeout mechanism: 5 minutes (300000ms)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTimeoutReached(true);
      onError({
        type: 'api',
        message: 'Verwerking duurt onverwacht lang. Neem contact op met support.',
      });
    }, 300000); // 5 minutes

    // Reset timeout on status updates
    return () => {
      clearTimeout(timeoutId);
    };
  }, [status, onError]);

  const displayMessage = getStatusMessage(status?.status, message);

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Card className="p-6 sm:p-8">
        {/* File Info */}
        <div className="flex items-start gap-4 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b">
          <div
            className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0"
            aria-hidden="true"
          >
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-lg sm:text-xl truncate">{fileName}</h2>
            <p className="text-sm text-gray-600">Bezig met verwerken...</p>
          </div>
        </div>

        {/* Progress Section */}
        <div className="py-6 sm:py-8">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-base sm:text-lg">Voortgang</h3>
              <span
                className="text-sm sm:text-base text-gray-600 font-medium tabular-nums"
                aria-label={`${Math.round(progress)} procent voltooid`}
              >
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Status Message with aria-live for screen readers */}
          <div
            className="space-y-3"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="flex items-center gap-3 text-sm sm:text-base">
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                aria-hidden="true"
              />
              <span className="text-gray-700 font-medium transition-all duration-300 ease-in-out">
                {displayMessage}
              </span>
            </div>

            {/* Additional status indicators based on progress */}
            {progress > 30 && status?.status === 'processing' && (
              <div className="flex items-center gap-3 text-sm sm:text-base animate-fade-in">
                <div
                  className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                  aria-hidden="true"
                />
                <span className="text-gray-600">Data structuur wordt gelezen...</span>
              </div>
            )}

            {progress > 60 && status?.status === 'analyzing' && (
              <div className="flex items-center gap-3 text-sm sm:text-base animate-fade-in">
                <div
                  className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
                  aria-hidden="true"
                />
                <span className="text-gray-600">Analyse wordt uitgevoerd...</span>
              </div>
            )}

            {progress > 85 && (
              <div className="flex items-center gap-3 text-sm sm:text-base animate-fade-in">
                <div
                  className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
                  aria-hidden="true"
                />
                <span className="text-gray-600">Resultaten worden voorbereid...</span>
              </div>
            )}
          </div>
        </div>

        {/* Info message */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs sm:text-sm text-blue-800">
            Je kunt dit venster geopend laten. We houden je op de hoogte van de voortgang.
          </p>
        </div>
      </Card>
    </div>
  );
}
