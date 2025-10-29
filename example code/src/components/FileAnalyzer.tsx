import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { AnalysisSettingsDialog } from "./AnalysisSettingsDialog";
import { ArrowLeft, Download, FileText, Settings } from "lucide-react";

interface FileAnalyzerProps {
  file: File;
  onBack: () => void;
}

export interface AnalysisSettings {
  includeStatistics: boolean;
  removeDuplicates: boolean;
  highlightErrors: boolean;
  formatNumbers: boolean;
}

export function FileAnalyzer({ file, onBack }: FileAnalyzerProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [settings, setSettings] = useState<AnalysisSettings>({
    includeStatistics: true,
    removeDuplicates: false,
    highlightErrors: true,
    formatNumbers: true,
  });

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setProgress(0);
    setIsComplete(false);

    // Simulate analysis progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          setIsComplete(true);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 300);
  };

  const handleDownload = () => {
    // Mock download - in a real app, this would download the analyzed file
    const blob = new Blob(["Analyzed data"], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analyzed_${file.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSettingsConfirm = (newSettings: AnalysisSettings) => {
    setSettings(newSettings);
    setShowSettings(false);
    startAnalysis();
  };

  useEffect(() => {
    // Show settings dialog when file is first uploaded
    setShowSettings(true);
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Upload
      </Button>

      <Card className="p-8">
        {/* File Info */}
        <div className="flex items-start gap-4 mb-8 pb-8 border-b">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="truncate">{file.name}</h3>
            <p className="text-sm text-gray-600">
              {(file.size / 1024).toFixed(2)} KB
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(true)}
            disabled={isAnalyzing}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* Progress Section */}
        {!isComplete && !isAnalyzing && (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-6">
              Ready to analyze your file. Click the button below to start.
            </p>
            <Button
              onClick={startAnalysis}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Start Analysis
            </Button>
          </div>
        )}

        {isAnalyzing && (
          <div className="py-8">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h4>Analyzing your file...</h4>
                <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span>Reading file structure...</span>
              </div>
              {progress > 30 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span>Processing data...</span>
                </div>
              )}
              {progress > 60 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span>Applying settings...</span>
                </div>
              )}
              {progress > 85 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span>Finalizing analysis...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {isComplete && (
          <div className="py-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="mb-2">Analysis Complete!</h3>
              <p className="text-gray-600">
                Your file has been analyzed successfully. Download the results below.
              </p>
            </div>

            {/* Analysis Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h4 className="mb-4">Analysis Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Applied Settings:</p>
                  <ul className="mt-2 space-y-1">
                    {settings.includeStatistics && (
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        Statistics included
                      </li>
                    )}
                    {settings.removeDuplicates && (
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        Duplicates removed
                      </li>
                    )}
                    {settings.highlightErrors && (
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        Errors highlighted
                      </li>
                    )}
                    {settings.formatNumbers && (
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        Numbers formatted
                      </li>
                    )}
                  </ul>
                </div>
                <div>
                  <p className="text-gray-600">Results:</p>
                  <ul className="mt-2 space-y-1">
                    <li>Rows processed: 1,247</li>
                    <li>Columns analyzed: 12</li>
                    <li>Issues found: 3</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleDownload}
                size="lg"
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Analyzed File
              </Button>
              <Button
                onClick={() => {
                  setIsComplete(false);
                  startAnalysis();
                }}
                variant="outline"
                size="lg"
              >
                Reanalyze
              </Button>
            </div>
          </div>
        )}
      </Card>

      <AnalysisSettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
        settings={settings}
        onConfirm={handleSettingsConfirm}
      />
    </div>
  );
}
