/**
 * Unit tests for error transformation utilities
 */

import { describe, it, expect } from 'vitest';
import { AxiosError } from 'axios';
import { transformError, createValidationError, createNetworkError, createApiError } from '../errors';

describe('transformError', () => {
  describe('Axios network errors', () => {
    it('should transform ERR_NETWORK to network error', () => {
      const axiosError = {
        isAxiosError: true,
        message: 'Network Error',
        code: 'ERR_NETWORK',
        config: {},
        toJSON: () => ({}),
      } as AxiosError;

      const result = transformError(axiosError);

      expect(result.type).toBe('network');
      expect(result.message).toContain('Geen verbinding');
      expect(result.message).toContain('internetverbinding');
      expect(result.details).toBe('Network Error');
    });

    it('should transform ECONNABORTED to timeout error', () => {
      const axiosError = {
        isAxiosError: true,
        message: 'timeout of 30000ms exceeded',
        code: 'ECONNABORTED',
        config: {},
        toJSON: () => ({}),
      } as AxiosError;

      const result = transformError(axiosError);

      expect(result.type).toBe('network');
      expect(result.message).toContain('te lang');
      expect(result.message).toContain('internetverbinding');
    });

    it('should handle generic network errors without response', () => {
      const axiosError = {
        isAxiosError: true,
        message: 'Network request failed',
        config: {},
        toJSON: () => ({}),
      } as AxiosError;

      const result = transformError(axiosError);

      expect(result.type).toBe('network');
      expect(result.message).toContain('verbinding');
      expect(result.details).toBe('Network request failed');
    });
  });

  describe('4xx client errors', () => {
    it('should transform 400 Bad Request', () => {
      const axiosError = {
        isAxiosError: true,
        message: 'Request failed with status code 400',
        response: {
          status: 400,
          data: { message: 'Invalid file format' },
        },
        config: {},
        toJSON: () => ({}),
      } as AxiosError;

      const result = transformError(axiosError);

      expect(result.type).toBe('validation');
      expect(result.statusCode).toBe(400);
      expect(result.message).toBe('Invalid file format');
    });

    it('should transform 401 Unauthorized', () => {
      const axiosError = {
        isAxiosError: true,
        message: 'Request failed with status code 401',
        response: {
          status: 401,
          data: {},
        },
        config: {},
        toJSON: () => ({}),
      } as AxiosError;

      const result = transformError(axiosError);

      expect(result.type).toBe('api');
      expect(result.statusCode).toBe(401);
      expect(result.message).toContain('Autorisatie');
    });

    it('should transform 404 Not Found', () => {
      const axiosError = {
        isAxiosError: true,
        message: 'Request failed with status code 404',
        response: {
          status: 404,
          data: {},
        },
        config: {},
        toJSON: () => ({}),
      } as AxiosError;

      const result = transformError(axiosError);

      expect(result.type).toBe('api');
      expect(result.statusCode).toBe(404);
      expect(result.message).toContain('niet worden gevonden');
    });

    it('should transform 413 Payload Too Large', () => {
      const axiosError = {
        isAxiosError: true,
        message: 'Request failed with status code 413',
        response: {
          status: 413,
          data: {},
        },
        config: {},
        toJSON: () => ({}),
      } as AxiosError;

      const result = transformError(axiosError);

      expect(result.type).toBe('validation');
      expect(result.statusCode).toBe(413);
      expect(result.message).toContain('te groot');
      expect(result.message).toContain('10 MB');
    });

    it('should transform 429 Too Many Requests', () => {
      const axiosError = {
        isAxiosError: true,
        message: 'Request failed with status code 429',
        response: {
          status: 429,
          data: {},
        },
        config: {},
        toJSON: () => ({}),
      } as AxiosError;

      const result = transformError(axiosError);

      expect(result.type).toBe('api');
      expect(result.statusCode).toBe(429);
      expect(result.message).toContain('Te veel verzoeken');
    });
  });

  describe('5xx server errors', () => {
    it('should transform 500 Internal Server Error', () => {
      const axiosError = {
        isAxiosError: true,
        message: 'Request failed with status code 500',
        response: {
          status: 500,
          data: {},
        },
        config: {},
        toJSON: () => ({}),
      } as AxiosError;

      const result = transformError(axiosError);

      expect(result.type).toBe('api');
      expect(result.statusCode).toBe(500);
      expect(result.message).toContain('Server fout');
    });

    it('should transform 503 Service Unavailable', () => {
      const axiosError = {
        isAxiosError: true,
        message: 'Request failed with status code 503',
        response: {
          status: 503,
          data: {},
        },
        config: {},
        toJSON: () => ({}),
      } as AxiosError;

      const result = transformError(axiosError);

      expect(result.type).toBe('api');
      expect(result.statusCode).toBe(503);
      expect(result.message).toContain('niet beschikbaar');
    });
  });

  describe('API error message extraction', () => {
    it('should extract message from response data', () => {
      const axiosError = {
        isAxiosError: true,
        message: 'Request failed',
        response: {
          status: 400,
          data: { message: 'Custom error message' },
        },
        config: {},
        toJSON: () => ({}),
      } as AxiosError;

      const result = transformError(axiosError);
      expect(result.message).toBe('Custom error message');
    });

    it('should extract error from response data', () => {
      const axiosError = {
        isAxiosError: true,
        message: 'Request failed',
        response: {
          status: 400,
          data: { error: 'Validation failed' },
        },
        config: {},
        toJSON: () => ({}),
      } as AxiosError;

      const result = transformError(axiosError);
      expect(result.message).toBe('Validation failed');
    });

    it('should extract detail from response data', () => {
      const axiosError = {
        isAxiosError: true,
        message: 'Request failed',
        response: {
          status: 400,
          data: { detail: 'Detailed error information' },
        },
        config: {},
        toJSON: () => ({}),
      } as AxiosError;

      const result = transformError(axiosError);
      expect(result.message).toBe('Detailed error information');
    });

    it('should use fallback message when no API message available', () => {
      const axiosError = {
        isAxiosError: true,
        message: 'Request failed',
        response: {
          status: 400,
          data: {},
        },
        config: {},
        toJSON: () => ({}),
      } as AxiosError;

      const result = transformError(axiosError);
      expect(result.message).toContain('Ongeldige aanvraag');
    });
  });

  describe('non-Axios errors', () => {
    it('should transform standard Error objects', () => {
      const error = new Error('Something went wrong');
      const result = transformError(error);

      expect(result.type).toBe('unknown');
      expect(result.message).toContain('onverwachte fout');
      expect(result.details).toBe('Something went wrong');
    });

    it('should handle unknown error types', () => {
      const error = 'String error';
      const result = transformError(error);

      expect(result.type).toBe('unknown');
      expect(result.message).toContain('iets misgegaan');
      expect(result.details).toBe('String error');
    });

    it('should handle null/undefined errors', () => {
      const result1 = transformError(null);
      const result2 = transformError(undefined);

      expect(result1.type).toBe('unknown');
      expect(result2.type).toBe('unknown');
    });
  });
});

describe('createValidationError', () => {
  it('should create a validation error with message', () => {
    const error = createValidationError('Invalid input');

    expect(error.type).toBe('validation');
    expect(error.message).toBe('Invalid input');
    expect(error.details).toBeUndefined();
  });

  it('should create a validation error with details', () => {
    const error = createValidationError('Invalid input', 'Field "email" is required');

    expect(error.type).toBe('validation');
    expect(error.message).toBe('Invalid input');
    expect(error.details).toBe('Field "email" is required');
  });
});

describe('createNetworkError', () => {
  it('should create a network error with message', () => {
    const error = createNetworkError('Connection failed');

    expect(error.type).toBe('network');
    expect(error.message).toBe('Connection failed');
    expect(error.details).toBeUndefined();
  });

  it('should create a network error with details', () => {
    const error = createNetworkError('Connection failed', 'DNS lookup failed');

    expect(error.type).toBe('network');
    expect(error.message).toBe('Connection failed');
    expect(error.details).toBe('DNS lookup failed');
  });
});

describe('createApiError', () => {
  it('should create an API error with message', () => {
    const error = createApiError('Server error');

    expect(error.type).toBe('api');
    expect(error.message).toBe('Server error');
    expect(error.statusCode).toBeUndefined();
    expect(error.details).toBeUndefined();
  });

  it('should create an API error with status code', () => {
    const error = createApiError('Not found', 404);

    expect(error.type).toBe('api');
    expect(error.message).toBe('Not found');
    expect(error.statusCode).toBe(404);
  });

  it('should create an API error with all parameters', () => {
    const error = createApiError('Server error', 500, 'Internal server exception');

    expect(error.type).toBe('api');
    expect(error.message).toBe('Server error');
    expect(error.statusCode).toBe(500);
    expect(error.details).toBe('Internal server exception');
  });
});
