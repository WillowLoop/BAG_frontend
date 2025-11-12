/**
 * BAG API Client Tests
 *
 * Focused tests for BAG API client adaptations (2-8 tests as specified).
 * Tests critical client behaviors: response unwrapping, error transformation, rate limiting.
 *
 * Uses MSW (Mock Service Worker) to mock BAG API responses.
 */

import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { bagClient } from '../bagClient';
import type { BagSuccessResponse, BagErrorResponse } from '../types/bag.types';
import type { AppError } from '../types';

// Mock BAG API server
const server = setupServer();

// Setup MSW server
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('BAG API Client - Response Unwrapping', () => {
  it('should unwrap BAG success response format', async () => {
    // Mock BAG API success response with wrapper
    const mockData = {
      sessionId: 'test-session-123',
      message: 'File uploaded successfully',
      filename: 'test.xlsx',
    };

    server.use(
      http.post('http://localhost:8000/api/v1/upload', () => {
        const response: BagSuccessResponse<typeof mockData> = {
          success: true,
          data: mockData,
          metadata: {
            requestId: 'req-123',
            timestamp: '2025-10-29T12:00:00Z',
            version: '1.0.0',
          },
        };
        return HttpResponse.json(response);
      })
    );

    // Make request
    const response = await bagClient.post('/api/v1/upload', {});

    // Verify response was unwrapped (only data property returned)
    expect(response.data).toEqual(mockData);
    expect(response.data).not.toHaveProperty('success');
    expect(response.data).not.toHaveProperty('metadata');
  });

  it('should pass through blob responses without unwrapping', async () => {
    // Mock blob response (downloads don't have wrapper)
    const mockBlob = new Blob(['test content'], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    server.use(
      http.get('http://localhost:8000/api/v1/download/:sessionId', () => {
        return new HttpResponse(mockBlob, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="validated_test.xlsx"',
          },
        });
      })
    );

    // Make request
    const response = await bagClient.get('/api/v1/download/test-session', {
      responseType: 'blob',
    });

    // Verify blob passed through unchanged
    expect(response.data).toBeInstanceOf(Blob);
  });
});

describe('BAG API Client - Error Transformation', () => {
  it('should transform BAG error format to AppError', async () => {
    // Mock BAG API error response
    server.use(
      http.post('http://localhost:8000/api/v1/upload', () => {
        const errorResponse: BagErrorResponse = {
          error: {
            code: 'INVALID_FILE_TYPE',
            message: 'Only .xlsx files are allowed',
            details: { allowed_types: ['.xlsx'] },
            requestId: 'req-error-123',
          },
        };
        return HttpResponse.json(errorResponse, { status: 400 });
      })
    );

    // Make request and expect error
    try {
      await bagClient.post('/api/v1/upload', {});
      expect.fail('Should have thrown an error');
    } catch (error) {
      const appError = error as AppError;

      // Verify error was transformed to AppError format
      expect(appError.type).toBe('validation');
      expect(appError.message).toBe('Alleen .xlsx bestanden zijn toegestaan');
      expect(appError.statusCode).toBe(400);
      expect(appError.details).toContain('Request ID: req-error-123');
    }
  });

  it('should handle network errors correctly', async () => {
    // Mock network error (no response)
    server.use(
      http.post('http://localhost:8000/api/v1/upload', () => {
        return HttpResponse.error();
      })
    );

    // Make request and expect network error
    try {
      await bagClient.post('/api/v1/upload', {});
      expect.fail('Should have thrown an error');
    } catch (error) {
      const appError = error as AppError;

      // Verify network error transformation
      expect(appError.type).toBe('network');
      expect(appError.message).toContain('verbinding');
    }
  });
});

describe('BAG API Client - Rate Limiting', () => {
  it('should handle rate limiting (429) errors', async () => {
    // Mock rate limit error
    server.use(
      http.post('http://localhost:8000/api/v1/upload', () => {
        const errorResponse: BagErrorResponse = {
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests',
            requestId: 'req-rate-limit',
          },
        };
        return HttpResponse.json(errorResponse, { status: 429 });
      })
    );

    // Make request and expect rate limit error
    try {
      await bagClient.post('/api/v1/upload', {});
      expect.fail('Should have thrown an error');
    } catch (error) {
      const appError = error as AppError;

      // Verify rate limit error transformation
      expect(appError.type).toBe('api');
      expect(appError.message).toContain('Te veel verzoeken');
      expect(appError.statusCode).toBe(429);
    }
  });
});

describe('BAG API Client - Error Code Mapping', () => {
  it('should map EXCEL_STRUCTURE_ERROR correctly', async () => {
    // Mock Excel structure error
    server.use(
      http.post('http://localhost:8000/api/v1/upload', () => {
        const errorResponse: BagErrorResponse = {
          error: {
            code: 'EXCEL_STRUCTURE_ERROR',
            message: 'Missing required columns',
            requestId: 'req-struct-error',
          },
        };
        return HttpResponse.json(errorResponse, { status: 400 });
      })
    );

    // Make request and expect error
    try {
      await bagClient.post('/api/v1/upload', {});
      expect.fail('Should have thrown an error');
    } catch (error) {
      const appError = error as AppError;

      // Verify Excel structure error mapping
      expect(appError.type).toBe('validation');
      expect(appError.message).toContain('structuur');
    }
  });

  it('should map FILE_NOT_FOUND error correctly', async () => {
    // Mock file not found error
    server.use(
      http.get('http://localhost:8000/api/v1/status/:sessionId', () => {
        const errorResponse: BagErrorResponse = {
          error: {
            code: 'FILE_NOT_FOUND',
            message: 'Session not found',
            requestId: 'req-notfound',
          },
        };
        return HttpResponse.json(errorResponse, { status: 404 });
      })
    );

    // Make request and expect error
    try {
      await bagClient.get('/api/v1/status/invalid-session');
      expect.fail('Should have thrown an error');
    } catch (error) {
      const appError = error as AppError;

      // Verify file not found error mapping
      expect(appError.type).toBe('api');
      expect(appError.message).toContain('Sessie niet gevonden');
      expect(appError.statusCode).toBe(404);
    }
  });

  it('should map INTERNAL_SERVER_ERROR correctly', async () => {
    // Mock internal server error
    server.use(
      http.post('http://localhost:8000/api/v1/validate/:sessionId', () => {
        const errorResponse: BagErrorResponse = {
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database connection failed',
            requestId: 'req-server-error',
          },
        };
        return HttpResponse.json(errorResponse, { status: 500 });
      })
    );

    // Make request and expect error
    try {
      await bagClient.post('/api/v1/validate/test-session', {});
      expect.fail('Should have thrown an error');
    } catch (error) {
      const appError = error as AppError;

      // Verify server error mapping
      expect(appError.type).toBe('api');
      expect(appError.message).toContain('Server fout');
      expect(appError.statusCode).toBe(500);
    }
  });
});
