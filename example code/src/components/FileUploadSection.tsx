import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Upload } from "lucide-react";

interface FileUploadSectionProps {
  onFileUpload: (file: File) => void;
}

export function FileUploadSection({ onFileUpload }: FileUploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (isValidFile(file)) {
        onFileUpload(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (isValidFile(file)) {
        onFileUpload(file);
      }
    }
  };

  const isValidFile = (file: File) => {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    return validExtensions.includes(extension);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="overflow-hidden">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-12 text-center transition-all ${
          isDragging
            ? "bg-blue-50 border-2 border-blue-400 border-dashed"
            : "bg-white border-2 border-gray-200 border-dashed"
        }`}
      >
        <div className="max-w-md mx-auto">
          <div
            className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center transition-all ${
              isDragging
                ? "bg-blue-100 scale-110"
                : "bg-gray-100"
            }`}
          >
            <Upload
              className={`w-10 h-10 transition-colors ${
                isDragging ? "text-blue-600" : "text-gray-400"
              }`}
            />
          </div>

          <h3 className="mb-2">
            {isDragging ? "Drop your file here" : "Upload your Excel file"}
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Drag and drop your file here, or click the button below to browse
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            className="hidden"
          />

          <Button
            onClick={handleButtonClick}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Choose File
          </Button>

          <p className="text-xs text-gray-500 mt-4">
            Supported formats: .xlsx, .xls, .csv
          </p>
        </div>
      </div>
    </Card>
  );
}
