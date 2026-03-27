'use client';

import { ReactNode } from 'react';
import { SWRConfig } from 'swr';

interface SWRProviderProps {
  children: ReactNode;
}

export default function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        dedupingInterval: 10000, // 10seconds — if the same key is requested again within this time, SWR will return the cached data without making a new request
        revalidateOnFocus: false, // If user switches back to the tab, we don't want to silently refetch data in the background — it's better to show them the cached data immediately
        revalidateOnReconnect: true, // If the user loses internet and reconnects, we want fresh data — stale cache is less acceptable there
        revalidateIfStale: false, // Tells SWR "if you already have cached data for this key, just return it — don't silently refetch in background"
      }}
    >
      {children}
    </SWRConfig>
  );
}
