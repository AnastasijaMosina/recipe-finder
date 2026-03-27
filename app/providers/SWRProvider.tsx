'use client';

import { ReactNode } from 'react';
import { SWRConfig } from 'swr';

interface SWRProviderProps {
  children: ReactNode;
}

// Search results are mostly static, so we keep them fresh for a long window.
const SEARCH_STALE_WINDOW_MS = 15 * 60_000;

export default function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        // Dedupe identical requests within this time window.
        dedupingInterval: SEARCH_STALE_WINDOW_MS,

        // Don't refetch automatically when user returns to the tab.
        revalidateOnFocus: false,

        // Don't refetch automatically when internet reconnects.
        revalidateOnReconnect: false,

        // If cache exists, return it instead of stale-while-revalidate fetch.
        revalidateIfStale: false,

        // Backend already retries external API calls, so avoid client-side retries.
        shouldRetryOnError: false,
      }}
    >
      {children}
    </SWRConfig>
  );
}
