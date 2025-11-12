/**
 * BagDownloadSection Component
 *
 * Displays success state after BAG address validation is complete.
 * Allows users to download validated results and start a new validation.
 * Adapted from ExcelFlow DownloadSection with BAG-specific requirements:
 * - Dutch text for BAG validation context
 * - "Download Resultaten" button
 * - "Nieuwe Validatie" reset button
 * - Auto cleanup after download (handled in hook)
 */

import { Download, CheckCircle, Upload, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useBagValidation } from '@/contexts/BagValidationContext';
import { useBagFileDownload } from '@/hooks/useBagFileDownload';
import { BAG_MESSAGES } from '@/lib/bagMessages';

interface BagDownloadSectionProps {
  /** Original filename for display */
  filename: string;
  /** Session ID for downloading the validated file */
  sessionId: string;
}

/**
 * BagDownloadSection component for successful validation completion
 *
 * Features:
 * - Success icon and message
 * - Download button with loading state
 * - "Nieuwe Validatie" button to reset
 * - User can download multiple times
 * - Auto cleanup after download (handled by hook)
 */
export function BagDownloadSection({ filename, sessionId }: BagDownloadSectionProps) {
  const { reset } = useBagValidation();
  const { downloadFile, isDownloading } = useBagFileDownload(filename);

  const handleDownload = () => {
    downloadFile(sessionId);
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <Card className="p-6 sm:p-8">
        {/* Success State */}
        <div className="py-6 sm:py-8">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-fade-in"
              aria-hidden="true"
            >
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              {BAG_MESSAGES.download.title}
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              {BAG_MESSAGES.download.description}
            </p>
          </div>

          {/* Validation Summary */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6">
            <h3 className="font-semibold mb-4 text-base sm:text-lg">
              {BAG_MESSAGES.download.summaryTitle}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 mb-2">{BAG_MESSAGES.download.fileLabel}</p>
                <p className="font-medium truncate" title={filename}>
                  {filename}
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-2">{BAG_MESSAGES.download.statusLabel}</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" aria-hidden="true" />
                  <span className="font-medium text-green-700">
                    {BAG_MESSAGES.download.statusComplete}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              size="lg"
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 min-h-[44px] btn-hover-lift"
              aria-label="Download gevalideerd BAG adres bestand"
              type="button"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                  {BAG_MESSAGES.download.downloading}
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                  {BAG_MESSAGES.download.buttonLabel}
                </>
              )}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              size="lg"
              className="sm:w-auto min-h-[44px] btn-hover-lift"
              aria-label={BAG_MESSAGES.download.newValidationLabel}
              type="button"
            >
              <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
              {BAG_MESSAGES.download.newValidation}
            </Button>
          </div>

          {/* Info Message */}
          <p className="text-xs sm:text-sm text-gray-500 text-center mt-4">
            {BAG_MESSAGES.download.multipleDownloads}
          </p>
        </div>
      </Card>
    </div>
  );
}
