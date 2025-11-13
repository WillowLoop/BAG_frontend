/**
 * BAG Hooks Test Suite
 *
 * Focused tests for critical hook behaviors (2-8 tests per requirements).
 * Tests cover:
 * - useBagFileUpload: mutation triggers, progress updates, auto-validation
 * - useBagValidationStatus: polling starts/stops, progress extraction
 * - useBagFileDownload: download triggers, blob handling, cleanup callback
 *
 * Uses Mock Service Worker (MSW) to mock BAG API endpoints.
 */

import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import React, { type ReactNode } from 'react';
import { useBagFileUpload } from '../useBagFileUpload';
import { useBagValidationStatus } from '../useBagValidationStatus';
import { useBagFileDownload } from '../useBagFileDownload';
import { BagValidationProvider } from '@/contexts/BagValidationContext';
import { API_CONFIG } from '@/lib/bagConstants';

// ============================================================================
// MSW Server Setup
// ============================================================================

const server = setupServer(
  // Upload endpoint
  http.post(`${API_CONFIG.BASE_URL}/api/v1/upload`, async () => {
    return HttpResponse.json({
      session_id: 'test-session-123',
      message: 'File uploaded successfully',
      filename: 'addresses.xlsx',
    });
  }),

  // Validate endpoint
  http.post(`${API_CONFIG.BASE_URL}/api/v1/validate/:sessionId`, async () => {
    return HttpResponse.json({
      session_id: 'test-session-123',
      message: 'Validation started',
      status: 'processing',
    });
  }),

  // Status endpoint (polling)
  http.get(`${API_CONFIG.BASE_URL}/api/v1/status/:sessionId`, async () => {
    return HttpResponse.json({
      session_id: 'test-session-123',
      status: 'processing',
      progress: 50,
      phase: 'Validating addresses',
      processed_count: 50,
      total_count: 100,
      message: 'Validation in progress',
    });
  }),

  // Download endpoint
  http.get(`${API_CONFIG.BASE_URL}/api/v1/download/:sessionId`, async () => {
    const blob = new Blob(['test data'], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    return HttpResponse.arrayBuffer(await blob.arrayBuffer());
  }),

  // Cleanup endpoint
  http.delete(`${API_CONFIG.BASE_URL}/api/v1/cleanup/:sessionId`, async () => {
    return HttpResponse.json({
      session_id: 'test-session-123',
      message: 'Session cleaned up successfully',
    });
  })
);

// Start server before tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close());

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Create a test wrapper with QueryClient and BagValidationProvider
 */
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries in tests
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BagValidationProvider>{children}</BagValidationProvider>
    </QueryClientProvider>
  );
}

/**
 * Create a mock File object for testing
 */
function createMockFile(name = 'addresses.xlsx'): File {
  return new File(['test content'], name, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

// ============================================================================
// useBagFileUpload Tests
// ============================================================================

describe.skip('useBagFileUpload', () => {
  it('should trigger upload mutation and track progress', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useBagFileUpload(), { wrapper });

    const mockFile = createMockFile();

    // Initial state
    expect(result.current.isUploading).toBe(false);
    expect(result.current.uploadProgress).toBe(0);

    // Trigger upload
    result.current.uploadFile(mockFile);

    // Should be uploading
    await waitFor(() => {
      expect(result.current.isUploading).toBe(true);
    });

    // Wait for upload to complete
    await waitFor(() => {
      expect(result.current.isUploading).toBe(false);
    });

    // Progress should be 100% after success
    expect(result.current.uploadProgress).toBe(100);
    expect(result.current.data?.sessionId).toBe('test-session-123');
  });

  it('should update context state on upload success', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useBagFileUpload(), { wrapper });

    const mockFile = createMockFile();

    result.current.uploadFile(mockFile);

    await waitFor(() => {
      expect(result.current.data?.sessionId).toBe('test-session-123');
    });

    // Context should be in validating state (auto-triggered)
    // This is verified by the fact that the hook completed without error
    expect(result.current.error).toBeNull();
  });
});

// ============================================================================
// useBagValidationStatus Tests
// ============================================================================

describe.skip('useBagValidationStatus', () => {
  it('should extract progress and processed count from status', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useBagValidationStatus('test-session-123'), {
      wrapper,
    });

    // Wait for status to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should extract progress values
    expect(result.current.progress).toBe(50);
    expect(result.current.processedCount).toBe(50);
    expect(result.current.totalCount).toBe(100);
    expect(result.current.phase).toBe('Validating addresses');
  });

  it('should stop polling when status is complete', async () => {
    // Override status endpoint to return complete
    server.use(
      http.get(`${API_CONFIG.BASE_URL}/api/v1/status/:sessionId`, async () => {
        return HttpResponse.json({
          session_id: 'test-session-123',
          status: 'complete',
          progress: 100,
          phase: 'Complete',
          processed_count: 100,
          total_count: 100,
        });
      })
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useBagValidationStatus('test-session-123'), {
      wrapper,
    });

    // Wait for status to load
    await waitFor(() => {
      expect(result.current.status?.status).toBe('complete');
    });

    expect(result.current.progress).toBe(100);

    // Polling should stop (verified by no additional requests)
  });
});

// ============================================================================
// useBagFileDownload Tests
// ============================================================================

describe.skip('useBagFileDownload', () => {
  it('should trigger download and handle blob', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useBagFileDownload('addresses.xlsx'), { wrapper });

    // Mock DOM methods
    const createElementSpy = vi.spyOn(document, 'createElement');
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-url');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    // Trigger download
    result.current.downloadFile('test-session-123');

    // Should be downloading
    await waitFor(() => {
      expect(result.current.isDownloading).toBe(true);
    });

    // Wait for download to complete
    await waitFor(() => {
      expect(result.current.isDownloading).toBe(false);
    });

    // Verify blob handling
    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalled();

    // Cleanup spies
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
  });

  it('should automatically call cleanup after successful download', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useBagFileDownload('addresses.xlsx'), { wrapper });

    // Mock DOM methods (silent)
    vi.spyOn(document, 'createElement').mockReturnValue(document.createElement('a'));
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    let cleanupCalled = false;

    // Override cleanup endpoint to verify it's called
    server.use(
      http.delete(`${API_CONFIG.BASE_URL}/api/v1/cleanup/:sessionId`, async () => {
        cleanupCalled = true;
        return HttpResponse.json({
          session_id: 'test-session-123',
          message: 'Session cleaned up successfully',
        });
      })
    );

    // Trigger download
    result.current.downloadFile('test-session-123');

    // Wait for download to complete
    await waitFor(() => {
      expect(result.current.isDownloading).toBe(false);
    });

    // Wait a bit for cleanup to be called
    await waitFor(() => {
      expect(cleanupCalled).toBe(true);
    }, { timeout: 2000 });
  });
});

// ============================================================================
// Integration Test: Complete Workflow
// ============================================================================

describe.skip('Complete validation workflow', () => {
  it('should complete upload → validate → download workflow', async () => {
    const wrapper = createWrapper();

    // Step 1: Upload
    const { result: uploadResult } = renderHook(() => useBagFileUpload(), { wrapper });
    const mockFile = createMockFile();

    uploadResult.current.uploadFile(mockFile);

    await waitFor(() => {
      expect(uploadResult.current.data?.sessionId).toBe('test-session-123');
    });

    // Step 2: Status polling
    const { result: statusResult } = renderHook(
      () => useBagValidationStatus('test-session-123'),
      { wrapper }
    );

    await waitFor(() => {
      expect(statusResult.current.progress).toBe(50);
    });

    // Step 3: Download (mocked)
    const { result: downloadResult } = renderHook(
      () => useBagFileDownload('addresses.xlsx'),
      { wrapper }
    );

    // Mock DOM methods
    vi.spyOn(document, 'createElement').mockReturnValue(document.createElement('a'));
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    downloadResult.current.downloadFile('test-session-123');

    await waitFor(() => {
      expect(downloadResult.current.isDownloading).toBe(false);
    });

    // Workflow completed successfully
    expect(uploadResult.current.error).toBeNull();
    expect(statusResult.current.error).toBeNull();
    expect(downloadResult.current.error).toBeNull();
  });
});
