/**
 * Unit tests for file validation utilities
 */

import { describe, it, expect } from 'vitest';
import { validateFile, formatFileSize, MAX_FILE_SIZE, ALLOWED_EXTENSIONS } from '../validation';

describe('validateFile', () => {
  describe('valid files', () => {
    it('should validate a valid .xlsx file', () => {
      const file = new File(['content'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const result = validateFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate a valid .xls file', () => {
      const file = new File(['content'], 'test.xls', { type: 'application/vnd.ms-excel' });
      const result = validateFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate files with uppercase extensions', () => {
      const file = new File(['content'], 'TEST.XLSX', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const result = validateFile(file);

      expect(result.valid).toBe(true);
    });

    it('should validate files just under the size limit', () => {
      const content = new Array(MAX_FILE_SIZE - 1000).fill('a').join('');
      const file = new File([content], 'large.xlsx');
      const result = validateFile(file);

      expect(result.valid).toBe(true);
    });
  });

  describe('invalid file types', () => {
    it('should reject .pdf files', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const result = validateFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('niet ondersteund');
      expect(result.error).toContain('.xlsx');
    });

    it('should reject .csv files', () => {
      const file = new File(['content'], 'test.csv', { type: 'text/csv' });
      const result = validateFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('niet ondersteund');
    });

    it('should reject .doc files', () => {
      const file = new File(['content'], 'test.doc', { type: 'application/msword' });
      const result = validateFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('niet ondersteund');
    });

    it('should reject files without extension', () => {
      const file = new File(['content'], 'testfile', { type: 'application/octet-stream' });
      const result = validateFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('geen extensie');
    });
  });

  describe('file size validation', () => {
    it('should reject empty files', () => {
      const file = new File([], 'empty.xlsx');
      const result = validateFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('leeg');
    });

    it('should reject files over 10MB', () => {
      const content = new Array(MAX_FILE_SIZE + 1000).fill('a').join('');
      const file = new File([content], 'toolarge.xlsx');
      const result = validateFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('te groot');
      expect(result.error).toContain('10 MB');
    });

    it('should include actual file size in error message for oversized files', () => {
      const content = new Array(15 * 1024 * 1024).fill('a').join(''); // 15MB
      const file = new File([content], 'toolarge.xlsx');
      const result = validateFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/\d+\.\d+ MB/);
    });
  });

  describe('edge cases', () => {
    it('should handle files with multiple dots in filename', () => {
      const file = new File(['content'], 'my.data.file.xlsx');
      const result = validateFile(file);

      expect(result.valid).toBe(true);
    });

    it('should handle files with special characters', () => {
      const file = new File(['content'], 'données_françaises.xlsx');
      const result = validateFile(file);

      expect(result.valid).toBe(true);
    });

    it('should accept exactly 10MB files', () => {
      const content = new Array(MAX_FILE_SIZE).fill('a').join('');
      const file = new File([content], 'exactly10mb.xlsx');
      const result = validateFile(file);

      expect(result.valid).toBe(true);
    });
  });
});

describe('formatFileSize', () => {
  it('should format bytes', () => {
    expect(formatFileSize(500)).toBe('500 B');
    expect(formatFileSize(1023)).toBe('1023 B');
  });

  it('should format kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(10240)).toBe('10.0 KB');
  });

  it('should format megabytes', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1.00 MB');
    expect(formatFileSize(1536 * 1024)).toBe('1.50 MB');
    expect(formatFileSize(10 * 1024 * 1024)).toBe('10.00 MB');
  });

  it('should handle edge cases', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(1)).toBe('1 B');
    expect(formatFileSize(1025)).toBe('1.0 KB');
  });
});

describe('constants', () => {
  it('should export MAX_FILE_SIZE constant', () => {
    expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024);
  });

  it('should export ALLOWED_EXTENSIONS constant', () => {
    expect(ALLOWED_EXTENSIONS).toEqual(['.xlsx', '.xls']);
    expect(ALLOWED_EXTENSIONS).toHaveLength(2);
  });
});
