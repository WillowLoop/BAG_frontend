/**
 * UploadSection Component
 *
 * File upload interface with drag-and-drop and file picker functionality.
 * Includes client-side validation and user feedback.
 */

import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { validateFile, formatFileSize } from '@/lib/validation';

interface UploadSectionProps {
  /** Callback when a valid file is selected */
  onFileSelect: (file: File) => void;
  /** Disable upload interface */
  isDisabled?: boolean;
}

/**
 * UploadSection component for file upload with drag-and-drop
 */
export function UploadSection({ onFileSelect, isDisabled = false }: UploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle drag over event
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDisabled) {
      setIsDragging(true);
    }
  };

  /**
   * Handle drag leave event
   */
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  /**
   * Handle file drop event
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (isDisabled) {
      return;
    }

    const files = e.dataTransfer.files;

    // Only take first file if multiple files are dropped
    if (files.length > 0) {
      const file = files[0];
      handleFileValidation(file);
    }
  };

  /**
   * Handle file selection from file picker
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      handleFileValidation(file);
    }
  };

  /**
   * Validate file and handle success/error
   */
  const handleFileValidation = (file: File) => {
    // Validate file
    const validation = validateFile(file);

    if (!validation.valid) {
      // Show error toast with validation message
      toast.error(validation.error);
      return;
    }

    // File is valid - set preview and call parent callback
    setSelectedFile(file);
    onFileSelect(file);
  };

  /**
   * Trigger file picker click
   */
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Clear selected file
   */
  const handleClear = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="overflow-hidden">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-8 sm:p-12 text-center transition-all duration-300 ease-out ${
          isDisabled
            ? 'bg-gray-50 cursor-not-allowed pointer-events-none'
            : isDragging
            ? 'bg-blue-50 border-2 border-blue-400 border-dashed scale-[1.02]'
            : 'bg-white border-2 border-gray-200 border-dashed hover:border-gray-300'
        }`}
        role="region"
        aria-label="Bestandsupload gebied"
      >
        <div className="max-w-md mx-auto">
          {/* Upload Icon */}
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full flex items-center justify-center transition-all duration-300 ${
              isDisabled
                ? 'bg-gray-200'
                : isDragging
                ? 'bg-blue-100 scale-110'
                : 'bg-gray-100'
            }`}
            aria-hidden="true"
          >
            <Upload
              className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors duration-300 ${
                isDisabled
                  ? 'text-gray-400'
                  : isDragging
                  ? 'text-blue-600'
                  : 'text-gray-400'
              }`}
              aria-hidden="true"
            />
          </div>

          {/* Title */}
          <h2 className="text-lg sm:text-xl font-semibold mb-2">
            {isDragging ? 'Sleep je bestand hier' : 'Upload je Excel bestand'}
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            Sleep je bestand hierheen, of klik op de knop hieronder om te bladeren
          </p>

          {/* File Preview (if file selected) */}
          {selectedFile && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-green-900 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-green-700">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <button
                  onClick={handleClear}
                  className="ml-2 p-2 hover:bg-green-100 rounded transition-colors flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Verwijder geselecteerd bestand"
                  type="button"
                >
                  <X className="w-4 h-4 text-green-700" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isDisabled}
            aria-label="Kies Excel bestand"
            id="file-upload-input"
          />

          {/* Upload Button */}
          <Button
            onClick={handleButtonClick}
            size="lg"
            disabled={isDisabled}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto min-h-[44px] btn-hover-lift"
            aria-label="Kies bestand om te uploaden"
            type="button"
          >
            <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
            Kies bestand
          </Button>

          {/* Supported Formats */}
          <p className="text-xs sm:text-sm text-gray-500 mt-4">
            Ondersteunde formaten: .xlsx, .xls (max 10 MB)
          </p>
        </div>
      </div>
    </Card>
  );
}
