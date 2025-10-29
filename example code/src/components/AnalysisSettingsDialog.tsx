import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { AnalysisSettings } from "./FileAnalyzer";

interface AnalysisSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: AnalysisSettings;
  onConfirm: (settings: AnalysisSettings) => void;
}

export function AnalysisSettingsDialog({
  open,
  onOpenChange,
  settings,
  onConfirm,
}: AnalysisSettingsDialogProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleConfirm = () => {
    onConfirm(localSettings);
  };

  const toggleSetting = (key: keyof AnalysisSettings) => {
    setLocalSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Analysis Settings</DialogTitle>
          <DialogDescription>
            Configure how you want to analyze your Excel file. You can change these settings later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="statistics">Include Statistics</Label>
              <p className="text-sm text-gray-600">
                Add summary statistics for numerical columns
              </p>
            </div>
            <Switch
              id="statistics"
              checked={localSettings.includeStatistics}
              onCheckedChange={() => toggleSetting("includeStatistics")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="duplicates">Remove Duplicates</Label>
              <p className="text-sm text-gray-600">
                Automatically detect and remove duplicate rows
              </p>
            </div>
            <Switch
              id="duplicates"
              checked={localSettings.removeDuplicates}
              onCheckedChange={() => toggleSetting("removeDuplicates")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="errors">Highlight Errors</Label>
              <p className="text-sm text-gray-600">
                Mark cells with potential errors or inconsistencies
              </p>
            </div>
            <Switch
              id="errors"
              checked={localSettings.highlightErrors}
              onCheckedChange={() => toggleSetting("highlightErrors")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="format">Format Numbers</Label>
              <p className="text-sm text-gray-600">
                Apply consistent number formatting throughout
              </p>
            </div>
            <Switch
              id="format"
              checked={localSettings.formatNumbers}
              onCheckedChange={() => toggleSetting("formatNumbers")}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Start Analysis
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
