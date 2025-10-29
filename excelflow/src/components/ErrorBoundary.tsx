/**
 * ErrorBoundary Component
 *
 * React Error Boundary that catches JavaScript errors anywhere in the component tree,
 * logs those errors, and displays a fallback UI instead of crashing the entire app.
 *
 * This is a class component because React Error Boundaries must be class components.
 */

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  /**
   * Update state so the next render will show the fallback UI
   */
  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Log error details to console (and optionally to error monitoring service like Sentry)
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console for development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // TODO: Send to error monitoring service (e.g., Sentry) in production
    // if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    //   Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    // }
  }

  /**
   * Reset error boundary state
   */
  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  /**
   * Reload the entire page
   */
  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-red-900">Er is iets misgegaan</CardTitle>
                  <CardDescription>
                    De applicatie heeft een onverwachte fout tegengekomen
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We hebben deze fout geregistreerd en werken aan een oplossing.
                Probeer de pagina opnieuw te laden.
              </p>

              {/* Show error details in development mode */}
              {import.meta.env.DEV && this.state.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-xs font-semibold text-red-900 mb-1">
                    Development Error Details:
                  </p>
                  <p className="text-xs text-red-800 font-mono">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={this.handleReload}
                  className="flex-1"
                >
                  Herlaad pagina
                </Button>
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="flex-1"
                >
                  Probeer opnieuw
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Blijft dit probleem zich voordoen?
                <a
                  href="mailto:support@excelflow.com"
                  className="text-blue-600 hover:underline ml-1"
                >
                  Neem contact op met support
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
