/**
 * Axios HTTP Client Configuration
 *
 * Configured axios instance with interceptors for centralized error handling.
 */

import axios, { AxiosError } from 'axios';
import type { AppError } from './types';

/**
 * Base API client instance
 * Configured with base URL from environment variables and default timeout
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor
 * Can be used for logging, authentication tokens, or request tracing
 */
apiClient.interceptors.request.use(
  (config) => {
    // Add request ID for tracing (optional)
    // config.headers['X-Request-ID'] = crypto.randomUUID();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * Provides centralized error transformation
 */
apiClient.interceptors.response.use(
  (response) => {
    // Pass through successful responses
    return response;
  },
  (error: AxiosError) => {
    // Transform error into AppError format
    const transformedError = transformError(error);
    return Promise.reject(transformedError);
  }
);

/**
 * Transform axios errors into user-friendly AppError objects
 * @param error - Axios error object
 * @returns AppError with appropriate type and message
 */
export function transformError(error: AxiosError): AppError {
  // Network errors (no response received)
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return {
        type: 'network',
        message: 'Verzoek duurde te lang. Probeer opnieuw.',
        details: error.message,
      };
    }
    if (error.code === 'ERR_NETWORK') {
      return {
        type: 'network',
        message: 'Geen verbinding met de server. Controleer je internetverbinding.',
        details: error.message,
      };
    }
    return {
      type: 'network',
      message: 'Kan geen verbinding maken met de server. Probeer opnieuw.',
      details: error.message,
    };
  }

  // Extract error data from response
  const status = error.response.status;
  const responseData = error.response.data as { message?: string; error?: string };

  // Client errors (4xx)
  if (status >= 400 && status < 500) {
    return {
      type: 'validation',
      message: responseData.message || 'Ongeldige aanvraag',
      details: responseData.error,
      statusCode: status,
    };
  }

  // Server errors (5xx)
  if (status >= 500) {
    return {
      type: 'api',
      message: 'Server fout. Ons team is op de hoogte. Probeer later opnieuw.',
      details: responseData.error,
      statusCode: status,
    };
  }

  // Unknown error
  return {
    type: 'unknown',
    message: 'Er is een onbekende fout opgetreden. Probeer opnieuw.',
    details: error.message,
    statusCode: status,
  };
}
