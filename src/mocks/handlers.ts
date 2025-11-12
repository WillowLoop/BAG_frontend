/**
 * MSW (Mock Service Worker) Handlers
 *
 * Mock BAG API endpoints for integration testing
 */

import { http, HttpResponse, delay } from 'msw';

const BAG_API_BASE_URL = 'http://localhost:8000';

export const handlers = [
  // Upload endpoint
  http.post(`${BAG_API_BASE_URL}/api/v1/upload`, async () => {
    await delay(100);
    return HttpResponse.json({
      success: true,
      data: {
        session_id: 'test-session-123',
        message: 'File uploaded successfully',
        filename: 'test-addresses.xlsx',
      },
      metadata: {
        request_id: 'req-upload-123',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  }),

  // Validate endpoint
  http.post(`${BAG_API_BASE_URL}/api/v1/validate/:sessionId`, async () => {
    await delay(100);
    return HttpResponse.json({
      success: true,
      data: {
        session_id: 'test-session-123',
        message: 'Validation started',
        status: 'processing',
      },
      metadata: {
        request_id: 'req-validate-123',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  }),

  // Status endpoint (polling)
  http.get(`${BAG_API_BASE_URL}/api/v1/status/:sessionId`, async () => {
    await delay(50);
    return HttpResponse.json({
      success: true,
      data: {
        session_id: 'test-session-123',
        status: 'complete',
        progress: 100,
        phase: 'Voltooid',
        processed_count: 100,
        total_count: 100,
      },
      metadata: {
        request_id: 'req-status-123',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  }),

  // Download endpoint
  http.get(`${BAG_API_BASE_URL}/api/v1/download/:sessionId`, async () => {
    await delay(100);
    const blob = new Blob(['mock excel content'], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    return HttpResponse.arrayBuffer(await blob.arrayBuffer(), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="validated_test.xlsx"',
      },
    });
  }),

  // Cleanup endpoint
  http.delete(`${BAG_API_BASE_URL}/api/v1/cleanup/:sessionId`, async () => {
    await delay(50);
    return HttpResponse.json({
      success: true,
      data: {
        session_id: 'test-session-123',
        message: 'Session cleaned up successfully',
      },
      metadata: {
        request_id: 'req-cleanup-123',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  }),
];

// Error handlers for testing error scenarios
export const errorHandlers = {
  networkError: http.post(`${BAG_API_BASE_URL}/api/v1/upload`, () => {
    return HttpResponse.error();
  }),

  rateLimitError: http.post(`${BAG_API_BASE_URL}/api/v1/upload`, () => {
    return HttpResponse.json(
      {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests',
          request_id: 'req-error-123',
        },
      },
      { status: 429 }
    );
  }),

  validationError: http.post(`${BAG_API_BASE_URL}/api/v1/upload`, () => {
    return HttpResponse.json(
      {
        error: {
          code: 'INVALID_FILE_TYPE',
          message: 'Invalid file type',
          request_id: 'req-error-123',
        },
      },
      { status: 400 }
    );
  }),

  serverError: http.post(`${BAG_API_BASE_URL}/api/v1/upload`, () => {
    return HttpResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Internal server error',
          request_id: 'req-error-123',
        },
      },
      { status: 500 }
    );
  }),
};
