/**
 * App Integration Tests
 *
 * Tests complete user workflow and state transitions for BAG validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '../App';

// Create a new QueryClient for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

// Mock Sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
  Toaster: () => null,
}));

// Mock hooks with default implementations
vi.mock('@/hooks/useBagFileUpload', () => ({
  useBagFileUpload: () => ({
    uploadFile: vi.fn(),
    uploadProgress: 0,
    isUploading: false,
  }),
}));

vi.mock('@/hooks/useBagValidationStatus', () => ({
  useBagValidationStatus: () => ({
    status: null,
    error: null,
  }),
}));

vi.mock('@/hooks/useBagFileDownload', () => ({
  useBagFileDownload: () => ({
    downloadFile: vi.fn(),
    isDownloading: false,
  }),
}));

describe('App Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the app header with title', () => {
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );

    expect(screen.getByText('BAG Adres Validatie')).toBeInTheDocument();
    expect(screen.getByText(/Valideer Nederlandse adressen/i)).toBeInTheDocument();
  });

  it('shows upload section in idle state', () => {
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );

    expect(screen.getByText(/Upload je Excel bestand met adressen/i)).toBeInTheDocument();
    expect(screen.getByText('Kies bestand')).toBeInTheDocument();
  });

  it('has proper document title', () => {
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );

    // The title is set in index.html
    expect(document.title).toBe('BAG Adres Validatie');
  });

  it('provides QueryClient to the application', () => {
    const queryClient = createTestQueryClient();

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );

    // If QueryClient is properly configured, the app should render without errors
    expect(container.querySelector('#root')).toBeTruthy();
  });
});

describe('App State Transitions', () => {
  it('application starts in idle state', () => {
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );

    // Upload section is visible in idle state
    expect(screen.getByText(/Upload je Excel bestand/i)).toBeInTheDocument();
  });
});

describe('App Error Handling', () => {
  it('renders without crashing', () => {
    const queryClient = createTestQueryClient();

    expect(() => {
      render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );
    }).not.toThrow();
  });
});
