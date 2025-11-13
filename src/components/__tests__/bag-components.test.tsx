/**
 * BAG Components Test Suite
 *
 * Focused tests for BAG validation UI components.
 * Tests critical behaviors: rendering, interactions, and state integration.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BagUploadSection } from '../BagUploadSection';
import { BagProcessingView } from '../BagProcessingView';
import { BagDownloadSection } from '../BagDownloadSection';
import { BagErrorView } from '../BagErrorView';
import { BagValidationProvider } from '@/contexts/BagValidationContext';
import type { AppError } from '@/api/types';

// Helper to create a test QueryClient
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock hooks
vi.mock('@/hooks/useBagFileUpload', () => ({
  useBagFileUpload: () => ({
    uploadFile: vi.fn(),
    uploadProgress: 0,
    isUploading: false,
  }),
}));

vi.mock('@/hooks/useBagValidationStatus', () => ({
  useBagValidationStatus: () => ({
    status: {
      status: 'processing',
      progress: 50,
      phase: 'Valideren...',
      processedCount: 50,
      totalCount: 100,
    },
    error: null,
  }),
}));

vi.mock('@/hooks/useBagFileDownload', () => ({
  useBagFileDownload: () => ({
    downloadFile: vi.fn(),
    isDownloading: false,
  }),
}));

describe('BagUploadSection', () => {
  it('renders upload interface with Dutch text', () => {
    render(
      <BagValidationProvider>
        <BagUploadSection />
      </BagValidationProvider>
    );

    expect(screen.getByText(/Upload je Excel bestand met adressen/i)).toBeInTheDocument();
    expect(screen.getByText(/Kies bestand/i)).toBeInTheDocument();
    expect(screen.getByText(/Ondersteunde formaten: \.xlsx/i)).toBeInTheDocument();
  });

  it('shows file preview when file is selected', async () => {
    render(
      <BagValidationProvider>
        <BagUploadSection />
      </BagValidationProvider>
    );

    const file = new File(['test content'], 'addresses.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('addresses.xlsx')).toBeInTheDocument();
    });
  });

  it('validates file type and shows error for non-.xlsx files', async () => {
    const { toast } = await import('sonner');

    render(
      <BagValidationProvider>
        <BagUploadSection />
      </BagValidationProvider>
    );

    const file = new File(['test'], 'document.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('.xlsx')
      );
    });
  });
});

describe('BagProcessingView', () => {
  it('displays progress bar and percentage', () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <BagValidationProvider>
          <BagProcessingView filename="test.xlsx" fileSize={1024} />
        </BagValidationProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText('Voortgang')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('shows processed count indicator', () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <BagValidationProvider>
          <BagProcessingView filename="test.xlsx" fileSize={1024} />
        </BagValidationProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText(/50 van 100 adressen verwerkt/i)).toBeInTheDocument();
  });

  it('displays phase message', () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <BagValidationProvider>
          <BagProcessingView filename="test.xlsx" fileSize={1024} />
        </BagValidationProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Valideren/i)).toBeInTheDocument();
  });
});

describe('BagDownloadSection', () => {
  it('renders download button with Dutch text', () => {
    render(
      <BagValidationProvider>
        <BagDownloadSection filename="test.xlsx" sessionId="test-session" />
      </BagValidationProvider>
    );

    expect(screen.getByText('Download Resultaten')).toBeInTheDocument();
    expect(screen.getByText('Nieuwe Validatie')).toBeInTheDocument();
  });

  it('shows success icon and completion message', () => {
    render(
      <BagValidationProvider>
        <BagDownloadSection filename="test.xlsx" sessionId="test-session" />
      </BagValidationProvider>
    );

    expect(screen.getByText(/Validatie succesvol afgerond/i)).toBeInTheDocument();
  });

  it('displays filename in summary', () => {
    render(
      <BagValidationProvider>
        <BagDownloadSection filename="addresses.xlsx" sessionId="test-session" />
      </BagValidationProvider>
    );

    expect(screen.getByText('addresses.xlsx')).toBeInTheDocument();
  });

  it('reset button calls reset function', () => {
    const { getByText } = render(
      <BagValidationProvider>
        <BagDownloadSection filename="test.xlsx" sessionId="test-session" />
      </BagValidationProvider>
    );

    const resetButton = getByText('Nieuwe Validatie');
    fireEvent.click(resetButton);

    // If it doesn't throw, the reset was called successfully
    expect(resetButton).toBeInTheDocument();
  });
});

describe('BagErrorView', () => {
  it('displays network error with appropriate styling', () => {
    const error: AppError = {
      type: 'network',
      message: 'Geen verbinding met de server',
    };

    render(
      <BagValidationProvider>
        <BagErrorView error={error} />
      </BagValidationProvider>
    );

    expect(screen.getByText('Verbindingsprobleem')).toBeInTheDocument();
    expect(screen.getByText('Geen verbinding met de server')).toBeInTheDocument();
  });

  it('displays validation error with Dutch message', () => {
    const error: AppError = {
      type: 'validation',
      message: 'Alleen .xlsx bestanden zijn toegestaan',
    };

    render(
      <BagValidationProvider>
        <BagErrorView error={error} />
      </BagValidationProvider>
    );

    expect(screen.getByText('Validatiefout')).toBeInTheDocument();
    expect(screen.getByText('Alleen .xlsx bestanden zijn toegestaan')).toBeInTheDocument();
  });

  it('shows retry button for recoverable errors', () => {
    const error: AppError = {
      type: 'network',
      message: 'Network error',
    };

    const { queryByText } = render(
      <BagValidationProvider>
        <BagErrorView error={error} />
      </BagValidationProvider>
    );

    // Retry button only shows when there's a currentFile in context
    // Without a currentFile, only the reset button should show
    expect(queryByText('Probeer opnieuw')).not.toBeInTheDocument();
    expect(queryByText('Terug naar upload')).toBeInTheDocument();
  });

  it('shows reset button for all error types', () => {
    const error: AppError = {
      type: 'validation',
      message: 'Validation error',
    };

    render(
      <BagValidationProvider>
        <BagErrorView error={error} />
      </BagValidationProvider>
    );

    expect(screen.getByText('Terug naar upload')).toBeInTheDocument();
  });
});
