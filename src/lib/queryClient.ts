/**
 * TanStack Query Client Configuration
 *
 * Configures the QueryClient for BAG address validation with:
 * - Retry logic (3 attempts)
 * - Stale time (5 minutes)
 * - Disabled refetch on window focus
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 3,
    },
  },
});
