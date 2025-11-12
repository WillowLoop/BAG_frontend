/**
 * BAG Utility Functions
 *
 * Helper functions for BAG Address Validation feature.
 * Adapted from ExcelFlow utils.ts with BAG-specific modifications.
 */

import { UI_CONFIG } from './bagConstants';

/**
 * Generate a download filename for validated BAG files
 *
 * - Removes original extension
 * - Sanitizes special characters (replaces with underscore)
 * - Adds "bag_validated_" prefix
 * - Always adds ".xlsx" extension
 *
 * @param originalFileName - The original filename
 * @returns Sanitized filename with BAG prefix and .xlsx extension
 *
 * @example
 * ```typescript
 * generateBagFilename("addresses.xlsx")
 * // Returns: "bag_validated_addresses.xlsx"
 *
 * generateBagFilename("Dutch Addresses 2024.xlsx")
 * // Returns: "bag_validated_Dutch_Addresses_2024.xlsx"
 *
 * generateBagFilename("données françaises.xls")
 * // Returns: "bag_validated_donn_es_fran_aises.xlsx"
 * ```
 */
export function generateBagFilename(originalFileName: string): string {
  // Remove extension from original filename
  const lastDotIndex = originalFileName.lastIndexOf('.');
  const nameWithoutExt =
    lastDotIndex > 0 ? originalFileName.substring(0, lastDotIndex) : originalFileName;

  // Sanitize special characters (replace with underscore)
  // Keep: letters, numbers, underscores, hyphens
  const sanitized = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_');

  // Add BAG prefix and .xlsx extension
  return `${UI_CONFIG.VALIDATED_FILE_PREFIX}${sanitized}${UI_CONFIG.DOWNLOAD_EXTENSION}`;
}

/**
 * Format file size for display
 *
 * Converts bytes to human-readable format (KB or MB)
 *
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 *
 * @example
 * ```typescript
 * formatFileSize(1024)        // "1.00 KB"
 * formatFileSize(1048576)     // "1.00 MB"
 * formatFileSize(5242880)     // "5.00 MB"
 * ```
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(2)} KB`;
  }

  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

/**
 * Check if a filename has a valid BAG file extension
 *
 * @param fileName - The filename to check
 * @returns true if filename ends with .xlsx
 *
 * @example
 * ```typescript
 * isValidBagFileExtension("addresses.xlsx")  // true
 * isValidBagFileExtension("addresses.xls")   // false
 * isValidBagFileExtension("addresses.csv")   // false
 * ```
 */
export function isValidBagFileExtension(fileName: string): boolean {
  return fileName.toLowerCase().endsWith('.xlsx');
}
