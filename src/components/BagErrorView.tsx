/**
 * BagErrorView Component
 *
 * Displays application-level errors for BAG address validation
 * with user-friendly Dutch messages and action buttons for recovery.
 * Adapted from ExcelFlow ErrorView with BAG-specific error messages.
 */

import type { AppError } from '@/api/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, WifiOff, ServerCrash, XCircle, RefreshCw, Upload } from 'lucide-react';
import { useBagValidation } from '@/contexts/BagValidationContext';
import { useBagFileUpload } from '@/hooks/useBagFileUpload';
import { BAG_MESSAGES } from '@/lib/bagMessages';

interface BagErrorViewProps {
  error: AppError;
}

/**
 * Get the appropriate icon based on error type
 */
const getErrorIcon = (type: AppError['type']) => {
  switch (type) {
    case 'network':
      return WifiOff;
    case 'api':
      return ServerCrash;
    case 'validation':
      return XCircle;
    case 'unknown':
    default:
      return AlertTriangle;
  }
};

/**
 * Get the appropriate color classes based on error type
 */
const getErrorColorClasses = (type: AppError['type']) => {
  switch (type) {
    case 'network':
      return {
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        titleColor: 'text-orange-900',
      };
    case 'api':
      return {
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        titleColor: 'text-red-900',
      };
    case 'validation':
      return {
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        titleColor: 'text-yellow-900',
      };
    case 'unknown':
    default:
      return {
        iconBg: 'bg-gray-100',
        iconColor: 'text-gray-600',
        titleColor: 'text-gray-900',
      };
  }
};

/**
 * Get a user-friendly title based on error type
 */
const getErrorTitle = (type: AppError['type']) => {
  switch (type) {
    case 'network':
      return BAG_MESSAGES.errors.networkTitle;
    case 'api':
      return BAG_MESSAGES.errors.apiTitle;
    case 'validation':
      return BAG_MESSAGES.errors.validationTitle;
    case 'unknown':
    default:
      return BAG_MESSAGES.errors.unknownTitle;
  }
};

/**
 * Get suggested actions based on error type
 */
const getSuggestedActions = (type: AppError['type']) => {
  switch (type) {
    case 'network':
      return BAG_MESSAGES.errors.networkActions;
    case 'api':
      return BAG_MESSAGES.errors.apiActions;
    case 'validation':
      return BAG_MESSAGES.errors.validationActions;
    case 'unknown':
    default:
      return BAG_MESSAGES.errors.unknownActions;
  }
};

/**
 * Check if error is recoverable (can retry)
 */
const isRecoverable = (type: AppError['type']) => {
  return type === 'network' || type === 'api';
};

export function BagErrorView({ error }: BagErrorViewProps) {
  const { reset, currentFile } = useBagValidation();
  const { uploadFile } = useBagFileUpload();

  const Icon = getErrorIcon(error.type);
  const colorClasses = getErrorColorClasses(error.type);
  const title = getErrorTitle(error.type);
  const suggestedActions = getSuggestedActions(error.type);
  const canRetry = isRecoverable(error.type);

  const handleRetry = () => {
    // If we have the current file and error is recoverable, retry upload
    if (currentFile && canRetry) {
      uploadFile(currentFile);
    }
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className={`p-3 ${colorClasses.iconBg} rounded-full shrink-0`}>
              <Icon className={`w-6 h-6 ${colorClasses.iconColor}`} />
            </div>
            <div className="flex-1">
              <CardTitle className={colorClasses.titleColor}>{title}</CardTitle>
              <CardDescription className="mt-1.5 text-base">
                {error.message}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Suggested Actions */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">
              {BAG_MESSAGES.errors.whatToDo}
            </p>
            <ul className="text-sm space-y-1">
              {suggestedActions.map((action, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-0.5">•</span>
                  <span className="text-muted-foreground">{action}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Error Details (optional, for development/debugging) */}
          {error.details && import.meta.env.DEV && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <p className="text-xs font-semibold text-gray-900 mb-1">
                {BAG_MESSAGES.errors.technicalDetails}
              </p>
              <p className="text-xs text-gray-700 font-mono break-all">
                {error.details}
              </p>
              {error.statusCode && (
                <p className="text-xs text-gray-600 mt-1">
                  {BAG_MESSAGES.errors.statusCode} {error.statusCode}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            {canRetry && currentFile && (
              <Button
                onClick={handleRetry}
                className="flex-1 gap-2"
                variant="default"
              >
                <RefreshCw className="w-4 h-4" />
                {BAG_MESSAGES.errors.retryButton}
              </Button>
            )}
            <Button
              onClick={handleReset}
              className="flex-1 gap-2"
              variant="outline"
            >
              <Upload className="w-4 h-4" />
              {BAG_MESSAGES.errors.resetButton}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
