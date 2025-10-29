/**
 * DownloadSection Component
 *
 * Displays success state after file processing is complete.
 * Allows users to download the analyzed file and start a new analysis.
 */

import { Download, CheckCircle, Upload, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useFileDownload } from '@/hooks/useFileDownload';

interface DownloadSectionProps {
  /** Job ID for downloading the processed file */
  jobId: string;
  /** Original filename for generating download name */
  fileName: string;
  /** Callback to reset and return to upload state */
  onReset: () => void;
}

/**
 * DownloadSection component for successful analysis completion
 *
 * Features:
 * - Success icon and message
 * - Download button with loading state
 * - "Nieuwe analyse" button to reset
 * - User can download multiple times
 */
export function DownloadSection({ jobId, fileName, onReset }: DownloadSectionProps) {
  const { downloadFile, isDownloading } = useFileDownload(fileName);

  const handleDownload = () => {
    downloadFile(jobId);
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
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Analyse compleet!</h2>
            <p className="text-sm sm:text-base text-gray-600">
              Je bestand is succesvol geanalyseerd. Download de resultaten hieronder.
            </p>
          </div>

          {/* Analysis Summary */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6">
            <h3 className="font-semibold mb-4 text-base sm:text-lg">Analyse Overzicht</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 mb-2">Bestand:</p>
                <p className="font-medium truncate" title={fileName}>
                  {fileName}
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-2">Status:</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" aria-hidden="true" />
                  <span className="font-medium text-green-700">Compleet</span>
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
              aria-label="Download geanalyseerd Excel bestand"
              type="button"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                  Downloaden...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                  Download Geanalyseerd Bestand
                </>
              )}
            </Button>
            <Button
              onClick={onReset}
              variant="outline"
              size="lg"
              className="sm:w-auto min-h-[44px] btn-hover-lift"
              aria-label="Start nieuwe analyse"
              type="button"
            >
              <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
              Nieuwe Analyse
            </Button>
          </div>

          {/* Info Message */}
          <p className="text-xs sm:text-sm text-gray-500 text-center mt-4">
            Je kunt het bestand meerdere keren downloaden indien nodig.
          </p>
        </div>
      </Card>
    </div>
  );
}
