/**
 * Main App Component for BAG Address Validation
 *
 * Single-page application with state-based conditional rendering.
 * States: idle, uploading, validating, complete, error
 */

import { Toaster } from 'sonner';
import { BagValidationProvider, useBagValidation } from './contexts/BagValidationContext';
import { BagUploadSection } from './components/BagUploadSection';
import { BagProcessingView } from './components/BagProcessingView';
import { BagDownloadSection } from './components/BagDownloadSection';
import { BagErrorView } from './components/BagErrorView';

function AppContent() {
  const { state, currentFile, sessionId, error } = useBagValidation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            BAG Adres Validatie
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Valideer Nederlandse adressen tegen de officiële BAG database
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Idle or Uploading State - Show Upload Section */}
        {(state === 'idle' || state === 'uploading') && (
          <BagUploadSection />
        )}

        {/* Validating State - Show Processing View */}
        {state === 'validating' && currentFile && (
          <BagProcessingView
            filename={currentFile.name}
            fileSize={currentFile.size}
          />
        )}

        {/* Complete State - Show Download Section */}
        {state === 'complete' && currentFile && sessionId && (
          <BagDownloadSection
            filename={currentFile.name}
            sessionId={sessionId}
          />
        )}

        {/* Error State - Show Error View */}
        {state === 'error' && error && (
          <BagErrorView error={error} />
        )}
      </main>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        expand={false}
        richColors
        duration={4000}
        closeButton
      />
    </div>
  );
}

function App() {
  return (
    <BagValidationProvider>
      <AppContent />
    </BagValidationProvider>
  );
}

export default App;
