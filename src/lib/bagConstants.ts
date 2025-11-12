/**
 * BAG Address Validation Constants
 *
 * All BAG-specific configuration constants in one place.
 * These values control file validation, polling behavior, and API configuration.
 */

import type { ValidationConfig } from '../api/types/bag.types';

/**
 * File Upload Configuration
 */
export const FILE_CONFIG = {
  /** Maximum file size: 10MB in bytes */
  MAX_FILE_SIZE: 10 * 1024 * 1024,

  /** Allowed file types (only .xlsx for BAG validation) */
  ALLOWED_FILE_TYPES: ['.xlsx'] as const,

  /** File type MIME types */
  ALLOWED_MIME_TYPES: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ] as const,
} as const;

/**
 * Polling Configuration
 * Controls how often and how long we poll the BAG API for status updates
 */
export const POLLING_CONFIG = {
  /** Polling interval: 2500ms (2.5 seconds) */
  INTERVAL: 2500,

  /** Maximum polling duration: 5 minutes (300000ms) */
  MAX_DURATION: 5 * 60 * 1000,

  /** Number of retry attempts on network errors */
  RETRY_COUNT: 3,

  /** Enable refetch on window focus */
  REFETCH_ON_FOCUS: false,

  /** Stale time for status queries: 0 (always fresh) */
  STALE_TIME: 0,
} as const;

/**
 * API Configuration
 */
export const API_CONFIG = {
  /** Request timeout: 30 seconds (30000ms) */
  TIMEOUT: 30000,

  /** Base URL from environment variable */
  BASE_URL: import.meta.env.VITE_BAG_API_BASE_URL || 'http://localhost:8000',
} as const;

/**
 * Default Validation Configuration
 * These settings are sent with every upload unless overridden
 */
export const DEFAULT_VALIDATION_CONFIG: ValidationConfig = {
  strict_mode: false,
  max_similar_results: 5,
  case_sensitive_places: false,
  allow_abbreviations: true,
} as const;

/**
 * UI Configuration
 */
export const UI_CONFIG = {
  /** Toast notification duration: 4 seconds */
  TOAST_DURATION: 4000,

  /** Download filename prefix */
  VALIDATED_FILE_PREFIX: 'bag_validated_',

  /** File extension for downloads */
  DOWNLOAD_EXTENSION: '.xlsx',
} as const;

/**
 * Combined BAG configuration export
 * All constants accessible via a single import
 */
export const BAG_CONFIG = {
  FILE: FILE_CONFIG,
  POLLING: POLLING_CONFIG,
  API: API_CONFIG,
  DEFAULT_VALIDATION_CONFIG,
  UI: UI_CONFIG,
} as const;

/**
 * Required Excel columns for BAG validation
 * These columns must exist in the uploaded file
 */
export const REQUIRED_EXCEL_COLUMNS = [
  'Baartdiensten',
  'Team',
  'Straat',
  'Huisnummer',
  'Toevoeging',
  'Postcode',
  'Plaats',
  'Mailbox',
] as const;

/**
 * Validation status values
 * Matches BAG API status responses
 */
export const VALIDATION_STATUSES = {
  QUEUED: 'queued',
  PROCESSING: 'processing',
  COMPLETE: 'complete',
  FAILED: 'failed',
} as const;

/**
 * Application states
 * Represents the current state of the validation workflow
 */
export const APP_STATES = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  VALIDATING: 'validating',
  COMPLETE: 'complete',
  ERROR: 'error',
} as const;

// Type exports for constants
export type AppState = typeof APP_STATES[keyof typeof APP_STATES];
export type ValidationStatus = typeof VALIDATION_STATUSES[keyof typeof VALIDATION_STATUSES];
