/**
 * Constants for ExcelFlow MVP
 *
 * Contains error messages, validation rules, and other constant values.
 * All user-facing messages are in Dutch.
 */

// =============================================================================
// VALIDATION ERROR MESSAGES
// =============================================================================

/**
 * Error message for invalid file type
 */
export const ERROR_INVALID_FILE_TYPE =
  'Dit bestandstype wordt niet ondersteund. Upload een .xlsx of .xls bestand.';

/**
 * Error message for file too large
 * Use with template: ERROR_FILE_TOO_LARGE_TEMPLATE(actualSizeMB)
 */
export const ERROR_FILE_TOO_LARGE_TEMPLATE = (actualSizeMB: number) =>
  `Bestand te groot (${actualSizeMB.toFixed(2)} MB). Het maximum is 10 MB.`;

/**
 * Generic file too large error (when size is not available)
 */
export const ERROR_FILE_TOO_LARGE = 'Bestand te groot. Het maximum is 10 MB.';

/**
 * Error message for empty file
 */
export const ERROR_FILE_EMPTY = 'Bestand is leeg. Upload een geldig Excel bestand.';

/**
 * Error message for no file selected
 */
export const ERROR_NO_FILE_SELECTED = 'Geen bestand geselecteerd. Selecteer eerst een bestand.';

// =============================================================================
// NETWORK ERROR MESSAGES
// =============================================================================

/**
 * Generic network error message
 */
export const ERROR_NETWORK =
  'Geen verbinding met de server. Controleer je internetverbinding en probeer opnieuw.';

/**
 * Error message for timeout
 */
export const ERROR_TIMEOUT =
  'Verzoek duurde te lang. Controleer je internetverbinding en probeer opnieuw.';

/**
 * Error message for connection failure
 */
export const ERROR_CONNECTION_FAILED =
  'Kan geen verbinding maken met de server. Probeer het later opnieuw.';

// =============================================================================
// API ERROR MESSAGES
// =============================================================================

/**
 * Generic API error message
 */
export const ERROR_API_GENERIC =
  'Er is een probleem opgetreden bij het verwerken van je verzoek. Probeer het opnieuw.';

/**
 * Server error message (5xx)
 */
export const ERROR_SERVER =
  'Server fout. Ons team is op de hoogte. Probeer het later opnieuw.';

/**
 * Service unavailable error (503)
 */
export const ERROR_SERVICE_UNAVAILABLE =
  'De service is tijdelijk niet beschikbaar. Probeer het over enkele minuten opnieuw.';

/**
 * Rate limit error (429)
 */
export const ERROR_RATE_LIMIT = 'Te veel verzoeken. Wacht even en probeer opnieuw.';

/**
 * Job not found error (404)
 */
export const ERROR_JOB_NOT_FOUND =
  'Het gevraagde bestand kon niet worden gevonden. De verwerking is mogelijk verlopen.';

/**
 * Unauthorized error (401)
 */
export const ERROR_UNAUTHORIZED = 'Autorisatie verlopen. Vernieuw de pagina en probeer opnieuw.';

// =============================================================================
// UPLOAD ERROR MESSAGES
// =============================================================================

/**
 * Error message when upload fails
 */
export const ERROR_UPLOAD_FAILED =
  'Upload mislukt. Controleer je internetverbinding en probeer opnieuw.';

/**
 * Error message when file cannot be read
 */
export const ERROR_FILE_READ_FAILED =
  'Bestand kon niet worden gelezen. Zorg ervoor dat het bestand niet beschadigd is.';

// =============================================================================
// PROCESSING ERROR MESSAGES
// =============================================================================

/**
 * Error message when processing takes too long
 */
export const ERROR_PROCESSING_TIMEOUT =
  'Verwerking duurt onverwacht lang. Neem contact op met support als dit blijft gebeuren.';

/**
 * Error message when processing fails
 */
export const ERROR_PROCESSING_FAILED =
  'Verwerking mislukt. Probeer het opnieuw of neem contact op met support.';

// =============================================================================
// DOWNLOAD ERROR MESSAGES
// =============================================================================

/**
 * Error message when download fails
 */
export const ERROR_DOWNLOAD_FAILED = 'Download mislukt. Probeer het opnieuw.';

/**
 * Error message when file is not ready for download
 */
export const ERROR_FILE_NOT_READY =
  'Bestand is nog niet klaar voor download. Wacht tot de verwerking compleet is.';

// =============================================================================
// UNKNOWN ERROR MESSAGES
// =============================================================================

/**
 * Generic unknown error message
 */
export const ERROR_UNKNOWN =
  'Er is een onverwachte fout opgetreden. Probeer de pagina te vernieuwen.';

/**
 * Fallback error message
 */
export const ERROR_FALLBACK =
  'Er is iets misgegaan. Probeer het opnieuw of neem contact op met support.';

// =============================================================================
// SUCCESS MESSAGES
// =============================================================================

/**
 * Success message for upload
 */
export const SUCCESS_UPLOAD = 'Bestand succesvol geüpload! Verwerking is gestart.';

/**
 * Success message for download
 */
export const SUCCESS_DOWNLOAD = 'Bestand succesvol gedownload!';

/**
 * Success message for processing complete
 */
export const SUCCESS_PROCESSING_COMPLETE = 'Analyse compleet! Je bestand is klaar voor download.';

// =============================================================================
// VALIDATION CONSTANTS
// =============================================================================

/**
 * Maximum file size in bytes (10 MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Maximum file size in MB for display
 */
export const MAX_FILE_SIZE_MB = 10;

/**
 * Allowed file extensions
 */
export const ALLOWED_EXTENSIONS = ['.xlsx', '.xls'] as const;

/**
 * Allowed MIME types
 */
export const ALLOWED_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
] as const;

// =============================================================================
// POLLING CONSTANTS
// =============================================================================

/**
 * Polling interval in milliseconds (2.5 seconds)
 */
export const POLLING_INTERVAL = 2500;

/**
 * Maximum polling duration before timeout (5 minutes)
 */
export const POLLING_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// =============================================================================
// UI CONSTANTS
// =============================================================================

/**
 * Toast duration in milliseconds
 */
export const TOAST_DURATION = 4000;

/**
 * Debounce delay for resize handlers (milliseconds)
 */
export const RESIZE_DEBOUNCE_DELAY = 200;

// =============================================================================
// API CONSTANTS
// =============================================================================

/**
 * API timeout in milliseconds (30 seconds)
 */
export const API_TIMEOUT = 30000;

/**
 * Number of retry attempts for failed requests
 */
export const API_RETRY_ATTEMPTS = 3;
