import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './index.css'
import App from './App.tsx'
import { queryClient } from './lib/queryClient'
import ErrorBoundary from './components/ErrorBoundary'
import { AppProvider } from './contexts/AppContext'

// Start MSW worker in development mode
async function enableMocking() {
  if (import.meta.env.MODE !== 'development') {
    return;
  }

  const { worker } = await import('./mocks/browser');

  // Start the worker with quiet mode (less console noise)
  return worker.start({
    onUnhandledRequest: 'bypass', // Don't warn about unhandled requests
  });
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <App />
            {/* React Query DevTools - only visible in development */}
            <ReactQueryDevtools initialIsOpen={false} />
          </AppProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>,
  );
});
