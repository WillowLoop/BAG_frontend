/**
 * Error Transformation Utilities
 *
 * Transforms various error types (Axios errors, network errors, API errors)
 * into user-friendly AppError objects with Dutch messages.
 */

import type { AxiosError } from 'axios';
import type { AppError } from '@/api/types';

/**
 * Transform any error into a user-friendly AppError
 *
 * Handles:
 * - Network errors (no connection, DNS failure)
 * - Timeout errors
 * - HTTP 4xx errors (client errors)
 * - HTTP 5xx errors (server errors)
 * - Unknown errors
 *
 * @param error - The error to transform (typically from Axios or fetch)
 * @returns AppError with user-friendly Dutch message
 */
export function transformError(error: unknown): AppError {
  // Check if it's an Axios error
  if (isAxiosError(error)) {
    // Network error (no response received)
    if (!error.response) {
      // Check for specific error codes
      if (error.code === 'ERR_NETWORK') {
        return {
          type: 'network',
          message: 'Geen verbinding met de server. Controleer je internetverbinding en probeer opnieuw.',
          details: error.message,
        };
      }

      // Timeout error
      if (error.code === 'ECONNABORTED') {
        return {
          type: 'network',
          message: 'Verzoek duurde te lang. Controleer je internetverbinding en probeer opnieuw.',
          details: error.message,
        };
      }

      // Generic network error
      return {
        type: 'network',
        message: 'Kan geen verbinding maken met de server. Probeer het later opnieuw.',
        details: error.message,
      };
    }

    // HTTP 4xx errors (client errors)
    if (error.response.status >= 400 && error.response.status < 500) {
      const apiMessage = getApiErrorMessage(error.response.data);

      // Specific 4xx status codes
      switch (error.response.status) {
        case 400:
          return {
            type: 'validation',
            message: apiMessage || 'Ongeldige aanvraag. Controleer je invoer en probeer opnieuw.',
            details: error.message,
            statusCode: 400,
          };

        case 401:
          return {
            type: 'api',
            message: 'Autorisatie verlopen. Vernieuw de pagina en probeer opnieuw.',
            details: error.message,
            statusCode: 401,
          };

        case 404:
          return {
            type: 'api',
            message: 'Het gevraagde bestand kon niet worden gevonden. De verwerking is mogelijk verlopen.',
            details: error.message,
            statusCode: 404,
          };

        case 413:
          return {
            type: 'validation',
            message: 'Bestand is te groot. Het maximum is 10 MB.',
            details: error.message,
            statusCode: 413,
          };

        case 429:
          return {
            type: 'api',
            message: 'Te veel verzoeken. Wacht even en probeer opnieuw.',
            details: error.message,
            statusCode: 429,
          };

        default:
          return {
            type: 'validation',
            message: apiMessage || 'Er is een probleem met je aanvraag. Controleer je invoer.',
            details: error.message,
            statusCode: error.response.status,
          };
      }
    }

    // HTTP 5xx errors (server errors)
    if (error.response.status >= 500) {
      // Specific 5xx status codes
      switch (error.response.status) {
        case 503:
          return {
            type: 'api',
            message: 'De service is tijdelijk niet beschikbaar. Probeer het over enkele minuten opnieuw.',
            details: error.message,
            statusCode: 503,
          };

        default:
          return {
            type: 'api',
            message: 'Server fout. Ons team is op de hoogte. Probeer het later opnieuw.',
            details: error.message,
            statusCode: error.response.status,
          };
      }
    }
  }

  // Check if it's a standard Error object
  if (error instanceof Error) {
    return {
      type: 'unknown',
      message: 'Er is een onverwachte fout opgetreden. Probeer de pagina te vernieuwen.',
      details: error.message,
    };
  }

  // Unknown error type
  return {
    type: 'unknown',
    message: 'Er is iets misgegaan. Probeer het opnieuw of neem contact op met support.',
    details: String(error),
  };
}

/**
 * Type guard to check if error is an AxiosError
 */
function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    error.isAxiosError === true
  );
}

/**
 * Extract error message from API response
 * Tries to find a user-friendly message in the response data
 */
function getApiErrorMessage(data: unknown): string | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  // Check common error message fields
  const errorData = data as Record<string, unknown>;

  if (typeof errorData.message === 'string' && errorData.message) {
    return errorData.message;
  }

  if (typeof errorData.error === 'string' && errorData.error) {
    return errorData.error;
  }

  if (typeof errorData.detail === 'string' && errorData.detail) {
    return errorData.detail;
  }

  return null;
}

/**
 * Create a validation error for file-related issues
 *
 * @param message - User-friendly error message in Dutch
 * @param details - Optional technical details
 */
export function createValidationError(message: string, details?: string): AppError {
  return {
    type: 'validation',
    message,
    details,
  };
}

/**
 * Create a network error
 *
 * @param message - User-friendly error message in Dutch
 * @param details - Optional technical details
 */
export function createNetworkError(message: string, details?: string): AppError {
  return {
    type: 'network',
    message,
    details,
  };
}

/**
 * Create an API error
 *
 * @param message - User-friendly error message in Dutch
 * @param statusCode - HTTP status code
 * @param details - Optional technical details
 */
export function createApiError(message: string, statusCode?: number, details?: string): AppError {
  return {
    type: 'api',
    message,
    statusCode,
    details,
  };
}
