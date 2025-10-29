/**
 * File Validation Utilities
 *
 * Client-side file validation for Excel uploads.
 */

/**
 * Maximum allowed file size: 10 MB in bytes
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB = 10485760 bytes

/**
 * Allowed file extensions for Excel files
 */
export const ALLOWED_EXTENSIONS = ['.xlsx', '.xls'];

/**
 * Validation result interface
 */
export interface ValidationResult {
  /** Whether the file is valid */
  valid: boolean;
  /** Error message in Dutch if validation failed */
  error?: string;
}

/**
 * Validate an uploaded file
 * Checks file extension, size, and ensures file is not empty
 *
 * @param file - The file to validate
 * @returns ValidationResult with valid flag and optional error message
 */
export function validateFile(file: File): ValidationResult {
  // Check for empty file
  if (file.size === 0) {
    return {
      valid: false,
      error: 'Bestand is leeg.',
    };
  }

  // Extract file extension
  const fileName = file.name.toLowerCase();
  const lastDotIndex = fileName.lastIndexOf('.');

  if (lastDotIndex === -1) {
    return {
      valid: false,
      error: 'Bestand heeft geen extensie. Upload een .xlsx of .xls bestand.',
    };
  }

  const extension = fileName.substring(lastDotIndex);

  // Check if extension is allowed
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: 'Dit bestandstype wordt niet ondersteund. Upload een .xlsx of .xls bestand.',
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
    return {
      valid: false,
      error: `Bestand te groot (${fileSizeMB} MB). Het maximum is 10 MB.`,
    };
  }

  // File is valid
  return {
    valid: true,
  };
}

/**
 * Format file size for display
 * Converts bytes to human-readable format
 *
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB", "150 KB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
