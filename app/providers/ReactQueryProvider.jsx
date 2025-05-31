// app/providers/ReactQueryProvider.js (or layout.js if using app dir)
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { useState } from 'react';

export default function ReactQueryProvider({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 30 // 30 minutes
      }
    }
  }));

  const localStoragePersister = createSyncStoragePersister({
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  });

  if (typeof window !== 'undefined') {
    persistQueryClient({
      queryClient,
      persister: localStoragePersister,
    });
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}


