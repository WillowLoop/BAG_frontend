/**
 * ErrorBoundary Component
 *
 * Catches unhandled React errors and displays a fallback UI.
 * Provides a way to reset the application state.
 */

import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 rounded-full shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-red-900">Er is een fout opgetreden</CardTitle>
                  <CardDescription className="mt-1.5 text-base">
                    De applicatie is onverwacht gestopt. Probeer de pagina te vernieuwen.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error Details (development mode) */}
              {this.state.error && import.meta.env.DEV && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <p className="text-xs font-semibold text-gray-900 mb-1">
                    Technische details:
                  </p>
                  <p className="text-xs text-gray-700 font-mono break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              {/* Reset Button */}
              <div className="pt-2">
                <Button
                  onClick={this.handleReset}
                  className="w-full gap-2"
                  variant="default"
                >
                  <RefreshCw className="w-4 h-4" />
                  Herlaad applicatie
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
