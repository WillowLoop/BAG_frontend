/**
 * BAG API Axios Client Configuration
 *
 * Configured axios instance specifically for BAG API integration.
 * Handles BAG-specific response format unwrapping and error transformation.
 *
 * Key Differences from ExcelFlow client:
 * - Response unwrapping: BAG wraps all responses in { success, data, metadata }
 * - Error transformation: BAG uses { error: { code, message, details, request_id } }
 * - Base URL: Uses VITE_BAG_API_BASE_URL environment variable
 */

import axios, { AxiosError, AxiosResponse } from 'axios';
import type { AppError } from './types';
import type { BagSuccessResponse, BagErrorResponse, BagApiError } from './types/bag.types';
import { isBagSuccessResponse, isBagErrorResponse } from './types/bag.types';
import { transformBagError } from './bag-error-mapping';
import { API_CONFIG } from '../lib/bagConstants';

/**
 * BAG API client instance
 * Configured with base URL from environment variables and BAG-specific interceptors
 */
export const bagClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor
 * Can be used for logging, authentication tokens, or request tracing
 */
bagClient.interceptors.request.use(
  (config) => {
    // Optional: Add request ID for tracing
    // config.headers['X-Request-ID'] = crypto.randomUUID();

    // Optional: Log requests in development
    if (import.meta.env.DEV) {
      console.log('[BAG API Request]', config.method?.toUpperCase(), config.url);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * Unwraps BAG API response format and transforms errors
 *
 * BAG API Response Format:
 * Success: { success: true, data: {...}, metadata: {...} }
 * Error: { error: { code, message, details, request_id } }
 *
 * This interceptor:
 * 1. Unwraps success responses (returns only the data property)
 * 2. Transforms BAG errors to AppError format
 * 3. Handles network errors
 */
bagClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Check if response has BAG success wrapper
    if (isBagSuccessResponse(response.data)) {
      // Unwrap the data property
      // Transform: { success: true, data: {...}, metadata: {...} } → {...}
      return {
        ...response,
        data: response.data.data,
      };
    }

    // If no wrapper (e.g., blob responses), pass through
    return response;
  },
  (error: AxiosError) => {
    // Transform error into AppError format
    const transformedError = transformBagApiError(error);

    // Log errors in development
    if (import.meta.env.DEV) {
      console.error('[BAG API Error]', transformedError);
    }

    return Promise.reject(transformedError);
  }
);

/**
 * Transform BAG API errors into user-friendly AppError objects
 *
 * Handles three types of errors:
 * 1. Network errors (no response received)
 * 2. BAG API structured errors (with error code)
 * 3. Generic HTTP errors (unexpected format)
 *
 * @param error - Axios error object
 * @returns AppError with appropriate type and message
 */
function transformBagApiError(error: AxiosError): AppError {
  // Case 1: Network errors (no response received)
  if (!error.response) {
    return transformNetworkError(error);
  }

  // Case 2: BAG API structured error response
  if (isBagErrorResponse(error.response.data)) {
    const bagError = (error.response.data as BagErrorResponse).error;
    return transformBagError(bagError);
  }

  // Case 3: Generic HTTP error (unexpected format)
  return transformHttpError(error);
}

/**
 * Transform network errors (no response received)
 *
 * @param error - Axios error object
 * @returns AppError with network type
 */
function transformNetworkError(error: AxiosError): AppError {
  // Timeout error
  if (error.code === 'ECONNABORTED') {
    return {
      type: 'network',
      message: 'Verzoek duurde te lang. Probeer opnieuw.',
      details: error.message,
    };
  }

  // Network connection error
  if (error.code === 'ERR_NETWORK') {
    return {
      type: 'network',
      message: 'Geen verbinding met de server. Controleer je internetverbinding.',
      details: error.message,
    };
  }

  // Generic network error
  return {
    type: 'network',
    message: 'Kan geen verbinding maken met de server. Probeer opnieuw.',
    details: error.message,
  };
}

/**
 * Transform generic HTTP errors (unexpected format)
 *
 * @param error - Axios error object with response
 * @returns AppError based on status code
 */
function transformHttpError(error: AxiosError): AppError {
  const status = error.response!.status;
  const responseData = error.response!.data as { message?: string; error?: string };

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

/**
 * Export the configured client as default
 */
export default bagClient;
