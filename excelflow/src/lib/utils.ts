import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate a download filename for processed Excel files
 *
 * - Removes original extension
 * - Sanitizes special characters (replaces with underscore)
 * - Adds "analyzed_" prefix
 * - Always adds ".xlsx" extension
 *
 * @param originalFileName - The original filename
 * @returns Sanitized filename with prefix and .xlsx extension
 *
 * @example
 * generateDownloadFilename("Sales Data.xlsx") // "analyzed_Sales_Data.xlsx"
 * generateDownloadFilename("données françaises.xls") // "analyzed_donn_es_fran_aises.xlsx"
 */
export function generateDownloadFilename(originalFileName: string): string {
  // Remove extension from original filename
  const lastDotIndex = originalFileName.lastIndexOf('.');
  const nameWithoutExt = lastDotIndex > 0
    ? originalFileName.substring(0, lastDotIndex)
    : originalFileName;

  // Sanitize special characters (replace with underscore)
  const sanitized = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_');

  // Add prefix and .xlsx extension
  return `analyzed_${sanitized}.xlsx`;
}
