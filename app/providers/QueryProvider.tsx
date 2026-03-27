'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface QueryProviderProps {
  children: ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  // Create the QueryClient once per app lifecycle.
  // useState lazy init prevents re-creating the client on every re-render.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 10 seconds.
            // During this window, TanStack can serve from cache without refetching.
            staleTime: 10_000,

            // Keep inactive query data in cache for 5 minutes before garbage collection.
            // Useful when users navigate away and come back soon after.
            gcTime: 5 * 60_000,

            // Don't refetch just because the user returns to the browser tab.
            // Better for API quota and avoids noisy background traffic for this app.
            refetchOnWindowFocus: false,

            // Retry failed queries once (2 total attempts including the first one).
            // Helps recover from transient network issues without excessive retries.
            retry: 1,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
