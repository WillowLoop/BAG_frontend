/**
 * BagUploadSection Component
 *
 * File upload interface for BAG address validation with drag-and-drop functionality.
 * Adapted from ExcelFlow UploadSection with BAG-specific requirements:
 * - Only .xlsx files allowed (not .xls)
 * - Dutch text for BAG context
 * - Integration with BAG validation hooks
 */

import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { validateFile, formatFileSize } from '@/lib/validation';
import { useBagValidation } from '@/contexts/BagValidationContext';
import { useBagFileUpload } from '@/hooks/useBagFileUpload';
import { BAG_MESSAGES } from '@/lib/bagMessages';

/**
 * BagUploadSection component for BAG address validation file upload
 */
export function BagUploadSection() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { state } = useBagValidation();
  const { uploadFile, uploadProgress, isUploading } = useBagFileUpload();

  const isDisabled = state === 'uploading' || state === 'validating';

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
   * Validate file and trigger upload
   */
  const handleFileValidation = (file: File) => {
    // Validate file (checks for .xlsx only, size, empty file)
    const validation = validateFile(file);

    if (!validation.valid) {
      // Show error toast with validation message
      toast.error(validation.error);
      return;
    }

    // File is valid - set preview and start upload
    setSelectedFile(file);
    uploadFile(file);
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
        aria-label="BAG adres validatie upload gebied"
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
            {isDragging
              ? BAG_MESSAGES.upload.titleDragging
              : BAG_MESSAGES.upload.title}
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            {BAG_MESSAGES.upload.description}
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
                {!isDisabled && (
                  <button
                    onClick={handleClear}
                    className="ml-2 p-2 hover:bg-green-100 rounded transition-colors flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label={BAG_MESSAGES.upload.clearFile}
                    type="button"
                  >
                    <X className="w-4 h-4 text-green-700" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Upload Progress (if uploading) */}
          {isUploading && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-blue-900">
                  {BAG_MESSAGES.validation.uploading}
                </span>
                <span className="text-sm font-medium text-blue-900">
                  {Math.round(uploadProgress)}%
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isDisabled}
            aria-label="Kies Excel bestand voor BAG validatie"
            id="bag-file-upload-input"
          />

          {/* Upload Button */}
          <Button
            onClick={handleButtonClick}
            size="lg"
            disabled={isDisabled}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto min-h-[44px] btn-hover-lift"
            aria-label={BAG_MESSAGES.upload.chooseFile}
            type="button"
          >
            <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
            {BAG_MESSAGES.upload.buttonLabel}
          </Button>

          {/* Supported Formats */}
          <p className="text-xs sm:text-sm text-gray-500 mt-4">
            {BAG_MESSAGES.upload.supportedFormats}
          </p>
        </div>
      </div>
    </Card>
  );
}
