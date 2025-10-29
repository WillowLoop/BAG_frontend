/**
 * TanStack Query (React Query) Configuration
 *
 * Configured QueryClient with retry logic and default options.
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Query client instance with configured defaults
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry failed requests 3 times
      retry: 3,
      // Exponential backoff: 1s, 2s, 4s (max 30s)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Consider data stale after 5 seconds
      staleTime: 5000,
      // Don't refetch on window focus (prevents unnecessary API calls)
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
});
