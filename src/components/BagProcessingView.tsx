/**
 * BagProcessingView Component
 *
 * Displays real-time progress of BAG address validation with status updates.
 * Adapted from ExcelFlow ProcessingView with BAG-specific requirements:
 * - Dutch status messages for BAG validation phases
 * - Two progress indicators (overall + phase)
 * - Displays processed_count / total_count
 * - Uses sessionId instead of jobId
 */

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FileText } from 'lucide-react';
import { useBagValidation } from '@/contexts/BagValidationContext';
import { useBagValidationStatus } from '@/hooks/useBagValidationStatus';
import { BAG_MESSAGES } from '@/lib/bagMessages';

interface BagProcessingViewProps {
  /** Name of the file being processed */
  filename: string;
  /** File size in bytes */
  fileSize: number;
}

/**
 * Get phase-specific message based on progress percentage
 */
function getPhaseMessage(progress: number, customPhase?: string): string {
  if (customPhase) {
    return customPhase;
  }

  if (progress < 20) {
    return BAG_MESSAGES.phases.reading;
  } else if (progress < 40) {
    return BAG_MESSAGES.phases.parsing;
  } else if (progress < 70) {
    return BAG_MESSAGES.phases.validating;
  } else if (progress < 90) {
    return BAG_MESSAGES.phases.matching;
  } else {
    return BAG_MESSAGES.phases.finalizing;
  }
}

/**
 * BagProcessingView Component
 */
export function BagProcessingView({ filename, fileSize }: BagProcessingViewProps) {
  const { sessionId, setComplete, setError } = useBagValidation();
  const { status, error } = useBagValidationStatus(sessionId);
  const [timeoutReached, setTimeoutReached] = useState(false);

  const progress = status?.progress || 0;
  const phase = status?.phase;
  const processedCount = status?.processedCount || 0;
  const totalCount = status?.totalCount || 0;

  // Handle completion
  useEffect(() => {
    if (status?.status === 'complete') {
      setComplete();
    }
  }, [status?.status, setComplete]);

  // Handle failure
  useEffect(() => {
    if (status?.status === 'failed') {
      setError({
        type: 'api',
        message: status.error || BAG_MESSAGES.errors.validationFailed,
      });
    }
  }, [status?.status, status?.error, setError]);

  // Handle polling errors
  useEffect(() => {
    if (error && !timeoutReached) {
      setError(error);
    }
  }, [error, timeoutReached, setError]);

  // Timeout mechanism: 5 minutes (300000ms)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTimeoutReached(true);
      setError({
        type: 'api',
        message: BAG_MESSAGES.errors.validationTimeout,
      });
    }, 300000); // 5 minutes

    // Reset timeout on status updates
    return () => {
      clearTimeout(timeoutId);
    };
  }, [status, setError]);

  const displayMessage = getPhaseMessage(progress, phase);
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

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
            <h2 className="font-semibold text-lg sm:text-xl truncate">{filename}</h2>
            <p className="text-sm text-gray-600">{formatFileSize(fileSize)}</p>
          </div>
        </div>

        {/* Progress Section */}
        <div className="py-6 sm:py-8">
          {/* Overall Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-base sm:text-lg">
                {BAG_MESSAGES.validation.progressLabel}
              </h3>
              <span
                className="text-sm sm:text-base text-gray-600 font-medium tabular-nums"
                aria-label={`${Math.round(progress)} procent voltooid`}
              >
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Status Messages with aria-live for screen readers */}
          <div
            className="space-y-3"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {/* Main Phase Message */}
            <div className="flex items-center gap-3 text-sm sm:text-base">
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                aria-hidden="true"
              />
              <span className="text-gray-700 font-medium transition-all duration-300 ease-in-out">
                {displayMessage}
              </span>
            </div>

            {/* Processed Count Indicator */}
            {totalCount > 0 && (
              <div className="flex items-center gap-3 text-sm sm:text-base animate-fade-in">
                <div
                  className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
                  aria-hidden="true"
                />
                <span className="text-gray-600">
                  {processedCount} van {totalCount} {BAG_MESSAGES.validation.addressesProcessed}
                </span>
              </div>
            )}

            {/* Additional phase indicators based on progress */}
            {progress > 85 && (
              <div className="flex items-center gap-3 text-sm sm:text-base animate-fade-in">
                <div
                  className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
                  aria-hidden="true"
                />
                <span className="text-gray-600">{BAG_MESSAGES.phases.finalizing}</span>
              </div>
            )}
          </div>
        </div>

        {/* Info message */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs sm:text-sm text-blue-800">
            {BAG_MESSAGES.validation.keepWindowOpen}
          </p>
        </div>
      </Card>
    </div>
  );
}
