/**
 * App Component - Main Application
 *
 * Manages the complete ExcelFlow application flow:
 * - idle: Landing page with upload section
 * - uploading: Upload progress
 * - processing: Analysis progress with polling
 * - complete: Download section
 * - error: Error view with retry options
 */

import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { useAppContext } from '@/contexts/AppContext';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/HeroSection';
import { FeaturesGrid } from '@/components/FeaturesGrid';
import { UploadSection } from '@/components/UploadSection';
import { ProcessingView } from '@/components/ProcessingView';
import { DownloadSection } from '@/components/DownloadSection';
import { ErrorView } from '@/components/ErrorView';
import type { AppError } from '@/api/types';

function App() {
  const {
    uploadState,
    currentFile,
    jobId,
    error,
    setUploadState,
    setCurrentFile,
    setJobId,
    setError,
    reset,
  } = useAppContext();

  const { uploadFile, data: uploadData, error: uploadError } = useFileUpload();

  /**
   * Handle file selection from UploadSection
   * Triggers upload and state change to 'uploading'
   */
  const handleFileSelect = (file: File) => {
    setCurrentFile(file);
    setUploadState('uploading');
    setError(null);

    // Trigger upload
    uploadFile(file);
  };

  /**
   * Handle successful upload
   * Save jobId and transition to 'processing' state
   */
  useEffect(() => {
    if (uploadData && uploadState === 'uploading') {
      setJobId(uploadData.jobId);
      setUploadState('processing');
    }
  }, [uploadData, uploadState, setJobId, setUploadState]);

  /**
   * Handle upload error
   * Transition to 'error' state
   */
  useEffect(() => {
    if (uploadError && uploadState === 'uploading') {
      setError(uploadError);
      setUploadState('error');
    }
  }, [uploadError, uploadState, setError, setUploadState]);

  /**
   * Handle processing completion
   * Transition to 'complete' state
   */
  const handleProcessingComplete = () => {
    setUploadState('complete');
  };

  /**
   * Handle processing error
   * Transition to 'error' state
   */
  const handleProcessingError = (err: AppError) => {
    setError(err);
    setUploadState('error');
  };

  /**
   * Handle download completion and reset
   * Return to 'idle' state for new analysis
   */
  const handleReset = () => {
    reset();
  };

  /**
   * Handle retry action from error state
   * Attempts to retry the failed operation
   */
  const handleRetry = () => {
    if (currentFile) {
      // If we have a file, retry upload
      setUploadState('uploading');
      setError(null);
      uploadFile(currentFile);
    } else {
      // Otherwise, just reset to idle
      reset();
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-12">
          {/* Conditional rendering based on uploadState */}
          {uploadState === 'idle' && (
            <div className="max-w-4xl mx-auto">
              {/* Hero Section */}
              <HeroSection />

              {/* Upload Section */}
              <UploadSection onFileSelect={handleFileSelect} />

              {/* Features Grid */}
              <FeaturesGrid />
            </div>
          )}

          {uploadState === 'uploading' && currentFile && (
            <ProcessingView
              jobId="uploading"
              fileName={currentFile.name}
              onComplete={() => {
                // This won't be called during upload
                // Upload completion is handled by useEffect
              }}
              onError={handleProcessingError}
            />
          )}

          {uploadState === 'processing' && jobId && currentFile && (
            <ProcessingView
              jobId={jobId}
              fileName={currentFile.name}
              onComplete={handleProcessingComplete}
              onError={handleProcessingError}
            />
          )}

          {uploadState === 'complete' && jobId && currentFile && (
            <DownloadSection jobId={jobId} fileName={currentFile.name} onReset={handleReset} />
          )}

          {uploadState === 'error' && error && (
            <ErrorView error={error} onRetry={handleRetry} onReset={handleReset} />
          )}
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Toast Notifications */}
      <Toaster position="top-right" expand={false} richColors duration={4000} closeButton />
    </>
  );
}

export default App;
