/**
 * Unit tests for utility functions
 */

import { describe, it, expect } from 'vitest';
import { generateDownloadFilename, cn } from '../utils';

describe('generateDownloadFilename', () => {
  describe('basic functionality', () => {
    it('should add "analyzed_" prefix to filename', () => {
      const result = generateDownloadFilename('sales.xlsx');
      expect(result).toBe('analyzed_sales.xlsx');
    });

    it('should always use .xlsx extension regardless of input', () => {
      expect(generateDownloadFilename('data.xls')).toBe('analyzed_data.xlsx');
      expect(generateDownloadFilename('report.xlsx')).toBe('analyzed_report.xlsx');
    });

    it('should remove original extension', () => {
      const result = generateDownloadFilename('quarterly_report.xlsx');
      expect(result).toBe('analyzed_quarterly_report.xlsx');
      expect(result).not.toContain('.xlsx.xlsx');
    });
  });

  describe('special character sanitization', () => {
    it('should replace spaces with underscores', () => {
      const result = generateDownloadFilename('Sales Data.xlsx');
      expect(result).toBe('analyzed_Sales_Data.xlsx');
    });

    it('should replace special characters with underscores', () => {
      expect(generateDownloadFilename('Q4 Report 2024!.xlsx')).toBe('analyzed_Q4_Report_2024_.xlsx');
      expect(generateDownloadFilename('data@company.com.xlsx')).toBe('analyzed_data_company_com.xlsx');
    });

    it('should handle French accents and special characters', () => {
      const result = generateDownloadFilename('données françaises.xlsx');
      expect(result).toBe('analyzed_donn_es_fran_aises.xlsx');
    });

    it('should handle parentheses and brackets', () => {
      expect(generateDownloadFilename('Report (Final).xlsx')).toBe('analyzed_Report__Final_.xlsx');
      expect(generateDownloadFilename('Data [2024].xlsx')).toBe('analyzed_Data__2024_.xlsx');
    });

    it('should keep alphanumeric characters, hyphens, and underscores', () => {
      const result = generateDownloadFilename('my-data_2024.xlsx');
      expect(result).toBe('analyzed_my-data_2024.xlsx');
    });
  });

  describe('edge cases', () => {
    it('should handle filename without extension', () => {
      const result = generateDownloadFilename('myfile');
      expect(result).toBe('analyzed_myfile.xlsx');
    });

    it('should handle multiple dots in filename', () => {
      const result = generateDownloadFilename('my.data.file.xlsx');
      expect(result).toBe('analyzed_my_data_file.xlsx');
    });

    it('should handle empty filename (edge case)', () => {
      // When filename is just ".xlsx", the part before dot is empty
      const result = generateDownloadFilename('.xlsx');
      // The implementation will sanitize the ".xlsx" part which becomes "_xlsx"
      expect(result).toContain('analyzed_');
      expect(result.endsWith('.xlsx')).toBe(true);
    });

    it('should handle very long filenames', () => {
      const longName = 'a'.repeat(200) + '.xlsx';
      const result = generateDownloadFilename(longName);
      expect(result.startsWith('analyzed_')).toBe(true);
      expect(result.endsWith('.xlsx')).toBe(true);
      expect(result).toHaveLength('analyzed_'.length + 200 + '.xlsx'.length);
    });

    it('should handle filenames with consecutive special characters', () => {
      const result = generateDownloadFilename('test!!!###file.xlsx');
      expect(result).toBe('analyzed_test______file.xlsx');
    });

    it('should handle Unicode characters', () => {
      const result = generateDownloadFilename('测试文件.xlsx');
      expect(result).toContain('analyzed_');
      expect(result.endsWith('.xlsx')).toBe(true);
    });
  });

  describe('real-world examples', () => {
    it('should handle typical business filenames', () => {
      expect(generateDownloadFilename('Q4_Sales_Report_2024.xlsx')).toBe('analyzed_Q4_Sales_Report_2024.xlsx');
      expect(generateDownloadFilename('Customer Data (Final Version).xlsx')).toBe('analyzed_Customer_Data__Final_Version_.xlsx');
      expect(generateDownloadFilename('Invoice-123456.xlsx')).toBe('analyzed_Invoice-123456.xlsx');
    });

    it('should handle filenames with dates', () => {
      expect(generateDownloadFilename('Report_2024-01-15.xlsx')).toBe('analyzed_Report_2024-01-15.xlsx');
      expect(generateDownloadFilename('Data 01/15/2024.xlsx')).toBe('analyzed_Data_01_15_2024.xlsx');
    });
  });
});

describe('cn utility (className merger)', () => {
  it('should merge class names', () => {
    const result = cn('class1', 'class2');
    expect(result).toContain('class1');
    expect(result).toContain('class2');
  });

  it('should handle conditional classes', () => {
    const result = cn('base', true && 'active', false && 'inactive');
    expect(result).toContain('base');
    expect(result).toContain('active');
    expect(result).not.toContain('inactive');
  });

  it('should handle undefined and null', () => {
    const result = cn('class1', undefined, null, 'class2');
    expect(result).toContain('class1');
    expect(result).toContain('class2');
  });

  it('should merge Tailwind conflicting classes correctly', () => {
    // tailwind-merge should keep the last conflicting class
    const result = cn('px-2 py-1', 'px-4');
    expect(result).toContain('px-4');
    expect(result).toContain('py-1');
  });
});
