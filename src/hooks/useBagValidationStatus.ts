/**
 * useBagValidationStatus Hook
 *
 * Custom hook for receiving real-time BAG validation status via WebSocket.
 * Connects to backend WebSocket endpoint for live progress updates.
 *
 * Adapted from ExcelFlow useAnalysisStatus with key differences:
 * - Uses WebSocket instead of polling
 * - Returns sessionId instead of jobId
 * - Returns processedCount and totalCount (not in ExcelFlow)
 * - Returns phase for current validation phase
 */

import { useState, useEffect, useRef } from 'react';
import { useBagValidation } from '@/contexts/BagValidationContext';
import type { BagValidationStatus, AppError } from '@/api/types/bag.types';
import { VALIDATION_STATUSES, APP_STATES, API_CONFIG } from '@/lib/bagConstants';

/**
 * Convert HTTP/HTTPS URL to WebSocket URL
 * @param httpUrl - HTTP or HTTPS URL
 * @returns WebSocket URL (ws:// or wss://)
 */
function httpToWebSocketUrl(httpUrl: string): string {
  return httpUrl.replace(/^http/, 'ws');
}

// WebSocket message types from backend
interface ProgressMessage {
  type: 'progress';
  progress: number;
  phase: string;
  processed_count: number;
  total_count: number;
  timestamp: string;
}

interface CompletionMessage {
  type: 'complete';
  output_file_id: string;
  timestamp: string;
}

interface ErrorMessage {
  type: 'error';
  error: string;
  timestamp: string;
}

type WebSocketMessage = ProgressMessage | CompletionMessage | ErrorMessage;

interface UseBagValidationStatusResult {
  /** Current validation status data */
  status: BagValidationStatus | undefined;
  /** Progress percentage (0-100) */
  progress: number;
  /** Current validation phase */
  phase: string | undefined;
  /** Number of addresses processed */
  processedCount: number;
  /** Total number of addresses to process */
  totalCount: number;
  /** Status message */
  message: string | undefined;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: AppError | null;
}

/**
 * Hook for receiving real-time BAG validation status via WebSocket
 *
 * Connects to backend WebSocket endpoint for live progress updates.
 * Automatically closes connection when status is 'complete' or 'failed'.
 * Updates context state when validation completes or fails.
 *
 * @param sessionId - Unique identifier for the validation session
 * @returns Validation status with loading and error states
 *
 * @example
 * ```tsx
 * const { progress, phase, processedCount, totalCount, isLoading } = useBagValidationStatus(sessionId);
 *
 * return (
 *   <div>
 *     <ProgressBar value={progress} />
 *     <p>{phase}</p>
 *     <p>{processedCount} van {totalCount} adressen verwerkt</p>
 *   </div>
 * );
 * ```
 */
export function useBagValidationStatus(
  sessionId: string | null
): UseBagValidationStatusResult {
  const { state, setComplete, setError } = useBagValidation();
  const wsRef = useRef<WebSocket | null>(null);
  const lastTotalCountRef = useRef<number>(0);
  const isCompletedRef = useRef<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<BagValidationStatus | undefined>(undefined);
  const [error, setErrorState] = useState<AppError | null>(null);

  useEffect(() => {
    // Only connect when sessionId is available and state is validating
    if (!sessionId || state !== APP_STATES.VALIDATING) {
      return;
    }

    // If already have an active WebSocket, don't create a new one
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected, skipping reconnect');
      return;
    }

    // Reset completion flag for new validation
    isCompletedRef.current = false;

    // WebSocket endpoint - convert HTTP base URL to WebSocket
    const wsBaseUrl = httpToWebSocketUrl(API_CONFIG.BASE_URL);
    const wsUrl = `${wsBaseUrl}/api/v1/ws/progress/${sessionId}`;

    // Create WebSocket connection
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected:', wsUrl);
      setIsLoading(false);
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);

        if (message.type === 'progress') {
          // Update progress state
          lastTotalCountRef.current = message.total_count;
          setData({
            sessionId: sessionId,
            status: 'processing',
            progress: message.progress,
            phase: message.phase,
            processedCount: message.processed_count,
            totalCount: message.total_count,
          });
        } else if (message.type === 'complete') {
          // Validation completed successfully
          isCompletedRef.current = true;
          setData({
            sessionId: sessionId,
            status: 'complete',
            progress: 100,
            phase: 'Voltooid',
            processedCount: lastTotalCountRef.current,
            totalCount: lastTotalCountRef.current,
          });
          setComplete();
          ws.close();
        } else if (message.type === 'error') {
          // Validation failed
          const errorData: AppError = {
            type: 'api',
            message: message.error || 'Validatie mislukt. Controleer je Excel bestand.',
          };
          setErrorState(errorData);
          setError(errorData);
          ws.close();
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onerror = (event) => {
      console.error('WebSocket error:', event);
      const errorData: AppError = {
        type: 'network',
        message: 'Verbindingsfout tijdens validatie. Controleer je internetverbinding.',
      };
      setErrorState(errorData);
      setError(errorData);
      setIsLoading(false);
    };

    ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      setIsLoading(false);
    };

    // Cleanup: only close WebSocket if validation is complete or on component unmount
    return () => {
      // In StrictMode, React will call cleanup even during double-mount
      // Only close if validation is actually complete or component is truly unmounting
      if (isCompletedRef.current || state !== APP_STATES.VALIDATING) {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          console.log('Closing WebSocket in cleanup (completed or state changed)');
          ws.close();
        }
      } else {
        // Don't close - this is likely a StrictMode double-mount
        console.log('Skipping WebSocket close in cleanup (validation still active)');
      }
    };
  }, [sessionId, state]);

  return {
    status: data,
    progress: data?.progress ?? 0,
    phase: data?.phase,
    processedCount: data?.processedCount ?? 0,
    totalCount: data?.totalCount ?? 0,
    message: data?.message,
    isLoading,
    error: error,
  };
}
