import { useEffect, useMemo, useRef, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { dashboardRouter, loginRouter } from './router';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { OverlayLoader, ActionToastProvider } from '_components/shared';

import { useStore } from './store/useStore';
import {
  QueryClient,
  QueryClientProvider,
  dehydrate,
  hydrate,
  type DehydratedState,
} from '@tanstack/react-query';
import type { Query } from '@tanstack/query-core';
import { BOOK_QUERIES_KEYS } from '_queries/booksQueries';
import { STORAGE_QUERY_KEYS } from '_queries/storageQueries';

import { pdfjs } from 'react-pdf';

// Configure pdf.js worker (use CDN matching installed version to avoid bundler issues)
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const QUERY_PERSIST_VERSION = 1;
const QUERY_PERSIST_KEY_PREFIX = 'libris-query-cache';
const QUERY_PERSIST_MAX_AGE_MS = 60 * 60 * 1000;
const QUERY_PERSIST_DEBOUNCE_MS = 800;

type PersistedQueryCache = {
  version: number;
  updatedAt: number;
  state: DehydratedState;
};

const buildPersistKey = (userId?: string | null) =>
  userId ? `${QUERY_PERSIST_KEY_PREFIX}:${userId}` : null;

const readPersistedCache = (persistKey: string): DehydratedState | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(persistKey);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as PersistedQueryCache;
    if (parsed.version !== QUERY_PERSIST_VERSION) {
      localStorage.removeItem(persistKey);
      return null;
    }
    if (
      !parsed.updatedAt ||
      Date.now() - parsed.updatedAt > QUERY_PERSIST_MAX_AGE_MS
    ) {
      localStorage.removeItem(persistKey);
      return null;
    }
    return parsed.state ?? null;
  } catch (error) {
    console.warn('Failed to restore cached queries:', error);
    localStorage.removeItem(persistKey);
    return null;
  }
};

const writePersistedCache = (persistKey: string, state: DehydratedState) => {
  if (typeof window === 'undefined') return;
  try {
    const payload: PersistedQueryCache = {
      version: QUERY_PERSIST_VERSION,
      updatedAt: Date.now(),
      state,
    };
    localStorage.setItem(persistKey, JSON.stringify(payload));
  } catch (error) {
    console.warn('Failed to persist cached queries:', error);
  }
};

const shouldPersistQuery = (
  query: Query<unknown, Error, unknown, readonly unknown[]>
) => {
  if (typeof query?.state?.data === 'undefined') return false;

  const [queryKey, paramsString] = query.queryKey;
  if (queryKey === BOOK_QUERIES_KEYS.GET_BOOKS) {
    if (typeof paramsString !== 'string') return false;
    try {
      const params = JSON.parse(paramsString) as { status?: string[] };
      const statuses = Array.isArray(params?.status) ? params.status : [];
      return statuses.length === 1 && statuses[0] === 'reading';
    } catch {
      return false;
    }
  }

  return (
    queryKey === BOOK_QUERIES_KEYS.GET_BOOK_BY_ID ||
    queryKey === STORAGE_QUERY_KEYS.GET_BOOK_URL
  );
};

export default function App() {
  const { isLogged, loadUser, loading, loggingData } = useStore();
  const [cacheReady, setCacheReady] = useState(false);
  const persistTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastUserIdRef = useRef<string | null>(null);
  const persistKey = useMemo(
    () => buildPersistKey(loggingData?._id),
    [loggingData?._id]
  );

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (loading) return;
    setCacheReady(false);

    const currentUserId = loggingData?._id ?? null;
    if (lastUserIdRef.current && lastUserIdRef.current !== currentUserId) {
      queryClient.clear();
    }
    lastUserIdRef.current = currentUserId;

    if (persistKey) {
      const cached = readPersistedCache(persistKey);
      if (cached) {
        hydrate(queryClient, cached);
      }
    }

    setCacheReady(true);
  }, [loading, loggingData?._id, persistKey]);

  useEffect(() => {
    if (!persistKey) return undefined;

    const persist = () => {
      const state = dehydrate(queryClient, {
        shouldDehydrateQuery: shouldPersistQuery,
      });

      if (state.queries.length === 0) {
        localStorage.removeItem(persistKey);
        return;
      }

      writePersistedCache(persistKey, state);
    };

    const schedulePersist = () => {
      if (persistTimeoutRef.current) return;
      persistTimeoutRef.current = setTimeout(() => {
        persistTimeoutRef.current = null;
        persist();
      }, QUERY_PERSIST_DEBOUNCE_MS);
    };

    const unsubscribe = queryClient.getQueryCache().subscribe(schedulePersist);

    return () => {
      unsubscribe();
      if (persistTimeoutRef.current) {
        clearTimeout(persistTimeoutRef.current);
        persistTimeoutRef.current = null;
      }
    };
  }, [persistKey]);

  if (loading || !cacheReady) {
    return (
      <ActionToastProvider>
        <OverlayLoader
          show
          withBackdrop
          title='Loading Libris…'
          subtitle='Preparing your dashboard and syncing your books.'
          className='h-screen fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6'
        />
      </ActionToastProvider>
    );
  }

  return (
    <ActionToastProvider>
      <QueryClientProvider client={queryClient}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <RouterProvider router={isLogged ? dashboardRouter : loginRouter} />
        </LocalizationProvider>
      </QueryClientProvider>
    </ActionToastProvider>
  );
}
